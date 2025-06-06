/**
 * Enhanced Doctor Intelligence System with Progress Updates
 * Uses multiple data sources and Claude 4 Opus for premium insights
 */

import { callBraveSearch, callBraveLocalSearch, callFirecrawlScrape, callOpenRouter } from './apiEndpoints';
import { getClaude4Processor } from './claude4LocalProcessor';
import type { Doctor } from '../components/DoctorAutocomplete';
import type { ResearchData, ResearchSource } from './webResearch';

interface ProgressCallback {
  updateStep: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => void;
  updateSources: (count: number) => void;
  updateConfidence: (score: number) => void;
  updateStage: (stage: string) => void;
}

interface IntelligenceGatheringResult {
  practiceWebsite: string;
  allSources: ResearchSource[];
  localCompetitors?: any;
  rawData: {
    practiceInfo: any;
    reviews: any;
    marketPosition: any;
    technology: any;
    competition: any;
  };
}

export async function gatherComprehensiveDoctorIntelligenceWithProgress(
  doctor: Doctor,
  product: string,
  progress: ProgressCallback
): Promise<ResearchData> {
  console.log('🚀 Starting ENHANCED intelligence gathering for:', doctor.displayName);
  
  // Check if we should use streamlined mode (recommended)
  const useStreamlined = process.env.REACT_APP_USE_STREAMLINED !== 'false';
  
  if (useStreamlined) {
    console.log('⚡ Using STREAMLINED mode: Brave + Claude 4 Opus');
    const { gatherStreamlinedDoctorIntelligence } = await import('./streamlinedDoctorIntelligence');
    
    // Check if we have a pre-discovered website from NPI research
    const existingWebsite = (doctor as any).practiceWebsite || (doctor as any).website;
    
    return gatherStreamlinedDoctorIntelligence(doctor, product, progress, existingWebsite);
  }
  
  // Legacy super mode (if explicitly disabled streamlined)
  const useSuperMode = process.env.REACT_APP_USE_SUPER_INTELLIGENCE === 'true';
  
  if (useSuperMode) {
    console.log('🧠 Using SUPER INTELLIGENT mode (legacy)');
    const { gatherSuperIntelligentDoctorResearch } = await import('./superIntelligentDoctorResearch');
    return gatherSuperIntelligentDoctorResearch(doctor, product, progress);
  }
  
  // Initialize progress steps
  const steps = [
    { id: 'practice', label: 'Searching Practice Information', sublabel: 'Website, contact details, services' },
    { id: 'reviews', label: 'Gathering Patient Reviews', sublabel: 'Ratings, feedback, reputation' },
    { id: 'professional', label: 'Professional Activities', sublabel: 'Conferences, publications, achievements' },
    { id: 'website', label: 'Deep Website Analysis', sublabel: 'Using Firecrawl for rich data' },
    { id: 'competition', label: 'Market Competition Analysis', sublabel: 'Local competitors, market position' },
    { id: 'localcompetitors', label: 'Local Competitor Intelligence', sublabel: 'Real-time local business data' },
    { id: 'technology', label: 'Technology Research', sublabel: `${product} adoption and readiness` },
    { id: 'synthesis', label: 'Claude 4 Opus Synthesis', sublabel: 'Creating personalized intelligence' }
  ];
  
  // Mark all as pending initially
  steps.forEach(step => progress.updateStep(step.id, 'pending'));
  
  try {
    // Phase 1: Gather ALL available data
    const intelligenceData = await gatherAllIntelligenceWithProgress(doctor, product, progress);
    
    // Phase 2: Use Claude 4 Opus to synthesize everything
    progress.updateStep('synthesis', 'active');
    progress.updateStage('Claude 4 Opus analyzing all sources...');
    
    const synthesizedInsights = await synthesizeWithClaude4Opus(intelligenceData, doctor, product, intelligenceData.localCompetitors);
    
    progress.updateStep('synthesis', 'completed', 'Intelligence report ready');
    
    // Phase 3: Create the research data with rich insights
    const finalData = createEnhancedResearchData(intelligenceData, synthesizedInsights, doctor);
    
    // Update final confidence
    progress.updateConfidence(finalData.confidenceScore);
    
    return finalData;
    
  } catch (error) {
    console.error('Error in enhanced intelligence gathering:', error);
    return createBasicResearchData(doctor);
  }
}

async function gatherAllIntelligenceWithProgress(
  doctor: Doctor, 
  product: string,
  progress: ProgressCallback
): Promise<IntelligenceGatheringResult> {
  const allSources: ResearchSource[] = [];
  let sourcesCount = 0;
  let practiceWebsite = '';
  
  // Smart query building
  const doctorFullName = doctor.displayName;
  const location = `${doctor.city}, ${doctor.state}`;
  const specialty = doctor.specialty;
  
  // Step 1: Practice Information
  progress.updateStep('practice', 'active');
  progress.updateStage('Discovering practice insights and hidden opportunities...');
  
  const braveResults1 = await callBraveSearch(`"${doctorFullName}" "${location}" dental practice website`, 10);
  
  if (braveResults1?.web?.results) {
    sourcesCount += braveResults1.web.results.length;
    progress.updateSources(sourcesCount);
    
    // Extract practice website early for display
    practiceWebsite = findPracticeWebsite(braveResults1.web.results, doctor);
    if (practiceWebsite) {
      progress.updateStep('practice', 'completed', `Found: ${practiceWebsite}`);
    } else {
      progress.updateStep('practice', 'completed', `${braveResults1.web.results.length} sources`);
    }
  }
  
  // Wait to avoid rate limit
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 2: Reviews
  progress.updateStep('reviews', 'active');
  progress.updateStage('Analyzing patient sentiment and satisfaction patterns...');
  
  const braveResults2 = await callBraveSearch(`"${doctorFullName}" reviews ratings patient feedback ${location}`, 10);
  
  if (braveResults2?.web?.results) {
    sourcesCount += braveResults2.web.results.length;
    progress.updateSources(sourcesCount);
    progress.updateStep('reviews', 'completed', `${braveResults2.web.results.length} sources`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 3: Professional Activities
  progress.updateStep('professional', 'active');
  progress.updateStage('Uncovering thought leadership and industry influence...');
  
  const braveResults3 = await callBraveSearch(`"${doctorFullName}" speaking conference publications awards ${specialty}`, 10);
  
  if (braveResults3?.web?.results) {
    sourcesCount += braveResults3.web.results.length;
    progress.updateSources(sourcesCount);
    progress.updateStep('professional', 'completed', `${braveResults3.web.results.length} sources`);
  }
  
  // Practice website already extracted above
  const websiteResult = practiceWebsite;
  
  // Step 4: Deep Website Analysis (if found)
  if (websiteResult) {
    practiceWebsite = websiteResult;
    progress.updateStep('website', 'active');
    progress.updateStage('Extracting technology stack and practice philosophy...');
    
    try {
      const websiteData = await callFirecrawlScrape(practiceWebsite, {
        formats: ['markdown'],
        onlyMainContent: true
      });
      
      if (websiteData?.success) {
        allSources.push({
          url: practiceWebsite,
          title: 'Practice Website - Deep Analysis',
          type: 'practice_website',
          content: websiteData.markdown || '',
          confidence: 95,
          lastUpdated: new Date().toISOString()
        });
        sourcesCount += 1;
        progress.updateSources(sourcesCount);
        progress.updateStep('website', 'found', '✓ Website decoded');
        
        // Update confidence based on website found
        progress.updateConfidence(70);
      }
    } catch (error) {
      console.log('Firecrawl unavailable, continuing...');
      progress.updateStep('website', 'completed', 'Using alternative data');
    }
  } else {
    progress.updateStep('website', 'completed', 'No website found');
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 5: Competition Analysis
  progress.updateStep('competition', 'active');
  progress.updateStage('Mapping competitive landscape and market gaps...');
  
  const competitorIntel = await callBraveSearch(`${specialty} practices ${location} -"${doctorFullName}"`, 5);
  
  if (competitorIntel?.web?.results) {
    sourcesCount += competitorIntel.web.results.length;
    progress.updateSources(sourcesCount);
    progress.updateStep('competition', 'completed', `${competitorIntel.web.results.length} competitors`);
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 5b: Local Competitor Intelligence
  progress.updateStep('localcompetitors', 'active');
  progress.updateStage('Gathering real-time local competitor intelligence...');
  
  const localCompetitors = await callBraveLocalSearch(`${specialty} near ${location}`, 20);
  
  if (localCompetitors?.results) {
    sourcesCount += localCompetitors.results.length;
    progress.updateSources(sourcesCount);
    progress.updateStep('localcompetitors', 'found', `${localCompetitors.results.length} local competitors`);
    
    // Add local competitors as sources
    localCompetitors.results.forEach((business: any, index: number) => {
      allSources.push({
        url: business.url || `local-business-${index}`,
        title: business.title || 'Local Competitor',
        type: 'medical_directory',
        content: JSON.stringify({
          name: business.title,
          address: business.address,
          rating: business.rating,
          reviews: business.rating_count,
          phone: business.phone,
          distance: business.distance,
          categories: business.categories
        }),
        confidence: 90, // High confidence for real-time local data
        lastUpdated: new Date().toISOString()
      });
    });
  }
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Step 6: Technology Research
  progress.updateStep('technology', 'active');
  progress.updateStage(`Identifying ${product} readiness and buying signals...`);
  
  const technologyIntel = await callBraveSearch(`"${product}" dental practices ${location} case studies`, 5);
  
  if (technologyIntel?.web?.results) {
    sourcesCount += technologyIntel.web.results.length;
    progress.updateSources(sourcesCount);
    progress.updateStep('technology', 'completed', `${technologyIntel.web.results.length} sources`);
  }
  
  // Collect ALL sources
  const allBraveResults = [
    ...(braveResults1?.web?.results || []),
    ...(braveResults2?.web?.results || []),
    ...(braveResults3?.web?.results || []),
    ...(competitorIntel?.web?.results || []),
    ...(technologyIntel?.web?.results || [])
  ];
  
  // Add all results as sources
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
  
  // Update final confidence based on sources
  const finalConfidence = Math.min(50 + (sourcesCount * 2), 95);
  progress.updateConfidence(finalConfidence);
  
  return {
    practiceWebsite,
    allSources,
    localCompetitors,
    rawData: {
      practiceInfo: braveResults1,
      reviews: braveResults2,
      marketPosition: competitorIntel,
      technology: technologyIntel,
      competition: competitorIntel
    }
  };
}

async function synthesizeWithClaude4Opus(
  data: IntelligenceGatheringResult,
  doctor: Doctor,
  product: string,
  localCompetitors?: any
): Promise<any> {
  const prompt = `You are an elite medical sales intelligence analyst. Analyze this comprehensive research about ${doctor.displayName} and create SPECIFIC, ACTIONABLE intelligence.

DOCTOR PROFILE:
- Name: ${doctor.displayName}
- Specialty: ${doctor.specialty}
- Location: ${doctor.city}, ${doctor.state}
- Organization: ${doctor.organizationName || 'Private Practice'}
- Website: ${data.practiceWebsite || 'Not found'}

RESEARCH SOURCES (${data.allSources.length} total):
${data.allSources.slice(0, 30).map(s => `- ${s.title}: ${s.content?.substring(0, 200)}...`).join('\n')}

LOCAL COMPETITOR ANALYSIS:
${localCompetitors?.results?.slice(0, 5).map((c: any) => 
  `- ${c.title}: Rating ${c.rating}/5 (${c.rating_count} reviews), ${c.distance}mi away`
).join('\n') || 'No local competitor data available'}

PRODUCT BEING SOLD: ${product}

Create a comprehensive intelligence report with SPECIFIC details from the sources. No generic statements.

Format as JSON with these exact fields:
{
  "practiceProfile": {
    "size": "specific size from sources",
    "patientVolume": "specific volume if found",
    "yearsInBusiness": number or null,
    "technologyLevel": "specific assessment based on evidence",
    "notableFeatures": ["specific", "features", "from", "research"]
  },
  "technologyStack": {
    "current": ["specific systems mentioned"],
    "recentAdditions": ["specific recent additions"],
    "gaps": ["specific gaps for ${product}"]
  },
  "marketPosition": {
    "ranking": "specific position in market",
    "reputation": "specific reputation details",
    "differentiators": ["unique", "selling", "points"]
  },
  "buyingSignals": ["specific signal from research", "another specific signal"],
  "competition": {
    "currentVendors": ["vendor names if found"],
    "recentPurchases": ["specific purchases mentioned"]
  },
  "approachStrategy": {
    "bestTiming": "specific time based on practice patterns",
    "preferredChannel": "email/phone/in-person based on evidence",
    "keyMessage": "specific message based on their needs",
    "avoidTopics": ["topics to avoid based on research"]
  },
  "decisionMakers": {
    "primary": "name and role if found",
    "influencers": ["other decision makers"]
  },
  "painPoints": ["specific pain point from reviews", "another specific issue"],
  "budgetIndicators": {
    "estimatedRevenue": "based on practice size/location",
    "technologyBudget": "based on current tech stack",
    "purchaseTimeframe": "Q1/Q2/Q3/Q4 based on patterns"
  },
  "salesBrief": "2-3 sentences with SPECIFIC insights from the research, mentioning actual findings"
}`;

  try {
    // Try Claude 4 Opus first via OpenRouter
    console.log('🎯 Attempting Claude 4 Opus synthesis...');
    const response = await callOpenRouter(prompt, 'anthropic/claude-opus-4-20250514');
    return JSON.parse(response);
  } catch (error) {
    console.error('Claude 4 Opus not available, trying Claude 3.5 Sonnet:', error);
    
    // Fallback to Claude 3.5 Sonnet (better than 3.0)
    try {
      const response = await callOpenRouter(prompt, 'anthropic/claude-3.5-sonnet-20241022');
      return JSON.parse(response);
    } catch (fallbackError) {
      console.error('Claude 3.5 Sonnet failed, trying local processor');
      
      // Try local processor as last resort
      try {
        const processor = getClaude4Processor();
        const response = await processor.processDoctorIntelligence(
          prompt, 
          doctor.displayName, 
          product
        );
        return response;
      } catch (localError) {
        console.error('All AI synthesis failed, using defaults');
        return createDefaultInsights(doctor, product);
      }
    }
  }
}

// Helper functions
function findPracticeWebsite(results: any[], doctor: Doctor): string {
  const directoryDomains = ['ada.org', 'healthgrades.com', 'zocdoc.com', 'vitals.com', 'yelp.com'];
  
  for (const result of results) {
    const url = result.url || '';
    const urlLower = url.toLowerCase();
    
    // Skip directories
    if (directoryDomains.some(domain => urlLower.includes(domain))) continue;
    
    // Check for practice websites
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

function createEnhancedResearchData(
  intelligenceData: IntelligenceGatheringResult,
  insights: any,
  doctor: Doctor
): ResearchData {
  // Calculate final confidence
  let confidence = 50; // Base NPI verification
  if (intelligenceData.practiceWebsite) confidence += 15;
  if (intelligenceData.allSources.length > 20) confidence += 20;
  if (intelligenceData.allSources.length > 30) confidence += 10;
  if (insights.practiceProfile?.size) confidence += 5;
  
  return {
    doctorName: doctor.displayName,
    practiceInfo: {
      name: doctor.organizationName || `${doctor.displayName}'s Practice`,
      address: doctor.fullAddress,
      phone: doctor.phone,
      website: intelligenceData.practiceWebsite || undefined,
      specialties: [doctor.specialty],
      services: insights.practiceProfile?.notableFeatures || [],
      technology: insights.technologyStack?.current || [],
      staff: estimateStaffFromSize(insights.practiceProfile?.size),
      established: insights.practiceProfile?.yearsInBusiness ? 
        new Date().getFullYear() - insights.practiceProfile.yearsInBusiness + '' : undefined
    },
    credentials: {
      boardCertifications: [doctor.specialty]
    },
    reviews: {
      averageRating: insights.marketPosition?.reputation?.includes('highly rated') ? 4.5 : undefined,
      commonPraise: insights.marketPosition?.differentiators || [],
      commonConcerns: insights.painPoints?.slice(0, 2) || []
    },
    businessIntel: {
      practiceType: insights.practiceProfile?.size || 'Unknown',
      patientVolume: insights.practiceProfile?.patientVolume || 'Unknown',
      marketPosition: insights.marketPosition?.ranking || 'Unknown',
      recentNews: insights.competition?.recentPurchases || [],
      growthIndicators: insights.buyingSignals || []
    },
    sources: intelligenceData.allSources,
    confidenceScore: Math.min(confidence, 100),
    completedAt: new Date().toISOString(),
    enhancedInsights: insights
  };
}

function createDefaultInsights(doctor: Doctor, product: string): any {
  return {
    practiceProfile: { size: 'Unknown' },
    technologyStack: { current: [], gaps: [] },
    buyingSignals: [],
    painPoints: [],
    salesBrief: `Contact ${doctor.displayName} about ${product}.`
  };
}

function estimateStaffFromSize(size: string): number {
  const sizeMap: Record<string, number> = {
    'solo': 3,
    'small': 8,
    'medium': 20,
    'large': 50,
    'enterprise': 100
  };
  
  return sizeMap[size?.toLowerCase()] || 10;
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
    reviews: {},
    businessIntel: {
      practiceType: 'Unknown'
    },
    sources: [],
    confidenceScore: 50,
    completedAt: new Date().toISOString()
  };
}