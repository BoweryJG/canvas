import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/useAuth';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext_20250730';
import { FeatureGate, TierBadge, UpgradePrompt, RepXTier, useRepXTier } from '../../unified-auth';
import ChatInterface from './ChatInterface';
import DemoChatInterface from './DemoChatInterface';

interface ChatLauncherProps {
  defaultAgentId?: string;
}

const ChatLauncher_20250730: React.FC<ChatLauncherProps> = ({ defaultAgentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const { session, user } = useAuth();
  const { canAccessAIAgents, agentTimeLimit, agentDisplayTime } = useUnifiedAuth();
  const { tier } = useRepXTier(user?.id);

  // Enable demo mode when not authenticated or below Rep¹
  const isDemoMode = !session || !canAccessAIAgents();

  // Pulsing glow animation
  const pulseAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const handleLauncherClick = () => {
    if (!canAccessAIAgents()) {
      setShowUpgradeModal(true);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={handleLauncherClick}
              className="relative group"
            >
              {/* Glow effect */}
              <motion.div
                animate={hasUnread ? pulseAnimation : {}}
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity"
              />
              
              {/* Main button */}
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                
                {/* Tier badge on launcher */}
                <div className="absolute -top-2 -right-2">
                  <TierBadge tier={tier} />
                </div>
              </div>

              {/* Unread indicator */}
              {hasUnread && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {canAccessAIAgents() ? (
                  <>
                    AI Sales Agents
                    {agentTimeLimit > 0 && (
                      <div className="text-xs text-gray-300 mt-1">
                        Limit: {agentDisplayTime} per conversation
                      </div>
                    )}
                  </>
                ) : (
                  'Upgrade to access AI agents'
                )}
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-4 z-50 w-[400px] h-[600px] bg-white rounded-lg shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2 p-2 hover:bg-gray-100 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <FeatureGate
              feature="login"
              fallback={
                <DemoChatInterface
                  onRequestAuth={() => setShowUpgradeModal(true)}
                />
              }
            >
              <ChatInterface
                defaultAgentId={defaultAgentId}
                onUnreadChange={setHasUnread}
              />
            </FeatureGate>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradePrompt
          currentTier={tier}
          requiredTier={RepXTier.Rep1}
          feature="AI Sales Agents"
          onUpgrade={() => {
            window.location.href = 'https://osbackend-zl1h.onrender.com/upgrade?feature=ai-agents&from=' + tier;
          }}
          onCancel={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
};

export default ChatLauncher_20250730;