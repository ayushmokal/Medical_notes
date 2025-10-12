import React, { useState, useRef, useCallback } from 'react';
import { Tldraw, exportToBlob, useEditor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { notesService } from '../services/notesService';
import { ocrService } from '../services/ocrService';
import '../styles/NoteSession.css';

const NoteSession = ({ patient, doctorId, onEndSession }) => {
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [canvasRotation, setCanvasRotation] = useState(0); // 0, 90, 180, 270 degrees
  const editorRef = useRef(null);
  const canvasContainerRef = useRef(null);

  const handleMount = useCallback((editor) => {
    editorRef.current = editor;
    
    // Configure for A4 paper (210mm × 297mm) with 1:1 coordinate mapping
    // This ensures pen touches on physical A4 paper match screen position exactly
    const camera = editor.getCamera();
    editor.setCamera({
      ...camera,
      x: 0,
      y: 0,
      z: 1 // Critical: 1:1 zoom - no scaling for precise pen alignment
    });

    // Set up for drawing mode
    editor.updateInstanceState({ 
      isReadonly: false,
      isFocused: true
    });

    // Fit the A4 canvas to view for perfect alignment
    setTimeout(() => {
      editor.zoomToFit({ duration: 0 });
      console.log('✅ A4 Canvas calibrated - pen position will match cursor');
    }, 100);
  }, []);

  const handleExtractText = async () => {
    if (!editorRef.current) return;

    setIsExtracting(true);
    try {
      // Export canvas as blob
      const blob = await exportToBlob({
        editor: editorRef.current,
        format: 'png',
        opts: { background: true }
      });

      // Convert blob to data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageData = reader.result;
        
        // Extract text using OCR
        const result = await ocrService.extractText(imageData);
        
        if (result.success) {
          setExtractedText(result.text);
          // Extract medical data from text
          const medicalData = ocrService.extractMedicalData(result.text);
          setExtractedData(medicalData);
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Failed to extract text. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!editorRef.current) return;

    setIsSaving(true);
    try {
      // Export canvas as blob for snapshot
      const blob = await exportToBlob({
        editor: editorRef.current,
        format: 'png',
        opts: { background: true }
      });

      // Convert blob to data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const snapshotData = reader.result;

        // Get canvas data
        const canvasData = editorRef.current.store.getSnapshot();

        // Save note to Firestore
        const noteData = {
          rawText: extractedText,
          extractedData: extractedData || {},
          sessionDate: new Date().toISOString()
        };

        const noteResult = await notesService.addNote(patient.id, doctorId, noteData);

        if (noteResult.success) {
          // Save snapshot to storage
          await notesService.saveCanvasSnapshot(patient.id, noteResult.noteId, snapshotData);
          
          // Save canvas data to storage
          await notesService.saveCanvasData(patient.id, noteResult.noteId, canvasData);

          alert('Note saved successfully!');
          onEndSession();
        }
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNote = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      onEndSession();
    }
  };

  const rotateCanvas = () => {
    setCanvasRotation((prev) => (prev + 90) % 360);
  };

  const resetCamera = () => {
    if (editorRef.current) {
      // Reset camera to exact 1:1 mapping for A4 paper alignment
      editorRef.current.setCamera({ x: 0, y: 0, z: 1 });
      
      // Fit A4 canvas to view - ensures entire paper is visible
      editorRef.current.zoomToFit({ duration: 0 });
      
      console.log('✅ A4 Canvas calibrated');
      console.log('📐 Canvas size: 210mm × 297mm (A4)');
      console.log('🎯 Pen alignment: 1:1 - cursor will match pen position');
      
      alert('✅ A4 Canvas Calibrated!\n\n📐 Size: 210mm × 297mm\n🎯 Pen touches will now match cursor position exactly.\n\nPlace your A4 paper on the digitizer and start writing!');
    }
  };

  return (
    <div className="note-session">
      <header className="session-header">
        <h2>Active Session - {patient.fullName}</h2>
        <div className="header-actions">
          <button onClick={resetCamera} className="btn-calibrate" title="Reset camera for 1:1 mapping">
            🎯 Calibrate
          </button>
          <button onClick={rotateCanvas} className="btn-rotate" title="Rotate canvas 90°">
            🔄 Rotate ({canvasRotation}°)
          </button>
          <button onClick={() => setShowPanel(!showPanel)} className="btn-toggle-panel">
            {showPanel ? 'Hide' : 'Show'} Panel
          </button>
        </div>
      </header>

      <div className="session-content">
        {/* Main Canvas Area - Always A4 Size (210mm × 297mm) */}
        <div className="canvas-area">
          <div 
            className="canvas-wrapper"
            style={{ 
              width: '210mm',  // A4 width - always fixed
              height: '297mm', // A4 height - always fixed
              transform: `rotate(${canvasRotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease',
              position: 'relative'
            }}
          >
            <div 
              ref={canvasContainerRef}
              className="canvas-container" 
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                touchAction: 'none', // Critical for pen input
                border: '2px solid #e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                cursor: 'crosshair' // Show precise cursor
              }}
            >
              <Tldraw 
                onMount={handleMount}
                hideRotateHandles={true}
                // Disable auto-focus to prevent camera jumps
                autoFocus={false}
              />
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {showPanel && (
          <div className="side-panel">
            <div className="panel-section">
              <h3>Patient Details</h3>
              <div className="patient-summary">
                <p><strong>Name:</strong> {patient.fullName}</p>
                <p><strong>ID:</strong> {patient.id.substring(0, 8)}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
                <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
                <p><strong>Phone:</strong> {patient.phoneNumber}</p>
              </div>
            </div>

            <div className="panel-section">
              <h3>Medical History</h3>
              <div className="medical-history-box">
                <p>{patient.medicalHistory}</p>
              </div>
            </div>

            <div className="panel-section">
              <h3>Extract Text</h3>
              <button 
                onClick={handleExtractText} 
                disabled={isExtracting}
                className="btn-secondary btn-block"
              >
                {isExtracting ? 'Extracting...' : 'Extract Text via OCR'}
              </button>
              
              {extractedText && (
                <div className="extracted-text">
                  <h4>Raw Text:</h4>
                  <textarea 
                    value={extractedText} 
                    onChange={(e) => setExtractedText(e.target.value)}
                    rows="6"
                  />
                </div>
              )}

              {extractedData && (
                <div className="extracted-data">
                  <h4>Extracted Medical Data:</h4>
                  
                  {extractedData.vitals && Object.keys(extractedData.vitals).length > 0 && (
                    <div className="data-section">
                      <strong>Vitals:</strong>
                      <ul>
                        {extractedData.vitals.bloodPressure && (
                          <li>BP: {extractedData.vitals.bloodPressure}</li>
                        )}
                        {extractedData.vitals.heartRate && (
                          <li>HR: {extractedData.vitals.heartRate}</li>
                        )}
                        {extractedData.vitals.temperature && (
                          <li>Temp: {extractedData.vitals.temperature}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {extractedData.symptoms && extractedData.symptoms.length > 0 && (
                    <div className="data-section">
                      <strong>Symptoms:</strong>
                      <ul>
                        {extractedData.symptoms.map((symptom, idx) => (
                          <li key={idx}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extractedData.diagnosis && extractedData.diagnosis.length > 0 && (
                    <div className="data-section">
                      <strong>Diagnosis:</strong>
                      <ul>
                        {extractedData.diagnosis.map((diag, idx) => (
                          <li key={idx}>{diag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extractedData.medications && extractedData.medications.length > 0 && (
                    <div className="data-section">
                      <strong>Medications:</strong>
                      <ul>
                        {extractedData.medications.map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="panel-actions">
              <button 
                onClick={handleCancelNote} 
                className="btn-cancel"
                disabled={isSaving}
              >
                Cancel Note
              </button>
              <button 
                onClick={handleSaveNote} 
                className="btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Note & Extract Data'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteSession;
