import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OuterAuthorityRing from './OuterAuthorityRing';
import ProgressRing from './ProgressRing';
import StatusRing from './StatusRing';
import CoreMeter from './CoreMeter';
import DataParticles from './DataParticles';
import DataStreamWindow from './DataStreamWindow';
import './IntelligenceGauge.css';

interface IntelligenceGaugeProps {
  score: number;
  isScanning: boolean;
  scanStage?: string;
  progress?: number; // New prop for real-time progress (0-100)
  onComplete?: () => void;
  fullScreen?: boolean; // For deep research mode
  onTap?: () => void; // Mobile interaction
}

export const IntelligenceGauge: React.FC<IntelligenceGaugeProps> = ({
  score,
  isScanning,
  scanStage = '',
  progress = 0,
  onComplete,
  fullScreen = false,
  onTap
}) => {
  const [phase, setPhase] = useState<'idle' | 'initializing' | 'scanning' | 'analyzing' | 'locking' | 'complete'>('idle');
  const [internalScore, setInternalScore] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [scoreTheme, setScoreTheme] = useState<'developing' | 'promising' | 'high-value' | 'critical'>('developing');

  // Update display progress with smooth animation
  useEffect(() => {
    setDisplayProgress(progress);
  }, [progress]);

  // Determine score theme based on score value
  useEffect(() => {
    if (score < 40) {
      setScoreTheme('developing');
    } else if (score < 70) {
      setScoreTheme('promising');
    } else if (score < 85) {
      setScoreTheme('high-value');
    } else {
      setScoreTheme('critical');
    }
  }, [score]);

  // Trigger haptic feedback on mobile
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy') => {
    // Visual feedback first
    const container = document.querySelector('.intelligence-gauge-container') as HTMLElement;
    if (container) {
      container.classList.remove('haptic-light', 'haptic-medium', 'haptic-heavy');
      void container.offsetWidth; // Force reflow
      container.classList.add(`haptic-${type}`);
      setTimeout(() => {
        container.classList.remove(`haptic-${type}`);
      }, 1000);
    }
    
    // Physical vibration
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate([50, 50, 50]);
          break;
      }
    }
  };

  useEffect(() => {
    if (isScanning) {
      // Determine phase based on progress
      if (progress < 10) {
        setPhase('initializing');
        if (progress === 0) triggerHaptic('light');
      } else if (progress < 85) {
        setPhase('scanning');
        // Haptic feedback every 25%
        if (progress % 25 === 0) triggerHaptic('light');
      } else if (progress < 95) {
        setPhase('analyzing');
        triggerHaptic('medium');
      } else if (progress < 100) {
        setPhase('locking');
        setInternalScore(score);
      } else if (progress >= 100) {
        setPhase('complete');
        setInternalScore(score);
        triggerHaptic('heavy');
        onComplete?.();
      }
    } else {
      setPhase('idle');
      setInternalScore(score);
      setDisplayProgress(0);
    }
  }, [isScanning, progress, score, onComplete]);

  return (
    <div 
      className={`intelligence-gauge-container ${isScanning ? 'scanning-active' : ''} ${fullScreen ? 'full-screen' : ''} theme-${scoreTheme}`}
      onClick={onTap}
    >
      <motion.div 
        className="intelligence-gauge"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer glow effect */}
        <div className={`gauge-glow ${phase === 'locking' ? 'pulse' : ''}`} />
        
        {/* Haptic feedback indicator */}
        <div className="haptic-pulse" />
        
        {/* Main gauge layers */}
        <div className={`gauge-layers phase-${phase}`}>
          <OuterAuthorityRing phase={phase} />
          <ProgressRing phase={phase} progress={displayProgress} />
          <StatusRing phase={phase} scanStage={scanStage} />
          
          {/* Data Stream Window - shows what we're analyzing */}
          <DataStreamWindow 
            isActive={phase === 'scanning' || phase === 'analyzing' || phase === 'initializing'}
            scanStage={scanStage}
          />
          
          <CoreMeter 
            score={internalScore} 
            phase={phase}
            isHighValue={internalScore >= 80}
            progress={displayProgress}
            scanStage={scanStage}
          />
          
          {/* Data particles during scan */}
          <AnimatePresence>
            {(phase === 'scanning' || phase === 'analyzing') && (
              <DataParticles phase={phase} />
            )}
          </AnimatePresence>
        </div>

        {/* Phase indicators */}
        <div className="phase-indicators">
          {phase === 'initializing' && (
            <motion.div
              className="phase-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              SYSTEMS INITIALIZING
            </motion.div>
          )}
          {phase === 'analyzing' && (
            <motion.div
              className="phase-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              ANALYZING INTELLIGENCE
            </motion.div>
          )}
          {phase === 'locking' && (
            <motion.div
              className="phase-text pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              TARGET LOCKED
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};