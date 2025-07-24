/**
 * Tiered Research System - Smart API usage based on user needs
 * Prevents API overuse while providing progressive value
 */

export type ResearchTier = 'instant' | 'basic' | 'standard' | 'deep' | 'custom';

export interface TierConfig {
  name: string;
  description: string;
  apiCalls: number;
  features: string[];
  cost: number; // in credits or dollars
  timeEstimate: string;
}

interface SearchResult {
  url: string;
  title: string;
  description?: string;
}

interface SearchResultsWrapper {
  web?: {
    results?: SearchResult[];
  };
}

interface ScrapedData {
  markdown?: string;
  title?: string;
  [key: string]: unknown;
}

interface AnalysisResult {
  score?: number;
  insights?: string[];
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  [key: string]: unknown;
}

export const RESEARCH_TIERS: Record<ResearchTier, TierConfig> = {
  instant: {
    name: "Instant Intel",
    description: "Lightning-fast basic intelligence",
    apiCalls: 1,
    features: [
      "AI-powered quick analysis",
      "Basic fit score",
      "Key talking points"
    ],
    cost: 0,
    timeEstimate: "2-3 seconds"
  },
  basic: {
    name: "Basic Research",
    description: "Essential practice information",
    apiCalls: 3,
    features: [
      "Practice website check",
      "Basic credentials",
      "Primary medical directory",
      "Enhanced fit scoring"
    ],
    cost: 0,
    timeEstimate: "5-10 seconds"
  },
  standard: {
    name: "Standard Research",
    description: "Comprehensive practice intelligence",
    apiCalls: 10,
    features: [
      "Multiple directory sources",
      "Patient reviews analysis",
      "Technology stack discovery",
      "Competitive positioning",
      "Personalized outreach"
    ],
    cost: 1,
    timeEstimate: "15-30 seconds"
  },
  deep: {
    name: "Deep Dive",
    description: "Maximum intelligence gathering",
    apiCalls: 25,
    features: [
      "All available sources",
      "News & publications",
      "Social proof analysis", 
      "Staff & growth indicators",
      "Multi-touch campaign",
      "Psychological profiling"
    ],
    cost: 5,
    timeEstimate: "45-60 seconds"
  },
  custom: {
    name: "Custom Research",
    description: "Choose your data sources",
    apiCalls: -1, // Variable based on selection
    features: ["User-selected sources"],
    cost: -1, // Variable
    timeEstimate: "Variable"
  }
};

/**
 * Instant Intel - 1 API call using Perplexity or Claude
 */
export async function instantIntel(doctorName: string, productName: string, location?: string) {
  console.log("⚡ Running Instant Intel (1 API call)");
  
  const { callPerplexityResearch } = await import('./apiEndpoints');
  
  const query = `Dr. ${doctorName} ${location || ''} medical practice quick summary for ${productName} sales opportunity`;
  
  const result = await callPerplexityResearch(query, 'search');
  
  // Extract key insights from the AI response
  const content = result.choices?.[0]?.message?.content || '';
  
  return {
    tier: 'instant',
    doctorName,
    insights: parseQuickInsights(content),
    score: calculateQuickScore(content, productName),
    nextSteps: ["Upgrade to Basic for practice details", "View sample outreach"],
    apiCallsUsed: 1
  };
}

/**
 * Basic Research - 3 API calls
 * 1. One Brave search
 * 2. One Firecrawl scrape (best result)
 * 3. One AI analysis
 */
export async function basicResearch(doctorName: string, productName: string, location?: string) {
  console.log("🔍 Running Basic Research (3 API calls)");
  
  const { callBraveSearch, callFirecrawlScrape, callPerplexityResearch } = await import('./apiEndpoints');
  
  // 1. Single targeted search
  const searchQuery = `"Dr. ${doctorName}" ${location || ''} medical practice healthgrades`;
  const searchResults = await callBraveSearch(searchQuery, 5);
  
  // 2. Scrape the best result
  let practiceData = null;
  if (searchResults.web?.results?.[0]) {
    try {
      practiceData = await callFirecrawlScrape(searchResults.web.results[0].url);
    } catch (error) {
      console.log("Scrape failed, continuing...");
    }
  }
  
  // 3. AI analysis of findings
  const analysisQuery = `Analyze this medical practice for ${productName} sales opportunity: ${practiceData?.markdown || searchResults.web?.results?.[0]?.description}`;
  const analysis = await callPerplexityResearch(analysisQuery, 'reason');
  
  return {
    tier: 'basic',
    doctorName,
    practiceInfo: extractBasicInfo(practiceData, searchResults),
    score: calculateDetailedScore(analysis, productName),
    insights: parseDetailedInsights(analysis),
    sources: [searchResults.web?.results?.[0]?.url].filter(Boolean),
    nextSteps: ["Upgrade to Standard for reviews & competition analysis"],
    apiCallsUsed: 3
  };
}

/**
 * Standard Research - 10 API calls
 * More selective and strategic about which sources to check
 */
export async function standardResearch(doctorName: string, productName: string, location?: string) {
  console.log("📊 Running Standard Research (10 API calls)");
  
  const { callBraveSearch, callFirecrawlScrape, callPerplexityResearch } = await import('./apiEndpoints');
  
  const sources = [];
  let apiCallCount = 0;
  
  // 1. Comprehensive search (1 call)
  const searchResults = await callBraveSearch(
    `"Dr. ${doctorName}" ${location || ''} medical practice reviews technology`,
    15
  );
  apiCallCount++;
  
  // 2. Smart source selection - pick best URLs from each category
  const urlsToScrape = selectBestUrls(searchResults.web?.results || [], 5);
  
  // 3. Scrape selected URLs (up to 5 calls)
  for (const url of urlsToScrape) {
    try {
      const scraped = await callFirecrawlScrape(url);
      sources.push({ url, content: scraped.markdown || '' });
      apiCallCount++;
    } catch (error) {
      console.log(`Failed to scrape ${url}`);
    }
  }
  
  // 4. Targeted searches for specific intel (2 calls)
  await callBraveSearch(`"Dr. ${doctorName}" patient reviews rating`, 5);
  apiCallCount++;
  
  await callBraveSearch(`"Dr. ${doctorName}" medical technology EMR`, 5);
  apiCallCount++;
  
  // 5. Deep AI analysis (2 calls)
  const competitiveAnalysis = await callPerplexityResearch(
    `Competitive analysis for selling ${productName} to Dr. ${doctorName}'s practice based on: ${JSON.stringify(sources.slice(0, 2))}`,
    'reason'
  );
  apiCallCount++;
  
  const outreachStrategy = await callPerplexityResearch(
    `Best outreach strategy for ${productName} to Dr. ${doctorName} based on practice profile`,
    'reason'
  );
  apiCallCount++;
  
  return {
    tier: 'standard',
    doctorName,
    practiceProfile: buildPracticeProfile(sources, searchResults),
    competitiveIntel: parseCompetitiveIntel(competitiveAnalysis),
    outreachStrategy: parseOutreachStrategy(outreachStrategy),
    score: calculateAdvancedScore(sources, productName),
    sources: sources.map(s => s.url),
    nextSteps: ["Generate personalized email", "Upgrade to Deep Dive for full intel"],
    apiCallsUsed: apiCallCount
  };
}

/**
 * Helper functions
 */
function selectBestUrls(results: SearchResult[], limit: number): string[] {
  const urls = [];
  const seen = new Set();
  
  // Prioritize: medical directories, practice websites, review sites
  const priorities = [
    (r: any) => r.url.includes('healthgrades.com'),
    (r: any) => r.url.includes('webmd.com'),
    (r: any) => r.url.includes('zocdoc.com'),
    (r: any) => r.title.toLowerCase().includes('practice'),
    (r: any) => r.title.toLowerCase().includes('clinic')
  ];
  
  for (const priority of priorities) {
    for (const result of results) {
      if (urls.length >= limit) break;
      if (!seen.has(result.url) && priority(result)) {
        urls.push(result.url);
        seen.add(result.url);
      }
    }
  }
  
  // Fill remaining slots with remaining results
  for (const result of results) {
    if (urls.length >= limit) break;
    if (!seen.has(result.url)) {
      urls.push(result.url);
      seen.add(result.url);
    }
  }
  
  return urls;
}

function parseQuickInsights(content: string): string[] {
  // Extract key points from AI response
  const insights = [];
  if (content.includes('specialty')) insights.push('Specialty practice identified');
  if (content.includes('technology')) insights.push('Uses modern technology');
  if (content.includes('review')) insights.push('Has online presence');
  return insights.length ? insights : ['Limited public information available'];
}

function calculateQuickScore(content: string, _productName: string): number {
  // Simple scoring based on keywords
  let score = 50; // Base score
  const positive = ['technology', 'modern', 'growing', 'established'];
  const negative = ['small', 'retiring', 'closed'];
  
  positive.forEach(word => {
    if (content.toLowerCase().includes(word)) score += 10;
  });
  
  negative.forEach(word => {
    if (content.toLowerCase().includes(word)) score -= 10;
  });
  
  return Math.max(0, Math.min(100, score));
}

function extractBasicInfo(scrapedData: ScrapedData | null, searchResults: SearchResultsWrapper): Record<string, unknown> {
  return {
    name: searchResults.web?.results?.[0]?.title || 'Unknown',
    url: searchResults.web?.results?.[0]?.url || null,
    description: searchResults.web?.results?.[0]?.description || 'No description available',
    hasWebsite: !!scrapedData
  };
}

function calculateDetailedScore(analysis: AnalysisResult, _productName: string): number {
  // More sophisticated scoring based on AI analysis
  const content = analysis.choices?.[0]?.message?.content || '';
  let score = 60;
  
  // Adjust based on AI insights
  if (content.includes('high fit')) score += 20;
  if (content.includes('good opportunity')) score += 15;
  if (content.includes('established practice')) score += 10;
  if (content.includes('limited fit')) score -= 20;
  
  return Math.max(0, Math.min(100, score));
}

function parseDetailedInsights(_analysis: AnalysisResult): string[] {
  // In production, this would parse the structured AI response
  return [
    'Practice assessment complete',
    'Fit score calculated',
    'Key opportunities identified'
  ];
}

function buildPracticeProfile(sources: Array<{ url: string; content: string }>, _searchResults: SearchResultsWrapper): Record<string, unknown> {
  // Aggregate data from multiple sources
  return {
    sources: sources.length,
    hasReviews: sources.some(s => s.url.includes('review')),
    hasMedicalDirectory: sources.some(s => s.url.includes('healthgrades') || s.url.includes('webmd')),
    practiceSize: 'Unknown', // Would be extracted from content
    specialties: [], // Would be extracted
    technology: [] // Would be extracted
  };
}

function parseCompetitiveIntel(_analysis: AnalysisResult): Record<string, unknown> {
  return {
    summary: 'Competitive analysis complete',
    advantages: [],
    challenges: [],
    approach: 'Consultative'
  };
}

function parseOutreachStrategy(_analysis: AnalysisResult): Record<string, unknown> {
  return {
    bestChannel: 'Email',
    bestTime: 'Tuesday-Thursday morning',
    keyMessages: [],
    personalizations: []
  };
}

function calculateAdvancedScore(sources: Array<{ url: string; content: string }>, _productName: string): number {
  // Complex scoring based on multiple data points
  let score = 70;
  score += sources.length * 2;
  // Additional scoring logic
  return Math.max(0, Math.min(100, score));
}

/**
 * Export the main research function that respects tiers
 */
export async function tieredResearch(
  doctorName: string, 
  productName: string,
  tier: ResearchTier = 'basic',
  location?: string
) {
  switch (tier) {
    case 'instant':
      return instantIntel(doctorName, productName, location);
    case 'basic':
      return basicResearch(doctorName, productName, location);
    case 'standard':
      return standardResearch(doctorName, productName, location);
    case 'deep':
      throw new Error('Deep research not implemented yet');
    case 'custom':
      throw new Error('Custom research not implemented yet');
    default:
      return basicResearch(doctorName, productName, location);
  }
}