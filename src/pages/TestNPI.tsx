import React from 'react';
import { MagicResearchForm } from '../components/MagicResearchForm';

export const TestNPI: React.FC = () => {
  const handleSubmit = (data: any) => {
    console.log('Form submitted with data:', data);
    alert(`
      Doctor: ${data.doctorName}
      Specialty: ${data.specialty}
      Location: ${data.location}
      NPI: ${data.npi}
    `);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          NPI Autocomplete Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          <MagicResearchForm onSubmit={handleSubmit} />
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold mb-2">Test Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Type "Greg White" in the doctor search field</li>
            <li>Wait for dropdown to appear with suggestions</li>
            <li>Look for "Dr. Gregory White, D.D.S." - Oral and Maxillofacial Surgery</li>
            <li>Click to select and watch fields auto-populate</li>
          </ol>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-xs">
            Open browser console (F12) to see API calls and responses
          </p>
        </div>
      </div>
    </div>
  );
};