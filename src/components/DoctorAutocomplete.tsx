import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getApiEndpoint } from '../config/api';

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
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const searchDoctors = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      setError(null);
      console.log('🔍 Searching for:', searchTerm);
      
      try {
        const url = `${getApiEndpoint('npiLookup')}?search=${encodeURIComponent(searchTerm)}`;
        console.log('🌐 Fetching URL:', url);
        console.log('🔧 API Base URL:', getApiEndpoint('npiLookup'));
        
        const response = await fetch(url);
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Response error:', errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('👥 Found doctors:', data);
        
        // Handle both array format (Netlify) and object format (backend)
        const doctors = Array.isArray(data) ? data : (data.results || []);
        console.log('👥 Number of results:', doctors.length);
        
        setSuggestions(doctors);
        setShowDropdown(doctors.length > 0);
        console.log('✅ Set suggestions and dropdown visibility');
      } catch (error) {
        console.error('❌ Failed to search doctors:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to search doctors';
        console.error('❌ Error type:', error instanceof Error ? error.constructor.name : 'Unknown');
        console.error('❌ Error message:', errorMessage);
        setError(errorMessage);
        setSuggestions([]);
        setShowDropdown(true); // Show error message
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('🔍 Input changed:', value);
    setSearch(value);
    searchDoctors(value);
  };

  const handleSelect = (doctor: Doctor) => {
    setSearch(doctor.displayName);
    setShowDropdown(false);
    onSelect(doctor);
  };

  // Debug: Log render state
  console.log('🔍 DoctorAutocomplete render:', {
    search,
    suggestionsCount: suggestions.length,
    showDropdown,
    loading
  });

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={() => {
            console.log('🔍 Input focused, suggestions:', suggestions.length);
            if (suggestions.length > 0) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            // Delay to allow clicking on dropdown items
            setTimeout(() => {
              console.log('🔍 Input blurred, hiding dropdown');
              setShowDropdown(false);
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full ${inputClassName}`}
          style={inputClassName === 'canvas-input' ? {
            // Ensure consistent dark theme styling
            backgroundColor: '#1a1a1a',
            color: 'white',
            borderColor: '#333'
          } : {
            backgroundColor: 'white',
            color: 'black',
            borderColor: '#d1d5db'
          }}
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <svg className={`animate-spin h-5 w-5 ${
              inputClassName === 'canvas-input' ? 'text-cyan-400' : 'text-blue-500'
            }`} viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className={`absolute w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-auto ${dropdownClassName}`}
             style={dropdownClassName === 'canvas-dropdown' ? { 
               backgroundColor: '#1a1a1a', 
               color: 'white',
               border: '1px solid #333',
               position: 'absolute',
               top: '100%',
               left: 0,
               right: 0,
               zIndex: 9999,
               marginTop: '0.5rem'
             } : { 
               backgroundColor: 'white', 
               color: 'black',
               border: '1px solid #e5e7eb',
               position: 'absolute',
               top: '100%',
               left: 0,
               right: 0,
               zIndex: 9999
             }}>
          {suggestions.map((doctor) => (
            <button
              key={doctor.npi}
              onClick={() => handleSelect(doctor)}
              className={`w-full px-4 py-3 text-left focus:outline-none ${
                dropdownClassName === 'canvas-dropdown' 
                  ? 'hover:bg-gray-800 focus:bg-gray-800 border-b border-gray-700 last:border-b-0' 
                  : 'hover:bg-gray-50 focus:bg-gray-50 border-b border-gray-100 last:border-b-0'
              }`}
            >
              <div className={`font-semibold ${
                dropdownClassName === 'canvas-dropdown' ? 'text-white' : 'text-gray-900'
              }`}>
                {doctor.displayName}
              </div>
              <div className={`text-sm ${
                dropdownClassName === 'canvas-dropdown' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {doctor.specialty} • {doctor.city}, {doctor.state}
              </div>
              {doctor.organizationName && (
                <div className={`text-xs mt-1 ${
                  dropdownClassName === 'canvas-dropdown' ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  {doctor.organizationName}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {showDropdown && search.length >= 3 && suggestions.length === 0 && !loading && (
        <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg p-4 text-center ${
          dropdownClassName === 'canvas-dropdown' 
            ? 'bg-gray-900 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}>
          {error ? (
            <div className={dropdownClassName === 'canvas-dropdown' ? 'text-red-400' : 'text-red-600'}>
              <div className="font-semibold">Error</div>
              <div className="text-sm mt-1">{error}</div>
              <div className={`text-xs mt-2 ${
                dropdownClassName === 'canvas-dropdown' ? 'text-gray-500' : 'text-gray-500'
              }`}>Check console for details</div>
            </div>
          ) : (
            <div className={dropdownClassName === 'canvas-dropdown' ? 'text-gray-400' : 'text-gray-500'}>
              No doctors found. Try a different search.
            </div>
          )}
        </div>
      )}
      
    </div>
  );
};