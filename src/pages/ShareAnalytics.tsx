/**
 * Share Analytics Page
 */

import { useAuth } from '../auth/hooks';
import { Navigate } from 'react-router-dom';
import MagicLinkAnalytics from '../components/MagicLinkAnalytics';
import { type SubscriptionTier } from '../types/magicLink';

export default function ShareAnalytics() {
  const { user, loading } = useAuth();
  
  // Determine user tier (in production, get from user subscription data)
  const getUserTier = (): SubscriptionTier => {
    if (!user) return 'free';
    // TODO: Get actual tier from user.subscription_tier
    return 'professional'; // Default for demo
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <MagicLinkAnalytics 
      userId={user.id} 
      userTier={getUserTier()}
    />
  );
}