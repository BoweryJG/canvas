import React, { useState, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AutoAwesome,
  Close,
  TrendingUp,
  Psychology,
  Analytics,
  Campaign
} from '@mui/icons-material';

// Floating chat button with RepSpheres styling
const FloatingButton = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})<{ isExpanded: boolean }>`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 999;
  
  ${props => props.isExpanded && `
    bottom: 20px;
    right: 20px;
  `}
`;

const ChatButton = styled(IconButton)`
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #9f58fa 0%, #4B96DC 100%);
  color: white;
  box-shadow: 
    0 4px 20px rgba(159, 88, 250, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transform: translate(-50%, -50%) scale(0);
    transition: transform 0.5s ease;
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 
      0 6px 30px rgba(159, 88, 250, 0.5),
      0 0 0 2px rgba(255, 255, 255, 0.2) inset;
    
    &::before {
      transform: translate(-50%, -50%) scale(2);
    }
  }
`;

// Pulse animation for attention
const PulseRing = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid rgba(159, 88, 250, 0.6);
  animation: pulse-ring 2s ease-out infinite;
  
  @keyframes pulse-ring {
    0% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1.5);
      opacity: 0;
    }
  }
`;

// Expanded panel container
const ExpandedPanel = styled(motion.div)`
  position: fixed;
  bottom: 100px;
  right: 30px;
  width: 380px;
  max-height: 600px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 
    0 20px 50px rgba(0, 0, 0, 0.5),
    inset 0 0 50px rgba(255, 255, 255, 0.02);
  overflow: hidden;
  z-index: 998;
  
  @media (max-width: 480px) {
    width: calc(100vw - 40px);
    right: 20px;
    bottom: 90px;
  }
`;

// Panel header
const PanelHeader = styled(Box)`
  padding: 20px;
  background: linear-gradient(135deg, rgba(159, 88, 250, 0.1) 0%, rgba(75, 150, 220, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Agent card
const AgentCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg, 
      transparent 0%, 
      rgba(var(--agent-color, 0, 255, 198), 0.05) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    border-color: rgba(var(--agent-color, 0, 255, 198), 0.3);
    transform: translateY(-2px);
    
    &::before {
      opacity: 1;
    }
  }
`;

const AgentIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'color',
})<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 12px;
    background: ${props => props.color};
    opacity: 0.2;
    filter: blur(8px);
  }
`;

// Agent definitions
const agents = [
  {
    id: 'market-intelligence',
    name: 'Market Intelligence AI',
    description: 'Deep market analysis and competitive insights',
    icon: TrendingUp,
    color: 'linear-gradient(135deg, #4bd48e 0%, #00ff88 100%)',
    accentColor: '77, 212, 142'
  },
  {
    id: 'clinical-advisor',
    name: 'Clinical Advisor AI',
    description: 'Medical expertise and clinical trial analysis',
    icon: Psychology,
    color: 'linear-gradient(135deg, #9f58fa 0%, #B01EFF 100%)',
    accentColor: '159, 88, 250'
  },
  {
    id: 'sales-strategist',
    name: 'Sales Strategist AI',
    description: 'Personalized outreach and sales optimization',
    icon: Campaign,
    color: 'linear-gradient(135deg, #ff6b35 0%, #f53969 100%)',
    accentColor: '255, 107, 53'
  },
  {
    id: 'analytics-engine',
    name: 'Analytics Engine AI',
    description: 'Data-driven insights and performance tracking',
    icon: Analytics,
    color: 'linear-gradient(135deg, #4B96DC 0%, #00d4ff 100%)',
    accentColor: '75, 150, 220'
  }
];

const EnhancedChatLauncher: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [, setSelectedAgent] = useState<string | null>(null);
  const [showPulse, setShowPulse] = useState(true);
  
  useEffect(() => {
    // Hide pulse after first interaction
    if (isExpanded) {
      setShowPulse(false);
    }
  }, [isExpanded]);
  
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    if (isExpanded) {
      setSelectedAgent(null);
    }
  };
  
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    // Here you would launch the actual agent chat interface
    console.log('Selected agent:', agentId);
  };
  
  return (
    <>
      <FloatingButton isExpanded={isExpanded}>
        {showPulse && !isExpanded && <PulseRing />}
        <ChatButton onClick={handleToggle}>
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: 0 }}
                animate={{ rotate: 180 }}
                exit={{ rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <Close />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AutoAwesome sx={{ fontSize: 28 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </ChatButton>
      </FloatingButton>
      
      <AnimatePresence>
        {isExpanded && (
          <ExpandedPanel
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
          >
            <PanelHeader>
              <Box>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                  AI Sales Assistants
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  Select an AI agent to enhance your workflow
                </Typography>
              </Box>
            </PanelHeader>
            
            <Box sx={{ p: 1, maxHeight: 480, overflowY: 'auto' }}>
              {agents.map((agent, index) => (
                <AgentCard
                  key={agent.id}
                  style={{ '--agent-color': agent.accentColor } as any}
                  onClick={() => handleAgentSelect(agent.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AgentIcon color={agent.color}>
                    <agent.icon sx={{ color: 'white', fontSize: 24 }} />
                  </AgentIcon>
                  
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
                    {agent.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                    {agent.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: agent.color,
                      animation: 'pulse 2s infinite'
                    }} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Ready to assist
                    </Typography>
                  </Box>
                </AgentCard>
              ))}
            </Box>
            
            <Box sx={{ 
              p: 2, 
              borderTop: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(0,0,0,0.3)'
            }}>
              <Typography variant="caption" sx={{ 
                color: 'rgba(255,255,255,0.4)', 
                textAlign: 'center',
                display: 'block'
              }}>
                Powered by RepSpheres Intelligence
              </Typography>
            </Box>
          </ExpandedPanel>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedChatLauncher;