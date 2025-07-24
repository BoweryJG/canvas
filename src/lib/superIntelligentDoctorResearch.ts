/**
 * Super Intelligent Doctor Research System
 * Leverages all available AI models for maximum intelligence
 */

import { getModelOrchestrator } from './intelligentModelOrchestrator';
import { callBraveSearch, callBraveLocalSearch } from './apiEndpoints';
import type { Doctor } from '../components/DoctorAutocomplete';
import type { ResearchData, ResearchSource } from './webResearch';

interface OrchestrationData {
  realTimeData?: unknown;
  medicalAnalysis?: unknown;
  finalSynthesis?: unknown;
}

interface SuperIntelligenceResult {
  orchestratedData: OrchestrationData;
  practiceWebsite: string;
  sources: ResearchSource[];
  confidence: number;
  insights: Record<string, unknown>;
}

interface ProgressCallback {
  updateStep: (step: string, status: string, message?: string) => void;
  updateStage: (stage: string) => void;
}

export async function gatherSuperIntelligentDoctorResearch(
  doctor: Doctor,
  product: string,
  progressCallback?: ProgressCallback
): Promise<ResearchData> {
  console.log('🚀 SUPER INTELLIGENT research initiated for:', doctor.displayName);
  
  try {
    // Step 1: Traditional web search for website and basic info
    progressCallback?.updateStep('practice', 'active');
    progressCallback?.updateStage('Finding practice website and digital footprint...');
    
    const websiteSearchQuery = `"${doctor.displayName}" "${doctor.city}" dental practice website -directory -healthgrades -zocdoc`;
    const braveResults = await callBraveSearch(websiteSearchQuery, 10);
    
    const practiceWebsite = findActualPracticeWebsite(braveResults?.web?.results || [], doctor);
    console.log('Found practice website:', practiceWebsite || 'Not found');
    
    progressCallback?.updateStep('practice', 'completed', practiceWebsite ? '✓ Website found' : 'No website');
    
    // Step 1b: Get local competitor intelligence
    progressCallback?.updateStep('localcompetitors', 'active');
    progressCallback?.updateStage('Analyzing local competitive landscape...');
    
    const localCompetitorQuery = `${doctor.specialty} near ${doctor.city}, ${doctor.state}`;
    const localCompetitors = await callBraveLocalSearch(localCompetitorQuery, 20);
    
    if (localCompetitors?.results?.length > 0) {
      progressCallback?.updateStep('localcompetitors', 'found', `${localCompetitors.results.length} competitors analyzed`);
      console.log(`Found ${localCompetitors.results.length} local competitors`);
    }
    
    // Step 2: Use the intelligent orchestrator for multi-model analysis
    const orchestrator = getModelOrchestrator();
    const orchestratedData = await orchestrator.orchestrateIntelligenceGathering(
      doctor, 
      product,
      progressCallback
    );
    
    // Step 3: Process and structure all the intelligence
    const superIntelligence = processSuperIntelligence(
      orchestratedData,
      practiceWebsite,
      braveResults,
      localCompetitors,
      doctor,
      product
    );
    
    // Step 4: Create final research data
    return createSuperResearchData(superIntelligence, doctor);
    
  } catch (error) {
    console.error('Super intelligence error:', error);
    return createFallbackResearchData(doctor);
  }
}

interface SearchResultItem {
  url?: string;
  title?: string;
  description?: string;
}

function findActualPracticeWebsite(results: SearchResultItem[], doctor: Doctor): string {
  // Prioritize results that look like actual practice websites
  const practiceIndicators = [
    'dental', 'dds', 'dentistry', 'oral', 'surgery',
    doctor.lastName.toLowerCase(),
    'puredental', 'pure-dental'
  ];
  
  const directoryDomains = [
    'ada.org', 'healthgrades.com', 'zocdoc.com', 'vitals.com', 
    'yelp.com', 'yellowpages.com', 'superpages.com'
  ];
  
  for (const result of results) {
    const url = result.url || '';
    const urlLower = url.toLowerCase();
    const title = (result.title || '').toLowerCase();
    
    // Skip directories
    if (directoryDomains.some(domain => urlLower.includes(domain))) continue;
    
    // Check for practice indicators
    const urlScore = practiceIndicators.filter(indicator => 
      urlLower.includes(indicator) || title.includes(indicator)
    ).length;
    
    if (urlScore > 0) {
      console.log(`Found potential practice website (score: ${urlScore}):`, url);
      
      // Special check for Pure Dental
      if (doctor.lastName.toLowerCase() === 'white' && 
          (urlLower.includes('puredental') || urlLower.includes('pure-dental'))) {
        console.log('✨ Found Pure Dental website for Dr. White!');
        return url;
      }
      
      return url;
    }
  }
  
  return '';
}

interface BraveSearchResponse {
  web?: {
    results?: SearchResultItem[];
  };
}

interface LocalCompetitor {
  url?: string;
  title?: string;
  rating?: number;
  rating_count?: number;
  distance?: string;
  address?: string;
  phone?: string;
  categories?: string[];
  priceRange?: string;
}

interface LocalCompetitorResponse {
  results?: LocalCompetitor[];
}

function processSuperIntelligence(
  orchestratedData: OrchestrationData,
  practiceWebsite: string,
  braveResults: BraveSearchResponse,
  localCompetitors: LocalCompetitorResponse,
  _doctor: Doctor,
  _product: string
): SuperIntelligenceResult {
  // Extract insights from each model's output
  const perplexityInsights = orchestratedData.realTimeData;
  const gpt4Analysis = orchestratedData.medicalAnalysis;
  const claudeSynthesis = orchestratedData.finalSynthesis;
  
  // Build comprehensive source list
  const sources: ResearchSource[] = [];
  
  // Add Brave search results as sources
  (braveResults?.web?.results || []).forEach((result, index) => {
    sources.push({
      url: result.url || '',
      title: result.title || `Search Result ${index + 1}`,
      type: 'medical_directory',
      content: result.description || '',
      confidence: 70,
      lastUpdated: new Date().toISOString()
    });
  });
  
  // Add local competitor data as sources
  if (localCompetitors?.results) {
    localCompetitors.results.forEach((competitor, index) => {
      sources.push({
        url: competitor.url || `local-competitor-${index}`,
        title: `${competitor.title} (Local Competitor)`,
        type: 'medical_directory',
        content: JSON.stringify({
          name: competitor.title,
          rating: competitor.rating,
          reviews: competitor.rating_count,
          distance: competitor.distance,
          address: competitor.address,
          phone: competitor.phone,
          categories: competitor.categories,
          priceRange: competitor.priceRange
        }),
        confidence: 92, // Very high confidence for real-time local data
        lastUpdated: new Date().toISOString()
      });
    });
  }
  
  // Add AI analysis as high-confidence sources
  if (perplexityInsights && typeof perplexityInsights === 'object' && 'basicInfo' in perplexityInsights) {
    sources.push({
      url: 'perplexity-realtime',
      title: 'AI Real-time Analysis',
      type: 'news_article',
      content: JSON.stringify((perplexityInsights as any).basicInfo),
      confidence: 85,
      lastUpdated: new Date().toISOString()
    });
  }
  
  if (gpt4Analysis) {
    sources.push({
      url: 'gpt4-medical',
      title: 'Medical Context Analysis',
      type: 'medical_directory',
      content: JSON.stringify(gpt4Analysis),
      confidence: 90,
      lastUpdated: new Date().toISOString()
    });
  }
  
  if (claudeSynthesis) {
    sources.push({
      url: 'claude-synthesis',
      title: 'Strategic Intelligence Synthesis',
      type: 'news_article',
      content: JSON.stringify(claudeSynthesis),
      confidence: 95,
      lastUpdated: new Date().toISOString()
    });
  }
  
  // Calculate confidence based on data completeness
  let confidence = 50; // Base
  if (practiceWebsite) confidence += 15;
  if (sources.length > 10) confidence += 15;
  if (gpt4Analysis) confidence += 10;
  if (claudeSynthesis && typeof claudeSynthesis === 'object' && 'opportunityScore' in claudeSynthesis) confidence += 10;
  
  return {
    orchestratedData,
    practiceWebsite,
    sources,
    confidence: Math.min(confidence, 100),
    insights: {
      ...(gpt4Analysis && typeof gpt4Analysis === 'object' ? gpt4Analysis : {}),
      ...(claudeSynthesis && typeof claudeSynthesis === 'object' ? claudeSynthesis : {}),
      perplexityFindings: perplexityInsights
    }
  };
}

function createSuperResearchData(
  intelligence: SuperIntelligenceResult,
  doctor: Doctor
): ResearchData {
  const insights = intelligence.insights;
  
  return {
    doctorName: doctor.displayName,
    practiceInfo: {
      name: doctor.organizationName || `${doctor.displayName}'s Practice`,
      address: doctor.fullAddress,
      phone: doctor.phone,
      website: intelligence.practiceWebsite || undefined,
      specialties: [doctor.specialty],
      services: Array.isArray(insights.notableFeatures) ? insights.notableFeatures : [],
      technology: Array.isArray(insights.currentTechnology) ? insights.currentTechnology : [],
      staff: insights.practiceSize === 'large' ? 50 : 
             insights.practiceSize === 'medium' ? 20 : 10,
      established: insights.yearsInBusiness && typeof insights.yearsInBusiness === 'number' ? 
        (new Date().getFullYear() - insights.yearsInBusiness).toString() : undefined
    },
    credentials: {
      boardCertifications: [doctor.specialty]
    },
    reviews: {
      averageRating: insights.reputationScore && typeof insights.reputationScore === 'number' ? insights.reputationScore / 2 : undefined,
      commonPraise: Array.isArray(insights.strengths) ? insights.strengths : [],
      commonConcerns: Array.isArray(insights.painPoints) ? insights.painPoints : []
    },
    businessIntel: {
      practiceType: typeof insights.practiceSize === 'string' ? insights.practiceSize : 'Unknown',
      patientVolume: typeof insights.patientVolume === 'string' ? insights.patientVolume : 'Unknown',
      marketPosition: typeof insights.marketPosition === 'string' ? insights.marketPosition : 'Unknown',
      recentNews: Array.isArray(insights.recentEvents) ? insights.recentEvents : [],
      growthIndicators: Array.isArray(insights.growthSignals) ? insights.growthSignals : []
    },
    sources: intelligence.sources,
    confidenceScore: intelligence.confidence,
    completedAt: new Date().toISOString(),
    enhancedInsights: insights,
    // New super intelligence fields
    superIntelligence: {
      opportunityScore: insights.opportunityScore && typeof insights.opportunityScore === 'number' ? insights.opportunityScore : 75,
      perfectPitch: insights.perfectPitch && typeof insights.perfectPitch === 'string' ? insights.perfectPitch : '',
      objectionHandlers: insights.objectionHandling && typeof insights.objectionHandling === 'object' ? insights.objectionHandling : {},
      modelData: {
        perplexity: intelligence.orchestratedData.realTimeData,
        gpt4: intelligence.orchestratedData.medicalAnalysis,
        claude: intelligence.orchestratedData.finalSynthesis
      }
    }
  };
}

function createFallbackResearchData(doctor: Doctor): ResearchData {
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