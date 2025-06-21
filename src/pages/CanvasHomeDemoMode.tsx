import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Tab,
  Tabs,
  Paper,
  Card,
  CardContent,
  Chip,
  Avatar,
  LinearProgress,
  Stack,
  Alert,
  Fade,
  Badge,
  Grid
} from '@mui/material';
import {
  AutoAwesome,
  Rocket,
  Search,
  Psychology,
  TrendingUp,
  Groups,
  Speed,
  PlayCircle,
  ArrowForward,
  Star,
  Bolt,
  Timeline,
  Analytics,
  EmojiEvents,
  Explore
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { IntelligenceGauge } from '../components/IntelligenceGauge';
import { MockDataProvider } from '../lib/mockDataProvider';
import type { MockDoctor } from '../lib/mockDataProvider';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// Animations
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;


const pulse = keyframes`
  0% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.6; transform: scale(1); }
`;

const dataFlow = keyframes`
  0% { transform: translateX(-100%); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateX(100%); opacity: 0; }
`;

// Styled components
const HeroSection = styled(Box)({
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: '#0a0a0a',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 30%, rgba(0, 255, 198, 0.1) 0%, transparent 40%)
    `,
    pointerEvents: 'none'
  }
});

const AnimatedBackground = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: `
    linear-gradient(135deg, 
      #0a0a0a 0%, 
      #1a1a2e 25%, 
      #16213e 50%, 
      #0f3460 75%, 
      #0a0a0a 100%
    )`,
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23667eea" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    opacity: 0.1
  }
});

const GlassCard = styled(Card)({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 24,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `
      0 20px 40px rgba(102, 126, 234, 0.3),
      0 0 60px rgba(102, 126, 234, 0.1)
    `,
    border: '1px solid rgba(102, 126, 234, 0.3)',
    '& .glow-effect': {
      opacity: 1
    }
  },
  '& .glow-effect': {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    background: 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #4facfe)',
    borderRadius: 24,
    opacity: 0,
    transition: 'opacity 0.4s ease',
    filter: 'blur(10px)',
    zIndex: -1
  }
});

const AgentCard = styled(motion.div)({
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 20,
  padding: 24,
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  transformStyle: 'preserve-3d',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.1) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease'
  },
  '&:hover': {
    transform: 'translateZ(20px) rotateX(5deg)',
    border: '1px solid rgba(102, 126, 234, 0.5)',
    '&::before': {
      opacity: 1
    }
  }
});

const FloatingParticle = styled(motion.div)<{ size: number; color: string }>(({ size, color }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  boxShadow: `0 0 ${size * 2}px ${color}`,
  pointerEvents: 'none'
}));

const DataStream = styled(motion.div)({
  position: 'absolute',
  height: '2px',
  background: 'linear-gradient(90deg, transparent, #00ffc6, transparent)',
  animation: `${dataFlow} 3s linear infinite`
});

const StyledTab = styled(Tab)({
  color: 'rgba(255, 255, 255, 0.6)',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  minHeight: 48,
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: 600
  },
  '& .MuiTab-iconWrapper': {
    marginBottom: 4
  }
});

const MetricCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  padding: 24,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.6s ease'
  },
  '&:hover::before': {
    transform: 'scaleX(1)'
  }
});

const PulsingDot = styled(Box)<{ color: string }>(({ color }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: color,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: '50%',
    border: `2px solid ${color}`,
    animation: `${pulse} 2s ease-in-out infinite`
  }
}));

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

// Particle System Component
const ParticleField: React.FC = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    color: ['#667eea', '#764ba2', '#00ffc6', '#4facfe'][Math.floor(Math.random() * 4)]
  }));

  return (
    <>
      {particles.map(particle => (
        <FloatingParticle
          key={particle.id}
          size={particle.size}
          color={particle.color}
          initial={{ x: `${particle.x}%`, y: `${particle.y}%` }}
          animate={{
            x: [`${particle.x}%`, `${(particle.x + 30) % 100}%`, `${particle.x}%`],
            y: [`${particle.y}%`, `${(particle.y - 20) % 100}%`, `${particle.y}%`]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
    </>
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
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const [metrics, setMetrics] = useState({
    doctorsAnalyzed: 0,
    insightsGenerated: 0,
    timesSaved: 0,
    accuracy: 0
  });
  
  const doctors = MockDataProvider.getDoctors();

  // Animated counter effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setMetrics({
        doctorsAnalyzed: 15847,
        insightsGenerated: 47293,
        timesSaved: 892,
        accuracy: 97.8
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleDoctorSelect = (doctor: MockDoctor) => {
    setSelectedDoctor(doctor);
    setShowResults(false);
    setActiveTab(1);
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

  const agents = [
    {
      id: 'hunter',
      name: 'Hunter AI',
      icon: TrendingUp,
      color: '#00ffc6',
      description: 'Lead Generation & Qualification',
      capabilities: ['NPI Database Search', 'Practice Analytics', 'Territory Mapping', 'Competitor Analysis']
    },
    {
      id: 'strategist',
      name: 'Strategist AI',
      icon: Analytics,
      color: '#667eea',
      description: 'Sales Strategy & Planning',
      capabilities: ['Opportunity Scoring', 'Approach Planning', 'ROI Calculations', 'Risk Assessment']
    },
    {
      id: 'educator',
      name: 'Educator AI',
      icon: Psychology,
      color: '#764ba2',
      description: 'Product & Procedure Expert',
      capabilities: ['500+ Dental Procedures', '300+ Aesthetic Treatments', 'Clinical Evidence', 'Case Studies']
    },
    {
      id: 'relationship',
      name: 'Relationship AI',
      icon: Groups,
      color: '#f093fb',
      description: 'Personalized Engagement',
      capabilities: ['Communication Styles', 'Follow-up Timing', 'Relationship Mapping', 'Trust Building']
    }
  ];

  return (
    <HeroSection>
      <AnimatedBackground />
      <ParticleField />
      
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
        {/* Hero Header */}
        <Box sx={{ textAlign: 'center', mb: 8, position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                }}
              >
                <AutoAwesome sx={{ fontSize: 60, color: '#00ffc6' }} />
              </motion.div>
            </Box>
            
            <Typography 
              variant="h1" 
              sx={{ 
                fontSize: { xs: '3rem', md: '4.5rem' },
                fontWeight: 800,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #00ffc6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                mb: 2,
                letterSpacing: '-0.02em'
              }}
            >
              CANVAS Intelligence
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                mb: 4,
                fontWeight: 300,
                letterSpacing: '0.02em'
              }}
            >
              AI-Powered Sales Revolution for Healthcare
            </Typography>
          </motion.div>

          {/* Metrics Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Grid container spacing={3} sx={{ mb: 6, maxWidth: 1000, mx: 'auto' }}>
              {[
                { label: 'Doctors Analyzed', value: metrics.doctorsAnalyzed, suffix: '+', icon: Groups },
                { label: 'Insights Generated', value: metrics.insightsGenerated, suffix: '', icon: AutoAwesome },
                { label: 'Hours Saved', value: metrics.timesSaved, suffix: 'hrs', icon: Speed },
                { label: 'Accuracy Rate', value: metrics.accuracy, suffix: '%', icon: EmojiEvents }
              ].map((metric, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <MetricCard elevation={0}>
                    <metric.icon sx={{ fontSize: 40, color: '#667eea', mb: 2 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff', mb: 1 }}>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                      >
                        {metric.value.toLocaleString()}{metric.suffix}
                      </motion.span>
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {metric.label}
                    </Typography>
                  </MetricCard>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Demo Mode Badge */}
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Chip
              icon={<PlayCircle />}
              label="Interactive Demo Mode"
              sx={{ 
                px: 3,
                py: 3,
                fontSize: '1.1rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                color: 'white',
                border: 'none',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Experience the power of AI with sample data
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Bolt />}
              onClick={handleGoLive}
              sx={{
                borderColor: '#00ffc6',
                color: '#00ffc6',
                '&:hover': {
                  borderColor: '#00ffc6',
                  background: 'rgba(0, 255, 198, 0.1)',
                  transform: 'scale(1.05)'
                }
              }}
            >
              Activate Live Mode
            </Button>
          </Stack>
        </Box>

        {/* AI Agents Showcase */}
        <Box sx={{ mb: 8 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                textAlign: 'center', 
                mb: 6, 
                fontWeight: 600,
                color: 'white'
              }}
            >
              Meet Your AI Sales Team
            </Typography>
          </motion.div>

          <Grid container spacing={3}>
            {agents.map((agent, index) => (
              <Grid item xs={12} sm={6} md={3} key={agent.id}>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ y: -10 }}
                >
                  <AgentCard
                    onClick={() => setActiveAgent(agent.id)}
                    style={{
                      borderColor: activeAgent === agent.id ? agent.color : undefined,
                      background: activeAgent === agent.id ? `${agent.color}10` : undefined
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${agent.color}40, ${agent.color}20)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 16px',
                          position: 'relative'
                        }}
                      >
                        <agent.icon sx={{ fontSize: 40, color: agent.color }} />
                        <PulsingDot color={agent.color} sx={{ position: 'absolute', top: 0, right: 0 }} />
                      </Box>
                      
                      <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                        {agent.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                        {agent.description}
                      </Typography>
                      
                      <Stack spacing={1}>
                        {agent.capabilities.map((cap, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star sx={{ fontSize: 12, color: agent.color }} />
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                              {cap}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </AgentCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Connection Lines */}
          {activeAgent && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
              }}
            >
              {agents.map((agent, i) => (
                <motion.line
                  key={`${activeAgent}-${agent.id}`}
                  x1="50%"
                  y1="50%"
                  x2={`${25 + i * 25}%`}
                  y2="50%"
                  stroke={agent.color}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 0.5 }}
                />
              ))}
            </svg>
          )}
        </Box>

        {/* Interactive Demo */}
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Doctor List */}
          <Box sx={{ flex: '1 1 350px', minWidth: 300 }}>
            <GlassCard elevation={0}>
              <span className="glow-effect" />
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                    Sample Healthcare Professionals
                  </Typography>
                  <Badge badgeContent={doctors.length} color="primary">
                    <Groups />
                  </Badge>
                </Box>

                <Stack spacing={2}>
                  {doctors.map((doctor, index) => (
                    <motion.div
                      key={doctor.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Paper
                        onClick={() => handleDoctorSelect(doctor)}
                        sx={{
                          p: 2,
                          background: selectedDoctor?.id === doctor.id 
                            ? 'rgba(102, 126, 234, 0.1)' 
                            : 'rgba(255, 255, 255, 0.02)',
                          border: `1px solid ${selectedDoctor?.id === doctor.id 
                            ? 'rgba(102, 126, 234, 0.5)' 
                            : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            transform: 'translateX(8px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 56,
                              height: 56,
                              background: `linear-gradient(135deg, ${
                                doctor.aiScore > 90 ? '#f44336' : 
                                doctor.aiScore > 75 ? '#ff9800' : 
                                '#4caf50'
                              } 0%, ${
                                doctor.aiScore > 90 ? '#e91e63' : 
                                doctor.aiScore > 75 ? '#ff5722' : 
                                '#8bc34a'
                              } 100%)`,
                              fontWeight: 700,
                              fontSize: '1.2rem'
                            }}
                          >
                            {doctor.aiScore}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                              {doctor.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                              {doctor.specialty.join(', ')}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {doctor.practiceInfo.city}, {doctor.practiceInfo.state}
                            </Typography>
                          </Box>
                          <ArrowForward sx={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                        </Box>
                      </Paper>
                    </motion.div>
                  ))}
                </Stack>
              </CardContent>
            </GlassCard>
          </Box>

          {/* Analysis Panel */}
          <Box sx={{ flex: '2 1 600px', minWidth: 300 }}>
            <GlassCard elevation={0}>
              <span className="glow-effect" />
              <CardContent sx={{ p: 0 }}>
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => setActiveTab(v)}
                  sx={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    px: 3
                  }}
                >
                  <StyledTab icon={<Explore />} label="Overview" />
                  <StyledTab icon={<Psychology />} label="AI Analysis" />
                  <StyledTab icon={<Timeline />} label="Process" />
                  <StyledTab icon={<Analytics />} label="Results" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                  {/* Overview Tab */}
                  <TabPanel value={activeTab} index={0}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <motion.div
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        <Rocket sx={{ fontSize: 80, color: '#667eea', mb: 3 }} />
                      </motion.div>
                      
                      <Typography variant="h4" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                        Experience Intelligent Sales
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 4, maxWidth: 600, mx: 'auto' }}>
                        Select a healthcare professional from the left to witness our AI agents analyze, 
                        strategize, and generate personalized sales intelligence in real-time.
                      </Typography>

                      <Grid container spacing={3}>
                        {[
                          { 
                            icon: <Bolt />, 
                            title: '15-Second Analysis', 
                            desc: 'Lightning-fast comprehensive reports' 
                          },
                          { 
                            icon: <Psychology />, 
                            title: '4 AI Specialists', 
                            desc: 'Each focused on key sales aspects' 
                          },
                          { 
                            icon: <TrendingUp />, 
                            title: '360° Intelligence', 
                            desc: 'Complete practice insights' 
                          }
                        ].map((feature, index) => (
                          <Grid item xs={12} md={4} key={index}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Paper
                                sx={{
                                  p: 3,
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                  borderRadius: 3,
                                  textAlign: 'center',
                                  height: '100%'
                                }}
                              >
                                {React.cloneElement(feature.icon, { 
                                  sx: { fontSize: 48, color: '#00ffc6', mb: 2 } 
                                })}
                                <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                                  {feature.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                  {feature.desc}
                                </Typography>
                              </Paper>
                            </motion.div>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </TabPanel>

                  {/* AI Analysis Tab */}
                  <TabPanel value={activeTab} index={1}>
                    {selectedDoctor ? (
                      <Box>
                        {isScanning && (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <IntelligenceGauge
                              score={selectedDoctor.aiScore}
                              isScanning={true}
                              progress={scanProgress}
                              scanStage={
                                scanProgress < 25 ? "Accessing NPI Database..." :
                                scanProgress < 50 ? "Analyzing Practice Patterns..." :
                                scanProgress < 75 ? "Generating Strategies..." :
                                "Finalizing Intelligence Report..."
                              }
                            />
                            <LinearProgress 
                              variant="determinate" 
                              value={scanProgress}
                              sx={{ 
                                mt: 3,
                                height: 8,
                                borderRadius: 4,
                                background: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #00ffc6 100%)',
                                  borderRadius: 4
                                }
                              }}
                            />
                          </Box>
                        )}

                        {showResults && (
                          <Fade in={true}>
                            <Box>
                              <Alert 
                                severity="success"
                                icon={<EmojiEvents />}
                                sx={{
                                  mb: 3,
                                  background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1), rgba(0, 255, 198, 0.1))',
                                  color: 'white',
                                  border: '1px solid rgba(0, 255, 198, 0.3)',
                                  '& .MuiAlert-icon': {
                                    color: '#00ffc6'
                                  }
                                }}
                              >
                                AI Analysis Complete! All 4 agents have collaborated to generate comprehensive intelligence.
                              </Alert>

                              <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                  <Paper sx={{ 
                                    p: 3, 
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 2
                                  }}>
                                    <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <TrendingUp sx={{ color: '#00ffc6' }} />
                                      AI Score Analysis
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                                      <Typography variant="h2" sx={{ color: 'white', fontWeight: 700 }}>
                                        {selectedDoctor.aiScore}
                                      </Typography>
                                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', ml: 1 }}>
                                        / 100
                                      </Typography>
                                    </Box>
                                    <Stack spacing={1}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                          Market Position
                                        </Typography>
                                        <Chip 
                                          label={selectedDoctor.marketIntelligence.marketShare}
                                          size="small"
                                          sx={{ background: 'rgba(102, 126, 234, 0.2)', color: '#667eea' }}
                                        />
                                      </Box>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                          Growth Trend
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
                                              : '#ff9800'
                                          }}
                                        />
                                      </Box>
                                    </Stack>
                                  </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                  <Paper sx={{ 
                                    p: 3, 
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: 2
                                  }}>
                                    <Typography variant="h6" sx={{ color: 'white', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <AutoAwesome sx={{ color: '#764ba2' }} />
                                      Strategic Insights
                                    </Typography>
                                    <Stack spacing={2}>
                                      {selectedDoctor.insights.map((insight, index) => (
                                        <motion.div
                                          key={index}
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ delay: index * 0.1 }}
                                        >
                                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                            <Star sx={{ fontSize: 16, color: '#ffc107', mt: 0.5, flexShrink: 0 }} />
                                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                              {insight}
                                            </Typography>
                                          </Box>
                                        </motion.div>
                                      ))}
                                    </Stack>
                                  </Paper>
                                </Grid>
                              </Grid>
                            </Box>
                          </Fade>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Search sx={{ fontSize: 80, color: 'rgba(255, 255, 255, 0.2)', mb: 2 }} />
                        <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          Select a healthcare professional to begin AI analysis
                        </Typography>
                      </Box>
                    )}
                  </TabPanel>

                  {/* Process Tab */}
                  <TabPanel value={activeTab} index={2}>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', mb: 4, textAlign: 'center' }}>
                        How Canvas AI Works
                      </Typography>
                      
                      <Stack spacing={3}>
                        {[
                          {
                            step: 1,
                            title: 'Data Collection',
                            description: 'Hunter AI searches multiple databases for comprehensive practice information',
                            icon: Search,
                            color: '#00ffc6'
                          },
                          {
                            step: 2,
                            title: 'Strategic Analysis',
                            description: 'Strategist AI evaluates opportunities and creates tailored approaches',
                            icon: Analytics,
                            color: '#667eea'
                          },
                          {
                            step: 3,
                            title: 'Knowledge Application',
                            description: 'Educator AI matches procedures and products to practice needs',
                            icon: Psychology,
                            color: '#764ba2'
                          },
                          {
                            step: 4,
                            title: 'Relationship Mapping',
                            description: 'Relationship AI personalizes communication and engagement strategies',
                            icon: Groups,
                            color: '#f093fb'
                          }
                        ].map((step, index) => (
                          <motion.div
                            key={step.step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  borderRadius: '50%',
                                  background: `linear-gradient(135deg, ${step.color}40, ${step.color}20)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  position: 'relative'
                                }}
                              >
                                <step.icon sx={{ fontSize: 30, color: step.color }} />
                                <Typography
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    background: step.color,
                                    color: 'black',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.875rem'
                                  }}
                                >
                                  {step.step}
                                </Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ color: 'white', mb: 0.5 }}>
                                  {step.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                  {step.description}
                                </Typography>
                              </Box>
                            </Box>
                            {index < 3 && (
                              <Box sx={{ ml: '30px', my: 2 }}>
                                <motion.div
                                  animate={{ y: [0, 10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  <ArrowForward sx={{ color: 'rgba(255, 255, 255, 0.3)', transform: 'rotate(90deg)' }} />
                                </motion.div>
                              </Box>
                            )}
                          </motion.div>
                        ))}
                      </Stack>
                    </Box>
                  </TabPanel>

                  {/* Results Tab */}
                  <TabPanel value={activeTab} index={3}>
                    <Box>
                      <Typography variant="h5" sx={{ color: 'white', mb: 4, textAlign: 'center' }}>
                        Real-World Impact
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Paper sx={{
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            height: '100%'
                          }}>
                            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                              Sales Performance
                            </Typography>
                            <Stack spacing={2}>
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Meeting Conversion Rate
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#00ffc6' }}>
                                    +47%
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={87}
                                  sx={{ 
                                    height: 6,
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      background: 'linear-gradient(90deg, #00ffc6, #667eea)',
                                      borderRadius: 3
                                    }
                                  }}
                                />
                              </Box>
                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Deal Velocity
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#764ba2' }}>
                                    3x Faster
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={75}
                                  sx={{ 
                                    height: 6,
                                    borderRadius: 3,
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    '& .MuiLinearProgress-bar': {
                                      background: 'linear-gradient(90deg, #764ba2, #f093fb)',
                                      borderRadius: 3
                                    }
                                  }}
                                />
                              </Box>
                            </Stack>
                          </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Paper sx={{
                            p: 3,
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            height: '100%'
                          }}>
                            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                              Customer Success
                            </Typography>
                            <Stack spacing={2}>
                              {[
                                '"Reduced research time from hours to minutes"',
                                '"Closed 3 major accounts in first month"',
                                '"AI insights helped personalize every pitch"'
                              ].map((testimonial, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                                  <Star sx={{ fontSize: 16, color: '#ffc107', flexShrink: 0, mt: 0.5 }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic' }}>
                                    {testimonial}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </TabPanel>
                </Box>
              </CardContent>
            </GlassCard>
          </Box>
        </Box>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 8 }}>
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
                px: 6,
                py: 2.5,
                fontSize: '1.2rem',
                fontWeight: 700,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                  transition: 'left 0.5s ease'
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(102, 126, 234, 0.5)',
                  '&::before': {
                    left: '100%'
                  }
                }
              }}
            >
              Activate Full AI Power - Start Free Trial
            </Button>
          </motion.div>
          <Typography sx={{ mt: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
            Join 500+ sales teams revolutionizing healthcare sales with AI
          </Typography>
        </Box>
      </Container>

      {/* Floating data streams */}
      <DataStream style={{ top: '20%', width: '300px' }} />
      <DataStream style={{ top: '50%', width: '400px', animationDelay: '1s' }} />
      <DataStream style={{ top: '80%', width: '350px', animationDelay: '2s' }} />
    </HeroSection>
  );
};