import React from 'react';
import { useAuth } from '../auth';

export const AuthStatus: React.FC = () => {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return <div style={{ padding: '10px' }}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '10px',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '8px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        width: '32px', 
        height: '32px', 
        borderRadius: '50%', 
        background: '#7B42F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        {user.email?.charAt(0).toUpperCase()}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 500 }}>{user.email}</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>Signed in</div>
      </div>
      <button
        onClick={() => signOut()}
        style={{
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          color: 'white',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        Sign Out
      </button>
    </div>
  );
};