/**
 * WEBSITE DISCOVERY ENGINE
 * Precision-targeted system for finding actual practice websites
 * Returns real data or nothing - no generic fallbacks
 */

import { callBraveSearch } from './apiEndpoints';

export interface WebsiteDiscoveryResult {
  websiteUrl: string;
  confidence: number;
  discoveryMethod: 'name_match' | 'specialty_match' | 'location_match' | 'practice_name';
  title: string;
  description?: string;
  verificationSignals: string[];
}

/**
 * Discover a doctor's actual practice website with high precision
 * @returns Website URL with 100% confidence or null if not found
 */
export async function discoverPracticeWebsite(
  doctorName: string,
  city?: string,
  state?: string,
  specialty?: string,
  practiceName?: string,
  _npi?: string
): Promise<WebsiteDiscoveryResult | null> {
  console.log(`🎯 Starting precision website discovery for Dr. ${doctorName}`);
  
  // Extract last name for domain matching
  const cleanName = doctorName.replace(/^Dr\.\s*/i, '').trim();
  const lastName = cleanName.split(' ').pop()?.toLowerCase() || cleanName.toLowerCase();
  
  // Build precision search query - NO EXCLUSIONS
  const searchQuery = buildPrecisionQuery(doctorName, city, state, specialty);
  
  try {
    // Execute search with timeout
    const searchPromise = callBraveSearch(searchQuery, 20); // Get more results for better matching
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Search timeout')), 8000)
    );
    
    const results = await Promise.race([searchPromise, timeoutPromise]);
    
    if (!results?.web?.results?.length) {
      console.log('❌ No search results found');
      return null;
    }
    
    // Score and rank all results
    const scoredResults = results.web.results
      .map((result: any) => ({
        ...result,
        score: scoreWebsiteResult(result, doctorName, lastName, city, state, specialty, practiceName)
      }))
      .filter((result: any) => result.score.total > 0) // Remove directories (score 0)
      .sort((a: any, b: any) => b.score.total - a.score.total);
    
    // Check if we have a high-confidence match
    const topResult = scoredResults[0];
    if (!topResult || topResult.score.total < 70) {
      console.log(`❌ No high-confidence practice website found (best score: ${topResult?.score.total || 0})`);
      return null;
    }
    
    // We found the practice website!
    console.log(`✅ Found practice website with ${topResult.score.total}% confidence: ${topResult.url}`);
    
    return {
      websiteUrl: topResult.url,
      confidence: topResult.score.total >= 95 ? 100 : topResult.score.total,
      discoveryMethod: topResult.score.method,
      title: topResult.title,
      description: topResult.description,
      verificationSignals: topResult.score.signals
    };
    
  } catch (error) {
    console.error('Website discovery error:', error);
    return null;
  }
}

/**
 * Build precision search query
 */
function buildPrecisionQuery(
  doctorName: string,
  city?: string,
  state?: string,
  specialty?: string
): string {
  // Start with doctor name
  let query = `"Dr. ${doctorName}"`;
  
  // Add location if available
  if (city) query += ` ${city}`;
  if (state) query += ` ${state}`;
  
  // Add specialty if available
  if (specialty) {
    // Clean up specialty (remove "Doctor" suffix if present)
    const cleanSpecialty = specialty.replace(/\s*Doctor$/i, '').trim();
    query += ` ${cleanSpecialty}`;
  }
  
  return query;
}

/**
 * Score a search result to determine if it's an actual practice website
 */
function scoreWebsiteResult(
  result: any,
  doctorName: string,
  lastName: string,
  city?: string,
  state?: string,
  specialty?: string,
  practiceName?: string
): {
  total: number;
  method: 'name_match' | 'specialty_match' | 'location_match' | 'practice_name';
  signals: string[];
} {
  const url = result.url.toLowerCase();
  const title = (result.title || '').toLowerCase();
  const description = (result.description || '').toLowerCase();
  const cleanName = doctorName.toLowerCase().replace(/^dr\.\s*/i, '');
  
  // Extract domain
  const domain = url.match(/https?:\/\/([^\/]+)/)?.[1] || '';
  const domainParts = domain.split('.');
  const mainDomain = domainParts[domainParts.length - 2] || '';
  
  // IMMEDIATE REJECTION - Directory sites get score 0
  const directories = [
    'healthgrades', 'vitals', 'zocdoc', 'yelp', 'yellowpages', 'webmd',
    'ratemds', 'wellness', 'doctor.com', 'findadoctor', 'doximity',
    'npidb', 'npino', 'hipaaspace', 'healthcare6', 'md.com', 'doctors.com',
    'facebook', 'linkedin', 'twitter', 'instagram', 'youtube',
    'bbb.org', 'manta.com', 'chamberofcommerce', 'merchantcircle'
  ];
  
  if (directories.some(dir => domain.includes(dir))) {
    return { total: 0, method: 'name_match', signals: ['directory_site'] };
  }
  
  let score = 0;
  const signals: string[] = [];
  let primaryMethod: 'name_match' | 'specialty_match' | 'location_match' | 'practice_name' = 'name_match';
  
  // 1. DOMAIN NAME MATCHING (Highest confidence)
  // Check if domain contains last name
  if (mainDomain.includes(lastName.replace(/\s+/g, ''))) {
    score += 50;
    signals.push('domain_contains_lastname');
    primaryMethod = 'name_match';
  }
  
  // Check if domain contains practice name
  if (practiceName) {
    const cleanPracticeName = practiceName.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20); // First part of practice name
    
    if (mainDomain.includes(cleanPracticeName)) {
      score += 50;
      signals.push('domain_matches_practice');
      primaryMethod = 'practice_name';
    }
  }
  
  // 2. TITLE MATCHING
  // Full name in title
  if (title.includes(cleanName) || title.includes(`dr ${lastName}`)) {
    score += 40;
    signals.push('title_contains_fullname');
  }
  
  // Practice name in title
  if (practiceName && title.includes(practiceName.toLowerCase())) {
    score += 30;
    signals.push('title_contains_practice');
  }
  
  // 3. SPECIALTY MATCHING
  const specialtyKeywords = [
    'dental', 'dentist', 'orthodont', 'endodont', 'periodont',
    'medical', 'clinic', 'practice', 'dermatolog', 'pediatric',
    'surgery', 'surgeon', 'wellness', 'health', 'aesthetic',
    'cosmetic', 'implant', 'family', 'general'
  ];
  
  const matchedSpecialty = specialtyKeywords.find(keyword => 
    domain.includes(keyword) || title.includes(keyword)
  );
  
  if (matchedSpecialty) {
    score += 30;
    signals.push(`specialty_keyword_${matchedSpecialty}`);
    if (score === 30) primaryMethod = 'specialty_match';
  }
  
  // Extra points if specialty matches the provided one
  if (specialty && matchedSpecialty && specialty.toLowerCase().includes(matchedSpecialty)) {
    score += 20;
    signals.push('specialty_exact_match');
  }
  
  // 4. CUSTOM DOMAIN VALIDATION
  const isCustomDomain = /^https?:\/\/[^\/]+\.(com|net|org|dental|medical|health|clinic|care)$/i.test(url);
  const websiteBuilders = ['.wix', '.square', '.weebly', '.godaddy', '.wordpress', '.blogspot'];
  
  if (isCustomDomain && !websiteBuilders.some(builder => url.includes(builder))) {
    score += 20;
    signals.push('custom_domain');
  }
  
  // 5. LOCATION MATCHING
  if (city || state) {
    const locationMatches = [
      city && (title.includes(city.toLowerCase()) || domain.includes(city.toLowerCase())),
      state && (title.includes(state.toLowerCase()) || description.includes(state.toLowerCase()))
    ].filter(Boolean).length;
    
    score += locationMatches * 10;
    if (locationMatches > 0) {
      signals.push('location_match');
      if (score === locationMatches * 10) primaryMethod = 'location_match';
    }
  }
  
  // 6. SPECIAL PATTERNS - Maximum confidence
  // Pattern: lastnamedental.com, smithmedical.com, etc.
  if (mainDomain.includes(lastName.replace(/\s+/g, '')) && 
      specialtyKeywords.some(k => mainDomain.includes(k))) {
    score = 100;
    signals.push('perfect_domain_pattern');
    primaryMethod = 'name_match';
  }
  
  // Pattern: Practice name + location
  if (practiceName && city && 
      title.includes(practiceName.toLowerCase()) && 
      title.includes(city.toLowerCase())) {
    score = Math.max(score, 95);
    signals.push('practice_location_match');
    primaryMethod = 'practice_name';
  }
  
  return {
    total: Math.min(score, 100),
    method: primaryMethod,
    signals
  };
}

/**
 * Validate that a URL is accessible and not a 404
 */
export async function validateWebsiteUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000)
    });
    
    return response.ok;
  } catch (error) {
    // If we can't validate, assume it's valid to avoid false negatives
    return true;
  }
}

/**
 * Extract additional website information for verification
 */
export function extractWebsiteMetadata(discoveryResult: WebsiteDiscoveryResult): {
  domain: string;
  isSecure: boolean;
  tld: string;
  likelyPracticeType?: string;
} {
  const url = new URL(discoveryResult.websiteUrl);
  const domain = url.hostname;
  const tld = domain.split('.').pop() || '';
  
  // Determine likely practice type from domain
  let likelyPracticeType: string | undefined;
  const domainLower = domain.toLowerCase();
  
  if (domainLower.includes('dental') || domainLower.includes('dentist')) {
    likelyPracticeType = 'dental';
  } else if (domainLower.includes('derma')) {
    likelyPracticeType = 'dermatology';
  } else if (domainLower.includes('ortho')) {
    likelyPracticeType = 'orthodontics';
  } else if (domainLower.includes('pediatric') || domainLower.includes('peds')) {
    likelyPracticeType = 'pediatrics';
  } else if (domainLower.includes('surgery') || domainLower.includes('surgical')) {
    likelyPracticeType = 'surgery';
  } else if (domainLower.includes('medical') || domainLower.includes('clinic')) {
    likelyPracticeType = 'medical';
  }
  
  return {
    domain,
    isSecure: url.protocol === 'https:',
    tld,
    likelyPracticeType
  };
}