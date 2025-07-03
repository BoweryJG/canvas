/**
 * UNIFIED INTELLIGENCE CORE
 * Single source of truth for all intelligence gathering
 * Two-step process that populates ALL tabs
 */

import { callBraveSearch } from './apiEndpoints';
import { analyzeWebsitesWithClaude4Opus } from './aiWebsiteAnalyzer';
import { scrapePracticeWebsite } from './firecrawlWebScraper';
import { searchDoctorsByName } from './npiLookup';

export interface UnifiedIntelligenceResult {
  // Step 1: Discovery
  discovery: {
    practiceWebsite: string | null;
    confidence: number;
    organizationName?: string;
    npiData?: any;
    rejectedSites?: string[];
    discoveryMethod: string;
  };
  
  // Step 2: Intelligence
  intelligence: {
    practiceInfo: {
      name: string;
      services: string[];
      technologies: string[];
      teamSize?: number;
      socialMedia?: any;
    };
    insights: string[];
    opportunities: string[];
    painPoints: string[];
    competitiveAdvantage: string[];
  };
  
  // Instant results for quick display
  instant: {
    summary: string;
    keyPoints: string[];
    confidence: number;
  };
  
  // Timing
  timingMs: {
    discovery: number;
    intelligence: number;
    total: number;
  };
}

/**
 * THE ONE AND ONLY INTELLIGENCE FUNCTION
 * Handles everything from NPI lookup to final intelligence
 */
export async function gatherUnifiedIntelligence(
  doctorName: string,
  productName: string,
  location?: string
): Promise<UnifiedIntelligenceResult> {
  const startTime = Date.now();
  const result: UnifiedIntelligenceResult = {
    discovery: {
      practiceWebsite: null,
      confidence: 0,
      discoveryMethod: 'none',
      rejectedSites: []
    },
    intelligence: {
      practiceInfo: {
        name: '',
        services: [],
        technologies: [],
        socialMedia: {}
      },
      insights: [],
      opportunities: [],
      painPoints: [],
      competitiveAdvantage: []
    },
    instant: {
      summary: `Scanning for Dr. ${doctorName}...`,
      keyPoints: ['🔍 Searching...', '📊 Loading...', '🏥 Processing...'],
      confidence: 25
    },
    timingMs: {
      discovery: 0,
      intelligence: 0,
      total: 0
    }
  };

  try {
    // ========== STEP 1: SMART DISCOVERY ==========
    console.log(`🎯 Starting UNIFIED intelligence for Dr. ${doctorName}`);
    const discoveryStart = Date.now();
    
    // 1a. NPI Lookup for accurate data
    let npiData = null;
    let organizationName = '';
    let specialty = '';
    
    try {
      const npiResults = await searchDoctorsByName(doctorName);
      if (npiResults.length > 0) {
        npiData = npiResults[0];
        organizationName = npiData.organizationName || '';
        specialty = npiData.specialty || '';
        console.log(`✅ NPI Data found: ${organizationName || 'Individual Practice'}`);
      }
    } catch (error) {
      console.log('NPI lookup failed, continuing without it');
    }
    
    // 1b. Build smart search queries prioritizing organization name
    const searchQueries = buildPrioritizedSearchQueries(
      doctorName,
      organizationName,
      location,
      specialty
    );
    
    // 1c. Execute searches and collect results
    const allSearchResults: any[] = [];
    const seenUrls = new Set<string>();
    
    for (const query of searchQueries) {
      console.log(`🔍 Searching: "${query}"`);
      try {
        const results = await callBraveSearch(query, 20);
        if (results?.web?.results) {
          for (const result of results.web.results) {
            if (!seenUrls.has(result.url)) {
              seenUrls.add(result.url);
              allSearchResults.push(result);
            }
          }
        }
      } catch (error) {
        console.log(`Search failed for: ${query}`);
      }
    }
    
    console.log(`📊 Found ${allSearchResults.length} unique results`);
    
    // 1d. Use Claude 4 Opus to find the REAL practice website
    const aiAnalysis = await analyzeWebsitesWithClaude4Opus(
      allSearchResults,
      doctorName,
      organizationName,  // This is key - "Pure Dental" for Dr. Greg White
      specialty,
      location?.split(',')[0],  // city
      location?.split(',')[1]   // state
    );
    
    // Update discovery results
    result.discovery = {
      practiceWebsite: aiAnalysis.practiceWebsites[0]?.url || null,
      confidence: aiAnalysis.practiceWebsites[0]?.confidence || 0,
      organizationName,
      npiData,
      rejectedSites: aiAnalysis.rejectedSites.map(r => r.url),
      discoveryMethod: 'ai-powered'
    };
    
    result.timingMs.discovery = Date.now() - discoveryStart;
    
    if (!result.discovery.practiceWebsite) {
      console.log('❌ No practice website found');
      result.instant = {
        summary: `No practice website found for Dr. ${doctorName}`,
        keyPoints: [
          '❌ Unable to locate practice website',
          '📍 Try adding more location details',
          '🔍 Rejected ' + aiAnalysis.rejectedSites.length + ' directory/media sites'
        ],
        confidence: 0
      };
      result.timingMs.total = Date.now() - startTime;
      return result;
    }
    
    console.log(`✅ Found practice website: ${result.discovery.practiceWebsite}`);
    
    // ========== STEP 2: DEEP INTELLIGENCE ==========
    const intelligenceStart = Date.now();
    
    try {
      // Scrape the actual practice website
      const scrapedData = await scrapePracticeWebsite(result.discovery.practiceWebsite);
      
      if (scrapedData) {
        // Extract real intelligence
        result.intelligence = {
          practiceInfo: {
            name: scrapedData.title || organizationName || `Dr. ${doctorName}'s Practice`,
            services: scrapedData.services || [],
            technologies: Object.keys(scrapedData.techStack || {}).filter(k => scrapedData.techStack[k]),
            teamSize: scrapedData.teamMembers?.length,
            socialMedia: scrapedData.socialMedia || {}
          },
          insights: generateInsights(scrapedData, productName),
          opportunities: generateOpportunities(scrapedData, productName),
          painPoints: identifyPainPoints(scrapedData),
          competitiveAdvantage: identifyAdvantages(scrapedData)
        };
        
        // Update instant results with real data
        result.instant = {
          summary: `${result.intelligence.practiceInfo.name} - Verified Practice Website`,
          keyPoints: [
            `✅ Official website: ${result.discovery.practiceWebsite}`,
            `🏥 ${result.intelligence.practiceInfo.name}`,
            `💼 ${result.intelligence.practiceInfo.services.length} services offered`,
            `🔧 ${result.intelligence.practiceInfo.technologies.length} technologies in use`,
            `📊 ${result.discovery.confidence}% confidence score`
          ],
          confidence: 100
        };
      } else {
        // Website found but couldn't scrape - still valuable
        result.instant = {
          summary: `Found ${organizationName || 'practice'} website`,
          keyPoints: [
            `✅ Practice website: ${result.discovery.practiceWebsite}`,
            `🏥 ${organizationName || doctorName + ' Practice'}`,
            `📊 ${result.discovery.confidence}% discovery confidence`,
            '🔗 Visit website for full details'
          ],
          confidence: result.discovery.confidence
        };
      }
    } catch (error) {
      console.error('Intelligence extraction error:', error);
    }
    
    result.timingMs.intelligence = Date.now() - intelligenceStart;
    result.timingMs.total = Date.now() - startTime;
    
    console.log(`✅ Intelligence gathering complete in ${result.timingMs.total}ms`);
    
    return result;
    
  } catch (error) {
    console.error('Unified intelligence error:', error);
    result.timingMs.total = Date.now() - startTime;
    return result;
  }
}

/**
 * Build prioritized search queries using organization name first
 */
function buildPrioritizedSearchQueries(
  doctorName: string,
  organizationName: string,
  location?: string,
  specialty?: string
): string[] {
  const queries: string[] = [];
  const lastName = doctorName.replace(/^Dr\.\s*/i, '').split(' ').pop() || '';
  
  // PRIORITY 1: Organization name (like "Pure Dental")
  if (organizationName) {
    queries.push(`"${organizationName}" ${location || ''}`);
    queries.push(`"${organizationName}" "${doctorName}"`);
    
    // Try direct domain search
    const orgClean = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '');
    queries.push(`site:${orgClean}.com OR site:www.${orgClean}.com`);
  }
  
  // PRIORITY 2: Doctor + location
  queries.push(`"Dr. ${doctorName}" ${location || ''} ${specialty || ''}`);
  
  // PRIORITY 3: Practice patterns
  if (lastName && specialty?.includes('dent')) {
    queries.push(`"${lastName} dental" ${location || ''}`);
  }
  
  return queries.slice(0, 5); // Top 5 queries only
}

/**
 * Generate insights based on scraped data and product
 */
function generateInsights(scrapedData: any, productName: string): string[] {
  const insights: string[] = [];
  
  if (scrapedData.services?.length > 5) {
    insights.push('Full-service practice with comprehensive offerings');
  }
  
  if (scrapedData.techStack?.patientPortal) {
    insights.push('Technology-forward practice with patient portal');
  }
  
  if (scrapedData.acceptingNewPatients) {
    insights.push('Growing practice actively accepting new patients');
  }
  
  if (productName.toLowerCase().includes('yomi') && scrapedData.services?.some((s: string) => 
    s.toLowerCase().includes('implant'))) {
    insights.push('Already offers implant services - perfect fit for YOMI');
  }
  
  return insights;
}

/**
 * Generate opportunities based on practice data
 */
function generateOpportunities(scrapedData: any, productName: string): string[] {
  const opportunities: string[] = [];
  
  if (!scrapedData.techStack?.practiceManagement) {
    opportunities.push('Opportunity to modernize practice management');
  }
  
  if (productName.includes('YOMI') && !scrapedData.services?.some((s: string) => 
    s.toLowerCase().includes('robot') || s.toLowerCase().includes('guided'))) {
    opportunities.push('No robotic surgery offerings - YOMI would be differentiator');
  }
  
  return opportunities;
}

/**
 * Identify pain points from practice data
 */
function identifyPainPoints(scrapedData: any): string[] {
  const painPoints: string[] = [];
  
  if (!scrapedData.onlineBooking) {
    painPoints.push('No online booking system detected');
  }
  
  if (!scrapedData.socialMedia?.instagram && !scrapedData.socialMedia?.facebook) {
    painPoints.push('Limited social media presence');
  }
  
  return painPoints;
}

/**
 * Identify competitive advantages
 */
function identifyAdvantages(scrapedData: any): string[] {
  const advantages: string[] = [];
  
  if (scrapedData.reviews?.average >= 4.5) {
    advantages.push(`High patient satisfaction (${scrapedData.reviews.average}/5)`);
  }
  
  if (scrapedData.teamMembers?.length > 10) {
    advantages.push('Large, established team');
  }
  
  return advantages;
}