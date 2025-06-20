import React from 'react';
import { useAuth } from '../auth/AuthContext';
import { CanvasHomeDemoMode } from './CanvasHomeDemoMode';
import IntegratedCanvasExperience from '../components/IntegratedCanvasExperience';

const CanvasHome: React.FC = () => {
  const { session } = useAuth();
  
  // Show demo mode by default for non-authenticated users
  if (!session) {
    return <CanvasHomeDemoMode />;
  }
  
  // For authenticated users, show the research panel
  return <IntegratedCanvasExperience />;
};

export default CanvasHome;