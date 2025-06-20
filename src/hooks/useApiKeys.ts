import { useEffect } from 'react';
import { apiKeyManager } from '../utils/apiKeyManager';

// Environment variable names for different providers
const API_KEY_ENV_VARS = {
  openai: ['VITE_OPENAI_API_KEY', 'VITE_OPENAI_API_KEY_2', 'VITE_OPENAI_API_KEY_3'],
  perplexity: ['VITE_PERPLEXITY_API_KEY', 'VITE_PERPLEXITY_API_KEY_2'],
  google: ['VITE_GOOGLE_API_KEY', 'VITE_GOOGLE_API_KEY_2'],
  supabase: ['VITE_SUPABASE_ANON_KEY'],
  openrouter: ['VITE_OPENROUTER_API_KEY'],
  firecrawl: ['VITE_FIRECRAWL_API_KEY']
};

export function useApiKeys() {
  useEffect(() => {
    // Register API keys from environment variables
    Object.entries(API_KEY_ENV_VARS).forEach(([provider, envVars]) => {
      const keys = envVars
        .map(envVar => import.meta.env[envVar])
        .filter(Boolean) as string[];
      
      if (keys.length > 0) {
        apiKeyManager.registerKeys({
          provider,
          keys,
          rotationInterval: provider === 'openai' ? 60 * 60 * 1000 : undefined, // Rotate OpenAI keys hourly
          maxUsagePerKey: provider === 'openai' ? 1000 : undefined
        });
      }
    });
    
    // Cleanup on unmount
    return () => {
      apiKeyManager.cleanup();
    };
  }, []);
  
  return apiKeyManager;
}