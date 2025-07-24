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

interface DoctorAutocompleteDebugProps {
  onSelect: (doctor: Doctor) => void;
  placeholder?: string;
}

export const DoctorAutocompleteDebug: React.FC<DoctorAutocompleteDebugProps> = ({ 
  onSelect, 
  placeholder = "Doctor name..."
}) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Add debug message
  const addDebug = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🔍 DEBUG: ${message}`);
  }, []);

  // Debounced search function
  const searchDoctors = useCallback(async (searchTerm: string) => {
      addDebug(`searchDoctors called with: "${searchTerm}"`);
      
      if (searchTerm.length < 3) {
        addDebug('Search term too short, clearing suggestions');
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      setNetworkError(null);
      addDebug(`Starting API call for: "${searchTerm}"`);
      
      try {
        const url = `/.netlify/functions/npi-lookup?search=${encodeURIComponent(searchTerm)}`;
        addDebug(`Fetching URL: ${url}`);
        
        const response = await fetch(url);
        addDebug(`Response status: ${response.status}`);
        addDebug(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const doctors = await response.json();
        addDebug(`Received ${doctors.length} doctors`);
        addDebug(`First doctor: ${doctors.length > 0 ? JSON.stringify(doctors[0]) : 'none'}`);
        
        setSuggestions(doctors);
        setShowDropdown(doctors.length > 0);
        addDebug(`showDropdown set to: ${doctors.length > 0}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        addDebug(`ERROR: ${errorMessage}`);
        setNetworkError(errorMessage);
        setSuggestions([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
        addDebug('API call completed');
      }
  }, [addDebug]);

  // Create debounced version
  const debouncedSearchDoctors = useCallback(
    debounce(searchDoctors, 300),
    [searchDoctors]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    addDebug(`Input changed to: "${value}"`);
    setSearch(value);
    debouncedSearchDoctors(value);
  };

  const handleSelect = (doctor: Doctor) => {
    addDebug(`Doctor selected: ${doctor.displayName}`);
    setSearch(doctor.displayName);
    setShowDropdown(false);
    onSelect(doctor);
  };

  const handleFocus = () => {
    addDebug(`Input focused. Suggestions count: ${suggestions.length}`);
    if (suggestions.length > 0) {
      setShowDropdown(true);
      addDebug('Showing dropdown on focus');
    }
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      addDebug('Input blurred, hiding dropdown');
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className="relative">
      {/* Debug Panel */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '400px',
        maxHeight: '300px',
        background: 'rgba(0, 0, 0, 0.9)',
        border: '2px solid #00d4ff',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#00ff00',
        overflowY: 'auto',
        zIndex: 9999
      }}>
        <div style={{ marginBottom: '10px', color: '#00d4ff', fontWeight: 'bold' }}>
          🔍 Autocomplete Debug Info
        </div>
        <div style={{ marginBottom: '10px' }}>
          <span style={{ color: '#ffff00' }}>Current State:</span><br />
          Search: "{search}"<br />
          Suggestions: {suggestions.length}<br />
          Loading: {loading ? 'YES' : 'NO'}<br />
          ShowDropdown: {showDropdown ? 'YES' : 'NO'}<br />
          NetworkError: {networkError || 'None'}
        </div>
        <div style={{ borderTop: '1px solid #333', paddingTop: '10px' }}>
          {debugInfo.slice(-10).map((msg, i) => (
            <div key={i} style={{ marginBottom: '2px' }}>{msg}</div>
          ))}
        </div>
      </div>

      {/* Main Component */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{
            backgroundColor: 'white',
            color: 'black'
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

      {/* Dropdown with debug styling */}
      {showDropdown && suggestions.length > 0 && (
        <div 
          className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-auto"
          style={{ 
            backgroundColor: 'white', 
            color: 'black',
            border: '2px solid red', // Debug: make border very visible
            boxShadow: '0 0 20px rgba(255, 0, 0, 0.5)' // Debug: add red glow
          }}
        >
          <div style={{ 
            padding: '10px', 
            background: '#ff0000', 
            color: 'white',
            fontWeight: 'bold'
          }}>
            DEBUG: Dropdown is visible! ({suggestions.length} items)
          </div>
          {suggestions.map((doctor) => (
            <button
              key={doctor.npi}
              onClick={() => handleSelect(doctor)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              style={{ cursor: 'pointer' }}
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

      {/* Force visible dropdown for testing */}
      {search.length >= 3 && !showDropdown && !loading && (
        <div 
          className="absolute z-50 w-full mt-1 bg-yellow-100 rounded-lg shadow-lg border-2 border-yellow-500 p-4"
          style={{ zIndex: 9999 }}
        >
          <strong>DEBUG WARNING:</strong><br />
          Search length is {search.length} but dropdown is not showing.<br />
          Loading: {loading ? 'YES' : 'NO'}<br />
          Suggestions: {suggestions.length}<br />
          ShowDropdown: {showDropdown ? 'YES' : 'NO'}
        </div>
      )}

      {/* Network error display */}
      {networkError && (
        <div className="absolute z-50 w-full mt-1 bg-red-100 rounded-lg shadow-lg border-2 border-red-500 p-4 text-red-700">
          <strong>Network Error:</strong> {networkError}
        </div>
      )}

      {/* No results message */}
      {showDropdown && search.length >= 3 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
          No doctors found for "{search}". Try a different search.
        </div>
      )}
    </div>
  );
};