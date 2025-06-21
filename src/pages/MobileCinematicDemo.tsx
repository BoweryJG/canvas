import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography, LinearProgress } from '@mui/material';
import MobileHunterNarrator from '../components/mobile-demo/MobileHunterNarrator';
import MobileDemoSequence from '../components/mobile-demo/MobileDemoSequence';
import MobileSearchInterface from '../components/mobile-demo/MobileSearchInterface';
import DemoControls from '../components/mobile-demo/DemoControls';

// Mobile-first styled components
const DemoContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  // Optimize for mobile performance
  '-webkit-transform': 'translateZ(0)',
  '-webkit-backface-visibility': 'hidden',
  '-webkit-perspective': 1000,
});

const ContentArea = styled(Box)({
  flex: 1,
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  maxWidth: '100%',
  margin: '0 auto',
  '@media (min-width: 768px)': {
    maxWidth: '600px',
  },
  '@media (min-width: 1024px)': {
    maxWidth: '800px',
  },
});

const ProgressBar = styled(LinearProgress)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '3px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '& .MuiLinearProgress-bar': {
    background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
  },
});

const SkipButton = styled(Typography)({
  position: 'absolute',
  top: '20px',
  right: '20px',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '14px',
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#00ffc6',
    backgroundColor: 'rgba(0, 255, 198, 0.1)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
});

// Demo stages
export type DemoStage = 
  | 'intro'
  | 'user-story'
  | 'search-demo'
  | 'scanning'
  | 'results'
  | 'data-showcase'
  | 'message-preview'
  | 'success'
  | 'interactive';

interface MobileCinematicDemoProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

const MobileCinematicDemo: React.FC<MobileCinematicDemoProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentStage, setCurrentStage] = useState<DemoStage>('intro');
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const stageTimeouts = useRef<NodeJS.Timeout[]>([]);

  // Demo timing configuration (in seconds)
  const stageDurations: Record<DemoStage, number> = {
    'intro': 3,
    'user-story': 5,
    'search-demo': 7,
    'scanning': 10,
    'results': 10,
    'data-showcase': 10,
    'message-preview': 5,
    'success': 5,
    'interactive': 0, // No auto-progress
  };

  const stages: DemoStage[] = [
    'intro',
    'user-story',
    'search-demo',
    'scanning',
    'results',
    'data-showcase',
    'message-preview',
    'success',
    'interactive',
  ];

  // Calculate total demo duration
  const totalDuration = Object.entries(stageDurations)
    .filter(([stage]) => stage !== 'interactive')
    .reduce((sum, [, duration]) => sum + duration, 0);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    stageTimeouts.current.forEach(timeout => clearTimeout(timeout));
    stageTimeouts.current = [];
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  // Progress to next stage
  const nextStage = useCallback(() => {
    const currentIndex = stages.indexOf(currentStage);
    if (currentIndex < stages.length - 1) {
      setCurrentStage(stages[currentIndex + 1]);
    }
  }, [currentStage]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Skip to interactive mode
  const skipToInteractive = useCallback(() => {
    clearTimeouts();
    setCurrentStage('interactive');
    setIsInteractive(true);
    setProgress(100);
    onSkip?.();
  }, [clearTimeouts, onSkip]);

  // Setup demo progression
  useEffect(() => {
    if (!isPlaying || currentStage === 'interactive') return;

    // Calculate accumulated time up to current stage
    let accumulatedTime = 0;
    for (let i = 0; i < stages.indexOf(currentStage); i++) {
      accumulatedTime += stageDurations[stages[i] as DemoStage];
    }

    // Update progress bar
    const startProgress = (accumulatedTime / totalDuration) * 100;
    const endProgress = ((accumulatedTime + stageDurations[currentStage]) / totalDuration) * 100;
    const progressStep = (endProgress - startProgress) / (stageDurations[currentStage] * 10);

    let currentProgress = startProgress;
    progressInterval.current = setInterval(() => {
      currentProgress += progressStep;
      if (currentProgress >= endProgress) {
        currentProgress = endProgress;
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      }
      setProgress(currentProgress);
    }, 100);

    // Schedule next stage
    const timeout = setTimeout(() => {
      if (currentStage === 'success') {
        skipToInteractive();
      } else {
        nextStage();
      }
    }, stageDurations[currentStage] * 1000);

    stageTimeouts.current.push(timeout);

    return () => {
      clearTimeouts();
    };
  }, [currentStage, isPlaying, nextStage, skipToInteractive, clearTimeouts, totalDuration]);

  // Handle visibility change (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPlaying(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <DemoContainer>
      {/* Progress bar */}
      {!isInteractive && (
        <ProgressBar variant="determinate" value={progress} />
      )}

      {/* Skip button */}
      {!isInteractive && (
        <SkipButton onClick={skipToInteractive}>
          Skip to Canvas →
        </SkipButton>
      )}

      {/* Main content area */}
      <ContentArea>
        <AnimatePresence mode="wait">
          {!isInteractive ? (
            <MobileDemoSequence
              currentStage={currentStage}
              isPlaying={isPlaying}
              prefersReducedMotion={prefersReducedMotion}
            />
          ) : (
            <MobileSearchInterface
              onSearch={(query) => {
                console.log('Search initiated:', query);
                onComplete?.();
              }}
            />
          )}
        </AnimatePresence>

        {/* The Hunter narrator */}
        {!isInteractive && (
          <MobileHunterNarrator
            currentStage={currentStage}
            isVisible={['intro', 'user-story', 'success'].includes(currentStage)}
          />
        )}
      </ContentArea>

      {/* Demo controls */}
      {!isInteractive && showControls && (
        <DemoControls
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
          onSkip={skipToInteractive}
          progress={progress}
        />
      )}

      {/* Touch to show controls */}
      {!isInteractive && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
            cursor: 'pointer',
          }}
          onClick={() => setShowControls(!showControls)}
        />
      )}
    </DemoContainer>
  );
};

export default MobileCinematicDemo;