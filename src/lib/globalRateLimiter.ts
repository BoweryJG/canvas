/**
 * Global Rate Limiter - Handles multiple users sharing API limits
 * Prevents any single API from being overwhelmed by concurrent users
 */

interface QueuedRequest {
  id: string;
  timestamp: number;
  resolve: () => void;
  reject: (error: Error) => void;
}

class GlobalRateLimiter {
  private queues: Map<string, number[]> = new Map();
  private requestQueues: Map<string, QueuedRequest[]> = new Map();
  private processing: Map<string, boolean> = new Map();
  private maxRequests: number;
  private windowMs: number;
  private delayMs: number;
  
  constructor(maxRequests: number, windowMs: number, delayMs: number = 1000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.delayMs = delayMs;
  }

  async checkLimit(apiName: string, userId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestId = `${userId || 'anon'}-${Date.now()}-${Math.random()}`;
      
      // Add to queue
      const queue = this.requestQueues.get(apiName) || [];
      queue.push({
        id: requestId,
        timestamp: Date.now(),
        resolve,
        reject
      });
      this.requestQueues.set(apiName, queue);
      
      // Process queue
      this.processQueue(apiName);
    });
  }

  private async processQueue(apiName: string) {
    if (this.processing.get(apiName)) return;
    this.processing.set(apiName, true);

    const queue = this.requestQueues.get(apiName) || [];
    
    while (queue.length > 0) {
      const request = queue[0];
      
      // Check if we can process this request
      if (await this.canProcessRequest(apiName)) {
        // Remove from queue and process
        queue.shift();
        this.recordRequest(apiName);
        request.resolve();
        
        // Wait before processing next
        await this.delay(this.delayMs);
      } else {
        // Wait and check again
        await this.delay(1000);
      }
    }
    
    this.processing.set(apiName, false);
  }

  private async canProcessRequest(apiName: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.queues.get(apiName) || [];
    
    // Remove old requests outside window
    const validRequests = requests.filter(timestamp => 
      now - timestamp < this.windowMs
    );
    this.queues.set(apiName, validRequests);
    
    return validRequests.length < this.maxRequests;
  }

  private recordRequest(apiName: string) {
    const requests = this.queues.get(apiName) || [];
    requests.push(Date.now());
    this.queues.set(apiName, requests);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get current usage stats
  getStats(apiName: string) {
    const now = Date.now();
    const requests = this.queues.get(apiName) || [];
    const validRequests = requests.filter(timestamp => 
      now - timestamp < this.windowMs
    );
    const queueLength = (this.requestQueues.get(apiName) || []).length;
    
    return {
      currentRequests: validRequests.length,
      maxRequests: this.maxRequests,
      queueLength,
      utilizationPercent: (validRequests.length / this.maxRequests) * 100
    };
  }
}

// Global instances for each API
export const globalOpenRouterLimiter = new GlobalRateLimiter(
  10,           // 10 requests max
  60 * 1000,    // per minute
  3000          // 3 seconds between requests
);

export const globalBraveLimiter = new GlobalRateLimiter(
  30,           // 30 requests max  
  60 * 1000,    // per minute
  1000          // 1 second between requests
);

export const globalFirecrawlLimiter = new GlobalRateLimiter(
  15,           // 15 requests max
  60 * 1000,    // per minute
  2000          // 2 seconds between requests
);

/**
 * Multi-user aware rate limiting
 */
export async function withGlobalRateLimit<T>(
  limiter: GlobalRateLimiter,
  apiName: string,
  userId: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  await limiter.checkLimit(apiName, userId);
  return fn();
}

/**
 * User staggering to prevent thundering herd
 */
export function staggerUserStart(userId?: string): Promise<void> {
  // Stagger based on user ID hash if available, otherwise random
  const delay = userId 
    ? (hashCode(userId) % 10000)  // 0-10 seconds based on user
    : Math.random() * 5000;       // 0-5 seconds random
    
  console.log(`⏳ Staggering start by ${Math.round(delay)}ms for user load balancing`);
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simple hash function for consistent user delays
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * API Key Rotation System (for high-scale deployments)
 */
class ApiKeyRotator {
  private currentIndex = 0;
  private keys: string[];
  
  constructor(keys: string[]) {
    this.keys = keys;
    if (keys.length === 0) {
      throw new Error('ApiKeyRotator requires at least one API key');
    }
  }
  
  getNextKey(): string {
    const key = this.keys[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    return key;
  }
  
  getTotalCapacity(requestsPerKey: number): number {
    return this.keys.length * requestsPerKey;
  }
}

// Example: Multiple OpenRouter keys for scale
export const openRouterRotator = new ApiKeyRotator([
  process.env.OPENROUTER_API_KEY || '',
  // Add more keys here as you scale:
  // process.env.OPENROUTER_API_KEY_2 || '',
  // process.env.OPENROUTER_API_KEY_3 || '',
].filter(Boolean));

/**
 * Usage in Netlify Functions:
 * 
 * export const handler = async (event, context) => {
 *   const userId = extractUserId(event);
 *   
 *   await withGlobalRateLimit(
 *     globalOpenRouterLimiter,
 *     'openrouter',
 *     userId,
 *     async () => {
 *       // Your API call here
 *       const apiKey = openRouterRotator.getNextKey();
 *       return fetch('https://openrouter.ai/api/v1/chat/completions', {
 *         headers: { 'Authorization': `Bearer ${apiKey}` }
 *       });
 *     }
 *   );
 * };
 */

/**
 * Real-time monitoring
 */
export function getGlobalStats() {
  return {
    openrouter: globalOpenRouterLimiter.getStats('openrouter'),
    brave: globalBraveLimiter.getStats('brave'),
    firecrawl: globalFirecrawlLimiter.getStats('firecrawl')
  };
}

/**
 * Usage Examples:
 * 
 * // 1. In your research engine
 * await staggerUserStart(userId);
 * await withGlobalRateLimit(globalOpenRouterLimiter, 'openrouter', userId, () => {
 *   return callOpenRouterAPI();
 * });
 * 
 * // 2. Monitor usage
 * const stats = getGlobalStats();
 * console.log(`OpenRouter: ${stats.openrouter.utilizationPercent}% utilized`);
 * 
 * // 3. In UI - show queue position
 * const queuePosition = stats.openrouter.queueLength;
 * if (queuePosition > 0) {
 *   showMessage(`${queuePosition} users ahead of you in queue`);
 * }
 */