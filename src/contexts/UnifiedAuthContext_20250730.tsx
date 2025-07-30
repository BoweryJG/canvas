/**
 * UnifiedAuthContext for Canvas
 * Created: July 30, 2025
 * 
 * Integrates @repspheres/unified-auth package into Canvas
 * Provides RepX tier-based feature access for sales intelligence
 */

import React, { createContext, useContext } from 'react';
import { 
  useRepXTier, 
  useFeatureAccess, 
  useAgentTimeLimit,
  RepXTier,
  FeatureAccess,
  UserSubscription 
} from '../unified-auth';
import { useAuth } from '../auth/useAuth';

interface UnifiedAuthContextType {
  // RepX tier information
  tier: RepXTier;
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
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined);

export const UnifiedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  
  // Use unified auth hooks
  const { tier, subscription, loading: tierLoading, error: tierError } = useRepXTier(userId);
  const { features, checkFeature } = useFeatureAccess(userId);
  const { timeLimit: agentTimeLimit, displayTime: agentDisplayTime, isUnlimited: isUnlimitedAgent } = useAgentTimeLimit(userId);
  
  // Canvas-specific feature checks
  const canAccessAIAgents = () => tier >= RepXTier.Rep1; // Rep¹ and above
  const canUseResearchTools = () => tier >= RepXTier.Rep2; // Rep² and above
  const canExportReports = () => tier >= RepXTier.Rep3; // Rep³ and above
  
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
  
  const value: UnifiedAuthContextType = {
    tier,
    subscription,
    tierLoading,
    tierError,
    features,
    checkFeature: (feature: keyof FeatureAccess) => checkFeature(feature).allowed,
    agentTimeLimit,
    agentDisplayTime,
    isUnlimitedAgent,
    canAccessAIAgents,
    canUseResearchTools,
    canExportReports,
    getResearchLimit,
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