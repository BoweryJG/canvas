import React, { useState } from 'react';
import { useAuth } from '../auth/useAuth';

interface CanvasQuickLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CanvasQuickLoginModal: React.FC<CanvasQuickLoginModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { signInWithEmail, signInWithProvider, loading, error } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setLocalError(null);

    try {
      await signInWithEmail(email, password);
      onSuccess?.();
      onClose();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'github' | 'facebook') => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      await signInWithProvider(provider, {
        redirectTo: window.location.href
      });
      // OAuth will redirect, so we don't need to handle success here
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Authentication failed');
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;
  const displayError = error?.message || localError;

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,26,46,0.95) 0%, rgba(15,15,30,0.98) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(123,66,246,0.2)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        color: 'white',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>
            {isSignUp ? 'Sign Up for Canvas' : 'Sign In to Canvas'}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ×
          </button>
        </div>

        <p style={{
          margin: '0 0 1.5rem 0',
          opacity: 0.8,
          fontSize: '0.9rem'
        }}>
          Access AI-powered sales intelligence and premium features
        </p>

        {displayError && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.1)',
            border: '1px solid rgba(220, 53, 69, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#ff6b6b',
            fontSize: '0.9rem'
          }}>
            {displayError}
          </div>
        )}

        {/* Social Auth Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => handleSocialAuth('google')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00ffc6';
              e.currentTarget.style.background = 'rgba(0, 255, 198, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <span>🔍</span> Google
          </button>
          <button
            onClick={() => handleSocialAuth('github')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.9rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#00ffc6';
              e.currentTarget.style.background = 'rgba(0, 255, 198, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <span>📚</span> GitHub
          </button>
        </div>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '1.5rem 0',
          opacity: 0.5
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
          <span style={{ padding: '0 1rem', fontSize: '0.85rem' }}>or continue with email</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00ffc6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#00ffc6';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            style={{
              width: '100%',
              padding: '15px',
              background: isLoading || !email || !password 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading && email && password) {
                e.currentTarget.style.background = 'linear-gradient(45deg, #6B32E6 30%, #00e6b6 90%)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && email && password) {
                e.currentTarget.style.background = 'linear-gradient(45deg, #7B42F6 30%, #00ffc6 90%)';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            {isLoading ? (
              <span>Loading...</span>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: '#00ffc6',
              cursor: 'pointer',
              fontSize: '0.9rem',
              textDecoration: 'underline'
            }}
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};