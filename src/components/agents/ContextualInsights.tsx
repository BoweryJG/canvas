import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Button,
  LinearProgress,
  Alert,
  Stack
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  AutoAwesome,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  People,
  LocalHospital,
  Speed
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { MockDataProvider } from '../../lib/mockDataProvider';
import type { MockInsight, MockDoctor } from '../../lib/mockDataProvider';

const InsightCard = styled(Box)(({ priority }: { priority: string }) => ({
  background: priority === 'high' 
    ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(233, 30, 99, 0.1) 100%)'
    : priority === 'medium'
    ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%)'
    : 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
  border: `1px solid ${
    priority === 'high' ? 'rgba(244, 67, 54, 0.3)' : 
    priority === 'medium' ? 'rgba(255, 152, 0, 0.3)' : 
    'rgba(76, 175, 80, 0.3)'
  }`,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
  }
}));

const ActionButton = styled(Button)({
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: 'white',
  textTransform: 'none',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.3)'
  }
});

interface ContextualInsightsProps {
  agent: any;
  context: {
    tab?: string;
    doctorId?: string;
    searchQuery?: string;
    researchData?: any;
  };
  isDemo: boolean;
  expanded: boolean;
  onToggle: () => void;
  onApplyInsight?: (insight: any) => void;
}

const ContextualInsights: React.FC<ContextualInsightsProps> = ({
  agent,
  context,
  isDemo,
  expanded,
  onToggle,
  onApplyInsight
}) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  useEffect(() => {
    generateInsights();
  }, [context, agent, isDemo]);

  const generateInsights = async () => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (isDemo) {
      // Use mock data
      const mockInsights = MockDataProvider.getAgentInsights(context.doctorId);
      const doctor = context.doctorId ? 
        MockDataProvider.getDoctor(context.doctorId) : 
        MockDataProvider.getDoctors()[0];

      // Generate agent-specific insights
      const agentInsights = generateAgentSpecificInsights(agent, doctor, mockInsights);
      setInsights(agentInsights);
    } else {
      // TODO: Implement live API calls
      setInsights([]);
    }
    
    setLoading(false);
  };

  const generateAgentSpecificInsights = (
    agent: any, 
    doctor: MockDoctor | undefined, 
    baseInsights: MockInsight[]
  ) => {
    const insights = [];

    switch (agent.id) {
      case 'strategist':
        if (doctor) {
          insights.push({
            id: 'strat-1',
            type: 'opportunity',
            icon: TrendingUp,
            priority: doctor.aiScore > 85 ? 'high' : 'medium',
            title: `${doctor.name} - Strategic Opportunity`,
            description: `AI Score: ${doctor.aiScore}/100. ${
              doctor.marketIntelligence.growthTrend === 'growing' 
                ? 'Practice showing strong growth indicators.' 
                : 'Stable practice with expansion potential.'
            }`,
            actions: [
              'Schedule strategic consultation',
              'Prepare growth proposal',
              'Analyze competitor landscape'
            ]
          });
        }
        
        insights.push(...baseInsights.filter(i => i.category === 'strategy').map(i => ({
          id: i.title,
          type: i.category,
          icon: Lightbulb,
          priority: i.impact,
          title: i.title,
          description: i.description,
          actions: i.actionItems
        })));
        break;

      case 'specialist':
        if (doctor?.procedures) {
          const procedureCount = 
            (doctor.procedures.dental?.length || 0) + 
            (doctor.procedures.aesthetic?.length || 0);
          
          insights.push({
            id: 'spec-1',
            type: 'clinical',
            icon: LocalHospital,
            priority: procedureCount > 5 ? 'high' : 'medium',
            title: 'Procedure Portfolio Analysis',
            description: `Practice offers ${procedureCount} procedures. ${
              doctor.procedures.aesthetic && doctor.procedures.aesthetic.length > 0
                ? 'Cross-selling opportunity with aesthetic services.'
                : 'Potential to introduce aesthetic services.'
            }`,
            actions: [
              'Map procedures to products',
              'Identify gaps in offerings',
              'Suggest complementary services'
            ]
          });
        }
        break;

      case 'relationship':
        if (doctor) {
          insights.push({
            id: 'rel-1',
            type: 'personalization',
            icon: People,
            priority: doctor.socialPresence.googleRating && doctor.socialPresence.googleRating > 4.5 ? 'high' : 'medium',
            title: 'Relationship Building Strategy',
            description: `${doctor.socialPresence.reviewCount || 0} patient reviews with ${
              doctor.socialPresence.googleRating || 'N/A'
            } rating. Focus on ${
              doctor.metrics.acceptsNewPatients ? 'growth partnership' : 'retention and optimization'
            }.`,
            actions: [
              'Personalize outreach based on practice values',
              'Reference specific patient success stories',
              'Align with practice growth goals'
            ]
          });
        }
        break;

      case 'analyst':
        if (doctor) {
          insights.push({
            id: 'anal-1',
            type: 'metrics',
            icon: Speed,
            priority: 'medium',
            title: 'Performance Metrics',
            description: `${doctor.metrics.patientVolume}. ${
              doctor.metrics.yearsInPractice
            } years established. Market position: ${
              doctor.marketIntelligence.marketShare
            }.`,
            actions: [
              'Calculate potential ROI',
              'Benchmark against market',
              'Project growth scenarios'
            ]
          });
        }
        break;
    }

    return insights.slice(0, 3); // Limit to top 3 insights
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'strategy': return Lightbulb;
      case 'clinical': return LocalHospital;
      case 'personalization': return People;
      case 'metrics': return Speed;
      default: return AutoAwesome;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box
        onClick={onToggle}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          p: 2,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 2,
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.08)'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesome sx={{ color: '#ffc107' }} />
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
            Contextual Insights
          </Typography>
          {insights.length > 0 && (
            <Chip
              label={insights.length}
              size="small"
              sx={{
                background: 'rgba(255, 193, 7, 0.2)',
                color: '#ffc107',
                height: 20,
                '& .MuiChip-label': { px: 1 }
              }}
            />
          )}
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box sx={{ p: 2 }}>
              <LinearProgress 
                sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                  }
                }} 
              />
              <Typography 
                variant="body2" 
                sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 2, textAlign: 'center' }}
              >
                Analyzing context and generating insights...
              </Typography>
            </Box>
          ) : insights.length > 0 ? (
            <Stack spacing={1.5}>
              <AnimatePresence>
                {insights.map((insight, index) => {
                  const Icon = insight.icon || getInsightIcon(insight.type);
                  return (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <InsightCard 
                        priority={insight.priority}
                        onClick={() => setSelectedInsight(
                          selectedInsight === insight.id ? null : insight.id
                        )}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                          <Icon sx={{ 
                            color: insight.priority === 'high' ? '#f44336' : 
                                   insight.priority === 'medium' ? '#ff9800' : 
                                   '#4caf50',
                            fontSize: 20,
                            mt: 0.5
                          }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="subtitle2" 
                              sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}
                            >
                              {insight.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}
                            >
                              {insight.description}
                            </Typography>
                            
                            <Collapse in={selectedInsight === insight.id}>
                              <Box sx={{ mt: 2 }}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ color: 'rgba(255, 255, 255, 0.6)', fontWeight: 600 }}
                                >
                                  RECOMMENDED ACTIONS:
                                </Typography>
                                <Stack spacing={1} sx={{ mt: 1 }}>
                                  {insight.actions.map((action: string, i: number) => (
                                    <Box 
                                      key={i}
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1 
                                      }}
                                    >
                                      <CheckCircle sx={{ 
                                        fontSize: 16, 
                                        color: 'rgba(76, 175, 80, 0.8)' 
                                      }} />
                                      <Typography 
                                        variant="body2" 
                                        sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                                      >
                                        {action}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Stack>
                                
                                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                  <ActionButton
                                    size="small"
                                    startIcon={<AutoAwesome />}
                                    onClick={() => onApplyInsight?.(insight)}
                                  >
                                    Apply Insight
                                  </ActionButton>
                                </Box>
                              </Box>
                            </Collapse>
                          </Box>
                        </Box>
                      </InsightCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Stack>
          ) : (
            <Alert 
              severity="info" 
              sx={{ 
                background: 'rgba(33, 150, 243, 0.1)',
                color: 'white',
                border: '1px solid rgba(33, 150, 243, 0.3)'
              }}
            >
              {isDemo 
                ? 'Select a doctor or navigate tabs to see contextual insights.'
                : 'Sign in and connect your data sources for personalized insights.'
              }
            </Alert>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default ContextualInsights;