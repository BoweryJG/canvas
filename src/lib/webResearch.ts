import { supabase } from '../auth/supabase';

export interface ResearchSource {
  url: string;
  title: string;
  type: 'practice_website' | 'medical_directory' | 'review_site' | 'news_article' | 'social_media' | 'hospital_affiliation';
  content: string;
  confidence: number; // 0-100
  lastUpdated: string;
}

export interface ResearchData {
  doctorName: string;
  practiceInfo: {
    name?: string;
    address?: string;
    phone?: string;
    website?: string;
    specialties?: string[];
    services?: string[];
    technology?: string[];
    staff?: number;
    established?: string;
  };
  credentials: {
    medicalSchool?: string;
    residency?: string;
    boardCertifications?: string[];
    yearsExperience?: number;
    hospitalAffiliations?: string[];
  };
  reviews: {
    averageRating?: number;
    totalReviews?: number;
    commonPraise?: string[];
    commonConcerns?: string[];
    recentFeedback?: string[];
  };
  businessIntel: {
    practiceType?: string;
    patientVolume?: string;
    marketPosition?: string;
    recentNews?: string[];
    growthIndicators?: string[];
  };
  sources: ResearchSource[];
  confidenceScore: number;
  completedAt: string;
  linkedinUrl?: string;
}

/**
 * Main research orchestrator - coordinates all research activities
 */
export async function conductDoctorResearch(doctorName: string, location?: string): Promise<ResearchData> {
  console.log(`🔍 Starting comprehensive research for Dr. ${doctorName}`);
  
  try {
    // Check cache first
    const cachedResearch = await getCachedResearch(doctorName);
    if (cachedResearch && !isResearchExpired(cachedResearch)) {
      console.log('📋 Using cached research data');
      return cachedResearch;
    }

    // Parallel research threads for maximum efficiency
    const [
      practiceResults,
      directoryResults, 
      reviewResults,
      newsResults,
      perplexityResults
    ] = await Promise.allSettled([
      searchPracticeWebsites(doctorName, location),
      searchMedicalDirectories(doctorName),
      searchReviewSites(doctorName),
      searchNewsAndArticles(doctorName),
      searchWithPerplexity(doctorName, location)
    ]);

    // Consolidate all research findings
    const consolidatedData = await consolidateResearchData(
      doctorName,
      [practiceResults, directoryResults, reviewResults, newsResults, perplexityResults]
    );

    // Cache the results
    await cacheResearchData(consolidatedData);

    console.log(`✅ Research completed with ${consolidatedData.confidenceScore}% confidence`);
    return consolidatedData;

  } catch (error) {
    console.error('Research pipeline failed:', error);
    return createFallbackResearchData(doctorName);
  }
}

/**
 * Search for practice websites and extract practice information
 */
async function searchPracticeWebsites(doctorName: string, location?: string): Promise<ResearchSource[]> {
  const sources: ResearchSource[] = [];
  
  try {
    const queries = [
      `"Dr. ${doctorName}" practice website ${location || ''}`,
      `"${doctorName} MD" office location contact`,
      `"${doctorName}" medical practice services`
    ];

    for (const query of queries) {
      const searchResults = await braveSearch(query);
      
      for (const result of searchResults.slice(0, 3)) {
        if (isPracticeWebsite(result.url)) {
          const content = await firecrawlScrape(result.url);
          if (content) {
            sources.push({
              url: result.url,
              title: result.title,
              type: 'practice_website',
              content: content,
              confidence: 90,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Practice website search failed:', error);
  }

  return sources;
}

/**
 * Search medical directories for credentials and basic info
 */
async function searchMedicalDirectories(doctorName: string): Promise<ResearchSource[]> {
  const sources: ResearchSource[] = [];
  
  try {
    const queries = [
      `"Dr. ${doctorName}" site:healthgrades.com`,
      `"Dr. ${doctorName}" site:webmd.com`,
      `"Dr. ${doctorName}" site:vitals.com`,
      `"${doctorName} MD" medical directory credentials`
    ];

    for (const query of queries) {
      const searchResults = await braveSearch(query);
      
      for (const result of searchResults.slice(0, 2)) {
        if (isMedicalDirectory(result.url)) {
          const content = await firecrawlScrape(result.url);
          if (content) {
            sources.push({
              url: result.url,
              title: result.title,
              type: 'medical_directory',
              content: content,
              confidence: 85,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Medical directory search failed:', error);
  }

  return sources;
}

/**
 * Search review sites for patient feedback and ratings
 */
async function searchReviewSites(doctorName: string): Promise<ResearchSource[]> {
  const sources: ResearchSource[] = [];
  
  try {
    const queries = [
      `"Dr. ${doctorName}" reviews rating patients`,
      `"Dr. ${doctorName}" site:zocdoc.com`,
      `"${doctorName}" doctor reviews feedback`
    ];

    for (const query of queries) {
      const searchResults = await braveSearch(query);
      
      for (const result of searchResults.slice(0, 2)) {
        if (isReviewSite(result.url)) {
          const content = await firecrawlScrape(result.url);
          if (content) {
            sources.push({
              url: result.url,
              title: result.title,
              type: 'review_site',
              content: content,
              confidence: 75,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Review site search failed:', error);
  }

  return sources;
}

/**
 * Search for news articles and professional mentions
 */
async function searchNewsAndArticles(doctorName: string): Promise<ResearchSource[]> {
  const sources: ResearchSource[] = [];
  
  try {
    const queries = [
      `"Dr. ${doctorName}" news article interview`,
      `"${doctorName}" medical conference speaker`,
      `"Dr. ${doctorName}" research publication study`
    ];

    for (const query of queries) {
      const searchResults = await braveSearch(query);
      
      for (const result of searchResults.slice(0, 2)) {
        if (isNewsOrArticle(result.url)) {
          const content = await firecrawlScrape(result.url);
          if (content) {
            sources.push({
              url: result.url,
              title: result.title,
              type: 'news_article',
              content: content,
              confidence: 70,
              lastUpdated: new Date().toISOString()
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('News article search failed:', error);
  }

  return sources;
}

/**
 * Search with Perplexity for AI-powered research and analysis
 */
async function searchWithPerplexity(doctorName: string, location?: string): Promise<ResearchSource[]> {
  const sources: ResearchSource[] = [];
  
  try {
    const { callPerplexityResearch } = await import('./apiEndpoints');
    
    // Multi-stage Perplexity research
    const queries = [
      {
        query: `Dr. ${doctorName} ${location || ''} medical practice credentials background`,
        mode: 'search' as const,
        type: 'perplexity_search'
      },
      {
        query: `Dr. ${doctorName} practice technology patient reviews medical devices`,
        mode: 'reason' as const,
        type: 'perplexity_analysis'
      }
    ];

    for (const { query, mode, type } of queries) {
      const result = await callPerplexityResearch(query, mode);
      
      if (result.choices?.[0]?.message?.content) {
        sources.push({
          url: `https://perplexity.ai/search?q=${encodeURIComponent(query)}`,
          title: `Perplexity ${mode} - ${doctorName}`,
          type: type as any,
          content: result.choices[0].message.content,
          confidence: 85, // High confidence for AI-powered research
          lastUpdated: new Date().toISOString()
        });
      }
      
      // Add citations as additional sources
      if (result.citations?.length) {
        result.citations.forEach((citation: any, index: number) => {
          sources.push({
            url: citation.url || `citation-${index}`,
            title: citation.title || `Citation ${index + 1}`,
            type: 'perplexity_citation' as any,
            content: citation.text || citation.snippet || '',
            confidence: 80,
            lastUpdated: new Date().toISOString()
          });
        });
      }
    }
  } catch (error) {
    console.error('Perplexity search failed:', error);
  }

  return sources;
}

/**
 * Brave Search API integration
 */
async function braveSearch(query: string): Promise<any[]> {
  try {
    // Import our API endpoint handler
    const { callBraveSearch } = await import('./apiEndpoints');
    const data = await callBraveSearch(query, 10);
    return data.web?.results || [];
  } catch (error) {
    console.error('Brave Search failed:', error);
    return [];
  }
}

/**
 * Firecrawl scraping integration
 */
async function firecrawlScrape(url: string): Promise<string | null> {
  try {
    // Import our API endpoint handler
    const { callFirecrawlScrape } = await import('./apiEndpoints');
    const data = await callFirecrawlScrape(url, {
      formats: ['markdown'],
      onlyMainContent: true,
      removeBase64Images: true
    });
    
    return data.success ? (data.markdown || null) : null;
  } catch (error) {
    console.error(`Firecrawl scraping failed for ${url}:`, error);
    return null;
  }
}

/**
 * Consolidate research from multiple sources into structured data
 */
async function consolidateResearchData(
  doctorName: string, 
  researchResults: PromiseSettledResult<ResearchSource[]>[]
): Promise<ResearchData> {
  
  const allSources: ResearchSource[] = [];
  
  // Collect all successful research sources
  researchResults.forEach(result => {
    if (result.status === 'fulfilled') {
      allSources.push(...result.value);
    }
  });

  // Extract structured information using AI
  const structuredData = await extractStructuredData(doctorName, allSources);
  
  // Calculate overall confidence score
  const confidenceScore = calculateConfidenceScore(allSources, structuredData);

  return {
    doctorName,
    practiceInfo: structuredData.practiceInfo || {},
    credentials: structuredData.credentials || {},
    reviews: structuredData.reviews || {},
    businessIntel: structuredData.businessIntel || {},
    sources: allSources,
    confidenceScore,
    completedAt: new Date().toISOString()
  };
}

/**
 * Use AI to extract structured data from raw research content
 */
async function extractStructuredData(_doctorName: string, _sources: ResearchSource[]): Promise<Partial<ResearchData>> {
  try {
    // Combine all source content for analysis
    // const combinedContent = _sources.map((source: any) => 
    //   `SOURCE: ${source.type} - ${source.title}\nCONTENT: ${source.content.slice(0, 2000)}\n---\n`
    // ).join('\n');

    // Use AI to structure the data (implement with your preferred AI service)
    // const _prompt = `Analyze this research data about Dr. ${_doctorName} and extract structured information:

// ${combinedContent}

// Extract and return JSON with the following structure:
// {
//   "practiceInfo": {
//     "name": "practice name",
//     "address": "full address", 
//     "phone": "phone number",
//     "website": "website URL",
//     "specialties": ["specialty1", "specialty2"],
//     "services": ["service1", "service2"],
//     "technology": ["EHR system", "equipment"],
//     "staff": "estimated staff size",
//     "established": "year established"
//   },
//   "credentials": {
//     "medicalSchool": "school name",
//     "residency": "residency info",
//     "boardCertifications": ["cert1", "cert2"],
//     "yearsExperience": number,
//     "hospitalAffiliations": ["hospital1", "hospital2"]
//   },
//   "reviews": {
//     "averageRating": number,
//     "totalReviews": number,
//     "commonPraise": ["praise1", "praise2"],
//     "commonConcerns": ["concern1", "concern2"],
//     "recentFeedback": ["feedback1", "feedback2"]
//   },
//   "businessIntel": {
//     "practiceType": "solo/group/hospital",
//     "patientVolume": "high/medium/low",
//     "marketPosition": "description",
//     "recentNews": ["news1", "news2"],
//     "growthIndicators": ["indicator1", "indicator2"]
//   }
// }

// Only include information that is explicitly found in the research. Use null for missing data.`;

    // This would integrate with your AI service - for now return structured placeholder
    return {
      practiceInfo: {},
      credentials: {},
      reviews: {},
      businessIntel: {}
    };

  } catch (error) {
    console.error('Data structuring failed:', error);
    return {};
  }
}

/**
 * Calculate confidence score based on source quality and data completeness
 */
function calculateConfidenceScore(sources: ResearchSource[], data: Partial<ResearchData>): number {
  let score = 0;
  
  // Source quality scoring
  const practiceWebsites = sources.filter(s => s.type === 'practice_website').length;
  const medicalDirectories = sources.filter(s => s.type === 'medical_directory').length;
  const reviews = sources.filter(s => s.type === 'review_site').length;
  
  score += practiceWebsites * 30; // Practice websites are most valuable
  score += medicalDirectories * 25; // Medical directories for credentials
  score += reviews * 20; // Reviews for patient feedback
  
  // Data completeness scoring
  if (data.practiceInfo?.name) score += 10;
  if (data.practiceInfo?.address) score += 10;
  if (data.credentials?.boardCertifications?.length) score += 15;
  if (data.reviews?.averageRating) score += 10;
  
  return Math.min(score, 100);
}

/**
 * URL classification helpers
 */
function isPracticeWebsite(url: string): boolean {
  const practiceIndicators = [
    'practice', 'medical', 'clinic', 'health', 'doctor', 'physician', 
    'medicine', 'surgery', 'orthopedic', 'cardiology', 'dermatology'
  ];
  return practiceIndicators.some(indicator => url.toLowerCase().includes(indicator));
}

function isMedicalDirectory(url: string): boolean {
  const directories = ['healthgrades.com', 'webmd.com', 'vitals.com', 'zocdoc.com', 'doximity.com'];
  return directories.some(dir => url.includes(dir));
}

function isReviewSite(url: string): boolean {
  const reviewSites = ['healthgrades.com', 'vitals.com', 'zocdoc.com', 'ratemds.com', 'wellness.com'];
  return reviewSites.some(site => url.includes(site));
}

function isNewsOrArticle(url: string): boolean {
  const newsSites = [
    'news', 'article', 'journal', 'publication', 'interview', 'conference',
    'medscape.com', 'healthcare.com', 'modernhealthcare.com'
  ];
  return newsSites.some(indicator => url.toLowerCase().includes(indicator));
}

/**
 * Research caching functions
 */
async function getCachedResearch(doctorName: string): Promise<ResearchData | null> {
  try {
    const { data, error } = await supabase
      .from('canvas_research_cache')
      .select('*')
      .eq('doctor_name', doctorName.toLowerCase())
      .single();

    if (error || !data) return null;
    
    return {
      doctorName: data.doctor_name,
      ...data.research_data,
      confidenceScore: data.confidence_score,
      completedAt: data.last_updated
    };
  } catch (error) {
    console.error('Cache retrieval failed:', error);
    return null;
  }
}

async function cacheResearchData(researchData: ResearchData): Promise<void> {
  try {
    const { error } = await supabase
      .from('canvas_research_cache')
      .upsert({
        doctor_name: researchData.doctorName.toLowerCase(),
        research_data: {
          practiceInfo: researchData.practiceInfo,
          credentials: researchData.credentials,
          reviews: researchData.reviews,
          businessIntel: researchData.businessIntel,
          sources: researchData.sources
        },
        confidence_score: researchData.confidenceScore,
        last_updated: new Date().toISOString(),
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });

    if (error) {
      console.error('Cache storage failed:', error);
    }
  } catch (error) {
    console.error('Cache operation failed:', error);
  }
}

function isResearchExpired(cachedData: any): boolean {
  if (!cachedData.expiry_date) return true;
  return new Date() > new Date(cachedData.expiry_date);
}

/**
 * Fallback data when research fails
 */
function createFallbackResearchData(doctorName: string): ResearchData {
  return {
    doctorName,
    practiceInfo: {},
    credentials: {},
    reviews: {},
    businessIntel: {},
    sources: [],
    confidenceScore: 0,
    completedAt: new Date().toISOString()
  };
}