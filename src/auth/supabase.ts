import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if the URL is masked/invalid (contains asterisks or is not a valid URL)
if (!supabaseUrl || supabaseUrl.includes('*') || !supabaseUrl.match(/^https?:\/\//)) {
  console.error('Invalid or missing Supabase URL. Please set VITE_SUPABASE_URL environment variable.');
  supabaseUrl = 'https://placeholder.supabase.co'; // This will fail but won't expose secrets
}

// Log warning instead of throwing error
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables - using defaults');
}

// Create a single supabase client with simplified configuration
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-cbopynuvhcymbumjnvay-auth-token', // Use the exact key that's working
    flowType: 'implicit' as const // Use implicit flow for better OAuth handling
  }
});

// Helper to get the current app URL for redirects
export const getAppUrl = () => {
  if (typeof window === 'undefined') return '';
  
  // Always use the current window origin to get the correct port
  return window.location.origin;
};

// Get redirect URL for OAuth
export const getRedirectUrl = (returnPath?: string) => {
  const baseUrl = getAppUrl();
  return returnPath ? `${baseUrl}${returnPath}` : baseUrl;
};