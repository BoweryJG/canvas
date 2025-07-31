/**
 * UnifiedAuthContext for Canvas
 * Created: July 30, 2025
 * 
 * Integrates unified authentication system into Canvas
 * Provides RepX tier-based feature access for sales intelligence
 */

import React, { createContext, useContext } from 'react';
import { useAuth } from '../auth/useAuth';
import { RepXTier, useRepXTier, useFeatureAccess, useAgentTimeLimit } from '../unified-auth';

// Feature access interface
export interface FeatureAccess {
  sso: boolean;
  emailIntegration: boolean;
  phoneProvisioning: boolean;
  gmailSync: boolean;
  whiteLabel: boolean;
  unlimitedAgents: boolean;
}

// User subscription interface
export interface UserSubscription {
  tier: string;
  repxTier: RepXTier;
  status: string;
  credits: number;
  creditsUsed: number;
}

interface UnifiedAuthContextType {
  // RepX tier information
  subscription: UserSubscription | null;
  tierLoading: boolean;
  tierError: Error | null;
  
  // Feature access
  features: FeatureAccess;
  checkFeature: (feature: keyof FeatureAccess) => boolean;
  
  // Agent time limits
  agentTimeLimit: number;
  agentDisplayTime: string;
  isUnlimitedAgent: boolean;
  
  // Canvas-specific features
  canAccessAIAgents: () => boolean;
  canUseResearchTools: () => boolean;
  canExportReports: () => boolean;
  getResearchLimit: () => number | null;
  
  // Tier comparison helper
  meetsMinimumTier: (minimumTier: RepXTier) => boolean;
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Use unified auth hooks
  const { tier, subscription, loading: tierLoading, error: tierError } = useRepXTier(userId);
  const { features: unifiedFeatures } = useFeatureAccess(userId);
  const { timeLimit: agentTimeLimit, displayTime: agentDisplayTime, isUnlimited: isUnlimitedAgent } = useAgentTimeLimit(userId);

  // Helper function to check if current tier meets minimum requirement
  const meetsMinimumTier = (minimumTier: RepXTier): boolean => {
    const tierOrder = [RepXTier.Rep0, RepXTier.Rep1, RepXTier.Rep2, RepXTier.Rep3, RepXTier.Rep4, RepXTier.Rep5];
    const currentIndex = tierOrder.indexOf(tier);
    const minimumIndex = tierOrder.indexOf(minimumTier);
    return currentIndex >= minimumIndex;
  };

  // Canvas-specific feature access (simplified)
  const features: FeatureAccess = {
    sso: meetsMinimumTier(RepXTier.Rep1),
    emailIntegration: meetsMinimumTier(RepXTier.Rep2),
    phoneProvisioning: meetsMinimumTier(RepXTier.Rep3),
    gmailSync: meetsMinimumTier(RepXTier.Rep4),
    whiteLabel: meetsMinimumTier(RepXTier.Rep5),
    unlimitedAgents: meetsMinimumTier(RepXTier.Rep5),
  };

  const checkFeature = (feature: keyof FeatureAccess): boolean => {
    return features[feature];
  };
  
  // Canvas-specific feature checks
  const canAccessAIAgents = () => meetsMinimumTier(RepXTier.Rep1); // Rep¹ and above
  const canUseResearchTools = () => meetsMinimumTier(RepXTier.Rep2); // Rep² and above
  const canExportReports = () => meetsMinimumTier(RepXTier.Rep3); // Rep³ and above
  
  const getResearchLimit = () => {
    switch (tier) {
      case RepXTier.Rep0: return 5; // 5 searches per day
      case RepXTier.Rep1: return 50; // 50 searches per day
      case RepXTier.Rep2: return 200; // 200 searches per day
      case RepXTier.Rep3: return 500; // 500 searches per day
      case RepXTier.Rep4: return 1000; // 1000 searches per day
      case RepXTier.Rep5: return null; // Unlimited
      default: return 5;
    }
  };
  
  // Create subscription object that matches our interface
  const formattedSubscription: UserSubscription | null = subscription ? {
    tier: subscription.tier,
    repxTier: tier,
    status: subscription.status || 'active',
    credits: 1000, // Default credits
    creditsUsed: 0 // Default usage
  } : null;

  const value: UnifiedAuthContextType = {
    subscription: formattedSubscription,
    tierLoading,
    tierError,
    features,
    checkFeature,
    agentTimeLimit,
    agentDisplayTime,
    isUnlimitedAgent,
    canAccessAIAgents,
    canUseResearchTools,
    canExportReports,
    getResearchLimit,
    meetsMinimumTier,
  };
  
  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};

export const useUnifiedAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider');
  }
  return context;
};

// Re-export RepXTier for convenience
export { RepXTier };