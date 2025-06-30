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
 * Call Firecrawl API through our Netlify function
 */
async function callFirecrawl(url: string): Promise<any> {
  try {
    const response = await fetch('/.netlify/functions/firecrawl-scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        removeBase64Images: true
      })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Firecrawl API error:', error);
    throw error;
  }
}

/**
 * Extract practice data from scraped content
 */
function extractPracticeData(content: string, url: string): ScrapedWebsiteData {
  const lowerContent = content.toLowerCase();
  
  // Extract phone numbers
  const phoneRegex = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const phones = content.match(phoneRegex) || [];
  
  // Extract emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = content.match(emailRegex) || [];
  
  // Extract services
  const serviceKeywords = [
    'implants', 'dental implants', 'surgery', 'extraction', 
    'crown', 'bridge', 'cleaning', 'whitening', 'orthodontics', 
    'periodontics', 'endodontics', 'prosthodontics', 'cosmetic', 
    'veneers', 'root canal', 'invisalign', 'braces'
  ];
  const services = serviceKeywords.filter(service => 
    lowerContent.includes(service)
  );
  
  // Extract technologies
  const techKeywords = [
    'YOMI', 'robotic', 'digital', 'CAD/CAM', 'CEREC', 
    'cone beam', 'CBCT', 'laser', '3D', 'intraoral scanner', 
    'iTero', 'Invisalign', 'digital x-ray', 'panoramic'
  ];
  const technologies = techKeywords.filter(tech => 
    lowerContent.includes(tech.toLowerCase())
  );
  
  // Extract social media links
  const socialMedia: any = {};
  if (content.includes('facebook.com/')) {
    const fbMatch = content.match(/facebook\.com\/[\w\-\.]+/);
    if (fbMatch) socialMedia.facebook = `https://www.${fbMatch[0]}`;
  }
  if (content.includes('instagram.com/')) {
    const igMatch = content.match(/instagram\.com\/[\w\-\.]+/);
    if (igMatch) socialMedia.instagram = `https://www.${igMatch[0]}`;
  }
  
  // Extract staff names (Dr., DDS, DMD, etc.)
  const staffRegex = /Dr\.?\s+[A-Z][a-z]+\s+[A-Z][a-z]+|[A-Z][a-z]+\s+[A-Z][a-z]+,?\s+(DDS|DMD|MD)/g;
  const staffMatches = content.match(staffRegex) || [];
  const staff = Array.from(new Set(staffMatches));
  
  // Extract address
  const addressRegex = /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Drive|Dr|Road|Rd)[,\s]+[A-Za-z\s]+,\s*[A-Z]{2}\s+\d{5}/;
  const addressMatch = content.match(addressRegex);
  
  return {
    url,
    title: content.split('\n')[0] || '',
    description: '',
    services,
    technologies,
    contactInfo: {
      phone: phones[0],
      email: emails.filter(e => !e.includes('example.com'))[0],
      address: addressMatch?.[0],
      hours: []
    },
    socialMedia,
    staff,
    testimonials: [],
    techStack: [],
    practiceInfo: {
      specialties: [],
      insuranceAccepted: [],
      languages: []
    }
  };
}

/**
 * Scrape a practice website using Firecrawl
 */
export async function scrapePracticeWebsite(url: string): Promise<ScrapedWebsiteData | null> {
  try {
    console.log(`🕷️ Scraping website with Firecrawl: ${url}`);
    
    const result = await callFirecrawl(url);
    
    if (!result.data || !result.data.markdown) {
      console.error('No content returned from Firecrawl');
      return null;
    }
    
    const scrapedData = extractPracticeData(result.data.markdown, url);
    
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