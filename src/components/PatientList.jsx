import React from 'react';
import '../styles/PatientList.css';

const PatientList = ({ patients, loading, onPatientSelect, onAddNewPatient }) => {
  if (loading) {
    return <div className="loading">Loading patients...</div>;
  }

  return (
    <div className="patient-list-container">
      <div className="list-header">
        <h2>My Patients</h2>
        <button onClick={onAddNewPatient} className="btn-primary">
          + Add New Patient
        </button>
      </div>

      {patients.length === 0 ? (
        <div className="empty-state">
          <p>No patients yet. Add your first patient to get started.</p>
        </div>
      ) : (
        <div className="patient-grid">
          {patients.map((patient) => (
            <div
              key={patient.id}
              className="patient-card"
              onClick={() => onPatientSelect(patient)}
            >
              <div className="patient-avatar">
                {patient.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="patient-card-info">
                <h3>{patient.fullName}</h3>
                <p className="patient-id">ID: {patient.id.substring(0, 8)}</p>
                <div className="patient-meta">
                  <span>{patient.gender}</span>
                  <span>•</span>
                  <span>{patient.dateOfBirth}</span>
                </div>
                <p className="patient-phone">{patient.phoneNumber}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientList;
