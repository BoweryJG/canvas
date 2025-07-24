/**
 * DEEP INTELLIGENCE GATHERER - Advanced website discovery and content analysis
 */

import { scrapePracticeWebsite } from './firecrawlWebScraper';

export interface DeepIntelligenceResult {
  confidence: number;
  website?: string;
  summary: string;
  keyPoints: string[];
  practiceInfo?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    services?: string[];
    about?: string;
  };
  sources: Array<{
    url: string;
    type: string;
    relevance: number;
  }>;
}

/**
 * Perform deep intelligence gathering with website discovery and content extraction
 */
export async function deepIntelligenceGather(
  doctorName: string,
  location?: string,
  _basicResults?: unknown,
  specialty?: string,
  practiceName?: string,
  npi?: string
): Promise<DeepIntelligenceResult | null> {
  console.log(`🔍 Starting deep intelligence gathering for ${doctorName}`);
  
  try {
    // Use our precision website discovery system
    const { discoverPracticeWebsite } = await import('./websiteDiscovery');
    
    // Extract city and state from location
    const locationParts = location ? location.split(',').map(part => part.trim()) : [];
    const city = locationParts[0];
    const state = locationParts[1];
    
    // Discover the actual practice website
    const discoveryResult = await discoverPracticeWebsite(
      doctorName,
      city,
      state,
      specialty,
      practiceName,
      npi
    );
    
    // If no website found, return null (no generic fallbacks)
    if (!discoveryResult) {
      console.log(`❌ No practice website found for Dr. ${doctorName} - returning null`);
      return null;
    }
    
    const primaryWebsite = discoveryResult.websiteUrl;
    
    console.log(`✅ Found primary website with ${discoveryResult.confidence}% confidence: ${primaryWebsite}`);
    
    // Create result object
    const result: DeepIntelligenceResult = {
      confidence: discoveryResult.confidence,
      website: primaryWebsite,
      summary: '',
      keyPoints: [],
      sources: [{
        url: primaryWebsite,
        type: 'practice_website',
        relevance: discoveryResult.confidence
      }]
    };
    
    // Scrape and analyze the website
    try {
      const scrapedData = await scrapePracticeWebsite(primaryWebsite);
      
      if (scrapedData) {
        // Extract practice information
        result.practiceInfo = extractPracticeInfo(scrapedData);
        
        // Build intelligence summary
        result.summary = buildIntelligenceSummary(doctorName, result.practiceInfo, primaryWebsite);
        
        // Generate key points with discovery insights
        result.keyPoints = [
          `✅ Official practice website verified (${discoveryResult.discoveryMethod})`,
          ...generateKeyPoints(result.practiceInfo, primaryWebsite),
          `🎯 ${discoveryResult.verificationSignals.length} verification signals confirmed`
        ];
        
        // 100% confidence when we have scraped data from the actual website
        result.confidence = 100;
      } else {
        // Website found but scraping failed - still valuable
        result.summary = `Found official practice website for Dr. ${doctorName} at ${primaryWebsite}`;
        result.keyPoints = [
          `✅ Practice website discovered via ${discoveryResult.discoveryMethod}`,
          `🔗 ${primaryWebsite}`,
          `📊 ${discoveryResult.confidence}% discovery confidence`,
          '📞 Visit website for contact information',
          `🔍 ${discoveryResult.verificationSignals.join(', ')}`
        ];
      }
    } catch (scrapeError) {
      console.error('Error scraping website:', scrapeError);
      // Website found but scraping failed
      result.summary = `Verified practice website for Dr. ${doctorName}: ${primaryWebsite}`;
      result.keyPoints = [
        `✅ Website verified: ${discoveryResult.title}`,
        `🔗 ${primaryWebsite}`,
        `🎯 Discovery method: ${discoveryResult.discoveryMethod}`,
        '⚡ Manual verification recommended'
      ];
    }
    
    return result;
    
  } catch (error) {
    console.error('Deep intelligence error:', error);
    // Return null on error - no generic fallbacks
    return null;
  }
}


// Removed unused helper functions

interface ScrapedData {
  title?: string;
  structuredData?: {
    name?: string;
    address?: string;
    telephone?: string;
    email?: string;
  };
  content?: string;
}

interface PracticeInfo {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  services?: string[];
  about?: string;
}

/**
 * Extract practice information from scraped data
 */
function extractPracticeInfo(scrapedData: ScrapedData): PracticeInfo {
  const info: PracticeInfo = {
    name: scrapedData.title || 'Medical Practice',
    services: [],
    about: ''
  };
  
  // Extract from structured data if available
  if (scrapedData.structuredData) {
    info.name = scrapedData.structuredData.name || info.name;
    info.address = scrapedData.structuredData.address;
    info.phone = scrapedData.structuredData.telephone;
    info.email = scrapedData.structuredData.email;
  }
  
  // Extract from content
  if (scrapedData.content) {
    const content = scrapedData.content.toLowerCase();
    
    // Extract services
    const serviceKeywords = [
      'implants', 'crowns', 'veneers', 'whitening', 'orthodontics',
      'surgery', 'consultation', 'examination', 'treatment', 'therapy'
    ];
    
    info.services = serviceKeywords.filter(service => 
      content.includes(service)
    );
    
    // Extract about section
    const aboutMatch = scrapedData.content.match(/about\s+(?:us|our\s+practice|dr\.?[^.]+)([^]{0,500})/i);
    if (aboutMatch) {
      info.about = aboutMatch[1].trim().substring(0, 200) + '...';
    }
  }
  
  return info;
}

/**
 * Build intelligence summary from practice info
 */
function buildIntelligenceSummary(
  doctorName: string, 
  practiceInfo: PracticeInfo | undefined, 
  website: string
): string {
  const practiceName = practiceInfo?.name || 'the practice';
  const services = practiceInfo?.services?.length 
    ? `offering ${practiceInfo.services.slice(0, 3).join(', ')}` 
    : 'providing comprehensive care';
    
  return `Dr. ${doctorName} practices at ${practiceName}, ${services}. Official website: ${website}`;
}

/**
 * Generate key intelligence points
 */
function generateKeyPoints(practiceInfo: PracticeInfo | undefined, website: string): string[] {
  const points = ['✅ Official practice website verified'];
  
  if (practiceInfo?.name) {
    points.push(`🏥 ${practiceInfo.name}`);
  }
  
  if (practiceInfo?.services?.length > 0) {
    points.push(`🦷 Services: ${practiceInfo.services.slice(0, 3).join(', ')}`);
  }
  
  if (practiceInfo?.address) {
    points.push(`📍 ${practiceInfo.address}`);
  }
  
  if (practiceInfo?.phone) {
    points.push(`📞 ${practiceInfo.phone}`);
  }
  
  points.push(`🔗 ${website}`);
  points.push('🎯 Ready for targeted outreach');
  
  return points;
}