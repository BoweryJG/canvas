import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../auth/useAuth';
import { supabase } from '../auth/supabase';

const AuthTest: React.FC = () => {
  const { user, session, loading, signInWithProvider } = useAuth();
  const [authState, setAuthState] = useState<any>({});
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    setAuthState({
      hasSession: !!session,
      hasUser: !!session?.user,
      error: error?.message,
      provider: session?.user?.app_metadata?.provider,
      email: session?.user?.email,
      lastSignIn: session?.user?.last_sign_in_at
    });
  };

  const testGoogleLogin = async () => {
    setIsLoading(true);
    setTestResult('Starting Google OAuth...');
    
    try {
      await signInWithProvider('google');
      setTestResult('OAuth initiated successfully! Check if a new window opened.');
    } catch (err: any) {
      setTestResult(`Exception: ${err.message}`);
    }
    
    setIsLoading(false);
  };

  const testGitHubLogin = async () => {
    setIsLoading(true);
    setTestResult('Starting GitHub OAuth...');
    
    try {
      await signInWithProvider('github');
      setTestResult('OAuth initiated successfully! Check if a new window opened.');
    } catch (err: any) {
      setTestResult(`Exception: ${err.message}`);
    }
    
    setIsLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>Canvas Auth Test Page</Typography>
      
      {/* Current State */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>Current Auth State</Typography>
        <Box sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify({ user, session: !!session, loading }, null, 2)}
        </Box>
      </Paper>

      {/* Direct Supabase Check */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>Direct Supabase Check</Typography>
        <Box sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(authState, null, 2)}
        </Box>
        <Button onClick={checkAuthState} variant="contained" sx={{ mt: 2 }}>
          Refresh Check
        </Button>
      </Paper>

      {/* Test Actions */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>Test Authentication</Typography>
        
        {session ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              You are logged in as {session.user.email}
            </Alert>
            <Button onClick={signOut} variant="contained" color="error">
              Sign Out
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
            <Button 
              onClick={testGoogleLogin} 
              variant="contained" 
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
            >
              Test Google Login
            </Button>
            <Button 
              onClick={testGitHubLogin} 
              variant="contained" 
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} />}
              sx={{ bgcolor: '#333', '&:hover': { bgcolor: '#555' } }}
            >
              Test GitHub Login
            </Button>
          </Box>
        )}
        
        {testResult && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {testResult}
          </Alert>
        )}
      </Paper>

      {/* URLs */}
      <Paper sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Typography variant="h6" gutterBottom>Important URLs</Typography>
        <Box sx={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          <div>Current URL: {window.location.href}</div>
          <div>Origin: {window.location.origin}</div>
          <div>Callback URL: {window.location.origin}/auth/callback</div>
        </Box>
      </Paper>
    </Box>
  );
};

export default AuthTest;