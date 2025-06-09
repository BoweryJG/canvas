import React, { useState } from 'react';
import { DoctorAutocomplete, type Doctor } from './DoctorAutocomplete';
import { smartVerifyDoctor } from '../lib/smartDoctorVerification';

interface ManualDoctorFormProps {
  onDoctorVerified: (doctorData: {
    doctorName: string;
    specialty: string;
    location: string;
    website?: string;
    npi?: string;
    practice?: string;
    confidence?: number;
  }) => void;
  onAutocompleteSelect?: (doctor: Doctor) => void;
}

export const ManualDoctorForm: React.FC<ManualDoctorFormProps> = ({ 
  onDoctorVerified,
  onAutocompleteSelect
}) => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [location, setLocation] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAutocomplete, setShowAutocomplete] = useState(true);
  const [verificationMessage, setVerificationMessage] = useState('');

  // Handle autocomplete selection
  const handleAutocompleteSelect = (doctor: Doctor) => {
    // For NPI selections, ALWAYS use the parent handler to skip verification
    if (onAutocompleteSelect) {
      onAutocompleteSelect(doctor);
      return; // Exit early - don't do anything else
    }
    
    // Only fill manual fields if no parent handler (fallback mode)
    setDoctorName(`${doctor.firstName} ${doctor.lastName}`);
    setSpecialty(doctor.specialty);
    setLocation(`${doctor.city}, ${doctor.state}`);
    
    // Hide autocomplete after selection
    setShowAutocomplete(false);
    
    // DON'T auto-verify NPI selections - they're already verified!
    console.log('✅ NPI doctor selected, skipping verification');
  };

  // Check if form is complete
  const isFormComplete = () => {
    return doctorName.trim() && specialty.trim() && location.trim();
  };

  // Handle verification - ALWAYS verify, regardless of input method
  const handleVerification = async (npi?: string) => {
    if (!isFormComplete()) return;
    
    setIsVerifying(true);
    setVerificationMessage('🔍 Searching for doctor\'s practice website...');
    
    try {
      // Use smart verification to find practice website
      const result = await smartVerifyDoctor(
        doctorName,
        location,
        specialty
      );
      
      console.log('🎯 Verification result:', result);
      
      // ALWAYS trigger verification, regardless of confidence
      // Pass all the data we found to the parent for verification dialog
      onDoctorVerified({
        doctorName,
        specialty,
        location,
        website: result.verifiedWebsite,
        practice: result.practiceName,
        confidence: result.confidence || 0,
        npi: npi
      });
      
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationMessage('❌ Could not search for practice. Proceeding with manual data...');
      
      // Even on error, still verify with what we have
      setTimeout(() => {
        onDoctorVerified({
          doctorName,
          specialty,
          location,
          confidence: 0,
          npi: npi
        });
      }, 1000);
    }
  };

  return (
    <div className="manual-doctor-form">
      {/* Autocomplete as an overlay surprise */}
      {showAutocomplete && (
        <div className="autocomplete-wrapper">
          <DoctorAutocomplete
            onSelect={handleAutocompleteSelect}
            placeholder="Start typing doctor name for quick search..."
            inputClassName="canvas-input"
            dropdownClassName="canvas-dropdown"
          />
          <button 
            className="skip-autocomplete"
            onClick={() => setShowAutocomplete(false)}
          >
            or enter manually →
          </button>
        </div>
      )}

      {/* Manual entry form */}
      {!showAutocomplete && (
        <div className="manual-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. John Smith"
                disabled={isVerifying}
              />
            </div>
            
            <div className="form-field">
              <label>Specialty</label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g., Oral Surgery"
                disabled={isVerifying}
              />
            </div>
            
            <div className="form-field">
              <label>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State"
                disabled={isVerifying}
              />
            </div>
          </div>

          <button
            className={`verify-button ${isVerifying ? 'verifying' : ''}`}
            onClick={() => handleVerification()}
            disabled={!isFormComplete() || isVerifying}
          >
            {isVerifying ? 'VERIFYING...' : 'FIND DOCTOR →'}
          </button>

          {verificationMessage && (
            <div className="verification-message">
              {verificationMessage}
            </div>
          )}

          <button 
            className="back-to-search"
            onClick={() => setShowAutocomplete(true)}
          >
            ← Back to quick search
          </button>
        </div>
      )}

      <style>{`
        .manual-doctor-form {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .autocomplete-wrapper {
          position: relative;
        }

        /* Use canvas-input styles from App.css */
        
        /* Mobile-specific fixes */
        @media (max-width: 768px) {
          .autocomplete-wrapper {
            padding: 0 10px;
          }
          
          .canvas-input {
            font-size: 16px !important; /* Prevent zoom on iOS */
          }
        }

        .skip-autocomplete {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 0.9rem;
          transition: color 0.3s ease;
        }

        .skip-autocomplete:hover {
          color: #00ffc6;
        }

        .manual-form {
          animation: fadeIn 0.3s ease;
        }

        .form-grid {
          display: grid;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-field label {
          display: block;
          color: #00ffc6;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
        }

        .form-field input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(0, 255, 198, 0.3);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-field input:focus {
          outline: none;
          border-color: #00ffc6;
          background: rgba(0, 255, 198, 0.1);
        }

        .form-field input:disabled {
          opacity: 0.6;
        }

        .verify-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%);
          color: #000;
          font-weight: 700;
          font-size: 1.125rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
        }

        .verify-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 198, 0.4);
        }

        .verify-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .verify-button.verifying {
          animation: pulse 2s ease-in-out infinite;
        }

        .verification-message {
          margin-top: 1rem;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          text-align: center;
          color: #fff;
          font-size: 0.95rem;
          animation: fadeIn 0.3s ease;
        }

        .back-to-search {
          width: 100%;
          margin-top: 1rem;
          padding: 8px;
          background: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.3s ease;
        }

        .back-to-search:hover {
          border-color: rgba(0, 255, 198, 0.5);
          color: #00ffc6;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};