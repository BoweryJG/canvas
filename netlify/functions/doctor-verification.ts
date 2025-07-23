import { Handler } from '@netlify/functions';

// Scoring weights for different verification signals
const SCORING_WEIGHTS = {
  practiceWebsite: 40,          // Highest weight for actual practice websites
  practiceNameMatch: 20,        // Matching practice name is crucial
  customDomain: 15,            // Custom domains indicate real practices
  locationMatch: 10,           // Location verification
  socialMedia: 5,              // Secondary verification
  directoryListing: 5,         // Low weight for directories
  sslCertificate: 3,          // Security indicator
  contactInfo: 2              // Having contact info
};

// Known directory domains to deprioritize
const DIRECTORY_DOMAINS = [
  'healthgrades.com',
  'vitals.com',
  'zocdoc.com',
  'webmd.com',
  'ratemds.com',
  'wellness.com',
  'yelp.com',
  'yellowpages.com',
  'findadoctor.com',
  'doctor.com',
  'npiprofile.com',
  'npino.com',
  'docinfo.org'
];

// Social media domains for secondary verification
const SOCIAL_MEDIA_DOMAINS = [
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'youtube.com'
];

interface VerificationResult {
  url: string;
  domain: string;
  title: string;
  description: string;
  score: number;
  signals: {
    isPracticeWebsite: boolean;
    practiceNameMatch: boolean;
    hasCustomDomain: boolean;
    locationMatch: boolean;
    isSocialMedia: boolean;
    isDirectory: boolean;
    hasSSL: boolean;
    hasContactInfo: boolean;
  };
  confidence: 'high' | 'medium' | 'low';
  verificationDetails: string[];
}

interface DoctorVerificationRequest {
  doctorName: string;
  practiceName?: string;
  location?: string;
  specialty?: string;
}

export const handler: Handler = async (event) => {
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
    const request: DoctorVerificationRequest = JSON.parse(event.body || '{}');
    const { doctorName, practiceName, location, specialty } = request;

    if (!doctorName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Doctor name is required' })
      };
    }

    console.log(`🔍 Verifying doctor: ${doctorName}, Practice: ${practiceName || 'N/A'}, Location: ${location || 'N/A'}`);

    // Build search query prioritizing practice name if available
    let searchQuery = doctorName;
    if (practiceName) {
      searchQuery = `"${practiceName}" ${doctorName}`;
    }
    if (location) {
      searchQuery += ` ${location}`;
    }
    if (specialty && !practiceName) {
      searchQuery += ` ${specialty}`;
    }

    // Perform web search
    const searchResults = await performWebSearch(searchQuery);
    
    // Analyze and score each result
    const verificationResults: VerificationResult[] = [];
    
    for (const result of searchResults) {
      const verification = await analyzeSearchResult(result, {
        doctorName,
        practiceName,
        location,
        specialty
      });
      verificationResults.push(verification);
    }

    // Sort by score (highest first)
    verificationResults.sort((a, b) => b.score - a.score);

    // Get the top result for primary verification
    const primaryVerification = verificationResults[0];
    
    // Look for social media verification
    const socialMediaVerification = verificationResults.find(r => r.signals.isSocialMedia);
    
    // Compile verification summary
    const verificationSummary = {
      verified: primaryVerification && primaryVerification.confidence === 'high',
      confidence: primaryVerification?.confidence || 'low',
      primaryWebsite: primaryVerification && !primaryVerification.signals.isDirectory 
        ? {
            url: primaryVerification.url,
            domain: primaryVerification.domain,
            score: primaryVerification.score,
            verificationDetails: primaryVerification.verificationDetails
          }
        : null,
      socialMediaPresence: socialMediaVerification 
        ? {
            platform: extractPlatformName(socialMediaVerification.domain),
            url: socialMediaVerification.url
          }
        : null,
      allResults: verificationResults.slice(0, 10), // Top 10 results
      recommendedAction: generateRecommendation(verificationResults)
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(verificationSummary)
    };

  } catch (error) {
    console.error('Doctor verification error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Verification failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};

interface WebSearchResult {
  url: string;
  title?: string;
  description?: string;
}

async function performWebSearch(query: string): Promise<WebSearchResult[]> {
  const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAe5JOYNgM9vHXnme_VZ1BQKBVkuv-';
  
  const searchUrl = new URL('https://api.search.brave.com/res/v1/web/search');
  searchUrl.searchParams.append('q', query);
  searchUrl.searchParams.append('count', '20'); // Get more results for better analysis
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
  return data.web?.results || [];
}

async function analyzeSearchResult(
  result: WebSearchResult,
  context: {
    doctorName: string;
    practiceName?: string;
    location?: string;
    specialty?: string;
  }
): Promise<VerificationResult> {
  const url = result.url;
  const domain = new URL(url).hostname.replace('www.', '');
  const title = result.title || '';
  const description = result.description || '';
  
  // Initialize signals
  const signals = {
    isPracticeWebsite: false,
    practiceNameMatch: false,
    hasCustomDomain: false,
    locationMatch: false,
    isSocialMedia: false,
    isDirectory: false,
    hasSSL: false,
    hasContactInfo: false
  };
  
  const verificationDetails: string[] = [];
  let score = 0;

  // Check if it's a directory site
  signals.isDirectory = DIRECTORY_DOMAINS.some(dir => domain.includes(dir));
  if (signals.isDirectory) {
    verificationDetails.push('Directory listing (lower priority)');
    score += SCORING_WEIGHTS.directoryListing;
  }

  // Check if it's social media
  signals.isSocialMedia = SOCIAL_MEDIA_DOMAINS.some(social => domain.includes(social));
  if (signals.isSocialMedia) {
    verificationDetails.push('Social media presence');
    score += SCORING_WEIGHTS.socialMedia;
  }

  // Check for custom domain (not a subdomain of a known service)
  signals.hasCustomDomain = !signals.isDirectory && !signals.isSocialMedia && 
    !domain.includes('wixsite.com') && !domain.includes('squarespace.com') &&
    !domain.includes('weebly.com') && !domain.includes('wordpress.com');
  
  if (signals.hasCustomDomain) {
    verificationDetails.push('Custom domain (likely real practice)');
    score += SCORING_WEIGHTS.customDomain;
  }

  // Check for practice name match
  if (context.practiceName) {
    const practiceNameLower = context.practiceName.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    const domainLower = domain.toLowerCase();
    
    // Check various forms of the practice name
    const practiceWords = practiceNameLower.split(/\s+/);
    const practiceNameVariations = [
      practiceNameLower,
      practiceNameLower.replace(/\s+/g, ''),
      practiceWords.join('-'),
      practiceWords.join('')
    ];
    
    signals.practiceNameMatch = practiceNameVariations.some(variation => 
      titleLower.includes(variation) || 
      descLower.includes(variation) || 
      domainLower.includes(variation)
    );
    
    if (signals.practiceNameMatch) {
      verificationDetails.push(`Practice name "${context.practiceName}" found`);
      score += SCORING_WEIGHTS.practiceNameMatch;
      
      // Extra points if practice name is in domain
      if (domainLower.includes(practiceWords[0]) || domainLower.includes(practiceNameLower.replace(/\s+/g, ''))) {
        verificationDetails.push('Practice name in domain');
        score += 10; // Bonus points
      }
    }
  }

  // Determine if this is likely a practice website
  const practiceIndicators = [
    'dental', 'medical', 'clinic', 'practice', 'office', 'center', 'health',
    'orthodontic', 'pediatric', 'family', 'cosmetic', 'implant'
  ];
  
  const hasPracticeIndicator = practiceIndicators.some(indicator => 
    domain.includes(indicator) || title.toLowerCase().includes(indicator)
  );
  
  signals.isPracticeWebsite = signals.hasCustomDomain && 
    (signals.practiceNameMatch || hasPracticeIndicator) && 
    !signals.isDirectory;
  
  if (signals.isPracticeWebsite) {
    verificationDetails.push('Identified as practice website');
    score += SCORING_WEIGHTS.practiceWebsite;
  }

  // Check for location match
  if (context.location) {
    const locationLower = context.location.toLowerCase();
    const locationWords = locationLower.split(/[\s,]+/).filter(w => w.length > 2);
    
    signals.locationMatch = locationWords.some(word => 
      title.toLowerCase().includes(word) || 
      description.toLowerCase().includes(word) ||
      url.toLowerCase().includes(word)
    );
    
    if (signals.locationMatch) {
      verificationDetails.push(`Location "${context.location}" confirmed`);
      score += SCORING_WEIGHTS.locationMatch;
    }
  }

  // Check for SSL
  signals.hasSSL = url.startsWith('https://');
  if (signals.hasSSL) {
    verificationDetails.push('Secure website (HTTPS)');
    score += SCORING_WEIGHTS.sslCertificate;
  }

  // Check for contact info in description
  const contactPatterns = [
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/, // Phone number
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd)/ // Address
  ];
  
  signals.hasContactInfo = contactPatterns.some(pattern => 
    pattern.test(description) || pattern.test(title)
  );
  
  if (signals.hasContactInfo) {
    verificationDetails.push('Contact information found');
    score += SCORING_WEIGHTS.contactInfo;
  }

  // Check if doctor name appears
  const doctorNameParts = context.doctorName.toLowerCase().split(/\s+/);
  const doctorNameFound = doctorNameParts.every(part => 
    title.toLowerCase().includes(part) || description.toLowerCase().includes(part)
  );
  
  if (doctorNameFound) {
    verificationDetails.push(`Doctor name "${context.doctorName}" found`);
    score += 5; // Bonus points
  }

  // Determine confidence level
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (score >= 60) {
    confidence = 'high';
  } else if (score >= 30) {
    confidence = 'medium';
  }

  return {
    url,
    domain,
    title,
    description,
    score,
    signals,
    confidence,
    verificationDetails
  };
}

function extractPlatformName(domain: string): string {
  if (domain.includes('facebook.com')) return 'Facebook';
  if (domain.includes('instagram.com')) return 'Instagram';
  if (domain.includes('linkedin.com')) return 'LinkedIn';
  if (domain.includes('twitter.com')) return 'Twitter/X';
  if (domain.includes('youtube.com')) return 'YouTube';
  return 'Social Media';
}

function generateRecommendation(results: VerificationResult[]): string {
  const topResult = results[0];
  
  if (!topResult) {
    return 'No verification results found. Please provide more information about the practice.';
  }

  if (topResult.confidence === 'high' && topResult.signals.isPracticeWebsite) {
    return `High confidence: Found practice website at ${topResult.domain}. Recommend verifying contact information directly.`;
  }

  if (topResult.confidence === 'medium') {
    return `Medium confidence: Best match is ${topResult.domain}. Consider calling the practice directly to confirm.`;
  }

  const hasDirectory = results.some(r => r.signals.isDirectory);
  if (hasDirectory) {
    return 'Only directory listings found. Request the practice name to find their official website.';
  }

  return 'Low confidence results. More information needed about the practice name and location.';
}