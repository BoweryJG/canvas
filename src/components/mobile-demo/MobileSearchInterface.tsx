import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography, InputBase, Button, IconButton } from '@mui/material';
import { 
  Search, 
  AutoAwesome, 
  Mic,
  ArrowForward,
  Bolt
} from '@mui/icons-material';

const InterfaceContainer = styled(motion.div)({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  position: 'relative',
});

const LogoSection = styled(motion.div)({
  marginBottom: '40px',
  textAlign: 'center',
});

const CanvasLogo = styled(Typography)({
  fontSize: '48px',
  fontWeight: 800,
  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  letterSpacing: '-0.02em',
  marginBottom: '8px',
  '@media (min-width: 768px)': {
    fontSize: '56px',
  },
});

const Tagline = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '16px',
  fontWeight: 300,
  letterSpacing: '0.05em',
  '@media (min-width: 768px)': {
    fontSize: '18px',
  },
});

const SearchContainer = styled(motion.div)({
  width: '100%',
  maxWidth: '500px',
  position: 'relative',
});

const SearchInputWrapper = styled(Box)({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '2px solid rgba(0, 255, 198, 0.3)',
  borderRadius: '16px',
  padding: '8px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: 'rgba(0, 255, 198, 0.5)',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  '&:focus-within': {
    borderColor: '#00ffc6',
    background: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 0 30px rgba(0, 255, 198, 0.2)',
  },
});

const SearchInput = styled(InputBase)({
  flex: 1,
  '& input': {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 300,
    padding: '12px 0',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
    },
    '@media (min-width: 768px)': {
      fontSize: '20px',
    },
  },
});

const SearchButton = styled(motion(Button))({
  minWidth: '56px',
  height: '56px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
  color: '#1a1a2e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 20px rgba(0, 255, 198, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
    boxShadow: '0 6px 30px rgba(0, 255, 198, 0.4)',
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const VoiceButton = styled(IconButton)({
  color: 'rgba(255, 255, 255, 0.6)',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#00ffc6',
    background: 'rgba(0, 255, 198, 0.1)',
  },
  '&.active': {
    color: '#00ffc6',
    background: 'rgba(0, 255, 198, 0.2)',
  },
});

const SuggestionChip = styled(motion.div)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 16px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  color: 'rgba(255, 255, 255, 0.8)',
  fontSize: '14px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(0, 255, 198, 0.1)',
    borderColor: 'rgba(0, 255, 198, 0.3)',
    color: '#00ffc6',
    transform: 'translateY(-2px)',
  },
});

const PoweredBy = styled(Box)({
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: '12px',
});

const FloatingParticle = styled(motion.div)<{ size: number; color: string }>(({ size, color }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  opacity: 0.3,
  pointerEvents: 'none',
}));

interface MobileSearchInterfaceProps {
  onSearch: (query: string) => void;
}

const MobileSearchInterface: React.FC<MobileSearchInterfaceProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    inputRef.current?.focus();
  };

  const handleVoiceSearch = () => {
    setIsListening(!isListening);
    // In a real implementation, this would activate voice recognition
    console.log('Voice search toggled:', !isListening);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Background particles for ambiance
  const particles = Array.from({ length: 5 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    color: ['#00ffc6', '#7B42F6'][Math.floor(Math.random() * 2)],
  }));

  return (
    <InterfaceContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Background particles */}
      {particles.map(particle => (
        <FloatingParticle
          key={particle.id}
          size={particle.size}
          color={particle.color}
          initial={{ x: `${particle.x}%`, y: `${particle.y}%` }}
          animate={{
            x: [`${particle.x}%`, `${(particle.x + 30) % 100}%`, `${particle.x}%`],
            y: [`${particle.y}%`, `${(particle.y - 20) % 100}%`, `${particle.y}%`],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Logo and tagline */}
      <LogoSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <CanvasLogo>CANVAS</CanvasLogo>
        <Tagline>Healthcare Sales Intelligence</Tagline>
      </LogoSection>

      {/* Search interface */}
      <SearchContainer
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <SearchInputWrapper>
          <Search sx={{ color: '#00ffc6', fontSize: 28 }} />
          
          <SearchInput
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search any healthcare professional..."
            autoFocus
          />
          
          <VoiceButton
            onClick={handleVoiceSearch}
            className={isListening ? 'active' : ''}
            size="small"
          >
            <Mic />
          </VoiceButton>
          
          <SearchButton
            onClick={handleSearch}
            disabled={!searchQuery.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowForward sx={{ fontSize: 28 }} />
          </SearchButton>
        </SearchInputWrapper>

        {/* Quick search suggestions */}
        <Box sx={{ 
          mt: 3, 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1,
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px',
              mb: 1,
              width: '100%',
              textAlign: 'center'
            }}>
              Try searching:
            </Typography>
          </motion.div>
          
          {[
            'Oral Surgeons Buffalo',
            'Dr. Smith Dentist NYC',
            'Dermatologists Miami',
            'Plastic Surgeons LA'
          ].map((suggestion, index) => (
            <SuggestionChip
              key={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bolt sx={{ fontSize: 14 }} />
              {suggestion}
            </SuggestionChip>
          ))}
        </Box>
      </SearchContainer>

      {/* Powered by indicator */}
      <PoweredBy>
        <AutoAwesome sx={{ fontSize: 16 }} />
        <span>Powered by 300+ AI Models</span>
      </PoweredBy>
    </InterfaceContainer>
  );
};

export default MobileSearchInterface;