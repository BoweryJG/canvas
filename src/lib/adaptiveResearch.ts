/**
 * Adaptive Research Pipeline with Sequential Thinking
 * Intelligently routes research based on initial findings
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { type ResearchData, type ResearchSource } from './webResearch';
import { callBraveSearch, callBraveLocalSearch, callFirecrawlScrape, callOpenRouter } from './apiEndpoints';
import { analyzeInitialResults, synthesizeWithSequentialGuidance, type ResearchStrategy } from './sequentialThinkingResearch';
import { calculateEnhancedConfidence } from './enhancedConfidenceScoring';
import { cachedApiCall, CacheKeys } from './intelligentCaching';

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
  existingWebsite?: string,
  progress?: AdaptiveProgress
): Promise<ResearchData> {
  console.log('🧠 ADAPTIVE RESEARCH with Sequential Thinking for:', doctor.displayName);
  
  const sources: ResearchSource[] = [];
  const startTime = Date.now();
  
  try {
    // Step 1: Initial reconnaissance
    progress?.updateStage?.('Initial search and analysis...');
    progress?.updateStep?.('analysis', 'active');
    
    // Quick initial search
    const initialSearch = await cachedApiCall(
      CacheKeys.webSearch(doctor.displayName, doctor.city),
      () => callBraveSearch(`"${doctor.displayName}" ${doctor.specialty} ${doctor.city} ${doctor.state}`),
      300000 // 5 min cache
    );
    
    sources.push({
      type: 'search',
      title: 'Initial Web Search',
      url: 'brave.com',
      summary: `Found ${initialSearch?.web?.results?.length || 0} results`
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
    strategy.searchQueries.forEach((query, index) => {
      searchPromises.push(
        performFocusedSearch(query, `Focus Area ${index + 1}`, sources)
      );
    });
    
    // Execute all searches in parallel
    const searchResults = await Promise.all(searchPromises);
    
    progress?.updateSources?.(sources.length);
    
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
        `${competitorData.competitors.length} competitors analyzed`);
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
      initialFindings: initialSearch
    };
    
    const synthesis = await synthesizeWithSequentialGuidance(
      allData,
      strategy,
      doctor,
      product
    );
    
    // Calculate confidence with strategy awareness
    const confidence = calculateAdaptiveConfidence(sources, strategy, synthesis);
    progress?.updateConfidence?.(confidence.score);
    
    // Build final research data
    const researchData: ResearchData = {
      doctorName: doctor.displayName,
      practiceInfo: synthesis.practiceProfile || {},
      credentials: synthesis.credentials || {},
      reviews: synthesis.reviews || {},
      businessIntel: synthesis.businessIntel || {},
      technologyStack: synthesis.technologyStack || {},
      marketPosition: synthesis.marketPosition || {},
      buyingSignals: synthesis.buyingSignals || [],
      competition: synthesis.competition || {},
      approachStrategy: synthesis.approachStrategy || {},
      painPoints: synthesis.painPoints || [],
      decisionMakers: synthesis.decisionMakers || {},
      budgetInfo: synthesis.budgetIndicators || {},
      sources,
      confidenceScore: confidence.score,
      confidenceFactors: confidence.factors,
      salesBrief: synthesis.salesBrief || '',
      completedAt: new Date().toISOString(),
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
): Promise<any> {
  try {
    const scraped = await cachedApiCall(
      CacheKeys.websiteScrape(url),
      () => callFirecrawlScrape(url, true, true),
      86400000 // 24 hour cache
    );
    
    sources.push({
      type: 'website',
      title: 'Practice Website',
      url,
      summary: scraped?.metadata?.description || 'Website analyzed'
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
): Promise<{ count: number; data: any }> {
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
        type: 'reviews',
        title: `${reviewSites[index]} Reviews`,
        url: reviewSites[index],
        summary: `${count} results found`
      });
    }
  });
  
  return { count: totalReviews, data: reviews };
}

async function performFocusedSearch(
  query: string,
  label: string,
  sources: ResearchSource[]
): Promise<any> {
  const result = await callBraveSearch(query);
  
  if (result?.web?.results?.length > 0) {
    sources.push({
      type: 'search',
      title: label,
      url: 'brave.com',
      summary: `${result.web.results.length} results for: ${query.substring(0, 50)}...`
    });
  }
  
  return result;
}

async function analyzeCompetitors(
  doctor: Doctor,
  product: string,
  knownCompetitors: string[],
  sources: ResearchSource[]
): Promise<any> {
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
      type: 'competition',
      title: 'Competitor Analysis',
      url: 'competitive-intelligence',
      summary: `Found mentions of: ${competitors.map(c => c.name).join(', ')}`
    });
  }
  
  return { competitors };
}

function calculateAdaptiveConfidence(
  sources: ResearchSource[],
  strategy: ResearchStrategy,
  synthesis: any
): { score: number; factors: any } {
  let score = 50; // Base score
  const factors = {
    sourcesFound: sources.length,
    websiteAnalyzed: strategy.websiteUrl && !strategy.skipWebsiteScrape,
    reviewsFound: sources.some(s => s.type === 'reviews'),
    competitorsIdentified: synthesis.competition?.currentVendors?.length > 0,
    strategyAlignment: strategy.focusAreas.length > 0,
    keyQuestionsAnswered: 0
  };
  
  // Award points for data quality
  if (factors.websiteAnalyzed) score += 15;
  if (factors.reviewsFound) score += 10;
  if (factors.competitorsIdentified) score += 10;
  if (factors.strategyAlignment) score += 5;
  
  // Award points for answered questions
  const answeredQuestions = strategy.keyQuestions.filter(q => 
    JSON.stringify(synthesis).toLowerCase().includes(q.toLowerCase().replace('?', ''))
  ).length;
  
  factors.keyQuestionsAnswered = answeredQuestions;
  score += Math.min(answeredQuestions * 3, 15);
  
  // Cap at 95
  return {
    score: Math.min(score, 95),
    factors
  };
}

export { adaptiveResearch as default };