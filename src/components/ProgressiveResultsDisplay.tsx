/**
 * Progressive Results Display
 * Shows results as they arrive in a visually stunning way
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Collapse,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  ExpandMore,
  ExpandLess,
  Speed,
  Psychology,
  TrendingUp,
  Email,
  Timer,
  Lock,
  Star,
  Bolt,
  AutoAwesome
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { SUBSCRIPTION_TIERS, getDeliveryMessage } from '../lib/subscriptionTiers';

interface StyledCardProps {
  tier?: string;
}

const StyledCard = styled(Card)<StyledCardProps>(({ tier }) => ({
  background: tier === 'locked' 
    ? 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)'
    : 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
  border: '1px solid',
  borderColor: tier === 'locked' ? '#666' : '#00ffc6',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: tier !== 'locked' ? 'translateY(-2px)' : 'none',
    boxShadow: tier !== 'locked' 
      ? '0 10px 30px rgba(0, 255, 198, 0.3)' 
      : '0 5px 15px rgba(0, 0, 0, 0.3)'
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: tier === 'genius' 
      ? 'linear-gradient(90deg, #FFD700 0%, #FF6B6B 100%)'
      : tier === 'pro'
      ? 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)'
      : '#666',
    opacity: tier === 'locked' ? 0.3 : 1
  }
}));

const PulsingDot = styled(Box)`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ffc6;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.5);
      opacity: 0.5;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

interface ResultSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: 'pending' | 'loading' | 'complete' | 'locked';
  progress?: number;
  data?: Record<string, unknown>;
  tier: string;
  deliveryTime: number;
  priority: number;
}

interface Props {
  scanId: string;
  userTier: string;
  onUpgradeClick: () => void;
}

export default function ProgressiveResultsDisplay({ userTier, onUpgradeClick }: Props) {
  const [sections, setSections] = useState<ResultSection[]>([
    {
      id: 'basic_profile',
      title: 'Basic Profile',
      icon: <CheckCircle />,
      status: 'loading',
      progress: 0,
      tier: 'free',
      deliveryTime: 3,
      priority: 1
    },
    {
      id: 'practice_details',
      title: 'Practice Intelligence',
      icon: <TrendingUp />,
      status: 'pending',
      tier: 'free',
      deliveryTime: 5,
      priority: 2
    },
    {
      id: 'review_analysis',
      title: 'Review Analysis',
      icon: <Star />,
      status: 'pending',
      tier: 'pro',
      deliveryTime: 8,
      priority: 3
    },
    {
      id: 'psychology',
      title: 'Psychological Profile',
      icon: <Psychology />,
      status: userTier === 'genius' || userTier === 'enterprise' ? 'pending' : 'locked',
      tier: 'genius',
      deliveryTime: 10,
      priority: 4
    },
    {
      id: 'outreach',
      title: 'Outreach Strategy',
      icon: <Email />,
      status: 'pending',
      tier: userTier,
      deliveryTime: 12,
      priority: 5
    },
    {
      id: 'timing',
      title: 'Optimal Timing',
      icon: <Timer />,
      status: userTier === 'genius' || userTier === 'enterprise' ? 'pending' : 'locked',
      tier: 'genius',
      deliveryTime: 15,
      priority: 6
    }
  ]);
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    // Simulate progressive data loading
    const loadData = () => {
      sections.forEach((section) => {
        if (section.status === 'locked') return;
        
        // Start loading
        setTimeout(() => {
          setSections(prev => prev.map(s => 
            s.id === section.id 
              ? { ...s, status: 'loading' as const, progress: 0 }
              : s
          ));
        }, section.deliveryTime * 100);
        
        // Progress updates
        const progressInterval = setInterval(() => {
          setSections(prev => prev.map(s => {
            if (s.id === section.id && s.status === 'loading') {
              const newProgress = Math.min((s.progress || 0) + 10, 100);
              return {
                ...s,
                progress: newProgress,
                status: newProgress === 100 ? 'complete' as const : 'loading' as const,
                data: newProgress === 100 ? generateMockData(section.id) : undefined
              };
            }
            return s;
          }));
        }, section.deliveryTime * 10);
        
        // Cleanup
        setTimeout(() => {
          clearInterval(progressInterval);
        }, section.deliveryTime * 120);
      });
    };
    
    loadData();
  }, []);
  
  const generateMockData = (sectionId: string) => {
    const mockData: Record<string, Record<string, unknown>> = {
      basic_profile: {
        name: 'Dr. Gregory White',
        specialty: 'General Dentistry',
        yearsExperience: 15,
        education: 'NYU College of Dentistry',
        rating: 4.8,
        patientCount: '2,000+'
      },
      practice_details: {
        practiceName: 'Pure Dental',
        location: 'Buffalo, NY',
        size: 'Medium (5-10 providers)',
        technology: ['Digital X-rays', 'Electronic Health Records', 'Online Scheduling'],
        growth: '+15% YoY'
      },
      review_analysis: {
        sentiment: 'Very Positive',
        strengths: ['Gentle approach', 'Modern technology', 'Efficient scheduling'],
        opportunities: ['Shorter wait times', 'Weekend availability'],
        responseRate: '95%'
      },
      psychology: {
        decisionStyle: 'Analytical',
        motivators: ['Patient outcomes', 'Efficiency', 'Technology'],
        communicationPreference: 'Data-driven presentations',
        bestApproach: 'Lead with ROI and patient satisfaction metrics'
      },
      outreach: {
        bestChannel: 'Email',
        bestTime: 'Tuesday 10-11 AM',
        subject: 'Enhancing Patient Experience at Pure Dental',
        openProbability: '87%',
        personalizations: 5
      },
      timing: {
        optimalDay: 'Tuesday',
        optimalTime: '10:00 AM - 11:00 AM',
        avoidDays: ['Monday', 'Friday afternoon'],
        urgencyLevel: 'Medium-High',
        competitorActivity: 'Low'
      }
    };
    
    return mockData[sectionId] || {};
  };
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };
  
  const renderSectionContent = (section: ResultSection) => {
    if (section.status === 'locked') {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          py: 3,
          opacity: 0.5
        }}>
          <Lock sx={{ fontSize: 48, color: '#666', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
            {SUBSCRIPTION_TIERS[section.tier]?.displayName} Feature
          </Typography>
          <Chip 
            label="UPGRADE TO UNLOCK"
            icon={<Bolt />}
            onClick={onUpgradeClick}
            sx={{
              background: 'linear-gradient(90deg, #FFD700 0%, #FF6B6B 100%)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
        </Box>
      );
    }
    
    if (section.status === 'pending') {
      return (
        <Box sx={{ textAlign: 'center', py: 3, opacity: 0.5 }}>
          <RadioButtonUnchecked sx={{ fontSize: 48, color: '#666' }} />
          <Typography sx={{ color: '#999', mt: 1 }}>
            {getDeliveryMessage(section.deliveryTime)}
          </Typography>
        </Box>
      );
    }
    
    if (section.status === 'loading') {
      return (
        <Box>
          <LinearProgress 
            variant="determinate" 
            value={section.progress || 0}
            sx={{
              height: 6,
              borderRadius: 3,
              mb: 2,
              background: 'rgba(255,255,255,0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                borderRadius: 3
              }
            }}
          />
          <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Skeleton variant="rectangular" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)', mt: 1 }} />
        </Box>
      );
    }
    
    // Render actual data
    const data = section.data || {};
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {Object.entries(data).map(([key, value]) => (
          <Box key={key} sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#00ffc6', 
                textTransform: 'uppercase',
                letterSpacing: '0.1em'
              }}
            >
              {key.replace(/_/g, ' ')}
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#fff',
                fontWeight: Array.isArray(value) ? 400 : 600
              }}
            >
              {Array.isArray(value) 
                ? value.join(', ')
                : typeof value === 'object' && value !== null
                ? JSON.stringify(value, null, 2)
                : String(value)
              }
            </Typography>
          </Box>
        ))}
      </motion.div>
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <AnimatePresence>
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StyledCard 
              tier={section.status === 'locked' ? 'locked' : section.tier}
              sx={{ mb: 2 }}
            >
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: expandedSections.has(section.id) ? 2 : 0
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      color: section.status === 'complete' ? '#00ffc6' : '#666',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {section.icon}
                    </Box>
                    
                    <Box>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
                        {section.title}
                      </Typography>
                      {section.status === 'loading' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <PulsingDot />
                          <Typography variant="caption" sx={{ color: '#00ffc6' }}>
                            Analyzing... {section.progress}%
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {section.status === 'complete' && (
                      <Chip 
                        size="small"
                        icon={<Speed />}
                        label={`${section.deliveryTime}s`}
                        sx={{ 
                          background: 'rgba(0, 255, 198, 0.1)',
                          color: '#00ffc6',
                          border: '1px solid #00ffc6'
                        }}
                      />
                    )}
                    
                    {section.tier === 'genius' && section.status !== 'locked' && (
                      <Tooltip title="Genius Feature">
                        <AutoAwesome sx={{ color: '#FFD700', fontSize: 20 }} />
                      </Tooltip>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => toggleSection(section.id)}
                      disabled={section.status !== 'complete'}
                      sx={{ color: '#fff' }}
                    >
                      {expandedSections.has(section.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                </Box>
                
                <Collapse in={expandedSections.has(section.id)}>
                  {renderSectionContent(section)}
                </Collapse>
              </CardContent>
            </StyledCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}