/**
 * React hook for subscription limit management
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { 
  checkScanLimits, 
  recordScanUsage, 
  validateScanRequest, 
  getUsageSummary,
  type UsageStatus 
} from '../lib/subscriptionEnforcement';

export interface SubscriptionLimitsState {
  loading: boolean;
  status: UsageStatus | null;
  error: string | null;
  canScan: boolean;
  scansRemaining: number;
  userTier: string;
  checkLimits: () => Promise<void>;
  recordUsage: (scanType?: string) => Promise<boolean>;
  validateScan: () => Promise<{ allowed: boolean; errorMessage?: string }>;
}

/**
 * Hook for managing subscription limits and usage tracking
 */
export function useSubscriptionLimits(): SubscriptionLimitsState {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<UsageStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkLimits = async () => {
    if (!user?.id) {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const limitStatus = await checkScanLimits(user.id);
      setStatus(limitStatus);
    } catch (err) {
      console.error('Error checking subscription limits:', err);
      setError(err instanceof Error ? err.message : 'Failed to check limits');
    } finally {
      setLoading(false);
    }
  };

  const recordUsage = async (scanType: string = 'canvas'): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const success = await recordScanUsage(user.id, scanType);
      if (success) {
        // Refresh limits after recording usage
        await checkLimits();
      }
      return success;
    } catch (err) {
      console.error('Error recording scan usage:', err);
      return false;
    }
  };

  const validateScan = async (): Promise<{ allowed: boolean; errorMessage?: string }> => {
    if (!user?.id) {
      return { 
        allowed: false, 
        errorMessage: 'Please log in to continue' 
      };
    }

    try {
      const validation = await validateScanRequest(user.id);
      return {
        allowed: validation.allowed,
        errorMessage: validation.errorMessage
      };
    } catch (err) {
      console.error('Error validating scan request:', err);
      return {
        allowed: false,
        errorMessage: 'Unable to validate scan request'
      };
    }
  };

  // Load initial limits when user changes
  useEffect(() => {
    if (user?.id) {
      checkLimits();
    } else {
      setStatus(null);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    loading,
    status,
    error,
    canScan: status?.canScan || false,
    scansRemaining: status?.scansRemaining || 0,
    userTier: status?.userTier || 'free',
    checkLimits,
    recordUsage,
    validateScan
  };
}

/**
 * Simplified hook for just checking if user can scan
 */
export function useCanScan(): {
  canScan: boolean;
  loading: boolean;
  errorMessage?: string;
  checkAndRecord: (scanType?: string) => Promise<boolean>;
} {
  const { validateScan, recordUsage, loading, status } = useSubscriptionLimits();

  const checkAndRecord = async (scanType?: string): Promise<boolean> => {
    const validation = await validateScan();
    
    if (!validation.allowed) {
      return false;
    }

    // Record the usage
    return await recordUsage(scanType);
  };

  return {
    canScan: status?.canScan || false,
    loading,
    errorMessage: status?.message,
    checkAndRecord
  };
}

/**
 * Hook for usage display components
 */
export function useUsageDisplay(): {
  tier: string;
  scansUsed: number;
  scansRemaining: number;
  dailyLimit: number;
  upgradeAvailable: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState({
    tier: 'free',
    scansUsed: 0,
    scansRemaining: 0,
    dailyLimit: 0,
    upgradeAvailable: false
  });

  const refresh = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const summary = await getUsageSummary(user.id);
      setUsage(summary);
    } catch (err) {
      console.error('Error fetching usage summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      refresh();
    }
  }, [user?.id]);

  return {
    ...usage,
    loading,
    refresh
  };
}