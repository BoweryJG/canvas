/**
 * Intelligent Caching System to Reduce API Calls
 * Caches research results, synthesis, and intermediate data
 */

import { supabase } from '../auth/supabase';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: string;
  expiresAt: string;
  hitCount: number;
}

interface CacheConfig {
  ttlMinutes: number;
  maxSize?: number;
  useSupabase?: boolean;
}

class IntelligentCache {
  private memoryCache: Map<string, CacheEntry> = new Map();
  private config: CacheConfig;
  
  constructor(config: CacheConfig) {
    this.config = config;
  }
  
  /**
   * Generate cache key from multiple parameters
   */
  generateKey(...params: any[]): string {
    return params
      .map(p => typeof p === 'object' ? JSON.stringify(p) : String(p))
      .join('::');
  }
  
  /**
   * Get from cache (memory first, then Supabase if enabled)
   */
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && new Date(memEntry.expiresAt) > new Date()) {
      memEntry.hitCount++;
      console.log(`💾 Cache HIT (memory): ${key.substring(0, 50)}...`);
      return memEntry.data as T;
    }
    
    // Check Supabase cache if enabled
    if (this.config.useSupabase) {
      try {
        const { data, error } = await supabase
          .from('research_cache')
          .select('*')
          .eq('cache_key', key)
          .gt('expires_at', new Date().toISOString())
          .single();
          
        if (data && !error) {
          // Update hit count
          await supabase
            .from('research_cache')
            .update({ hit_count: data.hit_count + 1 })
            .eq('cache_key', key);
            
          // Store in memory cache for faster access
          this.memoryCache.set(key, {
            key,
            data: data.cache_data,
            timestamp: data.created_at,
            expiresAt: data.expires_at,
            hitCount: data.hit_count + 1
          });
          
          console.log(`💾 Cache HIT (Supabase): ${key.substring(0, 50)}...`);
          return data.cache_data as T;
        }
      } catch (error) {
        console.error('Supabase cache error:', error);
      }
    }
    
    console.log(`❌ Cache MISS: ${key.substring(0, 50)}...`);
    return null;
  }
  
  /**
   * Set cache entry
   */
  async set<T>(key: string, data: T, ttlMinutesOverride?: number): Promise<void> {
    const ttl = ttlMinutesOverride || this.config.ttlMinutes;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl * 60 * 1000);
    
    const entry: CacheEntry = {
      key,
      data,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      hitCount: 0
    };
    
    // Store in memory
    this.memoryCache.set(key, entry);
    
    // Enforce max size
    if (this.config.maxSize && this.memoryCache.size > this.config.maxSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }
    
    // Store in Supabase if enabled
    if (this.config.useSupabase) {
      try {
        await supabase
          .from('research_cache')
          .upsert({
            cache_key: key,
            cache_data: data,
            expires_at: expiresAt.toISOString(),
            hit_count: 0
          });
      } catch (error) {
        console.error('Supabase cache write error:', error);
      }
    }
    
    console.log(`💾 Cache SET: ${key.substring(0, 50)}... (TTL: ${ttl}min)`);
  }
  
  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<void> {
    const now = new Date();
    
    // Clear memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (new Date(entry.expiresAt) < now) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clear Supabase cache
    if (this.config.useSupabase) {
      try {
        await supabase
          .from('research_cache')
          .delete()
          .lt('expires_at', now.toISOString());
      } catch (error) {
        console.error('Failed to clear expired Supabase cache:', error);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const stats = {
      memoryEntries: this.memoryCache.size,
      totalHits: 0,
      averageHitRate: 0
    };
    
    for (const entry of this.memoryCache.values()) {
      stats.totalHits += entry.hitCount;
    }
    
    if (this.memoryCache.size > 0) {
      stats.averageHitRate = stats.totalHits / this.memoryCache.size;
    }
    
    return stats;
  }
}

// Singleton caches for different data types
export const doctorCache = new IntelligentCache({
  ttlMinutes: 60 * 24 * 7, // 7 days for doctor data
  maxSize: 1000,
  useSupabase: true
});

export const websiteCache = new IntelligentCache({
  ttlMinutes: 60 * 24, // 24 hours for website data
  maxSize: 500,
  useSupabase: true
});

export const synthesisCache = new IntelligentCache({
  ttlMinutes: 60 * 24 * 3, // 3 days for synthesis
  maxSize: 500,
  useSupabase: true
});

export const searchCache = new IntelligentCache({
  ttlMinutes: 60 * 12, // 12 hours for search results
  maxSize: 200,
  useSupabase: false // Only memory cache for searches
});

/**
 * Cached API call wrapper
 */
export async function cachedApiCall<T>(
  cache: IntelligentCache,
  cacheKey: string,
  apiCall: () => Promise<T>,
  ttlMinutesOverride?: number
): Promise<T> {
  // Try cache first
  const cached = await cache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  // Make API call
  const result = await apiCall();
  
  // Cache the result
  await cache.set(cacheKey, result, ttlMinutesOverride);
  
  return result;
}

/**
 * Batch cache operations for efficiency
 */
export async function batchCacheGet<T>(
  cache: IntelligentCache,
  keys: string[]
): Promise<Map<string, T | null>> {
  const results = new Map<string, T | null>();
  
  // Get all from memory first
  for (const key of keys) {
    const result = await cache.get<T>(key);
    results.set(key, result);
  }
  
  return results;
}

/**
 * Pre-warm cache with common queries
 */
export async function prewarmCache() {
  // This could be called on app startup to pre-load common data
  console.log('🔥 Pre-warming cache...');
  
  // Clear expired entries first
  await Promise.all([
    doctorCache.clearExpired(),
    websiteCache.clearExpired(),
    synthesisCache.clearExpired(),
    searchCache.clearExpired()
  ]);
  
  // Pre-load common products, specialties, etc.
  // This would be customized based on usage patterns
}

/**
 * Cache key generators for consistency
 */
export const CacheKeys = {
  doctor: (npi: string) => `doctor::${npi}`,
  website: (url: string) => `website::${url}`,
  synthesis: (doctorId: string, product: string) => `synthesis::${doctorId}::${product}`,
  search: (query: string) => `search::${query}`,
  reviews: (doctorName: string, location: string) => `reviews::${doctorName}::${location}`,
  competition: (specialty: string, location: string) => `competition::${specialty}::${location}`
};