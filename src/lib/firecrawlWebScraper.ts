/**
 * Firecrawl-based Web Scraper
 * Uses Firecrawl API to scrape and analyze practice websites
 */

export interface ScrapedWebsiteData {
  url: string;
  title?: string;
  description?: string;
  services: string[];
  technologies: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
    hours?: string[];
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  staff: string[];
  testimonials: string[];
  techStack: string[];
  practiceInfo: {
    established?: string;
    specialties?: string[];
    insuranceAccepted?: string[];
    languages?: string[];
  };
}

/**
 * Call our own scraper service on Render
 */
async function callScraper(url: string): Promise<any> {
  try {
    // Use environment variable or fallback to localhost for dev
    const SCRAPER_URL = process.env.VITE_SCRAPER_URL || 'http://localhost:3000';
    
    const response = await fetch(`${SCRAPER_URL}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });

    if (!response.ok) {
      throw new Error(`Scraper error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Scraper API error:', error);
    throw error;
  }
}

/**
 * Scrape a practice website using Firecrawl
 */
export async function scrapePracticeWebsite(url: string): Promise<ScrapedWebsiteData | null> {
  try {
    console.log(`🕷️ Scraping website with Canvas Scraper: ${url}`);
    
    const result = await callScraper(url);
    
    if (!result.success || !result.data) {
      console.error('No content returned from scraper');
      return null;
    }
    
    // Transform the scraper data to our format
    const data = result.data;
    const scrapedData: ScrapedWebsiteData = {
      url,
      title: data.title || '',
      description: data.metaDescription || '',
      services: data.services || [],
      technologies: data.technologies || [],
      contactInfo: {
        phone: data.phones?.[0],
        email: data.emails?.[0],
        address: data.address,
        hours: data.hours || []
      },
      socialMedia: {
        ...data.socialLinks,
        instagram: data.socialLinks?.instagramHandle || data.socialLinks?.instagram
      },
      staff: data.staff || [],
      testimonials: [],
      techStack: [],
      practiceInfo: {
        specialties: data.focusAreas || [],
        insuranceAccepted: [],
        languages: []
      }
    };
    
    console.log(`✅ Successfully scraped ${url}`);
    return scrapedData;
    
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Find practice website from search results
 */
export async function findPracticeWebsite(
  _doctorName: string, 
  searchResults?: any[]
): Promise<string | null> {
  
  // Check search results for actual practice websites
  if (searchResults && searchResults.length > 0) {
    for (const result of searchResults) {
      const url = result.url || result.link;
      if (!url) continue;
      
      // Skip directory sites
      const directoryDomains = [
        'yelp.com', 'healthgrades.com', 'zocdoc.com', 
        'vitals.com', 'ratemds.com', 'yellowpages.com',
        'facebook.com', 'linkedin.com', 'doximity.com'
      ];
      
      const isDirectory = directoryDomains.some(domain => 
        url.includes(domain)
      );
      
      if (!isDirectory && url.includes('.com')) {
        console.log(`✅ Found likely practice website: ${url}`);
        return url;
      }
    }
  }
  
  return null;
}