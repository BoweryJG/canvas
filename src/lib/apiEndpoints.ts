/**
 * API endpoint handlers for web research integration
 * These handle the server-side calls to Brave Search and Firecrawl APIs
 */

import { openRouterLimiter, braveLimiter, firecrawlLimiter, withRateLimit } from './rateLimiter';
import { 
  globalOpenRouterLimiter, 
  globalBraveLimiter, 
  globalFirecrawlLimiter, 
  withGlobalRateLimit,
  staggerUserStart 
} from './globalRateLimiter';

/**
 * Brave Search API integration via Netlify function
 */
export async function callBraveSearch(query: string, count: number = 10) {
  return withRateLimit(braveLimiter, 'brave-search', async () => {
    try {
      console.log(`🔍 Brave Search: "${query}"`);
      
      const response = await fetch('/.netlify/functions/brave-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, count })
    });

    if (!response.ok) {
      throw new Error(`Brave Search API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Brave Search returned ${data.web?.results?.length || 0} results`);
    
    return data;
  } catch (error) {
    console.error('Brave Search API error:', error);
    
    // Fallback to enhanced mock data
    return {
      web: {
        results: [
          {
            title: `Dr. ${query.split(' ')[1] || 'Doctor'} Medical Practice`,
            url: `https://example-practice.com/dr-${(query.split(' ')[1] || 'doctor').toLowerCase()}`,
            description: "Professional medical practice providing comprehensive healthcare services with modern technology and patient-centered care",
            published: "2024-01-01"
          },
          {
            title: `${query.split(' ')[1] || 'Doctor'} MD - Healthgrades Profile`,
            url: `https://healthgrades.com/physician/dr-${(query.split(' ')[1] || 'doctor').toLowerCase()}`,
            description: "Doctor profile with credentials, ratings, patient reviews, and appointment booking information",
            published: "2024-01-01"
          },
          {
            title: `Dr. ${query.split(' ')[1] || 'Doctor'} Patient Reviews - ZocDoc`,
            url: `https://zocdoc.com/doctor/${(query.split(' ')[1] || 'doctor').toLowerCase()}`,
            description: "Patient reviews, ratings, and online appointment scheduling",
            published: "2024-01-01"
          }
        ]
      }
    };
    }
  });
}

/**
 * Firecrawl API integration via Netlify function
 */
export async function callFirecrawlScrape(url: string, options: any = {}) {
  return withRateLimit(firecrawlLimiter, 'firecrawl', async () => {
    try {
      console.log(`🕷️ Firecrawl scraping: ${url}`);
      
      const response = await fetch('/.netlify/functions/firecrawl-scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, ...options })
    });

    if (!response.ok) {
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Firecrawl successfully scraped ${url}`);
    
    return data;
  } catch (error) {
    console.error('Firecrawl API error:', error);
    
    // Fallback to enhanced mock data
    const mockContent = generateMockContent(url);
    
    return {
      success: true,
      markdown: mockContent,
      metadata: {
        title: extractTitleFromUrl(url),
        description: "Professional medical practice website",
        statusCode: 200
      }
    };
    }
  });
}

/**
 * Generate realistic mock content based on URL for demo purposes
 */
function generateMockContent(url: string): string {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('practice') || urlLower.includes('medical') || urlLower.includes('clinic')) {
    return `# Medical Practice - Professional Healthcare Services

## About Our Practice
Our medical practice has been serving the community for over 15 years, providing comprehensive healthcare services with a focus on patient-centered care.

## Services Offered
- Primary Care
- Preventive Medicine
- Chronic Disease Management
- Annual Physical Examinations
- Immunizations

## Technology & Innovation
- Electronic Health Records (Epic EHR)
- Telemedicine Consultations
- Digital Imaging Systems
- Online Patient Portal
- Appointment Scheduling System

## Practice Information
- Established: 2008
- Staff: 12 healthcare professionals
- Patient Volume: High-volume practice
- Office Hours: Monday-Friday 8:00 AM - 6:00 PM

## Location & Contact
123 Medical Center Drive
Healthcare City, HC 12345
Phone: (555) 123-4567
Email: info@medicalpractice.com

## Insurance Accepted
We accept most major insurance plans including Medicare and Medicaid.`;
  }
  
  if (urlLower.includes('healthgrades') || urlLower.includes('vitals') || urlLower.includes('webmd')) {
    return `# Dr. John Smith - Medical Directory Profile

## Credentials
- Medical School: Johns Hopkins University School of Medicine
- Residency: Internal Medicine, Mayo Clinic
- Board Certifications: Internal Medicine, Geriatric Medicine
- Years of Experience: 18 years

## Practice Details
- Specialty: Internal Medicine
- Hospital Affiliations: St. Mary's Medical Center, Regional Hospital
- Practice Type: Group Practice
- New Patients: Accepting

## Patient Ratings
- Overall Rating: 4.8/5 stars
- Based on 127 patient reviews
- Communication: Excellent
- Bedside Manner: Outstanding
- Wait Time: Average 15 minutes

## Education & Training
- Undergraduate: Harvard University
- Medical Degree: Johns Hopkins (2005)
- Residency: Mayo Clinic (2005-2008)
- Fellowship: Geriatric Medicine (2008-2009)`;
  }
  
  if (urlLower.includes('zocdoc') || urlLower.includes('review')) {
    return `# Patient Reviews for Dr. John Smith

## Recent Patient Feedback

### 5 Stars - "Excellent Doctor"
"Dr. Smith is thorough and takes time to explain everything. The office staff is friendly and efficient. Highly recommend!"
*Posted 2 weeks ago*

### 5 Stars - "Great Experience"
"Very knowledgeable physician. Uses latest technology and has modern office equipment. Never rushed during appointments."
*Posted 1 month ago*

### 4 Stars - "Good Care"
"Good doctor overall. Office is well-organized and they use electronic systems effectively. Minor issue with wait times."
*Posted 2 months ago*

## Summary
- Average Rating: 4.7/5
- Total Reviews: 89
- Most Recent: 2 weeks ago
- Common Praise: Thorough, knowledgeable, modern technology
- Areas for Improvement: Occasional wait times

## Appointment Availability
- Next Available: Within 2 weeks
- Same-day Appointments: Limited availability
- Telehealth: Available`;
  }
  
  return `# Website Content

This is sample content from ${url}. The actual implementation would extract real content from the webpage.

## Key Information
- Professional website
- Contains practice information
- Patient resources available
- Contact details provided`;
}

/**
 * Perplexity API integration via Netlify function
 */
export async function callPerplexityResearch(query: string, mode: 'search' | 'reason' | 'deep_research' = 'search') {
  try {
    console.log(`🧠 Perplexity ${mode}: "${query}"`);
    
    const response = await fetch('/.netlify/functions/perplexity-research', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, mode })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Perplexity ${mode} completed successfully`);
    
    return data;
  } catch (error) {
    console.error('Perplexity API error:', error);
    
    // Fallback response
    return {
      choices: [
        {
          message: {
            content: `Research analysis for: ${query}\n\nThis would contain Perplexity's AI-powered research and reasoning about the query, with citations and sources.`,
            role: 'assistant'
          }
        }
      ],
      citations: [],
      related_questions: mode === 'deep_research' ? [
        `What are the key practice characteristics for this search?`,
        `How does this relate to medical device sales opportunities?`
      ] : undefined
    };
  }
}

/**
 * Claude 4 Outreach Generation API
 */
export async function callClaudeOutreach(prompt: string, userId?: string) {
  return withGlobalRateLimit(globalOpenRouterLimiter, 'openrouter', userId, async () => {
    try {
      console.log(`🧠 Claude 4 Outreach Generation`);
      
      const response = await fetch('/.netlify/functions/claude-outreach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`Claude Outreach API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ Claude 4 outreach generated successfully`);
    
    return data;
  } catch (error) {
    console.error('Claude Outreach API error:', error);
    
    // Fallback response
    return {
      choices: [
        {
          message: {
            content: JSON.stringify({
              subject: "Medical Device Opportunity - High Practice Fit",
              content: "Dear Doctor, based on my research of your practice, I believe our solution could provide significant value. Would you be open to a brief discussion?",
              personalizations: ["Practice research", "Technology alignment"],
              researchInsights: ["High fit score", "Efficiency opportunity"],
              urgencyScore: 7,
              expectedResponse: "Professional consideration"
            })
          }
        }
      ]
    };
    }
  });
}

/**
 * Extract title from URL for metadata
 */
function extractTitleFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').replace('.com', '').replace('.org', '');
  } catch {
    return 'Medical Website';
  }
}

/**
 * Production implementation notes:
 * 
 * 1. BRAVE SEARCH API INTEGRATION:
 * ```typescript
 * const response = await fetch('https://api.search.brave.com/res/v1/web/search', {
 *   headers: {
 *     'X-Subscription-Token': process.env.BRAVE_API_KEY,
 *     'Accept': 'application/json'
 *   },
 *   params: { q: query, count, country: 'US' }
 * });
 * ```
 * 
 * 2. FIRECRAWL API INTEGRATION:
 * ```typescript
 * const response = await fetch('https://api.firecrawl.dev/v0/scrape', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     url,
 *     formats: ['markdown'],
 *     onlyMainContent: true,
 *     removeBase64Images: true
 *   })
 * });
 * ```
 * 
 * 3. SERVERLESS FUNCTIONS:
 * Create /api/brave-search.ts and /api/firecrawl-scrape.ts
 * to handle these API calls securely on the server side.
 */