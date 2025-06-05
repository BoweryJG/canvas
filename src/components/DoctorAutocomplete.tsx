import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';

export interface Doctor {
  npi: string;
  displayName: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  city: string;
  state: string;
  fullAddress: string;
  phone: string;
  organizationName?: string;
}

interface DoctorAutocompleteProps {
  onSelect: (doctor: Doctor) => void;
  placeholder?: string;
  inputClassName?: string;
  dropdownClassName?: string;
}

export const DoctorAutocomplete: React.FC<DoctorAutocompleteProps> = ({ 
  onSelect, 
  placeholder = "Doctor name...",
  inputClassName = "",
  dropdownClassName = ""
}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search function
  const searchDoctors = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      console.log('🔍 Searching for:', searchTerm);
      
      try {
        const response = await fetch(`/.netlify/functions/npi-lookup?search=${encodeURIComponent(searchTerm)}`);
        console.log('📡 Response status:', response.status);
        
        const doctors = await response.json();
        console.log('👥 Found doctors:', doctors);
        
        setSuggestions(doctors);
        setShowDropdown(true);
      } catch (error) {
        console.error('❌ Failed to search doctors:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    searchDoctors(value);
  };

  const handleSelect = (doctor: Doctor) => {
    setSearch(doctor.displayName);
    setShowDropdown(false);
    onSelect(doctor);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/5 text-white placeholder-white/50 backdrop-blur-sm ${inputClassName}`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className={`absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto ${dropdownClassName}`}
             style={{ backgroundColor: 'white', color: 'black' }}>
          {suggestions.map((doctor) => (
            <button
              key={doctor.npi}
              onClick={() => handleSelect(doctor)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-900">
                {doctor.displayName}
              </div>
              <div className="text-sm text-gray-600">
                {doctor.specialty} • {doctor.city}, {doctor.state}
              </div>
              {doctor.organizationName && (
                <div className="text-xs text-gray-500 mt-1">
                  {doctor.organizationName}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {showDropdown && search.length >= 3 && suggestions.length === 0 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          No doctors found. Try a different search.
        </div>
      )}
    </div>
  );
};