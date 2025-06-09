import React from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  phase: string;
  progress: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ phase, progress }) => {
  const radius = 150;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="progress-ring">
      <motion.svg
        className="progress-svg"
        viewBox="0 0 400 400"
        animate={{
          rotate: phase === 'scanning' ? -360 : 0
        }}
        transition={{
          duration: 10,
          repeat: phase === 'scanning' ? Infinity : 0,
          ease: "linear"
        }}
      >
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffc6" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#00ffc6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7B42F6" stopOpacity="0.4" />
          </linearGradient>
          <filter id="progressGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke="#1a3a52"
          strokeWidth="3"
          opacity="0.3"
        />

        {/* Progress circle */}
        <motion.circle
          cx="200"
          cy="200"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 200 200)"
          filter="url(#progressGlow)"
          animate={{
            strokeDashoffset: phase !== 'idle' ? strokeDashoffset : circumference,
            opacity: phase === 'idle' ? 0.3 : 1
          }}
          transition={{
            strokeDashoffset: { duration: 0.5, ease: "easeOut" },
            opacity: { duration: 0.3 }
          }}
        />

        {/* Progress indicators */}
        {Array.from({ length: 36 }, (_, i) => {
          const angle = (i * 10) - 90;
          const x1 = 200 + (radius - 10) * Math.cos(angle * Math.PI / 180);
          const y1 = 200 + (radius - 10) * Math.sin(angle * Math.PI / 180);
          const x2 = 200 + (radius - 5) * Math.cos(angle * Math.PI / 180);
          const y2 = 200 + (radius - 5) * Math.sin(angle * Math.PI / 180);
          
          const isActive = (i * 10) / 3.6 <= progress;
          
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? "#00ffc6" : "#1a3a52"}
              strokeWidth="2"
              animate={{
                opacity: phase === 'idle' ? 0.3 : isActive ? 1 : 0.5,
                scale: phase === 'locking' && isActive ? 1.2 : 1
              }}
              transition={{
                duration: 0.3,
                delay: phase === 'locking' ? i * 0.02 : 0
              }}
            />
          );
        })}
      </motion.svg>

      {/* Decorative elements */}
      <div className="progress-decorations">
        {phase === 'analyzing' && (
          <>
            <motion.div
              className="scan-line"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="scan-line secondary"
              animate={{
                rotate: [0, -360]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;