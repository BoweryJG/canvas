import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import LoginModal from '../components/LoginModal';
import SignUpModal from '../components/SignUpModal';
import LogoutModal from '../components/LogoutModal';
import { useAuth } from '../auth';

const TestAuthModals: React.FC = () => {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user } = useAuth();

  const handleAuthSuccess = () => {
    console.log('Authentication successful!');
    // Refresh the page to update auth state
    window.location.reload();
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      p: 4
    }}>
      <Typography variant="h3" sx={{ color: 'white', mb: 4 }}>
        Test RepSpheres Auth Modals
      </Typography>
      
      <Typography sx={{ color: 'white', mb: 2 }}>
        Current User: {user ? user.email : 'Not logged in'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={() => setLoginOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #9f58fa 0%, #4B96DC 100%)',
            color: 'white',
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: '12px',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(159, 88, 250, 0.3)',
            }
          }}
        >
          Test Login Modal
        </Button>

        <Button
          variant="contained"
          onClick={() => setSignupOpen(true)}
          sx={{
            background: 'linear-gradient(135deg, #ff00aa 0%, #00d4ff 100%)',
            color: 'white',
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: '12px',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(255, 0, 170, 0.3)',
            }
          }}
        >
          Test Sign Up Modal
        </Button>

        <Button
          variant="contained"
          onClick={() => setLogoutOpen(true)}
          disabled={!user}
          sx={{
            background: 'linear-gradient(135deg, #ff4444 0%, #ff6b35 100%)',
            color: 'white',
            px: 4,
            py: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
            borderRadius: '12px',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(255, 68, 68, 0.3)',
            },
            '&:disabled': {
              opacity: 0.5,
            }
          }}
        >
          Test Logout Modal
        </Button>
      </Box>

      <Typography sx={{ 
        color: 'white', 
        mt: 4, 
        textAlign: 'center',
        maxWidth: '600px',
        opacity: 0.8
      }}>
        Click any button above to test the RepSpheres authentication modals. 
        The modals include Google and Facebook OAuth integration.
      </Typography>

      {/* Modals */}
      <LoginModal 
        isOpen={loginOpen} 
        onClose={() => setLoginOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <SignUpModal 
        isOpen={signupOpen} 
        onClose={() => setSignupOpen(false)}
        onSuccess={handleAuthSuccess}
      />
      <LogoutModal 
        isOpen={logoutOpen} 
        onClose={() => setLogoutOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </Box>
  );
};

export default TestAuthModals;