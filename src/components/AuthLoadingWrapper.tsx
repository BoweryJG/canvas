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
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
      console.log('[AuthLoadingWrapper] Removing initial loader');
      initialLoader.remove();
    }
    
    // Also clear any remaining HTML content
    const rootElement = document.getElementById('root');
    if (rootElement) {
      const htmlContent = rootElement.innerHTML;
      if (htmlContent.includes('Loading Provider Intelligence') || htmlContent.includes('CANVAS')) {
        console.log('[AuthLoadingWrapper] Clearing HTML loading screen');
        rootElement.innerHTML = '';
      }
    }
    
    // Force show content after 200ms to prevent stuck loading screens
    const forceTimeout = setTimeout(() => {
      console.log('[AuthLoadingWrapper] Force showing content after timeout');
      setForceShow(true);
    }, 200);
    
    return () => clearTimeout(forceTimeout);
  }, []);
  
  if (loading && !forceShow) {
    return <LoadingScreen message="Initializing Canvas..." />;
  }
  
  return <>{children}</>;
};