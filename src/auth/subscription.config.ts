/**
 * RepSpheres Subscription Configuration
 * Defines tiers, limits, and pricing
 */

export interface SubscriptionTier {
  name: string;
  displayName: string;
  price: {
    monthly: number;
    annual: number;
  };
  credits: number;
  magicLinks: number;
  features: string[];
  limits: {
    canvasScansPerMonth?: number;
    marketInsightsAccess?: boolean;
    crmContactsMax?: number;
    aiResearchReports?: number;
    exportEnabled?: boolean;
    teamMembers?: number;
  };
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  explorer: {
    name: 'explorer',
    displayName: 'Explorer',
    price: {
      monthly: 0,
      annual: 0
    },
    credits: 5,
    magicLinks: 0,
    features: [
      '5 Canvas scans per month',
      'Basic Market Insights (10 procedures)',
      'CRM Lite (25 contacts max)',
      'Instant results only'
    ],
    limits: {
      canvasScansPerMonth: 5,
      marketInsightsAccess: false,
      crmContactsMax: 25,
      aiResearchReports: 0,
      exportEnabled: false,
      teamMembers: 1
    }
  },
  
  closer: {
    name: 'closer',
    displayName: 'Closer',
    price: {
      monthly: 97,
      annual: 970 // 2 months free
    },
    credits: 100,
    magicLinks: 10,
    features: [
      '100 AI credits per month',
      '10 Magic Link emails',
      'Full Market Insights (350+ procedures)',
      'CRM Pro (unlimited contacts)',
      'Export to PDF/Excel',
      'Email support',
      'Mobile app access'
    ],
    limits: {
      canvasScansPerMonth: 100,
      marketInsightsAccess: true,
      crmContactsMax: -1, // unlimited
      aiResearchReports: 20,
      exportEnabled: true,
      teamMembers: 1
    }
  },
  
  dominator: {
    name: 'dominator',
    displayName: 'Dominator',
    price: {
      monthly: 297,
      annual: 2970
    },
    credits: 500,
    magicLinks: 50,
    features: [
      '500 AI credits per month',
      '50 Magic Link emails',
      'Everything in Closer',
      'Linguistics AI personalization',
      'Automated follow-ups',
      'Competition tracking',
      'Advanced analytics',
      'Priority support (2hr)',
      'Custom integrations',
      'Team sharing (up to 3)'
    ],
    limits: {
      canvasScansPerMonth: 500,
      marketInsightsAccess: true,
      crmContactsMax: -1,
      aiResearchReports: 100,
      exportEnabled: true,
      teamMembers: 3
    }
  },
  
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    price: {
      monthly: 497,
      annual: 4970
    },
    credits: -1, // unlimited
    magicLinks: -1, // unlimited
    features: [
      'Unlimited AI credits',
      'Unlimited Magic Links',
      'Everything in Dominator',
      'White-label options',
      'API access',
      'Dedicated success manager',
      'Custom AI training',
      'Unlimited team members',
      'HIPAA compliance',
      'SLA guarantee'
    ],
    limits: {
      canvasScansPerMonth: -1,
      marketInsightsAccess: true,
      crmContactsMax: -1,
      aiResearchReports: -1,
      exportEnabled: true,
      teamMembers: -1
    }
  }
};

// Credit costs for different actions
export const CREDIT_COSTS = {
  canvasScan: 1,
  deepResearchReport: 5,
  aiOutreachCampaign: 3,
  linguisticsScript: 2,
  marketAnalysisExport: 1
};

// Pay-as-you-go pricing
export const PAY_AS_YOU_GO = {
  singleCanvasScan: 4.99,
  deepResearchReport: 29,
  aiOutreachCampaign: 19,
  tenCreditPack: 39,
  fiftyCreditPack: 149
};

// Helper functions
export const getSubscriptionTier = (tierName: string): SubscriptionTier => {
  return SUBSCRIPTION_TIERS[tierName] || SUBSCRIPTION_TIERS.explorer;
};

export const canAccessFeature = (
  subscription: any,
  feature: keyof SubscriptionTier['limits']
): boolean => {
  const tier = getSubscriptionTier(subscription?.tier || 'explorer');
  const limit = tier.limits[feature];
  
  if (limit === undefined || limit === false) return false;
  if (limit === true || limit === -1) return true;
  
  // For numeric limits, need to check usage
  return true; // Will be implemented with usage tracking
};