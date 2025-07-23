import { withRetry } from './errorHandling';

interface ApiConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  fallbackData?: unknown;
  cacheKey?: string;
  cacheDuration?: number;
}

interface CachedResponse {
  data: unknown;
  timestamp: number;
}

// Simple in-memory cache for offline support
const responseCache = new Map<string, CachedResponse>();

// Check if cache is still valid
const isCacheValid = (timestamp: number, duration: number): boolean => {
  return Date.now() - timestamp < duration;
};

// Save to localStorage for persistence
const saveToLocalStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(`canvas_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
};

// Load from localStorage
const loadFromLocalStorage = (key: string, duration: number): unknown | null => {
  try {
    const stored = localStorage.getItem(`canvas_cache_${key}`);
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      if (isCacheValid(timestamp, duration)) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Failed to load from localStorage:', e);
  }
  return null;
};

/**
 * Resilient API call with offline support, caching, and retry logic
 */
export async function resilientApiCall<T>(
  apiFunction: () => Promise<T>,
  config: ApiConfig = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 30000,
    fallbackData,
    cacheKey,
    cacheDuration = 5 * 60 * 1000 // 5 minutes default
  } = config;

  // Check cache first
  if (cacheKey) {
    // Check in-memory cache
    const cached = responseCache.get(cacheKey);
    if (cached && isCacheValid(cached.timestamp, cacheDuration)) {
      console.log(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    // Check localStorage cache
    const stored = loadFromLocalStorage(cacheKey, cacheDuration);
    if (stored) {
      console.log(`LocalStorage cache hit for ${cacheKey}`);
      responseCache.set(cacheKey, { data: stored, timestamp: Date.now() });
      return stored;
    }
  }

  // Check if offline
  if (!navigator.onLine) {
    console.warn('Offline - attempting to use cached data');
    
    // Try to get any cached version (even expired)
    if (cacheKey) {
      const cached = responseCache.get(cacheKey);
      if (cached) return cached.data;
      
      const stored = loadFromLocalStorage(cacheKey, Infinity);
      if (stored) return stored;
    }
    
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    
    throw new Error('No internet connection and no cached data available');
  }

  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });

  try {
    // Race between API call and timeout
    const result = await Promise.race([
      withRetry(apiFunction, { maxAttempts: maxRetries, initialDelay: retryDelay }),
      timeoutPromise
    ]) as T;

    // Cache successful response
    if (cacheKey) {
      responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
      saveToLocalStorage(cacheKey, result);
    }

    return result;
  } catch (error) {
    console.error('API call failed:', error);
    
    // Try cache as last resort
    if (cacheKey) {
      const cached = responseCache.get(cacheKey);
      if (cached) {
        console.warn('Using stale cache due to API failure');
        return cached.data;
      }
      
      const stored = loadFromLocalStorage(cacheKey, Infinity);
      if (stored) {
        console.warn('Using stale localStorage cache due to API failure');
        return stored;
      }
    }
    
    // Use fallback data if available
    if (fallbackData !== undefined) {
      console.warn('Using fallback data');
      return fallbackData;
    }
    
    throw error;
  }
}

/**
 * Clear all cached data
 */
export function clearApiCache() {
  responseCache.clear();
  
  // Clear localStorage cache
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('canvas_cache_')) {
      localStorage.removeItem(key);
    }
  });
}

/**
 * Preload critical data for offline use
 */
export async function preloadCriticalData() {
  // This can be called on app start to ensure critical data is cached
  const criticalEndpoints: Array<{ key: string; fetch: () => Promise<unknown> }> = [
    // Add your critical endpoints here
    // Example: { key: 'procedures', fetch: () => fetchProcedures() }
  ];

  await Promise.all(
    criticalEndpoints.map(endpoint => 
      resilientApiCall(endpoint.fetch, { 
        cacheKey: endpoint.key,
        cacheDuration: 24 * 60 * 60 * 1000 // 24 hours
      }).catch(err => console.warn(`Failed to preload ${endpoint.key}:`, err))
    )
  );
}