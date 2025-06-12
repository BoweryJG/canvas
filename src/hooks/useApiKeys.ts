import { useEffect } from 'react';
import { apiKeyManager } from '../utils/apiKeyManager';

// Environment variable names for different providers
const API_KEY_ENV_VARS = {
  openai: ['REACT_APP_OPENAI_API_KEY', 'REACT_APP_OPENAI_API_KEY_2', 'REACT_APP_OPENAI_API_KEY_3'],
  perplexity: ['REACT_APP_PERPLEXITY_API_KEY', 'REACT_APP_PERPLEXITY_API_KEY_2'],
  google: ['REACT_APP_GOOGLE_API_KEY', 'REACT_APP_GOOGLE_API_KEY_2'],
  supabase: ['REACT_APP_SUPABASE_ANON_KEY']
};

export function useApiKeys() {
  useEffect(() => {
    // Register API keys from environment variables
    Object.entries(API_KEY_ENV_VARS).forEach(([provider, envVars]) => {
      const keys = envVars
        .map(envVar => process.env[envVar])
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