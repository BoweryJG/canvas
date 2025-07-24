import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  metadata?: Record<string, unknown>;
}

interface MessageBubbleProps {
  message: Message;
  agentName?: string;
  agentAvatar?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  agentName = 'Agent',
  agentAvatar 
}) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B42F6] to-[#00d4ff] p-0.5">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <span className="text-xs font-bold text-white">U</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00ffc6] to-[#00d4ff] p-0.5">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              {agentAvatar ? (
                <img src={agentAvatar} alt={agentName} className="w-full h-full rounded-full" />
              ) : (
                <span className="text-xs font-bold text-[#00ffc6]">AI</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`relative group ${isUser ? 'text-right' : 'text-left'}`}>
          {/* Name and timestamp */}
          <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
            <span className="font-medium">{isUser ? 'You' : agentName}</span>
            <span>•</span>
            <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          {/* Message bubble */}
          <div
            className={`inline-block rounded-2xl px-4 py-3 ${
              isUser 
                ? 'bg-gradient-to-r from-[#7B42F6]/20 to-[#00d4ff]/20 border border-[#7B42F6]/30' 
                : 'bg-[#1a1a2e]/50 border border-[#00ffc6]/20'
            }`}
          >
            {/* Streaming indicator */}
            {message.isStreaming && (
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="inline-block w-1 h-4 bg-[#00ffc6] ml-1"
              />
            )}

            {/* Message content with markdown support */}
            <div className="text-sm text-white prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }: {
                    inline?: boolean;
                    className?: string;
                    children?: React.ReactNode;
                    [key: string]: unknown;
                  }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg my-2"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-black/50 px-1 py-0.5 rounded text-[#00ffc6]" {...props}>
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
                  h3: ({ children }) => <h3 className="font-semibold text-[#00ffc6] mb-2 mt-4">{children}</h3>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-[#00ffc6] pl-4 my-2 italic opacity-80">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Metadata display */}
            {message.metadata?.isVoice && (
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <span>Voice message</span>
              </div>
            )}
          </div>

          {/* Copy button (for assistant messages) */}
          {!isUser && (
            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
              title="Copy message"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;