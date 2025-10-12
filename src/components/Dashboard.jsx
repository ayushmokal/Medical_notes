import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientService } from '../services/patientService';
import { notesService } from '../services/notesService';
import PatientList from './PatientList';
import AddPatient from './AddPatient';
import NoteSession from './NoteSession';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [activeSession, setActiveSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [patientNotes, setPatientNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessions, setExpandedSessions] = useState({});

  useEffect(() => {
    loadPatients();
  }, [currentUser]);

  const loadPatients = async () => {
    if (currentUser) {
      const result = await patientService.getPatientsByDoctor(currentUser.uid);
      if (result.success) {
        setPatients(result.patients);
      }
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientData) => {
    const result = await patientService.addPatient(currentUser.uid, patientData);
    if (result.success) {
      await loadPatients();
      setShowAddPatient(false);
    }
    return result;
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setActiveSession(false);
    
    // Load patient's previous sessions
    setLoadingNotes(true);
    console.log('🔍 Loading notes for patient:', patient.id);
    const result = await notesService.getNotesByPatient(patient.id);
    console.log('📋 Notes result:', result);
    if (result.success) {
      setPatientNotes(result.notes);
      console.log('✅ Loaded', result.notes.length, 'notes');
    } else {
      setPatientNotes([]);
      console.error('❌ Failed to load notes:', result.error);
    }
    setLoadingNotes(false);
  };

  const handleStartSession = () => {
    setActiveSession(true);
  };

  const handleEndSession = async () => {
    setActiveSession(false);
    // Don't clear selectedPatient - stay on patient detail page
    // Reload the patient's notes to show the newly saved session
    if (selectedPatient) {
      console.log('🔄 Refreshing notes after session end for patient:', selectedPatient.id);
      setLoadingNotes(true);
      const result = await notesService.getNotesByPatient(selectedPatient.id);
      console.log('📋 Refreshed notes result:', result);
      if (result.success) {
        setPatientNotes(result.notes);
        console.log('✅ Refreshed with', result.notes.length, 'notes');
      }
      setLoadingNotes(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const toggleSessionExpanded = (noteId) => {
    setExpandedSessions(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  // Helper function to render data values (handles objects and strings)
  const renderDataValue = (value) => {
    if (!value) return null;
    
    // If it's an object, format it nicely
    if (typeof value === 'object' && !Array.isArray(value)) {
      return (
        <div className="nested-data">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="nested-item">
              <span className="nested-key">{key}:</span> {val}
            </div>
          ))}
        </div>
      );
    }
    
    // If it's a string or other primitive, return as is
    return value;
  };

  const downloadSessionAsPDF = async (note) => {
    try {
      // Import jsPDF dynamically
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(37, 99, 235);
      doc.text('Medical Session Report', 20, 20);

      // Patient Info
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Patient: ${selectedPatient.fullName}`, 20, 35);
      doc.text(`Patient ID: ${selectedPatient.id}`, 20, 42);
      
      // Session Info
      const sessionDate = note.createdAt 
        ? new Date(note.createdAt.seconds * 1000).toLocaleString()
        : note.sessionDate 
        ? new Date(note.sessionDate).toLocaleString()
        : 'Date not available';
      doc.text(`Session Date: ${sessionDate}`, 20, 49);
      doc.text(`Session ID: ${note.id}`, 20, 56);

      // Line separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 62, 190, 62);

      let yPos = 72;

      // Extracted Medical Data
      if (note.extractedData && Object.keys(note.extractedData).length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text('Extracted Medical Data', 20, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);

        const dataFields = [
          { key: 'vitals', label: 'Vitals' },
          { key: 'symptoms', label: 'Symptoms' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'medications', label: 'Medications' },
          { key: 'labResults', label: 'Lab Results' },
          { key: 'treatmentPlan', label: 'Treatment Plan' },
          { key: 'followUp', label: 'Follow-up' }
        ];

        for (const field of dataFields) {
          if (note.extractedData[field.key]) {
            doc.setFont(undefined, 'bold');
            doc.text(`${field.label}:`, 20, yPos);
            doc.setFont(undefined, 'normal');
            
            const text = note.extractedData[field.key];
            const lines = doc.splitTextToSize(text, 170);
            doc.text(lines, 20, yPos + 6);
            yPos += 6 + (lines.length * 5) + 5;

            // Check if we need a new page
            if (yPos > 270) {
              doc.addPage();
              yPos = 20;
            }
          }
        }
      }

      // Raw Text
      if (note.rawText) {
        if (yPos > 200) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 10;
        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235);
        doc.text('Raw Notes', 20, yPos);
        yPos += 10;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        const rawLines = doc.splitTextToSize(note.rawText, 170);
        doc.text(rawLines, 20, yPos);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('Medical Notes System - Confidential', 105, 285, { align: 'center' });
      }

      // Save PDF
      const fileName = `Session_${selectedPatient.fullName.replace(/\s+/g, '_')}_${note.id.slice(0, 8)}.pdf`;
      doc.save(fileName);

      alert('✅ PDF downloaded successfully!');
    } catch (error) {
      console.error('❌ PDF Generation Error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Filter notes based on search query
  const filteredNotes = patientNotes.filter(note => {
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Search in raw text
    if (note.rawText && note.rawText.toLowerCase().includes(searchLower)) return true;
    
    // Search in extracted data
    if (note.extractedData) {
      const dataString = JSON.stringify(note.extractedData).toLowerCase();
      if (dataString.includes(searchLower)) return true;
    }
    
    // Search in date
    const dateStr = note.createdAt 
      ? new Date(note.createdAt.seconds * 1000).toLocaleString().toLowerCase()
      : note.sessionDate 
      ? new Date(note.sessionDate).toLocaleString().toLowerCase()
      : '';
    if (dateStr.includes(searchLower)) return true;
    
    return false;
  });

  if (activeSession && selectedPatient) {
    return (
      <NoteSession
        patient={selectedPatient}
        doctorId={currentUser.uid}
        onEndSession={handleEndSession}
      />
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Medical Notes System</h1>
        <div className="header-actions">
          <span className="user-email">{currentUser?.email}</span>
          <button onClick={handleLogout} className="btn-secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {showAddPatient ? (
          <AddPatient
            onAddPatient={handleAddPatient}
            onCancel={() => setShowAddPatient(false)}
          />
        ) : selectedPatient ? (
          <div className="patient-detail-view">
            <button onClick={() => setSelectedPatient(null)} className="btn-back">
              ← Back to Patients
            </button>
            <div className="patient-details">
              <h2>{selectedPatient.fullName}</h2>
              <div className="patient-info-grid">
                <div className="info-item">
                  <label>Patient ID:</label>
                  <span>{selectedPatient.id}</span>
                </div>
                <div className="info-item">
                  <label>Gender:</label>
                  <span>{selectedPatient.gender}</span>
                </div>
                <div className="info-item">
                  <label>Date of Birth:</label>
                  <span>{selectedPatient.dateOfBirth}</span>
                </div>
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{selectedPatient.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{selectedPatient.email}</span>
                </div>
                <div className="info-item">
                  <label>Address:</label>
                  <span>{selectedPatient.address}</span>
                </div>
                <div className="info-item">
                  <label>Emergency Contact:</label>
                  <span>{selectedPatient.emergencyContact}</span>
                </div>
                <div className="info-item">
                  <label>Insurance:</label>
                  <span>{selectedPatient.insuranceInfo}</span>
                </div>
                <div className="info-item full-width">
                  <label>Medical History:</label>
                  <p>{selectedPatient.medicalHistory}</p>
                </div>
              </div>
              <button onClick={handleStartSession} className="btn-primary btn-large">
                Start New Session
              </button>

              {/* Previous Sessions Section */}
              <div className="previous-sessions">
                <h3>📋 Previous Sessions</h3>
                
                {/* Search Bar */}
                {patientNotes.length > 0 && (
                  <div className="search-bar">
                    <input
                      type="text"
                      placeholder="🔍 Search sessions... (diagnosis, medications, symptoms, dates, etc.)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="clear-search-btn"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}

                {/* Search Results Info */}
                {searchQuery && (
                  <div className="search-results-info">
                    Found {filteredNotes.length} session{filteredNotes.length !== 1 ? 's' : ''} matching "{searchQuery}"
                  </div>
                )}

                {loadingNotes ? (
                  <p className="loading-text">Loading sessions...</p>
                ) : patientNotes.length === 0 ? (
                  <p className="no-sessions">No previous sessions found. Start a new session to create the first medical note.</p>
                ) : filteredNotes.length === 0 ? (
                  <p className="no-sessions">No sessions match your search. Try different keywords.</p>
                ) : (
                  <div className="sessions-list">
                    {filteredNotes.map((note) => {
                      // Generate smart session name
                      const sessionDate = note.createdAt 
                        ? new Date(note.createdAt.seconds * 1000)
                        : note.sessionDate 
                        ? new Date(note.sessionDate)
                        : null;
                      
                      const dateStr = sessionDate 
                        ? sessionDate.toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'Date not available';
                      
                      // Extract diagnosis or chief complaint for session name
                      let sessionTitle = '';
                      if (note.extractedData?.diagnosis) {
                        sessionTitle = note.extractedData.diagnosis;
                      } else if (note.extractedData?.chiefComplaint) {
                        sessionTitle = note.extractedData.chiefComplaint;
                      } else if (note.extractedData?.symptoms && note.extractedData.symptoms.length > 0) {
                        sessionTitle = Array.isArray(note.extractedData.symptoms) 
                          ? note.extractedData.symptoms[0]
                          : note.extractedData.symptoms;
                      }
                      
                      // Truncate if too long
                      if (sessionTitle && sessionTitle.length > 50) {
                        sessionTitle = sessionTitle.substring(0, 50) + '...';
                      }
                      
                      const isExpanded = expandedSessions[note.id];
                      
                      return (
                        <div key={note.id} className="session-card">
                          <div 
                            className="session-header clickable"
                            onClick={() => toggleSessionExpanded(note.id)}
                          >
                            <div className="session-title-group">
                              <span className="expand-icon">
                                {isExpanded ? '🔽' : '▶️'}
                              </span>
                              <div className="session-title-content">
                                <h4>
                                  {sessionTitle || `Session #${note.id.slice(0, 8)}`}
                                </h4>
                                <span className="session-date">{dateStr}</span>
                              </div>
                            </div>
                            <div className="session-actions" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => downloadSessionAsPDF(note)}
                                className="btn-icon"
                                title="Download as PDF"
                              >
                                �
                              </button>
                            </div>
                          </div>
                          
                          {/* Collapsible Session Content */}
                          {isExpanded && (
                            <div className="session-content">
                              {/* Canvas Snapshot Preview */}
                              <div className="canvas-snapshot-section">
                                <h5>🖼️ Handwritten Notes</h5>
                                <div className="canvas-snapshot">
                                  {note.snapshotUrl ? (
                                    <img 
                                      src={note.snapshotUrl}
                                      alt="Handwritten notes"
                                      className="snapshot-image"
                                      onError={(e) => {
                                        console.error('Failed to load snapshot:', note.snapshotUrl);
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                  ) : (
                                    <img 
                                      src={`https://firebasestorage.googleapis.com/v0/b/medical-notes-system.appspot.com/o/notes%2F${encodeURIComponent(selectedPatient.id)}%2F${encodeURIComponent(note.id)}%2Fsnapshot.png?alt=media`}
                                      alt="Handwritten notes"
                                      className="snapshot-image"
                                      onError={(e) => {
                                        console.error('Failed to load snapshot from constructed URL');
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                  )}
                                  <div className="snapshot-error" style={{ display: 'none' }}>
                                    <p>📄 Canvas snapshot not available for this session</p>
                                  </div>
                                </div>
                              </div>

                              {/* Extracted Medical Data */}
                              {note.extractedData && Object.keys(note.extractedData).length > 0 && (
                                <div className="extracted-data">
                                  <h5>🔍 Extracted Medical Data</h5>
                                  <div className="data-grid">
                                    {note.extractedData.chiefComplaint && (
                                      <div className="data-section">
                                        <strong>Chief Complaint:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.chiefComplaint)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.vitals && (
                                      <div className="data-section">
                                        <strong>Vitals:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.vitals)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.symptoms && (
                                      <div className="data-section">
                                        <strong>Symptoms:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.symptoms)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.physicalExamination && (
                                      <div className="data-section">
                                        <strong>Physical Examination:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.physicalExamination)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.diagnosis && (
                                      <div className="data-section">
                                        <strong>Diagnosis:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.diagnosis)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.medications && (
                                      <div className="data-section">
                                        <strong>Medications:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.medications)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.labResults && (
                                      <div className="data-section">
                                        <strong>Lab Results:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.labResults)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.treatmentPlan && (
                                      <div className="data-section">
                                        <strong>Treatment Plan:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.treatmentPlan)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.followUp && (
                                      <div className="data-section">
                                        <strong>Follow-up:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.followUp)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.pastMedicalHistory && (
                                      <div className="data-section">
                                        <strong>Past Medical History:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.pastMedicalHistory)}</div>
                                      </div>
                                    )}
                                    {note.extractedData.additionalNotes && (
                                      <div className="data-section">
                                        <strong>Additional Notes:</strong>
                                        <div className="data-value">{renderDataValue(note.extractedData.additionalNotes)}</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Raw Text */}
                              {note.rawText && (
                                <div className="raw-text">
                                  <h5>📝 Raw Notes</h5>
                                  <p className="text-content">{note.rawText}</p>
                                </div>
                              )}

                              {/* No data message */}
                              {!note.rawText && (!note.extractedData || Object.keys(note.extractedData).length === 0) && (
                                <p className="no-data">No text data extracted for this session.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <PatientList
            patients={patients}
            loading={loading}
            onPatientSelect={handlePatientSelect}
            onAddNewPatient={() => setShowAddPatient(true)}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
