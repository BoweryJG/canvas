import React, { useEffect } from 'react';

interface AuthLoadingWrapperProps {
  children: React.ReactNode;
}

export const AuthLoadingWrapper: React.FC<AuthLoadingWrapperProps> = ({ children }) => {
  
  useEffect(() => {
    // Chrome-specific aggressive loading screen clearing
    const clearLoadingScreen = () => {
      // Method 1: Add Chrome-specific CSS class to body
      document.body.classList.add('chrome-hide-loader');
      
      // Method 2: Remove by ID
      const initialLoader = document.getElementById('initial-loader');
      if (initialLoader) {
        initialLoader.remove();
      }
      
      // Method 3: Clear root innerHTML completely
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const htmlContent = rootElement.innerHTML;
        if (htmlContent.includes('Loading Provider Intelligence') || htmlContent.includes('CANVAS') || htmlContent.includes('🎯')) {
          rootElement.innerHTML = '';
        }
      }
      
      // Method 4: Force hide any remaining loading elements
      const loadingElements = document.querySelectorAll('[style*="Loading Provider Intelligence"], [style*="CANVAS"]');
      loadingElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
    };
    
    // Clear immediately
    clearLoadingScreen();
    
    // Chrome-specific: Clear again after a micro-delay
    setTimeout(clearLoadingScreen, 10);
    
    // Content is always shown immediately
  }, []);
  
  // Never show loading screen - always show content immediately
  // The app should work with mock data for unauthenticated users
  return <>{children}</>;
};