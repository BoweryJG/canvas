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
    if (rootElement && rootElement.innerHTML.includes('Loading Provider Intelligence')) {
      rootElement.innerHTML = '';
    }
    
    // Force show content after 1 second regardless of loading state
    const forceTimeout = setTimeout(() => {
      console.log('[AuthLoadingWrapper] Force showing content after timeout');
      setForceShow(true);
    }, 1000);
    
    return () => clearTimeout(forceTimeout);
  }, []);
  
  if (loading && !forceShow) {
    return <LoadingScreen message="Initializing Canvas..." />;
  }
  
  return <>{children}</>;
};