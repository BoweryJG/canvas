import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography, Card, LinearProgress, Chip, Avatar } from '@mui/material';
import { 
  Search, 
  CheckCircle, 
  TrendingUp,
  Email,
  LocationOn,
  BusinessCenter,
  Analytics,
  AutoAwesome
} from '@mui/icons-material';
import type { DemoStage } from '../../pages/MobileCinematicDemo';

// Styled components
const SceneContainer = styled(motion.div)({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  position: 'relative',
});

const IntroTitle = styled(motion(Typography))({
  fontSize: '28px',
  fontWeight: 700,
  color: '#ffffff',
  textAlign: 'center',
  marginBottom: '16px',
  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  '@media (min-width: 768px)': {
    fontSize: '36px',
  },
});

const UserCard = styled(motion(Card))({
  background: 'rgba(26, 26, 46, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  borderRadius: '16px',
  padding: '24px',
  maxWidth: '100%',
  width: '350px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
});

const SearchContainer = styled(motion.div)({
  width: '100%',
  maxWidth: '400px',
  position: 'relative',
});

const SearchBar = styled(motion.div)({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '2px solid rgba(0, 255, 198, 0.3)',
  borderRadius: '12px',
  padding: '16px 20px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  position: 'relative',
  overflow: 'hidden',
});

const SearchText = styled(Typography)({
  color: '#ffffff',
  fontSize: '18px',
  flex: 1,
  fontFamily: 'monospace',
});

const DropdownResult = styled(motion.div)({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  marginTop: '8px',
  background: 'rgba(26, 26, 46, 0.98)',
  border: '1px solid rgba(0, 255, 198, 0.3)',
  borderRadius: '12px',
  padding: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
  zIndex: 10,
});

const ScanningContainer = styled(motion.div)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  width: '100%',
  maxWidth: '400px',
});

const ScanProgress = styled(Box)({
  width: '100%',
  padding: '20px',
  background: 'rgba(26, 26, 46, 0.95)',
  borderRadius: '12px',
  border: '1px solid rgba(0, 255, 198, 0.2)',
});

const ResultCard = styled(motion(Card))({
  background: 'rgba(26, 26, 46, 0.95)',
  border: '1px solid rgba(0, 255, 198, 0.2)',
  borderRadius: '12px',
  padding: '20px',
  width: '100%',
  maxWidth: '400px',
  marginBottom: '16px',
});

const DataRow = styled(motion.div)({
  background: 'rgba(0, 255, 198, 0.05)',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const PhoneMockup = styled(motion.div)({
  width: '280px',
  height: '500px',
  background: '#1a1a2e',
  borderRadius: '30px',
  border: '8px solid #333',
  padding: '20px',
  position: 'relative',
  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  overflow: 'hidden',
});

const NotificationBubble = styled(motion.div)({
  background: '#ffffff',
  borderRadius: '12px',
  padding: '12px',
  margin: '12px 0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
});

interface MobileDemoSequenceProps {
  currentStage: DemoStage;
  isPlaying: boolean;
  prefersReducedMotion: boolean;
}

const MobileDemoSequence: React.FC<MobileDemoSequenceProps> = ({
  currentStage,
  isPlaying,
  prefersReducedMotion,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Simulate typing effect for search
  useEffect(() => {
    if (currentStage === 'search-demo' && isPlaying) {
      const targetText = 'Dr. Jam';
      let currentIndex = 0;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= targetText.length) {
          setSearchQuery(targetText.substring(0, currentIndex));
          currentIndex++;
          
          // Show dropdown when we've typed enough
          if (currentIndex >= 6) {
            setShowDropdown(true);
          }
        } else {
          clearInterval(typeInterval);
        }
      }, 200);

      return () => clearInterval(typeInterval);
    }
  }, [currentStage, isPlaying]);

  // Simulate scan progress
  useEffect(() => {
    if (currentStage === 'scanning' && isPlaying) {
      setScanProgress(0);
      const progressInterval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 500);

      return () => clearInterval(progressInterval);
    }
  }, [currentStage, isPlaying]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };

  const scaleIn = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  };

  const renderScene = () => {
    switch (currentStage) {
      case 'intro':
        return (
          <SceneContainer
            key="intro"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              animate={{ 
                rotate: prefersReducedMotion ? 0 : [0, 360],
                scale: prefersReducedMotion ? 1 : [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }}
              style={{ marginBottom: '32px' }}
            >
              <AutoAwesome sx={{ fontSize: 80, color: '#00ffc6' }} />
            </motion.div>
            
            <IntroTitle>
              Transform Your Healthcare Sales
            </IntroTitle>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              textAlign: 'center',
              fontSize: '18px',
              maxWidth: '400px'
            }}>
              AI-powered intelligence for medical device sales
            </Typography>
          </SceneContainer>
        );

      case 'user-story':
        return (
          <SceneContainer
            key="user-story"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <UserCard variants={scaleIn}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  S
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                    Sarah Thompson
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Medical Device Sales Rep
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ 
                background: 'rgba(0, 255, 198, 0.1)', 
                borderRadius: '8px', 
                p: 2,
                border: '1px solid rgba(0, 255, 198, 0.2)'
              }}>
                <Typography sx={{ color: '#00ffc6', fontSize: '14px', mb: 1, fontWeight: 600 }}>
                  Today's Mission:
                </Typography>
                <Typography sx={{ color: '#fff', fontSize: '16px' }}>
                  Find oral surgeons in Buffalo for new implant system launch
                </Typography>
              </Box>
            </UserCard>
          </SceneContainer>
        );

      case 'search-demo':
        return (
          <SceneContainer
            key="search-demo"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '20px', 
              mb: 3,
              textAlign: 'center'
            }}>
              Sarah starts her search...
            </Typography>
            
            <SearchContainer>
              <SearchBar>
                <Search sx={{ color: '#00ffc6', fontSize: 28 }} />
                <SearchText>{searchQuery}</SearchText>
                {searchQuery.length > 0 && (
                  <motion.span
                    style={{ 
                      display: 'inline-block',
                      width: '2px',
                      height: '24px',
                      background: '#00ffc6',
                    }}
                    animate={{ opacity: [1, 0] }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: 'reverse',
                    }}
                  />
                )}
              </SearchBar>
              
              <AnimatePresence>
                {showDropdown && (
                  <DropdownResult
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
                        width: 48,
                        height: 48
                      }}>
                        JW
                      </Avatar>
                      <Box>
                        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '18px' }}>
                          Dr. James Wilson, DDS
                        </Typography>
                        <Typography sx={{ color: '#00ffc6', fontSize: '14px' }}>
                          Oral & Maxillofacial Surgery
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.6)' }} />
                          <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                            Buffalo, NY 14221
                          </Typography>
                          <Typography sx={{ 
                            color: 'rgba(255, 255, 255, 0.4)', 
                            fontSize: '11px',
                            ml: 1
                          }}>
                            NPI: 1234567890
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </DropdownResult>
                )}
              </AnimatePresence>
            </SearchContainer>
          </SceneContainer>
        );

      case 'scanning':
        return (
          <SceneContainer
            key="scanning"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ScanningContainer>
              <motion.div
                animate={prefersReducedMotion ? {} : { 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <Analytics sx={{ fontSize: 60, color: '#00ffc6' }} />
              </motion.div>
              
              <ScanProgress>
                <Typography sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>
                  Analyzing Dr. Wilson's Practice
                </Typography>
                
                <LinearProgress 
                  variant="determinate" 
                  value={scanProgress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                      borderRadius: 4,
                    }
                  }}
                />
                
                <Box sx={{ mt: 2 }}>
                  {scanProgress >= 20 && (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                      ✓ Accessing medical databases...
                    </Typography>
                  )}
                  {scanProgress >= 40 && (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                      ✓ Analyzing practice patterns...
                    </Typography>
                  )}
                  {scanProgress >= 60 && (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                      ✓ Evaluating procedure compatibility...
                    </Typography>
                  )}
                  {scanProgress >= 80 && (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                      ✓ Building intelligence profile...
                    </Typography>
                  )}
                </Box>
              </ScanProgress>
            </ScanningContainer>
          </SceneContainer>
        );

      case 'results':
        return (
          <SceneContainer
            key="results"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ justifyContent: 'flex-start', paddingTop: '40px' }}
          >
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '22px', 
              fontWeight: 600,
              mb: 3,
              textAlign: 'center'
            }}>
              Intelligence Report Ready
            </Typography>
            
            <ResultCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <BusinessCenter sx={{ color: '#00ffc6' }} />
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  Practice Overview
                </Typography>
              </Box>
              <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                High-volume oral surgery practice specializing in complex implant cases. 
                15+ years experience, strong referral network.
              </Typography>
            </ResultCard>
            
            <ResultCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <TrendingUp sx={{ color: '#7B42F6' }} />
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  Opportunity Score: 92/100
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label="Early Adopter" size="small" sx={{ 
                  background: 'rgba(0, 255, 198, 0.2)',
                  color: '#00ffc6',
                  border: '1px solid rgba(0, 255, 198, 0.3)'
                }} />
                <Chip label="High Volume" size="small" sx={{ 
                  background: 'rgba(123, 66, 246, 0.2)',
                  color: '#7B42F6',
                  border: '1px solid rgba(123, 66, 246, 0.3)'
                }} />
                <Chip label="Premium Focus" size="small" sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }} />
              </Box>
            </ResultCard>
          </SceneContainer>
        );

      case 'data-showcase':
        return (
          <SceneContainer
            key="data-showcase"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '20px', 
              mb: 3,
              textAlign: 'center'
            }}>
              Market Intelligence
            </Typography>
            
            <Box sx={{ width: '100%', maxWidth: '400px' }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.1 }}
              >
                {[
                  { name: 'Dental Implants', growth: '+18%', size: '$4.2B' },
                  { name: 'Bone Grafting', growth: '+12%', size: '$2.1B' },
                  { name: 'Sinus Lifts', growth: '+15%', size: '$1.8B' },
                  { name: 'Ridge Augmentation', growth: '+22%', size: '$1.5B' },
                ].map((item, index) => (
                  <DataRow
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Typography sx={{ color: '#fff', fontSize: '14px' }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Chip 
                        label={item.growth} 
                        size="small" 
                        sx={{ 
                          background: 'rgba(76, 175, 80, 0.2)',
                          color: '#4caf50',
                          fontSize: '12px'
                        }} 
                      />
                      <Typography sx={{ color: '#00ffc6', fontSize: '14px', fontWeight: 600 }}>
                        {item.size}
                      </Typography>
                    </Box>
                  </DataRow>
                ))}
              </motion.div>
            </Box>
          </SceneContainer>
        );

      case 'message-preview':
        return (
          <SceneContainer
            key="message-preview"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '20px', 
              mb: 3,
              textAlign: 'center'
            }}>
              Personalized Outreach Generated
            </Typography>
            
            <PhoneMockup
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ 
                background: '#f5f5f5', 
                borderRadius: '20px',
                height: '100%',
                p: 2,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Email sx={{ color: '#333', fontSize: 20 }} />
                  <Typography sx={{ color: '#333', fontWeight: 600, fontSize: '14px' }}>
                    New Message
                  </Typography>
                </Box>
                
                <NotificationBubble
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Typography sx={{ color: '#333', fontSize: '12px', fontWeight: 600, mb: 1 }}>
                    Dr. Wilson,
                  </Typography>
                  <Typography sx={{ color: '#666', fontSize: '11px', lineHeight: 1.4 }}>
                    I noticed your practice specializes in complex implant cases. 
                    Our new Nobel Active TiUltra system has shown 23% faster osseointegration...
                  </Typography>
                  <Typography sx={{ color: '#007AFF', fontSize: '11px', mt: 1 }}>
                    Schedule a 15-min demo →
                  </Typography>
                </NotificationBubble>
              </Box>
            </PhoneMockup>
          </SceneContainer>
        );

      case 'success':
        return (
          <SceneContainer
            key="success"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: 'spring',
                damping: 10,
                stiffness: 100
              }}
            >
              <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 3 }} />
            </motion.div>
            
            <Typography sx={{ 
              color: '#fff', 
              fontSize: '24px', 
              fontWeight: 600,
              textAlign: 'center',
              mb: 2
            }}>
              Meeting Scheduled!
            </Typography>
            
            <Typography sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '16px',
              textAlign: 'center',
              maxWidth: '300px'
            }}>
              Dr. Wilson confirmed for Tuesday 2:30 PM. 
              Deal value potential: $125,000
            </Typography>
            
            {/* Simple CSS confetti effect */}
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '10px',
                    height: '10px',
                    background: ['#00ffc6', '#7B42F6', '#4caf50', '#ffc107'][i % 4],
                    borderRadius: '2px',
                    left: `${Math.random() * 100}%`,
                    top: '-10px',
                  }}
                  animate={{
                    y: [0, window.innerHeight + 20],
                    x: [0, (Math.random() - 0.5) * 100],
                    rotate: [0, Math.random() * 360],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: 'linear',
                  }}
                />
              ))}
            </Box>
          </SceneContainer>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {renderScene()}
    </AnimatePresence>
  );
};

export default MobileDemoSequence;