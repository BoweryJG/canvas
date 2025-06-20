import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import premiumTheme from './styles/premium-theme';
import { documentSlideAnimation } from './styles/animations';
import { glassEffects, premiumButton } from './styles/glass-effects';
import VoiceWaveform from './VoiceWaveform';
import PremiumMessageBubble from './PremiumMessageBubble';

const InterfaceContainer = styled(motion.div)({
  position: 'relative',
  width: '100%',
  maxWidth: '450px',
  height: '650px',
  maxHeight: '85vh',
  ...glassEffects.dark,
  borderRadius: premiumTheme.borderRadius.large,
  border: `1px solid ${premiumTheme.colors.electricCyan}20`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: `
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 60px ${premiumTheme.colors.electricCyan}10
  `,
});

const HeaderBar = styled('div')({
  padding: '20px',
  borderBottom: `1px solid ${premiumTheme.colors.electricCyan}20`,
  ...glassEffects.premium,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const AgentInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const AgentAvatar = styled('div')({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: premiumTheme.gradients.electricPulse,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    background: premiumTheme.gradients.holographic,
    opacity: 0.3,
    animation: 'holographicShift 5s ease infinite',
  },
  
  '& .initial': {
    fontSize: '18px',
    fontWeight: 600,
    color: premiumTheme.colors.deepBlack,
    zIndex: 1,
  },
});

const AgentDetails = styled('div')({
  '& .name': {
    fontSize: '16px',
    fontWeight: 600,
    color: premiumTheme.colors.watchDial,
    letterSpacing: '0.02em',
  },
  
  '& .status': {
    fontSize: '12px',
    color: premiumTheme.colors.electricCyan,
    opacity: 0.8,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
    
    '& .dot': {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: premiumTheme.colors.successGreen,
      boxShadow: `0 0 6px ${premiumTheme.colors.successGreen}`,
    },
  },
});

const ControlButtons = styled('div')({
  display: 'flex',
  gap: '8px',
});

const IconButton = styled('button')({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  ...glassEffects.light,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  
  '& svg': {
    width: '18px',
    height: '18px',
    color: premiumTheme.colors.electricCyan,
  },
  
  '&:hover': {
    ...glassEffects.medium,
    transform: 'scale(1.1)',
    boxShadow: `0 0 20px ${premiumTheme.colors.electricCyan}30`,
  },
  
  '&.active': {
    background: premiumTheme.gradients.electricPulse,
    
    '& svg': {
      color: premiumTheme.colors.deepBlack,
    },
  },
});

const MessagesContainer = styled('div')({
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: premiumTheme.colors.electricCyan + '30',
    borderRadius: '3px',
  },
});

const InputArea = styled('div')({
  padding: '20px',
  borderTop: `1px solid ${premiumTheme.colors.electricCyan}20`,
  ...glassEffects.premium,
});

const InputWrapper = styled('div')({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end',
});

const MessageInput = styled('textarea')({
  flex: 1,
  minHeight: '50px',
  maxHeight: '120px',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: `1px solid ${premiumTheme.colors.electricCyan}20`,
  borderRadius: premiumTheme.borderRadius.medium,
  color: premiumTheme.colors.watchDial,
  fontSize: '14px',
  fontFamily: premiumTheme.typography.executive.fontFamily,
  resize: 'none',
  outline: 'none',
  transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  
  '&:focus': {
    borderColor: premiumTheme.colors.electricCyan + '60',
    background: 'rgba(255, 255, 255, 0.04)',
    boxShadow: `0 0 20px ${premiumTheme.colors.electricCyan}10`,
  },
  
  '&::placeholder': {
    color: premiumTheme.colors.chromeAccent + '60',
  },
});

const SendButton = styled(motion.button)({
  ...premiumButton.base,
  background: premiumTheme.gradients.electricPulse,
  color: premiumTheme.colors.deepBlack,
  fontWeight: 600,
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  
  '&:hover': {
    ...premiumButton.hover,
    background: premiumTheme.gradients.holographic,
  },
  
  '&:active': {
    ...premiumButton.active,
  },
  
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const CloseButton = styled('button')({
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  ...glassEffects.medium,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  
  '& svg': {
    width: '16px',
    height: '16px',
    color: premiumTheme.colors.chromeAccent,
  },
  
  '&:hover': {
    transform: 'scale(1.1) rotate(90deg)',
    background: 'rgba(255, 255, 255, 0.1)',
  },
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CinematicChatInterfaceProps {
  isOpen: boolean;
  agentId: string;
  onClose: () => void;
  style?: React.CSSProperties;
}

const CinematicChatInterface: React.FC<CinematicChatInterfaceProps> = ({
  isOpen,
  agentId,
  onClose,
  style,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Agent name mapping
  const getAgentName = (id: string) => {
    const names: Record<string, string> = {
      strategist: 'Alexander Sterling',
      qualifier: 'Victoria Chen',
      closer: 'Marcus Blackwell',
      researcher: 'Dr. Elena Rodriguez',
      objection_handler: 'James Mitchell',
      relationship_builder: 'Sophia Laurent',
    };
    return names[id] || 'AI Executive';
  };
  
  // Send welcome message on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Welcome to the Executive Suite. I'm ${getAgentName(agentId)}, your premium sales consultant. How may I elevate your practice today?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, agentId, messages.length]);
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I understand your needs perfectly. Let me craft a solution that exceeds your expectations...',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <InterfaceContainer
          variants={documentSlideAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={style}
        >
          <HeaderBar>
            <AgentInfo>
              <AgentAvatar>
                <span className="initial">
                  {getAgentName(agentId).charAt(0)}
                </span>
              </AgentAvatar>
              <AgentDetails>
                <div className="name">{getAgentName(agentId)}</div>
                <div className="status">
                  <div className="dot" />
                  <span>Executive AI • Ready to Assist</span>
                </div>
              </AgentDetails>
            </AgentInfo>
            
            <ControlButtons>
              <IconButton 
                className={isVoiceMode ? 'active' : ''}
                onClick={() => setIsVoiceMode(!isVoiceMode)}
                title="Voice Mode"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </IconButton>
              <IconButton title="Video Call">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </IconButton>
              <IconButton title="Settings">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </IconButton>
            </ControlButtons>
          </HeaderBar>
          
          <MessagesContainer>
            {messages.map((message) => (
              <PremiumMessageBubble
                key={message.id}
                message={message}
                agentName={getAgentName(agentId)}
              />
            ))}
            <div ref={messagesEndRef} />
          </MessagesContainer>
          
          {isVoiceMode ? (
            <VoiceWaveform
              isListening={isListening}
              onToggleListening={() => setIsListening(!isListening)}
            />
          ) : (
            <InputArea>
              <InputWrapper>
                <MessageInput
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your premium inquiry here..."
                  rows={1}
                />
                <SendButton
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Send</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </SendButton>
              </InputWrapper>
            </InputArea>
          )}
          
          <CloseButton onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </CloseButton>
        </InterfaceContainer>
      )}
    </AnimatePresence>
  );
};

export default CinematicChatInterface;