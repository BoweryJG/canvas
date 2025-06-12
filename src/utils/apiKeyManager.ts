import { DataManager } from './dataManager';

interface ApiKey {
  key: string;
  provider: string;
  createdAt: number;
  lastUsed?: number;
  usageCount: number;
  rateLimit?: {
    remaining: number;
    resetAt: number;
  };
  isActive: boolean;
}

interface ApiKeyConfig {
  provider: string;
  keys: string[];
  rotationInterval?: number; // milliseconds
  maxUsagePerKey?: number;
}

class ApiKeyManager {
  private keys: Map<string, ApiKey[]> = new Map();
  private currentIndex: Map<string, number> = new Map();
  private rotationTimers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor() {
    this.loadFromStorage();
  }
  
  /**
   * Register API keys for a provider
   */
  registerKeys(config: ApiKeyConfig) {
    const { provider, keys, rotationInterval } = config;
    
    const apiKeys = keys.map(key => ({
      key,
      provider,
      createdAt: Date.now(),
      usageCount: 0,
      isActive: true
    }));
    
    this.keys.set(provider, apiKeys);
    this.currentIndex.set(provider, 0);
    
    // Set up automatic rotation if interval specified
    if (rotationInterval) {
      const timer = setInterval(() => {
        this.rotateKey(provider);
      }, rotationInterval);
      
      this.rotationTimers.set(provider, timer);
    }
    
    this.saveToStorage();
  }
  
  /**
   * Get current API key for a provider
   */
  getCurrentKey(provider: string): string | null {
    const providerKeys = this.keys.get(provider);
    if (!providerKeys || providerKeys.length === 0) {
      console.error(`No API keys registered for provider: ${provider}`);
      return null;
    }
    
    const index = this.currentIndex.get(provider) || 0;
    const currentKey = providerKeys[index];
    
    if (!currentKey.isActive) {
      // Try to find an active key
      const activeKey = this.findActiveKey(provider);
      if (!activeKey) {
        console.error(`No active API keys available for provider: ${provider}`);
        return null;
      }
      return activeKey.key;
    }
    
    // Update usage stats
    currentKey.lastUsed = Date.now();
    currentKey.usageCount++;
    
    this.saveToStorage();
    return currentKey.key;
  }
  
  /**
   * Manually rotate to next API key
   */
  rotateKey(provider: string): boolean {
    const providerKeys = this.keys.get(provider);
    if (!providerKeys || providerKeys.length <= 1) {
      return false;
    }
    
    const currentIndex = this.currentIndex.get(provider) || 0;
    let nextIndex = (currentIndex + 1) % providerKeys.length;
    let attempts = 0;
    
    // Find next active key
    while (attempts < providerKeys.length) {
      if (providerKeys[nextIndex].isActive) {
        this.currentIndex.set(provider, nextIndex);
        console.log(`Rotated to API key ${nextIndex} for ${provider}`);
        this.saveToStorage();
        return true;
      }
      nextIndex = (nextIndex + 1) % providerKeys.length;
      attempts++;
    }
    
    console.error(`No active keys available for rotation: ${provider}`);
    return false;
  }
  
  /**
   * Mark a key as rate limited
   */
  markRateLimited(provider: string, resetAt: number) {
    const providerKeys = this.keys.get(provider);
    if (!providerKeys) return;
    
    const index = this.currentIndex.get(provider) || 0;
    const currentKey = providerKeys[index];
    
    currentKey.rateLimit = {
      remaining: 0,
      resetAt
    };
    
    // Auto-rotate if other keys available
    this.rotateKey(provider);
    this.saveToStorage();
  }
  
  /**
   * Deactivate a compromised or invalid key
   */
  deactivateKey(provider: string, keySubstring: string) {
    const providerKeys = this.keys.get(provider);
    if (!providerKeys) return;
    
    const key = providerKeys.find(k => k.key.includes(keySubstring));
    if (key) {
      key.isActive = false;
      console.warn(`Deactivated API key for ${provider}`);
      
      // Rotate if this was the current key
      const currentIndex = this.currentIndex.get(provider) || 0;
      if (providerKeys[currentIndex] === key) {
        this.rotateKey(provider);
      }
      
      this.saveToStorage();
    }
  }
  
  /**
   * Find an active key for a provider
   */
  private findActiveKey(provider: string): ApiKey | null {
    const providerKeys = this.keys.get(provider);
    if (!providerKeys) return null;
    
    // First try keys that haven't hit rate limits
    const availableKey = providerKeys.find(key => 
      key.isActive && 
      (!key.rateLimit || Date.now() > key.rateLimit.resetAt)
    );
    
    if (availableKey) return availableKey;
    
    // If all keys are rate limited, find the one that resets soonest
    const rateLimitedKeys = providerKeys
      .filter(key => key.isActive && key.rateLimit)
      .sort((a, b) => (a.rateLimit?.resetAt || 0) - (b.rateLimit?.resetAt || 0));
    
    return rateLimitedKeys[0] || null;
  }
  
  /**
   * Get statistics for all API keys
   */
  getStats(provider?: string): any {
    if (provider) {
      const providerKeys = this.keys.get(provider);
      if (!providerKeys) return null;
      
      return {
        provider,
        totalKeys: providerKeys.length,
        activeKeys: providerKeys.filter(k => k.isActive).length,
        currentIndex: this.currentIndex.get(provider) || 0,
        keys: providerKeys.map(k => ({
          isActive: k.isActive,
          usageCount: k.usageCount,
          lastUsed: k.lastUsed,
          rateLimit: k.rateLimit
        }))
      };
    }
    
    // Return stats for all providers
    const stats: any = {};
    this.keys.forEach((_keys, provider) => {
      stats[provider] = this.getStats(provider);
    });
    return stats;
  }
  
  /**
   * Save state to localStorage
   */
  private saveToStorage() {
    const state = {
      keys: Array.from(this.keys.entries()),
      currentIndex: Array.from(this.currentIndex.entries())
    };
    
    DataManager.save('api_keys', state, { encrypt: true });
  }
  
  /**
   * Load state from localStorage
   */
  private loadFromStorage() {
    const state = DataManager.load<any>('api_keys', { encrypt: true });
    if (state) {
      this.keys = new Map(state.keys);
      this.currentIndex = new Map(state.currentIndex);
    }
  }
  
  /**
   * Clean up timers
   */
  cleanup() {
    this.rotationTimers.forEach(timer => clearInterval(timer));
    this.rotationTimers.clear();
  }
}

// Global instance
export const apiKeyManager = new ApiKeyManager();

// Convenience function for API calls with key rotation
export async function apiCallWithRotation<T>(
  provider: string,
  apiFunction: (apiKey: string) => Promise<T>
): Promise<T> {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    const apiKey = apiKeyManager.getCurrentKey(provider);
    if (!apiKey) {
      throw new Error(`No API key available for ${provider}`);
    }
    
    try {
      return await apiFunction(apiKey);
    } catch (error: any) {
      attempts++;
      
      // Check if it's a rate limit or auth error
      if (error.response?.status === 429) {
        const resetAt = Date.now() + 60000; // Default 1 minute
        apiKeyManager.markRateLimited(provider, resetAt);
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        // Deactivate invalid key
        apiKeyManager.deactivateKey(provider, apiKey.substring(0, 8));
      }
      
      if (attempts >= maxAttempts) {
        throw error;
      }
      
      // Try rotating to a different key
      if (!apiKeyManager.rotateKey(provider)) {
        throw new Error(`Unable to rotate API keys for ${provider}`);
      }
    }
  }
  
  throw new Error(`Failed after ${maxAttempts} attempts`);
}