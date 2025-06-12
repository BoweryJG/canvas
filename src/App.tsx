import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'
import { AuthProvider } from './auth'
import MarketInsights from './pages/MarketInsightsSimple'
import CanvasHome from './pages/CanvasHome'
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
  
  const [showOnboarding, setShowOnboarding] = useState(true);
  
  useEffect(() => {
    // Initialize security features
    const initSecurity = async () => {
      await SecureStorage.init();
      CSRFTokenManager.generateToken();
    };
    
    initSecurity();
    
    // Register service worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
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
        {showOnboarding && (
          <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
        )}
        <ConnectionStatus />
        <NavBar />
        <Routes>
          <Route path="/" element={<CanvasHome />} />
          <Route path="/research" element={<EnhancedResearchPanelWithRender />} />
          <Route path="/market-insights" element={<MarketInsights />} />
          <Route path="/test-npi" element={<TestNPI />} />
          <Route path="/test-npi-debug" element={<TestNPIDebug />} />
          <Route path="/test-npi-minimal" element={<TestNPIMinimal />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default AppWithRouter;