# Canvas Frontend - Claude Code Context

This file provides guidance to Claude Code when working with the Canvas frontend React application.

## Architecture Overview

### Canvas Application
Canvas is a **medical sales intelligence platform** that connects to the **unified agent system backend** for AI-powered sales coaching and medical procedure research.

**Key Features:**
- 🔍 **Doctor Intelligence**: NPI lookup and practice intelligence
- 💬 **AI Agent Chat**: 16+ specialized medical sales agents  
- 📊 **Research & Analytics**: Medical procedure and market research
- 🎯 **Lead Intelligence**: Doctor verification and practice insights
- 📞 **Outreach Tools**: Magic link generation and CRM integration

### Backend Integration
- **Primary Backend**: `https://osbackend-zl1h.onrender.com` (unified agent system)
- **Local Development**: Uses Vite proxy for CORS
- **Agent API**: `/api/canvas/*` endpoints
- **WebSocket**: `/agents-ws` with Canvas-specific agents
- **Functions**: Netlify serverless functions for NPI and research

## Unified Agent System Integration

### Available Agents (16 total)
Canvas has access to these specialized agents via the unified backend:

#### 🏆 Elite Closers (2 agents)
- **Harvey Specter**: Legendary closer with maximum aggression
- **Victoria Sterling**: Elite negotiator with sophisticated approach

#### 👥 Coaches (4 agents)  
- **Alexis Rivera**: Confidence and mindset coaching
- **David Park**: Strategic sales methodology  
- **Marcus Chen**: Performance optimization
- **Sarah Mitchell**: Relationship building expertise

#### 🧠 Strategists (4 agents)
- **Hunter**: Prospecting and lead generation specialist
- **Closer**: Deal-making and negotiation expert
- **Educator**: Teaching-focused medical procedure expert
- **Strategist**: Market intelligence and competitive analysis

#### 🩺 Medical Specialists (6 agents)
- **Dr. Amanda Foster**: BTL technology and body contouring expert
- **Dr. Harvey Stern**: Dental technology and surgical equipment
- **Dr. Lisa Martinez**: RF microneedling specialist
- **Dr. Sarah Chen**: Injectable aesthetics authority
- **Jake Thompson**: Body contouring and fitness integration
- **Marcus Rodriguez**: Laser therapy and skin treatments

### API Endpoints

#### Agent Management
```
GET    /api/canvas/agents                    # List all Canvas agents (16)
GET    /api/canvas/agents/:id                # Get specific agent details
POST   /api/canvas/conversations             # Create conversation
GET    /api/canvas/conversations             # List conversations  
POST   /api/canvas/conversations/:id/messages # Send message
```

#### Research & Intelligence
```
POST   /.netlify/functions/npi-lookup       # NPI doctor lookup
POST   /.netlify/functions/doctor-verification # Doctor verification
POST   /.netlify/functions/practice-finder  # Practice intelligence
POST   /api/brave-search                    # Web research
POST   /api/perplexity-research             # AI research
POST   /api/firecrawl-scrape               # Website analysis
```

#### Outreach & CRM
```
POST   /api/send-magic-link                 # Magic link generation
POST   /.netlify/functions/send-email       # Email outreach
POST   /.netlify/functions/send-sms         # SMS messaging
```

### WebSocket Integration
Canvas uses WebSocket for real-time chat with AI agents:

```javascript
// WebSocket Connection (needs appName fix)
const socket = io('https://osbackend-zl1h.onrender.com', {
  path: '/agents-ws',
  auth: { 
    token: session.access_token,
    appName: 'canvas' // IMPORTANT: Add this for multi-app support
  }
});

// Events
socket.emit('message', { conversationId, message, agentId });
socket.on('agent:message:chunk', (data) => { /* streaming response */ });
socket.on('agent:message:complete', (data) => { /* response complete */ });
```

## Frontend Architecture

### Tech Stack
- **React 18** with TypeScript and Vite
- **Framer Motion** for animations
- **Tailwind CSS** for styling  
- **Supabase** for authentication and data storage
- **Socket.IO** for real-time chat
- **Netlify Functions** for serverless API

### Key Components

#### Agent System
- `src/components/agents/ChatInterface.tsx` - Basic chat interface
- `src/components/agents/EnhancedChatInterface.tsx` - Advanced chat with doctor detection
- `src/components/agents/AgentSelector.tsx` - Agent selection UI
- `src/components/agents/MessageBubble.tsx` - Chat message display
- `src/lib/agentCore.ts` - Agent system prompt building

#### Research & Intelligence  
- `src/lib/doctorDetection.ts` - NPI doctor lookup and verification
- `src/lib/practiceIntelligence.ts` - Practice research and analysis
- `src/lib/webResearch.ts` - Web scraping and research
- `src/lib/marketInsights.ts` - Market intelligence gathering

#### UI Components
- `src/components/DoctorInfoCard.tsx` - Doctor profile display
- `src/components/ResearchPanel.tsx` - Research interface
- `src/components/IntelligenceGauge/` - Progress indicators
- `src/components/LoadingStates.tsx` - Loading animations

### Configuration Files

#### API Configuration
```typescript
// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (hostname === 'canvas.repspheres.com'
    ? 'https://osbackend-zl1h.onrender.com' // Production
    : 'https://osbackend-zl1h.onrender.com'); // Always use Render backend
```

#### Environment Variables
```env
# Backend Integration  
VITE_API_BASE_URL=https://osbackend-zl1h.onrender.com
VITE_BACKEND_URL=https://osbackend-zl1h.onrender.com

# Supabase (for auth and data)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI Services
VITE_OPENAI_API_KEY=your-openai-key
VITE_ANTHROPIC_API_KEY=your-claude-key
VITE_PERPLEXITY_API_KEY=your-perplexity-key

# Research Services  
VITE_BRAVE_SEARCH_API_KEY=your-brave-key
VITE_FIRECRAWL_API_KEY=your-firecrawl-key
```

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Agent Testing
```bash
# Test Canvas endpoints
node test_canvas_endpoints.js

# Verify Canvas agents
node verify_canvas_agents.js

# Test production deployment
node test-production.js

# Test site functionality  
node verify-site.js
```

### Netlify Functions (local development)
```bash  
# Install Netlify CLI
npm install -g netlify-cli

# Run local development with functions
netlify dev

# Deploy to Netlify
netlify deploy --prod
```

## Database Integration

### Supabase Tables
- `user_profiles` - User authentication and settings
- `research_cache` - Cached research results  
- `conversations` - Agent conversation history
- `doctor_intelligence` - NPI lookup cache
- `magic_links` - Outreach link tracking

### Authentication
- **Supabase Auth** with Google OAuth integration
- **JWT tokens** for API authentication
- **Row Level Security** on all tables
- **Session persistence** across page reloads

## Critical Implementation Notes

### Backend URL Configuration  
Canvas uses environment-based API routing:

```typescript
// In src/config/api.ts
const hostname = window.location.hostname;
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (hostname === 'localhost' 
    ? '' // Use Vite proxy in development
    : 'https://osbackend-zl1h.onrender.com'); // Production backend
```

### Agent Loading Pattern
```typescript
// Canvas-specific agent loading
const loadAgents = async () => {
  const response = await fetch(`${backendUrl}/api/canvas/agents`, {
    headers: {
      'Authorization': `Bearer ${session.access_token}`
    }
  });
  const data = await response.json();
  return data.agents; // Should return 16 Canvas agents
};
```

### WebSocket Integration Fix Needed
```typescript
// Current (missing appName)
const socket = io(BACKEND_URL, {
  path: '/agents-ws',
  auth: { token: session.access_token }
});

// Should be (with Canvas app identification)
const socket = io(BACKEND_URL, {
  path: '/agents-ws', 
  auth: { 
    token: session.access_token,
    appName: 'canvas' // IMPORTANT: Add this
  }
});
```

### Doctor Intelligence Integration
```typescript
// Automatic doctor detection in chat
const detectDoctors = async (message: string) => {
  const mentions = detectDoctorMentions(message);
  for (const mention of mentions) {
    const doctorInfo = await lookupDoctorNPI(mention);
    if (doctorInfo) {
      setDetectedDoctors(prev => new Map(prev.set(mention.id, doctorInfo)));
    }
  }
};
```

## Deployment Configuration

### Frontend (Netlify)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Functions Directory**: `netlify/functions`
- **Environment Variables**: All VITE_* variables must be set

### Vite Proxy Configuration
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://osbackend-zl1h.onrender.com',
        changeOrigin: true,
      }
    }
  }
});
```

### Backend Integration Testing  
After deployment, verify:

1. **Agent Loading**: Check `/api/canvas/agents` returns 16 agents
2. **WebSocket Connection**: Verify `/agents-ws` connects properly  
3. **NPI Lookup**: Test doctor verification functions
4. **Research APIs**: Verify Brave Search, Perplexity, Firecrawl
5. **Authentication**: Test Supabase auth integration

## Common Issues & Solutions

### Agent Loading Issues
```bash
# Check if backend is responding
curl https://osbackend-zl1h.onrender.com/api/canvas/agents

# Should return JSON with 16 Canvas agents
```

### WebSocket Connection Issues  
```typescript
// Ensure proper authentication and app identification
const socket = io(BACKEND_URL, {
  path: '/agents-ws',
  auth: { 
    token: session?.access_token,
    appName: 'canvas' // Must specify 'canvas' for proper filtering
  },
  transports: ['websocket']
});
```

### CORS Issues in Development
```typescript
// Use Vite proxy for development
// vite.config.ts proxy handles CORS automatically
```

### Environment Variable Issues
```bash
# Check Vite environment variables (must start with VITE_)  
echo $VITE_API_BASE_URL
echo $VITE_SUPABASE_URL
echo $VITE_ANTHROPIC_API_KEY
```

## File Structure Overview  
```
canvas/
├── src/
│   ├── components/
│   │   ├── agents/              # AI agent system
│   │   ├── IntelligenceGauge/   # Progress indicators  
│   │   └── *.tsx                # UI components
│   ├── lib/
│   │   ├── agentCore.ts         # Agent system core
│   │   ├── doctorDetection.ts   # NPI lookup
│   │   ├── webResearch.ts       # Research APIs
│   │   └── *.ts                 # Business logic
│   ├── config/
│   │   └── api.ts               # API configuration
│   └── auth/
│       └── *.ts                 # Authentication
├── netlify/
│   └── functions/               # Serverless functions
├── vite.config.ts               # Vite configuration  
└── package.json                 # Dependencies
```

## Known Issues

1. **WebSocket appName Missing**: Need to add `appName: 'canvas'` to WebSocket auth
2. **Agent Count**: Canvas should have access to all unified agents (16 vs potential 22)
3. **Environment Variables**: Some functions may need additional API keys
4. **Error Handling**: Improve WebSocket reconnection logic

This Canvas frontend integrates with the unified agent system backend to provide comprehensive medical sales intelligence and AI-powered sales coaching capabilities for medical device sales representatives.