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
    youtube?: string;
    instagramFollowers?: number;
    facebookLikes?: number;
  };
  staff: string[];
  testimonials: string[];
  techStack: {
    cms?: string; // WordPress, Squarespace, etc.
    analytics?: string[]; // Google Analytics, etc.
    marketing?: string[]; // Mailchimp, HubSpot, etc.
    frameworks?: string[]; // React, jQuery, etc.
    hosting?: string; // AWS, GoDaddy, etc.
    other?: string[];
  };
  practiceInfo: {
    established?: string;
    specialties?: string[];
    insuranceAccepted?: string[];
    languages?: string[];
    teamSize?: number;
    awards?: string[];
  };
  recentContent: {
    blogPosts?: Array<{
      title: string;
      date?: string;
      topic?: string;
    }>;
    news?: string[];
    lastUpdated?: string;
  };
  painPoints?: string[]; // Identified from missing features or old tech
  competitiveAdvantages?: string[];
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
    
    // Transform the scraper data to our enhanced format
    const data = result.data;
    
    // Extract tech stack from various signals
    const techStack = extractTechStack(data, url);
    
    // Extract social media with follower counts
    const socialMedia = await extractSocialMediaMetrics(data.socialLinks);
    
    // Extract recent content
    const recentContent = extractRecentContent(data);
    
    // Identify pain points and competitive advantages
    const { painPoints, competitiveAdvantages } = analyzeWebsiteFeatures(data, techStack);
    
    const scrapedData: ScrapedWebsiteData = {
      url,
      title: data.title || '',
      description: data.metaDescription || '',
      services: data.services || extractServices(data.content),
      technologies: data.technologies || [],
      contactInfo: {
        phone: data.phones?.[0],
        email: data.emails?.[0],
        address: data.address,
        hours: data.hours || []
      },
      socialMedia,
      staff: data.staff || extractStaffNames(data.content || ''),
      testimonials: data.testimonials || [],
      techStack,
      practiceInfo: {
        specialties: data.focusAreas || [],
        insuranceAccepted: data.insurance || [],
        languages: data.languages || [],
        teamSize: data.staff?.length || estimateTeamSize(data.content || ''),
        awards: extractAwards(data.content || '')
      },
      recentContent,
      painPoints,
      competitiveAdvantages
    };
    
    console.log(`✅ Successfully scraped ${url} with ${Object.keys(techStack).length} tech stack items`);
    return scrapedData;
    
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Extract technology stack from website data
 */
function extractTechStack(data: any, url: string): ScrapedWebsiteData['techStack'] {
  const techStack: ScrapedWebsiteData['techStack'] = {
    cms: undefined,
    analytics: [],
    marketing: [],
    frameworks: [],
    hosting: undefined,
    other: []
  };
  
  // Detect CMS from various signals
  const content = (data.content || '').toLowerCase();
  const html = (data.html || '').toLowerCase();
  
  // CMS Detection
  if (html.includes('wp-content') || html.includes('wordpress')) {
    techStack.cms = 'WordPress';
  } else if (html.includes('squarespace')) {
    techStack.cms = 'Squarespace';
  } else if (html.includes('wix.com')) {
    techStack.cms = 'Wix';
  } else if (html.includes('shopify')) {
    techStack.cms = 'Shopify';
  } else if (html.includes('drupal')) {
    techStack.cms = 'Drupal';
  } else if (html.includes('joomla')) {
    techStack.cms = 'Joomla';
  }
  
  // Analytics Detection
  if (html.includes('google-analytics') || html.includes('gtag') || html.includes('ga.js')) {
    techStack.analytics?.push('Google Analytics');
  }
  if (html.includes('gtm.js') || html.includes('googletagmanager')) {
    techStack.analytics?.push('Google Tag Manager');
  }
  if (html.includes('facebook.com/tr')) {
    techStack.analytics?.push('Facebook Pixel');
  }
  
  // Marketing Tools
  if (html.includes('mailchimp')) {
    techStack.marketing?.push('Mailchimp');
  }
  if (html.includes('hubspot')) {
    techStack.marketing?.push('HubSpot');
  }
  if (html.includes('activecampaign')) {
    techStack.marketing?.push('ActiveCampaign');
  }
  
  // Frameworks
  if (html.includes('react')) {
    techStack.frameworks?.push('React');
  }
  if (html.includes('jquery')) {
    techStack.frameworks?.push('jQuery');
  }
  if (html.includes('bootstrap')) {
    techStack.frameworks?.push('Bootstrap');
  }
  
  // Hosting Detection (from URL patterns or headers)
  const domain = new URL(url).hostname;
  if (domain.includes('godaddy')) {
    techStack.hosting = 'GoDaddy';
  } else if (data.headers?.['x-powered-by']?.includes('AWS')) {
    techStack.hosting = 'AWS';
  }
  
  return techStack;
}

/**
 * Extract social media links with follower counts
 */
async function extractSocialMediaMetrics(socialLinks: any): Promise<ScrapedWebsiteData['socialMedia']> {
  const social: ScrapedWebsiteData['socialMedia'] = {
    facebook: socialLinks?.facebook,
    instagram: socialLinks?.instagram || socialLinks?.instagramHandle,
    linkedin: socialLinks?.linkedin,
    twitter: socialLinks?.twitter,
    youtube: socialLinks?.youtube
  };
  
  // TODO: In production, you would make API calls to get actual follower counts
  // For now, we'll indicate that this data should be fetched
  if (social.instagram) {
    social.instagramFollowers = 0; // Placeholder - would fetch real data
  }
  if (social.facebook) {
    social.facebookLikes = 0; // Placeholder - would fetch real data
  }
  
  return social;
}

/**
 * Extract recent content like blog posts and news
 */
function extractRecentContent(data: any): ScrapedWebsiteData['recentContent'] {
  const recentContent: ScrapedWebsiteData['recentContent'] = {
    blogPosts: [],
    news: [],
    lastUpdated: undefined
  };
  
  // Extract blog posts from content patterns
  const blogPatterns = [
    /blog.*?<h[23]>(.*?)<\/h[23]>/gi,
    /article.*?title["\s:]+([^"<>]+)/gi,
    /post.*?<h[23]>(.*?)<\/h[23]>/gi
  ];
  
  const content = data.html || data.content || '';
  for (const pattern of blogPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && recentContent.blogPosts!.length < 5) {
        recentContent.blogPosts!.push({
          title: match[1].trim(),
          date: extractNearbyDate(content, match.index || 0)
        });
      }
    }
  }
  
  // Look for news mentions
  const newsPattern = /news|announcement|update|press release/gi;
  const newsMatches = content.match(newsPattern);
  if (newsMatches) {
    recentContent.news = newsMatches.slice(0, 3);
  }
  
  return recentContent;
}

/**
 * Analyze website features to identify pain points and advantages
 */
function analyzeWebsiteFeatures(
  data: any, 
  techStack: ScrapedWebsiteData['techStack']
): { 
  painPoints: string[]; 
  competitiveAdvantages: string[] 
} {
  const painPoints: string[] = [];
  const competitiveAdvantages: string[] = [];
  
  // Check for missing modern features (pain points)
  const content = (data.html || data.content || '').toLowerCase();
  
  if (!content.includes('appointment') && !content.includes('schedule online')) {
    painPoints.push('No online appointment scheduling');
  }
  if (!content.includes('patient portal')) {
    painPoints.push('No patient portal');
  }
  if (!techStack.cms || techStack.cms === 'Static HTML') {
    painPoints.push('Static website - difficult to update');
  }
  if (!techStack.analytics?.length) {
    painPoints.push('No analytics tracking');
  }
  if (!data.socialLinks || Object.keys(data.socialLinks).length === 0) {
    painPoints.push('No social media presence');
  }
  
  // Check for competitive advantages
  if (content.includes('24/7') || content.includes('emergency')) {
    competitiveAdvantages.push('24/7 emergency services');
  }
  if (content.includes('same day') || content.includes('same-day')) {
    competitiveAdvantages.push('Same-day appointments');
  }
  if (techStack.cms === 'WordPress' || techStack.cms === 'Squarespace') {
    competitiveAdvantages.push('Modern CMS for easy updates');
  }
  if (data.testimonials?.length > 10) {
    competitiveAdvantages.push('Strong patient testimonials');
  }
  
  return { painPoints, competitiveAdvantages };
}

/**
 * Helper functions for extraction
 */
function extractServices(content: string): string[] {
  const services: string[] = [];
  const serviceKeywords = [
    'implants', 'crowns', 'veneers', 'whitening', 'orthodontics',
    'root canal', 'extraction', 'cleaning', 'x-ray', 'consultation',
    'cosmetic', 'restoration', 'periodontal', 'pediatric', 'surgery'
  ];
  
  const lowerContent = content.toLowerCase();
  for (const keyword of serviceKeywords) {
    if (lowerContent.includes(keyword)) {
      services.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }
  
  return services;
}

function extractStaffNames(content: string): string[] {
  const staffNames: string[] = [];
  // Look for "Dr." pattern
  const drPattern = /Dr\.\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
  const matches = content.matchAll(drPattern);
  
  for (const match of matches) {
    if (match[1] && !staffNames.includes(match[1])) {
      staffNames.push(match[1]);
    }
  }
  
  return staffNames.slice(0, 10); // Limit to 10 staff members
}

function estimateTeamSize(content: string): number {
  const staffMentions = (content.match(/\b(doctor|dentist|hygienist|assistant|staff|team)\b/gi) || []).length;
  if (staffMentions > 20) return 10; // Large practice
  if (staffMentions > 10) return 5;  // Medium practice
  return 3; // Small practice
}

function extractAwards(content: string): string[] {
  const awards: string[] = [];
  const awardPatterns = [
    /award[^.]*?(\d{4})/gi,
    /best\s+(?:dentist|doctor|practice)[^.]*?(\d{4})/gi,
    /top\s+(?:dentist|doctor|practice)[^.]*?(\d{4})/gi
  ];
  
  for (const pattern of awardPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[0] && awards.length < 5) {
        awards.push(match[0].trim());
      }
    }
  }
  
  return awards;
}

function extractNearbyDate(content: string, position: number): string | undefined {
  // Look for date within 200 characters of the position
  const nearbyContent = content.substring(Math.max(0, position - 100), position + 100);
  const datePattern = /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\w+\s+\d{1,2},?\s+\d{4})/;
  const dateMatch = nearbyContent.match(datePattern);
  return dateMatch ? dateMatch[0] : undefined;
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