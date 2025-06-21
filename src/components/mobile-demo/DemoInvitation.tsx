import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { 
  Notifications, 
  CheckCircle, 
  TrendingUp,
  Schedule,
  AutoAwesome,
  SwipeUp,
  Message,
  Business
} from '@mui/icons-material';

// Styled components
const InvitationContainer = styled(Box)({
  width: '100vw',
  height: '100vh',
  position: 'fixed',
  top: 0,
  left: 0,
  background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

const CardContainer = styled(motion.div)({
  flex: 1,
  width: '100%',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const Card = styled(Box)({
  width: '90%',
  maxWidth: '400px',
  minHeight: '70vh',
  background: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  padding: '32px 24px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  '@media (min-width: 768px)': {
    padding: '40px 32px',
  },
});

const NotificationBadge = styled(motion.div)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(0, 255, 198, 0.1)',
  border: '1px solid rgba(0, 255, 198, 0.3)',
  borderRadius: '12px',
  padding: '8px 16px',
  marginBottom: '20px',
});

const AutoActionList = styled(Box)({
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: '12px',
  padding: '16px',
  marginTop: '20px',
});

const ActionItem = styled(motion.div)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0',
  color: 'rgba(255, 255, 255, 0.8)',
});

const StatusBox = styled(Box)({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  padding: '16px',
  marginTop: 'auto',
  textAlign: 'center',
});

const PhoneMockup = styled(Box)({
  width: '100%',
  maxWidth: '320px',
  margin: '0 auto',
  background: '#f5f5f5',
  borderRadius: '20px',
  padding: '16px',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
});

const MessageBubble = styled(motion.div)<{ sender: 'crm' | 'user' | 'doctor' }>(({ sender }) => ({
  background: sender === 'crm' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
              sender === 'doctor' ? '#e3f2fd' : '#dcf8c6',
  color: sender === 'crm' ? 'white' : '#333',
  padding: '12px 16px',
  borderRadius: '16px',
  marginBottom: '12px',
  maxWidth: sender === 'user' ? '70%' : '85%',
  alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
  fontSize: '14px',
  lineHeight: 1.5,
}));

const TextConversation = styled(Box)({
  background: '#fff',
  borderRadius: '16px',
  padding: '16px',
  minHeight: '300px',
  display: 'flex',
  flexDirection: 'column',
});

const MetricCard = styled(motion.div)({
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const ProgressDots = styled(Box)({
  display: 'flex',
  gap: '8px',
  justifyContent: 'center',
  padding: '24px',
});

const Dot = styled(motion.div)<{ active: boolean }>(({ active }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: active ? '#00ffc6' : 'rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
}));

const CTAButton = styled(motion.button)({
  width: '90%',
  maxWidth: '400px',
  margin: '0 auto',
  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
  border: 'none',
  borderRadius: '16px',
  padding: '20px',
  color: '#1a1a2e',
  fontSize: '18px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  cursor: 'pointer',
  boxShadow: '0 8px 32px rgba(0, 255, 198, 0.3)',
  position: 'relative',
  overflow: 'hidden',
});

interface DemoInvitationProps {
  onComplete: () => void;
}

const DemoInvitation: React.FC<DemoInvitationProps> = ({ onComplete }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);
  
  const cards = [
    'discovery',
    'followup',
    'conversation',
    'scale'
  ];

  // Auto-advance cards
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentCard < cards.length - 1) {
        setCurrentCard(currentCard + 1);
      }
    }, 8000);
    
    setAutoPlayTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentCard, cards.length]);

  const handleSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -50) {
      // Swipe up
      if (currentCard < cards.length - 1) {
        setCurrentCard(currentCard + 1);
        if (autoPlayTimer) clearTimeout(autoPlayTimer);
      }
    } else if (info.offset.y > 50) {
      // Swipe down
      if (currentCard > 0) {
        setCurrentCard(currentCard - 1);
        if (autoPlayTimer) clearTimeout(autoPlayTimer);
      }
    }
  };

  const renderCard = () => {
    switch (cards[currentCard]) {
      case 'discovery':
        return (
          <Card>
            <NotificationBadge
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <Notifications sx={{ color: '#00ffc6', fontSize: 20 }} />
              <Typography sx={{ color: '#00ffc6', fontWeight: 600 }}>
                New Business Alert
              </Typography>
            </NotificationBadge>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                Dr. James Wilson, DDS
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5 }}>
                Oral & Maxillofacial Surgery
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                Buffalo, NY • Filed: March 18, 2024
              </Typography>
            </Box>
            
            <AutoActionList>
              <Typography sx={{ color: '#00ffc6', fontSize: '14px', mb: 2, fontWeight: 600 }}>
                ✨ Auto-Actions Completed:
              </Typography>
              <ActionItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography sx={{ fontSize: '14px' }}>Contact created in CRM</Typography>
              </ActionItem>
              <ActionItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography sx={{ fontSize: '14px' }}>Welcome email sent</Typography>
              </ActionItem>
              <ActionItem
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                <Typography sx={{ fontSize: '14px' }}>Added to pipeline</Typography>
              </ActionItem>
            </AutoActionList>
            
            <StatusBox>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px', mb: 1 }}>
                Sarah's Status:
              </Typography>
              <Typography sx={{ color: '#fff', fontSize: '16px' }}>
                "In meeting with Dr. Martinez"
              </Typography>
            </StatusBox>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontSize: '20px',
              textAlign: 'center',
              mt: 3,
              fontWeight: 300,
              fontStyle: 'italic'
            }}>
              While Sarah was closing other deals...
            </Typography>
          </Card>
        );
        
      case 'followup':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '18px', 
              fontWeight: 600,
              mb: 3,
              textAlign: 'center'
            }}>
              Day 5: Your CRM Never Forgets
            </Typography>
            
            <PhoneMockup>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 2,
                color: '#333'
              }}>
                <AutoAwesome sx={{ fontSize: 20, color: '#667eea' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                  RepSpheres CRM
                </Typography>
                <Typography sx={{ fontSize: '12px', color: '#666', ml: 'auto' }}>
                  now
                </Typography>
              </Box>
              
              <MessageBubble sender="crm">
                <Typography sx={{ fontWeight: 600, mb: 1 }}>
                  Follow-up Opportunity! 🎯
                </Typography>
                <Typography>
                  Dr. Wilson hasn't responded to the email sent 5 days ago.
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  Try this text message?
                </Typography>
              </MessageBubble>
              
              <Box sx={{ 
                background: '#f0f0f0', 
                borderRadius: '12px', 
                p: 2,
                mb: 2 
              }}>
                <Typography sx={{ color: '#666', fontSize: '12px', mb: 1 }}>
                  Pre-written message:
                </Typography>
                <Typography sx={{ color: '#333', fontSize: '14px', lineHeight: 1.6 }}>
                  "Hi Dr. Wilson, Congrats on the new practice! I noticed you specialize in oral surgery. 
                  Our new implant system has shown 23% faster osseointegration in clinical trials. 
                  Worth a quick chat?"
                </Typography>
              </Box>
              
              <motion.button
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#1a1a2e',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                SEND TEXT →
              </motion.button>
            </PhoneMockup>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px',
              textAlign: 'center',
              mt: 3,
              fontStyle: 'italic'
            }}>
              Sarah taps send during her lunch break...
            </Typography>
          </Card>
        );
        
      case 'conversation':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '18px', 
              fontWeight: 600,
              mb: 3,
              textAlign: 'center'
            }}>
              2 Minutes Later: Perfect Timing
            </Typography>
            
            <PhoneMockup>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1, 
                mb: 2,
                color: '#333',
                borderBottom: '1px solid #e0e0e0',
                pb: 2
              }}>
                <Message sx={{ fontSize: 20, color: '#4caf50' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '14px' }}>
                  Text Messages
                </Typography>
              </Box>
              
              <TextConversation>
                <Typography sx={{ 
                  color: '#666', 
                  fontSize: '12px', 
                  textAlign: 'center',
                  mb: 2
                }}>
                  Today 2:31 PM
                </Typography>
                
                <MessageBubble 
                  sender="doctor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  OMG I was literally about to meet with the BTL rep. So glad you texted! 
                  Their system doesn't have those integration speeds.
                </MessageBubble>
                
                <MessageBubble 
                  sender="doctor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Can we meet Tuesday? This is exactly what I've been looking for!
                </MessageBubble>
                
                <MessageBubble 
                  sender="user"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  Perfect! Tuesday 2:30 PM?
                </MessageBubble>
                
                <MessageBubble 
                  sender="doctor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  See you then! 👍
                </MessageBubble>
                
                <Typography sx={{ 
                  color: '#666', 
                  fontSize: '12px', 
                  textAlign: 'center',
                  mt: 'auto',
                  pt: 2
                }}>
                  <CheckCircle sx={{ fontSize: 16, color: '#4caf50', verticalAlign: 'middle' }} />
                  {' '}Read
                </Typography>
              </TextConversation>
            </PhoneMockup>
            
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              background: 'rgba(76, 175, 80, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <Typography sx={{ 
                color: '#4caf50', 
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center'
              }}>
                Meeting Booked: $125K Opportunity
              </Typography>
            </Box>
          </Card>
        );
        
      case 'scale':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '20px', 
              fontWeight: 700,
              mb: 4,
              textAlign: 'center'
            }}>
              This Happens Every Day, Automatically
            </Typography>
            
            <Box>
              <MetricCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Box>
                  <Typography sx={{ color: '#00ffc6', fontSize: '28px', fontWeight: 700 }}>
                    847
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    New Practices Found
                  </Typography>
                </Box>
                <Business sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
              </MetricCard>
              
              <MetricCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Box>
                  <Typography sx={{ color: '#7B42F6', fontSize: '28px', fontWeight: 700 }}>
                    623
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    Follow-ups Sent
                  </Typography>
                </Box>
                <Schedule sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
              </MetricCard>
              
              <MetricCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Box>
                  <Typography sx={{ color: '#4caf50', fontSize: '28px', fontWeight: 700 }}>
                    189
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    Meetings Booked
                  </Typography>
                </Box>
                <CheckCircle sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
              </MetricCard>
              
              <MetricCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Box>
                  <Typography sx={{ color: '#ffc107', fontSize: '28px', fontWeight: 700 }}>
                    $4.7M
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    Pipeline Value
                  </Typography>
                </Box>
                <TrendingUp sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
              </MetricCard>
            </Box>
            
            <Box sx={{ 
              mt: 4, 
              p: 2, 
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#00ffc6', fontSize: '24px', fontWeight: 700 }}>
                0 Leads Missed
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                Your CRM works while you sleep, eat, and close other deals
              </Typography>
            </Box>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <InvitationContainer>
      <AnimatePresence mode="wait">
        <CardContainer
          key={currentCard}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleSwipe}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {renderCard()}
        </CardContainer>
      </AnimatePresence>
      
      <ProgressDots>
        {cards.map((_, index) => (
          <Dot key={index} active={index === currentCard} />
        ))}
      </ProgressDots>
      
      {currentCard === cards.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{ padding: '0 20px 20px' }}
        >
          <CTAButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
          >
            <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
              Watch Sarah's CRM Close a $125K Deal
            </Typography>
            <SwipeUp />
          </CTAButton>
        </motion.div>
      )}
      
      {currentCard < cards.length - 1 && (
        <Box sx={{ 
          position: 'absolute', 
          bottom: 100, 
          left: '50%', 
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}>
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <SwipeUp sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 32 }} />
          </motion.div>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '12px' }}>
            Swipe up to continue
          </Typography>
        </Box>
      )}
    </InvitationContainer>
  );
};

export default DemoInvitation;