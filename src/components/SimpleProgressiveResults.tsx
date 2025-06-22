/**
 * SIMPLE PROGRESSIVE RESULTS - NO LOOPS, JUST SHOW DATA
 */

import { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, LinearProgress, Button, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Lock, AutoAwesome, TrendingUp } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  doctorName: string;
  userTier: string;
  onUpgradeClick: () => void;
}

export default function SimpleProgressiveResults({ doctorName, userTier, onUpgradeClick }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [sections, setSections] = useState([
    { id: 'basic', title: 'Basic Profile', progress: 0, complete: false },
    { id: 'practice', title: 'Practice Details', progress: 0, complete: false },
    { id: 'reviews', title: 'Patient Reviews', progress: 0, complete: false },
    { id: 'outreach', title: 'Outreach Strategy', progress: 0, complete: false }
  ]);
  
  useEffect(() => {
    // Simple progressive loading - no loops, just timeouts
    const timers = [
      setTimeout(() => updateSection('basic', 100), 500),
      setTimeout(() => updateSection('practice', 100), 1500),
      setTimeout(() => updateSection('reviews', 100), 2500),
      setTimeout(() => updateSection('outreach', 100), 3500)
    ];
    
    return () => timers.forEach(clearTimeout);
  }, []);
  
  const updateSection = (id: string, progress: number) => {
    setSections(prev => prev.map(s => 
      s.id === id ? { ...s, progress, complete: progress === 100 } : s
    ));
  };
  
  const mockData = {
    basic: {
      name: `Dr. ${doctorName}`,
      specialty: 'General Dentistry',
      experience: '15 years',
      rating: '4.8/5'
    },
    practice: {
      name: 'Premier Dental Care',
      location: 'New York, NY',
      size: 'Medium Practice',
      technology: 'Modern EMR'
    },
    reviews: {
      total: '127 reviews',
      sentiment: 'Very Positive',
      highlights: 'Gentle, Professional, Efficient'
    },
    outreach: {
      channel: 'Email preferred',
      timing: 'Tuesday 10-11 AM',
      approach: 'Technology benefits focus'
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      {sections.map((section, index) => (
        <motion.div
          key={section.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card sx={{ 
            mb: 2, 
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
            border: '1px solid #00ffc6'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                {section.title}
              </Typography>
              
              {section.progress < 100 ? (
                <LinearProgress 
                  variant="determinate" 
                  value={section.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)'
                    }
                  }}
                />
              ) : (
                <Box sx={{ color: '#fff' }}>
                  {Object.entries(mockData[section.id as keyof typeof mockData] || {}).map(([key, value]) => (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ color: '#00ffc6', textTransform: 'uppercase' }}>
                        {key}
                      </Typography>
                      <Typography variant="body1">
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
      
      {/* Sign up prompt for non-authenticated users */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 }}
        >
          <Card sx={{ 
            mt: 3,
            background: 'linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(123,66,246,0.1) 100%)',
            border: '1px solid rgba(0,255,198,0.3)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <AutoAwesome sx={{ fontSize: 48, color: '#00ffc6', mb: 2 }} />
              <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                Unlock Full Canvas Intelligence
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Sign up to save your research, access deeper insights, and leverage AI-powered sales strategies
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
                <Chip icon={<TrendingUp />} label="Unlimited Scans" sx={{ color: '#00ffc6' }} />
                <Chip icon={<Lock />} label="Save Research" sx={{ color: '#00ffc6' }} />
                <Chip icon={<AutoAwesome />} label="AI Agents" sx={{ color: '#00ffc6' }} />
              </Box>
              
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 50,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 30px rgba(0,255,198,0.3)'
                  }
                }}
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Upgrade prompt for free tier users */}
      {user && userTier === 'free' && (
        <Card sx={{ 
          mt: 3,
          background: 'linear-gradient(90deg, #FFD700 0%, #FF6B6B 100%)',
          cursor: 'pointer'
        }}
        onClick={onUpgradeClick}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#fff', textAlign: 'center' }}>
              🚀 Upgrade for Deep Intelligence & Instant Results
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}