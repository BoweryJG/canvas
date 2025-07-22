/**
 * AI Website Analyzer using Claude 4 Opus
 * Intelligently analyzes search results to identify actual practice websites
 * Filters out directories, podcasts, media sites, and other non-practice sites
 */

import { callAnthropicInsteadOfOpenRouter } from './directAnthropic';

export interface AnalyzedWebsite {
  url: string;
  confidence: number;
  reason: string;
  isPrimaryWebsite: boolean;
  signals: string[];
}

export interface WebsiteAnalysisResult {
  practiceWebsites: AnalyzedWebsite[];
  rejectedSites: Array<{
    url: string;
    reason: string;
  }>;
  analysisConfidence: number;
}

/**
 * Analyze search results using Claude 4 Opus to find actual practice websites
 */
export async function analyzeWebsitesWithClaude4Opus(
  searchResults: any[],
  doctorName: string,
  organizationName?: string,
  specialty?: string,
  city?: string,
  state?: string
): Promise<WebsiteAnalysisResult> {
  
  // Extract last name for better matching
  const cleanName = doctorName.replace(/^Dr\.\s*/i, '').trim();
  const lastName = cleanName.split(' ').pop() || cleanName;
  
  const prompt = `You are an expert at identifying medical/dental practice websites. Analyze these search results to find the ACTUAL practice website for Dr. ${doctorName}.

CRITICAL CONTEXT:
${organizationName ? `- The practice/organization name from NPI database is: "${organizationName}" (e.g., "Pure Dental")` : ''}
${specialty ? `- Specialty: ${specialty}` : ''}
${city && state ? `- Location: ${city}, ${state}` : ''}
- Doctor's last name: ${lastName}

ACCEPTANCE CRITERIA for practice websites:
1. Must be the actual practice/clinic website (not directories or aggregators)
2. Domain should ideally contain practice name or doctor's last name
3. Should have practice information, services, team, contact details
4. Prioritize .com domains with professional appearance
5. If organization name matches domain (e.g., puredental.com for "Pure Dental"), give highest confidence

IMMEDIATE REJECTION criteria:
1. Directory sites (HealthGrades, Vitals, ZocDoc, Yelp, etc.)
2. Podcast platforms (libsyn, spotify, apple podcasts, etc.)
3. Media/video sites (YouTube, Vimeo, etc.)
4. Social media profiles
5. News articles or blog posts ABOUT the doctor
6. Review aggregator sites
7. Hospital/university general pages (unless it's their specific practice page)

SEARCH RESULTS TO ANALYZE:
${JSON.stringify(searchResults.map(r => ({
  url: r.url,
  title: r.title,
  description: r.description
})), null, 2)}

Analyze each result and return a JSON response with this EXACT structure:
{
  "practiceWebsites": [
    {
      "url": "https://example.com",
      "confidence": 95,
      "reason": "Domain matches practice name 'Pure Dental', contains services and team info",
      "isPrimaryWebsite": true,
      "signals": ["domain_matches_practice", "has_services", "has_contact_info", "professional_design"]
    }
  ],
  "rejectedSites": [
    {
      "url": "https://libsyn.com/...",
      "reason": "podcast_platform"
    }
  ],
  "analysisConfidence": 95
}

IMPORTANT: 
- Only include sites with confidence >= 70 in practiceWebsites
- Be very strict about rejecting non-practice sites
- If you find a domain that exactly matches the organization name, it should have 95-100 confidence
- analysisConfidence reflects your overall confidence in the analysis (0-100)`;

  try {
    console.log('🤖 Analyzing websites with Claude 4 Opus...');
    
    const response = await callAnthropicInsteadOfOpenRouter(
      prompt,
      'anthropic/claude-3-opus-20240229'  // Claude 3 Opus
    );
    
    if (!response || !response.choices || !response.choices[0] || !response.choices[0].message) {
      throw new Error('Invalid response structure from Claude');
    }
    
    // Parse the JSON response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in Claude response');
    }
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Claude');
    }
    
    const analysis = JSON.parse(jsonMatch[0]) as WebsiteAnalysisResult;
    
    console.log(`✅ Claude 4 Opus analysis complete:`, {
      practiceWebsitesFound: analysis.practiceWebsites.length,
      sitesRejected: analysis.rejectedSites.length,
      confidence: analysis.analysisConfidence
    });
    
    return analysis;
    
  } catch (error) {
    console.error('❌ Claude 4 Opus analysis error:', error);
    
    // Fallback to basic pattern matching if AI fails
    return fallbackWebsiteAnalysis(searchResults, doctorName, organizationName, lastName);
  }
}

/**
 * Fallback analysis using pattern matching if AI is unavailable
 */
function fallbackWebsiteAnalysis(
  searchResults: any[],
  _doctorName: string,
  organizationName?: string,
  lastName?: string
): WebsiteAnalysisResult {
  const practiceWebsites: AnalyzedWebsite[] = [];
  const rejectedSites: Array<{ url: string; reason: string }> = [];
  
  // Directories and media sites to reject
  const rejectPatterns = [
    'healthgrades', 'vitals', 'zocdoc', 'yelp', 'webmd',
    'libsyn', 'spotify', 'podcast', 'youtube', 'vimeo',
    'facebook', 'linkedin', 'twitter', 'instagram'
  ];
  
  for (const result of searchResults) {
    const urlLower = result.url.toLowerCase();
    let domain: string;
    try {
      domain = new URL(result.url).hostname.toLowerCase();
    } catch {
      // Skip invalid URLs
      continue;
    }
    
    // Check if it's a rejected site
    const isRejected = rejectPatterns.some(pattern => urlLower.includes(pattern));
    
    if (isRejected) {
      rejectedSites.push({
        url: result.url,
        reason: 'directory_or_media_site'
      });
      continue;
    }
    
    // Score the result
    let confidence = 50; // Base confidence
    const signals: string[] = [];
    
    // Check for organization name match (highest confidence)
    if (organizationName) {
      const orgNameClean = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (domain.includes(orgNameClean)) {
        confidence = 95;
        signals.push('domain_matches_organization');
      }
    }
    
    // Check for last name in domain
    if (lastName && domain.includes(lastName.toLowerCase())) {
      confidence = Math.max(confidence, 80);
      signals.push('domain_contains_lastname');
    }
    
    // Check for practice-related keywords
    if (domain.includes('dental') || domain.includes('medical') || domain.includes('clinic')) {
      confidence = Math.max(confidence, 70);
      signals.push('practice_keyword_in_domain');
    }
    
    if (confidence >= 70) {
      practiceWebsites.push({
        url: result.url,
        confidence,
        reason: `Fallback analysis: ${signals.join(', ')}`,
        isPrimaryWebsite: confidence >= 90,
        signals
      });
    }
  }
  
  // Sort by confidence
  practiceWebsites.sort((a, b) => b.confidence - a.confidence);
  
  return {
    practiceWebsites,
    rejectedSites,
    analysisConfidence: 60 // Lower confidence for fallback
  };
}

/**
 * Quick validation to check if a URL is likely a practice website
 */
export function isProbablyPracticeWebsite(url: string): boolean {
  const urlLower = url.toLowerCase();
  
  // Quick reject for known non-practice sites
  const rejectPatterns = [
    'healthgrades', 'vitals', 'zocdoc', 'yelp',
    'libsyn', 'spotify', 'podcast', 'youtube',
    'facebook', 'linkedin', 'twitter'
  ];
  
  if (rejectPatterns.some(pattern => urlLower.includes(pattern))) {
    return false;
  }
  
  // Positive indicators
  const practiceIndicators = [
    'dental', 'medical', 'clinic', 'practice',
    'orthodont', 'pediatric', 'dermatolog',
    'surgery', 'wellness', 'health'
  ];
  
  return practiceIndicators.some(indicator => urlLower.includes(indicator));
}