import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface AuthLoadingWrapperProps {
  children: React.ReactNode;
}

export const AuthLoadingWrapper: React.FC<AuthLoadingWrapperProps> = ({ children }) => {
  const { loading } = useAuth();
  const [forceShow, setForceShow] = useState(false);
  
  useEffect(() => {
    // Clear the HTML loading screen once React takes over
    const rootElement = document.getElementById('root');
    if (rootElement) {
      // Clear any existing HTML content from the static loading screen
      const htmlContent = rootElement.innerHTML;
      if (htmlContent.includes('Loading Provider Intelligence') || htmlContent.includes('CANVAS')) {
        rootElement.innerHTML = '';
      }
    }
    
    // Force show content after 500ms to prevent stuck loading screens
    const forceTimeout = setTimeout(() => {
      console.log('[AuthLoadingWrapper] Force showing content after timeout');
      setForceShow(true);
    }, 500);
    
    return () => clearTimeout(forceTimeout);
  }, []);
  
  if (loading && !forceShow) {
    return <LoadingScreen message="Initializing Canvas..." />;
  }
  
  return <>{children}</>;
};