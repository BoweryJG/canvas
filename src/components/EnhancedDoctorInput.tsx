import React, { useState, useEffect } from 'react';
import { DoctorAutocomplete, type Doctor } from './DoctorAutocomplete';
import DoctorVerification from './DoctorVerification';
import { smartVerifyDoctor } from '../lib/smartDoctorVerification';

interface EnhancedDoctorInputProps {
  onDoctorConfirmed: (doctorData: {
    name: string;
    specialty: string;
    location: string;
    website?: string;
    npi?: string;
    practice?: string;
    phone?: string;
    address?: string;
  }) => void;
  productName?: string;
}

export const EnhancedDoctorInput: React.FC<EnhancedDoctorInputProps> = ({ 
  onDoctorConfirmed
}) => {
  const [manualEntry, setManualEntry] = useState({
    doctorName: '',
    specialty: '',
    location: ''
  });
  
  const [showVerification, setShowVerification] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    name?: string;
    specialty?: string;
    location?: string;
    website?: string;
    practice?: string;
    confidence?: number;
    npi?: string;
    address?: string;
    phone?: string;
    sources?: Array<{ name: string; url: string; type: string }>;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFromAutocomplete, setSelectedFromAutocomplete] = useState(false);

  // Handle autocomplete selection (the "surprise" enhancement)
  const handleAutocompleteSelect = (doctor: Doctor) => {
    // Populate manual fields
    setManualEntry({
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      specialty: doctor.specialty,
      location: `${doctor.city}, ${doctor.state}`
    });
    
    // Mark as selected from autocomplete
    setSelectedFromAutocomplete(true);
    
    // Store NPI and other data
    setVerificationData({
      ...doctor,
      name: `${doctor.firstName} ${doctor.lastName}`,
      location: `${doctor.city}, ${doctor.state}`,
      npi: doctor.npi,
      practice: doctor.organizationName,
      address: doctor.fullAddress,
      phone: doctor.phone
    });
  };

  // Check if manual entry is complete
  const isManualEntryComplete = useCallback(() => {
    return manualEntry.doctorName.trim() && 
           manualEntry.specialty.trim() && 
           manualEntry.location.trim();
  }, [manualEntry]);

  // Handle manual search and verification
  const handleManualSearch = useCallback(async () => {
    if (!isManualEntryComplete()) return;
    
    setIsSearching(true);
    
    try {
      // Use smart verification to find practice website via Brave search
      const verificationResult = await smartVerifyDoctor(
        manualEntry.doctorName,
        manualEntry.location,
        manualEntry.specialty,
        undefined, // practice name - we'll find it
        undefined  // userId
      );
      
      console.log('🔍 Manual search verification result:', verificationResult);
      
      // Only show verification if we found a high-confidence practice website
      if (verificationResult.confidence > 70 && verificationResult.verifiedWebsite) {
        setVerificationData({
          name: manualEntry.doctorName,
          specialty: manualEntry.specialty,
          location: manualEntry.location,
          website: verificationResult.verifiedWebsite,
          practice: verificationResult.practiceName,
          confidence: verificationResult.confidence,
          sources: verificationResult.sources.map(s => ({ name: s.type, url: s.url, type: s.type }))
        });
        setShowVerification(true);
      } else {
        // If no high-confidence website found, proceed without verification
        // but still use what we found
        onDoctorConfirmed({
          name: manualEntry.doctorName,
          specialty: manualEntry.specialty,
          location: manualEntry.location,
          website: verificationResult.verifiedWebsite,
          practice: verificationResult.practiceName
        });
      }
    } catch (error) {
      console.error('Error in manual doctor search:', error);
      // Proceed with just the manual data
      onDoctorConfirmed({
        name: manualEntry.doctorName,
        specialty: manualEntry.specialty,
        location: manualEntry.location
      });
    } finally {
      setIsSearching(false);
    }
  }, [manualEntry.doctorName, manualEntry.location, manualEntry.specialty, isManualEntryComplete, onDoctorConfirmed]);

  // Handle verification confirmation
  const handleVerificationConfirm = (verifiedProfile: {
    name: string;
    location?: string;
    specialty?: string;
    website?: string;
    practice?: string;
    confidence: number;
    npi?: string;
    additionalInfo?: string;
    sources?: Array<{ name: string; url: string; type: string }>;
  }) => {
    setShowVerification(false);
    onDoctorConfirmed({
      name: verifiedProfile.name || manualEntry.doctorName,
      specialty: verifiedProfile.specialty || manualEntry.specialty,
      location: verifiedProfile.location || manualEntry.location,
      website: verifiedProfile.website,
      practice: verifiedProfile.practice,
      npi: verifiedProfile.npi || verificationData?.npi,
      phone: (verifiedProfile as { phone?: string }).phone || verificationData?.phone || '',
      address: (verifiedProfile as { address?: string }).address || verificationData?.address || ''
    });
  };

  // Handle verification rejection
  const handleVerificationReject = () => {
    setShowVerification(false);
    // Clear autocomplete selection flag
    setSelectedFromAutocomplete(false);
    // Let user modify their input
  };

  // Auto-trigger search when fields are filled from autocomplete
  useEffect(() => {
    if (selectedFromAutocomplete && isManualEntryComplete()) {
      handleManualSearch();
      setSelectedFromAutocomplete(false);
    }
  }, [selectedFromAutocomplete, manualEntry, handleManualSearch, isManualEntryComplete]);

  if (showVerification && verificationData) {
    return (
      <DoctorVerification
        doctorName={verificationData.name || 'Unknown Doctor'}
        location={verificationData.location}
        onConfirm={handleVerificationConfirm}
        onReject={handleVerificationReject}
      />
    );
  }

  return (
    <div className="enhanced-doctor-input">
      <div className="input-grid">
        {/* Doctor Name with Autocomplete Enhancement */}
        <div className="input-group">
          <label className="input-label">Doctor Name</label>
          <div className="input-with-autocomplete">
            <input
              type="text"
              value={manualEntry.doctorName}
              onChange={(e) => setManualEntry({...manualEntry, doctorName: e.target.value})}
              placeholder="Dr. John Smith"
              className="manual-input"
              disabled={isSearching}
            />
            {/* Hidden autocomplete overlay - the "surprise" */}
            <div className="autocomplete-overlay">
              <DoctorAutocomplete
                onSelect={handleAutocompleteSelect}
                placeholder="Start typing to search..."
                inputClassName="autocomplete-input"
                dropdownClassName="canvas-dropdown"
              />
            </div>
          </div>
        </div>

        {/* Specialty */}
        <div className="input-group">
          <label className="input-label">Specialty</label>
          <input
            type="text"
            value={manualEntry.specialty}
            onChange={(e) => setManualEntry({...manualEntry, specialty: e.target.value})}
            placeholder="e.g., Oral Surgery, Dentistry"
            className="manual-input"
            disabled={isSearching}
          />
        </div>

        {/* Location */}
        <div className="input-group">
          <label className="input-label">Location</label>
          <input
            type="text"
            value={manualEntry.location}
            onChange={(e) => setManualEntry({...manualEntry, location: e.target.value})}
            placeholder="City, State"
            className="manual-input"
            disabled={isSearching}
          />
        </div>
      </div>

      {/* Search Button */}
      <button
        onClick={handleManualSearch}
        disabled={!isManualEntryComplete() || isSearching}
        className={`search-button ${isSearching ? 'searching' : ''}`}
      >
        {isSearching ? (
          <>
            <span className="spinner" />
            FINDING DOCTOR...
          </>
        ) : (
          '🔍 FIND & VERIFY DOCTOR'
        )}
      </button>

      <style>{`
        .enhanced-doctor-input {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .input-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .input-group {
          position: relative;
        }

        .input-label {
          display: block;
          color: #00ffc6;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-with-autocomplete {
          position: relative;
        }

        .manual-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(0, 255, 198, 0.3);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .manual-input:focus {
          outline: none;
          border-color: #00ffc6;
          background: rgba(0, 255, 198, 0.1);
          box-shadow: 0 0 20px rgba(0, 255, 198, 0.3);
        }

        .manual-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .autocomplete-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .input-with-autocomplete:hover .autocomplete-overlay,
        .input-with-autocomplete:focus-within .autocomplete-overlay {
          opacity: 1;
          pointer-events: all;
        }

        .input-with-autocomplete:hover .manual-input,
        .input-with-autocomplete:focus-within .manual-input {
          opacity: 0;
          pointer-events: none;
        }

        .autocomplete-input {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 2px solid rgba(0, 255, 198, 0.3) !important;
          color: #fff !important;
        }

        .search-button {
          width: 100%;
          padding: 16px 32px;
          background: linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%);
          color: #000;
          font-weight: 700;
          font-size: 1.125rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0, 255, 198, 0.4);
        }

        .search-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .search-button.searching {
          background: linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%);
          animation: pulse 2s ease-in-out infinite;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 3px solid rgba(0, 0, 0, 0.3);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @media (max-width: 768px) {
          .input-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};