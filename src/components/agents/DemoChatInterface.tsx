import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  metadata?: any;
}

interface DemoAgent {
  id: string;
  name: string;
  avatar_url?: string;
  specialty: string[];
  personality: {
    tone: string;
    expertise: string[];
    traits: string[];
  };
}

const DEMO_AGENTS: DemoAgent[] = [
  {
    id: 'demo-1',
    name: 'Sarah Sales Pro',
    specialty: ['Medical Device Sales', 'Aesthetic Procedures'],
    personality: {
      tone: 'professional',
      expertise: ['CoolSculpting', 'Botox', 'Dermal Fillers'],
      traits: ['knowledgeable', 'persuasive', 'relationship-focused']
    }
  },
  {
    id: 'demo-2',
    name: 'Dr. Tech Expert',
    specialty: ['Dental Technology', 'Practice Growth'],
    personality: {
      tone: 'technical',
      expertise: ['YOMI Robotic Surgery', 'Digital Dentistry', 'CAD/CAM'],
      traits: ['analytical', 'detail-oriented', 'innovative']
    }
  },
  {
    id: 'demo-3',
    name: 'Maya Market Intel',
    specialty: ['Market Analysis', 'Competitive Intelligence'],
    personality: {
      tone: 'strategic',
      expertise: ['Territory Analysis', 'Competitor Tracking', 'Sales Strategy'],
      traits: ['data-driven', 'strategic', 'insightful']
    }
  }
];

const DEMO_RESPONSES: Record<string, string[]> = {
  'demo-1': [
    "I can help you prepare for your meeting with aesthetic practitioners. What specific procedure or product would you like to discuss?",
    "Based on my experience with CoolSculpting, here are the key talking points that resonate with practitioners...",
    "Great question! When positioning dermal fillers, I always emphasize the ROI and patient satisfaction rates.",
  ],
  'demo-2': [
    "The YOMI robotic surgery system offers unprecedented precision in dental implant procedures. Let me explain the key benefits...",
    "Digital dentistry is transforming practices. I can help you demonstrate the workflow improvements and patient outcomes.",
    "When discussing CAD/CAM technology, focus on same-day crowns and the patient experience advantages.",
  ],
  'demo-3': [
    "I've analyzed your territory data. There are 3 key opportunities with high-volume practices that you should prioritize.",
    "Looking at competitor activity, I notice Allergan has been aggressive in this area. Here's how to differentiate...",
    "Based on market trends, aesthetic procedures are growing 15% YoY in your territory. Let me break down the segments.",
  ]
};

interface DemoChatInterfaceProps {
  onRequestAuth?: () => void;
}

const DemoChatInterface: React.FC<DemoChatInterfaceProps> = ({ onRequestAuth }) => {
  const [selectedAgent, setSelectedAgent] = useState<DemoAgent>(DEMO_AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [responseIndex, setResponseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message on mount
  useEffect(() => {
    if (!selectedAgent || !selectedAgent.name) {
      return;
    }
    
    const welcomeMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm ${selectedAgent.name}, your AI sales assistant. I specialize in ${selectedAgent.specialty && selectedAgent.specialty.length > 0 ? selectedAgent.specialty.join(' and ') : 'helping you with sales'}. How can I help you today?\n\n*Note: This is a demo mode. Sign in for full access to real-time data and personalized insights.*`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [selectedAgent]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const simulateTyping = async (text: string) => {
    setIsAgentTyping(true);
    setStreamingMessage('');
    
    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Stream the response character by character
    for (let i = 0; i < text.length; i++) {
      setStreamingMessage(prev => prev + text[i]);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    
    // Complete the message
    const completeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, completeMessage]);
    setStreamingMessage('');
    setIsAgentTyping(false);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Get demo response
    const responses = DEMO_RESPONSES[selectedAgent.id];
    const response = responses[responseIndex % responses.length];
    setResponseIndex(prev => prev + 1);
    
    // Check for keywords that might trigger auth prompt
    const authKeywords = ['real data', 'my territory', 'specific doctor', 'actual sales', 'my contacts'];
    const needsAuth = authKeywords.some(keyword => content.toLowerCase().includes(keyword));
    
    if (needsAuth) {
      await simulateTyping(`I'd love to provide specific data for your territory and contacts, but that requires authentication. Would you like to sign in to access:\n\n• Real-time territory analytics\n• Your actual doctor contacts\n• Personalized sales strategies\n• Live market data\n\n[Click here to sign in for full access]`);
    } else {
      await simulateTyping(response);
    }
  };

  const handleAgentChange = (agent: DemoAgent) => {
    setSelectedAgent(agent);
    setMessages([]);
    setResponseIndex(0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Demo banner */}
      <div className="bg-gradient-to-r from-[#fbbf24]/20 to-[#f59e0b]/20 border-b border-[#fbbf24]/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#fbbf24] rounded-full animate-pulse" />
            <span className="text-sm text-[#fbbf24]">Demo Mode</span>
          </div>
          <button
            onClick={onRequestAuth}
            className="text-xs px-3 py-1 bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 text-[#fbbf24] rounded-full transition-colors"
          >
            Sign in for full access →
          </button>
        </div>
      </div>

      {/* Agent selector */}
      <div className="p-4 border-b border-[#00ffc6]/20">
        <div className="flex gap-3 overflow-x-auto">
          {DEMO_AGENTS.map(agent => (
            <button
              key={agent.id}
              onClick={() => handleAgentChange(agent)}
              className={`flex-shrink-0 p-3 rounded-lg border transition-all ${
                selectedAgent.id === agent.id
                  ? 'border-[#00ffc6] bg-gradient-to-r from-[#00ffc6]/10 to-[#00d4ff]/10'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffc6] to-[#00d4ff] p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <span className="text-xs font-bold text-[#00ffc6]">
                      {agent.name ? agent.name.split(' ').map(n => n[0]).join('') : 'AG'}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{agent.name || 'Unknown Agent'}</div>
                  <div className="text-xs text-gray-400">
                    {agent.specialty && agent.specialty.length > 0 ? agent.specialty[0] : 'General'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            agentName={selectedAgent?.name || 'Agent'}
          />
        ))}
        
        {streamingMessage && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingMessage,
              timestamp: new Date().toISOString(),
              isStreaming: true
            }}
            agentName={selectedAgent?.name || 'Agent'}
          />
        )}
        
        {isAgentTyping && !streamingMessage && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#00ffc6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#00ffc6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#00ffc6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">{selectedAgent?.name || 'Agent'} is typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={sendMessage}
        placeholder="Try asking about sales strategies, product positioning, or market insights..."
      />
    </div>
  );
};

export default DemoChatInterface;