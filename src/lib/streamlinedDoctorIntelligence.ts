/**
 * @deprecated Use unifiedCanvasResearch() from './unifiedCanvasResearch' instead
 * 
 * Streamlined Doctor Intelligence System
 * Uses Brave Search for data gathering and Claude 4 Opus for analysis
 * Simpler, faster, more cost-effective
 * 
 * MIGRATION: Replace with:
 * import { unifiedCanvasResearch } from './unifiedCanvasResearch';
 * await unifiedCanvasResearch(doctor, product, { mode: 'instant' });
 */

import { callBraveSearch, callBraveLocalSearch, callClaude } from './apiEndpoints';
import { gatherProductIntelligence, combineIntelligence, type ProductIntelligence } from './productProcedureIntelligence';
import type { Doctor } from '../components/DoctorAutocomplete';
import type { ResearchData, ResearchSource } from './webResearch';

// Type definitions for streamlined intelligence
interface BraveSearchResult {
  url: string;
  title: string;
  description: string;
}

interface LocalCompetitor {
  title: string;
  rating: number;
  rating_count: number;
  distance: string;
  address: string;
  url?: string;
  priceRange?: string;
}

interface LocalCompetitorResults {
  results: LocalCompetitor[];
}

interface SearchData {
  sources: ResearchSource[];
  practiceWebsite: string;
}

interface SynthesisResult {
  executiveSummary: string;
  opportunityScore: number;
  scoringRationale?: string;
  practiceProfile: {
    size: string;
    patientVolume?: string;
    yearsInBusiness?: number;
    technologyLevel?: string;
    notableFeatures: string[];
  };
  competitivePosition: {
    marketRank: string;
    strengths: string[];
    vulnerabilities: string[];
    differentiators: string[];
  };
  buyingSignals: string[];
  painPoints: string[];
  salesStrategy: {
    perfectPitch: string;
    channel?: string;
    timing?: string;
    valueProps?: string[];
    objectionHandlers?: Record<string, string>;
  };
  decisionMakers?: {
    primary: string;
    influencers: string[];
  };
  budgetIndicators?: {
    estimatedRevenue: string;
    techBudget: string;
    purchaseTimeframe: string;
  };
  actionItems?: string[];
}

interface StreamlinedProgressCallback {
  updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => void;
  updateSources: (count: number) => void;
  updateConfidence: (score: number) => void;
  updateStage: (stage: string) => void;
}

export async function gatherStreamlinedDoctorIntelligence(
  doctor: Doctor,
  product: string,
  progress?: StreamlinedProgressCallback,
  existingWebsite?: string
): Promise<ResearchData> {
  console.log('🚀 Streamlined intelligence gathering for:', doctor.displayName);
  if (existingWebsite) {
    console.log('Using pre-discovered website:', existingWebsite);
  }
  
  const steps = [
    { id: 'websearch', label: 'Doctor Intelligence Gathering', sublabel: 'Practice info, reviews, news' },
    { id: 'product', label: 'Product/Procedure Research', sublabel: `${product} market analysis` },
    { id: 'competitors', label: 'Local Competitor Analysis', sublabel: 'Real-time local market data' },
    { id: 'synthesis', label: 'Claude 4 Opus Analysis', sublabel: 'Premium intelligence synthesis' }
  ];
  
  // Initialize progress
  steps.forEach(step => progress?.updateStep(step.id, 'pending'));
  
  let searchData: SearchData | null = null;
  
  try {
    // Phase 1: Gather all data with Brave
    progress?.updateStep('websearch', 'active');
    progress?.updateStage('Gathering comprehensive web intelligence...');
    
    searchData = await gatherBraveIntelligence(doctor, product, progress);
    
    // If we have an existing website from NPI research, use it
    if (existingWebsite && !searchData.practiceWebsite) {
      searchData.practiceWebsite = existingWebsite;
      console.log('Using NPI-verified website:', existingWebsite);
    }
    
    progress?.updateStep('websearch', 'completed', `${searchData.sources.length} sources found`);
    
    // Phase 2: Product/Procedure intelligence
    progress?.updateStep('product', 'active');
    progress?.updateStage(`Researching ${product} in local market...`);
    
    let productIntel;
    try {
      productIntel = await gatherProductIntelligence(
        product,
        { city: doctor.city, state: doctor.state },
        doctor.specialty
      );
    } catch (_) {
      console.error('Product intelligence gathering failed:', error);
      productIntel = null;
    }
    
    progress?.updateStep('product', 'completed', 'Market analysis complete');
    
    // Phase 3: Local competitor analysis
    progress?.updateStep('competitors', 'active');
    progress?.updateStage('Analyzing local competitive landscape...');
    
    const localCompetitors = await gatherLocalCompetitors(doctor, progress);
    
    // Phase 4: Try to crawl practice website if found
    if (searchData.practiceWebsite && !searchData.practiceWebsite.includes('sharecare.com')) {
      try {
        progress?.updateStage('Analyzing practice website for deeper insights...');
        const { callFirecrawlScrape } = await import('./apiEndpoints');
        const websiteData = await callFirecrawlScrape(searchData.practiceWebsite, {
          formats: ['markdown'],
          onlyMainContent: true
        });
        
        if (websiteData?.success && websiteData.markdown) {
          // Add this rich data to our sources
          searchData.sources.unshift({
            url: searchData.practiceWebsite,
            title: 'Practice Website - Deep Analysis',
            type: 'practice_website' as const,
            content: websiteData.markdown.substring(0, 5000),
            confidence: 95,
            lastUpdated: new Date().toISOString()
          });
          console.log('✓ Successfully crawled practice website for deep insights');
          progress?.updateSources(searchData.sources.length);
        }
      } catch (_) {
        console.log('Could not crawl website, continuing with search data');
      }
    }
    
    // Phase 5: Claude 4 Opus synthesis
    progress?.updateStep('synthesis', 'active');
    progress?.updateStage('Claude 4 Opus creating premium intelligence...');
    
    const synthesis = await synthesizeWithClaude4Opus(
      searchData,
      productIntel,
      localCompetitors,
      doctor,
      product
    );
    
    progress?.updateStep('synthesis', 'completed', 'Intelligence ready');
    
    // Create final research data
    return createStreamlinedResearchData(
      searchData,
      productIntel,
      localCompetitors,
      synthesis,
      doctor
    );
    
  } catch (_) {
    console.error('Streamlined intelligence error:', error);
    // Try to salvage what we can from the search data
    if (searchData && searchData.sources && searchData.sources.length > 0) {
      // Calculate confidence based on sources found
      let confidence = 50; // Base
      if (searchData.practiceWebsite) confidence += 20;
      if (searchData.sources.length > 10) confidence += 10;
      if (searchData.sources.length > 20) confidence += 10;
      if (searchData.sources.length > 30) confidence += 10;
      
      return {
        doctorName: doctor.displayName,
        practiceInfo: {
          name: doctor.organizationName || `${doctor.displayName}'s Practice`,
          address: doctor.fullAddress,
          phone: doctor.phone,
          website: searchData.practiceWebsite || undefined,
          specialties: [doctor.specialty],
          services: []
        },
        credentials: {
          boardCertifications: [doctor.specialty],
          yearsExperience: undefined
        },
        reviews: {
          averageRating: undefined,
          totalReviews: 0,
          commonPraise: [],
          commonConcerns: [],
          recentFeedback: []
        },
        businessIntel: {
          practiceType: 'Unknown',
          patientVolume: 'Unknown',
          marketPosition: 'Unknown',
          recentNews: [],
          growthIndicators: []
        },
        sources: searchData.sources,
        confidenceScore: Math.min(confidence, 95),
        completedAt: new Date().toISOString()
      };
    }
    return createBasicResearchData(doctor);
  }
}

async function gatherBraveIntelligence(
  doctor: Doctor,
  product: string,
  progress?: StreamlinedProgressCallback
): Promise<{ sources: ResearchSource[], practiceWebsite: string }> {
  const sources: ResearchSource[] = [];
  const location = `${doctor.city}, ${doctor.state}`;
  
  // Execute searches in parallel for speed
  const [practiceSearch, reviewSearch, newsSearch, techSearch] = await Promise.all([
    callBraveSearch(`"${doctor.displayName}" "${location}" dental practice website -directory`, 10),
    callBraveSearch(`"${doctor.displayName}" reviews ratings patient feedback ${location}`, 10),
    callBraveSearch(`"${doctor.displayName}" news announcements ${doctor.specialty}`, 5),
    callBraveSearch(`"${product}" dental technology ${location} case studies`, 5)
  ]);
  
  // Process all results
  const allResults = [
    ...(practiceSearch?.web?.results || []),
    ...(reviewSearch?.web?.results || []),
    ...(newsSearch?.web?.results || []),
    ...(techSearch?.web?.results || [])
  ];
  
  // Find practice website
  const practiceWebsite = findPracticeWebsite(allResults, doctor);
  
  // Convert to sources
  allResults.forEach((result, index) => {
    sources.push({
      url: result.url || '',
      title: result.title || `Result ${index + 1}`,
      type: determineSourceType(result),
      content: result.description || '',
      confidence: 75,
      lastUpdated: new Date().toISOString()
    });
  });
  
  progress?.updateSources(sources.length);
  
  return { sources, practiceWebsite };
}

async function gatherLocalCompetitors(
  doctor: Doctor,
  progress?: StreamlinedProgressCallback
): Promise<LocalCompetitorResults> {
  try {
    const query = `${doctor.specialty} near ${doctor.city}, ${doctor.state}`;
    const results = await callBraveLocalSearch(query, 20);
    
    if (results?.results?.length > 0) {
      progress?.updateStep('competitors', 'found', `${results.results.length} competitors`);
      // Note: updateSources expects a total count
      if (progress?.updateSources) {
        progress.updateSources(results.results.length);
      }
    }
    
    return results;
  } catch (_) {
    console.error('Local search error:', error);
    return { results: [] };
  }
}

async function synthesizeWithClaude4Opus(
  searchData: SearchData,
  productIntel: unknown,
  localCompetitors: LocalCompetitorResults,
  doctor: Doctor,
  product: string
): Promise<SynthesisResult> {
  const prompt = `You are an elite medical sales intelligence analyst using Claude 4's advanced capabilities. Create ULTRA-SPECIFIC, ACTIONABLE intelligence.

DOCTOR PROFILE:
- Name: ${doctor.displayName}
- Specialty: ${doctor.specialty}
- Location: ${doctor.city}, ${doctor.state}
- Organization: ${doctor.organizationName || 'Private Practice'}
- Website: ${searchData.practiceWebsite || 'Not found'}

WEB INTELLIGENCE (${searchData.sources.length} sources):
${searchData.sources.slice(0, 20).map((s: ResearchSource) => `- ${s.title}: ${s.content?.substring(0, 150)}...`).join('\n')}

PRODUCT MARKET INTELLIGENCE for ${product}:
${(() => {
  if (!productIntel || typeof productIntel !== 'object') return 'Product intelligence unavailable';
  const pi = productIntel as ProductIntelligence;
  const lines = [];
  if (pi.marketData) {
    lines.push(`- Market Awareness: ${pi.marketData.awareness || 'Unknown'}/100`);
    lines.push(`- Price Range: $${pi.marketData.pricingRange?.low || 0} - $${pi.marketData.pricingRange?.high || 0}`);
  }
  if (pi.competitiveLandscape) {
    lines.push(`- Top Competitors: ${(pi.competitiveLandscape.topCompetitors || []).join(', ') || 'Unknown'}`);
    lines.push(`- Key Differentiators: ${(pi.competitiveLandscape.differentiators || []).join(', ') || 'None identified'}`);
  }
  if (pi.localInsights) {
    lines.push(`- Local Adoption: ${pi.localInsights.adoptionRate || 'Unknown'}`);
    lines.push(`- Local Barriers: ${(pi.localInsights.barriers || []).join(', ') || 'None identified'}`);
  }
  return lines.length > 0 ? lines.join('\n') : 'Product intelligence unavailable';
})()}

LOCAL DENTAL PRACTICES (${localCompetitors?.results?.length || 0} found):
${localCompetitors?.results?.slice(0, 5).map((c: LocalCompetitor) => 
  `- ${c.title}: ${c.rating}/5 (${c.rating_count} reviews), ${c.distance}mi away, ${c.priceRange || '$$$'}`
).join('\n') || 'No competitor data'}

PRODUCT TO SELL: ${product}

Create comprehensive intelligence with SPECIFIC details from the sources. NO generic statements.

Return JSON with these fields:
{
  "executiveSummary": "2-3 sentence opportunity story",
  "opportunityScore": 1-100,
  "scoringRationale": "specific reasons for score",
  
  "practiceProfile": {
    "size": "specific size from sources",
    "patientVolume": "specific if found",
    "yearsInBusiness": number or null,
    "technologyLevel": "specific assessment",
    "notableFeatures": ["specific", "features", "from", "sources"]
  },
  
  "competitivePosition": {
    "marketRank": "e.g., '#2 of 8 practices within 3 miles'",
    "strengths": ["specific strengths vs competitors"],
    "vulnerabilities": ["specific weaknesses"],
    "differentiators": ["unique aspects"]
  },
  
  "buyingSignals": ["specific signal 1", "specific signal 2"],
  "painPoints": ["specific pain from reviews/data", "another specific issue"],
  
  "salesStrategy": {
    "perfectPitch": "exact opening line to use",
    "channel": "email/phone/linkedin",
    "timing": "specific day/time based on patterns",
    "valueProps": ["specific value prop 1", "specific value prop 2"],
    "objectionHandlers": {
      "likely objection 1": "specific response",
      "likely objection 2": "specific response"
    }
  },
  
  "decisionMakers": {
    "primary": "name/role if found",
    "influencers": ["other stakeholders"]
  },
  
  "budgetIndicators": {
    "estimatedRevenue": "based on size/location",
    "techBudget": "based on current stack",
    "purchaseTimeframe": "Q1/Q2/etc based on signals"
  },
  
  "actionItems": [
    "Specific next step 1",
    "Specific next step 2"
  ]
}`;

  try {
    // Use Claude 4 Opus directly
    const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
    return JSON.parse(response);
  } catch (_) {
    console.error('Claude 4 Opus error, trying Claude 3.5 Sonnet:', error);
    
    // Fallback to Claude 3.5 Sonnet
    try {
      const response = await callClaude(prompt, 'claude-3.5-sonnet-20241022');
      return JSON.parse(response);
    } catch (_) {
      console.error('All synthesis failed:', fallbackError);
      return createDefaultSynthesis(doctor, product);
    }
  }
}

function createStreamlinedResearchData(
  searchData: SearchData,
  productIntel: unknown,
  localCompetitors: LocalCompetitorResults,
  synthesis: SynthesisResult,
  doctor: Doctor
): ResearchData {
  // Combine all sources
  const allSources: ResearchSource[] = [...searchData.sources];
  
  // Add local competitors as sources
  if (localCompetitors?.results) {
    localCompetitors.results.forEach((comp: LocalCompetitor, index: number) => {
      allSources.push({
        url: comp.url || `local-competitor-${index}`,
        title: `${comp.title} (Local Competitor)`,
        type: 'medical_directory',
        content: JSON.stringify({
          rating: comp.rating,
          reviews: comp.rating_count,
          distance: comp.distance,
          address: comp.address
        }),
        confidence: 90,
        lastUpdated: new Date().toISOString()
      });
    });
  }
  
  // Calculate confidence - with 30 sources should be much higher
  let confidence = 50; // Base NPI verification
  if (searchData.practiceWebsite) confidence += 20;
  if (allSources.length > 10) confidence += 10;
  if (allSources.length > 20) confidence += 10;
  if (allSources.length > 30) confidence += 10;
  if (synthesis.opportunityScore > 70) confidence += 5;
  if (localCompetitors?.results?.length > 0) confidence += 5;
  
  return {
    doctorName: doctor.displayName,
    practiceInfo: {
      name: doctor.organizationName || `${doctor.displayName}'s Practice`,
      address: doctor.fullAddress,
      phone: doctor.phone,
      website: searchData.practiceWebsite || undefined,
      specialties: [doctor.specialty],
      services: synthesis.practiceProfile?.notableFeatures || [],
      technology: [],
      staff: estimateStaffSize(synthesis.practiceProfile?.size),
      established: synthesis.practiceProfile?.yearsInBusiness ? 
        (new Date().getFullYear() - synthesis.practiceProfile.yearsInBusiness).toString() : undefined
    },
    credentials: {
      boardCertifications: [doctor.specialty],
    },
    reviews: {
      commonPraise: synthesis.competitivePosition?.strengths || [],
      commonConcerns: synthesis.painPoints || []
    },
    businessIntel: {
      practiceType: synthesis.practiceProfile?.size || 'Unknown',
      patientVolume: synthesis.practiceProfile?.patientVolume || 'Unknown',
      marketPosition: synthesis.competitivePosition?.marketRank || 'Unknown',
      recentNews: [],
      growthIndicators: synthesis.buyingSignals || []
    },
    sources: allSources,
    confidenceScore: Math.min(confidence, 100),
    completedAt: new Date().toISOString(),
    enhancedInsights: synthesis as unknown as Record<string, unknown>,
    // Add product intelligence
    productIntelligence: productIntel as Record<string, unknown> | undefined,
    // Add combined doctor+product insights
    combinedStrategy: productIntel && typeof productIntel === 'object' && 'productName' in productIntel ? combineIntelligence(
      { doctorName: doctor.displayName, location: `${doctor.city}, ${doctor.state}` },
      productIntel as ProductIntelligence
    ) as Record<string, unknown> : undefined
  };
}

// Helper functions
function findPracticeWebsite(results: BraveSearchResult[], doctor: Doctor): string {
  const directoryDomains = ['ada.org', 'healthgrades.com', 'zocdoc.com', 'vitals.com', 'yelp.com', 'sharecare.com', 'npidb.org', 'npino.com', 'ratemds.com', 'wellness.com'];
  
  for (const result of results) {
    const url = result.url || '';
    const urlLower = url.toLowerCase();
    const titleLower = (result.title || '').toLowerCase();
    
    // Skip directories
    if (directoryDomains.some(domain => urlLower.includes(domain))) continue;
    
    // Prioritize Pure Dental if found
    if (urlLower.includes('puredental.com') || titleLower.includes('pure dental')) {
      console.log('Found Pure Dental website:', url);
      return url;
    }
    
    // Check for other practice indicators
    if (urlLower.includes('dental') || 
        urlLower.includes('dds') || 
        urlLower.includes(doctor.lastName.toLowerCase())) {
      console.log('Found practice website:', url);
      return url;
    }
  }
  
  return '';
}

function determineSourceType(result: BraveSearchResult): ResearchSource['type'] {
  const url = result.url?.toLowerCase() || '';
  const title = result.title?.toLowerCase() || '';
  
  if (url.includes('healthgrades') || url.includes('vitals')) return 'review_site';
  if (title.includes('news') || title.includes('announce')) return 'news_article';
  if (url.includes('dental') || url.includes('dds')) return 'practice_website';
  return 'medical_directory';
}

function estimateStaffSize(size?: string): number {
  const sizeMap: Record<string, number> = {
    'solo': 3,
    'small': 8,
    'medium': 20,
    'large': 50,
    'enterprise': 100
  };
  return size && typeof size === 'string' ? (sizeMap[size.toLowerCase()] || 10) : 10;
}

function createDefaultSynthesis(doctor: Doctor, product: string): SynthesisResult {
  return {
    executiveSummary: `${doctor.displayName} operates a ${doctor.specialty} practice in ${doctor.city}. Consider ${product} for their needs.`,
    opportunityScore: 50,
    practiceProfile: { 
      size: 'Unknown',
      notableFeatures: []
    },
    competitivePosition: {
      marketRank: 'Unknown',
      strengths: [],
      vulnerabilities: [],
      differentiators: []
    },
    buyingSignals: [],
    painPoints: [],
    salesStrategy: {
      perfectPitch: `Hello Dr. ${doctor.lastName}, I'd like to discuss how ${product} can help your practice.`
    }
  };
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
      boardCertifications: [doctor.specialty],
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