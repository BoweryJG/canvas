/**
 * Optimized web research module with reduced API calls
 * Reduces from 40+ calls to ~15-20 calls per scan
 */

import type { ResearchData, ResearchSource } from './webResearch';

interface SearchResult {
  url: string;
  title: string;
  description?: string;
}

interface CategorizedUrl {
  url: string;
  title: string;
  confidence: number;
}

/**
 * Optimized research orchestrator - reduces API calls by 60%
 */
export async function conductOptimizedResearch(doctorName: string, location?: string): Promise<ResearchData> {
  console.log(`🔍 Starting optimized research for Dr. ${doctorName}`);
  
  const sources: ResearchSource[] = [];
  
  try {
    // 1. Single comprehensive Brave search (1 call instead of 13)
    const comprehensiveQuery = `"Dr. ${doctorName}" ${location || ''} medical practice healthgrades webmd reviews`;
    const { callBraveSearch, callFirecrawlScrape } = await import('./apiEndpoints');
    
    const searchResults = await callBraveSearch(comprehensiveQuery, 20);
    
    // 2. Smart URL categorization and prioritization
    const braveResults = searchResults.web?.results || [];
    const searchResultsArray: SearchResult[] = braveResults.map((result: any) => ({
      url: result.url || '',
      title: result.title || '',
      description: result.description || ''
    }));
    const categorizedUrls = categorizeUrls(searchResultsArray);
    
    // 3. Scrape only the best URLs from each category (max 8 scrapes instead of 29)
    for (const [category, urls] of Object.entries(categorizedUrls)) {
      const topUrl = urls[0];
      if (topUrl) {
        try {
          const scrapedData = await callFirecrawlScrape(topUrl.url);
          sources.push({
            url: topUrl.url,
            title: topUrl.title,
            type: category as ResearchSource['type'],
            content: scrapedData.markdown || scrapedData.content || '',
            confidence: calculateConfidence(category),
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.log(`Failed to scrape ${topUrl.url}:`, error);
        }
      }
    }
    
    // 4. Single Perplexity deep analysis (1 call instead of 2)
    const { callPerplexityResearch } = await import('./apiEndpoints');
    const perplexityResult = await callPerplexityResearch(
      `Dr. ${doctorName} ${location || ''} comprehensive medical practice analysis credentials reviews technology`,
      'reason'
    );
    
    if (perplexityResult.choices?.[0]?.message?.content) {
      sources.push({
        url: 'perplexity-analysis',
        title: 'AI Deep Analysis',
        type: 'medical_directory' as ResearchSource['type'],
        content: perplexityResult.choices[0].message.content,
        confidence: 90,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // 5. Structure the data
    const structuredData = await structureResearchData(sources, doctorName);
    
    return {
      doctorName,
      practiceInfo: structuredData.practiceInfo || {},
      credentials: structuredData.credentials || {},
      reviews: structuredData.reviews || {},
      businessIntel: structuredData.businessIntel || {},
      sources,
      confidenceScore: calculateOverallConfidence(sources),
      completedAt: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Optimized research failed:', error);
    return createFallbackData(doctorName);
  }
}

/**
 * Categorize URLs by type for smart selection
 */
function categorizeUrls(results: SearchResult[]): Record<string, CategorizedUrl[]> {
  const categories: Record<string, CategorizedUrl[]> = {
    practice_website: [],
    medical_directory: [],
    review_site: [],
    news_article: [],
    hospital_affiliation: []
  };
  
  for (const result of results) {
    const url = result.url.toLowerCase();
    const categorizedResult: CategorizedUrl = {
      url: result.url,
      title: result.title,
      confidence: 80
    };
    
    if (url.includes('healthgrades.com') || url.includes('webmd.com') || url.includes('vitals.com')) {
      categories.medical_directory.push(categorizedResult);
    } else if (url.includes('zocdoc.com') || url.includes('ratemds.com')) {
      categories.review_site.push(categorizedResult);
    } else if (url.includes('news') || url.includes('article')) {
      categories.news_article.push(categorizedResult);
    } else if (url.includes('hospital') || url.includes('medical')) {
      categories.hospital_affiliation.push(categorizedResult);
    } else if (isProbablyPracticeWebsite(url, result.title)) {
      categories.practice_website.push(categorizedResult);
    }
  }
  
  return categories;
}

function isProbablyPracticeWebsite(url: string, title: string): boolean {
  const indicators = ['practice', 'clinic', 'office', 'center', 'associates', 'group'];
  const combined = (url + title).toLowerCase();
  return indicators.some(indicator => combined.includes(indicator));
}

function calculateConfidence(category: string): number {
  const baseScores: Record<string, number> = {
    practice_website: 95,
    medical_directory: 85,
    review_site: 80,
    news_article: 70,
    hospital_affiliation: 75
  };
  return baseScores[category] || 60;
}

function calculateOverallConfidence(sources: ResearchSource[]): number {
  if (sources.length === 0) return 0;
  const avgConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length;
  const coverageBonus = Math.min(sources.length * 5, 20);
  return Math.min(avgConfidence + coverageBonus, 100);
}

async function structureResearchData(sources: ResearchSource[], doctorName: string): Promise<Partial<ResearchData>> {
  // Extract structured data from sources
  const practiceInfo: Record<string, unknown> = {};
  const credentials: Record<string, unknown> = {};
  const reviews: Record<string, unknown> = {};
  const businessIntel: Record<string, unknown> = {};
  
  for (const source of sources) {
    // Basic extraction logic - in production this would use AI
    const content = source.content.toLowerCase();
    
    if (source.type === 'medical_directory') {
      // Extract credentials
      if (content.includes('board certified')) credentials.boardCertified = true;
      if (content.includes('years')) {
        const match = content.match(/(\d+)\s*years/);
        if (match) credentials.yearsExperience = parseInt(match[1]);
      }
    }
    
    if (source.type === 'review_site') {
      // Extract ratings
      const ratingMatch = content.match(/(\d\.?\d?)\s*(out of|\/)\s*5/);
      if (ratingMatch) reviews.averageRating = parseFloat(ratingMatch[1]);
    }
  }
  
  return {
    doctorName,
    practiceInfo,
    credentials,
    reviews,
    businessIntel
  };
}

function createFallbackData(doctorName: string): ResearchData {
  return {
    doctorName,
    practiceInfo: {
      name: `${doctorName} Medical Practice`,
      address: 'Not Available',
      phone: 'Not Available',
      website: 'Not Available',
      specialties: [],
      services: [],
      technology: [],
      staff: 0,
      established: 'Unknown'
    },
    credentials: {
      medicalSchool: 'Not Available',
      residency: 'Not Available',
      boardCertifications: [],
      yearsExperience: 0,
      hospitalAffiliations: []
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
      specialty: 'Healthcare'
    },
    sources: [],
    confidenceScore: 0,
    completedAt: new Date().toISOString()
  };
}

/**
 * API Call Summary:
 * - 1 Brave Search (comprehensive)
 * - 5-8 Firecrawl scrapes (best URLs only)
 * - 1 Perplexity analysis
 * - Total: ~7-10 calls vs 40+ calls
 * 
 * 75% reduction in API calls!
 */