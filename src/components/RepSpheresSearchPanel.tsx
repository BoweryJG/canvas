import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AutoAwesome, 
  BusinessCenter,
  LocalHospital,
  LocationOn
} from '@mui/icons-material';
import { searchDoctorsByName, type NPIDoctor } from '../lib/npiLookup';
import BeveledPanel from './PremiumComponents/BeveledPanel';
import MetallicScrew from './PremiumComponents/MetallicScrew';
import EdgeIndicator from './PremiumComponents/EdgeIndicator';

interface Props {
  onScanStart: (doctorName: string, product: string, location?: string) => void;
  creditsRemaining: number | null;
  creditError?: string;
}

// Premium search container with RepSpheres styling
const SearchContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

// Hero section with animated title
const HeroSection = styled(Box)`
  text-align: center;
  margin-bottom: 60px;
  position: relative;
`;

const HeroTitle = styled(motion.h1)`
  font-size: 4rem;
  font-weight: 900;
  margin: 0 0 1rem 0;
  background: linear-gradient(
    135deg,
    #ffffff 0%,
    rgba(0, 212, 255, 1) 25%,
    rgba(0, 255, 225, 1) 50%,
    rgba(0, 255, 198, 1) 75%,
    #ffffff 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
  animation: gradientShift 8s ease infinite;
  
  @keyframes gradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(Typography)`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
  letter-spacing: 0.1em;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Animated jewel icon
const JewelIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  position: relative;
  
  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.5));
  }
`;

// Premium input field with glassmorphic effect
const PremiumTextField = styled(TextField)`
  & .MuiOutlinedInput-root {
    background: rgba(255, 255, 255, 0.03);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    transition: all 0.3s ease;
    
    & fieldset {
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }
    
    &:hover fieldset {
      border-color: rgba(0, 255, 198, 0.3);
    }
    
    &.Mui-focused fieldset {
      border-color: rgba(0, 255, 198, 0.5);
      border-width: 2px;
    }
    
    input {
      color: #ffffff;
      font-size: 1.1rem;
      padding: 20px 24px;
      
      &::placeholder {
        color: rgba(255, 255, 255, 0.5);
      }
    }
  }
  
  & .MuiInputLabel-root {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    
    &.Mui-focused {
      color: #00ffc6;
    }
  }
  
  & .MuiInputAdornment-root {
    color: rgba(255, 255, 255, 0.5);
  }
`;

// Launch button with forcefield effect
const LaunchButton = styled(Button)`
  position: relative;
  background: linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 1.2rem;
  padding: 16px 48px;
  border-radius: 50px;
  text-transform: none;
  box-shadow: 
    0 10px 40px rgba(0, 255, 198, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 15px 50px rgba(0, 255, 198, 0.4),
      inset 0 0 30px rgba(255, 255, 255, 0.3);
      
    &::before {
      left: 100%;
    }
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
    box-shadow: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    border: 2px solid;
    border-color: transparent #00D4FF transparent #00FFE1;
    border-radius: 50px;
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  &:hover:not(:disabled)::after {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
    animation: forcefieldRotate 2s linear infinite;
  }
  
  @keyframes forcefieldRotate {
    0% { transform: translate(-50%, -50%) scale(1.2) rotate(0deg); }
    100% { transform: translate(-50%, -50%) scale(1.2) rotate(360deg); }
  }
`;

// NPI result card
const NPIResultCard = styled(motion.div)`
  background: rgba(0, 255, 198, 0.05);
  border: 1px solid rgba(0, 255, 198, 0.2);
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #00ffc6, transparent);
    animation: scanLine 3s ease-in-out infinite;
  }
  
  @keyframes scanLine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const RepSpheresSearchPanel: React.FC<Props> = ({ 
  onScanStart, 
  creditsRemaining, 
  creditError 
}) => {
  const [doctorName, setDoctorName] = useState('');
  const [product, setProduct] = useState('');
  const [location, setLocation] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<NPIDoctor | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showNPIResult, setShowNPIResult] = useState(false);
  
  // Auto-search for NPI when doctor name is entered
  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (doctorName.length > 2) {
        setIsSearching(true);
        try {
          const results = await searchDoctorsByName(doctorName);
          if (results.length > 0) {
            setSelectedDoctor(results[0]);
            setShowNPIResult(true);
          }
        } catch (error) {
          console.error('NPI search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSelectedDoctor(null);
        setShowNPIResult(false);
      }
    }, 500);
    
    return () => clearTimeout(searchTimer);
  }, [doctorName, location]);
  
  const handleLaunchScan = () => {
    if (doctorName && product) {
      onScanStart(doctorName, product, location);
    }
  };
  
  const isReady = doctorName.length > 0 && product.length > 0;
  
  return (
    <SearchContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <HeroSection>
        <JewelIcon
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
            <defs>
              <radialGradient id="jewelGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="30%" stopColor="#00D4FF" stopOpacity="1" />
                <stop offset="60%" stopColor="#00FFE1" stopOpacity="1" />
                <stop offset="100%" stopColor="#00FFC6" stopOpacity="0.9" />
              </radialGradient>
            </defs>
            <polygon 
              points="40,5 60,25 60,55 40,75 20,55 20,25" 
              fill="url(#jewelGradient)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1"
            />
            <polygon 
              points="40,15 50,25 50,45 40,55 30,45 30,25" 
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="0.5"
            />
          </svg>
        </JewelIcon>
        
        <HeroTitle
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          RepSpheres Intelligence
        </HeroTitle>
        
        <HeroSubtitle>
          Enter doctor name and product to begin quantum analysis
        </HeroSubtitle>
      </HeroSection>
      
      <BeveledPanel elevation={3}>
        <Box sx={{ p: 4, position: 'relative' }}>
          {/* Decorative screws */}
          <MetallicScrew position="top-left" />
          <MetallicScrew position="top-right" />
          <MetallicScrew position="bottom-left" />
          <MetallicScrew position="bottom-right" />
          
          {/* Edge indicators */}
          <EdgeIndicator position="left" />
          <EdgeIndicator position="right" />
          
          {/* Input fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <PremiumTextField
              fullWidth
              label="Doctor Name"
              placeholder="Dr. Sarah Johnson"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LocalHospital sx={{ mr: 2, color: 'rgba(255,255,255,0.5)' }} />
                )
              }}
            />
            
            <PremiumTextField
              fullWidth
              label="Product"
              placeholder="Medical Device or Pharmaceutical"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              InputProps={{
                startAdornment: (
                  <BusinessCenter sx={{ mr: 2, color: 'rgba(255,255,255,0.5)' }} />
                )
              }}
            />
            
            <PremiumTextField
              fullWidth
              label="Location (Optional)"
              placeholder="City, State"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LocationOn sx={{ mr: 2, color: 'rgba(255,255,255,0.5)' }} />
                )
              }}
            />
          </Box>
          
          {/* NPI Result Display */}
          <AnimatePresence>
            {showNPIResult && selectedDoctor && (
              <NPIResultCard
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: '#00ffc6', mb: 0.5 }}>
                      {selectedDoctor.displayName}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedDoctor.specialty}
                    </Typography>
                  </Box>
                  <Chip 
                    label="NPI VERIFIED" 
                    size="small"
                    sx={{ 
                      background: '#00ffc6',
                      color: '#000',
                      fontWeight: 700
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      NPI Number
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff', fontFamily: 'monospace' }}>
                      {selectedDoctor.npi}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#fff' }}>
                      {selectedDoctor.city}, {selectedDoctor.state}
                    </Typography>
                  </Box>
                </Box>
              </NPIResultCard>
            )}
          </AnimatePresence>
          
          {/* Credits display */}
          {creditsRemaining !== null && (
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Credits remaining: {creditsRemaining}
              </Typography>
            </Box>
          )}
          
          {/* Error display */}
          {creditError && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,0,0,0.1)', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ color: '#ff6b6b' }}>
                {creditError}
              </Typography>
            </Box>
          )}
          
          {/* Launch button */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <LaunchButton
              variant="contained"
              size="large"
              disabled={!isReady || isSearching}
              onClick={handleLaunchScan}
              startIcon={<AutoAwesome />}
            >
              {isSearching ? 'Searching NPI...' : 'Launch Intelligence Scan'}
            </LaunchButton>
          </Box>
        </Box>
      </BeveledPanel>
    </SearchContainer>
  );
};

export default RepSpheresSearchPanel;