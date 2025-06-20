import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Box, Typography, Paper, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import { 
  AutoAwesome,
  Bolt,
  Search,
  TrendingUp,
  Psychology,
  School,
  Handshake,
  Analytics
} from '@mui/icons-material';
import { EnhancedNPILookup } from './EnhancedNPILookup';
import type { NPIDoctor } from './EnhancedNPILookup';

// Glassmorphism components
const SearchSection = styled(Box)(() => ({
  background: 'radial-gradient(circle at 20% 50%, #1a0033 0%, #000000 100%)',
  minHeight: '100vh',
  padding: '40px 20px',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `
      radial-gradient(circle at 80% 20%, rgba(123, 66, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 20% 80%, rgba(0, 255, 198, 0.1) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  },
}));

const GlassCard = styled(Paper)(() => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '20px',
  padding: '30px',
  boxShadow: `
    0 20px 50px rgba(0, 0, 0, 0.5),
    inset 0 0 50px rgba(255, 255, 255, 0.02)
  `,
  position: 'relative',
  overflow: 'hidden',
}));

const AgentCard = styled(motion.div)(() => ({
  background: 'rgba(255, 255, 255, 0.02)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '24px',
  height: '100%',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, transparent 0%, rgba(0, 255, 198, 0.05) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover': {
    border: '1px solid rgba(0, 255, 198, 0.3)',
    transform: 'translateY(-4px)',
    
    '&::before': {
      opacity: 1,
    },
  },
}));

const IconWrapper = styled(Box)(() => ({
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '16px',
  position: 'relative',
  
  '& svg': {
    fontSize: '28px',
    zIndex: 1,
  },
}));

const KnowledgeChip = styled(Chip)(() => ({
  background: 'rgba(123, 66, 246, 0.1)',
  border: '1px solid rgba(123, 66, 246, 0.3)',
  color: '#fff',
  fontSize: '0.75rem',
  height: '24px',
  margin: '2px',
}));

// Agent definitions with clear purposes and knowledge connections
const salesAgents = [
  {
    id: 'hunter',
    name: 'Hunter AI',
    icon: TrendingUp,
    color: '#00ffc6',
    purpose: 'Lead Generation & Qualification',
    description: 'Identifies high-value prospects and qualifies leads based on practice data',
    knowledge: [
      'NPI Database',
      'Practice Analytics',
      'Market Intelligence',
      'Territory Mapping'
    ],
    capabilities: [
      'Prospect scoring based on procedure volume',
      'Territory opportunity mapping',
      'Competitive landscape analysis',
      'Lead prioritization algorithms'
    ]
  },
  {
    id: 'strategist',
    name: 'Strategist AI',
    icon: Psychology,
    color: '#7B42F6',
    purpose: 'Sales Strategy & Planning',
    description: 'Creates personalized sales strategies for each doctor and practice',
    knowledge: [
      'Doctor Profiles',
      'Practice Patterns',
      'Market Trends',
      'Competitive Intel'
    ],
    capabilities: [
      'Custom sales playbooks',
      'Objection handling scripts',
      'Pricing strategy optimization',
      'Multi-stakeholder approach planning'
    ]
  },
  {
    id: 'educator',
    name: 'Educator AI',
    icon: School,
    color: '#4ecdc4',
    purpose: 'Product & Procedure Expert',
    description: 'Provides deep clinical knowledge and procedure-specific insights',
    knowledge: [
      '500+ Dental Procedures',
      '300+ Aesthetic Procedures',
      'Clinical Protocols',
      'ROI Calculations'
    ],
    capabilities: [
      'Procedure workflow explanations',
      'Clinical benefit articulation',
      'ROI and case studies',
      'Compliance guidance'
    ]
  },
  {
    id: 'relationship',
    name: 'Relationship AI',
    icon: Handshake,
    color: '#f093fb',
    purpose: 'Personalized Engagement',
    description: 'Builds authentic connections through personalized communication',
    knowledge: [
      'Communication Styles',
      'Doctor Preferences',
      'Practice Culture',
      'Engagement History'
    ],
    capabilities: [
      'Personalized email templates',
      'Follow-up timing optimization',
      'Relationship mapping',
      'Trust-building strategies'
    ]
  }
];

export const CanvasMainSearch: React.FC = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<NPIDoctor | null>(null);
  const [product, setProduct] = useState('');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const handleDoctorSelect = (doctor: NPIDoctor) => {
    setSelectedDoctor(doctor);
  };

  const handleScan = () => {
    if (!selectedDoctor || !product) return;
    
    // Trigger the scanning process
    console.log('Starting scan for:', selectedDoctor, product);
  };

  return (
    <SearchSection>
      <Box maxWidth="1400px" mx="auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box textAlign="center" mb={6}>
            <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
              <AutoAwesome sx={{ fontSize: 48, color: '#00ffc6' }} />
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #fff 0%, #00ffc6 50%, #7B42F6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                CANVAS
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: 300 }}>
              AI-Powered Sales Intelligence Platform
            </Typography>
          </Box>
        </motion.div>

        {/* Main Search Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard sx={{ mb: 4 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Doctor / Practice
                </Typography>
                <EnhancedNPILookup
                  onSelect={handleDoctorSelect}
                  placeholder="Start typing to discover NPI data instantly..."
                />
              </Grid>
              
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Your Product / Service
                </Typography>
                <Box sx={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    placeholder="e.g., CBCT Scanner, Implant System..."
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      fontSize: '16px',
                      fontWeight: 500,
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      color: '#fff',
                      outline: 'none',
                    }}
                  />
                  <Bolt sx={{ 
                    position: 'absolute', 
                    right: 16, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#7B42F6'
                  }} />
                </Box>
              </Grid>

              {selectedDoctor && product && (
                <Grid size={12}>
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleScan}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                      border: 'none',
                      borderRadius: '50px',
                      color: '#fff',
                      padding: '16px 32px',
                      fontSize: '18px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 10px 30px rgba(0, 255, 198, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Search />
                    GENERATE INTELLIGENCE
                  </motion.button>
                </Grid>
              )}
            </Grid>
          </GlassCard>
        </motion.div>

        {/* AI Sales Agents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box mb={4}>
            <Typography 
              variant="h4" 
              sx={{ 
                textAlign: 'center', 
                mb: 2,
                fontWeight: 600,
                color: '#fff'
              }}
            >
              Your AI Sales Team
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                textAlign: 'center', 
                mb: 4,
                color: 'rgba(255, 255, 255, 0.7)',
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Four specialized AI agents working together, each with unique knowledge and capabilities
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {salesAgents.map((agent, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={agent.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <AgentCard
                    onMouseEnter={() => setHoveredAgent(agent.id)}
                    onMouseLeave={() => setHoveredAgent(null)}
                  >
                    <IconWrapper
                      sx={{
                        background: `linear-gradient(135deg, ${agent.color}20 0%, ${agent.color}10 100%)`,
                        border: `1px solid ${agent.color}40`,
                      }}
                    >
                      <agent.icon sx={{ color: agent.color }} />
                    </IconWrapper>

                    <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
                      {agent.name}
                    </Typography>

                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: agent.color, 
                        mb: 2,
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em'
                      }}
                    >
                      {agent.purpose}
                    </Typography>

                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                      {agent.description}
                    </Typography>

                    <Box mb={2}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.5)', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          display: 'block',
                          mb: 1
                        }}
                      >
                        Connected Knowledge:
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {agent.knowledge.map((item, idx) => (
                          <KnowledgeChip key={idx} label={item} size="small" />
                        ))}
                      </Box>
                    </Box>

                    <AnimatePresence>
                      {hoveredAgent === agent.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box 
                            sx={{ 
                              borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
                              pt: 2,
                              mt: 2 
                            }}
                          >
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'rgba(255, 255, 255, 0.5)', 
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                display: 'block',
                                mb: 1
                              }}
                            >
                              Key Capabilities:
                            </Typography>
                            <ul style={{ 
                              margin: 0, 
                              padding: '0 0 0 20px',
                              listStyle: 'none'
                            }}>
                              {agent.capabilities.map((cap, idx) => (
                                <li key={idx} style={{ 
                                  color: 'rgba(255, 255, 255, 0.7)',
                                  fontSize: '0.8rem',
                                  marginBottom: '4px',
                                  position: 'relative',
                                  paddingLeft: '16px'
                                }}>
                                  <span style={{
                                    position: 'absolute',
                                    left: 0,
                                    color: agent.color
                                  }}>•</span>
                                  {cap}
                                </li>
                              ))}
                            </ul>
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </AgentCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Bottom info */}
          <Box mt={4} textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              <Analytics sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
              All agents are powered by real-time NPI data, procedure databases, and market intelligence
            </Typography>
          </Box>
        </motion.div>
      </Box>
    </SearchSection>
  );
};