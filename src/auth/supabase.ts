import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a single supabase client for interacting with your database
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

// Helper to get the current app URL for redirects
export const getAppUrl = () => {
  if (typeof window === 'undefined') return '';
  
  // In production, use the actual domain
  if (window.location.hostname !== 'localhost') {
    return window.location.origin;
  }
  
  // In development, use localhost
  return 'http://localhost:3000';
};

// Get redirect URL for OAuth
export const getRedirectUrl = (returnPath?: string) => {
  const baseUrl = getAppUrl();
  return returnPath ? `${baseUrl}${returnPath}` : baseUrl;
};