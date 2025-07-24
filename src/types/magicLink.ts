/**
 * Magic Link Types and Configuration
 */

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface MagicLinkConfig {
  expiration: string;
  features: string[];
  maxShares: number;
  expirationHours: number;
}

export interface MagicLink {
  id: string;
  reportId: string;
  doctorName: string;
  createdBy: string;
  createdAt: Date;
  expiresAt: Date;
  tier: SubscriptionTier;
  password?: string;
  customMessage?: string;
  allowDownload: boolean;
  allowComments: boolean;
  domainRestrictions?: string[];
  ipWhitelist?: string[];
  requires2FA: boolean;
  views: number;
  downloads: number;
  lastViewedAt?: Date;
  revokedAt?: Date;
  analytics: MagicLinkAnalytics;
}

export interface MagicLinkAnalytics {
  views: ViewEvent[];
  downloads: DownloadEvent[];
  timeSpent: number[];
  sectionEngagement: Record<string, number>;
  devices: DeviceInfo[];
}

export interface ViewEvent {
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  location?: string;
  duration?: number;
}

export interface DownloadEvent {
  timestamp: Date;
  ip?: string;
  format: 'pdf' | 'csv' | 'json';
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  count: number;
}

export interface ShareModalOptions {
  reportData: Record<string, unknown>;
  doctorName: string;
  userTier: SubscriptionTier;
  onShare: (link: MagicLink) => void;
  onClose: () => void;
}

// Subscription tier configurations
export const MAGIC_LINK_CONFIGS: Record<SubscriptionTier, MagicLinkConfig> = {
  free: {
    expiration: '24 hours',
    expirationHours: 24,
    features: ['view_only', 'watermark'],
    maxShares: 3
  },
  starter: {
    expiration: '7 days',
    expirationHours: 168,
    features: ['view', 'download', 'analytics_basic', 'custom_message'],
    maxShares: 10
  },
  professional: {
    expiration: '30 days',
    expirationHours: 720,
    features: ['view', 'download', 'analytics_full', 'password', 'comments', 'white_label'],
    maxShares: -1 // unlimited
  },
  enterprise: {
    expiration: 'No expiration',
    expirationHours: -1, // permanent
    features: [
      'view', 'download', 'analytics_full', 'password', 'comments', 
      'white_label', 'domain_lock', 'ip_whitelist', '2fa', 'team_collab',
      'version_history', 'audit_trail', 'crm_integration'
    ],
    maxShares: -1
  }
};