import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, IconButton, LinearProgress } from '@mui/material';
import { PlayArrow, Pause, SkipNext } from '@mui/icons-material';

const ControlsContainer = styled(motion.div)({
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '12px 20px',
  background: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '40px',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
});

const ControlButton = styled(IconButton)({
  color: 'rgba(255, 255, 255, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#00ffc6',
    background: 'rgba(0, 255, 198, 0.1)',
    transform: 'scale(1.1)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
});

const PlayPauseButton = styled(ControlButton)({
  width: '48px',
  height: '48px',
  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
  color: '#1a1a2e',
  '&:hover': {
    background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
    color: '#1a1a2e',
    boxShadow: '0 0 20px rgba(0, 255, 198, 0.5)',
  },
});

const ProgressBarWrapper = styled(Box)({
  width: '120px',
  display: 'flex',
  alignItems: 'center',
});

const StyledProgress = styled(LinearProgress)({
  height: '4px',
  borderRadius: '2px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
    borderRadius: '2px',
  },
});

interface DemoControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip: () => void;
  progress: number;
}

const DemoControls: React.FC<DemoControlsProps> = ({
  isPlaying,
  onPlayPause,
  onSkip,
  progress,
}) => {
  return (
    <ControlsContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <PlayPauseButton onClick={onPlayPause}>
        {isPlaying ? <Pause /> : <PlayArrow />}
      </PlayPauseButton>
      
      <ProgressBarWrapper>
        <StyledProgress variant="determinate" value={progress} />
      </ProgressBarWrapper>
      
      <ControlButton onClick={onSkip}>
        <SkipNext />
      </ControlButton>
    </ControlsContainer>
  );
};

export default DemoControls;