import { useEffect } from 'react';
import { supabase } from '../auth/supabase';
import { useNavigate } from 'react-router-dom';

export default function ForceAuth() {
  const navigate = useNavigate();
  
  useEffect(() => {
    async function forceAuth() {
      console.log('FORCING AUTH CHECK...');
      
      // Force check session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Force auth error:', error);
      } else if (session) {
        console.log('SESSION FOUND:', session.user.email);
        // Force a page reload to trigger auth context
        window.location.href = '/';
      } else {
        console.log('NO SESSION - redirecting to login');
        navigate('/login');
      }
    }
    
    forceAuth();
  }, [navigate]);
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Forcing authentication check...</h1>
    </div>
  );
}