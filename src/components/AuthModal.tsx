import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode: string;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose, initialMode }) => {
  const [mode, setMode] = useState(initialMode === 'signup' ? 1 : 0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signInWithGoogle, signInWithFacebook } = useAuth();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setMode(newValue);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    onClose();
  };

  const handleFacebookSignIn = async () => {
    await signInWithFacebook();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'rgba(30,20,55,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(123,66,246,0.2)',
          color: '#fff',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        color: '#00ffc6',
        fontWeight: 600,
        pb: 0
      }}>
        Welcome to Canvas
        <IconButton
          onClick={onClose}
          sx={{ 
            color: '#fff',
            '&:hover': {
              color: '#00ffc6'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)', mb: 3 }}>
          <Tabs 
            value={mode} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#fff',
                '&.Mui-selected': {
                  color: '#00ffc6'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#00ffc6'
              }
            }}
          >
            <Tab label="Log In" />
            <Tab label="Sign Up" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Social Sign In Buttons */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{
              py: 1.5,
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                borderColor: '#00ffc6',
                backgroundColor: 'rgba(0,255,198,0.1)'
              }
            }}
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={handleFacebookSignIn}
            sx={{
              py: 1.5,
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                borderColor: '#1877F2',
                backgroundColor: 'rgba(24,119,242,0.1)'
              }
            }}
          >
            Continue with Facebook
          </Button>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            my: 2,
            '&::before, &::after': {
              content: '""',
              flex: 1,
              height: '1px',
              backgroundColor: 'rgba(255,255,255,0.2)'
            }
          }}>
            <Typography sx={{ px: 2, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              or
            </Typography>
          </Box>

          {/* Email/Password Form */}
          <TextField
            fullWidth
            label="Email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.4)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ffc6'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#00ffc6'
                }
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.2)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.4)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ffc6'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#00ffc6'
                }
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            sx={{
              py: 1.5,
              mt: 1,
              background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
              '&:hover': {
                background: 'linear-gradient(90deg, #00e6b3 0%, #6b39d6 100%)',
              }
            }}
          >
            {mode === 0 ? 'Log In' : 'Sign Up'}
          </Button>

          <Typography sx={{ 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            color: 'rgba(255,255,255,0.6)',
            mt: 2 
          }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;