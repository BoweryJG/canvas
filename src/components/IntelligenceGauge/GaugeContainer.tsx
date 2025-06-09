import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OuterAuthorityRing from './OuterAuthorityRing';
import ProgressRing from './ProgressRing';
import StatusRing from './StatusRing';
import CoreMeter from './CoreMeter';
import DataParticles from './DataParticles';
import './IntelligenceGauge.css';

interface IntelligenceGaugeProps {
  score: number;
  isScanning: boolean;
  scanStage?: string;
  onComplete?: () => void;
}

export const IntelligenceGauge: React.FC<IntelligenceGaugeProps> = ({
  score,
  isScanning,
  scanStage = '',
  onComplete
}) => {
  const [phase, setPhase] = useState<'idle' | 'initializing' | 'scanning' | 'analyzing' | 'locking' | 'complete'>('idle');
  const [internalScore, setInternalScore] = useState(0);

  useEffect(() => {
    if (isScanning) {
      // Start the animation sequence
      setPhase('initializing');
      
      // Phase transitions
      const timers = [
        setTimeout(() => setPhase('scanning'), 1000),
        setTimeout(() => setPhase('analyzing'), 5000),
        setTimeout(() => {
          setPhase('locking');
          setInternalScore(score);
        }, 6000),
        setTimeout(() => {
          setPhase('complete');
          onComplete?.();
        }, 7000)
      ];

      return () => timers.forEach(clearTimeout);
    } else {
      setPhase('idle');
      setInternalScore(score);
    }
  }, [isScanning, score, onComplete]);

  return (
    <div className="intelligence-gauge-container">
      <motion.div 
        className="intelligence-gauge"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Outer glow effect */}
        <div className={`gauge-glow ${phase === 'locking' ? 'pulse' : ''}`} />
        
        {/* Main gauge layers */}
        <div className="gauge-layers">
          <OuterAuthorityRing phase={phase} />
          <ProgressRing phase={phase} progress={internalScore} />
          <StatusRing phase={phase} scanStage={scanStage} />
          <CoreMeter 
            score={internalScore} 
            phase={phase}
            isHighValue={internalScore >= 80}
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