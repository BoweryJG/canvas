import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { SystemAgent } from './types';

const ParticleContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'visible'
});

const Particle = styled(motion.div)(({ color }: { color: string }) => ({
  position: 'absolute',
  width: 4,
  height: 4,
  backgroundColor: color,
  borderRadius: '50%',
  filter: 'blur(1px)',
  opacity: 0.8
}));

interface AgentAvatarProps {
  agent: SystemAgent;
  size?: number;
  isActive?: boolean;
  showParticles?: boolean;
}

const AgentAvatar: React.FC<AgentAvatarProps> = ({
  agent,
  size = 48,
  isActive = false,
  showParticles = true
}) => {
  const particles = showParticles && isActive ? Array.from({ length: 6 }) : [];

  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      <motion.div
        animate={isActive ? {
          scale: [1, 1.05, 1],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Avatar
          sx={{
            width: size,
            height: size,
            background: `linear-gradient(135deg, ${agent.color} 0%, ${agent.color}dd 100%)`,
            boxShadow: isActive ? `0 0 20px ${agent.color}66` : 'none',
            border: `2px solid ${isActive ? 'white' : 'transparent'}`,
            transition: 'all 0.3s ease',
            fontSize: size * 0.4,
            fontWeight: 700
          }}
        >
          {agent.icon ? (
            <agent.icon sx={{ fontSize: size * 0.5 }} />
          ) : (
            agent.avatar
          )}
        </Avatar>
      </motion.div>

      {/* Orbiting Particles */}
      {showParticles && isActive && (
        <ParticleContainer>
          {particles.map((_, index) => {
            const angle = (index * 360) / particles.length;
            const radius = size * 0.7;
            
            return (
              <Particle
                key={index}
                color={agent.color}
                animate={{
                  x: [
                    Math.cos(angle * Math.PI / 180) * radius,
                    Math.cos((angle + 360) * Math.PI / 180) * radius
                  ],
                  y: [
                    Math.sin(angle * Math.PI / 180) * radius,
                    Math.sin((angle + 360) * Math.PI / 180) * radius
                  ],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  delay: index * 0.5
                }}
                style={{
                  left: size / 2 - 2,
                  top: size / 2 - 2
                }}
              />
            );
          })}
        </ParticleContainer>
      )}

      {/* Glow Effect */}
      {isActive && (
        <motion.div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: size * 1.5,
            height: size * 1.5,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${agent.color}22 0%, transparent 70%)`,
            pointerEvents: 'none'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </Box>
  );
};

export default AgentAvatar;