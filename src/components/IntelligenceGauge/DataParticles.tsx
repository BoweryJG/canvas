import React from 'react';
import { motion } from 'framer-motion';

interface DataParticlesProps {
  phase: string;
}

const DataParticles: React.FC<DataParticlesProps> = ({ phase }) => {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    angle: (i * 30) + Math.random() * 15,
    radius: 140 + Math.random() * 40,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2
  }));

  return (
    <div className="data-particles">
      {particles.map((particle) => {
        const startX = 200 + particle.radius * Math.cos((particle.angle * Math.PI) / 180);
        const startY = 200 + particle.radius * Math.sin((particle.angle * Math.PI) / 180);
        
        return (
          <motion.div
            key={particle.id}
            className="data-particle"
            initial={{
              x: startX - 200,
              y: startY - 200,
              opacity: 0,
              scale: 0
            }}
            animate={{
              x: [
                startX - 200,
                startX - 200 + Math.random() * 20 - 10,
                startX - 200
              ],
              y: [
                startY - 200,
                startY - 200 + Math.random() * 20 - 10,
                startY - 200
              ],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0]
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="particle-core">
              <div className="particle-glow" />
            </div>
            
            {/* Data trail */}
            <motion.div
              className="particle-trail"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.div>
        );
      })}

      {/* Orbital paths */}
      <svg className="orbital-paths" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ffc6" stopOpacity="0" />
            <stop offset="50%" stopColor="#00ffc6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#00ffc6" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {[140, 160, 180].map((radius, i) => (
          <motion.circle
            key={i}
            cx="200"
            cy="200"
            r={radius}
            fill="none"
            stroke="url(#orbitGradient)"
            strokeWidth="1"
            strokeDasharray="5 10"
            opacity={0.3}
            animate={{
              strokeDashoffset: [-15, 0],
              opacity: phase === 'analyzing' ? 0.5 : 0.3
            }}
            transition={{
              strokeDashoffset: {
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear"
              },
              opacity: { duration: 0.3 }
            }}
          />
        ))}
      </svg>

      {/* Data streams */}
      {phase === 'analyzing' && (
        <div className="data-streams">
          {Array.from({ length: 4 }, (_, i) => (
            <motion.div
              key={i}
              className="data-stream"
              style={{
                transform: `rotate(${i * 90}deg)`
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scaleY: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DataParticles;