import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/useAuth';

interface Conversation {
  id: string;
  title: string;
  agent_id: string;
  created_at: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    role: string;
  };
  canvas_ai_agents?: {
    name: string;
    avatar_url?: string;
  };
}

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
  backendUrl: string;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  onSelectConversation, 
  currentConversationId,
  backendUrl 
}) => {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, [session]);

  const loadConversations = async () => {
    if (!session?.access_token) return;

    try {
      const response = await fetch(`${backendUrl}/api/canvas/conversations`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.canvas_ai_agents?.name && conv.canvas_ai_agents.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col bg-black/50">
      {/* Header */}
      <div className="p-4 border-b border-[#00ffc6]/20">
        <h3 className="text-white font-semibold mb-3">Conversations</h3>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full px-3 py-2 pl-9 bg-white/5 border border-[#00ffc6]/20 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#00ffc6]/40 transition-colors"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-800 rounded-lg" />
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((conversation, index) => (
              <motion.button
                key={conversation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full p-3 rounded-lg mb-1 text-left transition-all ${
                  currentConversationId === conversation.id
                    ? 'bg-gradient-to-r from-[#00ffc6]/20 to-[#00d4ff]/20 border border-[#00ffc6]/40'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Agent icon */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ffc6] to-[#00d4ff] p-0.5 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <span className="text-xs font-bold text-[#00ffc6]">
                        {conversation.canvas_ai_agents?.name.charAt(0) || 'A'}
                      </span>
                    </div>
                  </div>

                  {/* Conversation details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-white truncate">
                        {conversation.title}
                      </h4>
                      <span className="text-xs text-gray-500 ml-2">
                        {formatDate(conversation.lastMessage?.timestamp || conversation.created_at)}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-400 mb-1">
                      with {conversation.canvas_ai_agents?.name || 'Agent'}
                    </div>
                    
                    {conversation.lastMessage && (
                      <p className="text-xs text-gray-500 truncate">
                        {conversation.lastMessage.role === 'user' ? 'You: ' : ''}
                        {conversation.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>

                {/* Active indicator */}
                {currentConversationId === conversation.id && (
                  <div className="mt-2 h-0.5 bg-gradient-to-r from-[#00ffc6] to-[#00d4ff] rounded-full" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* New conversation button */}
      <div className="p-4 border-t border-[#00ffc6]/20">
        <button
          onClick={() => window.location.reload()} // Simple refresh to start new
          className="w-full py-2 bg-gradient-to-r from-[#00ffc6]/20 to-[#00d4ff]/20 border border-[#00ffc6]/40 rounded-lg text-[#00ffc6] font-medium text-sm hover:from-[#00ffc6]/30 hover:to-[#00d4ff]/30 transition-all"
        >
          New Conversation
        </button>
      </div>
    </div>
  );
};

export default ConversationList;