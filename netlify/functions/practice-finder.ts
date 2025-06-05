import { Handler } from '@netlify/functions';

interface PracticeFinderRequest {
  searchTerms: string;
  knownPracticeName?: string;
  location?: string;
  includeAlternativeSearches?: boolean;
}

interface PracticeSearchStrategy {
  query: string;
  weight: number;
  description: string;
}

interface PracticeResult {
  url: string;
  domain: string;
  title: string;
  description: string;
  isPracticeWebsite: boolean;
  practiceNameConfidence: number;
  locationMatch: boolean;
  searchStrategy: string;
  indicators: string[];
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const request: PracticeFinderRequest = JSON.parse(event.body || '{}');
    const { searchTerms, knownPracticeName, location, includeAlternativeSearches = true } = request;

    if (!searchTerms && !knownPracticeName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Search terms or practice name required' })
      };
    }

    console.log(`🔍 Finding practice website for: ${searchTerms || knownPracticeName}`);

    // Generate search strategies
    const searchStrategies = generateSearchStrategies({
      searchTerms,
      knownPracticeName,
      location,
      includeAlternativeSearches
    });

    // Execute searches in parallel
    const allResults: PracticeResult[] = [];
    
    for (const strategy of searchStrategies) {
      try {
        const results = await executePracticeSearch(strategy, {
          knownPracticeName,
          location
        });
        allResults.push(...results);
      } catch (error) {
        console.error(`Search strategy "${strategy.description}" failed:`, error);
      }
    }

    // Deduplicate by domain
    const uniqueResults = deduplicateResults(allResults);
    
    // Sort by practice likelihood
    uniqueResults.sort((a, b) => {
      // Prioritize practice websites
      if (a.isPracticeWebsite !== b.isPracticeWebsite) {
        return a.isPracticeWebsite ? -1 : 1;
      }
      // Then by practice name confidence
      return b.practiceNameConfidence - a.practiceNameConfidence;
    });

    // Extract practice name if not provided
    const detectedPracticeName = extractPracticeName(uniqueResults, searchTerms);

    // Find the most likely practice website
    const primaryPractice = uniqueResults.find(r => r.isPracticeWebsite) || uniqueResults[0];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        detectedPracticeName: detectedPracticeName || knownPracticeName,
        primaryPracticeWebsite: primaryPractice ? {
          url: primaryPractice.url,
          domain: primaryPractice.domain,
          confidence: primaryPractice.practiceNameConfidence,
          indicators: primaryPractice.indicators
        } : null,
        alternativeResults: uniqueResults.slice(0, 5),
        searchStrategiesUsed: searchStrategies.map(s => s.description),
        recommendation: generatePracticeRecommendation(uniqueResults, detectedPracticeName)
      })
    };

  } catch (error) {
    console.error('Practice finder error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Practice search failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

function generateSearchStrategies(params: {
  searchTerms?: string;
  knownPracticeName?: string;
  location?: string;
  includeAlternativeSearches?: boolean;
}): PracticeSearchStrategy[] {
  const strategies: PracticeSearchStrategy[] = [];
  const { searchTerms, knownPracticeName, location, includeAlternativeSearches } = params;

  // Primary search with exact practice name if known
  if (knownPracticeName) {
    strategies.push({
      query: `"${knownPracticeName}" ${location || ''} website`,
      weight: 100,
      description: 'Exact practice name search'
    });

    strategies.push({
      query: `"${knownPracticeName}" ${location || ''} dental OR medical office`,
      weight: 90,
      description: 'Practice name with office keywords'
    });

    // Try domain-style search
    const domainStyle = knownPracticeName.toLowerCase().replace(/\s+/g, '');
    strategies.push({
      query: `${domainStyle}.com OR ${domainStyle}dental.com ${location || ''}`,
      weight: 80,
      description: 'Domain-style search'
    });
  }

  // Search based on provided terms
  if (searchTerms) {
    strategies.push({
      query: `${searchTerms} official website`,
      weight: 70,
      description: 'General terms with website indicator'
    });

    // Extract potential practice name from search terms
    const terms = searchTerms.toLowerCase();
    if (terms.includes('dental') || terms.includes('medical') || terms.includes('clinic')) {
      const practicePattern = /(\w+\s+(?:dental|medical|clinic|practice|center))/i;
      const match = searchTerms.match(practicePattern);
      if (match) {
        strategies.push({
          query: `"${match[1]}" website ${location || ''}`,
          weight: 85,
          description: 'Extracted practice name search'
        });
      }
    }
  }

  // Location-based searches if alternative searches enabled
  if (includeAlternativeSearches && location) {
    if (knownPracticeName) {
      strategies.push({
        query: `${knownPracticeName.split(' ')[0]} dental OR medical ${location}`,
        weight: 60,
        description: 'First word of practice + location'
      });
    }

    strategies.push({
      query: `dental practices OR medical offices near ${location} -directory -listing`,
      weight: 40,
      description: 'Local practice search (excluding directories)'
    });
  }

  return strategies;
}

async function executePracticeSearch(
  strategy: PracticeSearchStrategy,
  context: { knownPracticeName?: string; location?: string }
): Promise<PracticeResult[]> {
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAe5JOYNgM9vHXnme_VZ1BQKBVkuv-';
  
  const searchUrl = new URL('https://api.search.brave.com/res/v1/web/search');
  searchUrl.searchParams.append('q', strategy.query);
  searchUrl.searchParams.append('count', '10');
  searchUrl.searchParams.append('country', 'US');
  
  const response = await fetch(searchUrl.toString(), {
    headers: {
      'X-Subscription-Token': BRAVE_API_KEY,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Search API error: ${response.status}`);
  }

  const data = await response.json();
  const results: PracticeResult[] = [];

  for (const result of (data.web?.results || [])) {
    const analyzed = analyzePracticeResult(result, context, strategy);
    results.push(analyzed);
  }

  return results;
}

function analyzePracticeResult(
  result: any,
  context: { knownPracticeName?: string; location?: string },
  strategy: PracticeSearchStrategy
): PracticeResult {
  const url = result.url;
  const domain = new URL(url).hostname.replace('www.', '');
  const title = result.title || '';
  const description = result.description || '';
  
  const indicators: string[] = [];
  let practiceNameConfidence = 0;
  let isPracticeWebsite = false;
  let locationMatch = false;

  // Check for directory sites (negative indicator)
  const directoryDomains = [
    'healthgrades', 'vitals', 'zocdoc', 'webmd', 'yelp', 
    'yellowpages', 'findadoctor', 'npiprofile', 'wellness'
  ];
  const isDirectory = directoryDomains.some(dir => domain.includes(dir));
  
  if (isDirectory) {
    indicators.push('Directory site (not primary website)');
    practiceNameConfidence -= 20;
  }

  // Check for practice indicators
  const practiceKeywords = [
    'dental', 'dentistry', 'orthodontic', 'pediatric', 'cosmetic',
    'medical', 'clinic', 'practice', 'office', 'center', 'health'
  ];
  
  const domainHasPracticeKeyword = practiceKeywords.some(keyword => 
    domain.toLowerCase().includes(keyword)
  );
  
  const titleHasPracticeKeyword = practiceKeywords.some(keyword => 
    title.toLowerCase().includes(keyword)
  );

  if (domainHasPracticeKeyword) {
    indicators.push('Practice-related domain');
    practiceNameConfidence += 30;
  }

  if (titleHasPracticeKeyword) {
    indicators.push('Practice keywords in title');
    practiceNameConfidence += 20;
  }

  // Check for practice name match
  if (context.knownPracticeName) {
    const practiceName = context.knownPracticeName.toLowerCase();
    const practiceWords = practiceName.split(/\s+/);
    
    // Check domain for practice name
    const domainLower = domain.toLowerCase();
    const domainMatchScore = calculateStringMatch(practiceName, domainLower);
    
    if (domainMatchScore > 0.7) {
      indicators.push('Strong practice name match in domain');
      practiceNameConfidence += 40;
    } else if (domainMatchScore > 0.5) {
      indicators.push('Partial practice name match in domain');
      practiceNameConfidence += 25;
    }

    // Check title for practice name
    const titleLower = title.toLowerCase();
    if (titleLower.includes(practiceName)) {
      indicators.push('Exact practice name in title');
      practiceNameConfidence += 35;
    } else if (practiceWords.every(word => titleLower.includes(word))) {
      indicators.push('All practice name words in title');
      practiceNameConfidence += 25;
    }
  }

  // Check for location match
  if (context.location) {
    const locationLower = context.location.toLowerCase();
    const locationParts = locationLower.split(/[\s,]+/);
    
    const hasLocation = locationParts.some(part => 
      part.length > 2 && (
        title.toLowerCase().includes(part) || 
        description.toLowerCase().includes(part) ||
        url.toLowerCase().includes(part)
      )
    );
    
    if (hasLocation) {
      locationMatch = true;
      indicators.push(`Location match: ${context.location}`);
      practiceNameConfidence += 15;
    }
  }

  // Custom domain check
  const hasCustomDomain = !isDirectory && 
    !domain.includes('wixsite') && 
    !domain.includes('squarespace') &&
    !domain.includes('wordpress.com') &&
    !domain.includes('blogspot');
    
  if (hasCustomDomain) {
    indicators.push('Custom domain (professional)');
    practiceNameConfidence += 20;
  }

  // SSL check
  if (url.startsWith('https://')) {
    indicators.push('Secure (HTTPS)');
    practiceNameConfidence += 5;
  }

  // Homepage check
  const isHomepage = url.endsWith('/') || 
    url.endsWith('.com') || 
    url.endsWith('.org') ||
    !url.includes('/page/') && 
    !url.includes('/blog/') && 
    !url.includes('/profile/');
    
  if (isHomepage) {
    indicators.push('Homepage/main site');
    practiceNameConfidence += 10;
  }

  // Determine if this is a practice website
  isPracticeWebsite = !isDirectory && 
    hasCustomDomain && 
    (domainHasPracticeKeyword || titleHasPracticeKeyword) &&
    practiceNameConfidence > 30;

  // Apply strategy weight
  practiceNameConfidence = Math.round(practiceNameConfidence * (strategy.weight / 100));

  return {
    url,
    domain,
    title,
    description,
    isPracticeWebsite,
    practiceNameConfidence: Math.max(0, Math.min(100, practiceNameConfidence)),
    locationMatch,
    searchStrategy: strategy.description,
    indicators
  };
}

function calculateStringMatch(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (s2.includes(s1)) return 1;
  if (s1.includes(s2)) return 0.9;
  
  // Check for partial matches
  const words1 = s1.split(/\s+/);
  const matchedWords = words1.filter(word => s2.includes(word)).length;
  
  return matchedWords / words1.length;
}

function deduplicateResults(results: PracticeResult[]): PracticeResult[] {
  const seen = new Map<string, PracticeResult>();
  
  for (const result of results) {
    const existing = seen.get(result.domain);
    if (!existing || result.practiceNameConfidence > existing.practiceNameConfidence) {
      seen.set(result.domain, result);
    }
  }
  
  return Array.from(seen.values());
}

function extractPracticeName(results: PracticeResult[], searchTerms?: string): string | null {
  // Look for common practice name patterns in results
  const practiceNames = new Map<string, number>();
  
  for (const result of results) {
    if (!result.isPracticeWebsite) continue;
    
    // Extract from title
    const titleMatch = result.title.match(/^([A-Z][A-Za-z\s&]+(?:Dental|Medical|Clinic|Practice|Center|Health))/);
    if (titleMatch) {
      const name = titleMatch[1].trim();
      practiceNames.set(name, (practiceNames.get(name) || 0) + result.practiceNameConfidence);
    }
    
    // Extract from domain
    const domain = result.domain;
    const domainWords = domain.split('.')[0].split('-');
    if (domainWords.length >= 2) {
      const potentialName = domainWords.map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      
      if (potentialName.length > 3) {
        practiceNames.set(potentialName, (practiceNames.get(potentialName) || 0) + result.practiceNameConfidence / 2);
      }
    }
  }
  
  // Return the most confident practice name
  let bestName: string | null = null;
  let bestScore = 0;
  
  for (const [name, score] of practiceNames.entries()) {
    if (score > bestScore) {
      bestScore = score;
      bestName = name;
    }
  }
  
  return bestName;
}

function generatePracticeRecommendation(results: PracticeResult[], detectedPracticeName: string | null): string {
  const practiceWebsites = results.filter(r => r.isPracticeWebsite);
  
  if (practiceWebsites.length === 0) {
    return 'No practice websites found. Try searching with the exact practice name or contact the office directly for their website.';
  }
  
  const topPractice = practiceWebsites[0];
  
  if (topPractice.practiceNameConfidence > 80) {
    return `High confidence match: ${topPractice.domain} appears to be the official practice website${detectedPracticeName ? ` for ${detectedPracticeName}` : ''}.`;
  }
  
  if (topPractice.practiceNameConfidence > 50) {
    return `Likely match: ${topPractice.domain} may be the practice website. Verify by checking for contact information that matches the practice.`;
  }
  
  return `Possible matches found. The most likely practice website is ${topPractice.domain}. Contact the practice to confirm their official website.`;
}