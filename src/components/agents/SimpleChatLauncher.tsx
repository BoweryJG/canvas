import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DemoChatInterface from './DemoChatInterface';

const SimpleChatLauncher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

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
              onClick={() => setIsOpen(true)}
              className="relative group"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ffc6] to-[#00d4ff] rounded-full blur-xl opacity-50" />
              
              {/* Main button */}
              <div className="relative w-16 h-16 bg-black/90 backdrop-blur-xl rounded-full border border-[#00ffc6]/20 flex items-center justify-center hover:border-[#00ffc6] transition-all duration-300 hover:scale-110">
                <svg 
                  className="w-6 h-6 text-[#00ffc6]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                  />
                </svg>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 ${
              isMinimized 
                ? 'bottom-6 right-6 w-96 h-16' 
                : 'inset-4 md:inset-auto md:bottom-6 md:right-6 md:w-[450px] md:h-[600px]'
            }`}
          >
            <div className="w-full h-full bg-black/95 backdrop-blur-2xl border border-[#00ffc6]/20 rounded-2xl shadow-2xl shadow-[#00ffc6]/10 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#00ffc6]/10 to-[#00d4ff]/10 border-b border-[#00ffc6]/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ffc6] to-[#00d4ff] p-0.5">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <span className="text-sm font-bold text-[#00ffc6]">AI</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Canvas Agent</h3>
                    <p className="text-xs text-gray-400">Demo Mode</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg 
                      className="w-4 h-4 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} 
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg 
                      className="w-4 h-4 text-gray-400" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat content */}
              {!isMinimized && (
                <div className="flex-1 overflow-hidden">
                  <DemoChatInterface />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SimpleChatLauncher;