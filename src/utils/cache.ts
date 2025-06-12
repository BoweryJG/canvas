/**
 * Simple in-memory cache for API responses
 * Reduces duplicate API calls and improves performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private defaultTTL: number;

  constructor(defaultTTLMinutes: number = 5) {
    this.defaultTTL = defaultTTLMinutes * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Get an item from cache if it exists and hasn't expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set an item in cache with optional custom TTL
   */
  set(key: string, data: T, ttlMinutes?: number): void {
    const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL;
    const now = Date.now();
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear a specific key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    this.clearExpired(); // Clean up first
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instances for different cache types
export const npiCache = new SimpleCache<any>(10); // 10 minute TTL for NPI lookups
export const researchCache = new SimpleCache<any>(30); // 30 minute TTL for research results
export const productCache = new SimpleCache<any>(60); // 60 minute TTL for product info

/**
 * Helper to create a cache key from multiple parts
 */
export function createCacheKey(...parts: (string | number | undefined)[]): string {
  return parts
    .filter(part => part !== undefined)
    .map(part => String(part).toLowerCase().replace(/\s+/g, '-'))
    .join(':');
}

/**
 * Decorator for caching function results
 */
export function withCache<T>(
  cache: SimpleCache<T>,
  keyGenerator: (...args: any[]) => string,
  ttlMinutes?: number
) {
  return function (
    _target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = keyGenerator(...args);
      
      // Check cache first
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        console.log(`Cache hit for ${propertyKey}:`, cacheKey);
        return cached;
      }

      // Call original method
      console.log(`Cache miss for ${propertyKey}:`, cacheKey);
      const result = await originalMethod.apply(this, args);
      
      // Cache the result
      if (result !== null && result !== undefined) {
        cache.set(cacheKey, result, ttlMinutes);
      }

      return result;
    };

    return descriptor;
  };
}