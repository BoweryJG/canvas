import React, { useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { LoadingScreen } from './LoadingScreen';

interface AuthLoadingWrapperProps {
  children: React.ReactNode;
}

export const AuthLoadingWrapper: React.FC<AuthLoadingWrapperProps> = ({ children }) => {
  const { loading } = useAuth();
  
  useEffect(() => {
    // Clear the HTML loading screen once React takes over
    const rootElement = document.getElementById('root');
    if (rootElement && rootElement.innerHTML.includes('Loading Provider Intelligence')) {
      rootElement.innerHTML = '';
    }
  }, []);
  
  if (loading) {
    return <LoadingScreen message="Initializing Canvas..." />;
  }
  
  return <>{children}</>;
};