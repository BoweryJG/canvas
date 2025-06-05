import React, { useState } from 'react';
import { DoctorAutocompleteDebug } from '../components/DoctorAutocompleteDebug';
import { DoctorAutocomplete } from '../components/DoctorAutocomplete';

export const TestNPIDebug: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [useDebugVersion, setUseDebugVersion] = useState(true);

  const handleSelect = (doctor: any) => {
    console.log('Doctor selected:', doctor);
    setSelectedDoctor(doctor);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          NPI Autocomplete Debug Test
        </h1>
        
        {/* Toggle between debug and regular version */}
        <div className="text-center mb-8">
          <button
            onClick={() => setUseDebugVersion(!useDebugVersion)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Using: {useDebugVersion ? 'Debug Version' : 'Regular Version'}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {useDebugVersion ? 'Debug Autocomplete Component' : 'Regular Autocomplete Component'}
          </h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search for a doctor (try "Greg White"):
            </label>
            {useDebugVersion ? (
              <DoctorAutocompleteDebug 
                onSelect={handleSelect}
                placeholder="Type doctor name... (e.g., Greg White)"
              />
            ) : (
              <DoctorAutocomplete 
                onSelect={handleSelect}
                placeholder="Type doctor name... (e.g., Greg White)"
              />
            )}
          </div>
          
          {selectedDoctor && (
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Selected Doctor:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(selectedDoctor, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-3">Debug Checklist:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open browser DevTools (F12) and check Console tab</li>
            <li>Type "Greg White" slowly and watch the debug panel (top right)</li>
            <li>Check if the API call is being made (look for fetch in Network tab)</li>
            <li>Look for the red-bordered dropdown when results are returned</li>
            <li>Check for any CSS conflicts in the Elements/Inspector tab</li>
            <li>Verify z-index values in computed styles</li>
            <li>Test with different names to see various responses</li>
          </ol>
        </div>
        
        <div className="bg-yellow-50 rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-3">Common Issues to Check:</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Dropdown not visible:</strong> Check z-index, overflow:hidden on parent elements</li>
            <li><strong>No API calls:</strong> Check debounce timing, minimum character length</li>
            <li><strong>API errors:</strong> Check CORS, Netlify function deployment</li>
            <li><strong>Dropdown closes immediately:</strong> Check blur/focus event handling</li>
            <li><strong>CSS conflicts:</strong> Check global styles overriding component styles</li>
          </ul>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-6">
          <h2 className="font-semibold mb-3">Quick Tests:</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder*="doctor"]') as HTMLInputElement;
                if (input) {
                  input.value = 'Greg White';
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mr-2"
            >
              Auto-fill "Greg White"
            </button>
            
            <button
              onClick={() => {
                console.log('Checking DOM for dropdown elements...');
                const dropdowns = document.querySelectorAll('[class*="dropdown"], [class*="suggestions"]');
                console.log('Found dropdown elements:', dropdowns);
                dropdowns.forEach((el, i) => {
                  console.log(`Element ${i}:`, el, 'Computed styles:', window.getComputedStyle(el));
                });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 mr-2"
            >
              Check DOM for Dropdowns
            </button>
            
            <button
              onClick={() => {
                fetch('/.netlify/functions/npi-lookup?search=Greg%20White')
                  .then(res => res.json())
                  .then(data => console.log('Direct API test:', data))
                  .catch(err => console.error('Direct API error:', err));
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Test API Directly
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};