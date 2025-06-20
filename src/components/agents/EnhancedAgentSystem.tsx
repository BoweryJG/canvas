import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Paper, 
  IconButton, 
  Typography, 
  Tabs, 
  Tab,
  Chip,
  Switch,
  FormControlLabel,
  Tooltip,
  Badge,
  Fade
} from '@mui/material';
import {
  SmartToy as AgentIcon,
  Close as CloseIcon,
  Minimize as MinimizeIcon,
  Maximize as MaximizeIcon,
  AutoAwesome as AIIcon,
  Psychology as StrategyIcon,
  Analytics as AnalyticsIcon,
  Diversity3 as RelationshipIcon,
  PlayCircle as DemoIcon,
  CloudSync as LiveIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../auth/AuthContext';
import AgentAvatar from './AgentAvatar';
import ContextualInsights from './ContextualInsights';
import StrategyBuilder from './StrategyBuilder';

// Glassmorphism styled components
const GlassContainer = styled(Paper)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
    pointerEvents: 'none'
  }
}));

const FloatingButton = styled(IconButton)(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  width: 64,
  height: 64,
  boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
  '&:hover': {
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    transform: 'scale(1.05)',
    boxShadow: '0 15px 50px rgba(102, 126, 234, 0.6)'
  },
  transition: 'all 0.3s ease'
}));

const StyledTab = styled(Tab)(() => ({
  color: 'rgba(255, 255, 255, 0.7)',
  '&.Mui-selected': {
    color: '#fff',
    fontWeight: 600
  },
  minHeight: 48,
  textTransform: 'none',
  fontSize: '0.95rem'
}));

interface Agent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  specialty: string[];
  icon: React.ElementType;
  color: string;
}

const agents: Agent[] = [
  {
    id: 'strategist',
    name: 'Strategic Advisor',
    role: 'Market Positioning Expert',
    avatar: 'S',
    specialty: ['Market Analysis', 'Competitive Intelligence', 'Growth Strategy'],
    icon: StrategyIcon,
    color: '#667eea'
  },
  {
    id: 'specialist',
    name: 'Procedure Specialist',
    role: 'Clinical Knowledge Expert',
    avatar: 'P',
    specialty: ['Dental Procedures', 'Aesthetic Treatments', 'Product Matching'],
    icon: AIIcon,
    color: '#764ba2'
  },
  {
    id: 'relationship',
    name: 'Relationship Builder',
    role: 'Personalization Expert',
    avatar: 'R',
    specialty: ['Communication Strategy', 'Trust Building', 'Custom Outreach'],
    icon: RelationshipIcon,
    color: '#f093fb'
  },
  {
    id: 'analyst',
    name: 'Data Analyst',
    role: 'Metrics & Insights Expert',
    avatar: 'D',
    specialty: ['Performance Metrics', 'ROI Analysis', 'Trend Identification'],
    icon: AnalyticsIcon,
    color: '#4facfe'
  }
];

interface EnhancedAgentSystemProps {
  currentContext?: {
    tab?: string;
    doctorId?: string;
    searchQuery?: string;
    researchData?: any;
  };
  onInsightApplied?: (insight: any) => void;
}

export const EnhancedAgentSystem: React.FC<EnhancedAgentSystemProps> = ({
  currentContext = {},
  onInsightApplied
}) => {
  const { session } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeAgent, setActiveAgent] = useState(0);
  const [isDemo, setIsDemo] = useState(true);
  const [hasNewInsights, setHasNewInsights] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('insights');
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulate new insights based on context changes
  useEffect(() => {
    if (currentContext.tab || currentContext.doctorId) {
      setHasNewInsights(true);
      // Auto-open if there's a specific doctor selected
      if (currentContext.doctorId && !isOpen) {
        setIsOpen(true);
      }
    }
  }, [currentContext, isOpen]);

  const handleModeToggle = () => {
    if (!isDemo && !session) {
      // Show auth modal or message
      alert('Please sign in to use Live Mode');
      return;
    }
    setIsDemo(!isDemo);
  };

  const currentAgent = agents[activeAgent];

  return (
    <>
      {/* Floating Launch Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000
            }}
          >
            <Badge
              color="error"
              variant="dot"
              invisible={!hasNewInsights}
              sx={{
                '& .MuiBadge-dot': {
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  animation: hasNewInsights ? 'pulse 2s infinite' : 'none'
                }
              }}
            >
              <Tooltip title="AI Sales Agents" placement="left">
                <FloatingButton
                  onClick={() => setIsOpen(true)}
                  size="large"
                >
                  <AgentIcon fontSize="large" />
                </FloatingButton>
              </Tooltip>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Agent Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={containerRef}
            initial={{ x: 400, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              height: isMinimized ? 60 : 600
            }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              right: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 420,
              zIndex: 999,
              maxHeight: '80vh'
            }}
          >
            <GlassContainer elevation={0}>
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AgentAvatar 
                    agent={currentAgent}
                    isActive={true}
                    size={40}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      AI Sales Intelligence
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        icon={isDemo ? <DemoIcon /> : <LiveIcon />}
                        label={isDemo ? 'Demo Mode' : 'Live Mode'}
                        size="small"
                        sx={{
                          background: isDemo ? 'rgba(255, 193, 7, 0.2)' : 'rgba(76, 175, 80, 0.2)',
                          color: isDemo ? '#ffc107' : '#4caf50',
                          border: `1px solid ${isDemo ? '#ffc107' : '#4caf50'}`,
                          '& .MuiChip-icon': {
                            color: 'inherit'
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    onClick={() => setIsMinimized(!isMinimized)}
                    sx={{ color: 'white' }}
                    size="small"
                  >
                    {isMinimized ? <MaximizeIcon /> : <MinimizeIcon />}
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setIsOpen(false);
                      setHasNewInsights(false);
                    }}
                    sx={{ color: 'white' }}
                    size="small"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>

              {/* Content */}
              {!isMinimized && (
                <Box sx={{ height: 'calc(100% - 80px)', overflow: 'hidden' }}>
                  {/* Agent Tabs */}
                  <Tabs
                    value={activeAgent}
                    onChange={(_, v) => setActiveAgent(v)}
                    sx={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      minHeight: 48
                    }}
                    variant="fullWidth"
                  >
                    {agents.map((agent) => (
                      <StyledTab
                        key={agent.id}
                        icon={<agent.icon sx={{ fontSize: 20 }} />}
                        iconPosition="start"
                        label={agent.name.split(' ')[0]}
                      />
                    ))}
                  </Tabs>

                  {/* Agent Content */}
                  <Box sx={{ p: 3, height: 'calc(100% - 48px)', overflowY: 'auto' }}>
                    <Fade in={true} timeout={500}>
                      <Box>
                        {/* Mode Switcher */}
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={!isDemo}
                                onChange={handleModeToggle}
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#4caf50'
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#4caf50'
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography sx={{ color: 'white', fontWeight: 500 }}>
                                {isDemo ? 'Demo Mode' : 'Live Mode'}
                              </Typography>
                            }
                          />
                        </Box>

                        {/* Contextual Insights */}
                        <ContextualInsights
                          agent={currentAgent}
                          context={currentContext}
                          isDemo={isDemo}
                          expanded={expandedSection === 'insights'}
                          onToggle={() => setExpandedSection(
                            expandedSection === 'insights' ? null : 'insights'
                          )}
                          onApplyInsight={onInsightApplied}
                        />

                        {/* Strategy Builder */}
                        <Box sx={{ mt: 2 }}>
                          <StrategyBuilder
                            agent={currentAgent}
                            context={currentContext}
                            isDemo={isDemo}
                            expanded={expandedSection === 'strategy'}
                            onToggle={() => setExpandedSection(
                              expandedSection === 'strategy' ? null : 'strategy'
                            )}
                          />
                        </Box>
                      </Box>
                    </Fade>
                  </Box>
                </Box>
              )}
            </GlassContainer>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
          }
        }
      `}</style>
    </>
  );
};