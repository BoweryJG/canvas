import React, { useState, useRef, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';

interface MessageInputProps {
  onSendMessage: (content: string, metadata?: any) => void;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const toggleVoiceRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  return (
    <div className="border-t border-[#00ffc6]/20 p-4">
      <div className="flex items-end gap-2">
        {/* Voice input button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleVoiceRecording}
          disabled={disabled}
          className={`p-3 rounded-lg transition-all ${
            isRecording 
              ? 'bg-red-500/20 border border-red-500 text-red-500' 
              : 'bg-white/5 border border-[#00ffc6]/20 text-gray-400 hover:text-[#00ffc6] hover:border-[#00ffc6]/40'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </motion.button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your message..."
            rows={1}
            className="w-full px-4 py-3 pr-12 bg-white/5 border border-[#00ffc6]/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00ffc6]/40 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          
          {/* Character count */}
          {message.length > 0 && (
            <div className="absolute bottom-2 right-12 text-xs text-gray-500">
              {message.length}
            </div>
          )}
        </div>

        {/* Send button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="p-3 bg-gradient-to-r from-[#00ffc6] to-[#00d4ff] rounded-lg text-black font-medium hover:shadow-lg hover:shadow-[#00ffc6]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>

      {/* Quick actions */}
      <div className="mt-2 flex gap-2 flex-wrap">
        <button
          onClick={() => setMessage("Tell me about Dr. ")}
          className="text-xs px-3 py-1 bg-white/5 border border-[#00ffc6]/20 rounded-full text-gray-400 hover:text-[#00ffc6] hover:border-[#00ffc6]/40 transition-all"
        >
          Research Doctor
        </button>
        <button
          onClick={() => setMessage("What procedures should I pitch to ")}
          className="text-xs px-3 py-1 bg-white/5 border border-[#00ffc6]/20 rounded-full text-gray-400 hover:text-[#00ffc6] hover:border-[#00ffc6]/40 transition-all"
        >
          Product Match
        </button>
        <button
          onClick={() => setMessage("Help me craft an email for ")}
          className="text-xs px-3 py-1 bg-white/5 border border-[#00ffc6]/20 rounded-full text-gray-400 hover:text-[#00ffc6] hover:border-[#00ffc6]/40 transition-all"
        >
          Draft Email
        </button>
        <button
          onClick={() => setMessage("What's the competition doing with ")}
          className="text-xs px-3 py-1 bg-white/5 border border-[#00ffc6]/20 rounded-full text-gray-400 hover:text-[#00ffc6] hover:border-[#00ffc6]/40 transition-all"
        >
          Competitive Intel
        </button>
      </div>
    </div>
  );
};

export default MessageInput;