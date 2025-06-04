/**
 * Integrated Canvas Experience
 * Combines instant cinematic scan with progressive data loading
 */

import { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bolt, AutoAwesome } from '@mui/icons-material';
import SimpleCinematicScan from './SimpleCinematicScan';
import SimpleProgressiveResults from './SimpleProgressiveResults';
import { useAuth } from '../auth';
import { checkUserCredits, deductCredit } from '../lib/creditManager';

const GradientBackground = styled(Box)`
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at 20% 50%, #1a0033 0%, #000000 100%);
  z-index: -1;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 80% 20%, rgba(123, 66, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 20% 80%, rgba(0, 255, 198, 0.1) 0%, transparent 50%);
  }
`;

const SearchContainer = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.5),
    inset 0 0 50px rgba(255, 255, 255, 0.05);
`;

const StyledTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    color: #fff;
    
    & fieldset {
      border-color: rgba(255, 255, 255, 0.2);
    }
    
    &:hover fieldset {
      border-color: rgba(0, 255, 198, 0.5);
    }
    
    &.Mui-focused fieldset {
      border-color: #00ffc6;
    }
  }
  
  & .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
  }
  
  & .MuiInputLabel-root.Mui-focused {
    color: #00ffc6;
  }
`;

const LaunchButton = styled(Button)`
  background: linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%);
  color: #fff;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 12px 40px;
  border-radius: 50px;
  text-transform: none;
  box-shadow: 
    0 10px 30px rgba(0, 255, 198, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 
      0 15px 40px rgba(0, 255, 198, 0.4),
      inset 0 0 30px rgba(255, 255, 255, 0.3);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
  }
`;

export default function IntegratedCanvasExperience() {
  const [doctor, setDoctor] = useState('');
  const [product, setProduct] = useState('');
  const [location, setLocation] = useState('');
  const [stage, setStage] = useState<'input' | 'scanning' | 'results'>('input');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [showCreditAlert, setShowCreditAlert] = useState(false);
  const [creditError, setCreditError] = useState('');
  const { user } = useAuth();
  const userTier = user?.subscription?.tier || 'free';
  
  // Check credits on component mount
  useEffect(() => {
    const loadCredits = async () => {
      if (user) {
        const creditCheck = await checkUserCredits(user.id);
        setCreditsRemaining(creditCheck.creditsRemaining);
      }
    };
    loadCredits();
  }, [user]);
  
  const handleLaunchScan = async () => {
    if (!doctor || !product || !user) return;
    
    // Check credits before scanning
    const creditCheck = await checkUserCredits(user.id);
    setCreditsRemaining(creditCheck.creditsRemaining);
    
    if (!creditCheck.hasCredits) {
      setCreditError('You have no credits remaining. Please upgrade your plan to continue scanning.');
      setShowCreditAlert(true);
      return;
    }
    
    // Deduct credit and start scan
    const deducted = await deductCredit(user.id);
    if (!deducted) {
      setCreditError('Failed to process scan. Please try again.');
      setShowCreditAlert(true);
      return;
    }
    
    setCreditsRemaining(creditCheck.creditsRemaining - 1);
    setStage('scanning');
    // SimpleCinematicScan will call onComplete when done
  };
  
  const handleUpgrade = () => {
    console.log('Upgrade clicked');
    // Handle upgrade flow
  };
  
  const renderInputStage = () => (
    <Container maxWidth="md" sx={{ pt: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            <AutoAwesome sx={{ 
              fontSize: 80, 
              color: '#00ffc6',
              mb: 2,
              filter: 'drop-shadow(0 0 20px rgba(0, 255, 198, 0.5))'
            }} />
          </motion.div>
          
          <Typography variant="h2" sx={{ 
            color: '#fff',
            fontWeight: 800,
            mb: 2,
            background: 'linear-gradient(90deg, #fff 0%, #00ffc6 50%, #7B42F6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '200% 100%',
            animation: 'gradient 3s ease infinite',
            '@keyframes gradient': {
              '0%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
              '100%': { backgroundPosition: '0% 50%' }
            }
          }}>
            CANVAS
          </Typography>
          
          <Typography variant="h5" sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: 300,
            letterSpacing: '0.1em'
          }}>
            AI-POWERED SALES INTELLIGENCE
          </Typography>
        </Box>
        
        <SearchContainer>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <StyledTextField
              fullWidth
              label="Doctor Name"
              placeholder="e.g., Dr. John Smith"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: '#00ffc6', mr: 1 }} />
              }}
            />
            
            <StyledTextField
              fullWidth
              label="Product / Company"
              placeholder="e.g., Medical Device X"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              InputProps={{
                startAdornment: <Bolt sx={{ color: '#7B42F6', mr: 1 }} />
              }}
            />
            
            <StyledTextField
              fullWidth
              label="Location (Optional)"
              placeholder="e.g., New York, NY"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            
            <LaunchButton
              fullWidth
              size="large"
              onClick={handleLaunchScan}
              disabled={!doctor || !product}
            >
              LAUNCH INTELLIGENCE SCAN
            </LaunchButton>
            
            {creditsRemaining !== null && (
              <Typography variant="caption" sx={{ 
                display: 'block',
                mt: 1,
                color: creditsRemaining > 3 ? '#00ffc6' : '#ff9800',
                textAlign: 'center'
              }}>
                {creditsRemaining} scans remaining
              </Typography>
            )}
          </Box>
          
          {userTier === 'free' && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 215, 0, 0.3)'
            }}>
              <Typography variant="body2" sx={{ color: '#FFD700', textAlign: 'center' }}>
                🚀 Upgrade to Pro for 5x faster scans and deep intelligence
              </Typography>
            </Box>
          )}
        </SearchContainer>
        
        {/* Feature highlights */}
        <Box sx={{ 
          mt: 6, 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 3
        }}>
          {[
            { icon: '⚡', title: 'Instant Results', desc: 'See intelligence in seconds' },
            { icon: '🧠', title: 'Deep Analysis', desc: 'AI-powered insights' },
            { icon: '🎯', title: 'Precision Targeting', desc: 'Hyper-personalized outreach' },
            { icon: '📈', title: '10x Conversion', desc: 'Proven sales acceleration' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.5 }}
            >
              <Box sx={{
                p: 3,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: '#00ffc6',
                  transform: 'translateY(-5px)'
                }
              }}>
                <Typography variant="h2" sx={{ mb: 1 }}>{feature.icon}</Typography>
                <Typography variant="h6" sx={{ color: '#fff', mb: 0.5 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  {feature.desc}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </motion.div>
    </Container>
  );
  
  const renderResults = () => (
    <Container maxWidth="lg" sx={{ pt: 4 }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ 
            color: '#fff',
            fontWeight: 700,
            mb: 1
          }}>
            Intelligence Report
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Dr. {doctor} • {product} • {location || 'Location not specified'}
          </Typography>
        </Box>
        
        <SimpleProgressiveResults
          doctorName={doctor}
          userTier={userTier}
          onUpgradeClick={handleUpgrade}
        />
      </motion.div>
    </Container>
  );
  
  return (
    <>
      <GradientBackground />
      <AnimatePresence mode="wait">
        {stage === 'input' && renderInputStage()}
        {stage === 'scanning' && (
          <SimpleCinematicScan
            doctorName={doctor}
            location={location}
            onComplete={() => setStage('results')}
          />
        )}
        {stage === 'results' && renderResults()}
      </AnimatePresence>
      
      <Snackbar
        open={showCreditAlert}
        autoHideDuration={6000}
        onClose={() => setShowCreditAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowCreditAlert(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {creditError}
        </Alert>
      </Snackbar>
    </>
  );
}