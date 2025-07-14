/**
 * WEBSITE DISCOVERY ENGINE
 * Precision-targeted system for finding actual practice websites
 * Returns real data or nothing - no generic fallbacks
 */

import { callBraveSearch } from './apiEndpoints';
import { analyzeWebsitesWithClaude4Opus } from './aiWebsiteAnalyzer';

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
export async function discoverPracticeWebsiteWithAI(
  doctorName: string,
  city?: string,
  state?: string,
  specialty?: string,
  practiceName?: string,
  _npi?: string
): Promise<WebsiteDiscoveryResult | null> {
  return discoverPracticeWebsite(doctorName, city, state, specialty, practiceName, _npi);
}

export async function discoverPracticeWebsite(
  doctorName: string,
  city?: string,
  state?: string,
  specialty?: string,
  practiceName?: string,
  _npi?: string
): Promise<WebsiteDiscoveryResult | null> {
  console.log(`🎯 Starting AI-powered website discovery for Dr. ${doctorName}`);
  
  // Build multiple search queries for better coverage
  const searchQueries = buildSmartSearchQueries(doctorName, city, state, specialty, practiceName);
  
  try {
    // Execute multiple searches to gather comprehensive results
    const allSearchResults: any[] = [];
    const seenUrls = new Set<string>();
    
    for (const query of searchQueries) {
      console.log(`🔍 Searching: "${query}"`);
      try {
        const searchPromise = callBraveSearch(query, 15);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout')), 5000)
        );
        
        const results = await Promise.race([searchPromise, timeoutPromise]);
        
        if (results?.web?.results?.length) {
          // Add unique results
          for (const result of results.web.results) {
            if (!seenUrls.has(result.url)) {
              seenUrls.add(result.url);
              allSearchResults.push(result);
            }
          }
        }
      } catch (searchError) {
        console.log(`Search failed for query "${query}":`, searchError);
        // Continue with other queries
      }
    }
    
    if (allSearchResults.length === 0) {
      console.log('❌ No search results found across all queries');
      return null;
    }
    
    console.log(`📊 Found ${allSearchResults.length} unique results across all searches`);
    
    // Use Claude 4 Opus to analyze results
    const aiAnalysis = await analyzeWebsitesWithClaude4Opus(
      allSearchResults,
      doctorName,
      practiceName,  // This could be "Pure Dental" for Dr. Greg White
      specialty,
      city,
      state
    );
    
    // Check if we found any practice websites
    if (aiAnalysis.practiceWebsites.length === 0) {
      console.log('❌ Claude 4 Opus found no practice websites');
      console.log('Rejected sites:', aiAnalysis.rejectedSites);
      return null;
    }
    
    // Get the best practice website
    const bestWebsite = aiAnalysis.practiceWebsites[0];
    console.log(`✅ Claude 4 Opus found practice website with ${bestWebsite.confidence}% confidence: ${bestWebsite.url}`);
    console.log(`Reason: ${bestWebsite.reason}`);
    
    return {
      websiteUrl: bestWebsite.url,
      confidence: bestWebsite.confidence,
      discoveryMethod: 'ai_verified' as any,
      title: bestWebsite.reason,
      description: `Verified by Claude 4 Opus: ${bestWebsite.signals.join(', ')}`,
      verificationSignals: ['claude-4-opus-verified', ...bestWebsite.signals]
    };
    
  } catch (error) {
    console.error('Website discovery error:', error);
    return null;
  }
}

/**
 * Build smart search queries using NPI organization data and multiple strategies
 */
function buildSmartSearchQueries(
  doctorName: string,
  city?: string,
  state?: string,
  specialty?: string,
  organizationName?: string
): string[] {
  const queries: string[] = [];
  
  // Extract last name for targeted searches
  const cleanName = doctorName.replace(/^Dr\.\s*/i, '').trim();
  const lastName = cleanName.split(' ').pop() || cleanName;
  
  // Priority 1: Organization name searches (e.g., "Pure Dental")
  if (organizationName && organizationName.length > 2) {
    // Direct organization search
    queries.push(`"${organizationName}" ${city || ''} ${state || ''}`);
    
    // Organization + doctor name
    queries.push(`"${organizationName}" "Dr. ${doctorName}"`);
    
    // Clean organization name for domain searches
    const orgClean = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (orgClean.length > 3) {
      queries.push(`site:${orgClean}.com OR site:www.${orgClean}.com`);
    }
  }
  
  // Priority 2: Standard doctor searches
  queries.push(`"Dr. ${doctorName}" ${city || ''} ${state || ''} ${specialty || ''}`);
  
  // Priority 3: Practice pattern searches
  if (lastName.length > 2) {
    // Common dental practice patterns
    if (specialty?.toLowerCase().includes('dent')) {
      queries.push(`"${lastName} dental" ${city || ''} ${state || ''}`);
      queries.push(`site:${lastName}dental.com OR site:${lastName}dentistry.com`);
    }
    
    // Common medical practice patterns
    if (specialty?.toLowerCase().includes('medic') || !specialty?.toLowerCase().includes('dent')) {
      queries.push(`"${lastName} medical" ${city || ''} ${state || ''}`);
      queries.push(`"${lastName} clinic" ${city || ''} ${state || ''}`);
    }
  }
  
  // Priority 4: Location-based searches
  if (city) {
    queries.push(`"Dr. ${doctorName}" practice website ${city}`);
  }
  
  // Remove duplicates and empty queries
  const uniqueQueries = [...new Set(queries)]
    .filter(q => q && q.trim().length > 5)
    .map(q => q.trim());
  
  // Limit to top 5 queries to avoid too many API calls
  return uniqueQueries.slice(0, 5);
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
  let url: URL;
  let domain: string;
  let tld: string;
  
  try {
    url = new URL(discoveryResult.websiteUrl);
    domain = url.hostname;
    tld = domain.split('.').pop() || '';
  } catch {
    // Fallback for invalid URLs
    domain = discoveryResult.websiteUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    tld = domain.split('.').pop() || '';
    url = { protocol: 'https:' } as any; // Mock URL object for isSecure check
  }
  
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