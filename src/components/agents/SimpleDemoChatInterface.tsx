import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Typography } from '@mui/material';
import { Send } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface SimpleDemoChatInterfaceProps {
  agentId?: string;
  agentName?: string;
}

const ChatContainer = styled(Box)`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
`;

const MessagesArea = styled(Box)`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(159, 88, 250, 0.3);
    border-radius: 4px;
  }
`;

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser: boolean }>`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: ${props => props.isUser 
    ? 'linear-gradient(135deg, #9f58fa 0%, #4B96DC 100%)' 
    : 'rgba(255, 255, 255, 0.05)'};
  color: white;
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  border: 1px solid ${props => props.isUser 
    ? 'transparent' 
    : 'rgba(255, 255, 255, 0.1)'};
`;

const InputArea = styled(Box)`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  gap: 12px;
  align-items: center;
`;

const StyledTextField = styled(TextField)`
  flex: 1;
  
  .MuiOutlinedInput-root {
    color: white;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    
    fieldset {
      border-color: rgba(255, 255, 255, 0.1);
    }
    
    &:hover fieldset {
      border-color: rgba(159, 88, 250, 0.3);
    }
    
    &.Mui-focused fieldset {
      border-color: #9f58fa;
    }
  }
`;

const SendButton = styled(IconButton)`
  background: linear-gradient(135deg, #9f58fa 0%, #4B96DC 100%);
  color: white;
  width: 48px;
  height: 48px;
  
  &:hover {
    background: linear-gradient(135deg, #B01EFF 0%, #00d4ff 100%);
  }
`;

const SimpleDemoChatInterface: React.FC<SimpleDemoChatInterfaceProps> = ({ 
  agentId: _agentId, // Prefixed with _ to indicate it's intentionally unused
  agentName = 'AI Assistant'
}) => {
  // Suppress unused variable warning
  void _agentId;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I'm ${agentName}. I'm a demo agent - the full chat functionality requires authentication. How can I help you today?`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate assistant response after a delay
    setTimeout(() => {
      const responses = [
        "That's an interesting question! In a full implementation, I would provide detailed insights based on your query.",
        "I understand what you're looking for. The complete system would analyze market data and provide actionable recommendations.",
        "Great point! With full access, I could help you explore competitive intelligence and sales strategies.",
        "I see what you mean. The production version includes advanced AI capabilities for comprehensive analysis."
      ];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatContainer>
      <MessagesArea>
        {messages.map((message) => (
          <MessageBubble key={message.id} isUser={message.role === 'user'}>
            <Typography variant="body1">
              {message.content}
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.7, 
              display: 'block', 
              mt: 1,
              fontSize: '0.7rem'
            }}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </Typography>
          </MessageBubble>
        ))}
        <div ref={messagesEndRef} />
      </MessagesArea>
      
      <InputArea>
        <StyledTextField
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          multiline
          maxRows={4}
          fullWidth
        />
        <SendButton onClick={handleSend} disabled={!inputValue.trim()}>
          <Send />
        </SendButton>
      </InputArea>
    </ChatContainer>
  );
};

export default SimpleDemoChatInterface;