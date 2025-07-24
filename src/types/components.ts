/**
 * Shared type definitions for Canvas components
 */

import type { ReactNode } from 'react';

// Doctor-related types
export interface Doctor {
  name: string;
  specialty?: string;
  location?: string;
  address?: string;
  npi?: string;
}

// Enhanced scan result type
export interface EnhancedScanResult {
  doctor: string | Doctor;
  product: string;
  score: number;
  doctorProfile?: string;
  productIntel?: string;
  salesBrief?: string;
  insights?: string[];
  specialty?: string;
  location?: string;
  researchQuality?: 'basic' | 'verified' | 'premium';
  researchSources?: number;
  factBased?: boolean;
}

// Research data type
export interface ResearchData {
  doctorName?: string;
  practiceInfo?: PracticeInfo;
  credentials?: Credentials;
  reviews?: Reviews;
  businessIntel?: BusinessIntel;
  sources?: string[];
  confidenceScore?: number;
  completedAt?: string;
  marketInsights?: Record<string, unknown>;
  enhancedInsights?: {
    specialty?: string;
  };
  linkedinUrl?: string;
  [key: string]: unknown;
}

export interface PracticeInfo {
  name?: string;
  address?: string;
  phone?: string;
  website?: string;
  specialties?: string[];
  services?: string[];
  technology?: string[];
  staff?: number;
  established?: string;
}

export interface Credentials {
  medicalSchool?: string;
  residency?: string;
  boardCertifications?: string[];
  yearsExperience?: number;
  hospitalAffiliations?: string[];
}

export interface Reviews {
  averageRating?: number;
  totalReviews?: number;
  commonPraise?: string[];
  commonConcerns?: string[];
  recentFeedback?: string[];
}

export interface BusinessIntel {
  practiceType?: string;
  patientVolume?: string;
  marketPosition?: string;
  recentNews?: string[];
  growthIndicators?: string[];
  technologyStack?: string[];
  specialty?: string;
}

// Instant Intelligence type
export interface InstantIntelligence {
  outreachTemplates: {
    email: {
      subject: string;
      body: string;
    };
    sms: string;
    linkedin: string;
  };
  confidenceScore: number;
  generatedIn: number;
  tacticalBrief?: string;
  keyInsights?: string[];
  painPoints?: string[];
  approachStrategy?: string;
}

// Deep scan results type
export interface DeepScanResults {
  unified?: UnifiedResults;
  basic?: BasicScanResult;
  enhanced?: EnhancedResult;
  [key: string]: unknown;
}

export interface UnifiedResults {
  discovery?: {
    practiceWebsite?: string | null;
    confidence?: number;
    discoveryMethod?: string;
    address?: Address;
    organizationName?: string;
  };
  intelligence?: {
    practiceInfo?: {
      name?: string;
      services?: unknown[];
      technologies?: unknown[];
    };
    insights?: unknown[];
    opportunities?: unknown[];
    painPoints?: unknown[];
    competitiveAdvantage?: unknown[];
  };
  instant?: {
    summary?: string;
    keyPoints?: string[];
    confidence?: number;
  };
  timingMs?: {
    discovery?: number;
    intelligence?: number;
    total?: number;
  };
  scrapedWebsiteData?: ScrapedWebsiteData;
}

export interface ScrapedWebsiteData {
  url?: string;
  title?: string;
  practiceInfo?: {
    practiceType?: string;
    services?: string[];
    technologies?: string[];
    teamSize?: number;
  };
  recentNews?: string[];
  competitiveAdvantages?: string[];
}

export interface BasicScanResult {
  confidence?: number;
  doctor?: Doctor | string;
  practice?: {
    name?: string;
    verified?: boolean;
    website?: string;
    address?: Address;
  };
  summary?: string;
  keyPoints?: string[];
}

export interface EnhancedResult {
  confidence?: number;
  doctor?: Doctor | string;
  insights?: string[];
  opportunities?: string[];
  summary?: string;
  keyPoints?: string[];
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  full?: string;
}

// Sales rep info type
export interface SalesRepInfo {
  name: string;
  company: string;
  product: string;
}

// Scan data type
export interface ScanData {
  doctorName?: string;
  doctor?: string;
  product?: string;
  location?: string;
  phone?: string;
  website?: string;
  specialties?: string[];
  services?: string[];
  technology?: string[];
  staff?: number;
  established?: string;
  medicalSchool?: string;
  residency?: string;
  certifications?: string[];
  experience?: number;
  affiliations?: string[];
  reviews?: Reviews;
  businessIntel?: BusinessIntel;
  sources?: string[];
  confidenceScore?: number;
  completedAt?: string;
  practiceType?: string;
  patientVolume?: string;
  marketPosition?: string;
  growthIndicators?: string[];
  practiceInfo?: PracticeInfo;
  [key: string]: unknown;
}

// Form event types
export type FormEvent<T = HTMLFormElement> = React.FormEvent<T>;
export type ChangeEvent<T = HTMLInputElement> = React.ChangeEvent<T>;

// Type guards
export function isDoctorObject(doctor: string | Doctor | unknown): doctor is Doctor {
  return typeof doctor === 'object' && doctor !== null && 'name' in doctor;
}

export function getDoctorName(doctor: string | Doctor | unknown): string {
  if (typeof doctor === 'string') return doctor;
  if (isDoctorObject(doctor)) return doctor.name;
  return 'Unknown Doctor';
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function safeAccess<T>(obj: unknown, path: string, defaultValue: T): T {
  if (!isRecord(obj)) return defaultValue;
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (!isRecord(current) || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current as T;
}

// Helper to safely check if a value is a ReactNode
export function isReactNode(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    (typeof value === 'object' && value !== null && 'type' in value) ||
    Array.isArray(value)
  );
}

// Helper to convert unknown to ReactNode safely
export function toReactNode(value: unknown): ReactNode {
  if (isReactNode(value)) return value as ReactNode;
  if (isRecord(value)) return JSON.stringify(value);
  return String(value);
}