import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StatusRingProps {
  phase: string;
  scanStage?: string;
}

const StatusRing: React.FC<StatusRingProps> = ({ phase, scanStage }) => {
  const getStatusText = () => {
    switch (phase) {
      case 'initializing':
        return 'INTELLIGENCE SYSTEMS ONLINE';
      case 'scanning':
        return 'GLOBAL SCAN ACTIVE';
      case 'analyzing':
        return 'PROCESSING INTELLIGENCE DATA';
      case 'locking':
        return 'TARGET ALIGNMENT CONFIRMED';
      case 'complete':
        return 'ANALYSIS COMPLETE';
      default:
        return 'SYSTEMS READY';
    }
  };

  const isActive = phase !== 'idle';

  return (
    <div className="status-ring">
      {/* Inner status ring */}
      <svg className="status-svg" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="statusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffc6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#00ffc6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ffc6" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Status ring background */}
        <circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="url(#statusGradient)"
          strokeWidth="2"
          opacity={isActive ? 0.8 : 0.3}
        />

        {/* Animated status ring */}
        <motion.circle
          cx="200"
          cy="200"
          r="120"
          fill="none"
          stroke="#00ffc6"
          strokeWidth="1"
          strokeDasharray="10 5"
          opacity={isActive ? 0.6 : 0}
          animate={{
            strokeDashoffset: isActive ? -15 : 0
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </svg>

      {/* Status text */}
      <div className="status-text-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            className="status-text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {getStatusText()}
          </motion.div>
        </AnimatePresence>

        {/* Additional scan stage info */}
        {scanStage && phase === 'scanning' && (
          <motion.div
            className="scan-stage-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.3 }}
          >
            {scanStage}
          </motion.div>
        )}
      </div>

      {/* Status indicators */}
      <div className="status-indicators">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="status-indicator"
            style={{
              transform: `rotate(${i * 45}deg) translateY(-110px)`
            }}
            animate={{
              opacity: isActive ? [0.3, 1, 0.3] : 0.1,
              scale: phase === 'locking' ? [1, 1.5, 1] : 1
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          >
            <div className="indicator-dot" />
          </motion.div>
        ))}
      </div>

      {/* Phase-specific effects */}
      {phase === 'locking' && (
        <motion.div
          className="lock-pulse"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{
            duration: 1,
            repeat: 3,
            ease: "easeOut"
          }}
        />
      )}
    </div>
  );
};

export default StatusRing;