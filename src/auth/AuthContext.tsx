import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, getRedirectUrl } from './supabase';
import { 
  setupCrossDomainAuthListener, 
  broadcastAuthState, 
  storeReturnUrl, 
  getMainDomain,
  handleCrossDomainRedirect,
  isOnSubdomain 
} from '../utils/crossDomainAuth';
import type { User, AuthSession, AuthState, AuthProvider as AuthProviderType, SignInOptions } from './types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  signInWithProvider: (provider: AuthProviderType, options?: SignInOptions) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, metadata?: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  subscription?: User['subscription'];
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Convert Supabase session to our AuthSession type
  const mapSession = (session: Session | null): AuthSession | null => {
    if (!session) return null;
    
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in || 3600,
      expires_at: session.expires_at,
      token_type: session.token_type,
      user: session.user as User,
    };
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up cross-domain auth listener
        setupCrossDomainAuthListener(supabase);
        
        // Check for cross-domain redirect
        const wasRedirected = await handleCrossDomainRedirect(supabase);
        if (wasRedirected) return;
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (mounted) {
          setState({
            user: session?.user as User | null,
            session: mapSession(session),
            loading: false,
            error: null,
          });
          
          // Broadcast initial auth state if we have a session
          if (session) {
            broadcastAuthState(session);
          }
        }
      } catch (error: any) {
        if (mounted) {
          setState({
            user: null,
            session: null,
            loading: false,
            error: { message: error.message },
          });
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setState(prev => ({
            ...prev,
            user: session?.user as User | null,
            session: mapSession(session),
            loading: false,
            error: null,
          }));
          
          // Broadcast auth state changes to other domains
          broadcastAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithProvider = useCallback(async (
    provider: AuthProviderType, 
    options?: SignInOptions
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Store current URL before redirecting
      storeReturnUrl(window.location.href);
      
      // Always redirect to main domain for OAuth
      const mainDomain = getMainDomain();
      const redirectUrl = `${mainDomain}/auth/callback`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: options?.redirectTo || redirectUrl,
          scopes: options?.scopes,
          queryParams: options?.queryParams,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: { message: error.message } 
      }));
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: data.user as User,
        session: mapSession(data.session),
        loading: false,
        error: null,
      }));
      
      // Broadcast auth state to other domains
      if (data.session) {
        broadcastAuthState(data.session);
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: { message: error.message } 
      }));
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (
    email: string, 
    password: string, 
    metadata?: any
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: data.user as User,
        session: mapSession(data.session),
        loading: false,
        error: null,
      }));
      
      // Broadcast auth state to other domains
      if (data.session) {
        broadcastAuthState(data.session);
      }
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: { message: error.message } 
      }));
      throw error;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
      
      // Broadcast logout to other domains
      broadcastAuthState(null);
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: { message: error.message } 
      }));
      throw error;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        session: mapSession(data.session),
        error: null,
      }));
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        error: { message: error.message } 
      }));
      throw error;
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    signInWithProvider,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshSession,
    subscription: state.user?.subscription,
    isAdmin: state.user?.app_metadata?.roles?.includes('admin') || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};