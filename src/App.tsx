import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import KineticNavBar from './components/KineticNavBar'
import { AuthProvider } from './auth'
import MarketInsights from './pages/MarketInsightsSimple'
import CanvasHome from './pages/CanvasHome'
import SimpleLogin from './pages/SimpleLogin'
import AuthCallback from './pages/AuthCallback'
import { TestNPI } from './pages/TestNPI'
import { TestNPIDebug } from './pages/TestNPIDebug'
import { TestNPIMinimal } from './pages/TestNPIMinimal'
import ForceAuth from './pages/ForceAuth'
import AuthTest from './pages/AuthTest'
import TestAuthModals from './pages/TestAuthModals'
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
// import { EnhancedAgentSystem } from './components/agents/EnhancedAgentSystem'
import { CanvasAIPro } from './components/agents/CanvasAIPro'
// import AISalesAgentLauncher from './components/agents/premium/AISalesAgentLauncher'
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
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if we have OAuth callback tokens in URL
    if (window.location.hash && window.location.hash.includes('access_token')) {
      console.log('App - OAuth callback detected, redirecting to auth callback handler');
      // Preserve the hash when navigating
      navigate('/auth/callback' + window.location.hash);
      return;
    }
    
    // Initialize security features
    const initSecurity = async () => {
      await SecureStorage.init();
      CSRFTokenManager.generateToken();
    };
    
    initSecurity();
    
    // Temporarily disable service worker to avoid caching issues
    // TODO: Re-enable after fixing cache invalidation
    /*
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
    */
    
    // Unregister any existing service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
          console.log('Unregistered service worker:', registration);
        });
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
        {showOnboarding && (
          <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
        )}
        <ConnectionStatus />
        <KineticNavBar />
        <Routes>
          <Route path="/" element={<CanvasHome />} />
          <Route path="/login" element={<SimpleLogin />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/research" element={<EnhancedResearchPanelWithRender />} />
          <Route path="/market-insights" element={<MarketInsights />} />
          <Route path="/test-npi" element={<TestNPI />} />
          <Route path="/test-npi-debug" element={<TestNPIDebug />} />
          <Route path="/test-npi-minimal" element={<TestNPIMinimal />} />
          <Route path="/force-auth" element={<ForceAuth />} />
          <Route path="/auth-test" element={<AuthTest />} />
          <Route path="/test-auth-modals" element={<TestAuthModals />} />
        </Routes>
        {/* <ChatLauncher /> */}
        {/* <EnhancedAgentSystem /> */}
        <CanvasAIPro />
        {/* <AISalesAgentLauncher /> */}
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppWithRouter;