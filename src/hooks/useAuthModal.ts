import { useState, useCallback } from 'react';

export const useAuthModal = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setIsAuthModalOpen(false);
    // Refresh the page to update auth state
    window.location.reload();
  }, []);

  return {
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    handleAuthSuccess,
  };
};