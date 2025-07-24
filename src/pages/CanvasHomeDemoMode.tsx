import React from 'react';
import MobileCinematicDemo from './MobileCinematicDemo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export const CanvasHomeDemoMode: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleDemoComplete = () => {
    // When demo completes and user searches, redirect to appropriate page
    if (session) {
      navigate('/research');
    } else {
      navigate('/login');
    }
  };

  const handleDemoSkip = () => {
    console.log('Demo skipped');
    // Navigation can be added here if needed when skip functionality is implemented
  };

  return (
    <MobileCinematicDemo 
      onComplete={handleDemoComplete}
      onSkip={handleDemoSkip}
    />
  );
};