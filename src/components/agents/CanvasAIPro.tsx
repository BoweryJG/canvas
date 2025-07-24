import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  Box, 
  IconButton, 
  Typography,
  TextField,
  Chip,
  Avatar,
  LinearProgress,
  Tooltip,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import {
  AutoAwesome,
  Send,
  Mic,
  MicOff,
  Close,
  TrendingUp,
  Psychology,
  Analytics,
  PersonSearch,
  BusinessCenter,
  LocalHospital,
  AttachMoney,
  Timeline,
  ViewInAr,
  BubbleChart
} from '@mui/icons-material';
import { searchDoctorsByName } from '../../lib/npiLookup';

// Speech Recognition type declarations
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}
// import { isRecord } from '../../types/components'; // Not used yet

// Real-time data visualization component
const DataOrb = ({ data, color }: { data: number; color: string }) => {
  const scale = useMotionValue(1);
  const opacity = useTransform(scale, [0.8, 1.2], [0.3, 1]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      scale.set(0.8 + Math.random() * 0.4);
    }, 2000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, [scale]);

  return (
    <motion.div
      style={{
        width: 8 + data * 2,
        height: 8 + data * 2,
        borderRadius: '50%',
        background: color,
        position: 'absolute',
        scale,
        opacity,
        filter: 'blur(1px)',
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80}%`
      }}
      animate={{
        x: [-10, 10, -10],
        y: [-10, 10, -10]
      }}
      transition={{
        duration: 5 + Math.random() * 5,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  );
};

// Voice waveform visualizer
const VoiceWaveform = ({ isActive }: { isActive: boolean }) => {
  const bars = Array.from({ length: 5 });
  
  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', height: 20 }}>
      {bars.map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 3,
            backgroundColor: '#00ffc6',
            borderRadius: 2
          }}
          animate={{
            height: isActive ? [4, 20, 4] : 4
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: i * 0.1
          }}
        />
      ))}
    </Box>
  );
};

// Message type
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: Record<string, unknown>;
  visualization?: string;
}

// AI Response type
interface AIResponse {
  content: string;
  data?: Record<string, unknown>;
  visualization?: string;
  context?: Record<string, unknown>;
}

// Insight card component interface
interface InsightCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: React.ReactNode;
  color: string;
}

// Insight card component
const InsightCard = ({ title, value, trend, icon, color }: InsightCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <Box
      sx={{
        p: 2,
        background: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.3)}`,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: alpha(color, 0.15),
          boxShadow: `0 4px 20px ${alpha(color, 0.3)}`
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        {icon}
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
        {value}
      </Typography>
      {trend && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          <TrendingUp sx={{ fontSize: 14, color: '#4caf50' }} />
          <Typography variant="caption" sx={{ color: '#4caf50' }}>
            {trend}
          </Typography>
        </Box>
      )}
    </Box>
  </motion.div>
);

export const CanvasAIPro: React.FC = () => {
  const theme = useTheme();
  // const { } = useAuth(); // Removed empty destructuring
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeContext, setActiveContext] = useState<Record<string, unknown> | null>(null);
  const [showDataViz, setShowDataViz] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as Window & { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result: SpeechRecognitionResult) => result[0])
          .map((result: SpeechRecognitionAlternative) => result.transcript)
          .join('');
        
        setInput(transcript);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  // Toggle voice input
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // Process user input
  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Simulate AI processing with real Canvas data
      const response = await processAIQuery(input, activeContext);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.content,
        timestamp: new Date(),
        data: response.data,
        visualization: response.visualization
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update context if needed
      if (response.context) {
        setActiveContext(response.context);
      }
    } catch (error) {
      console.error('AI processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process AI query with Canvas integration
  const processAIQuery = async (query: string, context: Record<string, unknown> | null): Promise<AIResponse> => {
    // Detect intent
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('doctor') || lowerQuery.includes('practice')) {
      // Search for doctors
      const doctors = await searchDoctorsByName(query);
      if (doctors.length > 0) {
        return {
          content: `I found ${doctors.length} doctors matching your search. Here are the top results with insights on their practice focus and potential opportunities.`,
          data: { doctors } as Record<string, unknown>,
          visualization: 'network',
          context: { doctors }
        };
      }
    }
    
    if (lowerQuery.includes('analyze') || lowerQuery.includes('insights')) {
      // Generate intelligent analysis
      const analysis = {
        query,
        context: context || {},
        insights: [
          'High potential for dental equipment sales',
          'Recent expansion in practice indicates growth opportunity',
          'Focus on aesthetic procedures suggests premium product interest'
        ]
      };
      
      return {
        content: `Based on my analysis, here are the key insights and opportunities I've identified.`,
        data: analysis,
        visualization: 'insights'
      };
    }
    
    if (lowerQuery.includes('report') || lowerQuery.includes('summary')) {
      // Generate professional report
      const report = {
        type: 'executive',
        data: context,
        sections: [
          { title: 'Executive Summary', content: 'Strategic insights for your sales approach' },
          { title: 'Market Analysis', content: 'Current market conditions and opportunities' },
          { title: 'Recommendations', content: 'Actionable steps for closing deals' }
        ],
        timestamp: new Date()
      };
      
      return {
        content: `I've generated a comprehensive report with actionable recommendations.`,
        data: report,
        visualization: 'timeline'
      };
    }
    
    // Default intelligent response
    return {
      content: `I understand you're looking for ${query}. Let me analyze the Canvas database and provide you with strategic insights.`,
      data: { query, timestamp: new Date() },
      visualization: 'chart'
    };
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Floating AI Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1300
            }}
          >
            <Tooltip title="Alexis - AI Assistant" placement="left">
              <IconButton
                onClick={() => setIsOpen(true)}
                sx={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
                  boxShadow: '0 8px 32px rgba(0,255,198,0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #00e0b0 0%, #6b39d6 100%)'
                  }
                }}
              >
                <AutoAwesome sx={{ fontSize: 32, color: 'white' }} />
              </IconButton>
            </Tooltip>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              width: isExpanded ? 800 : 400,
              height: isExpanded ? '80vh' : 600
            }}
            exit={{ opacity: 0, scale: 0.8, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1300,
              maxHeight: '90vh'
            }}
          >
            <Box
              sx={{
                height: '100%',
                background: 'rgba(10,10,20,0.95)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(0,255,198,0.2)',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(123,66,246,0.1) 100%)',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)'
                    }}
                  >
                    <AutoAwesome />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
                      Alexis
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Your intelligent sales companion
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => setShowDataViz(!showDataViz)}
                    sx={{ color: 'white' }}
                  >
                    <BubbleChart />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{ color: 'white' }}
                  >
                    <ViewInAr />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setIsOpen(false)}
                    sx={{ color: 'white' }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>

              {/* Active Context Bar */}
              {activeContext && (
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    background: alpha(theme.palette.primary.main, 0.1),
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    overflowX: 'auto'
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Context:
                  </Typography>
                  {Boolean(activeContext['doctors'] && Array.isArray(activeContext['doctors'])) && (
                    <Chip
                      size="small"
                      icon={<PersonSearch />}
                      label={`${Array.isArray(activeContext['doctors']) ? (activeContext['doctors'] as unknown[]).length : 0} Doctors`}
                      sx={{ background: 'rgba(76,175,80,0.2)', color: '#4caf50' }}
                    />
                  )}
                  {Boolean(activeContext['procedures']) && (
                    <Chip
                      size="small"
                      icon={<LocalHospital />}
                      label="Procedures"
                      sx={{ background: 'rgba(33,150,243,0.2)', color: '#2196f3' }}
                    />
                  )}
                  {Boolean(activeContext['insights']) && (
                    <Chip
                      size="small"
                      icon={<Analytics />}
                      label="Insights"
                      sx={{ background: 'rgba(255,152,0,0.2)', color: '#ff9800' }}
                    />
                  )}
                </Box>
              )}

              {/* Messages Area */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  position: 'relative'
                }}
              >
                {/* Background Data Visualization */}
                {showDataViz && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      pointerEvents: 'none',
                      opacity: 0.3
                    }}
                  >
                    {[...Array(10)].map((_, i) => (
                      <DataOrb
                        key={i}
                        data={Math.random() * 10}
                        color={i % 2 === 0 ? '#00ffc6' : '#7B42F6'}
                      />
                    ))}
                  </Box>
                )}

                {/* Welcome Message */}
                {messages.length === 0 && (
                  <Fade in timeout={1000}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
                        Welcome to Alexis
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
                        I can help you analyze doctors, identify opportunities, and create winning strategies.
                      </Typography>
                      
                      {/* Quick Actions */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {[
                          { icon: <PersonSearch />, label: 'Find Doctors', query: 'Find top dentists in my area' },
                          { icon: <Analytics />, label: 'Market Analysis', query: 'Analyze market opportunities' },
                          { icon: <BusinessCenter />, label: 'Sales Strategy', query: 'Create sales strategy' },
                          { icon: <Timeline />, label: 'Performance', query: 'Show my performance metrics' }
                        ].map((action, i) => (
                          <Chip
                            key={i}
                            icon={action.icon}
                            label={action.label}
                            onClick={() => setInput(action.query)}
                            sx={{
                              cursor: 'pointer',
                              background: 'rgba(255,255,255,0.1)',
                              color: 'white',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.2)'
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Fade>
                )}

                {/* Messages */}
                {messages.map((message) => (
                  <Fade key={message.id} in timeout={300}>
                    <Box
                      sx={{
                        mb: 2,
                        display: 'flex',
                        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '80%',
                          p: 2,
                          borderRadius: 2,
                          background: message.type === 'user' 
                            ? 'linear-gradient(135deg, #00ffc6 0%, #00e0b0 100%)'
                            : 'rgba(255,255,255,0.1)',
                          color: message.type === 'user' ? '#000' : '#fff',
                          position: 'relative'
                        }}
                      >
                        <Typography variant="body2">{message.content}</Typography>
                        
                        {/* Data Visualization */}
                        {message.visualization && (
                          <Box sx={{ mt: 2 }}>
                            {message.visualization === 'insights' && (
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                                <InsightCard
                                  title="Opportunity Score"
                                  value="92%"
                                  trend="+12%"
                                  icon={<TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />}
                                  color="#4caf50"
                                />
                                <InsightCard
                                  title="Market Fit"
                                  value="High"
                                  icon={<Psychology sx={{ fontSize: 16, color: '#2196f3' }} />}
                                  color="#2196f3"
                                />
                                <InsightCard
                                  title="Revenue Potential"
                                  value="$125K"
                                  trend="+18%"
                                  icon={<AttachMoney sx={{ fontSize: 16, color: '#ff9800' }} />}
                                  color="#ff9800"
                                />
                                <InsightCard
                                  title="Close Rate"
                                  value="78%"
                                  icon={<BusinessCenter sx={{ fontSize: 16, color: '#9c27b0' }} />}
                                  color="#9c27b0"
                                />
                              </Box>
                            )}
                          </Box>
                        )}
                        
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block', 
                            mt: 1, 
                            opacity: 0.7 
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Fade>
                ))}
                
                {/* Processing Indicator */}
                {isProcessing && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)'
                      }}
                    >
                      <AutoAwesome sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Canvas AI is thinking...
                      </Typography>
                      <LinearProgress 
                        sx={{ 
                          mt: 0.5,
                          background: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #00ffc6 0%, #7B42F6 100%)'
                          }
                        }} 
                      />
                    </Box>
                  </Box>
                )}
                
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box
                sx={{
                  p: 2,
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.3)'
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  {isListening && <VoiceWaveform isActive={isListening} />}
                  
                  <TextField
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask me anything about sales opportunities..."
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: 3,
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.2)'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#00ffc6'
                        }
                      }
                    }}
                  />
                  
                  <IconButton
                    onClick={toggleVoice}
                    sx={{ 
                      color: isListening ? '#00ffc6' : 'white',
                      background: isListening ? 'rgba(0,255,198,0.1)' : 'transparent'
                    }}
                  >
                    {isListening ? <Mic /> : <MicOff />}
                  </IconButton>
                  
                  <IconButton
                    onClick={handleSend}
                    disabled={!input.trim() || isProcessing}
                    sx={{
                      background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #00e0b0 0%, #6b39d6 100%)'
                      },
                      '&:disabled': {
                        opacity: 0.5
                      }
                    }}
                  >
                    <Send />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};