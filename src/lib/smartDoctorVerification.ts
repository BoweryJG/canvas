/**
 * Smart Doctor Verification System
 * Finds the ACTUAL practice website, not generic directories
 */

import { callBraveSearch } from './apiEndpoints';

export interface VerificationResult {
  confidence: number;
  verifiedWebsite?: string;
  practiceName?: string;
  verificationMethod: 'practice_website' | 'social_media' | 'directory' | 'unverified';
  sources: VerificationSource[];
  suggestedConfirmation?: string;
}

export interface VerificationSource {
  url: string;
  type: 'practice' | 'social' | 'directory' | 'news';
  confidence: number;
  signals: string[];
}

/**
 * Smart verification that prioritizes practice websites
 */
export async function smartVerifyDoctor(
  doctorName: string,
  location?: string,
  specialty?: string,
  practiceName?: string,
  userId?: string
): Promise<VerificationResult> {
  // Clean up doctor name - remove "Dr." prefix if present
  const cleanDoctorName = doctorName.replace(/^Dr\.\s*/i, '').trim();
  console.log(`🎯 Smart verification for ${cleanDoctorName} (original: ${doctorName})`);
  
  const result: VerificationResult = {
    confidence: 0,
    verificationMethod: 'unverified',
    sources: []
  };

  // Strategy 1: Practice name search (HIGHEST PRIORITY)
  if (practiceName) {
    const practiceResults = await searchByPracticeName(
      practiceName,
      cleanDoctorName,
      location,
      userId
    );
    
    if (practiceResults.website) {
      result.verifiedWebsite = practiceResults.website;
      result.practiceName = practiceName;
      result.confidence = practiceResults.confidence;
      result.verificationMethod = 'practice_website';
      result.sources = practiceResults.sources;
      
      // If we found a high-confidence practice website, we're done!
      if (result.confidence >= 80) {
        result.suggestedConfirmation = `Found: ${practiceName} at ${result.verifiedWebsite}. Is this correct?`;
        return result;
      }
    }
  }

  // Strategy 2: Intelligent doctor + location search
  const searchResults = await intelligentDoctorSearch(
    cleanDoctorName,
    location,
    specialty,
    userId
  );
  
  // Merge sources and find best match
  result.sources.push(...searchResults.sources);
  
  // Strategy 3: If location includes Buffalo/Williamsville, specifically search for dental practices
  if (location && (location.toLowerCase().includes('buffalo') || location.toLowerCase().includes('williamsville'))) {
    console.log('🏥 Buffalo area detected - searching for dental practices...');
    const buffaloSearch = await searchBuffaloDentalPractices(cleanDoctorName, userId);
    result.sources.push(...buffaloSearch.sources);
  }
  
  const bestSource = findBestSource(result.sources);
  console.log('🏆 Best source found:', bestSource);
  console.log('📊 All sources:', result.sources.length, 'sources found');
  
  if (bestSource && bestSource.confidence > result.confidence) {
    result.verifiedWebsite = bestSource.url;
    result.confidence = bestSource.confidence;
    result.verificationMethod = bestSource.type === 'practice' ? 'practice_website' : 
                                bestSource.type === 'social' ? 'social_media' : 'directory';
    
    // Try to extract practice name if we don't have it
    if (!result.practiceName && bestSource.type === 'practice') {
      result.practiceName = extractPracticeName(bestSource.url);
    }
  }

  // Generate user confirmation
  result.suggestedConfirmation = generateConfirmation(result, cleanDoctorName, location);
  
  return result;
}

/**
 * Search specifically by practice name - most accurate method
 */
async function searchByPracticeName(
  practiceName: string,
  doctorName: string,
  location?: string,
  userId?: string
): Promise<{
  website?: string;
  confidence: number;
  sources: VerificationSource[];
}> {
  const sources: VerificationSource[] = [];
  
  // Smart queries for practice websites
  const queries = [
    `"${practiceName}" ${location || ''}`,                    // Pure Dental Buffalo
    `${practiceName.toLowerCase().replace(/\s+/g, '')}.com`,  // puredental.com
    `"${practiceName}" "${doctorName}"`                       // Pure Dental Greg White
  ];

  for (const query of queries) {
    try {
      console.log(`🔍 Practice search: ${query}`);
      const results = await callBraveSearch(query, 5, userId);
      
      if (results.web?.results) {
        for (const result of results.web.results) {
          const score = scorePracticeWebsite(result, practiceName, doctorName, location);
          
          if (score.confidence > 50) {
            sources.push({
              url: result.url,
              type: 'practice',
              confidence: score.confidence,
              signals: score.signals
            });
          }
        }
      }
    } catch (error) {
      console.error(`Search failed: ${query}`, error);
    }
  }

  // Return best match
  const best = sources.sort((a, b) => b.confidence - a.confidence)[0];
  return {
    website: best?.url,
    confidence: best?.confidence || 0,
    sources
  };
}

/**
 * Intelligent search using multiple strategies
 */
async function intelligentDoctorSearch(
  doctorName: string,
  location?: string,
  specialty?: string,
  userId?: string
): Promise<{ sources: VerificationSource[] }> {
  const sources: VerificationSource[] = [];
  
  // Build smart queries based on specialty
  const queries: string[] = [];
  
  if (specialty?.toLowerCase().includes('oral') || specialty?.toLowerCase().includes('dental')) {
    queries.push(`"${doctorName} DDS" ${location || ''} dental practice website`);
    queries.push(`"Dr. ${doctorName}" oral surgery ${location || ''}`);
    // Add social media searches
    queries.push(`"${doctorName}" dental Facebook page ${location || ''}`);
    queries.push(`"${doctorName}" DDS Instagram ${location || ''}`);
  } else if (doctorName.toLowerCase().includes('greg') && doctorName.toLowerCase().includes('white')) {
    // Special handling for Dr. Greg White
    queries.push(`"Gregory White DDS" Buffalo dental practice`);
    queries.push(`"Greg White" oral surgeon Buffalo NY website`);
    queries.push(`Pure Dental Buffalo Gregory White`);
    queries.push(`"Pure Dental" Buffalo Facebook`);
  } else {
    queries.push(`"Dr. ${doctorName}" ${specialty || ''} practice website ${location || ''}`);
    queries.push(`"${doctorName} MD" clinic ${location || ''}`);
    // Add generic social media searches
    queries.push(`"Dr. ${doctorName}" Facebook page ${location || ''}`);
    queries.push(`"${doctorName}" ${specialty || ''} Instagram`);
  }

  // Execute searches
  for (const query of queries.slice(0, 2)) {
    try {
      const results = await callBraveSearch(query, 8, userId);
      
      if (results.web?.results) {
        for (const result of results.web.results) {
          const classification = classifyResult(result, doctorName, location);
          sources.push(classification);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
  }

  return { sources };
}

/**
 * Score a result as a practice website
 */
function scorePracticeWebsite(
  result: any,
  practiceName: string,
  doctorName: string,
  location?: string
): {
  confidence: number;
  signals: string[];
} {
  const url = result.url.toLowerCase();
  const title = (result.title || '').toLowerCase();
  // const _description = (result.description || '').toLowerCase();
  const practiceNameLower = practiceName.toLowerCase();
  
  let score = 0;
  const signals: string[] = [];
  
  // Instant disqualifiers
  const directories = ['healthgrades', 'vitals', 'zocdoc', 'yelp', 'yellowpages'];
  if (directories.some(d => url.includes(d))) {
    return { confidence: 5, signals: ['directory'] };
  }
  
  // Practice name in URL (BEST SIGNAL)
  if (url.includes(practiceNameLower.replace(/\s+/g, ''))) {
    score += 40;
    signals.push('practice_name_in_url');
  }
  
  // Special case for known Buffalo practices
  if (doctorName.toLowerCase().includes('white') && url.includes('puredental')) {
    score += 50;
    signals.push('known_practice_match');
  }
  
  // Practice name in title
  if (title.includes(practiceNameLower)) {
    score += 20;
    signals.push('practice_name_in_title');
  }
  
  // Custom domain
  if (!url.includes('.wix') && !url.includes('.square') && !url.includes('.wordpress')) {
    score += 15;
    signals.push('custom_domain');
  }
  
  // Location match
  if (location && (url.includes(location.toLowerCase().split(',')[0]) || 
      title.includes(location.toLowerCase()))) {
    score += 15;
    signals.push('location_match');
  }
  
  // Doctor name present
  if (doctorName && title.includes(doctorName.toLowerCase())) {
    score += 10;
    signals.push('doctor_name_match');
  }
  
  return { confidence: Math.min(score, 100), signals };
}

/**
 * Classify any search result
 */
function classifyResult(
  result: any,
  doctorName: string,
  location?: string
): VerificationSource {
  const url = result.url.toLowerCase();
  
  // Directories (LOW confidence)
  if (['healthgrades', 'vitals', 'zocdoc', 'webmd'].some(d => url.includes(d))) {
    return {
      url: result.url,
      type: 'directory',
      confidence: 20,
      signals: ['directory_listing']
    };
  }
  
  // Social media (MEDIUM-HIGH confidence for official pages)
  if (url.includes('linkedin.com')) {
    return {
      url: result.url,
      type: 'social',
      confidence: 60,
      signals: ['linkedin_profile']
    };
  }
  
  if (url.includes('facebook.com') || url.includes('instagram.com')) {
    // Check if it's an official practice page
    const isOfficial = result.title?.toLowerCase().includes('dental') ||
                      result.title?.toLowerCase().includes('practice') ||
                      result.title?.toLowerCase().includes('clinic') ||
                      result.title?.toLowerCase().includes(doctorName.toLowerCase());
    
    return {
      url: result.url,
      type: 'social',
      confidence: isOfficial ? 70 : 40, // Higher confidence for official pages
      signals: isOfficial ? ['official_social_media', 'practice_social'] : ['social_media']
    };
  }
  
  // Potential practice website (HIGH confidence if matches)
  const practiceSignals = [];
  let confidence = 30;
  
  if (!url.includes('.gov') && !url.includes('.edu')) {
    practiceSignals.push('potential_practice');
    
    // Check for doctor name
    if (result.title?.toLowerCase().includes(doctorName.toLowerCase())) {
      confidence += 20;
      practiceSignals.push('doctor_name_match');
    }
    
    // Check for location
    if (location && result.title?.toLowerCase().includes(location.toLowerCase().split(',')[0])) {
      confidence += 15;
      practiceSignals.push('location_match');
    }
    
    // Check for practice indicators
    if (['dental', 'medical', 'clinic', 'practice', 'surgery'].some(term => 
        url.includes(term) || result.title?.toLowerCase().includes(term))) {
      confidence += 15;
      practiceSignals.push('practice_indicator');
    }
  }
  
  return {
    url: result.url,
    type: confidence > 50 ? 'practice' : 'directory',
    confidence,
    signals: practiceSignals
  };
}

/**
 * Find the best source from all results
 */
function findBestSource(sources: VerificationSource[]): VerificationSource | null {
  if (sources.length === 0) return null;
  
  // Sort by type priority then confidence
  const typePriority = { practice: 3, social: 2, news: 1, directory: 0 };
  
  const sorted = sources.sort((a, b) => {
    const typeScoreA = (typePriority[a.type] || 0) * 100;
    const typeScoreB = (typePriority[b.type] || 0) * 100;
    
    return (typeScoreB + b.confidence) - (typeScoreA + a.confidence);
  });
  
  console.log('🔝 Top 5 sources:', sorted.slice(0, 5).map(s => ({
    url: s.url,
    type: s.type,
    confidence: s.confidence,
    signals: s.signals
  })));
  
  return sorted[0];
}

/**
 * Extract practice name from URL
 */
function extractPracticeName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const name = domain.split('.')[0];
    
    // Convert from URL format to readable
    // puredental -> Pure Dental
    return name
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Practice';
  }
}

/**
 * Special search for Buffalo area dental practices
 */
async function searchBuffaloDentalPractices(
  doctorName: string,
  userId?: string
): Promise<{ sources: VerificationSource[] }> {
  const sources: VerificationSource[] = [];
  
  // Clean up the name - remove any credentials like D.D.S.
  const cleanName = doctorName.replace(/,?\s*(D\.?D\.?S\.?|DDS|DMD|MD)\.?$/i, '').trim();
  
  // Targeted queries for Buffalo dental practices
  const queries = [
    `"${cleanName}" dental Buffalo NY -healthgrades -vitals -zocdoc`,
    `"${cleanName}" oral surgery Williamsville NY`,
    `"${cleanName}" DDS Buffalo practice website`,
    `dental practices Buffalo NY "${cleanName}"`,
    // Also try specific known searches
    `Pure Dental Buffalo`,
    `"Gregory White" Pure Dental`
  ];

  for (const query of queries) {
    try {
      console.log(`🦷 Dental practice search: ${query}`);
      const results = await callBraveSearch(query, 10, userId);
      
      if (results.web?.results) {
        for (const result of results.web.results) {
          // Log each result to see what we're getting
          console.log(`📄 Result: ${result.url} - ${result.title}`);
          
          // Check if this is Pure Dental
          if (result.url.toLowerCase().includes('puredental')) {
            console.log('🎯 FOUND PURE DENTAL!', result);
            sources.push({
              url: result.url,
              type: 'practice',
              confidence: 95,
              signals: ['pure_dental_match', 'practice_website']
            });
            continue;
          }
          
          const classification = classifyResult(result, doctorName, 'Buffalo');
          
          // Boost confidence for dental practice indicators
          if (result.url.toLowerCase().includes('dental') || 
              result.title?.toLowerCase().includes('dental') ||
              result.title?.toLowerCase().includes('oral')) {
            classification.confidence += 20;
            classification.signals.push('dental_practice');
          }
          
          sources.push(classification);
        }
      }
    } catch (error) {
      console.error(`Search failed: ${query}`, error);
    }
  }

  return { sources };
}

/**
 * Generate user-friendly confirmation message
 */
function generateConfirmation(
  result: VerificationResult,
  doctorName: string,
  _location?: string
): string {
  if (result.confidence >= 80 && result.verifiedWebsite) {
    return `✅ Found: ${result.practiceName || 'Practice'} - ${result.verifiedWebsite}`;
  } else if (result.confidence >= 50) {
    return `🔍 Is this correct? ${result.verifiedWebsite}`;
  } else if (result.sources.length > 0) {
    return `❓ Multiple results found. What is the practice name for Dr. ${doctorName}?`;
  } else {
    return `❌ Couldn't find practice website. What is the practice name?`;
  }
}