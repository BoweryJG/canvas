/**
 * Enhanced Confidence Scoring System
 * Properly weights NPI verification, source count, and data quality
 */

// Type definitions for confidence scoring
interface WebsiteIntel {
  url?: string;
  crawled?: boolean;
  content?: string;
  services?: string[];
  technology?: string[];
  philosophy?: string;
}

interface ReviewData {
  totalReviews?: number;
  combinedRating?: number;
  doctorReviews?: {
    highlights?: string[];
  };
}

interface Synthesis {
  buyingSignals?: string[];
  practiceProfile?: {
    size?: string;
  };
  marketPosition?: string;
  approachStrategy?: {
    keyMessage?: string;
  };
}

interface Source {
  url: string;
  title: string;
  type: string;
  content: string;
  confidence: number;
  [key: string]: unknown; // Allow additional properties
}

interface Competitor {
  name: string;
  url?: string;
  type?: string;
  description?: string;
  [key: string]: unknown; // Allow additional properties
}

export interface ConfidenceFactors {
  npiVerified: boolean;
  sourceCount: number;
  websiteFound: boolean;
  websiteCrawled: boolean;
  reviewCount: number;
  competitorData: boolean;
  buyingSignalsFound: number;
  practiceDataQuality: 'high' | 'medium' | 'low';
}

export interface ConfidenceResult {
  score: number;
  factors: string[];
  breakdown: {
    npiPoints: number;
    sourcePoints: number;
    websitePoints: number;
    reviewPoints: number;
    analysisPoints: number;
  };
}

export function calculateEnhancedConfidence(factors: ConfidenceFactors): ConfidenceResult {
  const breakdown = {
    npiPoints: 0,
    sourcePoints: 0,
    websitePoints: 0,
    reviewPoints: 0,
    analysisPoints: 0
  };
  
  const factorsList: string[] = [];
  
  // 1. NPI Verification (Base confidence) - 35 points max
  if (factors.npiVerified) {
    breakdown.npiPoints = 35;
    factorsList.push('✓ NPI Verified Healthcare Provider (+35)');
  }
  
  // 2. Source Quantity (CRITICAL FIX) - 30 points max
  // 2 points per source up to 15 sources (30 points)
  const sourcePoints = Math.min(factors.sourceCount * 2, 30);
  breakdown.sourcePoints = sourcePoints;
  
  if (factors.sourceCount >= 20) {
    factorsList.push(`✅ Comprehensive Research: ${factors.sourceCount} sources analyzed (+${sourcePoints})`);
  } else if (factors.sourceCount >= 10) {
    factorsList.push(`✓ Multiple Sources: ${factors.sourceCount} sources verified (+${sourcePoints})`);
  } else {
    factorsList.push(`⚡ Quick Scan: ${factors.sourceCount} sources found (+${sourcePoints})`);
  }
  
  // 3. Website Intelligence - 15 points max
  if (factors.websiteFound) {
    breakdown.websitePoints += 7;
    factorsList.push('✓ Practice Website Located (+7)');
    
    if (factors.websiteCrawled) {
      breakdown.websitePoints += 8;
      factorsList.push('✓ Deep Website Analysis Completed (+8)');
    }
  }
  
  // 4. Review Data - 10 points max
  if (factors.reviewCount > 0) {
    if (factors.reviewCount >= 50) {
      breakdown.reviewPoints = 10;
      factorsList.push(`✅ Extensive Reviews: ${factors.reviewCount} patient reviews (+10)`);
    } else if (factors.reviewCount >= 20) {
      breakdown.reviewPoints = 7;
      factorsList.push(`✓ Good Review Coverage: ${factors.reviewCount} reviews (+7)`);
    } else {
      breakdown.reviewPoints = 4;
      factorsList.push(`✓ Review Data: ${factors.reviewCount} reviews found (+4)`);
    }
  }
  
  // 5. Analysis Quality - 10 points max
  if (factors.competitorData) {
    breakdown.analysisPoints += 3;
    factorsList.push('✓ Competitive Analysis (+3)');
  }
  
  if (factors.buyingSignalsFound > 0) {
    const signalPoints = Math.min(factors.buyingSignalsFound * 2, 4);
    breakdown.analysisPoints += signalPoints;
    factorsList.push(`✓ ${factors.buyingSignalsFound} Buying Signals Identified (+${signalPoints})`);
  }
  
  if (factors.practiceDataQuality === 'high') {
    breakdown.analysisPoints += 3;
    factorsList.push('✓ High-Quality Practice Intelligence (+3)');
  } else if (factors.practiceDataQuality === 'medium') {
    breakdown.analysisPoints += 1;
    factorsList.push('✓ Moderate Practice Data (+1)');
  }
  
  // Calculate total
  const totalScore = Object.values(breakdown).reduce((sum, points) => sum + points, 0);
  
  // Cap at 95 (never 100% certain)
  const finalScore = Math.min(totalScore, 95);
  
  // Add summary factor
  if (finalScore >= 85) {
    factorsList.unshift('🏆 EXCEPTIONAL CONFIDENCE - Comprehensive Intelligence Gathered');
  } else if (finalScore >= 70) {
    factorsList.unshift('✅ HIGH CONFIDENCE - Strong Data Foundation');
  } else if (finalScore >= 55) {
    factorsList.unshift('✓ MODERATE CONFIDENCE - Good Initial Intelligence');
  } else {
    factorsList.unshift('⚡ BASELINE CONFIDENCE - Quick Verification Complete');
  }
  
  return {
    score: finalScore,
    factors: factorsList,
    breakdown
  };
}

/**
 * Helper to extract confidence factors from research data
 */
export function extractConfidenceFactors(
  npiVerified: boolean,
  websiteIntel: WebsiteIntel | null,
  reviewData: ReviewData | null,
  sources: Source[],
  synthesis: Synthesis | null,
  competitors: Competitor[]
): ConfidenceFactors {
  return {
    npiVerified,
    sourceCount: sources.length,
    websiteFound: !!websiteIntel?.url,
    websiteCrawled: !!websiteIntel?.crawled && !!websiteIntel?.content,
    reviewCount: reviewData?.totalReviews || 0,
    competitorData: competitors?.length > 0,
    buyingSignalsFound: synthesis?.buyingSignals?.length || 0,
    practiceDataQuality: determinePracticeDataQuality(websiteIntel, reviewData, synthesis)
  };
}

function determinePracticeDataQuality(
  websiteIntel: WebsiteIntel | null,
  reviewData: ReviewData | null,
  synthesis: Synthesis | null
): 'high' | 'medium' | 'low' {
  let qualityScore = 0;
  
  // Website quality
  if (websiteIntel?.services && websiteIntel.services.length > 3) qualityScore++;
  if (websiteIntel?.technology && websiteIntel.technology.length > 0) qualityScore++;
  if (websiteIntel?.philosophy) qualityScore++;
  
  // Review quality
  if (reviewData?.combinedRating) qualityScore++;
  if (reviewData?.doctorReviews?.highlights && reviewData.doctorReviews.highlights.length > 0) qualityScore++;
  
  // Synthesis quality
  if (synthesis?.practiceProfile?.size && synthesis.practiceProfile.size !== 'Unknown') qualityScore++;
  if (synthesis?.marketPosition) qualityScore++;
  if (synthesis?.approachStrategy?.keyMessage) qualityScore++;
  
  if (qualityScore >= 6) return 'high';
  if (qualityScore >= 3) return 'medium';
  return 'low';
}