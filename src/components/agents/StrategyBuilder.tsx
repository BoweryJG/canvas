import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  Collapse,
  IconButton,
  TextField,
  Chip,
  Stack,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Build,
  ContentCopy,
  Download,
  Send,
  CheckCircle,
  Edit,
  Psychology
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { MockDataProvider, MockDoctor } from '../../lib/mockDataProvider';

const StrategySection = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 12,
  padding: 16,
  marginBottom: 12
});

const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    color: 'white',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.3)'
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)'
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none'
  }
});

interface StrategyBuilderProps {
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
}

const StrategyBuilder: React.FC<StrategyBuilderProps> = ({
  agent,
  context,
  isDemo,
  expanded,
  onToggle
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [strategy, setStrategy] = useState({
    approach: '',
    keyPoints: [] as string[],
    personalizations: [] as string[],
    callToAction: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    'Analyze Practice Profile',
    'Define Approach',
    'Personalize Message',
    'Craft Call-to-Action'
  ];

  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (isDemo && context.doctorId) {
      const doctor = MockDataProvider.getDoctor(context.doctorId);
      if (doctor) {
        const generatedStrategy = generateStrategyForDoctor(doctor, agent);
        setStrategy(generatedStrategy);
        setActiveStep(1);
      }
    }
    
    setIsGenerating(false);
  };

  const generateStrategyForDoctor = (doctor: MockDoctor, agent: any) => {
    const personalizations = MockDataProvider.generatePersonalizedStrategy(doctor);
    
    let approach = '';
    let keyPoints: string[] = [];
    let cta = '';

    switch (agent.id) {
      case 'strategist':
        approach = `Position as strategic growth partner for ${doctor.practiceInfo.name}`;
        keyPoints = [
          `Leverage ${doctor.marketIntelligence.growthTrend} growth trend`,
          `Address ${doctor.marketIntelligence.competitorCount} competitor landscape`,
          `Focus on ${doctor.marketIntelligence.opportunities[0]}`
        ];
        cta = 'Schedule a strategic growth consultation';
        break;

      case 'specialist':
        approach = `Technical excellence partnership for advanced procedures`;
        keyPoints = [
          `Support ${doctor.procedures.dental?.length || 0} dental procedures`,
          doctor.procedures.aesthetic ? 'Expand aesthetic service line' : 'Introduce aesthetic services',
          'Provide clinical education and support'
        ];
        cta = 'Book a clinical innovation session';
        break;

      case 'relationship':
        approach = `Build trust through shared values and patient success`;
        keyPoints = [
          `Align with ${doctor.socialPresence.googleRating} star reputation`,
          `Support ${doctor.metrics.patientVolume} patient base`,
          `Emphasize ${doctor.metrics.yearsInPractice} years of excellence`
        ];
        cta = 'Start with a friendly introduction call';
        break;

      case 'analyst':
        approach = `Data-driven optimization for measurable growth`;
        keyPoints = [
          `Improve from ${doctor.marketIntelligence.marketShare} market position`,
          `Optimize for ${doctor.metrics.acceptsNewPatients ? 'new patient acquisition' : 'patient retention'}`,
          'Track ROI and performance metrics'
        ];
        cta = 'Request your free practice analysis';
        break;
    }

    return {
      approach,
      keyPoints,
      personalizations,
      callToAction: cta
    };
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setStrategy({
      approach: '',
      keyPoints: [],
      personalizations: [],
      callToAction: ''
    });
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
          <Build sx={{ color: '#764ba2' }} />
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
            Strategy Builder
          </Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'white' }}>
          {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {!context.doctorId ? (
            <Alert 
              severity="info" 
              sx={{ 
                background: 'rgba(33, 150, 243, 0.1)',
                color: 'white',
                border: '1px solid rgba(33, 150, 243, 0.3)'
              }}
            >
              Select a doctor from your research to build a personalized strategy.
            </Alert>
          ) : (
            <Box>
              {/* Generate Button */}
              {activeStep === 0 && (
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<Psychology />}
                    onClick={handleGenerateStrategy}
                    disabled={isGenerating}
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      px: 3,
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                      }
                    }}
                  >
                    {isGenerating ? 'Generating Strategy...' : 'Generate AI Strategy'}
                  </Button>
                </Box>
              )}

              {/* Stepper */}
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      sx={{
                        '& .MuiStepLabel-label': {
                          color: 'rgba(255, 255, 255, 0.9)'
                        },
                        '& .MuiStepLabel-label.Mui-active': {
                          color: 'white',
                          fontWeight: 600
                        },
                        '& .MuiStepLabel-label.Mui-completed': {
                          color: 'rgba(76, 175, 80, 0.9)'
                        }
                      }}
                    >
                      {label}
                    </StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        {index === 0 && (
                          <StrategySection elevation={0}>
                            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                              AI is analyzing the practice profile, market position, and opportunities...
                            </Typography>
                            {isGenerating && (
                              <motion.div
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              >
                                <Typography variant="body2" sx={{ color: '#667eea' }}>
                                  Processing data...
                                </Typography>
                              </motion.div>
                            )}
                          </StrategySection>
                        )}

                        {index === 1 && strategy.approach && (
                          <StrategySection elevation={0}>
                            <Typography variant="subtitle2" sx={{ color: '#667eea', mb: 1 }}>
                              Strategic Approach
                            </Typography>
                            <StyledTextField
                              fullWidth
                              multiline
                              rows={2}
                              value={strategy.approach}
                              onChange={(e) => setStrategy({ ...strategy, approach: e.target.value })}
                              variant="outlined"
                            />
                          </StrategySection>
                        )}

                        {index === 2 && strategy.keyPoints.length > 0 && (
                          <StrategySection elevation={0}>
                            <Typography variant="subtitle2" sx={{ color: '#764ba2', mb: 2 }}>
                              Key Personalization Points
                            </Typography>
                            <Stack spacing={1}>
                              {strategy.keyPoints.map((point, i) => (
                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <CheckCircle sx={{ fontSize: 16, color: 'rgba(76, 175, 80, 0.8)' }} />
                                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                                    {point}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                            
                            {strategy.personalizations.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                  ADDITIONAL INSIGHTS:
                                </Typography>
                                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                                  {strategy.personalizations.map((p, i) => (
                                    <Chip 
                                      key={i}
                                      label={p}
                                      size="small"
                                      sx={{
                                        background: 'rgba(118, 75, 162, 0.2)',
                                        color: '#f093fb',
                                        border: '1px solid rgba(118, 75, 162, 0.3)'
                                      }}
                                    />
                                  ))}
                                </Stack>
                              </Box>
                            )}
                          </StrategySection>
                        )}

                        {index === 3 && strategy.callToAction && (
                          <StrategySection elevation={0}>
                            <Typography variant="subtitle2" sx={{ color: '#f093fb', mb: 1 }}>
                              Call to Action
                            </Typography>
                            <StyledTextField
                              fullWidth
                              value={strategy.callToAction}
                              onChange={(e) => setStrategy({ ...strategy, callToAction: e.target.value })}
                              variant="outlined"
                            />
                            
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                startIcon={<ContentCopy />}
                                sx={{ color: 'white' }}
                              >
                                Copy
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Download />}
                                sx={{ color: 'white' }}
                              >
                                Export
                              </Button>
                              <Button
                                size="small"
                                startIcon={<Send />}
                                sx={{ color: 'white' }}
                              >
                                Send
                              </Button>
                            </Box>
                          </StrategySection>
                        )}
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Button
                          disabled={index === 0}
                          onClick={handleBack}
                          sx={{ mt: 1, mr: 1, color: 'white' }}
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{ 
                            mt: 1,
                            background: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.2)'
                            }
                          }}
                        >
                          {index === steps.length - 1 ? 'Finish' : 'Continue'}
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              
              {activeStep === steps.length && (
                <Paper square elevation={0} sx={{ p: 3, background: 'transparent' }}>
                  <Typography sx={{ color: 'white', mb: 2 }}>
                    Strategy completed! Ready to engage with {
                      MockDataProvider.getDoctor(context.doctorId)?.name
                    }.
                  </Typography>
                  <Button onClick={handleReset} sx={{ color: 'white' }}>
                    Create Another Strategy
                  </Button>
                </Paper>
              )}
            </Box>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default StrategyBuilder;