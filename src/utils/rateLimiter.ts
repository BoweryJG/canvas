interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  
  /**
   * Check if request is allowed under rate limit
   */
  async checkLimit(config: RateLimitConfig): Promise<boolean> {
    const key = config.identifier || 'default';
    const now = Date.now();
    const entry = this.limits.get(key);
    
    if (!entry || now > entry.resetTime) {
      // Create new window
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return true;
    }
    
    if (entry.count >= config.maxRequests) {
      // Rate limit exceeded
      const waitTime = entry.resetTime - now;
      throw new RateLimitError(
        `Rate limit exceeded. Please wait ${Math.ceil(waitTime / 1000)} seconds.`,
        waitTime
      );
    }
    
    // Increment count
    entry.count++;
    return true;
  }
  
  /**
   * Get remaining requests for a limit
   */
  getRemaining(identifier: string = 'default'): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() > entry.resetTime) {
      return Infinity;
    }
    return Math.max(0, entry.count);
  }
  
  /**
   * Reset a specific limit
   */
  reset(identifier: string = 'default') {
    this.limits.delete(identifier);
  }
  
  /**
   * Clear all limits
   */
  clearAll() {
    this.limits.clear();
  }
}

export class RateLimitError extends Error {
  waitTime: number;
  
  constructor(message: string, waitTime: number) {
    super(message);
    this.name = 'RateLimitError';
    this.waitTime = waitTime;
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Predefined limits for different API types
export const API_LIMITS = {
  npiLookup: {
    maxRequests: 30,
    windowMs: 60 * 1000 // 30 per minute
  },
  webResearch: {
    maxRequests: 10,
    windowMs: 60 * 1000 // 10 per minute
  },
  aiGeneration: {
    maxRequests: 5,
    windowMs: 60 * 1000 // 5 per minute
  },
  emailSend: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000 // 5 per hour
  }
};

/**
 * Decorator to add rate limiting to any async function
 */
export function withRateLimit(config: RateLimitConfig) {
  return function (_target: object, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (this: unknown, ...args: unknown[]) {
      await rateLimiter.checkLimit(config);
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

/**
 * Rate-limited API call wrapper
 */
export async function rateLimitedApiCall<T>(
  apiFunction: () => Promise<T>,
  limitConfig: RateLimitConfig
): Promise<T> {
  await rateLimiter.checkLimit(limitConfig);
  return apiFunction();
}

/**
 * Get rate limit status for UI display
 */
export function getRateLimitStatus(identifier: string): {
  remaining: number;
  total: number;
  resetIn: number;
} {
  const limits = API_LIMITS[identifier as keyof typeof API_LIMITS];
  if (!limits) {
    return { remaining: Infinity, total: Infinity, resetIn: 0 };
  }
  
  const remaining = rateLimiter.getRemaining(identifier);
  return {
    remaining,
    total: limits.maxRequests,
    resetIn: limits.windowMs
  };
}