
import React, { useState, useRef, useEffect } from 'react';
import geminiAudioService from '../services/geminiAudioService';
import '../styles/SessionWizard.css';

const SessionWizard = ({ patient, onCancel, onComplete, isModal = false }) => {
    const [step, setStep] = useState(isModal ? 2 : 1);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [generatedNotes, setGeneratedNotes] = useState(null);
    const [editableNotes, setEditableNotes] = useState('');

    const mediaRecorderRef = useRef(null);
    const timerRef = useRef(null);
    const chunksRef = useRef([]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/mp3' }); // or audio/webm
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            // Start timer
            setRecordingTime(0);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Microphone access denied. Please enable permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    };

    const handleProcessAudio = async () => {
        if (!audioBlob) return;

        setStep(3); // Processing step
        setIsProcessing(true);

        try {
            const result = await geminiAudioService.processAudioSession(audioBlob);
            setGeneratedNotes(result);

            // Format initial editable text
            const formattedText = `Subjective: \n${result.soap.subjective} \n\nObjective: \n${result.soap.objective} \n\nAssessment: \n${result.soap.assessment} \n\nPlan: \n${result.soap.plan} `;
            setEditableNotes(formattedText);

            setStep(4); // Review step
        } catch (error) {
            console.error('Processing failed:', error);
            alert('Failed to process audio. Please try again.');
            setStep(2); // Go back to recording
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinish = () => {
        onComplete({
            rawText: editableNotes,
            extractedData: generatedNotes?.extractedData || {},
            summary: generatedNotes?.summary
        });
    };

    return (
        <div className="session-wizard-overlay">
            <div className="session-wizard-modal">
                <div className="wizard-header">
                    <h2>New Session - {patient.fullName}</h2>
                    <button onClick={onCancel} className="btn-close">✕</button>
                </div>

                <div className="wizard-content">
                    {/* Step 1: Patient Confirmation */}
                    {step === 1 && (
                        <div className="wizard-step">
                            <h3>Step 1: Confirm Details</h3>
                            <div className="patient-confirm-card">
                                <p><strong>Patient:</strong> {patient.fullName}</p>
                                <p><strong>ID:</strong> {patient.id}</p>
                                <p><strong>Visit Type:</strong> Follow-up (Default)</p>
                            </div>
                            <div className="wizard-actions">
                                <button onClick={() => setStep(2)} className="btn-primary">Start Recording</button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Recording */}
                    {step === 2 && (
                        <div className="wizard-step">
                            <h3>Step 2: Record Consultation</h3>
                            <div className="recording-interface">
                                <div className="timer-display">{formatTime(recordingTime)}</div>
                                <div className="wave-visualizer">
                                    {isRecording ? '🌊 Recording...' : 'Ready to Record'}
                                </div>

                                {!isRecording && !audioBlob && (
                                    <button onClick={startRecording} className="btn-record">🔴 Start Recording</button>
                                )}

                                {isRecording && (
                                    <button onClick={stopRecording} className="btn-stop">⏹ Stop Recording</button>
                                )}

                                {!isRecording && audioBlob && (
                                    <div className="recording-review">
                                        <p>✅ Recording saved ({formatTime(recordingTime)})</p>
                                        <div className="action-row">
                                            <button onClick={() => setAudioBlob(null)} className="btn-secondary">Retake</button>
                                            <button onClick={handleProcessAudio} className="btn-primary">Process with AI ✨</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Processing */}
                    {step === 3 && (
                        <div className="wizard-step processing-step">
                            <div className="spinner"></div>
                            <h3>Generating Medical Notes...</h3>
                            <p>Gemini AI is analyzing the consultation...</p>
                        </div>
                    )}

                    {/* Step 4: Review */}
                    {step === 4 && (
                        <div className="wizard-step">
                            <h3>Step 4: Review & Prescribe</h3>
                            <div className="notes-review">
                                <label>Generated SOAP Notes:</label>
                                <textarea
                                    value={editableNotes}
                                    onChange={(e) => setEditableNotes(e.target.value)}
                                    rows={10}
                                    className="notes-editor"
                                />
                            </div>
                            <div className="wizard-actions">
                                <button onClick={handleFinish} className="btn-primary">
                                    {isModal ? 'Insert Notes' : 'Generate Prescription →'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionWizard;
