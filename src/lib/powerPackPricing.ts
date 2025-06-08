/**
 * Power Pack Pricing - Bulk Analysis Credits
 * Instant purchase packs for batch processing
 */

export interface PowerPack {
  id: string;
  name: string;
  scans: number;
  price: number;
  pricePerScan: number;
  savings: number;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
  processingSpeed: string;
  supportLevel: string;
  expiresInDays: number;
}

// Base price per scan at different tiers
const BASE_PRICE_PER_SCAN = 2.50; // Based on $49/mo for 50 scans = ~$1 per scan, but one-time is premium

export const POWER_PACKS: PowerPack[] = [
  {
    id: 'starter-10',
    name: 'Starter Pack',
    scans: 10,
    price: 19,
    pricePerScan: 1.90,
    savings: 24,
    features: [
      'Instant batch processing',
      'CSV upload support',
      'Basic analytics dashboard',
      'Email results delivery'
    ],
    processingSpeed: 'Standard (3-5 min)',
    supportLevel: 'Email support',
    expiresInDays: 30
  },
  {
    id: 'team-25',
    name: 'Team Pack',
    scans: 25,
    price: 39,
    pricePerScan: 1.56,
    savings: 38,
    features: [
      'Everything in Starter',
      'Priority processing',
      'Advanced filtering',
      'Slack notifications'
    ],
    processingSpeed: 'Priority (2-3 min)',
    supportLevel: 'Priority email support',
    expiresInDays: 60
  },
  {
    id: 'growth-50',
    name: 'Growth Pack',
    scans: 50,
    price: 69,
    pricePerScan: 1.38,
    savings: 45,
    popular: true,
    features: [
      'Everything in Team',
      'API access',
      'Custom fields mapping',
      'Salesforce integration ready'
    ],
    processingSpeed: 'Fast (1-2 min)',
    supportLevel: 'Chat support',
    expiresInDays: 90
  },
  {
    id: 'scale-100',
    name: 'Scale Pack',
    scans: 100,
    price: 119,
    pricePerScan: 1.19,
    savings: 52,
    features: [
      'Everything in Growth',
      'Dedicated queue',
      'Webhook notifications',
      'CRM auto-sync'
    ],
    processingSpeed: 'Express (<1 min)',
    supportLevel: 'Priority chat support',
    expiresInDays: 120
  },
  {
    id: 'pro-250',
    name: 'Pro Pack',
    scans: 250,
    price: 249,
    pricePerScan: 1.00,
    savings: 60,
    bestValue: true,
    features: [
      'Everything in Scale',
      'Instant processing',
      'AI enrichment included',
      'White-glove onboarding'
    ],
    processingSpeed: 'Instant (<30 sec)',
    supportLevel: 'Phone + chat support',
    expiresInDays: 180
  },
  {
    id: 'enterprise-500',
    name: 'Enterprise Pack',
    scans: 500,
    price: 449,
    pricePerScan: 0.90,
    savings: 64,
    features: [
      'Everything in Pro',
      'Custom AI models',
      'Dedicated success manager',
      'SLA guarantee'
    ],
    processingSpeed: 'Lightning (<15 sec)',
    supportLevel: 'Dedicated CSM',
    expiresInDays: 365
  },
  {
    id: 'mega-1000',
    name: 'Mega Pack',
    scans: 1000,
    price: 799,
    pricePerScan: 0.80,
    savings: 68,
    features: [
      'Everything in Enterprise',
      'Custom integrations',
      'Priority API limits',
      'Custom reporting'
    ],
    processingSpeed: 'Blazing (<10 sec)',
    supportLevel: '24/7 dedicated support',
    expiresInDays: 365
  },
  {
    id: 'dominator-2500',
    name: 'Market Dominator',
    scans: 2500,
    price: 1799,
    pricePerScan: 0.72,
    savings: 71,
    features: [
      'Everything in Mega',
      'White label options',
      'Custom domain',
      'Revenue share program',
      'Exclusive features beta access'
    ],
    processingSpeed: 'Quantum (<5 sec)',
    supportLevel: 'Executive hotline',
    expiresInDays: 730 // 2 years
  }
];

/**
 * Calculate volume discount percentage
 */
export function getVolumeDiscount(scans: number): number {
  if (scans >= 2500) return 71;
  if (scans >= 1000) return 68;
  if (scans >= 500) return 64;
  if (scans >= 250) return 60;
  if (scans >= 100) return 52;
  if (scans >= 50) return 45;
  if (scans >= 25) return 38;
  if (scans >= 10) return 24;
  return 0;
}

/**
 * Get urgency message for power pack
 */
export function getUrgencyMessage(pack: PowerPack): string {
  if (pack.scans >= 1000) {
    return "🔥 LIMITED TIME: Extra 10% off with code SCALE10";
  }
  if (pack.scans >= 250) {
    return "⚡ Most popular choice for growing teams";
  }
  if (pack.scans >= 50) {
    return "💎 Best value for regular users";
  }
  return "✨ Perfect for getting started";
}

/**
 * Calculate ROI message
 */
export function getROIMessage(pack: PowerPack): string {
  const timeSaved = pack.scans * 15; // 15 minutes saved per automated scan
  const hoursSaved = Math.round(timeSaved / 60);
  const dollarValue = hoursSaved * 150; // $150/hour for sales rep time
  
  return `Save ${hoursSaved} hours of research time (valued at $${dollarValue.toLocaleString()})`;
}

/**
 * Get comparison to subscription
 */
export function getSubscriptionComparison(pack: PowerPack): string {
  // Compare to Professional tier at $149/mo for 500 scans
  const subscriptionCostPerScan = 149 / 500;
  const savings = Math.round((1 - (pack.pricePerScan / BASE_PRICE_PER_SCAN)) * 100);
  
  if (pack.scans >= 500) {
    return `${savings}% cheaper than monthly subscription + no commitment`;
  }
  if (pack.scans >= 100) {
    return `Pay only for what you need - ${savings}% off regular pricing`;
  }
  return `Try our platform risk-free - ${savings}% discount`;
}

/**
 * Processing speed by pack size
 */
export const PROCESSING_SPEEDS = {
  10: { concurrent: 2, delayMs: 3000, message: "Standard processing" },
  25: { concurrent: 3, delayMs: 2000, message: "Priority queue access" },
  50: { concurrent: 5, delayMs: 1500, message: "Fast-track processing" },
  100: { concurrent: 8, delayMs: 1000, message: "Express lane" },
  250: { concurrent: 12, delayMs: 500, message: "Instant processing" },
  500: { concurrent: 20, delayMs: 250, message: "Lightning fast" },
  1000: { concurrent: 30, delayMs: 100, message: "Blazing speed" },
  2500: { concurrent: 50, delayMs: 50, message: "Quantum processing" }
};

/**
 * Feature matrix for power packs
 */
export const POWER_PACK_FEATURES = {
  csvUpload: { minScans: 10, name: "CSV/Excel Upload" },
  apiAccess: { minScans: 50, name: "API Access" },
  crmIntegration: { minScans: 100, name: "CRM Integration" },
  customFields: { minScans: 50, name: "Custom Fields" },
  webhooks: { minScans: 100, name: "Webhook Notifications" },
  prioritySupport: { minScans: 25, name: "Priority Support" },
  whiteLabel: { minScans: 2500, name: "White Label Options" },
  customAI: { minScans: 500, name: "Custom AI Models" },
  slaGuarantee: { minScans: 500, name: "SLA Guarantee" },
  dedicatedCSM: { minScans: 500, name: "Dedicated Success Manager" }
};

/**
 * Get features available for a pack
 */
export function getPackFeatures(scans: number): string[] {
  return Object.entries(POWER_PACK_FEATURES)
    .filter(([_, feature]) => scans >= feature.minScans)
    .map(([_, feature]) => feature.name);
}

/**
 * Stripe price IDs for production
 */
export const STRIPE_PRICE_IDS = {
  'starter-10': 'price_starter_10_scans',
  'team-25': 'price_team_25_scans',
  'growth-50': 'price_growth_50_scans',
  'scale-100': 'price_scale_100_scans',
  'pro-250': 'price_pro_250_scans',
  'enterprise-500': 'price_enterprise_500_scans',
  'mega-1000': 'price_mega_1000_scans',
  'dominator-2500': 'price_dominator_2500_scans'
};