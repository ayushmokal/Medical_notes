import React, { useState } from 'react';
import '../styles/AddPatient.css';

const AddPatient = ({ onAddPatient, onCancel }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    password: '',
    address: '',
    emergencyContact: '',
    insuranceInfo: '',
    medicalHistory: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await onAddPatient(formData);
      if (!result.success) {
        setError(result.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patient-container">
      <div className="add-patient-header">
        <h2>Add New Patient</h2>
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Gender *</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date of Birth *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="patient@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Set initial password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Emergency Contact *</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleChange}
              required
              placeholder="Name: +1 (555) 987-6543"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="123 Main St, City, State, ZIP"
          />
        </div>

        <div className="form-group">
          <label>Insurance Information *</label>
          <input
            type="text"
            name="insuranceInfo"
            value={formData.insuranceInfo}
            onChange={handleChange}
            required
            placeholder="Provider: Policy Number"
          />
        </div>

        <div className="form-group">
          <label>Medical History *</label>
          <textarea
            name="medicalHistory"
            value={formData.medicalHistory}
            onChange={handleChange}
            required
            rows="4"
            placeholder="List any existing conditions, allergies, medications, past surgeries, etc."
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary btn-large">
          {loading ? 'Adding Patient...' : 'Add Patient'}
        </button>
      </form>
    </div>
  );
};

export default AddPatient;
