# Rate Limit Analysis & Multi-User Handling

## Current OpenRouter Limits (Based on Research)

### Free Models:
- 20 requests/minute
- 1 request every 5 seconds (some sources)

### Paid Models (what you're using):
- No official strict limits mentioned
- But you're getting disabled after 30-40 requests
- Likely has burst protection or account-level limits

## Single User Scenario

### Current Progressive System:
```
Time     | Calls | Running Total | Rate
---------|-------|---------------|----------
0-3s     | 1     | 1             | ✅ Safe
3-30s    | 3     | 4             | ✅ Safe (27s window)
30s-2m   | 4     | 8             | ✅ Safe (90s window)
2-10m    | 5     | 13            | ✅ Safe (8m window)
```

**Verdict**: ✅ Single user is completely safe with 2-minute spread

## Multi-User Problem

### Scenario: 5 Users Start Research Simultaneously
```
User 1: [1 call at 0s] [3 calls at 30s] [4 calls at 2m]...
User 2: [1 call at 5s] [3 calls at 35s] [4 calls at 2m5s]...
User 3: [1 call at 10s] [3 calls at 40s] [4 calls at 2m10s]...
User 4: [1 call at 15s] [3 calls at 45s] [4 calls at 2m15s]...
User 5: [1 call at 20s] [3 calls at 50s] [4 calls at 2m20s]...

Result: 5 calls in first 30 seconds = 10 calls/minute ✅
But: 15 calls around 30-50s mark = potential burst ⚠️
```

## Solutions for Multi-User Load

### 1. Global Rate Limiter (Recommended)
```typescript
// Shared across all users
const globalOpenRouterLimiter = new RateLimiter({
  maxRequests: 15,     // Conservative global limit
  windowMs: 60 * 1000, // Per minute
  delayMs: 2000,       // 2 seconds between ANY calls
  queueing: true       // Queue excess requests
});
```

### 2. User Staggering
```typescript
// Stagger new user research starts
const userStartDelay = Math.random() * 10000; // 0-10 second random delay
await delay(userStartDelay);
engine.startResearch(doctorName, productName);
```

### 3. Time-Based Load Balancing
```typescript
// Spread peak times across the minute
const getNextAvailableSlot = () => {
  const now = Date.now();
  const currentSecond = Math.floor(now / 1000) % 60;
  
  // Find next available 4-second slot
  const slots = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56];
  const nextSlot = slots.find(slot => slot > currentSecond) || slots[0];
  
  const delayMs = nextSlot > currentSecond 
    ? (nextSlot - currentSecond) * 1000
    : (60 - currentSecond + nextSlot) * 1000;
    
  return delayMs;
};
```

### 4. API Key Rotation (Best for Scale)
```typescript
const apiKeys = [
  'sk-or-v1-key1...', // 15 req/min each
  'sk-or-v1-key2...', // 15 req/min each  
  'sk-or-v1-key3...', // 15 req/min each
];

let currentKeyIndex = 0;
const getNextApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return apiKeys[currentKeyIndex];
};

// Total capacity: 45 req/min across 3 keys
```