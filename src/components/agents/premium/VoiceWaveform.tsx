import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import premiumTheme from './styles/premium-theme';
import { waveformAnimation } from './styles/animations';
import { glassEffects } from './styles/glass-effects';

const WaveformContainer = styled('div')({
  padding: '20px',
  borderTop: `1px solid ${premiumTheme.colors.electricCyan}20`,
  ...glassEffects.premium,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '20px',
  height: '100px',
});

const WaveformDisplay = styled('div')({
  flex: 1,
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  padding: '0 20px',
});

const WaveBar = styled(motion.div)({
  width: '3px',
  background: premiumTheme.gradients.electricPulse,
  borderRadius: '2px',
  transformOrigin: 'center',
  boxShadow: `0 0 10px ${premiumTheme.colors.electricCyan}40`,
});

const VoiceButton = styled(motion.button)({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  border: 'none',
  background: premiumTheme.gradients.darkLuxury,
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  boxShadow: `
    0 4px 20px rgba(0, 0, 0, 0.5),
    inset 0 0 0 2px ${premiumTheme.colors.electricCyan}30
  `,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '4px',
    borderRadius: '50%',
    background: premiumTheme.gradients.electricPulse,
    opacity: 0,
    transition: `opacity ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  },
  
  '&.active::before': {
    opacity: 1,
  },
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `
      0 6px 30px rgba(0, 0, 0, 0.6),
      inset 0 0 0 2px ${premiumTheme.colors.electricCyan}60,
      0 0 30px ${premiumTheme.colors.electricCyan}30
    `,
  },
  
  '& svg': {
    width: '24px',
    height: '24px',
    color: premiumTheme.colors.watchDial,
    zIndex: 1,
    transition: `color ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  },
  
  '&.active svg': {
    color: premiumTheme.colors.deepBlack,
  },
});

const StatusText = styled('div')({
  fontSize: '12px',
  color: premiumTheme.colors.electricCyan,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  opacity: 0.8,
  minWidth: '100px',
  textAlign: 'center',
});

const PulseRing = styled(motion.div)({
  position: 'absolute',
  inset: '-10px',
  borderRadius: '50%',
  border: `2px solid ${premiumTheme.colors.electricCyan}`,
  pointerEvents: 'none',
});

interface VoiceWaveformProps {
  isListening: boolean;
  onToggleListening: () => void;
}

const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isListening,
  onToggleListening,
}) => {
  const barCount = 40;
  const bars = useMemo(() => {
    return Array.from({ length: barCount }, (_, i) => ({
      id: i,
      height: Math.random() * 40 + 20,
      delay: i * 0.05,
    }));
  }, [barCount]);
  
  return (
    <WaveformContainer>
      <StatusText>
        {isListening ? 'Listening...' : 'Tap to speak'}
      </StatusText>
      
      <WaveformDisplay>
        {bars.map((bar) => (
          <WaveBar
            key={bar.id}
            variants={waveformAnimation}
            initial="idle"
            animate={isListening ? "speaking" : "idle"}
            style={{ height: `${bar.height}px` }}
            transition={{
              delay: bar.delay,
              duration: 0.5,
              repeat: Infinity,
            }}
          />
        ))}
      </WaveformDisplay>
      
      <VoiceButton
        className={isListening ? 'active' : ''}
        onClick={onToggleListening}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isListening && (
          <PulseRing
            initial={{ scale: 1, opacity: 1 }}
            animate={{
              scale: [1, 1.3, 1.5],
              opacity: [1, 0.5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d={isListening 
              ? "M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              : "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            }
          />
        </svg>
      </VoiceButton>
    </WaveformContainer>
  );
};

export default VoiceWaveform;