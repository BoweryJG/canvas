import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import { 
  Notifications, 
  CheckCircle, 
  TrendingUp,
  AutoAwesome,
  SwipeUp,
  Message,
  PlayArrow,
  Pause,
  Event,
  Groups,
  Scanner,
  Email,
  QueryBuilder
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
  paddingBottom: 'env(safe-area-inset-bottom)', // Handle iPhone notch/home bar
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
  maxHeight: '65vh',
  background: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  padding: '32px 24px',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  overflowY: 'auto',
  '@media (min-width: 768px)': {
    padding: '40px 32px',
    maxHeight: '70vh',
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

const ActionItem = styled(motion.div)({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '8px 0',
  color: 'rgba(255, 255, 255, 0.8)',
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
  padding: '16px',
});

const Dot = styled(motion.div)<{ active: boolean }>(({ active }) => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: active ? '#00ffc6' : 'rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
}));

const CalendarView = styled(Box)({
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '16px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
});

const MeetingSlot = styled(motion.div)({
  background: 'rgba(123, 66, 246, 0.2)',
  border: '1px solid rgba(123, 66, 246, 0.4)',
  borderRadius: '8px',
  padding: '8px 12px',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const SplitScreen = styled(Box)({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  width: '100%',
});

const CTAButton = styled(motion.button)({
  width: '90%',
  maxWidth: '400px',
  margin: '0 auto 20px',
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

const SkipButton = styled(Typography)({
  position: 'absolute',
  top: '20px',
  right: '20px',
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '14px',
  cursor: 'pointer',
  padding: '8px 16px',
  borderRadius: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  zIndex: 10,
  '&:hover': {
    color: '#00ffc6',
    backgroundColor: 'rgba(0, 255, 198, 0.1)',
  },
});

interface DemoInvitationProps {
  onComplete: () => void;
}

const DemoInvitation: React.FC<DemoInvitationProps> = ({ onComplete }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  const cards = [
    'busy-day',
    'crm-working',
    'discovery',
    'smart-followup',
    'perfect-timing',
    'scale'
  ];

  // Auto-advance cards
  useEffect(() => {
    if (isPaused) return;
    
    const timer = setTimeout(() => {
      if (currentCard < cards.length - 1) {
        setCurrentCard(currentCard + 1);
      }
    }, 8000);
    
    setAutoPlayTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentCard, cards.length, isPaused]);

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
      case 'busy-day':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '24px', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center'
            }}>
              Sarah's Busy Tuesday
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{ 
                width: 60, 
                height: 60, 
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '24px',
                fontWeight: 600
              }}>
                S
              </Box>
              <Box>
                <Typography sx={{ color: '#fff', fontSize: '18px', fontWeight: 600 }}>
                  Sarah Thompson
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>
                  Top Medical Device Rep • Q3 Leader
                </Typography>
              </Box>
            </Box>
            
            <CalendarView>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Event sx={{ color: '#00ffc6', fontSize: 20 }} />
                <Typography sx={{ color: '#00ffc6', fontWeight: 600 }}>
                  Today's Schedule
                </Typography>
              </Box>
              
              {[
                { time: '9:00 AM', title: 'Dr. Martinez - Closing', client: 'Valley Hospital' },
                { time: '11:30 AM', title: 'Lunch Demo', client: 'Riverside Clinic' },
                { time: '2:00 PM', title: 'Product Training', client: '6 Surgeons' },
                { time: '4:00 PM', title: 'Contract Review', client: 'Dr. Chen' },
              ].map((meeting, index) => (
                <MeetingSlot
                  key={meeting.time}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <QueryBuilder sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 16 }} />
                  <Typography sx={{ color: '#fff', fontSize: '12px', minWidth: '60px' }}>
                    {meeting.time}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}>
                      {meeting.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>
                      {meeting.client}
                    </Typography>
                  </Box>
                </MeetingSlot>
              ))}
            </CalendarView>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px',
              textAlign: 'center',
              mt: 3,
              fontStyle: 'italic'
            }}>
              Another packed day closing deals...
            </Typography>
          </Card>
        );

      case 'crm-working':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '22px', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center'
            }}>
              Meanwhile, Your CRM Never Sleeps
            </Typography>
            
            <SplitScreen>
              <Box sx={{ 
                opacity: 0.4,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                p: 2,
                background: 'rgba(0, 0, 0, 0.3)'
              }}>
                <Groups sx={{ color: '#667eea', fontSize: 32, mb: 1 }} />
                <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                  Sarah in Meeting
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                  Closing deals...
                </Typography>
              </Box>
              
              <Box sx={{ 
                border: '1px solid rgba(0, 255, 198, 0.3)',
                borderRadius: '12px',
                p: 2,
                background: 'rgba(0, 255, 198, 0.05)'
              }}>
                <Scanner sx={{ color: '#00ffc6', fontSize: 32, mb: 1 }} />
                <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>
                  Canvas Active
                </Typography>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                  Monitoring...
                </Typography>
              </Box>
            </SplitScreen>
            
            <Box sx={{ mt: 3 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Typography sx={{ color: '#00ffc6', fontSize: '14px', mb: 2, textAlign: 'center' }}>
                  Canvas AI Activity Log
                </Typography>
                {[
                  '✓ Scanning 10,000+ new business filings',
                  '✓ Analyzing territory opportunities',
                  '✓ Monitoring competitor movements',
                  '✓ Tracking client engagement signals'
                ].map((activity, index) => (
                  <motion.div
                    key={activity}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.2 }}
                  >
                    <Typography sx={{ 
                      color: 'rgba(255, 255, 255, 0.8)', 
                      fontSize: '13px',
                      mb: 1
                    }}>
                      {activity}
                    </Typography>
                  </motion.div>
                ))}
              </motion.div>
            </Box>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px',
              textAlign: 'center',
              mt: 3,
              fontStyle: 'italic'
            }}>
              Your 24/7 sales intelligence partner
            </Typography>
          </Card>
        );

      case 'discovery':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '22px', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center'
            }}>
              Opportunity Discovered
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              mb: 3
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <QueryBuilder sx={{ color: '#00ffc6', fontSize: 24 }} />
              </motion.div>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                3:47 PM - Tuesday, March 19
              </Typography>
            </Box>
            
            <NotificationBadge
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, delay: 0.3 }}
            >
              <Notifications sx={{ color: '#00ffc6', fontSize: 20 }} />
              <Typography sx={{ color: '#00ffc6', fontWeight: 600 }}>
                New Practice in Territory
              </Typography>
            </NotificationBadge>
            
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              p: 2,
              mb: 3
            }}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                Dr. James Wilson, DDS
              </Typography>
              <Typography sx={{ color: '#00ffc6', mb: 0.5, fontSize: '14px' }}>
                Oral & Maxillofacial Surgery
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px' }}>
                📍 Buffalo, NY 14221 • New Business Filing
              </Typography>
            </Box>
            
            <Typography sx={{ color: '#00ffc6', fontSize: '14px', mb: 2, fontWeight: 600 }}>
              Canvas Takes Immediate Action:
            </Typography>
            
            {[
              { icon: <Scanner />, text: 'Profile analyzed & enriched' },
              { icon: <CheckCircle />, text: 'Contact created in CRM' },
              { icon: <Email />, text: 'Welcome email sent' },
              { icon: <TrendingUp />, text: 'Added to active pipeline' }
            ].map((action, index) => (
              <ActionItem
                key={action.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {React.cloneElement(action.icon, { 
                  sx: { color: '#4caf50', fontSize: 20 } 
                })}
                <Typography sx={{ fontSize: '14px' }}>{action.text}</Typography>
              </ActionItem>
            ))}
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px',
              textAlign: 'center',
              mt: 3,
              fontStyle: 'italic'
            }}>
              No action needed from Sarah yet...
            </Typography>
          </Card>
        );
        
      case 'smart-followup':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '22px', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center'
            }}>
              Smart Follow-Up
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 2,
              mb: 3
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                  Day 1
                </Typography>
                <Email sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 28 }} />
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>→</Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                  Day 5
                </Typography>
                <QueryBuilder sx={{ color: '#ffc107', fontSize: 28 }} />
              </Box>
            </Box>
            
            <Box sx={{ 
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '12px',
              p: 2,
              mb: 3
            }}>
              <Typography sx={{ color: '#ffc107', fontWeight: 600, mb: 1 }}>
                Canvas Analysis
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                • Email not opened after 5 days
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                • Competitor (BTL) active in area
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                • High-value prospect profile
              </Typography>
            </Box>
            
            <Box sx={{ 
              background: 'rgba(0, 255, 198, 0.05)',
              border: '1px solid rgba(0, 255, 198, 0.3)',
              borderRadius: '12px',
              p: 2,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesome sx={{ color: '#00ffc6', fontSize: 20 }} />
                <Typography sx={{ color: '#00ffc6', fontWeight: 600 }}>
                  Smart Recommendation
                </Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px', mb: 2 }}>
                Try a text message - oral surgeons have 73% higher text response rates
              </Typography>
              
              <Box sx={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '8px', 
                p: 1.5 
              }}>
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '11px', mb: 0.5 }}>
                  Suggested message:
                </Typography>
                <Typography sx={{ color: '#fff', fontSize: '13px', lineHeight: 1.5 }}>
                  "Hi Dr. Wilson, Congrats on the new practice! I noticed you specialize in oral surgery. 
                  Our new implant system has shown 23% faster osseointegration. Worth a quick chat?"
                </Typography>
              </Box>
            </Box>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px',
              textAlign: 'center',
              mt: 3,
              fontStyle: 'italic'
            }}>
              Canvas knows when and how to reach out...
            </Typography>
          </Card>
        );
        
      case 'perfect-timing':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '22px', 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center'
            }}>
              Perfect Timing
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 3,
              justifyContent: 'center'
            }}>
              <QueryBuilder sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 20 }} />
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                Tuesday, 12:30 PM - Lunch Break
              </Typography>
            </Box>
            
            <PhoneMockup>
              <Box sx={{ 
                background: '#f5f5f5',
                borderRadius: '16px',
                p: 2,
                mb: 2
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 2
                }}>
                  <AutoAwesome sx={{ fontSize: 20, color: '#667eea' }} />
                  <Typography sx={{ color: '#333', fontWeight: 600, fontSize: '14px' }}>
                    Canvas CRM
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '12px', ml: 'auto' }}>
                    now
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  background: '#fff',
                  borderRadius: '12px',
                  p: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <Typography sx={{ color: '#333', fontWeight: 600, mb: 1 }}>
                    Ready to reach out? 🎯
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '14px', mb: 2 }}>
                    Dr. Wilson hasn't opened the email. Try this text?
                  </Typography>
                  
                  <Box sx={{ 
                    background: '#f0f4f8',
                    borderRadius: '8px',
                    p: 1.5,
                    mb: 2
                  }}>
                    <Typography sx={{ color: '#333', fontSize: '13px' }}>
                      "Hi Dr. Wilson, Congrats on the new practice!..."
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <motion.button
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#1a1a2e',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Send Text
                    </motion.button>
                    <button style={{
                      padding: '10px 20px',
                      background: '#e0e0e0',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#666'
                    }}>
                      Skip
                    </button>
                  </Box>
                </Box>
              </Box>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
              >
                <Typography sx={{ 
                  color: '#333', 
                  fontSize: '12px', 
                  textAlign: 'center',
                  mb: 1
                }}>
                  2 minutes later...
                </Typography>
                
                <Box sx={{ 
                  background: '#dcf8c6',
                  borderRadius: '12px',
                  p: 2,
                  position: 'relative'
                }}>
                  <Typography sx={{ color: '#333', fontSize: '13px', fontWeight: 600, mb: 0.5 }}>
                    Dr. Wilson:
                  </Typography>
                  <Typography sx={{ color: '#333', fontSize: '13px' }}>
                    "OMG perfect timing! Was just about to meet with BTL. 
                    Can we meet Tuesday? This is exactly what I need!"
                  </Typography>
                  <CheckCircle sx={{ 
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    fontSize: 16, 
                    color: '#4caf50' 
                  }} />
                </Box>
              </motion.div>
            </PhoneMockup>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: '14px',
              textAlign: 'center',
              mt: 3,
              fontStyle: 'italic'
            }}>
              Right message, right time, right channel
            </Typography>
          </Card>
        );
        
      case 'scale':
        return (
          <Card>
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '22px', 
              fontWeight: 700,
              mb: 2,
              textAlign: 'center'
            }}>
              This Happens Every Day
            </Typography>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '14px',
              mb: 3,
              textAlign: 'center'
            }}>
              While your reps focus on selling
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
                    New Opportunities Found
                  </Typography>
                </Box>
                <Scanner sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
              </MetricCard>
              
              <MetricCard
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Box>
                  <Typography sx={{ color: '#7B42F6', fontSize: '28px', fontWeight: 700 }}>
                    3.2x
                  </Typography>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                    Response Rate Increase
                  </Typography>
                </Box>
                <Message sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
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
                <Groups sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
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
                    Pipeline Generated
                  </Typography>
                </Box>
                <TrendingUp sx={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 40 }} />
              </MetricCard>
            </Box>
            
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              background: 'linear-gradient(135deg, rgba(0, 255, 198, 0.1) 0%, rgba(123, 66, 246, 0.1) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 255, 198, 0.2)',
              textAlign: 'center'
            }}>
              <Typography sx={{ color: '#00ffc6', fontSize: '20px', fontWeight: 700 }}>
                Zero Opportunities Missed
              </Typography>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px' }}>
                Canvas works 24/7 so your reps can focus on what they do best
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
      {/* Skip button */}
      <SkipButton onClick={onComplete}>
        Skip to Demo →
      </SkipButton>
      
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
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
        <motion.button
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#00ffc6',
          }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <PlayArrow /> : <Pause />}
        </motion.button>
        
        <ProgressDots>
          {cards.map((_, index) => (
            <Dot 
              key={index} 
              active={index === currentCard}
              onClick={() => {
                setCurrentCard(index);
                if (autoPlayTimer) clearTimeout(autoPlayTimer);
              }}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </ProgressDots>
      </Box>
      
      {currentCard === cards.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          style={{ 
            padding: '0 20px', 
            marginBottom: '20px',
            position: 'relative',
            zIndex: 5
          }}
        >
          <CTAButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
          >
            <Typography sx={{ fontSize: '16px', fontWeight: 600 }}>
              See How Canvas Works
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