/**
 * Enhanced Web Research with NPI data integration
 * Now with specialty-aware searching for accurate results
 */

import { callBraveSearch, callFirecrawlScrape } from './apiEndpoints';

export interface EnhancedSearchParams {
  doctorName: string;
  specialty?: string;
  location?: string;
  credential?: string;
  npi?: string;
  practiceName?: string;
}

/**
 * Conduct enhanced research using NPI-verified data
 */
export async function conductEnhancedResearch(
  params: EnhancedSearchParams,
  userId?: string
) {
  console.log(`🎯 Enhanced research with NPI data:`, params);
  
  const searchQueries = buildSmartQueries(params);
  const results = {
    confidence: 0,
    sources: [],
    practiceWebsite: null,
    verifiedInfo: params.npi ? true : false
  };
  
  // Search with each query, prioritizing specialty-specific searches
  for (const query of searchQueries) {
    try {
      const searchResults = await callBraveSearch(query, 5, userId);
      
      if (searchResults.web?.results?.length > 0) {
        // Score each result based on how well it matches our known data
        for (const result of searchResults.web.results) {
          const score = scoreResult(result, params);
          
          if (score > 70) {
            results.sources.push({
              ...result,
              confidenceScore: score,
              isLikelyPracticeWebsite: isPracticeWebsite(result, params)
            });
            
            // If this looks like their practice website, scrape it
            if (score > 85 && isPracticeWebsite(result, params) && !results.practiceWebsite) {
              try {
                const scraped = await callFirecrawlScrape(result.url, {
                  formats: ['markdown'],
                  onlyMainContent: true
                }, userId);
                
                if (scraped.success) {
                  results.practiceWebsite = {
                    url: result.url,
                    content: scraped.markdown,
                    confidence: score
                  };
                }
              } catch (err) {
                console.log('Scrape failed, continuing...');
              }
            }
          }
        }
      }
      
      // If we found high-confidence results, we can stop
      if (results.sources.filter(s => s.confidenceScore > 85).length >= 2) {
        break;
      }
      
    } catch (error) {
      console.error(`Search failed for query: ${query}`, error);
    }
  }
  
  // Calculate overall confidence
  if (results.sources.length > 0) {
    results.confidence = Math.max(...results.sources.map(s => s.confidenceScore));
  }
  
  return results;
}

/**
 * Build smart search queries using all available data
 */
function buildSmartQueries(params: EnhancedSearchParams): string[] {
  const { doctorName, specialty, location, credential, practiceName } = params;
  const queries: string[] = [];
  
  // Most specific query first
  if (specialty && location && credential) {
    queries.push(`"Dr. ${doctorName}, ${credential}" "${specialty}" "${location}"`);
  }
  
  // Specialty-specific searches
  if (specialty) {
    // Handle common specialty variations
    const specialtyVariations = getSpecialtyVariations(specialty);
    specialtyVariations.forEach(variant => {
      queries.push(`"${doctorName}" "${variant}" ${location || ''}`);
    });
    
    // Specialty-specific directories
    if (specialty.toLowerCase().includes('oral')) {
      queries.push(`"${doctorName}" site:aaoms.org`);
    } else if (specialty.toLowerCase().includes('cardio')) {
      queries.push(`"${doctorName}" site:acc.org`);
    }
  }
  
  // Practice name search (often most accurate)
  if (practiceName) {
    queries.push(`"${practiceName}" "${doctorName}"`);
  }
  
  // Location-specific with credential
  if (location && credential) {
    queries.push(`"${doctorName} ${credential}" ${location} office contact`);
  }
  
  // General medical directories
  queries.push(`"Dr. ${doctorName}" ${specialty || ''} site:healthgrades.com`);
  queries.push(`"${doctorName}" physician ${location || ''} practice website`);
  
  return queries;
}

/**
 * Score how well a search result matches our known data
 */
function scoreResult(result: any, params: EnhancedSearchParams): number {
  let score = 0;
  const title = (result.title || '').toLowerCase();
  const description = (result.description || '').toLowerCase();
  const url = (result.url || '').toLowerCase();
  
  // Name matching (most important)
  const nameParts = params.doctorName.toLowerCase().split(' ');
  const nameMatches = nameParts.filter(part => 
    title.includes(part) || description.includes(part)
  ).length;
  score += (nameMatches / nameParts.length) * 40;
  
  // Specialty matching
  if (params.specialty) {
    const specialtyLower = params.specialty.toLowerCase();
    if (title.includes(specialtyLower) || description.includes(specialtyLower)) {
      score += 25;
    }
    
    // Check for specialty variations
    const variations = getSpecialtyVariations(params.specialty);
    if (variations.some(v => title.includes(v.toLowerCase()) || description.includes(v.toLowerCase()))) {
      score += 15;
    }
  }
  
  // Credential matching
  if (params.credential && (title.includes(params.credential.toLowerCase()) || 
      description.includes(params.credential.toLowerCase()))) {
    score += 10;
  }
  
  // Location matching
  if (params.location) {
    const locationParts = params.location.toLowerCase().split(',').map(s => s.trim());
    const locationMatches = locationParts.filter(part => 
      title.includes(part) || description.includes(part)
    ).length;
    score += (locationMatches / locationParts.length) * 15;
  }
  
  // URL quality indicators
  if (url.includes(params.doctorName.toLowerCase().replace(/\s+/g, ''))) {
    score += 10;
  }
  
  return Math.min(100, score);
}

/**
 * Determine if a result is likely the doctor's practice website
 */
function isPracticeWebsite(result: any, params: EnhancedSearchParams): boolean {
  const url = (result.url || '').toLowerCase();
  const title = (result.title || '').toLowerCase();
  
  // Negative indicators (not a practice website)
  const directories = ['healthgrades', 'vitals', 'zocdoc', 'webmd', 'doximity', 'yelp'];
  if (directories.some(dir => url.includes(dir))) {
    return false;
  }
  
  // Positive indicators
  const indicators = ['practice', 'office', 'clinic', 'center', 'associates', 'group'];
  const hasGeneralIndicator = indicators.some(ind => url.includes(ind) || title.includes(ind));
  
  // Specialty-specific indicators
  if (params.specialty) {
    const specialtyIndicators = getSpecialtyWebsiteIndicators(params.specialty);
    const hasSpecialtyIndicator = specialtyIndicators.some(ind => 
      url.includes(ind) || title.includes(ind)
    );
    
    return hasGeneralIndicator || hasSpecialtyIndicator;
  }
  
  return hasGeneralIndicator;
}

/**
 * Get variations of specialty names for better matching
 */
function getSpecialtyVariations(specialty: string): string[] {
  const variations: string[] = [specialty];
  const specialtyLower = specialty.toLowerCase();
  
  // Add common variations
  if (specialtyLower.includes('oral') && specialtyLower.includes('maxillofacial')) {
    variations.push('oral surgery', 'oral surgeon', 'maxillofacial surgeon', 'oms');
  } else if (specialtyLower.includes('cardio')) {
    variations.push('cardiology', 'cardiologist', 'heart doctor', 'cardiac');
  } else if (specialtyLower.includes('ortho')) {
    variations.push('orthopedic', 'orthopedics', 'orthopaedic', 'bone doctor');
  }
  
  return variations;
}

/**
 * Get website indicators specific to specialties
 */
function getSpecialtyWebsiteIndicators(specialty: string): string[] {
  const specialtyLower = specialty.toLowerCase();
  
  if (specialtyLower.includes('oral')) {
    return ['oral', 'surgery', 'dental', 'maxillofacial', 'extraction', 'implant'];
  } else if (specialtyLower.includes('cardio')) {
    return ['heart', 'cardiac', 'cardio', 'cardiovascular'];
  } else if (specialtyLower.includes('derma')) {
    return ['skin', 'derm', 'dermatology', 'cosmetic'];
  } else if (specialtyLower.includes('ortho')) {
    return ['bone', 'joint', 'spine', 'ortho', 'sports'];
  }
  
  return [];
}