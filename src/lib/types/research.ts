/**
 * Extended Research Data Types
 * Augments the base ResearchData type with additional fields
 */

import type { ResearchData } from '../webResearch';

export interface ExtendedResearchData extends ResearchData {
  // Sales Intelligence
  buyingSignals?: string[];
  painPoints?: string[];
  salesBrief?: string;
  
  // Market Intelligence
  technologyStack?: {
    current?: string[];
    gaps?: string[];
    readiness?: string;
  };
  marketPosition?: {
    ranking?: string;
    reputation?: string;
    differentiators?: string[];
  };
  competition?: {
    currentVendors?: string[];
    recentPurchases?: string[];
  };
  
  // Decision Intelligence
  approachStrategy?: {
    bestTiming?: string;
    preferredChannel?: string;
    keyMessage?: string;
    avoidTopics?: string[];
  };
  decisionMakers?: {
    primary?: string;
    influencers?: string[];
  };
  budgetInfo?: {
    estimatedRevenue?: string;
    technologyBudget?: string;
    purchaseTimeframe?: string;
  };
  
  // Meta Information
  totalTime?: number;
  strategyUsed?: {
    focusAreas: string[];
    keyQuestions: string[];
    skipReasons: {
      website?: string | null;
      reviews?: string | null;
      competitors?: string | null;
    };
  };
}

export type AdaptiveResearchData = ExtendedResearchData;