import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  Divider,
  CircularProgress,
  keyframes,
  useTheme
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../auth';

// Animations
const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const SimpleLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmail, signUpWithEmail, signInWithProvider, user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderAuth = async (provider: 'google' | 'facebook') => {
    console.log(`SimpleLogin - handleProviderAuth called with provider: ${provider}`);
    setLoading(true);
    setError(null);
    
    try {
      console.log('SimpleLogin - calling signInWithProvider...');
      await signInWithProvider(provider);
      console.log('SimpleLogin - signInWithProvider completed, should redirect to OAuth provider');
      // OAuth redirect happens here, so navigate won't be called
    } catch (err: any) {
      console.error('SimpleLogin - OAuth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)'
        : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 2,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Floating Background Elements */}
      {[...Array(8)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: `${30 + i * 20}px`,
            height: `${30 + i * 20}px`,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${i % 2 === 0 ? '#00ffc6' : '#7B42F6'}20, transparent)`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `${float} ${4 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      ))}

      <Paper sx={{
        p: 4,
        maxWidth: 400,
        width: '100%',
        borderRadius: '24px',
        background: theme.palette.mode === 'dark'
          ? 'rgba(20,20,40,0.95)'
          : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        border: theme.palette.mode === 'dark'
          ? '1px solid rgba(123,66,246,0.3)'
          : '1px solid rgba(123,66,246,0.2)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Back Button */}
        <IconButton
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            color: theme.palette.mode === 'dark' ? '#fff' : '#333',
          }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Canvas Logo */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
          mt: 2
        }}>
          <Box sx={{
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '2px',
              borderRadius: '50%',
              background: theme.palette.mode === 'dark' 
                ? 'rgba(20,20,40,0.9)'
                : 'rgba(255,255,255,0.9)',
            }
          }}>
            <AutoAwesomeIcon sx={{ 
              fontSize: 32, 
              color: '#00ffc6',
              position: 'relative',
              zIndex: 1,
              animation: `${pulse} 2s ease-in-out infinite`
            }} />
          </Box>

          <Typography variant="h4" sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 100%',
            animation: `${shimmer} 3s ease-in-out infinite`,
            mb: 1
          }}>
            Canvas
          </Typography>

          <Typography variant="subtitle1" sx={{
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            textAlign: 'center',
            mb: 2
          }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {/* Social Login Buttons */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleProviderAuth('google')}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              '&:hover': {
                borderColor: '#4285f4',
                backgroundColor: 'rgba(66,133,244,0.1)',
              }
            }}
          >
            Continue with Google
          </Button>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<FacebookIcon />}
            onClick={() => handleProviderAuth('facebook')}
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: '12px',
              color: theme.palette.mode === 'dark' ? '#fff' : '#333',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              '&:hover': {
                borderColor: '#1877F2',
                backgroundColor: 'rgba(24,119,242,0.1)',
              }
            }}
          >
            Continue with Facebook
          </Button>
        </Box>

        <Divider sx={{ 
          mb: 3,
          '&::before, &::after': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }
        }}>
          <Typography sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
            fontSize: '0.875rem' 
          }}>
            or
          </Typography>
        </Divider>

        {/* Email/Password Form */}
        <Box component="form" onSubmit={handleEmailAuth} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ffc6'
                }
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                '&.Mui-focused': {
                  color: '#00ffc6'
                }
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                color: theme.palette.mode === 'dark' ? '#fff' : '#333',
                '& fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                },
                '&:hover fieldset': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#00ffc6'
                }
              },
              '& .MuiInputLabel-root': {
                color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                '&.Mui-focused': {
                  color: '#00ffc6'
                }
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              mt: 1,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
              fontWeight: 600,
              fontSize: '1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #00e6b3 0%, #6b39d6 100%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 8px 25px rgba(123,66,246,0.4)',
              },
              '&:disabled': {
                opacity: 0.7,
              }
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </Button>
        </Box>

        {/* Toggle Sign Up/Login */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography sx={{ 
            color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
            fontSize: '0.9rem' 
          }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </Typography>
          <Button
            onClick={() => setIsSignUp(!isSignUp)}
            sx={{
              mt: 1,
              color: '#00ffc6',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'rgba(0,255,198,0.1)',
              }
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Button>
        </Box>

        {/* Terms */}
        <Typography sx={{
          mt: 3,
          fontSize: '0.75rem',
          textAlign: 'center',
          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)',
          lineHeight: 1.4,
        }}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Typography>
      </Paper>
    </Box>
  );
};

export default SimpleLogin;