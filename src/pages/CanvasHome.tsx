import React from 'react';
import IntegratedCanvasExperience from '../components/IntegratedCanvasExperience';

const CanvasHome: React.FC = () => {
  // Show the full Canvas experience for everyone
  // Authenticated users get additional features
  return <IntegratedCanvasExperience />;
};

export default CanvasHome;