import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  IconButton,
  Typography,
  Box,
  keyframes,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../auth';

interface GlobalAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Shimmer animation
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// Floating animation
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
`;

// Pulse animation
const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const GlobalAuthModal: React.FC<GlobalAuthModalProps> = ({ open, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithProvider } = useAuth();
  const theme = useTheme();
  
  // Debug logging
  React.useEffect(() => {
    console.log('GlobalAuthModal - open state:', open);
  }, [open]);

  const handleProviderSignIn = async (provider: 'google' | 'facebook') => {
    try {
      setIsLoading(true);
      await signInWithProvider(provider);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = () => {
    // Redirect to simple login page for email/password
    window.location.href = '/login';
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(15,15,35,0.95) 0%, rgba(25,25,50,0.98) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(240,240,255,0.98) 100%)',
          backdropFilter: 'blur(40px)',
          border: theme.palette.mode === 'dark'
            ? '1px solid rgba(123,66,246,0.3)'
            : '1px solid rgba(123,66,246,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 100px rgba(123,66,246,0.1)',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '400px',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,198,0.8) 20%, rgba(123,66,246,0.8) 80%, transparent 100%)',
            zIndex: 1,
          }
        }
      }}
    >
      {/* Floating Orbs Background */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: `${20 + i * 15}px`,
              height: `${20 + i * 15}px`,
              borderRadius: '50%',
              background: `linear-gradient(45deg, ${i % 2 === 0 ? '#00ffc6' : '#7B42F6'}40, transparent)`,
              top: `${10 + i * 20}%`,
              left: `${5 + i * 18}%`,
              animation: `${float} ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </Box>

      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          color: theme.palette.mode === 'dark' ? '#fff' : '#333',
          backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.2)',
            transform: 'scale(1.1)',
          }
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ 
        p: 4,
        pt: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Canvas Icon */}
        <Box sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '2px',
            borderRadius: '50%',
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(15,15,35,0.9) 0%, rgba(25,25,50,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,255,0.9) 100%)',
          }
        }}>
          <AutoAwesomeIcon sx={{ 
            fontSize: 40, 
            color: '#00ffc6',
            position: 'relative',
            zIndex: 1,
            animation: `${pulse} 2s ease-in-out infinite`
          }} />
        </Box>

        {/* Title */}
        <Typography variant="h4" sx={{
          fontWeight: 800,
          mb: 1,
          textAlign: 'center',
          background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundSize: '200% 100%',
          animation: `${shimmer} 3s ease-in-out infinite`,
        }}>
          Canvas
        </Typography>

        <Typography variant="subtitle1" sx={{
          mb: 4,
          textAlign: 'center',
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
          fontWeight: 500,
        }}>
          Intelligent research & outreach
        </Typography>

        {/* Auth Options */}
        <Box sx={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Google */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleProviderSignIn('google')}
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '16px',
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: '#4285f4',
                backgroundColor: 'rgba(66,133,244,0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(66,133,244,0.3)',
              }
            }}
          >
            Continue with Google
          </Button>

          {/* Facebook */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={() => handleProviderSignIn('facebook')}
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '16px',
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                borderColor: '#1877F2',
                backgroundColor: 'rgba(24,119,242,0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(24,119,242,0.3)',
              }
            }}
          >
            Continue with Facebook
          </Button>

          {/* Email */}
          <Button
            fullWidth
            variant="contained"
            startIcon={<EmailIcon />}
            onClick={handleEmailSignIn}
            disabled={isLoading}
            sx={{
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: '16px',
              color: '#fff',
              background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.2) 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: '0 12px 35px rgba(123,66,246,0.4), 0 0 50px rgba(0,255,198,0.3)',
                '&::before': {
                  opacity: 1,
                }
              },
              '&:disabled': {
                opacity: 0.7,
              }
            }}
          >
            Continue with Email
          </Button>
        </Box>

        {/* Terms */}
        <Typography sx={{
          mt: 3,
          fontSize: '0.8rem',
          textAlign: 'center',
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          maxWidth: '280px',
          lineHeight: 1.4,
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default GlobalAuthModal;