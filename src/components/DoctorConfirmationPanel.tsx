import { Box, Typography, Card, CardContent, Button, Chip, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  LocationOn,
  Business,
  TrendingUp,
  AutoAwesome
} from '@mui/icons-material';

interface DoctorConfirmationProps {
  scanResults: {
    doctor: {
      name: string;
      npi?: string;
      specialty?: string;
      practice?: string;
      location?: string;
      phone?: string;
      email?: string;
      verified?: boolean;
    };
    confidence: number;
    intelligence: {
      score: number;
      insights: string[];
    };
    basic: any;
  };
  onGoDeeper: () => void;
  onSearchAgain: () => void;
}

const ConfirmationContainer = styled(motion.div)`
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  color: #fff;
  padding: 40px 20px;
  z-index: 9999;
`;

const ConfirmationCard = styled(Card)`
  background: rgba(0, 20, 40, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 255, 198, 0.2);
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  position: relative;
  overflow: visible;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #00D4FF, #00FFE1, #00FFC6, #00D4FF);
    border-radius: 24px;
    z-index: -1;
    opacity: 0.3;
    animation: borderGlow 3s ease-in-out infinite;
  }
  
  @keyframes borderGlow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
`;

const SuccessHeader = styled(Box)`
  text-align: center;
  padding: 24px;
  position: relative;
`;

const DoctorAvatar = styled(Avatar)`
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #00D4FF 0%, #00FFC6 100%);
  font-size: 2rem;
  font-weight: bold;
  color: #000;
`;

const ConfidenceScore = styled(Box)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 255, 198, 0.1);
  border: 1px solid rgba(0, 255, 198, 0.3);
  border-radius: 20px;
  padding: 8px 16px;
  margin: 16px 0;
`;

const DetailGrid = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 0 24px;
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ActionButtons = styled(Box)`
  display: flex;
  gap: 16px;
  padding: 24px;
  justify-content: center;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const GoDeepButton = styled(Button)`
  background: linear-gradient(135deg, #00D4FF 0%, #00FFC6 100%);
  color: #000;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 16px 32px;
  border-radius: 50px;
  text-transform: none;
  box-shadow: 
    0 10px 40px rgba(0, 255, 198, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 15px 50px rgba(0, 255, 198, 0.4),
      inset 0 0 30px rgba(255, 255, 255, 0.3);
      
    &::before {
      left: 100%;
    }
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
  padding: 16px 32px;
  border-radius: 50px;
  text-transform: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

export default function DoctorConfirmationPanel({
  scanResults,
  onGoDeeper,
  onSearchAgain
}: DoctorConfirmationProps) {
  console.log('DoctorConfirmationPanel: Received scanResults:', scanResults);
  
  const { doctor, confidence, intelligence } = scanResults;
  console.log('DoctorConfirmationPanel: Extracted doctor:', doctor);
  console.log('DoctorConfirmationPanel: Doctor name:', doctor?.name);
  
  // Early return if doctor data is not available
  if (!doctor || !doctor.name) {
    console.log('DoctorConfirmationPanel: Returning null - no doctor or doctor.name');
    return null;
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <ConfirmationContainer
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{ marginBottom: 30, textAlign: 'center' }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: 'linear-gradient(90deg, #00D4FF 0%, #00FFC6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1,
            fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace"
          }}
        >
          Doctor Found
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace"
          }}
        >
          Is this the right person?
        </Typography>
      </motion.div>

      {/* Confirmation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ width: '100%', maxWidth: 600 }}
      >
        <ConfirmationCard>
          <SuccessHeader>
            <DoctorAvatar>
              {getInitials(doctor.name)}
            </DoctorAvatar>
            
            <Typography variant="h5" sx={{ 
              fontWeight: 700, 
              color: '#fff', 
              mb: 1,
              fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace"
            }}>
              Dr. {doctor.name}
            </Typography>
            
            {doctor.specialty && (
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace"
              }}>
                {doctor.specialty}
              </Typography>
            )}
            
            <ConfidenceScore>
              <CheckCircle sx={{ color: '#00FFC6', fontSize: 20 }} />
              <Typography variant="body2" sx={{ 
                fontWeight: 600, 
                color: '#00FFC6',
                fontFamily: "'Orbitron', 'Exo 2', 'Rajdhani', monospace"
              }}>
                {confidence}% Match Confidence
              </Typography>
            </ConfidenceScore>

            {doctor.verified && (
              <Chip 
                label="NPI VERIFIED" 
                size="small"
                sx={{ 
                  background: '#00FFC6',
                  color: '#000',
                  fontWeight: 700,
                  mt: 1
                }}
              />
            )}
          </SuccessHeader>

          <CardContent sx={{ pt: 0 }}>
            <DetailGrid>
              {doctor.practice && (
                <DetailItem>
                  <Business sx={{ color: '#00D4FF', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      Practice
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#fff',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      {doctor.practice}
                    </Typography>
                  </Box>
                </DetailItem>
              )}

              {doctor.location && (
                <DetailItem>
                  <LocationOn sx={{ color: '#00FFE1', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#fff',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      {doctor.location}
                    </Typography>
                  </Box>
                </DetailItem>
              )}

              {doctor.npi && (
                <DetailItem>
                  <TrendingUp sx={{ color: '#00FFC6', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      NPI Number
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#fff',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      {doctor.npi}
                    </Typography>
                  </Box>
                </DetailItem>
              )}

              {intelligence.score && (
                <DetailItem>
                  <AutoAwesome sx={{ color: '#00D4FF', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ 
                      color: 'rgba(255,255,255,0.5)',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      Intelligence Score
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#fff',
                      fontFamily: "'Orbitron', monospace"
                    }}>
                      {intelligence.score}/100
                    </Typography>
                  </Box>
                </DetailItem>
              )}
            </DetailGrid>

            <ActionButtons>
              <GoDeepButton
                variant="contained"
                size="large"
                onClick={onGoDeeper}
                startIcon={<TrendingUp />}
              >
                Go Deeper - Full Analysis
              </GoDeepButton>
              
              <SecondaryButton
                variant="outlined"
                size="large"
                onClick={onSearchAgain}
              >
                Search Again
              </SecondaryButton>
            </ActionButtons>
          </CardContent>
        </ConfirmationCard>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ 
          marginTop: 30, 
          textAlign: 'center',
          color: 'rgba(255,255,255,0.5)',
          fontFamily: "'Orbitron', monospace"
        }}
      >
        <Typography variant="caption">
          Basic scan complete • 15% of full intelligence gathered
        </Typography>
      </motion.div>
    </ConfirmationContainer>
  );
}