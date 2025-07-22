# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `npm run dev` - Start development server with Vite (port 7002)
- `npm run build` - Build for production (includes TypeScript compilation)
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint on codebase
- `netlify dev` - Run local development with functions

### Testing & Verification
- `node test_canvas_endpoints.js` - Test Canvas API endpoints
- `node verify_canvas_agents.js` - Verify agent database integration
- `node test-apis.js` - Test external API integrations
- `node comprehensive-site-test.js` - Full site functionality test

## Architecture Overview

### Core Application Structure
Canvas is a **medical sales intelligence platform** React application integrated with the unified agent system backend for AI-powered sales coaching and medical procedure research.

### Key Architectural Patterns

#### 1. Backend Integration (`src/config/api.ts`)
Fully integrated with the unified backend:
- **Primary Backend**: `osbackend-zl1h.onrender.com`
- **Development**: Vite proxy for CORS handling
- **Agent System**: Complete integration with unified agent system
- **Authentication**: Supabase Auth with JWT tokens

#### 2. Unified Agent System Integration
**Multi-Agent Architecture** supporting specialized medical sales agents:
- **Agent Management**: REST API endpoints via `/api/canvas/agents`
- **WebSocket Communication**: Real-time chat via `/agents-ws`
- **Medical Specialization**: Procedure-specific agent matching
- **NPI Integration**: Automatic doctor detection and verification

#### 3. Medical Intelligence System
**Advanced Research Integration**:
- **NPI Lookup**: Doctor verification and practice intelligence
- **Procedure Research**: Dental and aesthetic procedure databases
- **Web Research**: Brave Search, Perplexity AI, Firecrawl integration
- **Market Intelligence**: Competitive analysis and trend research

#### 4. Real-time Agent Chat
**WebSocket-Based Communication**:
- **Live Agent Chat**: Streaming responses from AI agents
- **Doctor Detection**: Automatic NPI lookup during conversations
- **Contextual Insights**: Procedure-specific agent recommendations
- **Conversation Persistence**: Chat history and context management

### Component Architecture

#### Agent System Components (`src/components/agents/`)
- **ChatInterface.tsx**: Basic agent chat interface
- **EnhancedChatInterface.tsx**: Advanced chat with doctor detection
- **AgentSelector.tsx**: Agent selection and filtering
- **EnhancedAgentSystem.tsx**: Complete agent management panel
- **MessageBubble.tsx**: Chat message display components

#### Medical Intelligence Components
- **DoctorInfoCard.tsx**: Doctor profile and practice information
- **ResearchPanel.tsx**: Medical research interface
- **IntelligenceGauge/**: Progress and loading indicators
- **ProcedureComponents/**: Procedure-specific UI elements

#### Research & Integration
- **NPI Integration**: `src/lib/doctorDetection.ts`
- **Web Research**: `src/lib/webResearch.ts`
- **Agent Core**: `src/lib/agentCore.ts`
- **API Configuration**: `src/config/api.ts`

### Data Flow

#### 1. Agent Selection Flow
```
User Selection → Agent Filter → Canvas API → Agent Details → Chat Interface
```

#### 2. Medical Research Flow
```
Doctor Mention → NPI Lookup → Practice Intelligence → Agent Recommendations → Research Results
```

#### 3. Real-time Chat Flow
```
User Message → WebSocket → Agent Processing → Streaming Response → UI Updates
```

### Integration Points

#### Backend Synchronization Status
**Canvas ↔ osbackend-zl1h.onrender.com Integration**

**✅ FULLY SYNCHRONIZED ENDPOINTS:**
- `GET /api/canvas/agents` - List all Canvas agents (✅ 12 agents available)
- `GET /api/canvas/agents/:id` - Specific agent details (✅ Working)
- `POST /api/canvas/conversations` - Create conversation (✅ Working)
- `GET /api/canvas/conversations` - List conversations (✅ Working)
- `POST /api/canvas/conversations/:id/messages` - Send messages (✅ Working)
- `GET /api/canvas/procedures/featured` - Featured procedures (✅ Working)
- `GET /api/canvas/procedures/search` - Procedure search (✅ Working)
- `POST /api/canvas/agents/suggest` - Agent recommendations (✅ Working)
- `GET /health` - Backend health check (✅ Working)

**🔧 FUNCTIONAL FEATURES:**
- **Agent System**: Complete access to 12 specialized agents
- **Medical Specialists**: 6 medical procedure experts available
- **Sales Coaches**: 4 performance coaching agents
- **Elite Closers**: 2 advanced closing specialists
- **WebSocket Chat**: Real-time agent communication
- **NPI Integration**: Doctor lookup and verification
- **Research APIs**: Web research and market intelligence
- **Authentication**: Supabase Auth integration

#### Available Canvas Agents (12 total)

**🩺 Medical Specialists (6 agents)**
- **Dr. Amanda Foster**: BTL technology and body contouring expert
- **Dr. Lisa Martinez**: RF microneedling specialist
- **Dr. Harvey Stern**: Dental technology and surgical equipment
- **Dr. Sarah Chen**: Injectable aesthetics authority
- **Jake Thompson**: Body contouring and fitness integration
- **Marcus Rodriguez**: Laser therapy and skin treatments

**👥 Sales Coaches (4 agents)**
- **Alexis Rivera**: Competitive drive and performance coaching
- **Sarah Mitchell**: Relationship building and networking expert
- **David Park**: Data-driven sales methodology
- **Marcus Chen**: Mentorship and skill development

**🏆 Elite Closers (2 agents)**
- **Harvey Specter**: Maximum aggression closer (also available)
- **Victoria Sterling**: Strategic negotiation expert

#### External Services
- **Supabase**: Authentication and conversation storage
- **ElevenLabs**: Voice synthesis for agents (ready for implementation)
- **Netlify Functions**: NPI lookup, email/SMS outreach
- **Research APIs**: Brave Search, Perplexity AI, Firecrawl

### State Management

#### React State Usage
- **React Hooks**: useState, useEffect for component state
- **Context API**: Authentication and agent selection state
- **Custom Hooks**: Agent management and research integration
- **Local Storage**: User preferences and conversation history

#### Data Persistence
- **Supabase**: Conversations, user profiles, research cache
- **Local Storage**: Agent preferences, UI settings
- **Session Storage**: Active chat state and context

### Important Development Notes

#### Environment Variables
**Backend Connection:**
- `VITE_API_BASE_URL=https://osbackend-zl1h.onrender.com` (unified backend)

**Required for full functionality:**
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (authentication)
- `VITE_STRIPE_PUBLISHABLE_KEY` (payment processing)
- `VITE_OPENROUTER_API_KEY` (AI models via OpenRouter)
- `VITE_ANTHROPIC_API_KEY` (direct Claude API access)
- `VITE_OPENAI_API_KEY` (backup AI provider)
- `VITE_BRAVE_SEARCH_API_KEY` (web research)
- `VITE_FIRECRAWL_API_KEY` (website analysis)
- `VITE_PERPLEXITY_API_KEY` (AI research)

#### Build Configuration
- **Vite**: Modern build tool with hot module replacement (port 7002)
- **TypeScript**: Full type safety across application (strict mode)
- **Material-UI v7**: Core UI component library with Emotion styling
- **Tailwind CSS**: Utility-first styling framework
- **Framer Motion**: Advanced animations and transitions
- **Code Splitting**: Vendor chunks for React and UI libraries

#### Error Handling
- **Graceful Degradation**: Fallbacks when research APIs unavailable
- **Authentication Recovery**: Automatic session refresh
- **WebSocket Reconnection**: Automatic reconnection handling
- **Research Caching**: Cached results for improved performance

#### Performance Considerations
- **Code Splitting**: Lazy loading for agent and research components
- **API Caching**: Intelligent caching for NPI and research results
- **WebSocket Management**: Efficient connection pooling
- **Image Optimization**: Optimized avatars and medical imagery

#### Mobile Optimization
- **Responsive Design**: Mobile-first medical sales interface
- **Touch-Friendly**: Optimized for tablet usage in medical settings
- **Offline Capabilities**: Basic functionality without internet
- **Progressive Web App**: Installable medical sales tool

### Testing Strategy
- **Component Testing**: React Testing Library for UI components
- **API Testing**: Endpoint verification scripts
- **Integration Testing**: Full user flow testing
- **Medical Data Testing**: NPI lookup and procedure research validation

### Security Implementation
- **JWT Authentication**: Secure Supabase token management
- **API Security**: Rate limiting and request validation
- **Medical Data Privacy**: HIPAA-compliant data handling
- **Environment Secrets**: Secure API key management

## Backend Synchronization Status

### Overview
Canvas is fully synchronized with the unified osbackend-zl1h.onrender.com backend. All agent functionality, medical research capabilities, and real-time communication are operational.

### Canvas Backend Sync Status - Complete ✅

#### Agent System Integration
```javascript
// All Canvas agents accessible via unified backend:

// Medical Specialists (6)
Dr. Amanda Foster (BTL), Dr. Lisa Martinez (RF), Dr. Harvey Stern (Dental),
Dr. Sarah Chen (Injectables), Jake Thompson (Body Contouring), Marcus Rodriguez (Laser)

// Sales Coaches (4)
Alexis Rivera (Competition), Sarah Mitchell (Relationships), 
David Park (Analytics), Marcus Chen (Mentorship)

// Elite Closers (2)
Harvey Specter (Aggression), Victoria Sterling (Strategy)

// Strategists (2)
Hunter (Prospecting), Strategist (Market Intelligence)
```

#### Implementation Details
- **Backend**: Full agent management via `unified_agents` table
- **Frontend**: Complete integration via `src/config/api.ts`
- **Architecture**: Multi-modal communication (WebSocket + REST + Netlify Functions)
- **Features**: Complete medical sales intelligence with AI coaching

#### Communication Channels
- **WebSocket**: Real-time agent chat via `/agents-ws` endpoint
- **REST API**: Agent management via `/api/canvas/*` endpoints
- **Netlify Functions**: NPI lookup, email outreach, SMS messaging
- **Research APIs**: Integrated web research and market intelligence

#### Current Capabilities
- **12+ AI Agents**: Specialized medical sales and coaching agents
- **NPI Integration**: Real-time doctor lookup and verification
- **Medical Research**: Procedure databases and market intelligence
- **Real-time Chat**: WebSocket streaming with contextual insights
- **Practice Intelligence**: Comprehensive doctor and practice analysis
- **Outreach Tools**: Magic links, email campaigns, SMS messaging

### Environment Configuration
```env
# Frontend Environment Variables
VITE_API_BASE_URL=https://osbackend-zl1h.onrender.com
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ANTHROPIC_API_KEY=your_claude_api_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_BRAVE_SEARCH_API_KEY=your_brave_search_key
VITE_FIRECRAWL_API_KEY=your_firecrawl_key

# Backend Environment Variables (on Render)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
```

### Integration Status Summary
- **Backend Integration**: 100% Complete ✅
- **Agent System**: Fully Functional (12+ agents) ✅
- **WebSocket Chat**: Real-time Communication ✅
- **Medical Research**: NPI + Web Research ✅
- **Authentication**: Supabase Integration ✅
- **Outreach Tools**: Email/SMS/Magic Links ✅

Canvas is fully integrated with the unified osbackend system and provides comprehensive medical sales intelligence capabilities with AI-powered coaching, real-time doctor verification, and advanced research tools for medical device sales representatives.

## File Naming Conventions

When creating new files:
- **Agent components**: Include "agent" in filename (e.g., `AgentSelector.tsx`)
- **Medical components**: Include "doctor" or "medical" (e.g., `DoctorInfoCard.tsx`)
- **Research components**: Include "research" (e.g., `ResearchPanel.tsx`)
- **Intelligence components**: Include "intelligence" (e.g., `IntelligenceGauge.tsx`)

## Agent Integration Patterns

### Loading Canvas Agents
```javascript
// Correct way to load Canvas agents
const loadCanvasAgents = async () => {
  const response = await fetch(`${API_BASE_URL}/api/canvas/agents`);
  const data = await response.json();
  return data.agents; // Returns 12+ Canvas agents
};
```

### WebSocket Chat Integration
```javascript
// WebSocket connection with Canvas app identification
const socket = io(API_BASE_URL, {
  path: '/agents-ws',
  auth: { 
    token: session.access_token,
    appName: 'canvas' // IMPORTANT: Canvas-specific filtering
  }
});

// Handle agent messages
socket.on('agent:message:chunk', (data) => {
  // Handle streaming response chunks
});
```

### NPI Integration Pattern
```javascript
// Automatic doctor detection during chat
const handleMessage = async (message) => {
  const doctors = detectDoctorMentions(message);
  for (const doctor of doctors) {
    const npiInfo = await lookupNPI(doctor.name);
    if (npiInfo) {
      setDetectedDoctors(prev => [...prev, npiInfo]);
    }
  }
};
```

## Important Notes

- **Always use unified backend** for all agent and research functionality
- **12+ specialized agents** available for medical sales scenarios
- **Real-time WebSocket communication** with streaming agent responses
- **Complete NPI integration** for doctor verification and practice intelligence
- **Multi-API research capabilities** for comprehensive market analysis
- **Mobile-optimized** for medical sales representatives in the field

This application serves as a comprehensive medical sales intelligence platform with full integration to the unified agent backend system, providing AI-powered coaching, real-time research capabilities, and advanced outreach tools for medical device sales success.