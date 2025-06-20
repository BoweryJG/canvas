import React from 'react';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import premiumTheme from './styles/premium-theme';
import { luxuryFadeIn, typingAnimation } from './styles/animations';
import { glassEffects, holographicEffects } from './styles/glass-effects';

const MessageContainer = styled(motion.div)<{ isUser: boolean }>(({ isUser }) => ({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  flexDirection: isUser ? 'row-reverse' : 'row',
}));

const AvatarWrapper = styled('div')<{ isUser: boolean }>(({ isUser }) => ({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: isUser 
    ? premiumTheme.gradients.executiveGold
    : premiumTheme.gradients.electricPulse,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '14px',
  fontWeight: 600,
  color: premiumTheme.colors.deepBlack,
  position: 'relative',
  flexShrink: 0,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    background: isUser
      ? premiumTheme.gradients.executiveGold
      : premiumTheme.gradients.holographic,
    opacity: 0.3,
    filter: 'blur(4px)',
    animation: isUser ? 'none' : 'holographicShift 8s ease infinite',
  },
}));

const MessageBubble = styled('div')<{ isUser: boolean }>(({ isUser }) => ({
  maxWidth: '70%',
  padding: '16px 20px',
  borderRadius: isUser 
    ? '20px 20px 4px 20px'
    : '20px 20px 20px 4px',
  background: isUser
    ? `linear-gradient(135deg, 
        ${premiumTheme.colors.executiveNavy} 0%, 
        ${premiumTheme.colors.richBlack} 100%
      )`
    : glassEffects.premium.background,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: `1px solid ${isUser 
    ? premiumTheme.colors.luxuryGold + '30'
    : premiumTheme.colors.electricCyan + '30'
  }`,
  boxShadow: isUser
    ? `0 8px 24px rgba(212, 175, 55, 0.1)`
    : `0 8px 24px rgba(0, 255, 198, 0.1)`,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: isUser
      ? 'none'
      : holographicEffects.subtle.background,
    opacity: 0.05,
    backgroundSize: '400% 400%',
    animation: isUser ? 'none' : 'holographicShift 15s ease infinite',
  },
}));

const MessageContent = styled('div')<{ isUser: boolean }>(({ isUser }) => ({
  fontSize: '14px',
  lineHeight: 1.6,
  color: isUser
    ? premiumTheme.colors.watchDial
    : premiumTheme.colors.platinum,
  fontFamily: premiumTheme.typography.executive.fontFamily,
  letterSpacing: '0.02em',
  position: 'relative',
  zIndex: 1,
}));

const MessageTime = styled('div')<{ isUser: boolean }>(({ isUser }) => ({
  fontSize: '10px',
  color: premiumTheme.colors.chromeAccent + '60',
  marginTop: '8px',
  textAlign: isUser ? 'right' : 'left',
  letterSpacing: '0.05em',
}));

const TypingIndicator = styled('div')({
  display: 'flex',
  gap: '4px',
  padding: '8px',
  
  '& .dot': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: premiumTheme.colors.electricCyan,
    boxShadow: `0 0 8px ${premiumTheme.colors.electricCyan}`,
  },
});

const MessageActions = styled(motion.div)({
  position: 'absolute',
  bottom: '-30px',
  right: '0',
  display: 'flex',
  gap: '8px',
  padding: '4px',
  ...glassEffects.light,
  borderRadius: premiumTheme.borderRadius.small,
  opacity: 0,
  transform: 'translateY(-10px)',
  transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
});

const ActionButton = styled('button')({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.05)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${premiumTheme.animations.fast} ${premiumTheme.animations.smooth}`,
  
  '& svg': {
    width: '14px',
    height: '14px',
    color: premiumTheme.colors.chromeAccent,
  },
  
  '&:hover': {
    background: premiumTheme.colors.electricCyan + '20',
    transform: 'scale(1.1)',
    
    '& svg': {
      color: premiumTheme.colors.electricCyan,
    },
  },
});

const MessageWrapper = styled('div')({
  position: 'relative',
  
  '&:hover': {
    '& .message-actions': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

interface PremiumMessageBubbleProps {
  message: Message;
  agentName: string;
}

const PremiumMessageBubble: React.FC<PremiumMessageBubbleProps> = ({
  message,
  agentName,
}) => {
  const isUser = message.role === 'user';
  const initial = isUser ? 'Y' : agentName.charAt(0);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  return (
    <MessageContainer
      isUser={isUser}
      variants={luxuryFadeIn}
      initial="hidden"
      animate="visible"
    >
      <AvatarWrapper isUser={isUser}>
        {initial}
      </AvatarWrapper>
      
      <MessageWrapper>
        <MessageBubble isUser={isUser}>
          <MessageContent isUser={isUser}>
            {message.isStreaming ? (
              <motion.span animate={typingAnimation.animate}>
                {message.content}
                <TypingIndicator>
                  <motion.div 
                    className="dot" 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="dot" 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="dot" 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </TypingIndicator>
              </motion.span>
            ) : (
              message.content
            )}
          </MessageContent>
          <MessageTime isUser={isUser}>
            {formatTime(message.timestamp)}
          </MessageTime>
        </MessageBubble>
        
        {!isUser && !message.isStreaming && (
          <MessageActions className="message-actions">
            <ActionButton title="Copy">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </ActionButton>
            <ActionButton title="Save">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </ActionButton>
            <ActionButton title="Share">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a3 3 0 10-5.464 0m5.464 0a3 3 0 01-5.464 0M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </ActionButton>
          </MessageActions>
        )}
      </MessageWrapper>
    </MessageContainer>
  );
};

export default PremiumMessageBubble;