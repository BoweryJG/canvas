import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import premiumTheme from './styles/premium-theme';
import { deskMaterializeAnimation } from './styles/animations';
import { glassEffects, metallicEffects } from './styles/glass-effects';

const EnvironmentContainer = styled(motion.div)({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  perspective: '1000px',
});

const DeskSurface = styled(motion.div)({
  position: 'relative',
  width: '100%',
  maxWidth: '1000px',
  height: '500px',
  transformStyle: 'preserve-3d',
  transform: 'rotateX(5deg) scale(0.9)',
  margin: '0 auto',
});

const DeskTop = styled('div')({
  position: 'absolute',
  inset: 0,
  background: `linear-gradient(135deg,
    ${premiumTheme.colors.deepBlack} 0%,
    ${premiumTheme.colors.richBlack} 50%,
    ${premiumTheme.colors.executiveNavy}20 100%
  )`,
  borderRadius: '20px',
  overflow: 'hidden',
  boxShadow: `
    0 20px 40px rgba(0, 0, 0, 0.8),
    inset 0 0 100px rgba(0, 255, 198, 0.05)
  `,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(ellipse at center,
      ${premiumTheme.colors.electricCyan}05 0%,
      transparent 70%
    )`,
    opacity: 0.5,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '1px',
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
    borderRadius: '19px',
    backgroundSize: '200% 100%',
    animation: 'shimmer 8s linear infinite',
  },
});

const GlassPanel = styled('div')({
  position: 'absolute',
  top: '20px',
  left: '20px',
  right: '20px',
  height: '60px',
  ...glassEffects.premium,
  borderRadius: premiumTheme.borderRadius.medium,
  padding: '10px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const ChromeEdge = styled('div')({
  position: 'absolute',
  bottom: '-10px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  height: '10px',
  ...metallicEffects.chrome,
  borderRadius: '0 0 10px 10px',
  boxShadow: `
    0 10px 20px rgba(0, 0, 0, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2)
  `,
});

const LuxuryLamp = styled(motion.div)({
  position: 'absolute',
  top: '-80px',
  right: '80px',
  width: '50px',
  height: '160px',
  
  '@media (max-width: 768px)': {
    display: 'none',
  },
});

const LampBase = styled('div')({
  position: 'absolute',
  bottom: 0,
  width: '60px',
  height: '20px',
  ...metallicEffects.gold,
  borderRadius: '50%',
  boxShadow: '0 5px 15px rgba(212, 175, 55, 0.3)',
});

const LampStem = styled('div')({
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '4px',
  height: '120px',
  background: premiumTheme.gradients.executiveGold,
});

const LampShade = styled('div')({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '80px',
  height: '60px',
  background: `linear-gradient(180deg,
    ${premiumTheme.colors.richBlack} 0%,
    ${premiumTheme.colors.executiveNavy} 100%
  )`,
  clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
  boxShadow: `
    inset 0 -20px 40px ${premiumTheme.colors.electricCyan}20,
    0 20px 40px ${premiumTheme.colors.electricCyan}10
  `,
});

const HolographicDisplay = styled(motion.div)({
  position: 'absolute',
  top: '-120px',
  left: '50px',
  width: '180px',
  height: '120px',
  ...glassEffects.premium,
  borderRadius: premiumTheme.borderRadius.medium,
  padding: '16px',
  background: `linear-gradient(135deg,
    rgba(0, 255, 198, 0.05) 0%,
    rgba(0, 212, 255, 0.05) 100%
  )`,
  border: `1px solid ${premiumTheme.colors.electricCyan}30`,
  overflow: 'hidden',
  
  '@media (max-width: 768px)': {
    display: 'none',
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(0, 255, 198, 0.1) 50%, transparent 70%)',
    backgroundSize: '200% 200%',
    animation: 'holographicShift 5s ease infinite',
  },
});

const DataStream = styled('div')({
  fontSize: '10px',
  fontFamily: premiumTheme.typography.code.fontFamily,
  color: premiumTheme.colors.electricCyan,
  lineHeight: 1.4,
  opacity: 0.7,
  whiteSpace: 'pre',
  overflow: 'hidden',
  
  '& .line': {
    display: 'block',
    animation: 'floatAnimation 3s ease-in-out infinite',
    
    '&:nth-child(even)': {
      animationDelay: '0.5s',
      opacity: 0.5,
    },
  },
});

const ExecutiveAccessory = styled(motion.div)({
  position: 'absolute',
  bottom: '40px',
  right: '60px',
  width: '100px',
  height: '70px',
  
  '@media (max-width: 768px)': {
    display: 'none',
  },
});

const WatchDisplay = styled('div')({
  width: '100%',
  height: '100%',
  ...metallicEffects.chrome,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `
    0 10px 30px rgba(0, 0, 0, 0.5),
    inset 0 2px 4px rgba(255, 255, 255, 0.3)
  `,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '10px',
    borderRadius: '50%',
    background: premiumTheme.colors.watchDial,
    boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  
  '&::after': {
    content: '"12:00"',
    position: 'absolute',
    fontSize: '16px',
    fontWeight: 600,
    color: premiumTheme.colors.deepBlack,
    fontFamily: premiumTheme.typography.executive.fontFamily,
    zIndex: 1,
  },
});

const AmbientParticle = styled(motion.div)({
  position: 'absolute',
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  background: premiumTheme.colors.electricCyan,
  boxShadow: `0 0 10px ${premiumTheme.colors.electricCyan}`,
});

interface LuxuryDeskEnvironmentProps {
  isVisible: boolean;
  children?: React.ReactNode;
}

const LuxuryDeskEnvironment: React.FC<LuxuryDeskEnvironmentProps> = ({
  isVisible,
  children,
}) => {
  const particlePositions = [
    { x: 100, y: 50 },
    { x: 700, y: 100 },
    { x: 400, y: 300 },
    { x: 200, y: 250 },
    { x: 600, y: 200 },
  ];
  
  return (
    <EnvironmentContainer
      variants={deskMaterializeAnimation}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      <DeskSurface>
        <DeskTop>
          <GlassPanel>
            <div style={{ 
              fontSize: '14px', 
              color: premiumTheme.colors.electricCyan,
              fontFamily: premiumTheme.typography.technical.fontFamily,
              letterSpacing: '0.1em',
            }}>
              EXECUTIVE COMMAND CENTER
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: premiumTheme.colors.chromeAccent,
              opacity: 0.7,
            }}>
              {new Date().toLocaleTimeString()}
            </div>
          </GlassPanel>
          
          {particlePositions.map((pos, i) => (
            <AmbientParticle
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1, 0],
                x: [pos.x, pos.x + Math.random() * 50 - 25],
                y: [pos.y, pos.y - 50],
              }}
              transition={{
                duration: 3,
                delay: i * 0.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </DeskTop>
        
        <ChromeEdge />
        
        <LuxuryLamp
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <LampShade />
          <LampStem />
          <LampBase />
        </LuxuryLamp>
        
        <HolographicDisplay
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <DataStream>
            <span className="line">MARKET_ANALYSIS: ACTIVE</span>
            <span className="line">LEAD_SCORING: 98.7%</span>
            <span className="line">ENGAGEMENT_RATE: OPTIMAL</span>
            <span className="line">CONVERSION_PROBABILITY: HIGH</span>
            <span className="line">STRATEGY_OPTIMIZATION: ENABLED</span>
          </DataStream>
        </HolographicDisplay>
        
        <ExecutiveAccessory
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <WatchDisplay />
        </ExecutiveAccessory>
        
        {/* Agent placement area */}
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}>
          {children}
        </div>
      </DeskSurface>
    </EnvironmentContainer>
  );
};

export default LuxuryDeskEnvironment;