import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Tab,
  Tabs,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Stack,
  IconButton,
  Alert,
  Fade,
  Zoom,
  Badge
} from '@mui/material';
import {
  AutoAwesome,
  Rocket,
  Search,
  Psychology,
  TrendingUp,
  Groups,
  LocalHospital,
  Speed,
  CloudOff,
  Cloud,
  PlayCircle,
  Info,
  ArrowForward
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { IntelligenceGauge } from '../components/IntelligenceGauge';
import { MockDataProvider, MockDoctor } from '../lib/mockDataProvider';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// Styled components
const HeroSection = styled(Box)({
  background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%)',
    pointerEvents: 'none'
  }
});

const GlassCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 32px rgba(102, 126, 234, 0.2)',
    border: '1px solid rgba(102, 126, 234, 0.3)'
  }
});

const StyledTab = styled(Tab)({
  color: 'rgba(255, 255, 255, 0.6)',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: 600
  },
  '& .MuiTab-iconWrapper': {
    marginBottom: 4
  }
});

const DoctorCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  padding: 16,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
    transform: 'translateX(4px)',
    borderColor: 'rgba(102, 126, 234, 0.3)'
  }
});

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const CanvasHomeDemoMode: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<MockDoctor | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isDemo] = useState(true);
  
  const doctors = MockDataProvider.getDoctors();
  const marketData = MockDataProvider.getMarketIntelligence();

  const handleDoctorSelect = (doctor: MockDoctor) => {
    setSelectedDoctor(doctor);
    setShowResults(false);
    setActiveTab(1); // Switch to research tab
    simulateScan();
  };

  const simulateScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setShowResults(false);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setShowResults(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleGoLive = () => {
    if (session) {
      navigate('/research');
    } else {
      navigate('/login');
    }
  };

  return (
    <HeroSection>
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              CANVAS Intelligence Platform
            </Typography>
            <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
              AI-Powered Sales Intelligence for Healthcare
            </Typography>
          </motion.div>

          {/* Demo/Live Mode Toggle */}
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Chip
              icon={<PlayCircle />}
              label="Demo Mode"
              color="warning"
              sx={{ 
                px: 2, 
                py: 2.5,
                fontSize: '1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
              }}
            />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Explore with sample data
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Cloud />}
              onClick={handleGoLive}
              sx={{
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  borderColor: '#66bb6a',
                  background: 'rgba(76, 175, 80, 0.1)'
                }
              }}
            >
              Go Live
            </Button>
          </Stack>
        </Box>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Left Panel - Doctor List */}
          <Grid item xs={12} md={4}>
            <GlassCard elevation={0}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Sample Doctors
                  </Typography>
                  <Badge badgeContent={doctors.length} color="primary">
                    <Groups />
                  </Badge>
                </Box>

                <Stack spacing={2}>
                  {doctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      elevation={0}
                      onClick={() => handleDoctorSelect(doctor)}
                      sx={{
                        borderColor: selectedDoctor?.id === doctor.id ? 'rgba(102, 126, 234, 0.5)' : undefined,
                        background: selectedDoctor?.id === doctor.id ? 'rgba(102, 126, 234, 0.1)' : undefined
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(135deg, ${
                              doctor.aiScore > 90 ? '#f44336' : 
                              doctor.aiScore > 75 ? '#ff9800' : 
                              '#4caf50'
                            } 0%, ${
                              doctor.aiScore > 90 ? '#e91e63' : 
                              doctor.aiScore > 75 ? '#ff5722' : 
                              '#8bc34a'
                            } 100%)`,
                            width: 48,
                            height: 48,
                            fontWeight: 700
                          }}
                        >
                          {doctor.aiScore}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                            {doctor.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            {doctor.specialty.join(', ')}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                            {doctor.practiceInfo.city}, {doctor.practiceInfo.state}
                          </Typography>
                        </Box>
                        <ArrowForward sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                      </Box>
                    </DoctorCard>
                  ))}
                </Stack>
              </CardContent>
            </GlassCard>
          </Grid>

          {/* Right Panel - Research Interface */}
          <Grid item xs={12} md={8}>
            <GlassCard elevation={0}>
              <CardContent sx={{ p: 0 }}>
                {/* Tabs */}
                <Tabs
                  value={activeTab}
                  onChange={(e, v) => setActiveTab(v)}
                  sx={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    px: 3
                  }}
                >
                  <StyledTab icon={<TrendingUp />} label="Overview" />
                  <StyledTab icon={<Psychology />} label="Intelligence" />
                  <StyledTab icon={<LocalHospital />} label="Procedures" />
                  <StyledTab icon={<Speed />} label="Insights" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                  {/* Overview Tab */}
                  <TabPanel value={activeTab} index={0}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AutoAwesome sx={{ fontSize: 64, color: '#667eea', mb: 2 }} />
                      <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
                        Welcome to CANVAS Demo Mode
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 4, maxWidth: 600, mx: 'auto' }}>
                        Select a doctor from the left panel to see AI-powered intelligence generation in action. 
                        Our agents will analyze practice data, generate insights, and create personalized strategies.
                      </Typography>
                      
                      <Grid container spacing={3} sx={{ mt: 2 }}>
                        {[
                          { icon: <Rocket />, title: 'Instant Analysis', desc: '15-30 second intelligence briefs' },
                          { icon: <Psychology />, title: 'AI Agents', desc: '4 specialized sales assistants' },
                          { icon: <TrendingUp />, title: 'Market Intelligence', desc: 'Real-time competitive insights' }
                        ].map((feature, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <Paper
                              sx={{
                                p: 3,
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 2,
                                textAlign: 'center'
                              }}
                            >
                              {React.cloneElement(feature.icon, { 
                                sx: { fontSize: 40, color: '#667eea', mb: 2 } 
                              })}
                              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                {feature.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {feature.desc}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </TabPanel>

                  {/* Intelligence Tab */}
                  <TabPanel value={activeTab} index={1}>
                    {selectedDoctor ? (
                      <Box>
                        {/* Scanning Animation */}
                        {isScanning && (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <IntelligenceGauge
                              score={selectedDoctor.aiScore}
                              isScanning={true}
                              progress={scanProgress}
                              scanStage="Analyzing practice data..."
                            />
                            <Typography sx={{ mt: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                              Generating intelligence for {selectedDoctor.name}...
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={scanProgress}
                              sx={{ 
                                mt: 2, 
                                height: 8, 
                                borderRadius: 4,
                                background: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                  borderRadius: 4
                                }
                              }}
                            />
                          </Box>
                        )}

                        {/* Results */}
                        {showResults && (
                          <Fade in={true}>
                            <Box>
                              <Alert 
                                severity="success"
                                sx={{
                                  mb: 3,
                                  background: 'rgba(76, 175, 80, 0.1)',
                                  color: 'white',
                                  border: '1px solid rgba(76, 175, 80, 0.3)'
                                }}
                              >
                                Intelligence generated successfully! AI agents have analyzed {selectedDoctor.name}'s practice.
                              </Alert>

                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                                    Practice Overview
                                  </Typography>
                                  <Stack spacing={2}>
                                    <Box>
                                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                        AI SCORE
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                          {selectedDoctor.aiScore}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                          / 100
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                        MARKET POSITION
                                      </Typography>
                                      <Typography variant="body1" sx={{ color: 'white' }}>
                                        {selectedDoctor.marketIntelligence.marketShare}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                        GROWTH TREND
                                      </Typography>
                                      <Chip
                                        label={selectedDoctor.marketIntelligence.growthTrend}
                                        size="small"
                                        sx={{
                                          background: selectedDoctor.marketIntelligence.growthTrend === 'growing' 
                                            ? 'rgba(76, 175, 80, 0.2)' 
                                            : 'rgba(255, 152, 0, 0.2)',
                                          color: selectedDoctor.marketIntelligence.growthTrend === 'growing' 
                                            ? '#4caf50' 
                                            : '#ff9800',
                                          border: `1px solid ${
                                            selectedDoctor.marketIntelligence.growthTrend === 'growing' 
                                              ? '#4caf50' 
                                              : '#ff9800'
                                          }`
                                        }}
                                      />
                                    </Box>
                                  </Stack>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                  <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                                    Key Insights
                                  </Typography>
                                  <Stack spacing={1}>
                                    {selectedDoctor.insights.map((insight, index) => (
                                      <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                        <AutoAwesome sx={{ fontSize: 16, color: '#ffc107', mt: 0.5 }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                          {insight}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Box>
                          </Fade>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Search sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Select a doctor to generate intelligence
                        </Typography>
                      </Box>
                    )}
                  </TabPanel>

                  {/* Procedures Tab */}
                  <TabPanel value={activeTab} index={2}>
                    {selectedDoctor ? (
                      <Box>
                        <Grid container spacing={3}>
                          {selectedDoctor.procedures.dental && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                                Dental Procedures
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {selectedDoctor.procedures.dental.map((proc, index) => (
                                  <Chip
                                    key={index}
                                    label={proc}
                                    sx={{
                                      background: 'rgba(33, 150, 243, 0.2)',
                                      color: '#2196f3',
                                      border: '1px solid rgba(33, 150, 243, 0.3)',
                                      mb: 1
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Grid>
                          )}
                          {selectedDoctor.procedures.aesthetic && (
                            <Grid item xs={12} md={6}>
                              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                                Aesthetic Procedures
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {selectedDoctor.procedures.aesthetic.map((proc, index) => (
                                  <Chip
                                    key={index}
                                    label={proc}
                                    sx={{
                                      background: 'rgba(233, 30, 99, 0.2)',
                                      color: '#e91e63',
                                      border: '1px solid rgba(233, 30, 99, 0.3)',
                                      mb: 1
                                    }}
                                  />
                                ))}
                              </Stack>
                            </Grid>
                          )}
                        </Grid>
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <LocalHospital sx={{ fontSize: 64, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
                        <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Select a doctor to view procedures
                        </Typography>
                      </Box>
                    )}
                  </TabPanel>

                  {/* Insights Tab */}
                  <TabPanel value={activeTab} index={3}>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                        Market Intelligence
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper
                            sx={{
                              p: 3,
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                              TOP GROWING PROCEDURES
                            </Typography>
                            <Stack spacing={1}>
                              {marketData.topProcedures.slice(0, 3).map((proc, index) => (
                                <Typography key={index} variant="body2" sx={{ color: 'white' }}>
                                  • {proc}
                                </Typography>
                              ))}
                            </Stack>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper
                            sx={{
                              p: 3,
                              background: 'rgba(255, 255, 255, 0.03)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: 2
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                              MARKET DYNAMICS
                            </Typography>
                            <Stack spacing={1}>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                • Growth Rate: {marketData.growthRate}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                • Avg Patient Value: ${marketData.averagePatientValue}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                • Total Practices: {marketData.totalPractices.toLocaleString()}
                              </Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </TabPanel>
                </Box>
              </CardContent>
            </GlassCard>
          </Grid>
        </Grid>

        {/* Call to Action */}
        {isDemo && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<Rocket />}
                onClick={handleGoLive}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                  }
                }}
              >
                Unlock Live Mode - Connect Your Data
              </Button>
            </motion.div>
            <Typography sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.6)' }}>
              Ready to see real results? Sign in to access live data and full AI capabilities.
            </Typography>
          </Box>
        )}
      </Container>
    </HeroSection>
  );
};