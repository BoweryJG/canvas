import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';

interface Agent {
  id: string;
  name: string;
  avatar_url?: string;
  specialty: string[];
  personality: any;
}

interface Procedure {
  id: string;
  name: string;
  category: string;
  type: 'dental' | 'aesthetic';
}

interface AgentSelectorProps {
  selectedAgent: Agent | null;
  onSelectAgent: (agent: Agent) => void;
  backendUrl: string;
  selectedProcedure?: Procedure | null;
}

const AgentSelector: React.FC<AgentSelectorProps> = ({ 
  selectedAgent, 
  onSelectAgent,
  backendUrl,
  selectedProcedure 
}) => {
  const { session } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAgents();
  }, [session]);

  const loadAgents = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${backendUrl}/api/canvas/agents`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      setAgents(data.agents);
      
      // Select first agent by default if none selected
      if (!selectedAgent && data.agents.length > 0) {
        onSelectAgent(data.agents[0]);
      }
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAgentIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'hunter':
        return '🎯';
      case 'closer':
        return '💼';
      case 'educator':
        return '📚';
      case 'strategist':
        return '📊';
      default:
        return '🤖';
    }
  };

  const getAgentColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'hunter':
        return 'from-orange-500 to-red-500';
      case 'closer':
        return 'from-blue-500 to-purple-500';
      case 'educator':
        return 'from-green-500 to-emerald-500';
      case 'strategist':
        return 'from-purple-500 to-pink-500';
      default:
        return 'from-[#00ffc6] to-[#00d4ff]';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
        <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors w-full"
      >
        {selectedAgent ? (
          <>
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAgentColor(selectedAgent.name)} p-0.5`}>
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-lg">
                {getAgentIcon(selectedAgent.name)}
              </div>
            </div>
            <div className="text-left flex-1">
              <div className="text-white font-medium">{selectedAgent.name}</div>
              <div className="text-xs text-gray-400">
                {selectedProcedure 
                  ? `Specialized in ${selectedProcedure.name}`
                  : selectedAgent.specialty.slice(0, 2).join(', ')
                }
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        ) : (
          <div className="text-gray-400">Select an agent...</div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-[#00ffc6]/20 rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2 font-medium">AVAILABLE AGENTS</div>
              
              {agents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    onSelectAgent(agent);
                    setShowDropdown(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedAgent?.id === agent.id 
                      ? 'bg-gradient-to-r from-[#00ffc6]/20 to-[#00d4ff]/20 border border-[#00ffc6]/40' 
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAgentColor(agent.name)} p-0.5`}>
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xl">
                      {getAgentIcon(agent.name)}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.specialty.join(', ')}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {agent.personality.approach} • {agent.personality.tone}
                    </div>
                  </div>

                  {selectedAgent?.id === agent.id && (
                    <svg className="w-5 h-5 text-[#00ffc6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-[#00ffc6]/20 p-3">
              <div className="text-xs text-gray-500 text-center">
                Tip: Each agent specializes in different sales scenarios
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentSelector;