import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Tooltip, CircularProgress } from '@mui/material';
import premiumTheme from './styles/premium-theme';
import { documentSlideAnimation } from './styles/animations';
import { glassEffects, premiumButton } from './styles/glass-effects';
import VoiceWaveform from './VoiceWaveform';
import PremiumMessageBubble from './PremiumMessageBubble';
import { EnhancedNPILookup, type NPIDoctor } from '../../EnhancedNPILookup';
import { getApiEndpoint } from '../../../config/api';

const InterfaceContainer = styled(motion.div)({
  position: 'relative',
  width: '100%',
  maxWidth: '450px',
  height: '650px',
  maxHeight: '85vh',
  ...glassEffects.dark,
  borderRadius: premiumTheme.borderRadius.large,
  border: `1px solid ${premiumTheme.colors.electricCyan}20`,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  boxShadow: `
    0 20px 40px rgba(0, 0, 0, 0.5),
    0 0 60px ${premiumTheme.colors.electricCyan}10
  `,
});

const HeaderBar = styled('div')({
  padding: '20px',
  borderBottom: `1px solid ${premiumTheme.colors.electricCyan}20`,
  ...glassEffects.premium,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const AgentInfo = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

const AgentAvatar = styled('div')({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: premiumTheme.gradients.electricPulse,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-2px',
    borderRadius: '50%',
    background: premiumTheme.gradients.holographic,
    opacity: 0.3,
    animation: 'holographicShift 5s ease infinite',
  },
  
  '& .initial': {
    fontSize: '18px',
    fontWeight: 600,
    color: premiumTheme.colors.deepBlack,
    zIndex: 1,
  },
});

const AgentDetails = styled('div')({
  '& .name': {
    fontSize: '16px',
    fontWeight: 600,
    color: premiumTheme.colors.watchDial,
    letterSpacing: '0.02em',
  },
  
  '& .status': {
    fontSize: '12px',
    color: premiumTheme.colors.electricCyan,
    opacity: 0.8,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '2px',
    
    '& .dot': {
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background: premiumTheme.colors.successGreen,
      boxShadow: `0 0 6px ${premiumTheme.colors.successGreen}`,
    },
  },
});

const ControlButtons = styled('div')({
  display: 'flex',
  gap: '8px',
});

const IconButton = styled('button')({
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  ...glassEffects.light,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  
  '& svg': {
    width: '18px',
    height: '18px',
    color: premiumTheme.colors.electricCyan,
  },
  
  '&:hover': {
    ...glassEffects.medium,
    transform: 'scale(1.1)',
    boxShadow: `0 0 20px ${premiumTheme.colors.electricCyan}30`,
  },
  
  '&.active': {
    background: premiumTheme.gradients.electricPulse,
    
    '& svg': {
      color: premiumTheme.colors.deepBlack,
    },
  },
});

const MessagesContainer = styled('div')({
  flex: 1,
  overflowY: 'auto',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.02)',
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: premiumTheme.colors.electricCyan + '30',
    borderRadius: '3px',
  },
});

const InputArea = styled('div')({
  padding: '20px',
  borderTop: `1px solid ${premiumTheme.colors.electricCyan}20`,
  ...glassEffects.premium,
});

const InputWrapper = styled('div')({
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end',
});

const MessageInput = styled('textarea')({
  flex: 1,
  minHeight: '50px',
  maxHeight: '120px',
  padding: '12px 16px',
  background: 'rgba(255, 255, 255, 0.02)',
  border: `1px solid ${premiumTheme.colors.electricCyan}20`,
  borderRadius: premiumTheme.borderRadius.medium,
  color: premiumTheme.colors.watchDial,
  fontSize: '14px',
  fontFamily: premiumTheme.typography.executive.fontFamily,
  resize: 'none',
  outline: 'none',
  transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  
  '&:focus': {
    borderColor: premiumTheme.colors.electricCyan + '60',
    background: 'rgba(255, 255, 255, 0.04)',
    boxShadow: `0 0 20px ${premiumTheme.colors.electricCyan}10`,
  },
  
  '&::placeholder': {
    color: premiumTheme.colors.chromeAccent + '60',
  },
});

const SendButton = styled(motion.button)({
  ...premiumButton.base,
  background: premiumTheme.gradients.electricPulse,
  color: premiumTheme.colors.deepBlack,
  fontWeight: 600,
  padding: '12px 24px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  border: 'none',
  
  '&:hover': {
    ...premiumButton.hover,
    background: premiumTheme.gradients.holographic,
  },
  
  '&:active': {
    ...premiumButton.active,
  },
  
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

const CloseButton = styled('button')({
  position: 'absolute',
  top: '16px',
  right: '16px',
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  ...glassEffects.medium,
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: `all ${premiumTheme.animations.normal} ${premiumTheme.animations.smooth}`,
  
  '& svg': {
    width: '16px',
    height: '16px',
    color: premiumTheme.colors.chromeAccent,
  },
  
  '&:hover': {
    transform: 'scale(1.1) rotate(90deg)',
    background: 'rgba(255, 255, 255, 0.1)',
  },
});

const NPILookupWrapper = styled('div')({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '500px',
  zIndex: 10000,
  padding: '20px',
  background: 'rgba(10, 10, 15, 0.98)',
  backdropFilter: 'blur(30px)',
  borderRadius: premiumTheme.borderRadius.large,
  border: `1px solid ${premiumTheme.colors.electricCyan}40`,
  boxShadow: `
    0 20px 60px rgba(0, 0, 0, 0.8),
    0 0 100px ${premiumTheme.colors.electricCyan}20
  `,
});

const LoadingOverlay = styled('div')({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(5px)',
  borderRadius: premiumTheme.borderRadius.large,
  zIndex: 100,
});

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    doctorNPI?: string;
    doctorName?: string;
  };
}

interface CinematicChatInterfaceProps {
  isOpen: boolean;
  agentId: string;
  onClose: () => void;
  style?: React.CSSProperties;
}

const CinematicChatInterface: React.FC<CinematicChatInterfaceProps> = ({
  isOpen,
  agentId,
  onClose,
  style,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNPILookup, setShowNPILookup] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<NPIDoctor | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Agent configuration
  const getAgentConfig = (id: string) => {
    const configs: Record<string, { 
      name: string; 
      systemPrompt: string;
      personality: string;
    }> = {
      strategist: {
        name: 'Alexander Sterling',
        personality: 'Strategic and analytical',
        systemPrompt: `You are Alexander Sterling, an elite strategic sales consultant for RepSpheres Canvas. 
        You specialize in analyzing practice needs, identifying growth opportunities, and crafting winning strategies.
        Focus on understanding the doctor's practice, their challenges, and how RepSpheres solutions can drive success.
        Always maintain a professional, strategic approach with data-driven insights.`
      },
      qualifier: {
        name: 'Victoria Chen',
        personality: 'Insightful and thorough',
        systemPrompt: `You are Victoria Chen, a senior sales qualifier for RepSpheres Canvas.
        Your expertise is in understanding practice requirements, qualifying opportunities, and ensuring perfect solution fit.
        Ask probing questions to uncover true needs and pain points while building trust and rapport.`
      },
      closer: {
        name: 'Marcus Blackwell',
        personality: 'Confident and persuasive',
        systemPrompt: `You are Marcus Blackwell, a master closer for RepSpheres Canvas.
        You excel at presenting value propositions, handling objections, and guiding decisions.
        Focus on ROI, implementation benefits, and creating urgency while maintaining consultative approach.`
      },
      researcher: {
        name: 'Dr. Elena Rodriguez',
        personality: 'Analytical and detail-oriented',
        systemPrompt: `You are Dr. Elena Rodriguez, a research specialist for RepSpheres Canvas.
        You provide deep insights on practices, competitive landscapes, and market trends.
        Share data-driven insights and evidence-based recommendations.`
      },
      objection_handler: {
        name: 'James Mitchell',
        personality: 'Empathetic problem-solver',
        systemPrompt: `You are James Mitchell, an objection handling specialist for RepSpheres Canvas.
        You excel at addressing concerns, reframing objections as opportunities, and building confidence.
        Use empathy, logic, and success stories to overcome resistance.`
      },
      relationship_builder: {
        name: 'Sophia Laurent',
        personality: 'Warm and engaging',
        systemPrompt: `You are Sophia Laurent, a relationship specialist for RepSpheres Canvas.
        You focus on building long-term partnerships, understanding personal motivations, and creating trust.
        Be warm, authentic, and focused on the human side of business relationships.`
      },
    };
    return configs[id] || configs.strategist;
  };
  
  const agentConfig = getAgentConfig(agentId);
  
  // Send welcome message on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Welcome to the Executive Suite. I'm ${agentConfig.name}, your premium sales consultant. How may I elevate your practice today?`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, agentId, messages.length, agentConfig.name]);
  
  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleDoctorSelect = (doctor: NPIDoctor) => {
    setSelectedDoctor(doctor);
    setShowNPILookup(false);
    
    // Add system message about doctor selection
    const systemMessage: Message = {
      id: Date.now().toString(),
      role: 'system',
      content: `Doctor identified: ${doctor.displayName} (${doctor.specialty}) in ${doctor.city}, ${doctor.state}`,
      timestamp: new Date().toISOString(),
      metadata: {
        doctorNPI: doctor.npi,
        doctorName: doctor.displayName,
      }
    };
    
    setMessages(prev => [...prev, systemMessage]);
  };
  
  const sendToAgent = async (userMessage: string) => {
    setIsLoading(true);
    
    try {
      // Prepare doctor info if available
      
      // Build conversation history
      const conversationHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role,
          content: m.content
        }));
      
      // Add current message
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });
      
      // Prepare the prompt for the AI
      const fullPrompt = `${agentConfig.systemPrompt}

Current Context:
${selectedDoctor ? `- Speaking with: ${selectedDoctor.displayName}
- Specialty: ${selectedDoctor.specialty}
- Location: ${selectedDoctor.city}, ${selectedDoctor.state}
- Organization: ${selectedDoctor.organizationName || 'Private Practice'}` : '- No specific doctor identified yet'}

Conversation History:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Instructions:
- Stay in character as ${agentConfig.name}
- Be ${agentConfig.personality}
- If the user mentions a doctor name, suggest using the NPI lookup tool
- Focus on RepSpheres Canvas solutions and value propositions
- Keep responses concise but impactful

Response:`;
      
      const response = await fetch(getApiEndpoint('anthropic'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          prompt: fullPrompt,
          model: 'claude-3-5-sonnet-20241022',
          userId: `canvas-${agentId}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from agent');
      }
      
      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 
        "I apologize, but I'm having trouble processing that request. Could you please rephrase?";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error communicating with agent:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize for the technical difficulty. Let me help you understand how RepSpheres Canvas can transform your practice. What specific challenges are you facing?",
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Check if user mentions a doctor name
    const doctorPattern = /(?:dr\.?|doctor)\s+\w+|talking\s+(?:to|with|about)\s+\w+|\w+\s+(?:md|dds|do)/i;
    if (doctorPattern.test(inputValue) && !selectedDoctor) {
      // Suggest NPI lookup
      const suggestionMessage: Message = {
        id: (Date.now() + 0.5).toString(),
        role: 'system',
        content: 'It looks like you mentioned a doctor. Would you like to look them up in our NPI database for accurate information?',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, suggestionMessage]);
      setShowNPILookup(true);
    } else {
      // Send to AI agent
      await sendToAgent(inputValue);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <InterfaceContainer
            variants={documentSlideAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={style}
          >
            <HeaderBar>
              <AgentInfo>
                <AgentAvatar>
                  <span className="initial">
                    {agentConfig.name.charAt(0)}
                  </span>
                </AgentAvatar>
                <AgentDetails>
                  <div className="name">{agentConfig.name}</div>
                  <div className="status">
                    <div className="dot" />
                    <span>Executive AI • Ready to Assist</span>
                  </div>
                </AgentDetails>
              </AgentInfo>
              
              <ControlButtons>
                <Tooltip title="Voice Mode - Speak naturally with the AI">
                  <IconButton 
                    className={isVoiceMode ? 'active' : ''}
                    onClick={() => setIsVoiceMode(!isVoiceMode)}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Video Call - Face-to-face consultation">
                  <IconButton>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Settings - Configure AI preferences">
                  <IconButton>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="NPI Lookup - Find doctor information">
                  <IconButton onClick={() => setShowNPILookup(true)}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </IconButton>
                </Tooltip>
              </ControlButtons>
            </HeaderBar>
            
            <MessagesContainer>
              {messages.map((message) => (
                <PremiumMessageBubble
                  key={message.id}
                  message={message}
                  agentName={agentConfig.name}
                />
              ))}
              <div ref={messagesEndRef} />
            </MessagesContainer>
            
            {isVoiceMode ? (
              <VoiceWaveform
                isListening={isListening}
                onToggleListening={() => setIsListening(!isListening)}
              />
            ) : (
              <InputArea>
                <InputWrapper>
                  <MessageInput
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your premium inquiry here..."
                    rows={1}
                    disabled={isLoading}
                  />
                  <SendButton
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isLoading}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Send</span>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </SendButton>
                </InputWrapper>
              </InputArea>
            )}
            
            {isLoading && (
              <LoadingOverlay>
                <CircularProgress 
                  size={40} 
                  sx={{ color: premiumTheme.colors.electricCyan }}
                />
              </LoadingOverlay>
            )}
            
            <CloseButton onClick={onClose}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </CloseButton>
          </InterfaceContainer>
          
          {/* NPI Lookup Modal */}
          <AnimatePresence>
            {showNPILookup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <NPILookupWrapper>
                <CloseButton 
                  onClick={() => setShowNPILookup(false)}
                  style={{ position: 'absolute', top: '16px', right: '16px' }}
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </CloseButton>
                
                <h3 style={{ 
                  color: premiumTheme.colors.watchDial, 
                  marginBottom: '20px',
                  fontSize: '20px',
                  fontWeight: 600,
                }}>
                  Find Healthcare Professional
                </h3>
                
                <EnhancedNPILookup
                  onSelect={handleDoctorSelect}
                  placeholder="Search: Dr. Greg White Buffalo"
                  focusSpecialties={[
                    'dentist',
                    'oral surgeon',
                    'oral and maxillofacial surgery',
                    'prosthodontist',
                    'implantologist',
                    'plastic surgeon',
                    'dermatologist',
                    'cosmetic surgery'
                  ]}
                />
                
                <p style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontSize: '12px',
                  marginTop: '16px',
                  textAlign: 'center',
                }}>
                  Tip: Search includes Buffalo suburbs like Williamsville, Amherst, and Clarence
                </p>
                </NPILookupWrapper>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default CinematicChatInterface;