import React, { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { getApiEndpoint } from '../config/api';
import { withRetry, APIError, getUserFriendlyError } from '../utils/errorHandling';

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

// Simple in-memory cache for NPI lookups
const npiCache = new Map<string, { data: Doctor[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
  const searchDoctors = useCallback(async (searchTerm: string) => {
      if (searchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      // Check cache first
      const cacheKey = searchTerm.toLowerCase();
      const cached = npiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('🗂️ Using cached results for:', searchTerm);
        setSuggestions(cached.data);
        setShowDropdown(cached.data.length > 0);
        return;
      }

      setLoading(true);
      setError(null);
      console.log('🔍 Searching for:', searchTerm);
      
      try {
        const url = `${getApiEndpoint('npiLookup')}?search=${encodeURIComponent(searchTerm)}`;
        console.log('🌐 Fetching URL:', url);
        
        // Use retry wrapper for resilient API calls
        const data = await withRetry(async () => {
          const response = await fetch(url);
          console.log('📡 Response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Response error:', errorText);
            throw new APIError(`Failed to search doctors`, response.status, url);
          }
          
          return response.json();
        }, {
          maxAttempts: 3,
          initialDelay: 500,
          shouldRetry: (error, attempt) => {
            // Retry on network errors or 5xx errors
            if (error instanceof APIError) {
              return error.statusCode ? error.statusCode >= 500 : true;
            }
            return attempt < 2; // Allow 2 retries for network errors
          }
        });
        
        console.log('👥 Found doctors:', data);
        
        // Handle both array format (Netlify) and object format (backend)
        const doctors = Array.isArray(data) ? data : (data.results || []);
        console.log('👥 Number of results:', doctors.length);
        
        // Cache the results
        npiCache.set(cacheKey, {
          data: doctors,
          timestamp: Date.now()
        });
        
        setSuggestions(doctors);
        setShowDropdown(doctors.length > 0);
        console.log('✅ Set suggestions and dropdown visibility');
      } catch (error) {
        console.error('❌ Failed to search doctors:', error);
        const userMessage = getUserFriendlyError(error);
        setError(userMessage);
        setSuggestions([]);
        setShowDropdown(true); // Show error message
      } finally {
        setLoading(false);
      }
  }, []);

  // Create debounced version
  const debouncedSearchDoctors = React.useMemo(
    () => debounce(searchDoctors, 300),
    [searchDoctors]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('🔍 Input changed:', value);
    setSearch(value);
    debouncedSearchDoctors(value);
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
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {/* Enhanced loading animation */}
            <div className="relative">
              {/* Outer glow effect */}
              <div className="absolute inset-0 rounded-full blur-md animate-pulse"
                   style={{
                     background: 'radial-gradient(circle, rgba(0, 255, 198, 0.4) 0%, transparent 70%)',
                     width: '28px',
                     height: '28px',
                     left: '-4px',
                     top: '-4px'
                   }} />
              
              {/* Main spinner */}
              <svg className="animate-spin h-5 w-5 relative z-10" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00ffc6" />
                    <stop offset="100%" stopColor="#7B42F6" />
                  </linearGradient>
                </defs>
                <circle 
                  className="opacity-20" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke={inputClassName === 'canvas-input' ? '#00ffc6' : '#3b82f6'}
                  strokeWidth="3" 
                  fill="none" 
                />
                <path 
                  className="opacity-90" 
                  fill="none"
                  stroke="url(#spinner-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  d="M12 2a10 10 0 0 1 10 10"
                />
              </svg>
              
              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                     style={{
                       background: inputClassName === 'canvas-input' ? '#00ffc6' : '#3b82f6',
                       boxShadow: inputClassName === 'canvas-input' 
                         ? '0 0 4px rgba(0, 255, 198, 0.8)' 
                         : '0 0 4px rgba(59, 130, 246, 0.8)'
                     }} />
              </div>
            </div>
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