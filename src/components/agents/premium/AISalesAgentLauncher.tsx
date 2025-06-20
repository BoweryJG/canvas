import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Portal } from '@mui/material';
import LuxuryDeskEnvironment from './LuxuryDeskEnvironment';
import ExecutiveAgentAvatar from './ExecutiveAgentAvatar';
import DigitalDisplayBoard from './DigitalDisplayBoard';
import CinematicChatInterface from './CinematicChatInterface';
import ParticleEffects from './ParticleEffects';
import premiumTheme from './styles/premium-theme';
import { orbPulseAnimation, portalAnimation } from './styles/animations';
import { keyframeAnimations } from './styles/glass-effects';

// Inject keyframe animations
const styleSheet = document.createElement('style');
styleSheet.textContent = keyframeAnimations;
document.head.appendChild(styleSheet);

const LauncherContainer = styled('div')({
  position: 'fixed',
  bottom: '32px',
  right: '32px',
  zIndex: 9999,
});

const MicroOrb = styled(motion.button)({
  width: '72px',
  height: '72px',
  borderRadius: '50%',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  position: 'relative',
  background: premiumTheme.gradients.darkLuxury,
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '2px',
    borderRadius: '50%',
    background: premiumTheme.colors.deepBlack,
    zIndex: 1,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    background: premiumTheme.gradients.electricPulse,
    opacity: 0.3,
    filter: 'blur(10px)',
    animation: 'glowPulse 3s ease-in-out infinite',
  },
});

const OrbInner = styled('div')({
  position: 'absolute',
  inset: '6px',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${premiumTheme.colors.deepBlack} 0%, ${premiumTheme.colors.richBlack} 100%)`,
  border: `1px solid ${premiumTheme.colors.electricCyan}30`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  
  '& svg': {
    width: '28px',
    height: '28px',
    color: premiumTheme.colors.electricCyan,
    filter: `drop-shadow(0 0 8px ${premiumTheme.colors.electricCyan}60)`,
  },
});

const PortalOverlay = styled(motion.div)({
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.95)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  zIndex: 9998,
});

const PortalShimmer = styled(motion.div)({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  background: `linear-gradient(
    45deg,
    transparent 30%,
    ${premiumTheme.colors.electricCyan}40 50%,
    transparent 70%
  )`,
  backgroundSize: '200% 200%',
  filter: 'blur(20px)',
});

const AgentEnvironment = styled(motion.div)({
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  pointerEvents: 'none',
  
  '& > *': {
    pointerEvents: 'auto',
  },
});

const MainStage = styled('div')({
  position: 'relative',
  width: '90vw',
  maxWidth: '1400px',
  height: '80vh',
  maxHeight: '900px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

interface AISalesAgentLauncherProps {
  defaultAgentId?: string;
  onAgentLaunched?: () => void;
}

const AISalesAgentLauncher: React.FC<AISalesAgentLauncherProps> = ({
  defaultAgentId = 'strategist',
  onAgentLaunched,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPortal, setShowPortal] = useState(false);
  const [showEnvironment, setShowEnvironment] = useState(false);
  const [hasNotification, setHasNotification] = useState(true);

  const handleOrbClick = () => {
    setShowPortal(true);
    setTimeout(() => {
      setIsOpen(true);
      setShowEnvironment(true);
      onAgentLaunched?.();
    }, 1200);
  };

  const handleClose = () => {
    setShowEnvironment(false);
    setTimeout(() => {
      setIsOpen(false);
      setShowPortal(false);
    }, 500);
  };

  // Simulate notification
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOpen) {
        setHasNotification(true);
        setTimeout(() => setHasNotification(false), 3000);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <>
      {/* Launcher Orb */}
      <AnimatePresence>
        {!isOpen && (
          <LauncherContainer>
            <MicroOrb
              onClick={handleOrbClick}
              animate={orbPulseAnimation.animate}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <OrbInner>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                  />
                </svg>
              </OrbInner>
              
              {/* Notification dot */}
              {hasNotification && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '16px',
                    height: '16px',
                    background: premiumTheme.colors.luxuryGold,
                    borderRadius: '50%',
                    border: `2px solid ${premiumTheme.colors.deepBlack}`,
                    zIndex: 3,
                  }}
                />
              )}
            </MicroOrb>
          </LauncherContainer>
        )}
      </AnimatePresence>

      {/* Portal Effect */}
      <Portal>
        <AnimatePresence>
          {showPortal && (
            <>
              <PortalOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              
              {!showEnvironment && (
                <PortalShimmer
                  variants={portalAnimation}
                  initial="initial"
                  animate="expanding"
                />
              )}
            </>
          )}
        </AnimatePresence>

        {/* Agent Environment */}
        <AnimatePresence>
          {showEnvironment && (
            <AgentEnvironment
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <MainStage>
                {/* Particle Effects */}
                <ParticleEffects active={showEnvironment} />
                
                {/* Luxury Desk */}
                <LuxuryDeskEnvironment isVisible={showEnvironment}>
                  {/* Executive Agent */}
                  <ExecutiveAgentAvatar
                    agentId={defaultAgentId}
                    isActive={showEnvironment}
                  />
                </LuxuryDeskEnvironment>
                
                {/* Digital Display */}
                <DigitalDisplayBoard
                  isVisible={showEnvironment}
                  style={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1,
                  }}
                />
                
                {/* Chat Interface */}
                <CinematicChatInterface
                  isOpen={showEnvironment}
                  agentId={defaultAgentId}
                  onClose={handleClose}
                  style={{
                    position: 'absolute',
                    bottom: '5%',
                    right: '5%',
                    width: '400px',
                    maxWidth: '90vw',
                    zIndex: 10,
                  }}
                />
              </MainStage>
            </AgentEnvironment>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
};

export default AISalesAgentLauncher;