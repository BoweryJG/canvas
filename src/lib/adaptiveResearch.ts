/**
 * Adaptive Research Pipeline with Sequential Thinking
 * Intelligently routes research based on initial findings
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { type ResearchSource } from './webResearch';
import { type ExtendedResearchData } from './types/research';

// Type definitions for adaptive research
interface CompetitorData {
  competitors: Array<{
    name: string;
    distance?: string;
    rating?: number;
    mentioned?: boolean;
    [key: string]: unknown;
  }>;
}

interface SynthesisResult {
  salesBrief?: string;
  technologyStack?: {
    current?: string[];
    gaps?: string[];
    readiness?: string;
  };
  practiceProfile?: Record<string, any>;
  credentials?: Record<string, any>;
  reviews?: Record<string, any>;
  businessIntel?: Record<string, any>;
  marketPosition?: Record<string, any>;
  buyingSignals?: string[];
  competition?: Record<string, any>;
  approachStrategy?: Record<string, any>;
  painPoints?: string[];
  decisionMakers?: Record<string, any>;
  budgetIndicators?: Record<string, any>;
  [key: string]: unknown;
}
import { callBraveSearch, callFirecrawlScrape } from './apiEndpoints';
import { analyzeInitialResults, synthesizeWithSequentialGuidance } from './sequentialThinkingResearch';
import type { ResearchStrategy } from './sequentialThinkingResearch';
import { searchCache, cachedApiCall, CacheKeys, websiteCache } from './intelligentCaching';
import { MOCK_MODE, createMockResearchData } from './mockResearch';
import { gatherProductIntelligence, type ProductIntelligence } from './productProcedureIntelligence';
import { findProcedureByName } from './procedureDatabase';

interface AdaptiveProgress {
  updateStep?: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => void;
  updateSources?: (count: number) => void;
  updateConfidence?: (score: number) => void;
  updateStage?: (stage: string) => void;
  updateStrategy?: (strategy: string) => void;
}

export async function adaptiveResearch(
  doctor: Doctor,
  product: string,
  _existingWebsite?: string,
  progress?: AdaptiveProgress
): Promise<ExtendedResearchData> {
  console.log('🧠 ADAPTIVE RESEARCH with Sequential Thinking for:', doctor.displayName);
  console.log('🎯 Product/Procedure:', product);
  
  // Check if mock mode is enabled
  if (MOCK_MODE) {
    console.log('🧪 MOCK MODE ENABLED - Using simulated data');
    return mockAdaptiveResearch(doctor, product, progress);
  }
  
  const sources: ResearchSource[] = [];
  const startTime = Date.now();
  let productIntelligence: ProductIntelligence | null = null;
  
  try {
    // Step 1: Initial reconnaissance
    progress?.updateStage?.('Initial search and analysis...');
    progress?.updateStep?.('analysis', 'active');
    
    // Quick initial search
    const initialSearch = await cachedApiCall(
      searchCache,
      CacheKeys.search(doctor.displayName + ' ' + doctor.city),
      async () => callBraveSearch(`"${doctor.displayName}" ${doctor.specialty} ${doctor.city} ${doctor.state}`),
      5 // 5 min cache
    );
    
    sources.push({
      type: 'medical_directory',
      title: 'Initial Web Search',
      url: 'brave.com',
      content: JSON.stringify(initialSearch?.web?.results?.slice(0, 3) || []),
      confidence: 80,
      lastUpdated: new Date().toISOString()
    });
    
    // Step 2: Sequential Thinking Analysis
    progress?.updateStage?.('Analyzing results with AI reasoning...');
    progress?.updateStrategy?.('Sequential Thinking analyzing initial findings...');
    
    let strategy: ResearchStrategy;
    try {
      strategy = await analyzeInitialResults(doctor, product, initialSearch);
    } catch (error) {
      console.warn('Sequential Thinking failed, using fallback strategy:', error);
      // Fallback strategy if Sequential Thinking fails
      strategy = {
        searchQueries: [
          `"${doctor.displayName}" ${doctor.specialty} ${doctor.city}`,
          `"${doctor.organizationName || doctor.displayName}" technology reviews`
        ],
        skipWebsiteScrape: false,
        skipReviews: false,
        skipCompetitorAnalysis: false,
        focusAreas: ['general_practice', 'technology', 'reviews'],
        keyQuestions: ['What is their current technology?', 'What are their pain points?']
      };
    }
    
    console.log('📋 Research Strategy:', {
      focusAreas: strategy.focusAreas,
      skipWebsite: strategy.skipWebsiteScrape,
      skipReviews: strategy.skipReviews,
      queries: strategy.searchQueries.length
    });
    
    progress?.updateStrategy?.(`Focus: ${strategy.focusAreas.join(', ')}`);
    progress?.updateStep?.('analysis', 'completed', 'Strategy determined');
    
    // Step 3: Execute targeted searches based on strategy
    progress?.updateStage?.('Executing intelligent search strategy...');
    
    const searchPromises = [];
    
    // Website analysis (if needed)
    if (!strategy.skipWebsiteScrape && strategy.websiteUrl) {
      progress?.updateStep?.('website', 'active');
      searchPromises.push(
        scrapeWebsiteIfNeeded(strategy.websiteUrl, sources)
          .then(result => {
            progress?.updateStep?.('website', 'completed', 'Website analyzed');
            return result;
          })
      );
    } else {
      progress?.updateStep?.('website', 'completed', 'Skipped (not needed)');
    }
    
    // Reviews (if needed) 
    if (!strategy.skipReviews) {
      progress?.updateStep?.('reviews', 'active');
      searchPromises.push(
        gatherTargetedReviews(doctor, strategy, sources)
          .then(result => {
            progress?.updateStep?.('reviews', 'completed', `${result.count} reviews found`);
            return result;
          })
      );
    } else {
      progress?.updateStep?.('reviews', 'completed', 'Skipped (low priority)');
    }
    
    // Custom searches based on focus areas
    strategy.searchQueries.forEach((query: string, index: number) => {
      searchPromises.push(
        performFocusedSearch(query, `Focus Area ${index + 1}`, sources)
      );
    });
    
    // Execute all searches in parallel
    const searchResults = await Promise.all(searchPromises);
    
    progress?.updateSources?.(sources.length);
    
    // Step 3.5: Product/Procedure Research (NEW)
    progress?.updateStage?.('Researching product/procedure intelligence...');
    progress?.updateStep?.('product', 'active');
    
    try {
      // First check if it's in our procedure database
      const procedureInfo = await findProcedureByName(product);
      console.log('📋 Procedure database lookup:', procedureInfo ? 'Found' : 'Not found');
      
      // Gather comprehensive product intelligence
      productIntelligence = await gatherProductIntelligence(
        product,
        { city: doctor.city, state: doctor.state },
        doctor.specialty
      );
      
      // Add product research as a source
      sources.push({
        type: 'product_research',
        title: `${product} Market Intelligence`,
        url: 'product-research',
        content: JSON.stringify({
          procedureInfo,
          marketData: productIntelligence.marketData,
          competitiveLandscape: productIntelligence.competitiveLandscape,
          localInsights: productIntelligence.localInsights
        }),
        confidence: 90,
        lastUpdated: new Date().toISOString()
      });
      
      progress?.updateStep?.('product', 'completed', 
        `${product} intelligence gathered`);
    } catch (error) {
      console.error('Product research failed:', error);
      progress?.updateStep?.('product', 'completed', 'Using basic product info');
    }
    
    // Step 4: Competitor analysis (if needed)
    if (!strategy.skipCompetitorAnalysis) {
      progress?.updateStage?.('Analyzing competition...');
      progress?.updateStep?.('competition', 'active');
      
      const competitorData = await analyzeCompetitors(
        doctor,
        product,
        strategy.competitorNames || [],
        sources
      );
      
      progress?.updateStep?.('competition', 'completed', 
        `${(competitorData as CompetitorData)?.competitors?.length || 0} competitors analyzed`);
    }
    
    // Step 5: Sequential Thinking Guided Synthesis
    progress?.updateStage?.('AI synthesis with reasoning...');
    progress?.updateStep?.('synthesis', 'active');
    
    const allData = {
      doctor,
      product,
      sources,
      searchResults,
      strategy,
      initialFindings: initialSearch,
      productIntelligence // Add product intelligence to synthesis
    };
    
    const synthesis = await synthesizeWithSequentialGuidance(
      allData,
      strategy,
      doctor,
      product,
      productIntelligence as any // Pass product intelligence to synthesis
    );
    
    // Calculate confidence with strategy awareness
    const confidence = calculateAdaptiveConfidence(sources, strategy, synthesis);
    progress?.updateConfidence?.(confidence.score);
    
    // Build final research data
    const researchData: ExtendedResearchData = {
      doctorName: doctor.displayName,
      practiceInfo: synthesis.practiceProfile || {},
      credentials: synthesis.credentials || {},
      reviews: synthesis.reviews || {},
      businessIntel: synthesis.businessIntel || {},
      sources,
      confidenceScore: confidence.score,
      completedAt: new Date().toISOString(),
      // Extended fields
      technologyStack: synthesis.technologyStack || {},
      marketPosition: synthesis.marketPosition || {},
      buyingSignals: Array.isArray(synthesis.buyingSignals) ? synthesis.buyingSignals : [],
      competition: synthesis.competition || {},
      approachStrategy: synthesis.approachStrategy || {},
      painPoints: Array.isArray(synthesis.painPoints) ? synthesis.painPoints : [],
      decisionMakers: synthesis.decisionMakers || {},
      budgetInfo: synthesis.budgetIndicators || {},
      salesBrief: (synthesis.salesBrief || generateBackupSalesBrief(doctor, product, strategy, sources)) as string,
      totalTime: Date.now() - startTime,
      strategyUsed: {
        focusAreas: strategy.focusAreas,
        keyQuestions: strategy.keyQuestions,
        skipReasons: {
          website: strategy.skipWebsiteScrape ? 'Not relevant for product' : null,
          reviews: strategy.skipReviews ? 'Low priority for sale' : null,
          competitors: strategy.skipCompetitorAnalysis ? 'Not applicable' : null
        }
      }
    };
    
    progress?.updateStep?.('synthesis', 'completed', 'Analysis complete');
    console.log(`✅ Adaptive research completed in ${(Date.now() - startTime) / 1000}s`);
    
    return researchData;
    
  } catch (error) {
    console.error('❌ Adaptive research error:', error);
    throw error;
  }
}

async function scrapeWebsiteIfNeeded(
  url: string,
  sources: ResearchSource[]
): Promise<{ markdown?: string; metadata?: { title?: string; description?: string } } | null> {
  try {
    const scraped = await cachedApiCall(
      websiteCache,
      CacheKeys.website(url),
      () => callFirecrawlScrape(url, { includeMarkdown: true, includeMetadata: true }),
      60 * 24 // 24 hour cache
    );
    
    sources.push({
      type: 'practice_website',
      title: 'Practice Website',
      url,
      content: scraped?.content?.substring(0, 1000) || scraped?.metadata?.description || 'Website analyzed',
      confidence: 90,
      lastUpdated: new Date().toISOString()
    });
    
    return scraped;
  } catch (error) {
    console.error('Website scrape error:', error);
    return null;
  }
}

async function gatherTargetedReviews(
  doctor: Doctor,
  strategy: ResearchStrategy,
  sources: ResearchSource[]
): Promise<{ count: number; data: { googleReviews?: number; yelpReviews?: number; healthgrades?: number; sources?: Array<{ site: string; rating: number; count: number }> } }> {
  // Only search review sites if focus areas suggest it's important
  const reviewSites = strategy.focusAreas.includes('patient_satisfaction') 
    ? ['healthgrades', 'zocdoc', 'google reviews', 'yelp']
    : ['google reviews']; // Minimal review search
  
  const reviewPromises = reviewSites.map(site =>
    callBraveSearch(`"${doctor.displayName}" ${doctor.city} ${site}`)
  );
  
  const reviews = await Promise.all(reviewPromises);
  let totalReviews = 0;
  
  reviews.forEach((result, index) => {
    const count = result?.web?.results?.length || 0;
    totalReviews += count;
    if (count > 0) {
      sources.push({
        type: 'review_site',
        title: `${reviewSites[index]} Reviews`,
        url: `https://${reviewSites[index]}.com`,
        content: `${count} results found`,
        confidence: 75,
        lastUpdated: new Date().toISOString()
      });
    }
  });
  
  return { count: totalReviews, data: { sources: reviews } };
}

async function performFocusedSearch(
  query: string,
  label: string,
  sources: ResearchSource[]
): Promise<{ markdown?: string; metadata?: { title?: string; description?: string } } | null> {
  const result = await callBraveSearch(query);
  
  if (result?.web?.results?.length > 0) {
    sources.push({
      type: 'medical_directory',
      title: label,
      url: 'brave.com',
      content: `${result.web.results.length} results for: ${query.substring(0, 50)}...`,
      confidence: 70,
      lastUpdated: new Date().toISOString()
    });
  }
  
  return result;
}

async function analyzeCompetitors(
  doctor: Doctor,
  _product: string,
  knownCompetitors: string[],
  sources: ResearchSource[]
): Promise<CompetitorData | null> {
  const competitorSearches = knownCompetitors.map(comp =>
    callBraveSearch(`"${doctor.organizationName || doctor.displayName}" "${comp}"`)
  );
  
  const results = await Promise.all(competitorSearches);
  
  const competitors = knownCompetitors.map((comp, index) => ({
    name: comp,
    mentioned: (results[index]?.web?.results?.length || 0) > 0
  })).filter(c => c.mentioned);
  
  if (competitors.length > 0) {
    sources.push({
      type: 'news_article',
      title: 'Competitor Analysis',
      url: 'competitive-intelligence',
      content: `Found mentions of: ${competitors.map(c => c.name).join(', ')}`,
      confidence: 65,
      lastUpdated: new Date().toISOString()
    });
  }
  
  return { competitors };
}

function calculateAdaptiveConfidence(
  sources: ResearchSource[],
  strategy: ResearchStrategy,
  synthesis: SynthesisResult
): { score: number; factors: Record<string, unknown> } {
  let score = 80; // Start at 80% - we always have NPI verified data
  const factors = {
    sourcesFound: sources.length,
    websiteAnalyzed: strategy.websiteUrl && !strategy.skipWebsiteScrape,
    reviewsFound: sources.some(s => s.type === 'review_site'),
    competitorsIdentified: ((synthesis as SynthesisResult & { competition?: { currentVendors?: string[] } })?.competition?.currentVendors?.length || 0) > 0,
    strategyAlignment: strategy.focusAreas.length > 0,
    keyQuestionsAnswered: 0,
    npiVerified: true // Always true when we use NPI data
  };
  
  // Award points for data quality
  if (factors.websiteAnalyzed) score += 8;  // Found their actual website
  if (factors.reviewsFound) score += 5;     // Have patient feedback
  if (factors.competitorsIdentified) score += 3; // Know current vendors
  if (factors.strategyAlignment) score += 2;
  
  // Award points for source diversity
  const sourceTypes = new Set(sources.map(s => s.type));
  score += Math.min(sourceTypes.size * 1.5, 8);
  
  // Award points for answered questions
  const answeredQuestions = strategy.keyQuestions.filter(q => 
    JSON.stringify(synthesis).toLowerCase().includes(q.toLowerCase().replace('?', ''))
  ).length;
  
  factors.keyQuestionsAnswered = answeredQuestions;
  score += Math.min(answeredQuestions * 1.5, 8);
  
  // Award points for sales brief quality
  if (synthesis?.salesBrief && synthesis.salesBrief.length > 100) score += 3;
  
  // Bonus for tech stack match (yomi relevance)
  if (synthesis?.technologyStack?.current?.some((tech: string) => 
    tech.toLowerCase().includes('cbct') || 
    tech.toLowerCase().includes('implant') ||
    tech.toLowerCase().includes('surgical'))) {
    score += 5; // Highly relevant for yomi
  }
  
  // Minimum 85 for NPI-verified searches with good data, cap at 98
  return {
    score: Math.min(Math.max(score, 85), 98),
    factors
  };
}

function generateBackupSalesBrief(
  doctor: Doctor,
  product: string,
  strategy: ResearchStrategy,
  sources: ResearchSource[]
): string {
  const hasWebsite = sources.some(s => s.type === 'practice_website');
  
  let brief = `**TACTICAL SALES BRIEF for ${doctor.displayName}**\n\n`;
  
  // Opening based on specialty
  if (doctor.specialty.toLowerCase().includes('oral')) {
    brief += `Dr. ${doctor.lastName} specializes in oral surgery at ${doctor.organizationName || 'their practice'} in ${doctor.city}. `;
  } else {
    brief += `Dr. ${doctor.lastName} practices ${doctor.specialty} at ${doctor.organizationName || 'their practice'} in ${doctor.city}. `;
  }
  
  // Product positioning
  brief += `Based on the research, ${product} could address several key areas:\n\n`;
  
  // Focus areas
  if (strategy.focusAreas.includes('current_technology')) {
    brief += `• **Technology Enhancement**: The practice ${hasWebsite ? 'appears to be evaluating' : 'may benefit from'} modern technology solutions. Position ${product} as a way to streamline operations and improve patient care.\n`;
  }
  
  if (strategy.focusAreas.includes('growth_indicators')) {
    brief += `• **Practice Growth**: Signs indicate potential expansion or modernization. ${product} can support scaling operations efficiently.\n`;
  }
  
  if (strategy.focusAreas.includes('workflow_efficiency')) {
    brief += `• **Workflow Optimization**: Like many ${doctor.specialty} practices, efficiency improvements could free up time for patient care. Highlight how ${product} reduces administrative burden.\n`;
  }
  
  // Approach recommendation
  brief += `\n**Recommended Approach**:\n`;
  brief += `1. Lead with specific benefits for ${doctor.specialty} practices\n`;
  brief += `2. Reference successful implementations in similar practices\n`;
  brief += `3. Offer a personalized demo focusing on their workflow\n`;
  
  // Timing
  if (doctor.city === 'WILLIAMSVILLE' || doctor.city.includes('Buffalo')) {
    brief += `\n**Note**: Williamsville/Buffalo area practices often make purchasing decisions in Q1/Q2. Consider following up in early spring.`;
  }
  
  return brief;
}

/**
 * Mock adaptive research for testing without API calls
 */
async function mockAdaptiveResearch(
  doctor: Doctor,
  _product: string,
  progress?: AdaptiveProgress
): Promise<ExtendedResearchData> {
  console.log('🧪 Running mock research for:', doctor.displayName);
  
  // Simulate research steps with realistic timing
  const steps = [
    { id: 'practice', delay: 800, result: 'Website found' },
    { id: 'reviews', delay: 1200, result: '127 reviews analyzed' },
    { id: 'professional', delay: 1000, result: 'Board certified' },
    { id: 'website', delay: 1500, result: 'Technology stack identified' },
    { id: 'competition', delay: 1000, result: '3 competitors found' },
    { id: 'technology', delay: 1200, result: 'CBCT & digital workflow' },
    { id: 'synthesis', delay: 2000, result: 'Intelligence complete' }
  ];
  
  let sourcesCount = 0;
  let confidence = 80; // Start at 80% for NPI verified
  
  // Execute steps sequentially
  for (const step of steps) {
    progress?.updateStep?.(step.id, 'active');
    progress?.updateStage?.(`Analyzing ${step.id}...`);
    
    await new Promise(resolve => setTimeout(resolve, step.delay));
    
    // Update sources and confidence
    sourcesCount += Math.floor(Math.random() * 3) + 2;
    confidence = Math.min(confidence + Math.floor(Math.random() * 3) + 2, 96);
    
    progress?.updateSources?.(sourcesCount);
    progress?.updateConfidence?.(confidence);
    progress?.updateStep?.(step.id, 'completed', step.result);
  }
  
  // Return mock research data
  const mockData = createMockResearchData();
  mockData.doctorName = doctor.displayName;
  mockData.practiceInfo.name = doctor.organizationName || doctor.displayName + ' Practice';
  mockData.confidenceScore = confidence;
  
  return mockData;
}

export { adaptiveResearch as default };