import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../auth';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle auth callback
    const handleAuthCallback = async () => {
      // Wait a moment for auth to settle
      setTimeout(() => {
        if (user) {
          // Successfully authenticated, redirect to home
          navigate('/');
        } else if (!loading) {
          // Auth failed, redirect to login
          navigate('/login');
        }
      }, 1000);
    };

    handleAuthCallback();
  }, [user, loading, navigate]);

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      gap: 3
    }}>
      <CircularProgress 
        size={60} 
        sx={{ 
          color: '#00ffc6',
          '& .MuiCircularProgress-circle': {
            strokeLinecap: 'round',
          }
        }} 
      />
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        Completing sign in...
      </Typography>
      <Typography sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 400 }}>
        Please wait while we securely sign you in to Canvas
      </Typography>
    </Box>
  );
};

export default AuthCallback;