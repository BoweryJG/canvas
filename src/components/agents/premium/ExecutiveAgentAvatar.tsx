import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import premiumTheme from './styles/premium-theme';
import { agentEntranceAnimation, avatarIdleAnimation } from './styles/animations';
import { glassEffects, holographicEffects, glowEffects } from './styles/glass-effects';

const AvatarContainer = styled(motion.div)({
  position: 'relative',
  width: '280px',
  height: '400px',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
});

const ExecutiveFrame = styled('div')({
  position: 'relative',
  width: '100%',
  height: '100%',
  background: `linear-gradient(180deg, 
    ${premiumTheme.colors.deepBlack}00 0%, 
    ${premiumTheme.colors.deepBlack}40 50%,
    ${premiumTheme.colors.richBlack}80 100%
  )`,
  borderRadius: '20px 20px 0 0',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: premiumTheme.gradients.holographic,
    opacity: 0.1,
    backgroundSize: '400% 400%',
    animation: 'holographicShift 10s ease infinite',
  },
});

const HolographicGlow = styled('div')({
  position: 'absolute',
  inset: '-20px',
  background: `radial-gradient(circle at center, 
    ${premiumTheme.colors.electricCyan}20 0%, 
    transparent 70%
  )`,
  filter: 'blur(20px)',
  pointerEvents: 'none',
});

const AvatarFigure = styled('div')({
  position: 'absolute',
  bottom: 0,
  width: '220px',
  height: '350px',
  background: `linear-gradient(180deg,
    ${premiumTheme.colors.chromeAccent}20 0%,
    ${premiumTheme.colors.executiveNavy} 30%,
    ${premiumTheme.colors.deepBlack} 100%
  )`,
  borderRadius: '120px 120px 0 0',
  overflow: 'hidden',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(90deg,
      transparent 0%,
      ${premiumTheme.colors.electricCyan}10 50%,
      transparent 100%
    )`,
    opacity: 0,
    animation: 'shimmer 3s ease-in-out infinite',
  },
});

const HeadShape = styled('div')({
  position: 'absolute',
  top: '40px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '80px',
  height: '100px',
  background: `radial-gradient(ellipse at center,
    ${premiumTheme.colors.chromeAccent}40 0%,
    ${premiumTheme.colors.chromeAccent}20 100%
  )`,
  borderRadius: '50% 50% 60% 60%',
  boxShadow: `inset 0 -5px 10px rgba(0,0,0,0.3)`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60px',
    height: '2px',
    background: premiumTheme.colors.electricCyan,
    boxShadow: `0 0 10px ${premiumTheme.colors.electricCyan}`,
    opacity: 0.8,
  },
});

const Suit = styled('div')({
  position: 'absolute',
  bottom: 0,
  width: '100%',
  height: '200px',
  background: `linear-gradient(180deg,
    ${premiumTheme.colors.executiveNavy} 0%,
    ${premiumTheme.colors.deepBlack} 100%
  )`,
  clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '3px',
    height: '60%',
    background: `linear-gradient(180deg,
      ${premiumTheme.colors.luxuryGold} 0%,
      ${premiumTheme.colors.luxuryGold}40 100%
    )`,
  },
});

const Collar = styled('div')({
  position: 'absolute',
  top: '140px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100px',
  height: '40px',
  background: premiumTheme.colors.watchDial,
  clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '20px',
    height: '30px',
    background: `linear-gradient(180deg,
      ${premiumTheme.colors.luxuryGold} 0%,
      ${premiumTheme.colors.executiveNavy} 100%
    )`,
    clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
  },
});

const TechAccent = styled('div')({
  position: 'absolute',
  top: '180px',
  left: '20px',
  width: '30px',
  height: '4px',
  background: premiumTheme.colors.electricCyan,
  boxShadow: `0 0 10px ${premiumTheme.colors.electricCyan}`,
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '10px',
    width: '100%',
    height: '100%',
    background: 'inherit',
    boxShadow: 'inherit',
  },
});

const StatusBadge = styled(motion.div)({
  position: 'absolute',
  top: '20px',
  right: '20px',
  padding: '8px 16px',
  ...glassEffects.premium,
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  
  '& .dot': {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: premiumTheme.colors.successGreen,
    boxShadow: `0 0 10px ${premiumTheme.colors.successGreen}`,
  },
  
  '& .text': {
    fontSize: '12px',
    fontWeight: 500,
    color: premiumTheme.colors.electricCyan,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
});

const NamePlate = styled(motion.div)({
  position: 'absolute',
  bottom: '-40px',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '12px 24px',
  ...glassEffects.dark,
  borderRadius: premiumTheme.borderRadius.medium,
  border: `1px solid ${premiumTheme.colors.luxuryGold}30`,
  
  '& .name': {
    fontSize: '16px',
    fontWeight: 600,
    background: premiumTheme.gradients.executiveGold,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '0.05em',
  },
  
  '& .title': {
    fontSize: '12px',
    color: premiumTheme.colors.chromeAccent,
    textAlign: 'center',
    marginTop: '4px',
    letterSpacing: '0.1em',
  },
});

interface ExecutiveAgentAvatarProps {
  agentId: string;
  isActive?: boolean;
  onInteract?: () => void;
}

const ExecutiveAgentAvatar: React.FC<ExecutiveAgentAvatarProps> = ({
  agentId,
  isActive = false,
  onInteract,
}) => {
  const [agentName, setAgentName] = useState('Executive AI');
  const [agentTitle, setAgentTitle] = useState('Strategic Sales Advisor');
  const [isOnline, setIsOnline] = useState(true);
  
  // Map agent IDs to executive names and titles
  useEffect(() => {
    const agentProfiles: Record<string, { name: string; title: string }> = {
      strategist: {
        name: 'Alexander Sterling',
        title: 'Chief Strategy Officer'
      },
      qualifier: {
        name: 'Victoria Chen',
        title: 'Lead Qualification Expert'
      },
      closer: {
        name: 'Marcus Blackwell',
        title: 'Senior Closing Specialist'
      },
      researcher: {
        name: 'Dr. Elena Rodriguez',
        title: 'Market Intelligence Director'
      },
      objection_handler: {
        name: 'James Mitchell',
        title: 'Client Relations Executive'
      },
      relationship_builder: {
        name: 'Sophia Laurent',
        title: 'Partnership Development Lead'
      }
    };
    
    const profile = agentProfiles[agentId] || agentProfiles.strategist;
    setAgentName(profile.name);
    setAgentTitle(profile.title);
  }, [agentId]);
  
  return (
    <AvatarContainer
      variants={agentEntranceAnimation}
      initial="hidden"
      animate={isActive ? "visible" : "hidden"}
      whileHover={{ scale: 1.02 }}
      onClick={onInteract}
    >
      <HolographicGlow />
      
      <ExecutiveFrame>
        <motion.div
          animate={avatarIdleAnimation.animate}
          style={{ height: '100%' }}
        >
          <AvatarFigure>
            <HeadShape />
            <Collar />
            <Suit>
              <TechAccent />
              <TechAccent style={{ left: 'auto', right: '20px' }} />
            </Suit>
          </AvatarFigure>
        </motion.div>
        
        <StatusBadge
          animate={{ opacity: isOnline ? 1 : 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="dot"
            animate={{
              scale: isOnline ? [1, 1.2, 1] : 1,
              opacity: isOnline ? [1, 0.8, 1] : 0.3,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className="text">{isOnline ? 'Online' : 'Offline'}</span>
        </StatusBadge>
      </ExecutiveFrame>
      
      <NamePlate
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <div className="name">{agentName}</div>
        <div className="title">{agentTitle}</div>
      </NamePlate>
    </AvatarContainer>
  );
};

export default ExecutiveAgentAvatar;