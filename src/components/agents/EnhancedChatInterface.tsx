import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';
import { io, Socket } from 'socket.io-client';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import AgentSelector from './AgentSelector';
import ConversationList from './ConversationList';
import ProcedureSelector from './ProcedureSelector';
import DoctorInfoCard from '../DoctorInfoCard';
import { 
  detectDoctorMentions, 
  lookupDoctorNPI, 
  findBestMatch
} from '../../lib/doctorDetection';
import type { NPIDoctorInfo, DoctorMention } from '../../lib/doctorDetection';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  metadata?: {
    doctors?: NPIDoctorInfo[];
    doctorMentions?: DoctorMention[];
    [key: string]: any;
  };
}

interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  specialty: string[];
  personality: any;
}

interface Conversation {
  id: string;
  title: string;
  agent_id: string;
  messages: Message[];
  created_at: string;
  context?: {
    doctors?: NPIDoctorInfo[];
  };
}

interface Procedure {
  id: string;
  name: string;
  category: string;
  type: 'dental' | 'aesthetic';
}

interface ChatInterfaceProps {
  defaultAgentId?: string;
  onUnreadChange?: (hasUnread: boolean) => void;
}

const EnhancedChatInterface: React.FC<ChatInterfaceProps> = ({ 
  defaultAgentId
}) => {
  const { session } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  const [showProcedureSelector, setShowProcedureSelector] = useState(true);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [showConversations, setShowConversations] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [detectedDoctors, setDetectedDoctors] = useState<Map<string, NPIDoctorInfo>>(new Map());
  const [showDoctorLookup, setShowDoctorLookup] = useState(false);
  const [lookingUpDoctor, setLookingUpDoctor] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Backend URL from environment
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://osbackend-zl1h.onrender.com';

  // Initialize WebSocket connection with enhanced events
  useEffect(() => {
    if (!session?.access_token) return;

    const socketInstance = io(BACKEND_URL, {
      path: '/agents-ws',
      auth: {
        token: session.access_token
      },
      transports: ['websocket']
    });

    socketInstance.on('connect', () => {
      console.log('Connected to enhanced agent WebSocket');
    });

    socketInstance.on('agent:message:chunk', (data) => {
      if (data.conversationId === currentConversation?.id) {
        setStreamingMessage(prev => prev + data.chunk);
      }
    });

    socketInstance.on('agent:message:complete', (data) => {
      if (data.conversationId === currentConversation?.id) {
        const completeMessage: Message = {
          id: data.messageId,
          role: 'assistant',
          content: streamingMessage,
          timestamp: new Date().toISOString(),
          metadata: data.metadata
        };
        setMessages(prev => [...prev, completeMessage]);
        setStreamingMessage('');
        
        // Check for doctor mentions in the response
        if (data.metadata?.doctorMentions) {
          handleDoctorMentions(data.metadata.doctorMentions);
        }
      }
    });

    socketInstance.on('agent:typing', (data) => {
      setIsAgentTyping(data.isTyping);
    });

    socketInstance.on('agent:insights', (data) => {
      if (data.conversationId === currentConversation?.id) {
        setInsights(data.insights);
      }
    });

    // New doctor-related events
    socketInstance.on('doctor:detected', async (data) => {
      if (data.conversationId === currentConversation?.id) {
        await handleDoctorDetection(data.mentions);
      }
    });

    socketInstance.on('doctor:info', (data) => {
      if (data.conversationId === currentConversation?.id && data.doctor) {
        setDetectedDoctors(prev => new Map(prev).set(data.doctor.displayName, data.doctor));
      }
    });

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session, BACKEND_URL, currentConversation?.id, streamingMessage]);

  // Detect doctors in user messages
  const detectDoctorsInMessage = useCallback(async (content: string) => {
    const mentions = detectDoctorMentions(content);
    if (mentions.length > 0) {
      await handleDoctorDetection(mentions);
    }
  }, []);

  // Handle detected doctor mentions
  const handleDoctorDetection = async (mentions: DoctorMention[]) => {
    setLookingUpDoctor(true);
    
    for (const mention of mentions) {
      // Skip if already detected
      if (detectedDoctors.has(mention.fullName)) continue;
      
      try {
        const npiResults = await lookupDoctorNPI(mention.firstName, mention.lastName);
        const bestMatch = findBestMatch(mention, npiResults);
        
        if (bestMatch) {
          setDetectedDoctors(prev => new Map(prev).set(mention.fullName, bestMatch));
          
          // Notify backend about detected doctor
          socket?.emit('doctor:found', {
            conversationId: currentConversation?.id,
            doctor: bestMatch,
            mention
          });
          
          // Add to conversation context
          updateConversationContext({ doctor: bestMatch });
        }
      } catch (error) {
        console.error('Doctor lookup failed:', error);
      }
    }
    
    setLookingUpDoctor(false);
  };

  // Handle doctor mentions from agent
  const handleDoctorMentions = async (mentions: DoctorMention[]) => {
    for (const mention of mentions) {
      if (!detectedDoctors.has(mention.fullName)) {
        await handleDoctorDetection([mention]);
      }
    }
  };

  // Update conversation context with doctor info
  const updateConversationContext = (context: any) => {
    if (!currentConversation) return;
    
    socket?.emit('conversation:updateContext', {
      conversationId: currentConversation.id,
      context
    });
  };

  // Load default agent
  useEffect(() => {
    if (defaultAgentId && session) {
      loadAgent(defaultAgentId);
    }
  }, [defaultAgentId, session]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const loadAgent = async (agentId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/canvas/agents/${agentId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const data = await response.json();
      setSelectedAgent(data.agent);
    } catch (error) {
      console.error('Failed to load agent:', error);
    }
  };

  const createNewConversation = async () => {
    if (!selectedAgent || !session) return;

    try {
      const endpoint = selectedProcedure 
        ? `${BACKEND_URL}/api/canvas/conversations/with-procedure`
        : `${BACKEND_URL}/api/canvas/conversations`;

      const title = selectedProcedure && selectedProcedure.name && selectedAgent?.name
        ? `${selectedProcedure.name} with ${selectedAgent.name}`
        : selectedAgent?.name
          ? `Chat with ${selectedAgent.name}`
          : 'Chat with Agent';

      const body = selectedProcedure
        ? {
            agentId: selectedAgent.id,
            procedureId: selectedProcedure.id,
            procedureType: selectedProcedure.type,
            title
          }
        : {
            agentId: selectedAgent.id,
            title
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();
      setCurrentConversation(data.conversation);
      setMessages([]);
      setShowProcedureSelector(false);
      setDetectedDoctors(new Map());
      
      // Notify socket about new conversation
      socket?.emit('conversation:new', {
        agentId: selectedAgent.id,
        title: data.conversation.title
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/canvas/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      const data = await response.json();
      setCurrentConversation(data.conversation);
      setMessages(data.conversation.messages || []);
      setSelectedAgent(data.conversation.canvas_ai_agents);
      setShowConversations(false);
      
      // Load any saved doctors from context
      if (data.conversation.context?.doctors) {
        const doctorMap = new Map<string, NPIDoctorInfo>();
        data.conversation.context.doctors.forEach((doc: NPIDoctorInfo) => {
          doctorMap.set(doc.displayName, doc);
        });
        setDetectedDoctors(doctorMap);
      }
      
      // Notify socket about loaded conversation
      socket?.emit('conversation:load', conversationId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const sendMessage = async (content: string, metadata?: any) => {
    if (!currentConversation || !socket || !content.trim()) return;

    // Detect doctors in user message
    await detectDoctorsInMessage(content);

    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      metadata
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Send to socket with doctor context
    socket.emit('message', {
      conversationId: currentConversation.id,
      message: content,
      agentId: selectedAgent?.id,
      metadata: {
        ...metadata,
        doctors: Array.from(detectedDoctors.values())
      }
    });
  };

  const handleInsightAction = async (insight: any) => {
    // Handle different insight actions
    switch (insight.action) {
      case 'research_doctor':
        // Navigate to research panel with doctor name
        window.location.hash = `#research?doctor=${encodeURIComponent(insight.data.doctorName)}`;
        break;
      case 'lookup_doctor':
        // Trigger doctor lookup
        const mentions = detectDoctorMentions(insight.data.doctorName);
        if (mentions.length > 0) {
          await handleDoctorDetection(mentions);
        }
        break;
      case 'show_procedure_data':
        sendMessage(`Show me detailed data about ${insight.data.procedure} procedures in my area`);
        break;
      case 'competitive_analysis':
        sendMessage('Run a competitive analysis for my territory');
        break;
    }
  };

  const addDoctorToContext = (doctor: NPIDoctorInfo) => {
    sendMessage(
      `Tell me more about ${doctor.displayName} and their practice. What sales strategies would work best?`,
      { contextDoctor: doctor }
    );
  };

  const researchDoctor = (doctor: NPIDoctorInfo) => {
    // Navigate to research panel with doctor info
    const params = new URLSearchParams({
      doctor: doctor.displayName,
      npi: doctor.npi,
      specialty: doctor.specialty,
      location: `${doctor.city}, ${doctor.state}`
    });
    window.location.href = `/#research?${params.toString()}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent selector bar */}
      {!currentConversation && (
        <div className="p-4 border-b border-[#00ffc6]/20">
          <AgentSelector
            selectedAgent={selectedAgent}
            onSelectAgent={setSelectedAgent}
            backendUrl={BACKEND_URL}
            selectedProcedure={selectedProcedure}
          />
        </div>
      )}

      {/* Conversation header */}
      {currentConversation && (
        <div className="p-4 border-b border-[#00ffc6]/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConversations(!showConversations)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h4 className="text-white font-medium">{currentConversation.title}</h4>
                <p className="text-xs text-gray-400">with {selectedAgent?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Doctor lookup toggle */}
              <button
                onClick={() => setShowDoctorLookup(!showDoctorLookup)}
                className={`p-2 rounded-lg transition-colors ${
                  detectedDoctors.size > 0 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'hover:bg-white/10 text-gray-400'
                }`}
                title="Doctor information"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                {detectedDoctors.size > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                )}
              </button>
              
              <button
                onClick={createNewConversation}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="New conversation"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Doctor information panel */}
          <AnimatePresence>
            {showDoctorLookup && detectedDoctors.size > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                <p className="text-xs text-gray-400 mb-2">Detected Healthcare Providers:</p>
                {Array.from(detectedDoctors.values()).map(doctor => (
                  <DoctorInfoCard
                    key={doctor.npi}
                    doctor={doctor}
                    onResearch={() => researchDoctor(doctor)}
                    onAddToConversation={() => addDoctorToContext(doctor)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations sidebar */}
        <AnimatePresence>
          {showConversations && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-[#00ffc6]/20 overflow-hidden"
            >
              <ConversationList
                onSelectConversation={loadConversation}
                currentConversationId={currentConversation?.id}
                backendUrl={BACKEND_URL}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {showProcedureSelector && !currentConversation ? (
            <div className="flex-1 overflow-y-auto">
              <ProcedureSelector
                onSelectProcedure={(procedure) => {
                  setSelectedProcedure(procedure);
                  setShowProcedureSelector(false);
                }}
                backendUrl={BACKEND_URL}
              />
            </div>
          ) : !selectedAgent ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00ffc6]/20 to-[#00d4ff]/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[#00ffc6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Select an Agent</h3>
                <p className="text-gray-400 text-sm">Choose an AI agent to start your conversation</p>
              </div>
            </div>
          ) : !currentConversation ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              {selectedProcedure && (
                <div className="mb-6 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ffc6]/10 to-[#00d4ff]/10 rounded-full border border-[#00ffc6]/20">
                    <span className="text-[#00ffc6]">Specialized in:</span>
                    <span className="text-white font-medium">{selectedProcedure.name}</span>
                    <button
                      onClick={() => {
                        setSelectedProcedure(null);
                        setShowProcedureSelector(true);
                      }}
                      className="ml-2 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              <button
                onClick={createNewConversation}
                className="px-6 py-3 bg-gradient-to-r from-[#00ffc6] to-[#00d4ff] text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-[#00ffc6]/20 transition-all"
              >
                Start New Conversation
              </button>
              {!selectedProcedure && (
                <button
                  onClick={() => setShowProcedureSelector(true)}
                  className="mt-4 text-sm text-gray-400 hover:text-[#00ffc6] transition-colors"
                >
                  or select a procedure first
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <MessageBubble
                      message={message}
                      agentName={selectedAgent?.name}
                      agentAvatar={selectedAgent?.avatar_url}
                    />
                    {/* Show inline doctor cards for detected doctors in messages */}
                    {message.metadata?.doctors?.map((doctor: NPIDoctorInfo) => (
                      <div key={doctor.npi} className="ml-12 mt-2">
                        <DoctorInfoCard
                          doctor={doctor}
                          compact
                          onResearch={() => researchDoctor(doctor)}
                        />
                      </div>
                    ))}
                  </div>
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
                    agentName={selectedAgent?.name}
                    agentAvatar={selectedAgent?.avatar_url}
                  />
                )}
                
                {isAgentTyping && !streamingMessage && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#00ffc6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#00ffc6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#00ffc6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">{selectedAgent?.name} is typing...</span>
                  </div>
                )}

                {lookingUpDoctor && (
                  <div className="flex items-center gap-2 text-blue-400 ml-12">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Looking up doctor information...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Insights panel with doctor-aware actions */}
              <AnimatePresence>
                {insights.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-[#00ffc6]/20 p-4"
                  >
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Suggested Actions</h4>
                    <div className="space-y-2">
                      {insights.map((insight, index) => (
                        <button
                          key={index}
                          onClick={() => handleInsightAction(insight)}
                          className="w-full text-left p-3 bg-gradient-to-r from-[#00ffc6]/10 to-[#00d4ff]/10 rounded-lg border border-[#00ffc6]/20 hover:border-[#00ffc6]/40 transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-white">{insight.title}</div>
                            {insight.action === 'lookup_doctor' && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                NPI Lookup
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{insight.message}</div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message input */}
              <MessageInput
                onSendMessage={sendMessage}
                disabled={!currentConversation}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;