# NPI Doctor Lookup Integration Guide

## Overview

This guide explains how to integrate NPI (National Provider Identifier) doctor lookup functionality into the Canvas AI Agents system. The integration enables AI agents to automatically detect doctor mentions, look up their information, and provide contextual sales advice.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│  WebSocket       │────▶│   NPI API       │
│   Chat UI       │◀────│  Agent Server    │◀────│   /api/npi-     │
│                 │     │                  │     │   lookup        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │
        ▼                        ▼
┌─────────────────┐     ┌──────────────────┐
│ Doctor Info     │     │  Agent Core      │
│ Components      │     │  System Prompts  │
└─────────────────┘     └──────────────────┘
```

## Key Features

1. **Automatic Doctor Detection**
   - NLP-based detection of doctor names in conversations
   - Confidence scoring to reduce false positives
   - Support for various name formats (Dr. Smith, John Smith MD, etc.)

2. **NPI Registry Integration**
   - Real-time lookup of doctor information
   - Retrieves specialty, location, contact details
   - Caches results for performance

3. **Contextual AI Responses**
   - Agents incorporate doctor information seamlessly
   - Provide specialty-specific sales strategies
   - Maintain conversation context with doctor data

4. **Visual Doctor Cards**
   - Display doctor information inline
   - Quick actions for research and context addition
   - Compact and detailed view modes

## Implementation Steps

### 1. Frontend Integration

Replace the existing ChatInterface with the enhanced version:

```typescript
// In your main App component or router
import EnhancedChatInterface from './components/agents/EnhancedChatInterface';

// Replace ChatInterface with EnhancedChatInterface
<EnhancedChatInterface defaultAgentId={agentId} />
```

### 2. WebSocket Server Updates

The WebSocket server needs to handle new events:

```javascript
// New events to implement:
- 'doctor:detected' - Emitted when doctors are detected in messages
- 'doctor:lookup' - Request to look up a specific doctor
- 'doctor:info' - Response with doctor information
- 'doctor:found' - Notification when a doctor is successfully identified
```

### 3. Agent System Prompt Enhancement

Update your agent's system prompt builder to include doctor context:

```javascript
const { buildSystemPrompt } = require('./lib/agentCore');

// When generating AI responses:
const systemPrompt = buildSystemPrompt({
  agentName: agent.name,
  agentSpecialty: agent.specialty,
  personality: agent.personality,
  doctors: conversationDoctors, // Array of NPIDoctorInfo
  procedure: currentProcedure
});
```

### 4. Database Schema Updates (Optional)

To persist doctor associations with conversations:

```sql
-- Add doctor context to conversations
ALTER TABLE canvas_ai_conversations 
ADD COLUMN context JSONB DEFAULT '{}';

-- Create doctor cache table
CREATE TABLE doctor_npi_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  npi VARCHAR(10) UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX idx_doctor_npi ON doctor_npi_cache(npi);
CREATE INDEX idx_doctor_name ON doctor_npi_cache((data->>'lastName'), (data->>'firstName'));
```

## Usage Examples

### 1. Automatic Detection

When a user mentions a doctor:
```
User: "I have a meeting with Dr. Sarah Johnson tomorrow"
```

The system will:
1. Detect "Dr. Sarah Johnson" as a potential doctor mention
2. Look up in NPI registry
3. Display doctor info card if found
4. Agent responds with context: "Great! I see Dr. Johnson specializes in dermatology. Here are some talking points for aesthetic procedures..."

### 2. Manual Lookup

Users can trigger manual lookups:
```
User: "Look up Dr. Michael Chen in Buffalo"
```

The system will search with location context for better accuracy.

### 3. Sales Context

Agents provide specialty-specific advice:
```
Agent: "Since Dr. Johnson is a dermatologist in downtown Buffalo, 
I recommend focusing on our new laser treatment systems and 
injectable training programs. Her practice location suggests..."
```

## API Endpoints

### NPI Lookup Endpoint
```
GET /api/npi-lookup?search=John+Smith+NY
```

Response:
```json
[
  {
    "npi": "1234567890",
    "displayName": "Dr. John Smith, MD",
    "firstName": "John",
    "lastName": "Smith",
    "credential": "MD",
    "specialty": "Dermatology",
    "city": "Buffalo",
    "state": "NY",
    "fullAddress": "123 Main St, Buffalo, NY 14201",
    "phone": "716-555-0123",
    "organizationName": "Buffalo Dermatology Associates"
  }
]
```

## Best Practices

1. **Privacy Compliance**
   - Only display publicly available NPI data
   - Never store or display patient information
   - Follow HIPAA guidelines

2. **Performance Optimization**
   - Cache NPI lookups to reduce API calls
   - Implement debouncing for real-time detection
   - Limit concurrent lookup requests

3. **User Experience**
   - Show loading states during lookups
   - Provide fallbacks when doctors aren't found
   - Allow manual correction of misidentified doctors

4. **Sales Intelligence**
   - Keep specialty mappings updated
   - Customize sales strategies per specialty
   - Track which doctors are frequently discussed

## Troubleshooting

### Common Issues

1. **Doctor not found**
   - Check name spelling variations
   - Try searching with state/city
   - Verify the doctor is in the NPI registry

2. **False positives**
   - Adjust confidence thresholds
   - Add common name filters
   - Implement user confirmation for low-confidence matches

3. **Performance issues**
   - Implement caching strategy
   - Batch multiple lookups
   - Use pagination for large result sets

## Future Enhancements

1. **Advanced Analytics**
   - Track doctor interaction frequency
   - Measure sales conversation outcomes
   - Generate territory insights

2. **CRM Integration**
   - Sync detected doctors with Salesforce/HubSpot
   - Auto-update contact records
   - Track conversation history per doctor

3. **Predictive Features**
   - Suggest doctors to contact based on patterns
   - Predict best approach strategies
   - Recommend optimal meeting times

## Security Considerations

1. **Data Protection**
   - Encrypt doctor data in transit and at rest
   - Implement access controls per user
   - Audit log all doctor lookups

2. **Rate Limiting**
   - Limit NPI API calls per user
   - Implement exponential backoff
   - Monitor for abuse patterns

## Conclusion

The NPI integration transforms the Canvas AI Agents into intelligent sales assistants that understand the healthcare provider landscape. By automatically enriching conversations with doctor context, sales reps can have more informed, productive interactions.

For questions or support, contact the Canvas development team.