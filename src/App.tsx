import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import { AuthProvider, AuthGuard } from './auth'
import { PublicCanvasDashboard } from './components/PublicCanvasDashboard'
import MarketInsights from './pages/MarketInsightsSimple'
import CanvasHome from './pages/CanvasHome'
import SimpleLogin from './pages/SimpleLogin'
import AuthCallback from './pages/AuthCallback'
import { TestNPI } from './pages/TestNPI'
import { TestNPIDebug } from './pages/TestNPIDebug'
import { TestNPIMinimal } from './pages/TestNPIMinimal'
import { EnhancedResearchPanelWithRender } from './components/EnhancedResearchPanelWithRender'
import ErrorBoundary from './components/ErrorBoundary'
import { ConnectionStatus } from './components/ConnectionStatus'
import { preloadCriticalData } from './utils/resilientApi'
import { DataManager } from './utils/dataManager'
import { useApiKeys } from './hooks/useApiKeys'
import { SecureStorage, CSRFTokenManager } from './utils/security'
import { analytics } from './utils/analytics'
import { OnboardingFlow } from './components/Onboarding/OnboardingFlow'
// import ChatLauncher from './components/agents/ChatLauncher'
import { EnhancedAgentSystem } from './components/agents/EnhancedAgentSystem'
// import ChatLauncher from './components/agents/SimpleChatLauncher'
// import ChatLauncher from './components/agents/DebugChat'
import './App.css'
import './styles/mobile.css'

function App() {
  return <AppContent />;
}

// Analytics tracking component
function AnalyticsTracker() {
  const location = useLocation();
  
  useEffect(() => {
    analytics.trackPageView(location.pathname, document.title);
  }, [location]);
  
  return null;
}

// Wrap App with Router for analytics
function AppWithRouter() {
  return (
    <Router>
      <AnalyticsTracker />
      <App />
    </Router>
  );
}

// Update App component to remove Router
function AppContent() {
  // Initialize API key rotation
  useApiKeys();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Initialize security features
    const initSecurity = async () => {
      await SecureStorage.init();
      CSRFTokenManager.generateToken();
    };
    
    initSecurity();
    
    // Register service worker
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Preload critical data on app start
    preloadCriticalData();

    // Clean up old data periodically
    DataManager.cleanup();
    
    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      DataManager.cleanup();
    }, 24 * 60 * 60 * 1000); // Daily cleanup

    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGuard
          allowPublic={true}
          publicComponent={
            <PublicCanvasDashboard 
              onLoginSuccess={() => window.location.reload()}
            />
          }
          redirectTo="/login"
          fallback={
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100vh',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
              color: 'white'
            }}>
              Checking authentication...
            </div>
          }
        >
          {showOnboarding && (
            <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
          )}
          <ConnectionStatus />
          <NavBar />
          <Routes>
            <Route path="/" element={<CanvasHome />} />
            <Route path="/login" element={<SimpleLogin />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/research" element={<EnhancedResearchPanelWithRender />} />
            <Route path="/market-insights" element={<MarketInsights />} />
            <Route path="/test-npi" element={<TestNPI />} />
            <Route path="/test-npi-debug" element={<TestNPIDebug />} />
            <Route path="/test-npi-minimal" element={<TestNPIMinimal />} />
          </Routes>
          {/* <ChatLauncher /> */}
          <EnhancedAgentSystem />
        </AuthGuard>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppWithRouter;