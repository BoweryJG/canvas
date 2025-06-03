# OpenRouter API Key Fix

## Problem
Your OpenRouter API keys are getting disabled after 30-40 requests.

## Solution Implemented

### 1. Rate Limiting
Added rate limiting to prevent hitting OpenRouter's limits:
- **10 requests per minute** for OpenRouter/Claude
- **1 second delay** between each request
- Automatic queuing if limit is exceeded

### 2. Model Optimization
Current model: `anthropic/claude-opus-4`
- This is a premium model with stricter limits
- Consider switching to `anthropic/claude-3-opus-20240229` for better limits

### 3. Request Batching
The app can make many parallel requests during research. The rate limiter now:
- Queues requests automatically
- Shows wait time in console
- Prevents key disabling

## How to Adjust Limits

Edit `src/lib/rateLimiter.ts`:

```typescript
export const openRouterLimiter = new RateLimiter({
  maxRequests: 10,      // Reduce to 5 if still having issues
  windowMs: 60 * 1000,  // Keep at 1 minute
  delayMs: 1000        // Increase to 2000 for safer spacing
});
```

## Alternative Solutions

### 1. Use Multiple API Keys
Create a key rotation system:
```typescript
const apiKeys = [
  'sk-or-v1-key1...',
  'sk-or-v1-key2...',
  'sk-or-v1-key3...'
];
let currentKeyIndex = 0;

function getNextKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return apiKeys[currentKeyIndex];
}
```

### 2. Switch to Cheaper Models
In `netlify/functions/claude-outreach.ts`, change:
```typescript
model: 'anthropic/claude-3-haiku-20240307' // Cheaper, higher limits
// or
model: 'openai/gpt-3.5-turbo' // Even cheaper
```

### 3. Cache AI Responses
Store common patterns to reduce API calls:
- Cache doctor profiles by name
- Cache product intelligence
- Reuse similar outreach templates

## Monitoring

Watch the console for rate limit messages:
```
⏳ Rate limit reached. Waiting 45s...
```

This means the system is working and protecting your API key.

## Deployment

```bash
git add .
git commit -m "Add rate limiting to prevent OpenRouter key disabling"
git push origin main
```

The rate limiter will prevent your keys from being disabled going forward.