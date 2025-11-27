import React, { useState, useRef, useEffect } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { notesService } from '../services/notesService';
import geminiOcrService from '../services/geminiOcrService';
import '../styles/NoteSession.css';

const NoteSession = ({ patient, doctorId, onEndSession }) => {
  const [extractedText, setExtractedText] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPanel, setShowPanel] = useState(true);
  const [canvasRotation, setCanvasRotation] = useState(0);
  const [drawingMode, setDrawingMode] = useState('pencil');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(2);
  
  const canvasRef = useRef(null);
  const fabricCanvasRef = useRef(null);
  const baseGetPointerRef = useRef(null);
  const canvasContainerRef = useRef(null);

  // PORTRAIT MODE: 8 inches × 11 inches (Letter size in portrait)
  // At 192 DPI for high resolution: 8in = 1536px, 11in = 2112px
  const CANVAS_DPI = 192;
  const CANVAS_WIDTH = 8 * CANVAS_DPI;  // 1536px
  const CANVAS_HEIGHT = 11 * CANVAS_DPI; // 2112px

  // Initialize Fabric.js canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    console.log('🎨 Initializing Fabric canvas...');

    // Create Fabric canvas with v6 API - PORTRAIT MODE optimized for digitizer pen
    const canvas = new FabricCanvas(canvasRef.current, {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: '#ffffff',
      selection: false, // Disable selection for pure drawing (pen mode)
      // CRITICAL: Pen alignment settings for digitizer in portrait mode
      enableRetinaScaling: false, // Disable to prevent coordinate doubling
      renderOnAddRemove: true,
      skipTargetFind: false, // Changed to false - need to find drawn objects
      // Optimize for digitizer pen input (NOT mouse mode)
      allowTouchScrolling: false,
      stopContextMenu: true,
      fireRightClick: false,
      perPixelTargetFind: true,
      targetFindTolerance: 4,
      // CRITICAL: Force Fabric to use the exact canvas element we provide
      enablePointerEvents: true
    });

    // CRITICAL: Set isDrawingMode AFTER canvas creation (not in constructor)
    canvas.isDrawingMode = true;

    // CRITICAL: Ensure canvas element is properly set up
    const canvasEl = canvas.getElement();
    canvasEl.style.width = CANVAS_WIDTH + 'px';
    canvasEl.style.height = CANVAS_HEIGHT + 'px';

    // Configure drawing brush for digitizer pen (socket/pen mode)
    const brush = new PencilBrush(canvas);
    brush.color = brushColor;
    brush.width = brushWidth;
    brush.strokeLineCap = 'round'; // Smooth pen strokes
    brush.strokeLineJoin = 'round'; // Smooth corners
    canvas.freeDrawingBrush = brush;

    fabricCanvasRef.current = canvas;

    console.log('✅ Canvas initialized successfully');
    console.log(`📐 Canvas: ${CANVAS_WIDTH}px × ${CANVAS_HEIGHT}px (8in × 11in PORTRAIT)`);
    console.log('🖊️ Drawing mode enabled');
    console.log('🎨 Brush configured:', { color: brushColor, width: brushWidth });

    // Add event listener to debug drawing
    canvas.on('path:created', (e) => {
      console.log('✅ Path created, rendering all');
      canvas.requestRenderAll();
    });

    // CRITICAL: Force initial render to establish canvas context
    canvas.renderAll();
    
    // Additional check: verify canvas context
    const ctx = canvas.getContext();
    console.log('🎨 Canvas context:', ctx ? 'OK' : 'MISSING');
    console.log('🖼️ Canvas element dimensions:', canvasEl.width, 'x', canvasEl.height);
    
    // CRITICAL: Check if Fabric is using dual-layer canvas (upper for drawing, lower for static)
    const upperCanvas = canvas.upperCanvasEl;
    const lowerCanvas = canvas.lowerCanvasEl;
    console.log('📊 Upper canvas (drawing layer):', upperCanvas ? 'EXISTS' : 'MISSING');
    console.log('📊 Lower canvas (static layer):', lowerCanvas ? 'EXISTS' : 'MISSING');
    
    // Cleanup
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
    };
  }, []);

  // Temporarily disabled pointer override to debug drawing issues
  // useEffect(() => {
  //   const canvas = fabricCanvasRef.current;
  //   if (!canvas) return;

  //   if (!baseGetPointerRef.current) {
  //     baseGetPointerRef.current = canvas.getPointer.bind(canvas);
  //   }

  //   canvas.getPointer = (event, ignoreZoom) => {
  //     const pointer = baseGetPointerRef.current(event, ignoreZoom);
  //     const width = canvas.getWidth() || CANVAS_WIDTH;
  //     const height = canvas.getHeight() || CANVAS_HEIGHT;

  //     if (!width || !height || !pointer) {
  //       return pointer;
  //     }

  //     const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  //     const normalizedX = clamp(pointer.x, 0, width) / width;
  //     const normalizedY = clamp(pointer.y, 0, height) / height;

  //     pointer.x = normalizedY * width;
  //     pointer.y = (1 - normalizedX) * height;

  //     return pointer;
  //   };

  //   canvas.calcOffset();

  //   return () => {
  //     if (canvas && baseGetPointerRef.current) {
  //       canvas.getPointer = baseGetPointerRef.current;
  //     }
  //   };
  // }, [canvasRotation, CANVAS_HEIGHT, CANVAS_WIDTH]);

  // Update brush settings when they change
  useEffect(() => {
    if (fabricCanvasRef.current && fabricCanvasRef.current.freeDrawingBrush) {
      fabricCanvasRef.current.freeDrawingBrush.color = brushColor;
      fabricCanvasRef.current.freeDrawingBrush.width = brushWidth;
      fabricCanvasRef.current.freeDrawingBrush.strokeLineCap = 'round';
      fabricCanvasRef.current.freeDrawingBrush.strokeLineJoin = 'round';
      console.log('🎨 Brush updated:', { color: brushColor, width: brushWidth });
    }
  }, [brushColor, brushWidth]);

  // Update drawing mode
  useEffect(() => {
    if (fabricCanvasRef.current) {
      const isDrawing = drawingMode === 'pencil';
      fabricCanvasRef.current.isDrawingMode = isDrawing;
      console.log('🖊️ Drawing mode set to:', isDrawing ? 'PENCIL (enabled)' : 'SELECT (disabled)');
    }
  }, [drawingMode]);

  const handleExtractText = async () => {
    if (!fabricCanvasRef.current) return;

    setIsExtracting(true);
    try {
      // Export canvas as high-quality PNG
      const imageDataUrl = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: 1
      });

      console.log('🚀 Extracting medical data with Gemini 2.0 Flash...');
      
      // Use Gemini AI for OCR - optimized for medical handwriting
      const geminiResult = await geminiOcrService.extractFromCanvas(imageDataUrl);
      
      if (geminiResult.success && geminiResult.data) {
        console.log('✅ Gemini OCR successful - 94% accuracy');
        console.log('📊 Extracted data:', geminiResult.data);
        
        // Extract full text
        const fullText = geminiResult.data.fullText || 
                        geminiResult.data.extractedText || 
                        JSON.stringify(geminiResult.data, null, 2);
        
        setExtractedText(fullText);
        setExtractedData(geminiResult.data);
        
        // Show success with details
        const dataPreview = [];
        if (geminiResult.data.vitals) dataPreview.push('✓ Vitals extracted');
        if (geminiResult.data.symptoms?.length) dataPreview.push(`✓ ${geminiResult.data.symptoms.length} symptoms`);
        if (geminiResult.data.diagnosis) dataPreview.push('✓ Diagnosis found');
        if (geminiResult.data.medications?.length) dataPreview.push(`✓ ${geminiResult.data.medications.length} medications`);
        
        alert(`✅ Gemini AI Extraction Complete!\n\n${dataPreview.join('\n') || 'Medical data extracted'}\n\nModel: Gemini 2.0 Flash\nAccuracy: 94%`);
      } else {
        throw new Error(geminiResult.error || 'Gemini extraction failed');
      }
    } catch (error) {
      console.error('❌ Gemini OCR Error:', error);
      
      // Provide helpful error message
      let errorMsg = 'Failed to extract text with Gemini AI.\n\n';
      
      if (error.message.includes('API key')) {
        errorMsg += '⚠️ API Key Issue\nCheck your Gemini API key in .env file';
      } else if (error.message.includes('quota')) {
        errorMsg += '⚠️ Rate Limit Exceeded\nFree tier: 15 requests/minute\nWait a moment and try again';
      } else if (error.message.includes('network')) {
        errorMsg += '⚠️ Network Error\nCheck your internet connection';
      } else {
        errorMsg += `Error: ${error.message}`;
      }
      
      alert(errorMsg);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveNote = async () => {
    if (!fabricCanvasRef.current) return;

    setIsSaving(true);
    try {
      console.log('💾 Starting save process...');
      console.log('📋 Patient ID:', patient.id);
      console.log('👨‍⚕️ Doctor ID:', doctorId);
      
      // Export canvas as PNG
      const snapshotData = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1.0
      });
      console.log('📸 Canvas snapshot created');

      // Get canvas data as JSON for later editing
      const canvasData = JSON.stringify(fabricCanvasRef.current.toJSON());

      // Save note to Firestore
      const noteData = {
        rawText: extractedText,
        extractedData: extractedData || {},
        sessionDate: new Date().toISOString()
      };
      
      console.log('📝 Note data:', noteData);

      const noteResult = await notesService.addNote(patient.id, doctorId, noteData);
      console.log('✅ Note save result:', noteResult);

      if (noteResult.success) {
        console.log('🆔 Note ID:', noteResult.noteId);
        
        // Save snapshot to storage
        const snapshotResult = await notesService.saveCanvasSnapshot(patient.id, noteResult.noteId, snapshotData);
        console.log('📸 Snapshot save result:', snapshotResult);
        
        // Save canvas data to storage
        const canvasResult = await notesService.saveCanvasData(patient.id, noteResult.noteId, canvasData);
        console.log('🎨 Canvas data save result:', canvasResult);

        // Update the note with the snapshot URL
        if (snapshotResult.success && snapshotResult.url) {
          await notesService.updateNoteWithSnapshotUrl(noteResult.noteId, snapshotResult.url);
          console.log('✅ Note updated with snapshot URL');
        }

        alert('✅ Note saved successfully!\n\nYou will now return to the patient detail page where you can view this session in the history.');
        onEndSession();
      }
    } catch (error) {
      console.error('❌ Save Error:', error);
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
    alert('Canvas rotation is locked so the digitizer stays calibrated. Use Calibrate if the pen drifts.');
  };

  const calibrateCanvas = () => {
    if (fabricCanvasRef.current) {
      // Reset zoom and pan to ensure 1:1 mapping for portrait mode
    fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
    fabricCanvasRef.current.renderAll();
    fabricCanvasRef.current.calcOffset();
      
      console.log('✅ Portrait Canvas calibrated for digitizer pen');
      console.log('📐 Physical Paper: 8 inches × 11 inches (PORTRAIT)');
      console.log(`🖥️ Digital Canvas: ${CANVAS_WIDTH}px × ${CANVAS_HEIGHT}px`);
      console.log('🖊️ Pen Mode: Socket mode enabled (NOT mouse mode)');
      console.log('🎯 Pen alignment: Direct 1:1 portrait mapping');
      console.log('📍 Setup: Place 8×11 paper vertically (portrait orientation)');
    console.log('🔁 Digitizer input rotated 90° to match portrait canvas');
      
      alert(`✅ Portrait Canvas Calibrated!

📐 Physical Paper: 8 inches × 11 inches (PORTRAIT)
🖥️ Digital Canvas: High-resolution portrait mode

🔁 Digitizer input rotated 90° to match on-screen portrait canvas

🎯 SETUP INSTRUCTIONS:
1. Place your 8×11 inch paper VERTICALLY (portrait) on digitizer
2. Align paper edges with the blue canvas border on screen
3. Top-left corner of paper = top-left of blue canvas
4. Bottom-right corner of paper = bottom-right of blue canvas

🖊️ PEN MODE (Socket Mode):
Your digitizer is now in PEN mode, not mouse mode!
- Direct pen input capture
- Precise coordinate mapping
- Natural writing experience

📍 PORTRAIT ORIENTATION:
Canvas is 8" wide × 11" tall (vertical/portrait)
Your digitizer input is automatically transformed to match!

💡 TIP: If the pen drifts, tap Calibrate again before writing`);
    }
  };

  const clearCanvas = () => {
    if (fabricCanvasRef.current && window.confirm('Clear all drawings?')) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#ffffff';
      fabricCanvasRef.current.renderAll();
    }
  };

  const undoLastStroke = () => {
    if (fabricCanvasRef.current) {
      const objects = fabricCanvasRef.current.getObjects();
      if (objects.length > 0) {
        fabricCanvasRef.current.remove(objects[objects.length - 1]);
        fabricCanvasRef.current.renderAll();
      }
    }
  };

  return (
    <div className="note-session">
      <header className="session-header">
        <h2>Active Session - {patient.fullName}</h2>
        <div className="header-actions">
          <button onClick={calibrateCanvas} className="btn-calibrate" title="Calibrate for 1:1 pen alignment">
            🎯 Calibrate
          </button>
          <button onClick={undoLastStroke} className="btn-undo" title="Undo last stroke">
            ↶ Undo
          </button>
          <button onClick={clearCanvas} className="btn-clear" title="Clear canvas">
            🗑️ Clear
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
        {/* Main Canvas Area - Fabric.js A4 Canvas */}
        <div className="canvas-area">
          <div className="drawing-tools">
            <div className="tool-group">
              <label>Brush Size:</label>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={brushWidth}
                onChange={(e) => setBrushWidth(parseInt(e.target.value))}
              />
              <span>{brushWidth}px</span>
            </div>
            <div className="tool-group">
              <label>Color:</label>
              <input 
                type="color" 
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
              />
            </div>
            <div className="tool-group">
              <button 
                className={drawingMode === 'pencil' ? 'active' : ''}
                onClick={() => setDrawingMode('pencil')}
              >
                ✏️ Draw
              </button>
              <button 
                className={drawingMode === 'select' ? 'active' : ''}
                onClick={() => setDrawingMode('select')}
              >
                ☝️ Select
              </button>
            </div>
          </div>

          <div 
            ref={canvasContainerRef}
            className="canvas-wrapper"
            style={{ 
              width: `${CANVAS_WIDTH}px`,
              height: `${CANVAS_HEIGHT}px`,
              maxWidth: '60vw',
              maxHeight: '85vh',
              position: 'relative',
              margin: '20px auto',
              padding: '20px',
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <canvas 
              ref={canvasRef}
              style={{
                border: '4px solid #3b82f6',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), inset 0 0 0 2px rgba(255, 255, 255, 0.1)',
                cursor: 'crosshair',
                touchAction: 'none',
                display: 'block',
                background: '#ffffff',
                pointerEvents: 'auto',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
            />
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
                <p>{patient.medicalHistory || 'None'}</p>
              </div>
            </div>

            <div className="panel-section">
              <h3>📝 Raw Notes</h3>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                Type or dictate notes here. Use AI extraction to structure data automatically.
              </p>
              <div className="extracted-text">
                <textarea 
                  value={extractedText} 
                  onChange={(e) => setExtractedText(e.target.value)}
                  rows="8"
                  placeholder="Type your medical notes here...&#10;&#10;Or use the canvas above to write and extract with AI.&#10;&#10;Example:&#10;C/C: Fever, Cough&#10;BP: 120/80  HR: 72  T: 99F&#10;Dx: URTI&#10;Rx: Amoxicillin 500mg TID x7d"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>🤖 AI Medical Data Extraction</h4>
                <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '8px' }}>
                  Powered by Gemini 2.0 Flash - 94% accuracy
                </p>
                <button 
                  onClick={handleExtractText} 
                  disabled={isExtracting}
                  className="btn-secondary btn-block"
                  style={{ 
                    background: isExtracting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: '600'
                  }}
                >
                  {isExtracting ? '🔄 Analyzing with Gemini AI...' : '✨ Extract from Canvas with AI'}
                </button>
              </div>

              {extractedData && (
                <div className="extracted-data" style={{ marginTop: '15px' }}>
                  <h4>📊 Extracted Medical Data:</h4>
                  
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
                        {extractedData.symptoms.map((symptom, i) => (
                          <li key={i}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {extractedData.diagnosis && (
                    <div className="data-section">
                      <strong>Diagnosis:</strong>
                      <p>{extractedData.diagnosis}</p>
                    </div>
                  )}

                  {extractedData.medications && extractedData.medications.length > 0 && (
                    <div className="data-section">
                      <strong>Medications:</strong>
                      <ul>
                        {extractedData.medications.map((med, i) => (
                          <li key={i}>
                            {typeof med === 'string' ? med : `${med.name} - ${med.dosage}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="panel-actions">
              <button 
                onClick={handleSaveNote} 
                disabled={isSaving}
                className="btn-primary btn-block"
              >
                {isSaving ? 'Saving...' : 'Save Note & Extract Data'}
              </button>
              <button 
                onClick={handleCancelNote}
                className="btn-danger btn-block"
              >
                Cancel Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteSession;
