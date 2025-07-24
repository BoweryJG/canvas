import React, { useState } from 'react';

const DebugChat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleSend = () => {
    try {
      setError('');
      console.log('Sending message:', message);
      
      if (!message.trim()) {
        setError('Message is empty');
        return;
      }
      
      setMessages(prev => [...prev, `You: ${message}`]);
      setMessages(prev => [...prev, `Bot: Thanks for your message "${message}"`]);
      setMessage('');
    } catch (e: unknown) {
      setError(e.message);
      console.error('Error sending message:', e);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      width: '300px', 
      height: '400px', 
      background: 'white', 
      border: '2px solid black', 
      padding: '10px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ margin: 0, color: 'black' }}>Debug Chat</h3>
      
      {error && (
        <div style={{ color: 'red', padding: '5px' }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ 
        flex: 1, 
        overflow: 'auto', 
        border: '1px solid gray', 
        margin: '10px 0',
        padding: '5px' 
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ color: 'black', marginBottom: '5px' }}>
            {msg}
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', gap: '5px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          style={{ 
            flex: 1, 
            padding: '5px',
            color: 'black',
            background: 'white',
            border: '1px solid black'
          }}
          placeholder="Type a message..."
        />
        <button 
          onClick={handleSend}
          style={{ 
            padding: '5px 10px',
            background: 'blue',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DebugChat;