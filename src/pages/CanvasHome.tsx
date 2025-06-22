import React from 'react';
import { useAuth } from '../auth/AuthContext';
import IntegratedCanvasExperience from '../components/IntegratedCanvasExperience';

const CanvasHome: React.FC = () => {
  const { session } = useAuth();
  
  // Show the full Canvas experience for everyone
  // Authenticated users get additional features
  return <IntegratedCanvasExperience />;
};

export default CanvasHome;