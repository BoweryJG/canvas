import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import IntegratedCanvasExperience from '../components/IntegratedCanvasExperience';

const CanvasHome: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect non-authenticated users directly to login
    if (!session) {
      navigate('/login');
    }
  }, [session, navigate]);
  
  // Show nothing while redirecting
  if (!session) {
    return null;
  }
  
  // For authenticated users, show the research panel
  return <IntegratedCanvasExperience />;
};

export default CanvasHome;