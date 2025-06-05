import { Handler } from '@netlify/functions';

interface ComprehensiveVerificationRequest {
  doctorName: string;
  npi?: string;
  searchHints?: {
    practiceName?: string;
    location?: string;
    specialty?: string;
    previousSearchTerms?: string[];
  };
  verificationDepth?: 'quick' | 'standard' | 'deep';
}

interface VerificationSource {
  type: 'npi' | 'web' | 'social' | 'practice';
  confidence: number;
  data: any;
  timestamp: string;
}

interface ComprehensiveVerificationResult {
  verificationId: string;
  verificationStatus: 'verified' | 'likely' | 'unverified' | 'suspicious';
  overallConfidence: number;
  doctor: {
    name: string;
    npi?: string;
    specialty?: string;
    credentials?: string;
  };
  practice: {
    name: string | null;
    website: string | null;
    websiteVerified: boolean;
    phone?: string;
    address?: string;
    socialMedia?: {
      platform: string;
      url: string;
      verified: boolean;
    }[];
  };
  verificationSources: VerificationSource[];
  verificationFlags: {
    hasOfficialWebsite: boolean;
    npiVerified: boolean;
    locationConfirmed: boolean;
    multipleSourcesAgree: boolean;
    recentlyUpdated: boolean;
  };
  recommendations: string[];
  userConfirmationNeeded: {
    question: string;
    options: string[];
  } | null;
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
    const request: ComprehensiveVerificationRequest = JSON.parse(event.body || '{}');
    const { doctorName, npi, searchHints, verificationDepth = 'standard' } = request;

    if (!doctorName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Doctor name is required' })
      };
    }

    console.log(`🔍 Comprehensive verification for: ${doctorName}, Depth: ${verificationDepth}`);

    const verificationId = generateVerificationId();
    const verificationSources: VerificationSource[] = [];

    // Step 1: NPI Registry Verification
    let npiData = null;
    if (npi || verificationDepth !== 'quick') {
      npiData = await verifyThroughNPI(doctorName, npi, searchHints?.location);
      if (npiData) {
        verificationSources.push({
          type: 'npi',
          confidence: npiData.exactMatch ? 95 : 75,
          data: npiData,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Step 2: Practice Website Discovery
    const practiceSearchData = await findPracticeWebsite({
      doctorName,
      practiceName: searchHints?.practiceName || npiData?.organizationName,
      location: searchHints?.location || npiData?.location,
      previousSearchTerms: searchHints?.previousSearchTerms
    });

    if (practiceSearchData) {
      verificationSources.push({
        type: 'practice',
        confidence: practiceSearchData.confidence,
        data: practiceSearchData,
        timestamp: new Date().toISOString()
      });
    }

    // Step 3: Web Presence Verification (if standard or deep)
    let webVerificationData = null;
    if (verificationDepth !== 'quick') {
      webVerificationData = await verifyWebPresence({
        doctorName,
        practiceName: practiceSearchData?.practiceName || searchHints?.practiceName,
        location: searchHints?.location || npiData?.location
      });

      if (webVerificationData) {
        verificationSources.push({
          type: 'web',
          confidence: webVerificationData.confidence,
          data: webVerificationData,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Step 4: Social Media Verification (if deep)
    let socialMediaData = null;
    if (verificationDepth === 'deep') {
      socialMediaData = await verifySocialMedia({
        doctorName,
        practiceName: practiceSearchData?.practiceName || searchHints?.practiceName
      });

      if (socialMediaData) {
        verificationSources.push({
          type: 'social',
          confidence: socialMediaData.confidence,
          data: socialMediaData,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Compile comprehensive results
    const result = compileVerificationResults({
      verificationId,
      doctorName,
      npiData,
      practiceSearchData,
      webVerificationData,
      socialMediaData,
      verificationSources,
      searchHints
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Comprehensive verification error:', error);
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

async function verifyThroughNPI(
  doctorName: string, 
  providedNPI?: string,
  location?: string
): Promise<any> {
  try {
    const searchParams = new URLSearchParams();
    
    if (providedNPI) {
      searchParams.append('number', providedNPI);
    } else {
      const nameParts = doctorName.split(/\s+/);
      searchParams.append('first_name', nameParts[0]);
      if (nameParts.length > 1) {
        searchParams.append('last_name', nameParts[nameParts.length - 1]);
      }
      if (location) {
        // Extract state from location
        const stateMatch = location.match(/\b([A-Z]{2})\b/);
        if (stateMatch) {
          searchParams.append('state', stateMatch[1]);
        }
      }
    }
    
    searchParams.append('version', '2.1');
    searchParams.append('limit', '10');

    const response = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?${searchParams}`
    );

    if (!response.ok) {
      throw new Error('NPI API error');
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) {
      return null;
    }

    // Find best match
    const bestMatch = findBestNPIMatch(results, doctorName, location);
    
    if (bestMatch) {
      const basic = bestMatch.basic || {};
      const address = bestMatch.addresses?.find((a: any) => a.address_purpose === 'LOCATION') || {};
      const taxonomy = bestMatch.taxonomies?.find((t: any) => t.primary) || {};

      return {
        npi: bestMatch.number,
        fullName: `${basic.first_name} ${basic.last_name}`,
        credential: basic.credential,
        specialty: taxonomy.desc,
        organizationName: basic.organization_name,
        location: address.city && address.state ? `${address.city}, ${address.state}` : null,
        phone: address.telephone_number,
        address: address.address_1,
        exactMatch: calculateNameMatch(doctorName, `${basic.first_name} ${basic.last_name}`) > 0.9
      };
    }

    return null;
  } catch (error) {
    console.error('NPI verification error:', error);
    return null;
  }
}

async function findPracticeWebsite(params: {
  doctorName: string;
  practiceName?: string;
  location?: string;
  previousSearchTerms?: string[];
}): Promise<any> {
  try {
    // Call our practice finder function
    const practiceFinderUrl = process.env.URL 
      ? `${process.env.URL}/.netlify/functions/practice-finder`
      : 'http://localhost:8888/.netlify/functions/practice-finder';

    const searchTerms = params.practiceName 
      ? `${params.practiceName} ${params.doctorName}`
      : params.doctorName;

    const response = await fetch(practiceFinderUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchTerms,
        knownPracticeName: params.practiceName,
        location: params.location,
        includeAlternativeSearches: true
      })
    });

    if (!response.ok) {
      throw new Error('Practice finder error');
    }

    const data = await response.json();
    
    if (data.primaryPracticeWebsite) {
      return {
        practiceName: data.detectedPracticeName,
        website: data.primaryPracticeWebsite.url,
        domain: data.primaryPracticeWebsite.domain,
        confidence: data.primaryPracticeWebsite.confidence,
        indicators: data.primaryPracticeWebsite.indicators
      };
    }

    return null;
  } catch (error) {
    console.error('Practice website search error:', error);
    return null;
  }
}

async function verifyWebPresence(params: {
  doctorName: string;
  practiceName?: string;
  location?: string;
}): Promise<any> {
  try {
    // Call our doctor verification function
    const verificationUrl = process.env.URL 
      ? `${process.env.URL}/.netlify/functions/doctor-verification`
      : 'http://localhost:8888/.netlify/functions/doctor-verification';

    const response = await fetch(verificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorName: params.doctorName,
        practiceName: params.practiceName,
        location: params.location
      })
    });

    if (!response.ok) {
      throw new Error('Doctor verification error');
    }

    const data = await response.json();
    
    return {
      verified: data.verified,
      confidence: data.confidence === 'high' ? 90 : data.confidence === 'medium' ? 60 : 30,
      primaryWebsite: data.primaryWebsite,
      topResults: data.allResults?.slice(0, 3)
    };
  } catch (error) {
    console.error('Web presence verification error:', error);
    return null;
  }
}

async function verifySocialMedia(params: {
  doctorName: string;
  practiceName?: string;
}): Promise<any> {
  try {
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY || 'BSAe5JOYNgM9vHXnme_VZ1BQKBVkuv-';
    
    // Search for social media presence
    const query = params.practiceName 
      ? `"${params.practiceName}" "${params.doctorName}" site:facebook.com OR site:instagram.com OR site:linkedin.com`
      : `"${params.doctorName}" dentist OR doctor site:facebook.com OR site:instagram.com OR site:linkedin.com`;

    const searchUrl = new URL('https://api.search.brave.com/res/v1/web/search');
    searchUrl.searchParams.append('q', query);
    searchUrl.searchParams.append('count', '10');

    const response = await fetch(searchUrl.toString(), {
      headers: {
        'X-Subscription-Token': BRAVE_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Social media search error');
    }

    const data = await response.json();
    const results = data.web?.results || [];

    const socialProfiles = results
      .filter((r: any) => {
        const domain = new URL(r.url).hostname;
        return ['facebook.com', 'instagram.com', 'linkedin.com'].some(social => 
          domain.includes(social)
        );
      })
      .map((r: any) => ({
        platform: extractSocialPlatform(r.url),
        url: r.url,
        title: r.title,
        verified: r.title.toLowerCase().includes(params.doctorName.toLowerCase())
      }));

    return {
      profiles: socialProfiles,
      confidence: socialProfiles.some((p: any) => p.verified) ? 70 : 40
    };
  } catch (error) {
    console.error('Social media verification error:', error);
    return null;
  }
}

function compileVerificationResults(params: any): ComprehensiveVerificationResult {
  const {
    verificationId,
    doctorName,
    npiData,
    practiceSearchData,
    webVerificationData,
    socialMediaData,
    verificationSources,
    searchHints
  } = params;

  // Calculate overall confidence
  const confidenceScores = verificationSources.map(s => s.confidence);
  const overallConfidence = confidenceScores.length > 0
    ? Math.round(confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length)
    : 0;

  // Determine verification status
  let verificationStatus: 'verified' | 'likely' | 'unverified' | 'suspicious' = 'unverified';
  
  if (overallConfidence >= 85 && npiData && practiceSearchData?.website) {
    verificationStatus = 'verified';
  } else if (overallConfidence >= 65) {
    verificationStatus = 'likely';
  } else if (overallConfidence < 30 && verificationSources.length > 2) {
    verificationStatus = 'suspicious';
  }

  // Compile doctor information
  const doctor = {
    name: doctorName,
    npi: npiData?.npi,
    specialty: npiData?.specialty || searchHints?.specialty,
    credentials: npiData?.credential
  };

  // Compile practice information
  const practice = {
    name: practiceSearchData?.practiceName || npiData?.organizationName || null,
    website: practiceSearchData?.website || webVerificationData?.primaryWebsite?.url || null,
    websiteVerified: practiceSearchData?.confidence > 80 || false,
    phone: npiData?.phone,
    address: npiData?.address,
    socialMedia: socialMediaData?.profiles?.map((p: any) => ({
      platform: p.platform,
      url: p.url,
      verified: p.verified
    })) || []
  };

  // Set verification flags
  const verificationFlags = {
    hasOfficialWebsite: !!practice.website && practice.websiteVerified,
    npiVerified: !!npiData?.exactMatch,
    locationConfirmed: !!(npiData?.location || practiceSearchData?.indicators?.includes('Location match')),
    multipleSourcesAgree: verificationSources.length >= 2 && overallConfidence > 70,
    recentlyUpdated: true // All verifications are fresh
  };

  // Generate recommendations
  const recommendations = generateRecommendations({
    verificationStatus,
    overallConfidence,
    verificationFlags,
    practice
  });

  // Determine if user confirmation is needed
  const userConfirmationNeeded = generateUserConfirmation({
    verificationStatus,
    practice,
    verificationSources
  });

  return {
    verificationId,
    verificationStatus,
    overallConfidence,
    doctor,
    practice,
    verificationSources,
    verificationFlags,
    recommendations,
    userConfirmationNeeded
  };
}

function generateRecommendations(params: any): string[] {
  const { verificationStatus, overallConfidence, verificationFlags, practice } = params;
  const recommendations: string[] = [];

  if (verificationStatus === 'verified') {
    recommendations.push('✓ Doctor and practice verified with high confidence');
    if (practice.website) {
      recommendations.push(`✓ Official website confirmed: ${practice.website}`);
    }
  } else if (verificationStatus === 'likely') {
    recommendations.push('Doctor identity likely verified, but additional confirmation recommended');
    if (!practice.website) {
      recommendations.push('Contact the practice directly to confirm their official website');
    }
  } else if (verificationStatus === 'unverified') {
    recommendations.push('Unable to fully verify doctor identity');
    recommendations.push('Request additional information such as practice name or NPI number');
  } else if (verificationStatus === 'suspicious') {
    recommendations.push('⚠️ Verification returned inconsistent results');
    recommendations.push('Exercise caution and verify through official channels');
  }

  if (!verificationFlags.hasOfficialWebsite && practice.name) {
    recommendations.push(`Search for "${practice.name}" official website directly`);
  }

  if (!verificationFlags.npiVerified) {
    recommendations.push('Consider verifying NPI number through cms.gov');
  }

  return recommendations;
}

function generateUserConfirmation(params: any): any {
  const { verificationStatus, practice, verificationSources } = params;

  if (verificationStatus === 'verified') {
    return null; // No confirmation needed
  }

  if (practice.name && !practice.websiteVerified) {
    return {
      question: `Is "${practice.name}" the correct practice name?`,
      options: [
        'Yes, this is correct',
        'No, different practice',
        'Not sure'
      ]
    };
  }

  if (verificationSources.length === 0) {
    return {
      question: 'Unable to find verification information. What additional details can you provide?',
      options: [
        'I know the practice name',
        'I have the NPI number',
        'I know the location',
        'Skip verification'
      ]
    };
  }

  return null;
}

function generateVerificationId(): string {
  return `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function findBestNPIMatch(results: any[], doctorName: string, location?: string): any {
  let bestMatch = null;
  let bestScore = 0;

  for (const result of results) {
    const basic = result.basic || {};
    const fullName = `${basic.first_name} ${basic.last_name}`;
    
    let score = calculateNameMatch(doctorName, fullName);
    
    // Boost score if location matches
    if (location && result.addresses) {
      const hasLocationMatch = result.addresses.some((addr: any) => 
        addr.city?.toLowerCase().includes(location.toLowerCase()) ||
        location.toLowerCase().includes(addr.city?.toLowerCase())
      );
      if (hasLocationMatch) {
        score += 0.2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = result;
    }
  }

  return bestScore > 0.6 ? bestMatch : null;
}

function calculateNameMatch(name1: string, name2: string): number {
  const n1 = name1.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const n2 = name2.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  
  let matches = 0;
  for (const part1 of n1) {
    if (n2.some(part2 => part2.includes(part1) || part1.includes(part2))) {
      matches++;
    }
  }
  
  return matches / Math.max(n1.length, n2.length);
}

function extractSocialPlatform(url: string): string {
  const domain = new URL(url).hostname;
  if (domain.includes('facebook.com')) return 'Facebook';
  if (domain.includes('instagram.com')) return 'Instagram';
  if (domain.includes('linkedin.com')) return 'LinkedIn';
  return 'Unknown';
}