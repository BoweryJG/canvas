import React, { useState, useEffect } from 'react';
import App from './App';
import { useAuth } from './auth';
import { supabase } from './auth/supabase';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import AuthModal from './components/AuthModal';
import { motion } from 'framer-motion';
import LockIcon from '@mui/icons-material/Lock';
import { AutoAwesome } from '@mui/icons-material';

interface UserProfile {
  credits_remaining: number;
  subscription_tier: string;
}

function AppWithAuth() {
  const { user, loading: authLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    } else {
      setProfileLoading(false);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      // Check if user profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it with 10 free credits
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            credits_remaining: 10,
            subscription_tier: 'free',
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          setUserProfile(newProfile);
        }
      } else if (existingProfile) {
        setUserProfile(existingProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Loading state
  if (authLoading || (user && profileLoading)) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
      }}>
        <CircularProgress sx={{ color: '#00ffc6' }} />
      </Box>
    );
  }

  // Not authenticated - show login prompt
  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', color: 'white' }}>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                <LockIcon sx={{ 
                  fontSize: 80, 
                  color: '#00ffc6',
                  mb: 3,
                  filter: 'drop-shadow(0 0 20px rgba(0, 255, 198, 0.5))'
                }} />
              </motion.div>
              
              <Typography variant="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                Sign Up to Access Canvas
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.8 }}>
                Get 10 free scans to start • No credit card required
              </Typography>

              <Box sx={{ mb: 4 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setShowAuthModal(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #00ffc6 30%, #00d9ff 90%)',
                      color: '#0F172A',
                      px: 6,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0, 255, 198, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #00ffc6 60%, #00d9ff 90%)',
                        boxShadow: '0 6px 30px rgba(0, 255, 198, 0.4)',
                      }
                    }}
                  >
                    Get Started Free
                  </Button>
                </motion.div>
              </Box>

              <Typography variant="body2" sx={{ opacity: 0.6 }}>
                Already have an account? Click above to sign in
              </Typography>
            </Box>
          </motion.div>
        </Container>

        <AuthModal 
          open={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      </Box>
    );
  }

  // Check if user has credits
  if (userProfile && userProfile.credits_remaining <= 0) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <App />
        <Box sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}>
          <Alert 
            severity="warning" 
            sx={{ 
              background: 'rgba(255, 152, 0, 0.1)',
              border: '1px solid #ff9800',
              color: '#ff9800'
            }}
          >
            <Typography variant="body2">
              You've used all your free scans. Upgrade to continue scanning!
            </Typography>
          </Alert>
        </Box>
      </Box>
    );
  }

  // User is authenticated and has credits - show the app
  return <App />;
}

export default AppWithAuth;