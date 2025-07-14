import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { OrbContextProvider } from './components/OrbContextProvider'
import { AuthProvider } from './auth'

// Debug mode - comment out to use normal app
// import AppDebug from './AppDebug.tsx'

// Error boundary for initialization errors
class InitErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Initialization error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          background: '#1a1a1a',
          color: 'white',
          fontFamily: 'system-ui'
        }}>
          <h1>Application Error</h1>
          <p>The application failed to initialize.</p>
          <details style={{ marginTop: '20px', padding: '10px', background: '#333', borderRadius: '5px' }}>
            <summary>Error Details</summary>
            <pre style={{ marginTop: '10px', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.message || 'Unknown error'}
            </pre>
          </details>
          <p style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
            If you're the site owner, please check your environment variables in Netlify.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add initialization logging
console.log('[Canvas] Starting app initialization...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('[Canvas] Root element not found!');
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Error: Root element not found</div>';
} else {
  console.log('[Canvas] Root element found, creating React root...');
  
  // Clear the loading screen immediately
  rootElement.innerHTML = '';
  
  try {
    const root = createRoot(rootElement);
    console.log('[Canvas] React root created, rendering app...');
    
    root.render(
      <StrictMode>
        <InitErrorBoundary>
          <AuthProvider>
            <OrbContextProvider>
              <App />
            </OrbContextProvider>
          </AuthProvider>
        </InitErrorBoundary>
      </StrictMode>,
    );
    
    console.log('[Canvas] App render initiated');
  } catch (error) {
    console.error('[Canvas] Failed to initialize app:', error);
    rootElement.innerHTML = `<div style="color: red; padding: 20px;">Failed to initialize: ${error}</div>`;
  }
}