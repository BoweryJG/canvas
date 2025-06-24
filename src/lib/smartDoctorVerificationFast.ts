/**
 * FAST Smart Doctor Verification System
 * Parallelized version that returns results in ~1 second
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
 * FAST verification that runs all searches in parallel
 */
export async function fastVerifyDoctor(
  doctorName: string,
  location?: string,
  specialty?: string,
  practiceName?: string,
  userId?: string,
  _productName?: string
): Promise<VerificationResult> {
  // Clean up doctor name
  const cleanDoctorName = doctorName.replace(/^Dr\.\s*/i, '').trim();
  console.log(`⚡ FAST verification for ${cleanDoctorName}`);
  
  const result: VerificationResult = {
    confidence: 0,
    verificationMethod: 'unverified',
    sources: []
  };

  // Build ALL queries upfront
  const allQueries: string[] = [];
  
  // Practice name queries (if available)
  if (practiceName) {
    allQueries.push(
      `"${practiceName}" ${location || ''}`,
      `${practiceName.toLowerCase().replace(/\s+/g, '')}.com`,
      `"${practiceName}" "${cleanDoctorName}"`
    );
  }
  
  // Specialty-based queries
  if (specialty?.toLowerCase().includes('oral') || specialty?.toLowerCase().includes('dental')) {
    allQueries.push(
      `"${cleanDoctorName} DDS" ${location || ''} dental practice website`,
      `"Dr. ${cleanDoctorName}" oral surgery ${location || ''}`
    );
  } else {
    allQueries.push(
      `"Dr. ${cleanDoctorName}" ${specialty || ''} practice website ${location || ''}`,
      `"${cleanDoctorName} MD" clinic ${location || ''}`
    );
  }
  
  // Buffalo area queries
  if (location && (location.toLowerCase().includes('buffalo') || location.toLowerCase().includes('williamsville'))) {
    allQueries.push(
      `"${cleanDoctorName}" dental Buffalo NY`,
      `oral surgeon Buffalo ${cleanDoctorName}`
    );
  }

  // PARALLEL EXECUTION - This is the key improvement!
  console.log(`⚡ Executing ${allQueries.length} searches in parallel...`);
  const searchPromises = allQueries.map(query => 
    callBraveSearch(query, 5, userId)
      .then(results => ({ query, results }))
      .catch(error => {
        console.error(`Search failed for: ${query}`, error);
        return { query, results: null };
      })
  );
  
  // Wait for ALL searches to complete
  const allSearchResults = await Promise.all(searchPromises);
  console.log(`✅ All searches completed in parallel`);
  
  // Process all results
  for (const { results } of allSearchResults) {
    if (results?.web?.results) {
      for (const webResult of results.web.results) {
        const source = classifyResult(webResult, cleanDoctorName, location, practiceName);
        result.sources.push(source);
      }
    }
  }
  
  // Find best source
  const bestSource = result.sources
    .sort((a, b) => b.confidence - a.confidence)[0];
  
  if (bestSource) {
    result.verifiedWebsite = bestSource.url;
    result.confidence = bestSource.confidence;
    result.verificationMethod = bestSource.type === 'practice' ? 'practice_website' : 
                                bestSource.type === 'social' ? 'social_media' : 'directory';
    
    if (!result.practiceName && bestSource.type === 'practice') {
      result.practiceName = extractPracticeName(bestSource.url);
    }
  }
  
  // Generate confirmation
  if (result.verifiedWebsite) {
    result.suggestedConfirmation = `Found: ${result.practiceName || cleanDoctorName} at ${result.verifiedWebsite}`;
  } else {
    result.suggestedConfirmation = `Could not verify practice website for ${cleanDoctorName}`;
  }
  
  return result;
}

/**
 * Classify and score results
 */
function classifyResult(
  result: any,
  doctorName: string,
  location?: string,
  practiceName?: string
): VerificationSource {
  const url = result.url.toLowerCase();
  const title = (result.title || '').toLowerCase();
  const description = (result.description || '').toLowerCase();
  
  let confidence = 0;
  const signals: string[] = [];
  let type: 'practice' | 'social' | 'directory' | 'news' = 'directory';
  
  // Directory sites (low confidence)
  const directories = ['healthgrades', 'vitals', 'zocdoc', 'yelp', 'yellowpages', 'webmd'];
  if (directories.some(d => url.includes(d))) {
    return {
      url: result.url,
      type: 'directory',
      confidence: 20,
      signals: ['directory_listing']
    };
  }
  
  // Social media
  if (url.includes('linkedin.com') || url.includes('facebook.com') || url.includes('instagram.com')) {
    type = 'social';
    confidence = 50;
    signals.push('social_media');
    
    if (title.includes('practice') || title.includes('clinic') || title.includes('dental')) {
      confidence = 70;
      signals.push('official_page');
    }
  }
  
  // Practice website indicators
  else {
    type = 'practice';
    confidence = 40; // Base score
    
    // Practice name match (best signal)
    if (practiceName) {
      const practiceNameLower = practiceName.toLowerCase();
      if (url.includes(practiceNameLower.replace(/\s+/g, '')) || 
          title.includes(practiceNameLower)) {
        confidence += 40;
        signals.push('practice_name_match');
      }
    }
    
    // Doctor name match
    if (title.includes(doctorName.toLowerCase()) || 
        description.includes(doctorName.toLowerCase())) {
      confidence += 20;
      signals.push('doctor_name_match');
    }
    
    // Location match
    if (location && (title.includes(location.toLowerCase()) || 
        url.includes(location.toLowerCase().split(',')[0]))) {
      confidence += 10;
      signals.push('location_match');
    }
    
    // Custom domain (not a subdomain)
    if (!url.includes('.wix') && !url.includes('.square') && 
        !url.includes('.wordpress') && !url.includes('.weebly')) {
      confidence += 10;
      signals.push('custom_domain');
    }
  }
  
  return {
    url: result.url,
    type,
    confidence: Math.min(confidence, 100),
    signals
  };
}

/**
 * Extract practice name from URL
 */
function extractPracticeName(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const name = hostname
      .replace('www.', '')
      .replace('.com', '')
      .replace('.net', '')
      .replace('.org', '')
      .replace(/-/g, ' ')
      .split('.')
      [0];
    
    // Capitalize words
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } catch {
    return 'Medical Practice';
  }
}

// Export the fast version as the default
export { fastVerifyDoctor as smartVerifyDoctor };