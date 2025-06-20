import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import premiumTheme from './styles/premium-theme';
import { particleAnimation } from './styles/animations';

const ParticleCanvas = styled('div')({
  position: 'absolute',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
});

const Particle = styled(motion.div)({
  position: 'absolute',
  borderRadius: '50%',
  pointerEvents: 'none',
});

// Particle types with different behaviors
const LightParticle = styled(Particle)({
  background: premiumTheme.colors.electricCyan,
  boxShadow: `0 0 20px ${premiumTheme.colors.electricCyan}`,
  filter: 'blur(1px)',
});

const GoldParticle = styled(Particle)({
  background: premiumTheme.colors.luxuryGold,
  boxShadow: `0 0 15px ${premiumTheme.colors.luxuryGold}`,
  filter: 'blur(0.5px)',
});

const HolographicParticle = styled(Particle)({
  background: `linear-gradient(45deg, 
    ${premiumTheme.colors.electricCyan} 0%, 
    ${premiumTheme.colors.holographicBlue} 50%, 
    ${premiumTheme.colors.electricCyan} 100%
  )`,
  boxShadow: `0 0 25px ${premiumTheme.colors.holographicBlue}`,
});

const DataStream = styled(motion.div)({
  position: 'absolute',
  width: '2px',
  background: `linear-gradient(180deg,
    transparent 0%,
    ${premiumTheme.colors.electricCyan}40 50%,
    transparent 100%
  )`,
  pointerEvents: 'none',
});

const EnergyRing = styled(motion.div)({
  position: 'absolute',
  borderRadius: '50%',
  border: `1px solid ${premiumTheme.colors.electricCyan}20`,
  pointerEvents: 'none',
});

interface ParticleEffectsProps {
  active?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({
  active = true,
  intensity = 'medium',
}) => {
  const particleCount = useMemo(() => {
    switch (intensity) {
      case 'low': return 15;
      case 'medium': return 30;
      case 'high': return 50;
      default: return 30;
    }
  }, [intensity]);
  
  const particles = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
      type: i % 3,
    }));
  }, [particleCount]);
  
  const dataStreams = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: 20 + i * 15,
      height: Math.random() * 100 + 50,
      duration: Math.random() * 2 + 3,
      delay: Math.random() * 1,
    }));
  }, []);
  
  const energyRings = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 100 + 50,
      duration: Math.random() * 3 + 4,
      delay: i * 0.5,
    }));
  }, []);
  
  if (!active) return null;
  
  return (
    <ParticleCanvas>
      {/* Floating particles */}
      {particles.map((particle) => {
        const ParticleComponent = 
          particle.type === 0 ? LightParticle :
          particle.type === 1 ? GoldParticle :
          HolographicParticle;
        
        return (
          <ParticleComponent
            key={particle.id}
            custom={particle.id}
            variants={particleAnimation}
            initial="hidden"
            animate="visible"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        );
      })}
      
      {/* Data streams */}
      {dataStreams.map((stream) => (
        <DataStream
          key={stream.id}
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            height: stream.height,
            y: [-50, 100],
          }}
          transition={{
            duration: stream.duration,
            delay: stream.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            left: `${stream.x}%`,
            top: '50%',
          }}
        />
      ))}
      
      {/* Energy rings */}
      {energyRings.map((ring) => (
        <EnergyRing
          key={ring.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 2, 3],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: ring.duration,
            delay: ring.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          style={{
            left: `${ring.x}%`,
            top: `${ring.y}%`,
            width: `${ring.size}px`,
            height: `${ring.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      
      {/* Ambient glow */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: `radial-gradient(circle,
            ${premiumTheme.colors.electricCyan}10 0%,
            transparent 50%
          )`,
          filter: 'blur(40px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Matrix rain effect */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${premiumTheme.colors.electricCyan}05 2px,
            ${premiumTheme.colors.electricCyan}05 4px
          )`,
          backgroundSize: '100% 100px',
          opacity: 0.3,
        }}
        animate={{
          backgroundPosition: ['0% 0%', '0% 100%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </ParticleCanvas>
  );
};

export default ParticleEffects;