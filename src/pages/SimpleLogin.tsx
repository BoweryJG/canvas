import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../auth';

const SimpleLogin: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { signInWithProvider, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleProviderAuth = async (provider: 'google' | 'github') => {
    console.log(`SimpleLogin - Authenticating with ${provider}`);
    setLoading(true);
    setError(undefined);
    
    try {
      await signInWithProvider(provider);
      // OAuth redirect happens here
    } catch (err) {
      console.error('SimpleLogin - OAuth error:', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2
    }}>
      <Paper sx={{
        p: 4,
        maxWidth: 360,
        width: '100%',
        borderRadius: '20px',
        background: 'rgba(20,20,40,0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,255,198,0.2)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4
        }}>
          <Box sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
            boxShadow: '0 4px 20px rgba(0,255,198,0.3)'
          }}>
            <AutoAwesomeIcon sx={{ 
              fontSize: 28, 
              color: '#000'
            }} />
          </Box>

          <Typography variant="h5" sx={{
            fontWeight: 700,
            color: '#00ffc6',
            mb: 0.5
          }}>
            Canvas
          </Typography>

          <Typography variant="body2" sx={{
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center'
          }}>
            Sign in to continue
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              backgroundColor: 'rgba(211, 47, 47, 0.1)',
              color: '#ff6b6b',
              border: '1px solid rgba(211, 47, 47, 0.3)'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Social Login Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={loading ? null : <GoogleIcon />}
            onClick={() => handleProviderAuth('google')}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: '#fff',
              color: '#333',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            {loading ? (
              <CircularProgress size={20} sx={{ color: '#333' }} />
            ) : (
              'Continue with Google'
            )}
          </Button>

          <Button
            fullWidth
            variant="contained"
            startIcon={<GitHubIcon />}
            onClick={() => handleProviderAuth('github')}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              backgroundColor: '#24292e',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '15px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: '#1a1e22',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              },
              '&:disabled': {
                backgroundColor: 'rgba(36,41,46,0.5)',
                color: 'rgba(255,255,255,0.5)'
              }
            }}
          >
            Continue with GitHub
          </Button>
        </Box>

        <Divider sx={{ 
          my: 3,
          '&::before, &::after': {
            borderColor: 'rgba(255,255,255,0.1)'
          }
        }}>
          <Typography sx={{ 
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.8rem',
            px: 2
          }}>
            OR
          </Typography>
        </Divider>

        {/* Email Option */}
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/')}
          sx={{
            py: 1.5,
            borderRadius: '12px',
            borderColor: 'rgba(0,255,198,0.3)',
            color: '#00ffc6',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '15px',
            '&:hover': {
              borderColor: '#00ffc6',
              backgroundColor: 'rgba(0,255,198,0.05)'
            }
          }}
        >
          Continue as Guest
        </Button>

        {/* Terms */}
        <Typography sx={{
          mt: 3,
          fontSize: '0.75rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.4)',
          lineHeight: 1.5,
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Paper>
    </Box>
  );
};

export default SimpleLogin;