/**
 * Rate limiter for API calls to prevent key disabling
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  delayMs?: number;
}

class RateLimiter {
  private queues: Map<string, number[]> = new Map();
  private delays: Map<string, number> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  async checkLimit(key: string): Promise<void> {
    const now = Date.now();
    const queue = this.queues.get(key) || [];
    
    // Remove old entries outside the window
    const validQueue = queue.filter(timestamp => 
      now - timestamp < this.config.windowMs
    );

    // Check if we're at the limit
    if (validQueue.length >= this.config.maxRequests) {
      // Calculate how long to wait
      const oldestRequest = validQueue[0];
      const waitTime = (oldestRequest + this.config.windowMs) - now;
      
      console.log(`⏳ Rate limit reached. Waiting ${Math.ceil(waitTime / 1000)}s...`);
      await this.delay(waitTime);
      
      // Recursive call to recheck
      return this.checkLimit(key);
    }

    // Add current request to queue
    validQueue.push(now);
    this.queues.set(key, validQueue);

    // Add configurable delay between requests
    if (this.config.delayMs) {
      const lastDelay = this.delays.get(key) || 0;
      const timeSinceLastRequest = now - lastDelay;
      
      if (timeSinceLastRequest < this.config.delayMs) {
        const delayNeeded = this.config.delayMs - timeSinceLastRequest;
        await this.delay(delayNeeded);
      }
      
      this.delays.set(key, Date.now());
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset(key: string): void {
    this.queues.delete(key);
    this.delays.delete(key);
  }
}

// Create rate limiters for different APIs
export const openRouterLimiter = new RateLimiter({
  maxRequests: 5, // 5 requests (more conservative)
  windowMs: 60 * 1000, // per minute
  delayMs: 2000 // 2 seconds between requests (safer spacing)
});

export const braveLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 60 * 1000,
  delayMs: 200
});

export const firecrawlLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000,
  delayMs: 500
});

// Export a function to apply rate limiting
export async function withRateLimit<T>(
  limiter: RateLimiter,
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  await limiter.checkLimit(key);
  return fn();
}