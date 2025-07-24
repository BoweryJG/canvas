import React from 'react';

interface AuthLoadingWrapperProps {
  children: React.ReactNode;
}

export const AuthLoadingWrapper: React.FC<AuthLoadingWrapperProps> = ({ children }) => {
  // No loading screen logic needed - we removed it from index.html
  // Just render children immediately
  return <>{children}</>;
};