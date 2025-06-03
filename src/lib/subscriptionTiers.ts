/**
 * Subscription Tiers & Feature Timing
 * Defines what users get at each level and delivery times
 */

export interface SubscriptionTier {
  id: string;
  name: string;
  displayName: string;
  price: number;
  features: FeatureAccess[];
  apiLimits: ApiLimits;
  deliveryTimes: DeliveryTimes;
  uiTheme: TierTheme;
}

export interface FeatureAccess {
  id: string;
  name: string;
  enabled: boolean;
  depth: 'basic' | 'standard' | 'deep' | 'unlimited';
  deliveryTime: number; // seconds
}

export interface ApiLimits {
  scansPerDay: number;
  apiCallsPerScan: number;
  concurrentScans: number;
  dataRetention: number; // days
}

export interface DeliveryTimes {
  initialScan: number;
  basicProfile: number;
  enhancedAnalysis: number;
  deepIntelligence: number;
  outreachGeneration: number;
}

export interface TierTheme {
  primaryColor: string;
  accentColor: string;
  icon: string;
  animationSpeed: number;
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Explorer',
    displayName: 'Explorer Edition',
    price: 0,
    features: [
      { id: 'basic_scan', name: 'Basic Scan', enabled: true, depth: 'basic', deliveryTime: 5 },
      { id: 'simple_profile', name: 'Simple Profile', enabled: true, depth: 'basic', deliveryTime: 10 },
      { id: 'generic_outreach', name: 'Generic Templates', enabled: true, depth: 'basic', deliveryTime: 15 }
    ],
    apiLimits: {
      scansPerDay: 3,
      apiCallsPerScan: 5,
      concurrentScans: 1,
      dataRetention: 7
    },
    deliveryTimes: {
      initialScan: 3,
      basicProfile: 10,
      enhancedAnalysis: 999999, // Not available
      deepIntelligence: 999999,
      outreachGeneration: 15
    },
    uiTheme: {
      primaryColor: '#666666',
      accentColor: '#888888',
      icon: '🔍',
      animationSpeed: 1
    }
  },
  
  pro: {
    id: 'pro',
    name: 'Professional',
    displayName: 'Pro Hunter',
    price: 97,
    features: [
      { id: 'instant_scan', name: 'Instant Scan', enabled: true, depth: 'standard', deliveryTime: 2 },
      { id: 'detailed_profile', name: 'Detailed Profile', enabled: true, depth: 'standard', deliveryTime: 5 },
      { id: 'practice_intel', name: 'Practice Intelligence', enabled: true, depth: 'standard', deliveryTime: 8 },
      { id: 'pro_outreach', name: 'Pro Outreach', enabled: true, depth: 'standard', deliveryTime: 10 },
      { id: 'basic_psychology', name: 'Basic Psychology', enabled: true, depth: 'basic', deliveryTime: 12 }
    ],
    apiLimits: {
      scansPerDay: 50,
      apiCallsPerScan: 20,
      concurrentScans: 3,
      dataRetention: 30
    },
    deliveryTimes: {
      initialScan: 2,
      basicProfile: 5,
      enhancedAnalysis: 60,
      deepIntelligence: 300,
      outreachGeneration: 10
    },
    uiTheme: {
      primaryColor: '#00ffc6',
      accentColor: '#7B42F6',
      icon: '⚡',
      animationSpeed: 1.5
    }
  },
  
  genius: {
    id: 'genius',
    name: 'Genius',
    displayName: 'Sales Genius',
    price: 297,
    features: [
      { id: 'instant_everything', name: 'Instant Everything', enabled: true, depth: 'deep', deliveryTime: 1 },
      { id: 'psychological_profile', name: 'Deep Psychology', enabled: true, depth: 'deep', deliveryTime: 3 },
      { id: 'predictive_timing', name: 'Predictive Timing', enabled: true, depth: 'deep', deliveryTime: 5 },
      { id: 'competitive_intel', name: 'Competitive Intel', enabled: true, depth: 'deep', deliveryTime: 7 },
      { id: 'genius_campaigns', name: 'Genius Campaigns', enabled: true, depth: 'deep', deliveryTime: 10 },
      { id: 'ai_coaching', name: 'AI Sales Coach', enabled: true, depth: 'deep', deliveryTime: 0 }
    ],
    apiLimits: {
      scansPerDay: 500,
      apiCallsPerScan: 100,
      concurrentScans: 10,
      dataRetention: 90
    },
    deliveryTimes: {
      initialScan: 1,
      basicProfile: 2,
      enhancedAnalysis: 20,
      deepIntelligence: 60,
      outreachGeneration: 5
    },
    uiTheme: {
      primaryColor: '#FFD700',
      accentColor: '#FF6B6B',
      icon: '🧠',
      animationSpeed: 2
    }
  },
  
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Market Dominator',
    price: 997,
    features: [
      { id: 'everything', name: 'Everything Instant', enabled: true, depth: 'unlimited', deliveryTime: 0 },
      { id: 'team_access', name: 'Team Access', enabled: true, depth: 'unlimited', deliveryTime: 0 },
      { id: 'api_access', name: 'API Access', enabled: true, depth: 'unlimited', deliveryTime: 0 },
      { id: 'white_label', name: 'White Label', enabled: true, depth: 'unlimited', deliveryTime: 0 },
      { id: 'market_domination', name: 'Market Domination Suite', enabled: true, depth: 'unlimited', deliveryTime: 0 }
    ],
    apiLimits: {
      scansPerDay: 999999,
      apiCallsPerScan: 999999,
      concurrentScans: 50,
      dataRetention: 365
    },
    deliveryTimes: {
      initialScan: 0.5,
      basicProfile: 1,
      enhancedAnalysis: 5,
      deepIntelligence: 10,
      outreachGeneration: 2
    },
    uiTheme: {
      primaryColor: '#FF0080',
      accentColor: '#00D9FF',
      icon: '👑',
      animationSpeed: 3
    }
  }
};

/**
 * Time estimation messages for different wait times
 */
export const TIME_MESSAGES = {
  instant: "Ready now",
  quick: "Ready in seconds",
  short: "Ready in 1 minute",
  medium: "Ready in 2-3 minutes", 
  long: "Ready in 5 minutes",
  extended: "Ready in 10 minutes",
  premium: "Upgrade for instant access"
};

/**
 * Get delivery message based on time
 */
export function getDeliveryMessage(seconds: number): string {
  if (seconds === 0) return TIME_MESSAGES.instant;
  if (seconds <= 3) return TIME_MESSAGES.quick;
  if (seconds <= 60) return TIME_MESSAGES.short;
  if (seconds <= 180) return TIME_MESSAGES.medium;
  if (seconds <= 300) return TIME_MESSAGES.long;
  if (seconds <= 600) return TIME_MESSAGES.extended;
  return TIME_MESSAGES.premium;
}

/**
 * Calculate actual delivery time based on tier and system load
 */
export function calculateDeliveryTime(
  baseTiem: number,
  tier: SubscriptionTier,
  systemLoad: number = 1
): number {
  // Higher tiers get priority in queue
  const priorityMultiplier = {
    free: 2,
    pro: 1,
    genius: 0.5,
    enterprise: 0.1
  }[tier.id] || 1;
  
  return Math.ceil(baseTiem * priorityMultiplier * systemLoad);
}

/**
 * Feature availability matrix
 */
export const FEATURE_MATRIX = {
  scanDepth: {
    free: ['basic_info', 'public_data'],
    pro: ['detailed_profile', 'review_analysis', 'basic_intel'],
    genius: ['deep_psychology', 'predictive_analytics', 'competitive_intel'],
    enterprise: ['everything', 'market_analysis', 'team_insights']
  },
  
  outreachQuality: {
    free: ['generic_templates'],
    pro: ['personalized_emails', 'follow_up_sequences'],
    genius: ['hyper_personalized', 'multi_channel', 'psychological_triggers'],
    enterprise: ['ai_generated_campaigns', 'predictive_timing', 'guaranteed_results']
  },
  
  dataAccess: {
    free: ['last_scan_only'],
    pro: ['30_day_history', 'export_csv'],
    genius: ['90_day_history', 'api_webhooks', 'integrations'],
    enterprise: ['unlimited_history', 'white_label_api', 'custom_integrations']
  }
};

/**
 * Upsell messages based on current tier and desired feature
 */
export function getUpsellMessage(currentTier: string, desiredFeature: string): string {
  const messages: Record<string, Record<string, string>> = {
    free: {
      deep_scan: "Unlock deep intelligence scanning with Pro - 10x more data points!",
      fast_delivery: "Get results 5x faster with Pro membership",
      psychology: "Discover psychological selling triggers with Genius tier"
    },
    pro: {
      instant_results: "Get instant results with Genius - no more waiting!",
      ai_campaigns: "Unlock AI-powered campaigns that convert 3x better",
      team_access: "Scale your team with Enterprise access"
    }
  };
  
  return messages[currentTier]?.[desiredFeature] || "Upgrade to unlock this premium feature";
}

/**
 * Calculate ROI based on tier
 */
export function calculateROI(tier: string): {
  timesSaved: number;
  conversionBoost: number;
  revenueMultiplier: number;
} {
  const roi: Record<string, { timesSaved: number; conversionBoost: number; revenueMultiplier: number }> = {
    free: { timesSaved: 2, conversionBoost: 1.2, revenueMultiplier: 1 },
    pro: { timesSaved: 10, conversionBoost: 2.5, revenueMultiplier: 3 },
    genius: { timesSaved: 50, conversionBoost: 4, revenueMultiplier: 10 },
    enterprise: { timesSaved: 200, conversionBoost: 8, revenueMultiplier: 50 }
  };
  
  return roi[tier] || roi.free;
}