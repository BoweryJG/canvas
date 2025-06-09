import React from 'react';
import { motion } from 'framer-motion';

interface OuterAuthorityRingProps {
  phase: string;
}

const OuterAuthorityRing: React.FC<OuterAuthorityRingProps> = ({ phase }) => {
  const isActive = phase !== 'idle';
  
  return (
    <div className="outer-authority-ring">
      {/* Background ring */}
      <svg className="ring-svg" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="50%" stopColor="#1a2638" />
            <stop offset="100%" stopColor="#0a1628" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Outer ring */}
        <circle
          cx="200"
          cy="200"
          r="190"
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="20"
          opacity="0.8"
        />
        
        {/* Inner decorative ring */}
        <circle
          cx="200"
          cy="200"
          r="170"
          fill="none"
          stroke="#1a3a52"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>

      {/* Rotating text */}
      <motion.div
        className="authority-text-container"
        animate={{
          rotate: isActive ? 360 : 0
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <svg className="text-svg" viewBox="0 0 400 400">
          <defs>
            <path
              id="textCircle"
              d="M 200,200 m -175,0 a 175,175 0 1,1 350,0 a 175,175 0 1,1 -350,0"
            />
          </defs>
          <text className="authority-text" fill="#00ffc6" filter="url(#glow)">
            <textPath href="#textCircle" startOffset="0%">
              REPSPHERES INTELLIGENCE AUTHORITY • GLOBAL SCAN SYSTEMS • 
            </textPath>
          </text>
        </svg>
      </motion.div>

      {/* Tick marks around the ring */}
      <div className="tick-marks">
        {Array.from({ length: 72 }, (_, i) => (
          <div
            key={i}
            className="tick"
            style={{
              transform: `rotate(${i * 5}deg) translateY(-180px)`,
              opacity: phase === 'scanning' || phase === 'analyzing' ? 0.8 : 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default OuterAuthorityRing;