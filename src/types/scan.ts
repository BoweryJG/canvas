// Consolidated scan result types

export interface BaseScanResult {
  doctor: string;
  product: string;
  score: number;
  doctorProfile: string | Record<string, unknown>;
  productIntel: string | Record<string, unknown>;
  salesBrief: string;
  insights: string[] | Record<string, unknown>;
}

export interface ScanResult extends BaseScanResult {
  researchQuality?: 'verified' | 'partial' | 'inferred' | 'unknown';
  researchSources?: number;
  factBased?: boolean;
  specialty?: string;
  location?: string;
  email?: string;
  salesRep?: string;
  scanDuration?: number;
}

export interface EnhancedScanResult extends BaseScanResult {
  researchQuality: 'verified' | 'partial' | 'inferred' | 'unknown';
  researchSources: number;
  factBased: boolean;
  specialty?: string;
  location?: string;
  email?: string;
}

export interface ScanRecord {
  id: string;
  user_id: string | null;
  doctor_name: string;
  product_name: string;
  score: number;
  doctor_profile: Record<string, unknown>;
  product_intel: Record<string, unknown>;
  sales_brief: string;
  insights: Record<string, unknown>;
  created_at: string;
  specialty?: string | null;
  location?: string | null;
}

// Type guard to check if a result is enhanced
export function isEnhancedScanResult(result: ScanResult | EnhancedScanResult): result is EnhancedScanResult {
  return (
    result.researchQuality !== undefined &&
    result.researchSources !== undefined &&
    result.factBased !== undefined
  );
}

// Convert ScanResult to EnhancedScanResult with defaults
export function toEnhancedScanResult(result: ScanResult): EnhancedScanResult {
  return {
    ...result,
    researchQuality: result.researchQuality ?? 'unknown',
    researchSources: result.researchSources ?? 0,
    factBased: result.factBased ?? false,
  };
}