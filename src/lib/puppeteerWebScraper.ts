/**
 * Puppeteer-based Web Scraper
 * Uses Puppeteer MCP to scrape and analyze practice websites
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
 * Scrape a practice website using Puppeteer
 */
export async function scrapePracticeWebsite(url: string): Promise<ScrapedWebsiteData | null> {
  try {
    console.log(`🕷️ Scraping website: ${url}`);
    
    // Navigate to the website
    await window.mcpClient.call('mcp__puppeteer__puppeteer_navigate', { url });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract all the data we need
    const pageData = await window.mcpClient.call('mcp__puppeteer__puppeteer_evaluate', {
      script: `
        // Helper function to extract text safely
        function getText(selector) {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : '';
        }
        
        function getAllText(selector) {
          return Array.from(document.querySelectorAll(selector)).map(el => el.textContent.trim()).filter(t => t);
        }
        
        // Extract contact information
        const phoneRegex = /\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}/g;
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/g;
        
        const bodyText = document.body.innerText;
        const phones = bodyText.match(phoneRegex) || [];
        const emails = bodyText.match(emailRegex) || [];
        
        // Extract services (look for common patterns)
        const serviceKeywords = ['implants', 'surgery', 'extraction', 'crown', 'bridge', 'cleaning', 'whitening', 'orthodontics', 'periodontics', 'endodontics', 'prosthodontics', 'cosmetic', 'veneers', 'root canal'];
        const services = [];
        serviceKeywords.forEach(keyword => {
          if (bodyText.toLowerCase().includes(keyword)) {
            services.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
          }
        });
        
        // Extract technology mentions
        const techKeywords = ['YOMI', 'robotic', 'digital', 'CAD/CAM', 'CEREC', 'cone beam', 'CBCT', 'laser', '3D', 'intraoral scanner', 'iTero', 'Invisalign'];
        const technologies = [];
        techKeywords.forEach(tech => {
          if (bodyText.toLowerCase().includes(tech.toLowerCase())) {
            technologies.push(tech);
          }
        });
        
        // Extract social media links
        const socialLinks = {
          facebook: '',
          instagram: '',
          linkedin: '',
          twitter: ''
        };
        
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.href.toLowerCase();
          if (href.includes('facebook.com')) socialLinks.facebook = link.href;
          if (href.includes('instagram.com')) socialLinks.instagram = link.href;
          if (href.includes('linkedin.com')) socialLinks.linkedin = link.href;
          if (href.includes('twitter.com')) socialLinks.twitter = link.href;
        });
        
        // Extract staff names (look for Dr., DDS, DMD, etc.)
        const staffRegex = /Dr\\.?\\s+[A-Z][a-z]+\\s+[A-Z][a-z]+|[A-Z][a-z]+\\s+[A-Z][a-z]+,?\\s+(DDS|DMD|MD)/g;
        const staff = Array.from(new Set(bodyText.match(staffRegex) || []));
        
        // Try to find testimonials
        const testimonialSelectors = ['.testimonial', '.review', '[class*="testimonial"]', '[class*="review"]', 'blockquote'];
        let testimonials = [];
        for (const selector of testimonialSelectors) {
          const found = getAllText(selector);
          if (found.length > 0) {
            testimonials = found.slice(0, 5); // Limit to 5
            break;
          }
        }
        
        // Detect tech stack
        const techStackIndicators = {
          'WordPress': ['wp-content', 'wp-includes', 'wordpress'],
          'Wix': ['wix.com', 'wixstatic'],
          'Squarespace': ['squarespace.com', 'sqsp.net'],
          'React': ['react', '_app.js', 'jsx'],
          'Vue': ['vue', 'v-if', 'v-for'],
          'jQuery': ['jquery', '$(', 'jQuery'],
          'Bootstrap': ['bootstrap', 'col-md', 'container-fluid'],
          'Google Analytics': ['google-analytics', 'gtag', 'ga('],
          'Google Maps': ['maps.google', 'maps.googleapis']
        };
        
        const detectedTech = [];
        const pageSource = document.documentElement.innerHTML;
        Object.entries(techStackIndicators).forEach(([tech, indicators]) => {
          if (indicators.some(indicator => pageSource.includes(indicator))) {
            detectedTech.push(tech);
          }
        });
        
        return {
          title: document.title,
          description: getText('meta[name="description"]') || getText('meta[property="og:description"]'),
          phones: phones.slice(0, 2),
          emails: emails.filter(e => !e.includes('example.com')).slice(0, 2),
          services,
          technologies,
          socialLinks,
          staff,
          testimonials,
          techStack: detectedTech,
          address: getText('[class*="address"]') || getText('[itemtype*="PostalAddress"]'),
          // Try to extract hours
          hours: getAllText('[class*="hours"]').concat(getAllText('[class*="schedule"]')).slice(0, 7)
        };
      `
    });
    
    // Take a screenshot for reference
    await window.mcpClient.call('mcp__puppeteer__puppeteer_screenshot', {
      name: `practice-website-${Date.now()}`,
      width: 1200,
      height: 800
    });
    
    // Parse and structure the data
    const data: ScrapedWebsiteData = {
      url,
      title: pageData.title,
      description: pageData.description,
      services: pageData.services || [],
      technologies: pageData.technologies || [],
      contactInfo: {
        phone: pageData.phones?.[0],
        email: pageData.emails?.[0],
        address: pageData.address,
        hours: pageData.hours || []
      },
      socialMedia: pageData.socialLinks || {},
      staff: pageData.staff || [],
      testimonials: pageData.testimonials || [],
      techStack: pageData.techStack || [],
      practiceInfo: {
        specialties: [],
        insuranceAccepted: [],
        languages: []
      }
    };
    
    console.log(`✅ Successfully scraped ${url}`);
    return data;
    
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Find and verify practice website URL
 */
export async function findPracticeWebsite(doctorName: string, location?: string): Promise<string | null> {
  try {
    // First try common patterns
    const cleanName = doctorName.toLowerCase().replace(/^dr\.?\s*/i, '').replace(/\s+/g, '');
    const possibleUrls = [
      `https://www.${cleanName}dental.com`,
      `https://www.${cleanName}dds.com`,
      `https://www.dr${cleanName}.com`,
      `https://www.${cleanName}.com`
    ];
    
    // Try location-based URLs if location provided
    if (location) {
      const cleanLocation = location.toLowerCase().replace(/[^a-z]/g, '');
      possibleUrls.push(
        `https://www.${cleanName}${cleanLocation}.com`,
        `https://www.${cleanLocation}${cleanName}.com`
      );
    }
    
    // Google search for the practice
    console.log(`🔍 Searching for ${doctorName} practice website...`);
    await window.mcpClient.call('mcp__puppeteer__puppeteer_navigate', {
      url: `https://www.google.com/search?q="${doctorName}"${location ? ` ${location}` : ''} dental practice website`
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract search results
    const searchResults = await window.mcpClient.call('mcp__puppeteer__puppeteer_evaluate', {
      script: `
        const results = [];
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.href;
          const text = link.textContent;
          // Filter for likely practice websites
          if (href && !href.includes('google.com') && !href.includes('youtube.com') && 
              !href.includes('facebook.com') && !href.includes('yelp.com') &&
              (text.toLowerCase().includes('dental') || text.toLowerCase().includes('dds') || 
               text.toLowerCase().includes('practice') || href.includes('.com'))) {
            results.push({
              url: href,
              text: text
            });
          }
        });
        return results.slice(0, 10);
      `
    });
    
    // Check the most likely candidates
    if (searchResults && searchResults.length > 0) {
      for (const result of searchResults) {
        if (result.url && result.url.includes('.com') && !result.url.includes('?')) {
          console.log(`✅ Found likely practice website: ${result.url}`);
          return result.url;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding practice website:', error);
    return null;
  }
}

// Add this to window for global access
if (typeof window !== 'undefined') {
  (window as any).puppeteerWebScraper = {
    scrapePracticeWebsite,
    findPracticeWebsite
  };
}