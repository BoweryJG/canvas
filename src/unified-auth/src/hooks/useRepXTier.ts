import { useState, useEffect } from 'react';
import { RepXTier } from '../types';
import type { UserSubscription } from '../types';
import { BACKEND_URL } from '../constants';

interface UseRepXTierResult {
  tier: RepXTier;
  subscription: UserSubscription | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRepXTier(userId?: string): UseRepXTierResult {
  const [tier, setTier] = useState<RepXTier>(RepXTier.Rep0);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BACKEND_URL}/api/repx/validate-access`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to validate access');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const { tier, subscription, features, connections } = result.data;
        
        // Convert backend tier format to frontend enum
        let frontendTier: RepXTier = RepXTier.Rep0;
        switch (tier) {
          case 'repx0': frontendTier = RepXTier.Rep0; break;
          case 'repx1': frontendTier = RepXTier.Rep1; break;
          case 'repx2': frontendTier = RepXTier.Rep2; break;
          case 'repx3': frontendTier = RepXTier.Rep3; break;
          case 'repx4': frontendTier = RepXTier.Rep4; break;
          case 'repx5': frontendTier = RepXTier.Rep5; break;
        }
        
        setTier(frontendTier);
        setSubscription({
          ...subscription,
          tier: frontendTier,
          features,
          connections
        });
      } else {
        setTier(RepXTier.Rep0);
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching RepX tier:', err);
      setError(err as Error);
      setTier(RepXTier.Rep0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [userId]);

  return {
    tier,
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
  };
}