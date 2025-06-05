import React from 'react';
import { DoctorAutocomplete } from '../components/DoctorAutocomplete';

export const TestNPIMinimal: React.FC = () => {
  return (
    <div style={{ 
      padding: '50px',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ marginBottom: '30px' }}>Minimal NPI Test</h1>
      
      {/* Test 1: Component with no parent styling */}
      <div style={{ marginBottom: '50px' }}>
        <h2>Test 1: No parent styling</h2>
        <DoctorAutocomplete 
          onSelect={(doctor) => {
            console.log('Selected:', doctor);
            alert(`Selected: ${doctor.displayName}`);
          }}
        />
      </div>

      {/* Test 2: Component with position relative parent */}
      <div style={{ 
        marginBottom: '50px',
        position: 'relative',
        zIndex: 1
      }}>
        <h2>Test 2: With position:relative parent</h2>
        <DoctorAutocomplete 
          onSelect={(doctor) => {
            console.log('Selected:', doctor);
            alert(`Selected: ${doctor.displayName}`);
          }}
        />
      </div>

      {/* Test 3: Component with overflow:hidden parent (problematic) */}
      <div style={{ 
        marginBottom: '50px',
        overflow: 'hidden',
        border: '2px solid red',
        padding: '20px'
      }}>
        <h2>Test 3: With overflow:hidden parent (BAD)</h2>
        <p style={{ color: 'red' }}>This should NOT work properly</p>
        <DoctorAutocomplete 
          onSelect={(doctor) => {
            console.log('Selected:', doctor);
            alert(`Selected: ${doctor.displayName}`);
          }}
        />
      </div>

      {/* Test 4: Component with high z-index parent */}
      <div style={{ 
        marginBottom: '50px',
        position: 'relative',
        zIndex: 10000
      }}>
        <h2>Test 4: With high z-index parent</h2>
        <DoctorAutocomplete 
          onSelect={(doctor) => {
            console.log('Selected:', doctor);
            alert(`Selected: ${doctor.displayName}`);
          }}
        />
      </div>

      {/* Add space at bottom for dropdown */}
      <div style={{ height: '300px' }} />
    </div>
  );
};