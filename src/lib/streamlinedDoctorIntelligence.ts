/**
 * Streamlined Doctor Intelligence System
 * Uses Brave Search for data gathering and Claude 4 Opus for analysis
 * Simpler, faster, more cost-effective
 */

import { callBraveSearch, callBraveLocalSearch, callOpenRouter } from './apiEndpoints';
import type { Doctor } from '../components/DoctorAutocomplete';
import type { ResearchData, ResearchSource } from './webResearch';

interface StreamlinedProgressCallback {
  updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => void;
  updateSources: (count: number) => void;
  updateConfidence: (score: number) => void;
  updateStage: (stage: string) => void;
}

export async function gatherStreamlinedDoctorIntelligence(
  doctor: Doctor,
  product: string,
  progress?: StreamlinedProgressCallback
): Promise<ResearchData> {
  console.log('🚀 Streamlined intelligence gathering for:', doctor.displayName);
  
  const steps = [
    { id: 'websearch', label: 'Web Intelligence Gathering', sublabel: 'Practice info, reviews, news' },
    { id: 'competitors', label: 'Local Competitor Analysis', sublabel: 'Real-time local market data' },
    { id: 'synthesis', label: 'Claude 4 Opus Analysis', sublabel: 'Premium intelligence synthesis' }
  ];
  
  // Initialize progress
  steps.forEach(step => progress?.updateStep(step.id, 'pending'));
  
  try {
    // Phase 1: Gather all data with Brave
    progress?.updateStep('websearch', 'active');
    progress?.updateStage('Gathering comprehensive web intelligence...');
    
    const searchData = await gatherBraveIntelligence(doctor, product, progress);
    
    progress?.updateStep('websearch', 'completed', `${searchData.sources.length} sources found`);
    
    // Phase 2: Local competitor analysis
    progress?.updateStep('competitors', 'active');
    progress?.updateStage('Analyzing local competitive landscape...');
    
    const localCompetitors = await gatherLocalCompetitors(doctor, progress);
    
    // Phase 3: Claude 4 Opus synthesis
    progress?.updateStep('synthesis', 'active');
    progress?.updateStage('Claude 4 Opus creating premium intelligence...');
    
    const synthesis = await synthesizeWithClaude4Opus(
      searchData,
      localCompetitors,
      doctor,
      product
    );
    
    progress?.updateStep('synthesis', 'completed', 'Intelligence ready');
    
    // Create final research data
    return createStreamlinedResearchData(
      searchData,
      localCompetitors,
      synthesis,
      doctor
    );
    
  } catch (error) {
    console.error('Streamlined intelligence error:', error);
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
): Promise<any> {
  try {
    const query = `${doctor.specialty} near ${doctor.city}, ${doctor.state}`;
    const results = await callBraveLocalSearch(query, 20);
    
    if (results?.results?.length > 0) {
      progress?.updateStep('competitors', 'found', `${results.results.length} competitors`);
      progress?.updateSources((prev: any) => prev + results.results.length);
    }
    
    return results;
  } catch (error) {
    console.error('Local search error:', error);
    return { results: [] };
  }
}

async function synthesizeWithClaude4Opus(
  searchData: any,
  localCompetitors: any,
  doctor: Doctor,
  product: string
): Promise<any> {
  const prompt = `You are an elite medical sales intelligence analyst using Claude 4's advanced capabilities. Create ULTRA-SPECIFIC, ACTIONABLE intelligence.

DOCTOR PROFILE:
- Name: ${doctor.displayName}
- Specialty: ${doctor.specialty}
- Location: ${doctor.city}, ${doctor.state}
- Organization: ${doctor.organizationName || 'Private Practice'}
- Website: ${searchData.practiceWebsite || 'Not found'}

WEB INTELLIGENCE (${searchData.sources.length} sources):
${searchData.sources.slice(0, 20).map((s: any) => `- ${s.title}: ${s.content?.substring(0, 150)}...`).join('\n')}

LOCAL COMPETITORS (${localCompetitors?.results?.length || 0} found):
${localCompetitors?.results?.slice(0, 5).map((c: any) => 
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
    const response = await callOpenRouter(prompt, 'anthropic/claude-opus-4-20250514');
    return JSON.parse(response);
  } catch (error) {
    console.error('Claude 4 Opus error, trying Claude 3.5 Sonnet:', error);
    
    // Fallback to Claude 3.5 Sonnet
    try {
      const response = await callOpenRouter(prompt, 'anthropic/claude-3.5-sonnet-20241022');
      return JSON.parse(response);
    } catch (fallbackError) {
      console.error('All synthesis failed:', fallbackError);
      return createDefaultSynthesis(doctor, product);
    }
  }
}

function createStreamlinedResearchData(
  searchData: any,
  localCompetitors: any,
  synthesis: any,
  doctor: Doctor
): ResearchData {
  // Combine all sources
  const allSources: ResearchSource[] = [...searchData.sources];
  
  // Add local competitors as sources
  if (localCompetitors?.results) {
    localCompetitors.results.forEach((comp: any, index: number) => {
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
  
  // Calculate confidence
  let confidence = 60; // Base
  if (searchData.practiceWebsite) confidence += 15;
  if (allSources.length > 20) confidence += 15;
  if (synthesis.opportunityScore > 70) confidence += 10;
  
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
      verified: true,
      npi: doctor.npi,
      credential: doctor.credential
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
    enhancedInsights: synthesis
  };
}

// Helper functions
function findPracticeWebsite(results: any[], doctor: Doctor): string {
  const directoryDomains = ['ada.org', 'healthgrades.com', 'zocdoc.com', 'vitals.com', 'yelp.com'];
  
  for (const result of results) {
    const url = result.url || '';
    const urlLower = url.toLowerCase();
    
    // Skip directories
    if (directoryDomains.some(domain => urlLower.includes(domain))) continue;
    
    // Check for practice indicators
    if (urlLower.includes('dental') || 
        urlLower.includes('dds') || 
        urlLower.includes(doctor.lastName.toLowerCase()) ||
        urlLower.includes('puredental')) {
      console.log('Found practice website:', url);
      return url;
    }
  }
  
  return '';
}

function determineSourceType(result: any): ResearchSource['type'] {
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
  return sizeMap[size?.toLowerCase()] || 10;
}

function createDefaultSynthesis(doctor: Doctor, product: string): any {
  return {
    executiveSummary: `${doctor.displayName} operates a ${doctor.specialty} practice in ${doctor.city}. Consider ${product} for their needs.`,
    opportunityScore: 50,
    practiceProfile: { size: 'Unknown' },
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
      verified: true,
      npi: doctor.npi,
      credential: doctor.credential
    },
    reviews: {},
    businessIntel: {
      practiceType: 'Unknown'
    },
    sources: [],
    confidenceScore: 50,
    completedAt: new Date().toISOString()
  };
}