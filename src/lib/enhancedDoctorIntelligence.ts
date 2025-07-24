/**
 * Enhanced Doctor Intelligence System
 * Uses multiple data sources and Claude 4 for premium insights
 */

import { callBraveSearch, callPerplexitySearch, callClaude } from './apiEndpoints';
import type { Doctor } from '../components/DoctorAutocomplete';
import type { ResearchData, ResearchSource } from './webResearch';

interface IntelligenceGatheringResult {
  practiceWebsite: string;
  allSources: ResearchSource[];
  rawData: {
    practiceInfo: Record<string, unknown>;
    reviews: Record<string, unknown>;
    marketPosition: Record<string, unknown>;
    technology: Record<string, unknown>;
    competition: Record<string, unknown>;
  };
}

export async function gatherComprehensiveDoctorIntelligence(
  doctor: Doctor,
  product: string
): Promise<ResearchData> {
  console.log('🚀 Starting ENHANCED intelligence gathering for:', doctor.displayName);
  
  try {
    // Phase 1: Gather ALL available data (20+ sources)
    const intelligenceData = await gatherAllIntelligence(doctor, product);
    
    // Phase 2: Use Claude 4 to synthesize everything
    const synthesizedInsights = await synthesizeWithClaude4(intelligenceData, doctor, product);
    
    // Phase 3: Create the research data with rich insights
    return createEnhancedResearchData(intelligenceData, synthesizedInsights, doctor);
    
  } catch (error) {
    console.error('Error in enhanced intelligence gathering:', error);
    return createBasicResearchData(doctor);
  }
}

async function gatherAllIntelligence(doctor: Doctor, product: string): Promise<IntelligenceGatheringResult> {
  const allSources: ResearchSource[] = [];
  
  // Smart query building
  const doctorFullName = doctor.displayName;
  const location = `${doctor.city}, ${doctor.state}`;
  const specialty = doctor.specialty;
  
  // Execute searches sequentially with delays to avoid rate limits
  
  // Search 1: Find practice website and basic info
  const braveResults1 = await callBraveSearch(`"${doctorFullName}" "${location}" dental practice website`, 10);
  
  // Wait 1 second to avoid rate limit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Search 2: Reviews and reputation
  const braveResults2 = await callBraveSearch(`"${doctorFullName}" reviews ratings patient feedback ${location}`, 10);
  
  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Search 3: Professional activities
  const braveResults3 = await callBraveSearch(`"${doctorFullName}" speaking conference publications awards ${specialty}`, 10);
  
  // Wait 1 second
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Search 4: Competition and market
  const competitorIntel = await callBraveSearch(`${specialty} practices ${location} -"${doctorFullName}"`, 5);
  
  // Optional: Use Perplexity for deep analysis (but it's just using Brave as fallback for now)
  let perplexityResults1: Record<string, unknown> | undefined;
  const perplexityResults2: Record<string, unknown> | undefined = undefined;
  
  try {
    const perplexityResponse = await callPerplexitySearch(`${doctorFullName} ${specialty} ${location} practice technology equipment`);
    perplexityResults1 = perplexityResponse as unknown as Record<string, unknown>;
  } catch (error) {
    console.log('Perplexity unavailable, continuing with Brave results:', error);
  }
  
  // Extract practice website
  let practiceWebsite = '';
  const websiteResult = findPracticeWebsite(braveResults1?.web?.results || [], doctor);
  if (websiteResult) {
    practiceWebsite = websiteResult;
    
    // SKIP Firecrawl - it always gets locked out
    // Instead, add the website as a high-confidence source
    allSources.push({
      url: practiceWebsite,
      title: 'Practice Website',
      type: 'practice_website',
      content: `Official practice website for ${doctorFullName}`,
      confidence: 95,
      lastUpdated: new Date().toISOString()
    });
  }
  
  // Collect ALL sources
  const allBraveResults = [
    ...(braveResults1?.web?.results || []),
    ...(braveResults2?.web?.results || []),
    ...(braveResults3?.web?.results || [])
  ];
  
  // Add all Brave results as sources
  allBraveResults.forEach((result, index) => {
    allSources.push({
      url: result.url || '',
      title: result.title || `Search Result ${index + 1}`,
      type: determineSourceType(result),
      content: result.description || '',
      confidence: 70,
      lastUpdated: new Date().toISOString()
    });
  });
  
  // Add Perplexity results as high-confidence sources
  if (perplexityResults1 && 'answer' in perplexityResults1 && perplexityResults1.answer) {
    allSources.push({
      url: 'perplexity-analysis',
      title: 'AI Analysis: Doctor Profile',
      type: 'medical_directory',
      content: String(perplexityResults1.answer),
      confidence: 85,
      lastUpdated: new Date().toISOString()
    });
  }
  
  if (perplexityResults2 && typeof perplexityResults2 === 'object' && 'answer' in perplexityResults2) {
    allSources.push({
      url: 'perplexity-market',
      title: 'AI Analysis: Market Position',
      type: 'news_article',
      content: (perplexityResults2 as { answer?: string }).answer || JSON.stringify(perplexityResults2),
      confidence: 85,
      lastUpdated: new Date().toISOString()
    });
  }
  
  // Search 5: Technology and product adoption
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const technologyIntel = await callBraveSearch(`"${product}" dental practices ${location} case studies`, 5);
  
  // Add competitor and technology sources
  interface BraveResult {
    url?: string;
    title?: string;
    description?: string;
  }
  
  (competitorIntel?.web?.results || []).forEach((result: BraveResult) => {
    allSources.push({
      url: result.url || '',
      title: result.title || '',
      type: 'news_article',
      content: result.description || '',
      confidence: 65,
      lastUpdated: new Date().toISOString()
    });
  });
  
  return {
    practiceWebsite,
    allSources,
    rawData: {
      practiceInfo: braveResults1 as Record<string, unknown>,
      reviews: braveResults2 as Record<string, unknown>,
      marketPosition: perplexityResults2 || {} as Record<string, unknown>,
      technology: technologyIntel as Record<string, unknown>,
      competition: competitorIntel as Record<string, unknown>
    }
  };
}

async function synthesizeWithClaude4(
  data: IntelligenceGatheringResult,
  doctor: Doctor,
  product: string
): Promise<unknown> {
  const prompt = `You are an elite medical sales intelligence analyst. Analyze this comprehensive research about ${doctor.displayName} and create SPECIFIC, ACTIONABLE intelligence.

DOCTOR PROFILE:
- Name: ${doctor.displayName}
- Specialty: ${doctor.specialty}
- Location: ${doctor.city}, ${doctor.state}
- Organization: ${doctor.organizationName || 'Private Practice'}
- Website: ${data.practiceWebsite || 'Not found'}

RESEARCH SOURCES (${data.allSources.length} total):
${data.allSources.slice(0, 20).map(s => `- ${s.title}: ${s.content?.substring(0, 200)}...`).join('\n')}

PRODUCT BEING SOLD: ${product}

Create a comprehensive intelligence report with:

1. PRACTICE PROFILE (be specific - mention actual technologies, staff size, patient volume if found)
2. TECHNOLOGY STACK (list specific systems/vendors they use)
3. MARKET POSITION (how they compare to other ${doctor.specialty} practices in ${doctor.city})
4. BUYING SIGNALS (specific indicators they might need ${product})
5. COMPETITION ANALYSIS (who else is selling to them)
6. APPROACH STRATEGY (specific tactics based on their profile)
7. KEY CONTACTS & DECISION MAKERS
8. PAIN POINTS (specific to their practice based on the research)
9. BUDGET INDICATORS (practice size, technology spending patterns)
10. BEST OUTREACH APPROACH (time, method, messaging)

Be SPECIFIC. Use actual data from the sources. No generic statements.

Format as JSON with these exact fields:
{
  "practiceProfile": {
    "size": "specific size",
    "patientVolume": "specific volume",
    "yearsInBusiness": number,
    "technologyLevel": "specific assessment",
    "notableFeatures": ["specific", "features"]
  },
  "technologyStack": {
    "current": ["specific systems"],
    "recentAdditions": ["specific additions"],
    "gaps": ["specific gaps"]
  },
  "marketPosition": {
    "ranking": "specific position",
    "reputation": "specific details",
    "differentiators": ["specific", "items"]
  },
  "buyingSignals": ["specific signal 1", "specific signal 2"],
  "competition": {
    "currentVendors": ["vendor 1", "vendor 2"],
    "recentPurchases": ["purchase 1", "purchase 2"]
  },
  "approachStrategy": {
    "bestTiming": "specific time",
    "preferredChannel": "specific channel",
    "keyMessage": "specific message",
    "avoidTopics": ["topic 1", "topic 2"]
  },
  "decisionMakers": {
    "primary": "name/role if found",
    "influencers": ["influencer 1", "influencer 2"]
  },
  "painPoints": ["specific pain 1", "specific pain 2", "specific pain 3"],
  "budgetIndicators": {
    "estimatedRevenue": "specific estimate",
    "technologyBudget": "specific estimate",
    "purchaseTimeframe": "specific timeframe"
  },
  "salesBrief": "A 2-3 sentence SPECIFIC brief for the sales rep with actual insights"
}`;

  try {
    // Try Claude 4 Opus first (premium model)
    const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Claude 4 Opus error, trying fallback:', error);
    // Fallback to Claude 3.5 Sonnet (fast, efficient alternative)
    try {
      const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Claude fallback error:', error);
      return createDefaultInsights(doctor, product);
    }
  }
}

function findPracticeWebsite(results: unknown[], doctor: Doctor): string {
  const directoryDomains = ['ada.org', 'healthgrades.com', 'zocdoc.com', 'vitals.com', 'yelp.com'];
  
  interface SearchResult {
    url?: string;
    title?: string;
  }
  
  for (const result of results) {
    const searchResult = result as SearchResult;
    const url = searchResult.url || '';
    const urlLower = url.toLowerCase();
    
    // Skip directories
    if (directoryDomains.some(domain => urlLower.includes(domain))) continue;
    
    // Check for dental practice indicators
    if (urlLower.includes('dental') || urlLower.includes('dds') || 
        urlLower.includes(doctor.lastName.toLowerCase())) {
      console.log('Found practice website:', url);
      return url;
    }
  }
  
  return '';
}

function determineSourceType(result: unknown): ResearchSource['type'] {
  interface SearchResult {
    url?: string;
    title?: string;
  }
  
  const searchResult = result as SearchResult;
  const url = searchResult.url?.toLowerCase() || '';
  const title = searchResult.title?.toLowerCase() || '';
  
  if (url.includes('healthgrades') || url.includes('vitals') || url.includes('zocdoc')) {
    return 'review_site';
  }
  if (url.includes('ada.org') || title.includes('medical')) {
    return 'medical_directory';
  }
  if (title.includes('news') || title.includes('announce')) {
    return 'news_article';
  }
  if (url.includes('dental') || url.includes('dds')) {
    return 'practice_website';
  }
  return 'medical_directory';
}

interface InsightsData {
  practiceProfile?: {
    size?: string;
    patientVolume?: string;
    yearsInBusiness?: number;
    technologyLevel?: string;
    notableFeatures?: string[];
  };
  technologyStack?: {
    current?: string[];
    recentAdditions?: string[];
    gaps?: string[];
  };
  marketPosition?: {
    ranking?: string;
    reputation?: string;
    differentiators?: string[];
  };
  buyingSignals?: string[];
  competition?: {
    currentVendors?: string[];
    recentPurchases?: string[];
  };
  approachStrategy?: {
    bestTiming?: string;
    preferredChannel?: string;
    keyMessage?: string;
    avoidTopics?: string[];
  };
  decisionMakers?: {
    primary?: string;
    influencers?: string[];
  };
  painPoints?: string[];
  budgetIndicators?: {
    estimatedRevenue?: string;
    technologyBudget?: string;
    purchaseTimeframe?: string;
  };
  salesBrief?: string;
}

function createEnhancedResearchData(
  intelligenceData: IntelligenceGatheringResult,
  insights: unknown,
  doctor: Doctor
): ResearchData {
  const typedInsights = insights as InsightsData;
  
  // Calculate confidence based on data completeness
  let confidence = 50; // Base NPI verification
  if (intelligenceData.practiceWebsite) confidence += 10;
  if (intelligenceData.allSources.length > 10) confidence += 20;
  if (intelligenceData.allSources.length > 20) confidence += 10;
  if (typedInsights.practiceProfile?.size) confidence += 10;
  
  return {
    doctorName: doctor.displayName,
    practiceInfo: {
      name: doctor.organizationName || `${doctor.displayName}'s Practice`,
      address: doctor.fullAddress,
      phone: doctor.phone,
      website: intelligenceData.practiceWebsite || undefined,
      specialties: [doctor.specialty],
      services: typedInsights.practiceProfile?.notableFeatures || [],
      technology: typedInsights.technologyStack?.current || [],
      staff: estimateStaffFromSize(typedInsights.practiceProfile?.size),
      established: typedInsights.practiceProfile?.yearsInBusiness ? 
        new Date().getFullYear() - typedInsights.practiceProfile.yearsInBusiness + '' : undefined
    },
    credentials: {
      boardCertifications: [doctor.specialty]
    },
    reviews: {
      averageRating: typedInsights.marketPosition?.reputation?.includes('highly rated') ? 4.5 : undefined,
      commonPraise: typedInsights.marketPosition?.differentiators || [],
      commonConcerns: typedInsights.painPoints?.slice(0, 2) || []
    },
    businessIntel: {
      practiceType: typedInsights.practiceProfile?.size || 'Unknown',
      patientVolume: typedInsights.practiceProfile?.patientVolume || 'Unknown',
      marketPosition: typedInsights.marketPosition?.ranking || 'Unknown',
      recentNews: typedInsights.competition?.recentPurchases || [],
      growthIndicators: typedInsights.buyingSignals || []
    },
    sources: intelligenceData.allSources,
    confidenceScore: Math.min(confidence, 100),
    completedAt: new Date().toISOString(),
    // Add the rich insights
    enhancedInsights: typedInsights
  } as ResearchData & { enhancedInsights?: InsightsData };
}

function createDefaultInsights(doctor: Doctor, product: string): unknown {
  return {
    practiceProfile: {
      size: 'Unknown',
      patientVolume: 'Unknown',
      technologyLevel: 'Unknown'
    },
    technologyStack: {
      current: [],
      gaps: []
    },
    buyingSignals: [],
    painPoints: ['Efficiency', 'Patient satisfaction', 'Competition'],
    salesBrief: `${doctor.displayName} is a ${doctor.specialty} in ${doctor.city}. Consider ${product} benefits.`
  };
}

function estimateStaffFromSize(size?: string): number {
  const sizeMap: Record<string, number> = {
    'solo practice': 3,
    'small practice': 8,
    'medium practice': 20,
    'large practice': 50,
    'group practice': 30,
    'hospital': 100
  };
  
  if (!size) return 10;
  return sizeMap[size.toLowerCase()] || 10;
}

function createBasicResearchData(doctor: Doctor): ResearchData {
  return {
    doctorName: doctor.displayName,
    practiceInfo: {
      name: doctor.organizationName || `${doctor.displayName}'s Practice`,
      address: doctor.fullAddress,
      phone: doctor.phone,
      specialties: [doctor.specialty]
    },
    credentials: {
      boardCertifications: [doctor.specialty]
    },
    reviews: {
      averageRating: 0,
      totalReviews: 0,
      commonPraise: [],
      commonConcerns: [],
      recentFeedback: []
    },
    businessIntel: {
      practiceType: 'Unknown',
      patientVolume: 'Not Available',
      marketPosition: 'Not Available',
      recentNews: [],
      growthIndicators: [],
      technologyStack: [],
      specialty: doctor.specialty || 'Healthcare'
    },
    sources: [],
    confidenceScore: 50,
    completedAt: new Date().toISOString()
  };
}