/**
 * Subscription Enforcement Service
 * Handles scan limit validation and usage tracking for RepX tiers
 */

import { supabase } from '../auth/supabase';
import { SUBSCRIPTION_TIERS } from './subscriptionTiers';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://osbackend-zl1h.onrender.com';

export interface UsageStatus {
  canScan: boolean;
  scansUsedToday: number;
  scansRemaining: number;
  dailyLimit: number;
  userTier: string;
  resetTime: string; // When daily limit resets
  upgradeRequired?: boolean;
  message?: string;
}

export interface SubscriptionInfo {
  tier: string;
  status: 'active' | 'inactive' | 'canceled' | 'trialing';
  scansPerDay: number;
  features: unknown;
}

/**
 * Get user's current subscription info from Supabase
 */
export async function getUserSubscription(userId: string): Promise<SubscriptionInfo> {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('subscription')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Error fetching subscription:', error);
      return {
        tier: 'free',
        status: 'inactive',
        scansPerDay: SUBSCRIPTION_TIERS.free.apiLimits.scansPerDay,
        features: SUBSCRIPTION_TIERS.free.features
      };
    }

    const subscription = profile?.subscription;
    const tier = subscription?.tier || 'free';
    const tierConfig = SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;

    return {
      tier,
      status: subscription?.status || 'inactive',
      scansPerDay: tierConfig.apiLimits.scansPerDay,
      features: tierConfig.features
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return {
      tier: 'free',
      status: 'inactive',
      scansPerDay: SUBSCRIPTION_TIERS.free.apiLimits.scansPerDay,
      features: SUBSCRIPTION_TIERS.free.features
    };
  }
}

/**
 * Get user's scan usage for today
 */
export async function getTodaysUsage(userId: string): Promise<{ scansUsed: number; lastReset: string }> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Check if we have a usage record for today
    const { data: usage, error } = await supabase
      .from('daily_usage')
      .select('scans_used, created_at')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching usage:', error);
      return { scansUsed: 0, lastReset: new Date().toISOString() };
    }

    return {
      scansUsed: usage?.scans_used || 0,
      lastReset: usage?.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting today\'s usage:', error);
    return { scansUsed: 0, lastReset: new Date().toISOString() };
  }
}

/**
 * Check if user can perform a scan using backend API
 */
export async function checkScanLimits(userId: string): Promise<UsageStatus> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/usage/check-limits/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const result = await response.json();
    const status = result.data?.status;

    if (!status) {
      throw new Error('Invalid response from backend');
    }

    return {
      canScan: status.allowed,
      scansUsedToday: status.current_usage || 0,
      scansRemaining: status.remaining || 0,
      dailyLimit: status.daily_limit || 0,
      userTier: status.tier || 'free',
      resetTime: getNextResetTime(),
      upgradeRequired: !status.allowed && status.remaining === 0,
      message: status.message || ''
    };
  } catch (error) {
    console.error('Error checking scan limits:', error);
    // Fallback to local check if backend is unavailable
    return await checkScanLimitsLocal(userId);
  }
}

/**
 * Fallback local check if backend is unavailable
 */
async function checkScanLimitsLocal(userId: string): Promise<UsageStatus> {
  try {
    const [subscription, usage] = await Promise.all([
      getUserSubscription(userId),
      getTodaysUsage(userId)
    ]);

    const { tier, scansPerDay, status } = subscription;
    const { scansUsed } = usage;

    // Special handling for different tiers
    if (tier === 'repx1') {
      return {
        canScan: false,
        scansUsedToday: 0,
        scansRemaining: 0,
        dailyLimit: 0,
        userTier: tier,
        resetTime: getNextResetTime(),
        upgradeRequired: true,
        message: 'RepX1 includes phone services only. Upgrade to RepX2+ for Canvas scans.'
      };
    }

    if (tier === 'repx5' || scansPerDay === 999999) {
      return {
        canScan: true,
        scansUsedToday: scansUsed,
        scansRemaining: 999999,
        dailyLimit: 999999,
        userTier: tier,
        resetTime: getNextResetTime(),
        message: 'Unlimited scans available'
      };
    }

    const scansRemaining = Math.max(0, scansPerDay - scansUsed);
    const canScan = scansRemaining > 0 && status === 'active';

    let message = '';
    if (!canScan && scansRemaining === 0) {
      message = `Daily limit reached. Upgrade to ${getNextTierSuggestion(tier)} for more scans.`;
    } else if (!canScan && status !== 'active') {
      message = 'Subscription inactive. Please update your subscription.';
    } else if (scansRemaining <= 2) {
      message = `Only ${scansRemaining} scans remaining today.`;
    }

    return {
      canScan,
      scansUsedToday: scansUsed,
      scansRemaining,
      dailyLimit: scansPerDay,
      userTier: tier,
      resetTime: getNextResetTime(),
      upgradeRequired: !canScan && scansRemaining === 0,
      message
    };
  } catch (error) {
    console.error('Error in local scan limit check:', error);
    // Fail gracefully - allow scan but with warning
    return {
      canScan: true,
      scansUsedToday: 0,
      scansRemaining: 1,
      dailyLimit: 1,
      userTier: 'free',
      resetTime: getNextResetTime(),
      message: 'Unable to verify scan limits. Proceeding with caution.'
    };
  }
}

/**
 * Record a scan usage using backend API (call after successful scan)
 */
export async function recordScanUsage(userId: string, scanType: string = 'canvas'): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/usage/record-scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        scan_type: scanType
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const result = await response.json();
    return result.success || false;
  } catch (error) {
    console.error('Error recording scan usage:', error);
    // Fallback to local recording if backend is unavailable
    return await recordScanUsageLocal(userId, scanType);
  }
}

/**
 * Fallback local scan usage recording
 */
async function recordScanUsageLocal(userId: string, scanType: string = 'canvas'): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Use upsert to increment today's usage
    const { error } = await supabase
      .from('daily_usage')
      .upsert({
        user_id: userId,
        date: today,
        scans_used: 1, // This will be handled by database increment
        scan_type: scanType,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error recording scan usage locally:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording scan usage locally:', error);
    return false;
  }
}

/**
 * Get next tier suggestion for upgrade prompts
 */
function getNextTierSuggestion(currentTier: string): string {
  const tierOrder = ['free', 'repx1', 'repx2', 'repx3', 'repx4', 'repx5'];
  const currentIndex = tierOrder.indexOf(currentTier);
  
  if (currentIndex < tierOrder.length - 1) {
    const nextTier = tierOrder[currentIndex + 1];
    return SUBSCRIPTION_TIERS[nextTier]?.displayName || 'higher tier';
  }
  
  return 'RepX5 Elite Global';
}

/**
 * Get next daily reset time (midnight UTC)
 */
function getNextResetTime(): string {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Pre-scan validation hook - call before any research operation
 */
export async function validateScanRequest(userId: string): Promise<{
  allowed: boolean;
  status: UsageStatus;
  errorMessage?: string;
}> {
  if (!userId) {
    return {
      allowed: false,
      status: {
        canScan: false,
        scansUsedToday: 0,
        scansRemaining: 0,
        dailyLimit: 0,
        userTier: 'free',
        resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        upgradeRequired: true,
        message: 'User authentication required'
      },
      errorMessage: 'User authentication required'
    };
  }

  const status = await checkScanLimits(userId);
  
  return {
    allowed: status.canScan,
    status,
    errorMessage: status.canScan ? undefined : status.message
  };
}

/**
 * Get usage summary for UI display using backend API
 */
export async function getUsageSummary(userId: string): Promise<{
  tier: string;
  scansUsed: number;
  scansRemaining: number;
  dailyLimit: number;
  upgradeAvailable: boolean;
}> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/usage/summary/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const result = await response.json();
    const summary = result.data;

    return {
      tier: summary.tier || 'free',
      scansUsed: summary.scansUsed || 0,
      scansRemaining: summary.scansRemaining || 0,
      dailyLimit: summary.dailyLimit || 0,
      upgradeAvailable: summary.upgradeAvailable || false
    };
  } catch (error) {
    console.error('Error fetching usage summary:', error);
    // Fallback to local check
    const status = await checkScanLimits(userId);
    
    return {
      tier: status.userTier,
      scansUsed: status.scansUsedToday,
      scansRemaining: status.scansRemaining,
      dailyLimit: status.dailyLimit,
      upgradeAvailable: status.upgradeRequired || false
    };
  }
}