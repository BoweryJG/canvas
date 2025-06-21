import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import type { DemoStage } from '../../pages/MobileCinematicDemo';

const NarratorContainer = styled(motion.div)({
  position: 'absolute',
  bottom: '100px',
  left: '50%',
  transform: 'translateX(-50%)',
  maxWidth: '90%',
  width: '400px',
  zIndex: 10,
  '@media (min-width: 768px)': {
    maxWidth: '500px',
  },
});

const AvatarContainer = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '16px',
  marginBottom: '20px',
});

const Avatar = styled(motion.div)({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
  padding: '2px',
  position: 'relative',
  flexShrink: 0,
});

const AvatarInner = styled(Box)({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: '#1a1a2e',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const HunterIcon = styled('svg')({
  width: '30px',
  height: '30px',
  fill: '#00ffc6',
});

const SpeechBubble = styled(motion.div)({
  background: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  borderRadius: '20px',
  padding: '16px 20px',
  position: 'relative',
  flex: 1,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  '&::before': {
    content: '""',
    position: 'absolute',
    bottom: '10px',
    left: '-10px',
    width: '20px',
    height: '20px',
    background: 'inherit',
    border: 'inherit',
    borderRight: 'none',
    borderTop: 'none',
    transform: 'rotate(45deg)',
    boxShadow: '-3px 3px 5px rgba(0, 0, 0, 0.2)',
  },
});

const TypewriterText = styled(Typography)({
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: 1.6,
  fontWeight: 300,
  letterSpacing: '0.02em',
  '@media (min-width: 768px)': {
    fontSize: '18px',
  },
});

interface MobileHunterNarratorProps {
  currentStage: DemoStage;
  isVisible: boolean;
}

// Narrator dialogue for each stage
const narratorDialogue: Record<string, string> = {
  'intro': "Welcome to Canvas. I'm The Hunter, your elite sales intelligence specialist. Let me show you how we transform healthcare sales.",
  'user-story': "Meet Sarah, a medical device sales rep. She needs to find oral surgeons in Buffalo for her new implant system. Watch how Canvas makes this effortless.",
  'success': "And that's how Canvas transforms your sales process. Ready to experience this power yourself?",
};

const MobileHunterNarrator: React.FC<MobileHunterNarratorProps> = ({
  currentStage,
  isVisible,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const dialogue = narratorDialogue[currentStage] || '';

  // Typewriter effect
  useEffect(() => {
    if (!isVisible || !dialogue) {
      setDisplayedText('');
      return;
    }

    setIsTyping(true);
    let currentIndex = 0;
    const typingSpeed = 30; // ms per character

    const typeInterval = setInterval(() => {
      if (currentIndex < dialogue.length) {
        setDisplayedText(dialogue.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
      }
    }, typingSpeed);

    return () => {
      clearInterval(typeInterval);
      setIsTyping(false);
    };
  }, [dialogue, isVisible, currentStage]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: 30,
      transition: {
        duration: 0.3,
        ease: 'easeIn',
      },
    },
  };

  const avatarVariants = {
    idle: {
      scale: 1,
      rotate: 0,
    },
    talking: {
      scale: [1, 1.05, 1],
      rotate: [-2, 2, -2],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <NarratorContainer
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <AvatarContainer>
            <Avatar
              variants={avatarVariants}
              animate={isTyping ? 'talking' : 'idle'}
            >
              <AvatarInner>
                <HunterIcon viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2M12.5 7H11.5C9.3 7 7.5 8.8 7.5 11V13.8C7.5 14.3 7.6 14.8 7.8 15.3L8 15.9V21H10V16.7L9.9 16.3C9.8 16.1 9.8 15.8 9.8 15.6V15H14.2V15.6C14.2 15.8 14.2 16.1 14.1 16.3L14 16.7V21H16V15.9L16.2 15.3C16.4 14.8 16.5 14.3 16.5 13.8V11C16.5 8.8 14.7 7 12.5 7M12 8.5C12.8 8.5 13.5 9.2 13.5 10S12.8 11.5 12 11.5 10.5 10.8 10.5 10 11.2 8.5 12 8.5Z" />
                </HunterIcon>
                {/* Pulse effect when talking */}
                {isTyping && (
                  <motion.div
                    style={{
                      position: 'absolute',
                      inset: -2,
                      borderRadius: '50%',
                      border: '2px solid #00ffc6',
                      opacity: 0,
                    }}
                    animate={{
                      scale: [1, 1.2, 1.4],
                      opacity: [0.5, 0.3, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                )}
              </AvatarInner>
            </Avatar>

            <SpeechBubble
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <TypewriterText>
                {displayedText}
                {isTyping && (
                  <motion.span
                    style={{ 
                      display: 'inline-block',
                      width: '2px',
                      height: '1em',
                      background: '#00ffc6',
                      marginLeft: '2px',
                      verticalAlign: 'text-bottom',
                    }}
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                )}
              </TypewriterText>
            </SpeechBubble>
          </AvatarContainer>
        </NarratorContainer>
      )}
    </AnimatePresence>
  );
};

export default MobileHunterNarrator;