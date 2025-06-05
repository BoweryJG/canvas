// Common types used across verification functions

export interface DoctorInfo {
  name: string;
  firstName?: string;
  lastName?: string;
  npi?: string;
  specialty?: string;
  credentials?: string;
}

export interface PracticeInfo {
  name: string | null;
  website: string | null;
  domain?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  verified: boolean;
}

export interface VerificationSignals {
  isPracticeWebsite: boolean;
  practiceNameMatch: boolean;
  hasCustomDomain: boolean;
  locationMatch: boolean;
  isSocialMedia: boolean;
  isDirectory: boolean;
  hasSSL: boolean;
  hasContactInfo: boolean;
}

export interface VerificationResult {
  url: string;
  domain: string;
  title: string;
  description: string;
  score: number;
  signals: VerificationSignals;
  confidence: 'high' | 'medium' | 'low';
  verificationDetails: string[];
}

export interface SearchStrategy {
  query: string;
  weight: number;
  description: string;
}

export interface SocialMediaProfile {
  platform: string;
  url: string;
  verified: boolean;
}

export interface VerificationSource {
  type: 'npi' | 'web' | 'social' | 'practice';
  confidence: number;
  data: any;
  timestamp: string;
}

export interface UserConfirmation {
  question: string;
  options: string[];
}

export interface VerificationFlags {
  hasOfficialWebsite: boolean;
  npiVerified: boolean;
  locationConfirmed: boolean;
  multipleSourcesAgree: boolean;
  recentlyUpdated: boolean;
}

export interface ComprehensiveVerificationResult {
  verificationId: string;
  verificationStatus: 'verified' | 'likely' | 'unverified' | 'suspicious';
  overallConfidence: number;
  doctor: DoctorInfo;
  practice: PracticeInfo & {
    socialMedia?: SocialMediaProfile[];
  };
  verificationSources: VerificationSource[];
  verificationFlags: VerificationFlags;
  recommendations: string[];
  userConfirmationNeeded: UserConfirmation | null;
}

export interface LearningPattern {
  pattern: string;
  type: 'practice_name' | 'domain_pattern' | 'search_term';
  confidence: number;
  successCount: number;
  failureCount: number;
  examples: string[];
}

export interface VerificationFeedback {
  verificationId: string;
  feedbackType: 'correct' | 'incorrect' | 'partial';
  corrections?: {
    actualPracticeName?: string;
    actualWebsite?: string;
    actualLocation?: string;
    additionalNotes?: string;
  };
  userConfirmedData?: {
    practiceName: string;
    website: string;
    isOfficialWebsite: boolean;
  };
}

// Directory domains that should be deprioritized
export const KNOWN_DIRECTORY_DOMAINS = [
  'healthgrades.com',
  'vitals.com',
  'zocdoc.com',
  'webmd.com',
  'ratemds.com',
  'wellness.com',
  'yelp.com',
  'yellowpages.com',
  'findadoctor.com',
  'doctor.com',
  'npiprofile.com',
  'npino.com',
  'docinfo.org',
  'doctors.com',
  'md.com',
  'doximity.com'
];

// Social media platforms for secondary verification
export const SOCIAL_MEDIA_PLATFORMS = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'youtube.com',
  'tiktok.com'
];

// Practice-related keywords
export const PRACTICE_KEYWORDS = [
  'dental',
  'dentistry',
  'orthodontic',
  'pediatric',
  'cosmetic',
  'implant',
  'medical',
  'clinic',
  'practice',
  'office',
  'center',
  'health',
  'care',
  'family',
  'associates',
  'group'
];

// Scoring weights for verification signals
export const VERIFICATION_WEIGHTS = {
  practiceWebsite: 40,
  practiceNameMatch: 20,
  customDomain: 15,
  locationMatch: 10,
  socialMedia: 5,
  directoryListing: 5,
  sslCertificate: 3,
  contactInfo: 2
};