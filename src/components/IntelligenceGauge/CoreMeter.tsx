import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CoreMeterProps {
  score: number;
  phase: string;
  isHighValue: boolean;
}

const CoreMeter: React.FC<CoreMeterProps> = ({ score, phase, isHighValue }) => {
  const needleAngle = -135 + (score / 100) * 270;
  const displayScore = phase === 'idle' || phase === 'complete' || phase === 'locking' ? score : 0;

  return (
    <div className="core-meter">
      {/* Core background */}
      <div className="core-background">
        <svg viewBox="0 0 400 400" className="core-svg">
          <defs>
            <radialGradient id="coreGradient">
              <stop offset="0%" stopColor="#001122" />
              <stop offset="70%" stopColor="#002244" />
              <stop offset="100%" stopColor="#003366" />
            </radialGradient>
            <filter id="coreGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Core circle */}
          <circle
            cx="200"
            cy="200"
            r="90"
            fill="url(#coreGradient)"
            stroke="#00ffc6"
            strokeWidth="2"
            opacity="0.9"
            filter={isHighValue ? "url(#coreGlow)" : ""}
          />

          {/* Inner decorative rings */}
          <circle
            cx="200"
            cy="200"
            r="85"
            fill="none"
            stroke="#1a4a6a"
            strokeWidth="1"
            opacity="0.5"
          />
          <circle
            cx="200"
            cy="200"
            r="75"
            fill="none"
            stroke="#1a4a6a"
            strokeWidth="0.5"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Needle */}
      <motion.div
        className="gauge-needle-container"
        animate={{
          rotate: phase === 'scanning' || phase === 'analyzing' 
            ? [needleAngle - 45, needleAngle + 45, needleAngle - 45]
            : needleAngle
        }}
        transition={{
          rotate: phase === 'scanning' || phase === 'analyzing'
            ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
            : { duration: 1, ease: "easeOut" }
        }}
      >
        <div className="gauge-needle">
          <div className="needle-glow" />
        </div>
      </motion.div>

      {/* Center pivot */}
      <div className="gauge-center-pivot">
        <motion.div
          className="pivot-core"
          animate={{
            scale: phase === 'locking' ? [1, 1.2, 1] : 1,
            boxShadow: isHighValue 
              ? ['0 0 20px #00ffc6', '0 0 40px #00ffc6', '0 0 20px #00ffc6']
              : '0 0 10px #00ffc6'
          }}
          transition={{
            duration: 0.5,
            repeat: phase === 'locking' ? 3 : 0
          }}
        />
      </div>

      {/* Score display */}
      <div className="score-display">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayScore}
            className="score-value"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            transition={{ duration: 0.3 }}
          >
            <span className="score-number">{displayScore}</span>
            <span className="score-percent">%</span>
          </motion.div>
        </AnimatePresence>

        <motion.div
          className="score-label"
          animate={{
            opacity: phase === 'idle' ? 0.5 : 1
          }}
        >
          TARGET ALIGNMENT
        </motion.div>

        {phase === 'complete' && (
          <motion.div
            className="score-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {isHighValue ? 'IN SYNC' : 'CALIBRATED'}
          </motion.div>
        )}
      </div>

      {/* Phase-specific effects */}
      {phase === 'scanning' && (
        <motion.div
          className="scan-sweep"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      )}

      {phase === 'locking' && isHighValue && (
        <motion.div
          className="high-value-burst"
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}
    </div>
  );
};

export default CoreMeter;