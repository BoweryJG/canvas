import React from 'react';
import LoginModal from './LoginModal';

interface GlobalAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GlobalAuthModal: React.FC<GlobalAuthModalProps> = ({ open, onClose, onSuccess }) => {
  // Debug logging
  React.useEffect(() => {
    console.log('GlobalAuthModal - open state:', open);
  }, [open]);

  return (
    <LoginModal 
      isOpen={open} 
      onClose={onClose} 
      onSuccess={onSuccess}
    />
  );
};

export default GlobalAuthModal;