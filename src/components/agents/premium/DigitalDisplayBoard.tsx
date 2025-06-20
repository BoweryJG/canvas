import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import premiumTheme from './styles/premium-theme';
import { displayAnimation, messageFlowAnimation, holographicFlicker } from './styles/animations';
import { glassEffects, holographicEffects } from './styles/glass-effects';

const DisplayContainer = styled(motion.div)({
  position: 'relative',
  width: '600px',
  height: '120px',
  ...glassEffects.dark,
  borderRadius: premiumTheme.borderRadius.large,
  overflow: 'hidden',
  border: `1px solid ${premiumTheme.colors.electricCyan}20`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: premiumTheme.gradients.holographic,
    opacity: 0.03,
    backgroundSize: '400% 400%',
    animation: 'holographicShift 15s ease infinite',
  },
});

const DisplayFrame = styled('div')({
  position: 'absolute',
  inset: '2px',
  borderRadius: premiumTheme.borderRadius.large,
  background: `linear-gradient(180deg,
    ${premiumTheme.colors.deepBlack}95 0%,
    ${premiumTheme.colors.richBlack}98 100%
  )`,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

const StatusBar = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '8px',
});

const StatusIndicator = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  
  '& .dot': {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: premiumTheme.colors.electricCyan,
    boxShadow: `0 0 8px ${premiumTheme.colors.electricCyan}`,
    animation: 'glowPulse 2s ease-in-out infinite',
  },
  
  '& .label': {
    fontSize: '10px',
    color: premiumTheme.colors.electricCyan,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    opacity: 0.8,
  },
});

const MetricsDisplay = styled('div')({
  display: 'flex',
  gap: '16px',
  
  '& .metric': {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    
    '& .value': {
      fontSize: '14px',
      fontWeight: 600,
      color: premiumTheme.colors.holographicBlue,
      fontFamily: premiumTheme.typography.code.fontFamily,
    },
    
    '& .label': {
      fontSize: '9px',
      color: premiumTheme.colors.chromeAccent,
      opacity: 0.6,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
  },
});

const DialogueStream = styled('div')({
  flex: 1,
  position: 'relative',
  overflow: 'hidden',
  minHeight: '40px',
});

const MessageLine = styled(motion.div)({
  position: 'absolute',
  width: '100%',
  fontSize: '12px',
  fontFamily: premiumTheme.typography.technical.fontFamily,
  lineHeight: 1.4,
  padding: '4px 0',
  
  '&.user': {
    color: premiumTheme.colors.electricCyan,
  },
  
  '&.agent': {
    color: premiumTheme.colors.holographicBlue,
  },
  
  '& .prefix': {
    opacity: 0.6,
    marginRight: '8px',
  },
  
  '& .content': {
    opacity: 0.9,
  },
});

const ScanLine = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '2px',
  background: `linear-gradient(90deg,
    transparent 0%,
    ${premiumTheme.colors.electricCyan}40 50%,
    transparent 100%
  )`,
  opacity: 0.6,
});

const CornerAccent = styled('div')({
  position: 'absolute',
  width: '20px',
  height: '20px',
  border: `1px solid ${premiumTheme.colors.electricCyan}40`,
  
  '&.top-left': {
    top: '8px',
    left: '8px',
    borderRight: 'none',
    borderBottom: 'none',
  },
  
  '&.top-right': {
    top: '8px',
    right: '8px',
    borderLeft: 'none',
    borderBottom: 'none',
  },
  
  '&.bottom-left': {
    bottom: '8px',
    left: '8px',
    borderRight: 'none',
    borderTop: 'none',
  },
  
  '&.bottom-right': {
    bottom: '8px',
    right: '8px',
    borderLeft: 'none',
    borderTop: 'none',
  },
});

interface DigitalDisplayBoardProps {
  isVisible: boolean;
  style?: React.CSSProperties;
}

const DigitalDisplayBoard: React.FC<DigitalDisplayBoardProps> = ({
  isVisible,
  style,
}) => {
  const [messages, setMessages] = useState<Array<{id: number; type: 'user' | 'agent'; content: string}>>([]);
  const [metrics, setMetrics] = useState({
    engagement: 92,
    conversion: 87,
    satisfaction: 95,
  });
  const [isLive, setIsLive] = useState(true);
  
  // Simulate real-time dialogue
  useEffect(() => {
    if (!isVisible) return;
    
    const dialogueExamples = [
      { type: 'user' as const, content: 'Looking for premium dental solutions' },
      { type: 'agent' as const, content: 'I have the perfect procedures for you' },
      { type: 'user' as const, content: 'What about ROI and patient satisfaction?' },
      { type: 'agent' as const, content: 'Let me show you our success metrics' },
      { type: 'user' as const, content: 'How does this compare to competitors?' },
      { type: 'agent' as const, content: 'Our technology leads the market' },
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < dialogueExamples.length) {
        const newMessage = {
          id: Date.now(),
          ...dialogueExamples[index % dialogueExamples.length],
        };
        setMessages(prev => [newMessage, ...prev].slice(0, 2));
        index++;
      } else {
        index = 0;
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isVisible]);
  
  // Update metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        engagement: Math.floor(Math.random() * 10 + 90),
        conversion: Math.floor(Math.random() * 10 + 85),
        satisfaction: Math.floor(Math.random() * 8 + 92),
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <DisplayContainer
      variants={displayAnimation}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      style={style}
    >
      <motion.div
        animate={holographicFlicker.animate}
        style={{ height: '100%' }}
      >
        <DisplayFrame>
          <StatusBar>
            <StatusIndicator>
              <motion.div
                className="dot"
                animate={{
                  scale: isLive ? [1, 1.2, 1] : 1,
                  opacity: isLive ? [1, 0.6, 1] : 0.3,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
              <span className="label">{isLive ? 'Live Interaction' : 'Standby'}</span>
            </StatusIndicator>
            
            <MetricsDisplay>
              <div className="metric">
                <div className="value">{metrics.engagement}%</div>
                <div className="label">Engage</div>
              </div>
              <div className="metric">
                <div className="value">{metrics.conversion}%</div>
                <div className="label">Convert</div>
              </div>
              <div className="metric">
                <div className="value">{metrics.satisfaction}%</div>
                <div className="label">Satisfy</div>
              </div>
            </MetricsDisplay>
          </StatusBar>
          
          <DialogueStream>
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <MessageLine
                  key={message.id}
                  className={message.type}
                  variants={messageFlowAnimation}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ top: index * 20 }}
                >
                  <span className="prefix">
                    {message.type === 'user' ? '>' : 'AI:'}
                  </span>
                  <span className="content">{message.content}</span>
                </MessageLine>
              ))}
            </AnimatePresence>
            
            <ScanLine
              animate={{
                y: [0, 40, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </DialogueStream>
        </DisplayFrame>
        
        <CornerAccent className="top-left" />
        <CornerAccent className="top-right" />
        <CornerAccent className="bottom-left" />
        <CornerAccent className="bottom-right" />
      </motion.div>
    </DisplayContainer>
  );
};

export default DigitalDisplayBoard;