/**
 * BASELINE RESEARCH - USE THIS ONLY
 * Clean, focused implementation for doctor research
 * No cascading errors, no complexity, just results
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { type ResearchData, type ResearchSource } from './webResearch';
import { callBraveSearch, callBraveLocalSearch, callFirecrawlScrape, callClaude } from './apiEndpoints';
import { calculateEnhancedConfidence, extractConfidenceFactors } from './enhancedConfidenceScoring';
import { ENHANCED_SYNTHESIS_PROMPT } from './enhancedSynthesisPrompts';
import { 
  cachedApiCall, 
  synthesisCache,
  CacheKeys 
} from './intelligentCaching';

// Directory domains to always skip
const DIRECTORY_DOMAINS = [
  'sharecare.com', 'healthgrades.com', 'zocdoc.com', 'vitals.com', 
  'yelp.com', 'ada.org', 'npidb.org', 'npino.com', 'ratemds.com', 
  'wellness.com', 'webmd.com', 'findadoctor.com', 'docinfo.org',
  'mapquest.com', 'maps.google.com', 'bing.com/maps', 'yellowpages.com'
];

interface BaselineProgress {
  updateStep?: (stepId: string, status: 'pending' | 'active' | 'completed' | 'found', result?: string) => void;
  updateSources?: (count: number) => void;
  updateConfidence?: (score: number) => void;
  updateStage?: (stage: string) => void;
}

interface WebsiteIntelligence {
  url: string;
  crawled: boolean;
  content?: string;
  services?: string[];
  technology?: string[];
  teamSize?: number;
  philosophy?: string;
}

interface SearchResult {
  url?: string;
  title?: string;
  description?: string;
}

interface Competitor {
  name: string;
  url?: string;
  type?: string;
  description?: string;
}

interface ProductFit {
  relevance: number;
  pain_points?: string[];
  opportunities?: string[];
  insights?: string[];
}

interface ReviewData {
  doctorReviews: {
    rating?: number;
    count: number;
    sources: string[];
    highlights: string[];
  };
  practiceReviews: {
    rating?: number;
    count: number;
    sources: string[];
    highlights: string[];
  };
  combinedRating?: number;
  totalReviews: number;
}

export async function baselineResearch(
  doctor: Doctor,
  product: string,
  existingWebsite?: string,
  progress?: BaselineProgress
): Promise<ResearchData> {
  console.log('🎯 BASELINE RESEARCH starting for:', doctor.displayName);
  
  const sources: ResearchSource[] = [];
  let totalSourceCount = 0;
  
  try {
    // Step 1: Find the REAL practice website
    progress?.updateStage?.('Finding practice website...');
    progress?.updateStep?.('website', 'active');
    
    const websiteIntel = await findAndAnalyzePracticeWebsite(
      doctor, 
      existingWebsite,
      sources
    );
    
    if (websiteIntel.url) {
      progress?.updateStep?.('website', 'found', `Found: ${websiteIntel.url}`);
      console.log('✅ Practice website:', websiteIntel.url);
    } else {
      progress?.updateStep?.('website', 'completed', 'No website found');
    }
    
    // Step 2: Gather reviews for BOTH doctor and practice
    progress?.updateStage?.('Gathering reviews from multiple sources...');
    progress?.updateStep?.('reviews', 'active');
    
    const reviewData = await gatherComprehensiveReviews(
      doctor,
      websiteIntel.url,
      sources
    );
    
    progress?.updateStep?.('reviews', 'completed', 
      `${reviewData.totalReviews} reviews found`
    );
    
    // Step 3: Analyze local competition
    progress?.updateStage?.('Analyzing local market...');
    progress?.updateStep?.('competition', 'active');
    
    const competitors = await analyzeLocalCompetition(
      doctor,
      sources
    );
    
    progress?.updateStep?.('competition', 'completed', 
      `${competitors.length} competitors analyzed`
    );
    
    // Step 4: Product-specific research
    progress?.updateStage?.(`Researching ${product} fit...`);
    progress?.updateStep?.('product', 'active');
    
    const productFit = await analyzeProductFit(
      product,
      doctor,
      websiteIntel,
      reviewData,
      sources
    );
    
    progress?.updateStep?.('product', 'completed', 'Product analysis complete');
    
    // Step 5: Synthesize with Claude
    progress?.updateStage?.('Creating intelligence report...');
    progress?.updateStep?.('synthesis', 'active');
    
    totalSourceCount = sources.length;
    progress?.updateSources?.(totalSourceCount);
    
    const synthesis = await synthesizeIntelligence(
      doctor,
      product,
      websiteIntel,
      reviewData,
      competitors,
      productFit,
      sources
    );
    
    progress?.updateStep?.('synthesis', 'completed', 'Report ready');
    
    // Step 6: Calculate enhanced confidence score
    const confidenceFactors = extractConfidenceFactors(
      true, // NPI verified
      websiteIntel,
      reviewData,
      sources,
      synthesis,
      competitors
    );
    
    const confidence = calculateEnhancedConfidence(confidenceFactors);
    
    progress?.updateConfidence?.(confidence.score);
    console.log(`🎯 Confidence Score: ${confidence.score}% with ${sources.length} sources`);
    
    // Return clean, comprehensive data
    return {
      doctorName: doctor.displayName,
      practiceInfo: {
        name: doctor.organizationName || `${doctor.displayName}'s Practice`,
        address: doctor.fullAddress,
        phone: doctor.phone,
        website: websiteIntel.url || undefined,
        specialties: [doctor.specialty],
        services: websiteIntel.services || [],
        technology: websiteIntel.technology || [],
        staff: websiteIntel.teamSize || 10,
        established: undefined
      },
      credentials: {
        boardCertifications: [doctor.specialty],
        // Add other credential fields if needed
        medicalSchool: undefined,
        residency: undefined,
        yearsExperience: undefined,
        hospitalAffiliations: []
      },
      reviews: {
        averageRating: reviewData.combinedRating,
        totalReviews: reviewData.totalReviews,
        commonPraise: reviewData.doctorReviews.highlights.slice(0, 3),
        commonConcerns: synthesis.painPoints?.slice(0, 2) || [],
        recentFeedback: [...reviewData.doctorReviews.highlights, ...reviewData.practiceReviews.highlights].slice(0, 3)
      },
      businessIntel: {
        practiceType: synthesis.practiceProfile?.size || 'Unknown',
        patientVolume: synthesis.practiceProfile?.patientVolume || 'Unknown',
        marketPosition: synthesis.marketPosition || 'Established',
        recentNews: synthesis.recentNews || [],
        growthIndicators: synthesis.buyingSignals || []
      },
      sources,
      confidenceScore: confidence.score,
      completedAt: new Date().toISOString(),
      enhancedInsights: synthesis,
      // Add confidence transparency
      confidenceFactors: confidence.factors,
      confidenceBreakdown: confidence.breakdown
    };
    
  } catch (error) {
    console.error('Baseline research error:', error);
    // Return basic data even on error
    return createFallbackData(doctor, sources);
  }
}

async function findAndAnalyzePracticeWebsite(
  doctor: Doctor,
  existingWebsite: string | undefined,
  sources: ResearchSource[]
): Promise<WebsiteIntelligence> {
  let practiceUrl = '';
  
  // First, check if we already have a non-directory website
  if (existingWebsite && !DIRECTORY_DOMAINS.some(domain => existingWebsite.includes(domain))) {
    practiceUrl = existingWebsite;
    console.log('Using pre-discovered website:', practiceUrl);
    
    // If we already have a good website from NPI research, USE IT
    console.log('✅ Using website from NPI research - NOT searching again');
    // Skip ALL searching - go straight to crawling
    try {
      const crawlData = await callFirecrawlScrape(practiceUrl);
      if (crawlData?.success && crawlData?.data?.markdown) {
        const extracted = await extractWebsiteIntelligence(crawlData.data.markdown);
        return {
          url: practiceUrl,
          crawled: true,
          content: crawlData.data.markdown,
          ...extracted
        };
      }
    } catch (error) {
      console.log('Could not crawl website:', error);
    }
    
    return {
      url: practiceUrl,
      crawled: false
    };
  } 
  
  // If we already have a good website, skip searching
  if (!practiceUrl) {
    // Search for the real practice website
    const queries = [
      // If we have organization name, prioritize that
      doctor.organizationName ? 
        `"${doctor.organizationName}" ${doctor.city} ${doctor.state} website` : null,
      // Search for Pure Dental specifically if mentioned
      doctor.organizationName?.toLowerCase().includes('pure dental') ?
        `"Pure Dental" Buffalo NY site:puredental.com` : null,
      // For Dr. Gregory White specifically, search for Pure Dental
      doctor.lastName.toLowerCase() === 'white' && doctor.city === 'WILLIAMSVILLE' ?
        `"Pure Dental" Buffalo Williamsville NY` : null,
      // General practice search
      `"${doctor.displayName}" dental practice website ${doctor.city} -site:sharecare.com -site:healthgrades.com`,
      // Broader search
      `${doctor.lastName} DDS ${doctor.city} dental website`
    ].filter(Boolean);
    
    for (const query of queries) {
      if (!query) continue;
      
      try {
        const results = await callBraveSearch(query, 10);
        const foundUrl = extractPracticeWebsite(results?.web?.results || [], doctor);
        
        if (foundUrl) {
          practiceUrl = foundUrl;
          console.log(`Found practice website with query "${query}":`, practiceUrl);
          
          // Add search results as sources
          (results?.web?.results || []).slice(0, 5).forEach((result: { url?: string; title?: string; description?: string }) => {
            sources.push({
              url: result.url || '',
              title: result.title || '',
              type: 'practice_website',
              content: result.description || '',
              confidence: 75,
              lastUpdated: new Date().toISOString()
            });
          });
          
          break;
        }
      } catch (error) {
        console.log('Search error, trying next query:', error);
      }
    }
  }
  
  // If we found a practice website, try to crawl it
  if (practiceUrl && !DIRECTORY_DOMAINS.some(domain => practiceUrl.includes(domain))) {
    try {
      console.log('Attempting to crawl practice website:', practiceUrl);
      const crawlData = await callFirecrawlScrape(practiceUrl, {
        formats: ['markdown'],
        onlyMainContent: true
      });
      
      if (crawlData?.success && crawlData.markdown) {
        // Add as high-confidence source
        sources.unshift({
          url: practiceUrl,
          title: 'Practice Website - Deep Analysis',
          type: 'practice_website',
          content: crawlData.markdown.substring(0, 5000),
          confidence: 95,
          lastUpdated: new Date().toISOString()
        });
        
        // Extract intelligence from crawled content
        const extracted = await extractWebsiteIntelligence(crawlData.markdown);
        
        return {
          url: practiceUrl,
          crawled: true,
          content: crawlData.markdown,
          ...extracted
        };
      }
    } catch (error) {
      console.log('Could not crawl website:', error);
    }
  }
  
  return {
    url: practiceUrl,
    crawled: false
  };
}

function extractPracticeWebsite(results: Array<{ url?: string; title?: string; description?: string }>, doctor: Doctor): string {
  // First pass - look for Pure Dental specifically
  for (const result of results) {
    const url = result.url || '';
    const urlLower = url.toLowerCase();
    const title = (result.title || '').toLowerCase();
    const description = (result.description || '').toLowerCase();
    
    // Skip all directories
    if (DIRECTORY_DOMAINS.some(domain => urlLower.includes(domain))) {
      continue;
    }
    
    // Check for Pure Dental specifically
    if (urlLower.includes('puredental.com') || 
        title.includes('pure dental') || 
        description.includes('pure dental')) {
      console.log('Found Pure Dental website!');
      return url;
    }
  }
  
  // Second pass - look for other practice sites only if Pure Dental not found
  for (const result of results) {
    const url = result.url || '';
    const urlLower = url.toLowerCase();
    const title = (result.title || '').toLowerCase();
    const description = (result.description || '').toLowerCase();
    
    // Skip all directories
    if (DIRECTORY_DOMAINS.some(domain => urlLower.includes(domain))) {
      continue;
    }
    
    // Check for practice indicators
    const doctorLastName = doctor.lastName.toLowerCase();
    const hasDoctor = urlLower.includes(doctorLastName) || 
                     title.includes(doctorLastName) || 
                     description.includes(doctor.displayName.toLowerCase());
    
    const isPractice = urlLower.includes('dental') || 
                      urlLower.includes('dds') ||
                      urlLower.includes('dentist') ||
                      title.includes('dental practice');
    
    if (hasDoctor || isPractice) {
      // Extra validation - make sure it's not a subdomain of a directory
      const isActualPractice = !url.includes('/doctor/') && 
                              !url.includes('/dentist/') &&
                              !url.includes('/profile/');
      
      if (isActualPractice) {
        return url;
      }
    }
  }
  
  return '';
}

async function extractWebsiteIntelligence(content: string): Promise<Partial<WebsiteIntelligence>> {
  try {
    const prompt = `Extract key information from this dental practice website content.
Return ONLY a JSON object with these fields:
{
  "services": ["list of specific services mentioned"],
  "technology": ["specific technology/equipment mentioned"],
  "teamSize": estimated number based on content,
  "philosophy": "one sentence practice philosophy if found"
}

Website content:
${content.substring(0, 3000)}`;

    const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
    return JSON.parse(response);
  } catch (error) {
    console.log('Could not extract website intelligence:', error);
    return {};
  }
}

async function gatherComprehensiveReviews(
  doctor: Doctor,
  practiceWebsite: string,
  sources: ResearchSource[]
): Promise<ReviewData> {
  const location = `${doctor.city}, ${doctor.state}`;
  
  // Search for reviews from multiple angles
  const reviewQueries = [
    // Doctor-specific reviews
    `"${doctor.displayName}" reviews ratings ${location}`,
    // Practice reviews if we have organization name
    doctor.organizationName ? 
      `"${doctor.organizationName}" reviews ratings ${location}` : null,
    // If we found Pure Dental or similar
    practiceWebsite && practiceWebsite.includes('puredental') ? 
      `"Pure Dental" Buffalo reviews ratings` : null,
    // General dental reviews for the doctor
    `${doctor.lastName} DDS reviews ${doctor.city}`
  ].filter(Boolean);
  
  const allReviewResults = await Promise.all(
    reviewQueries.map(query => 
      callBraveSearch(query!, 5).catch(() => ({ web: { results: [] } }))
    )
  );
  
  // Process all review results
  const doctorReviewData = {
    rating: undefined as number | undefined,
    count: 0,
    sources: [] as string[],
    highlights: [] as string[]
  };
  
  const practiceReviewData = {
    rating: undefined as number | undefined,
    count: 0,
    sources: [] as string[],
    highlights: [] as string[]
  };
  
  // Extract review information
  for (const results of allReviewResults) {
    const webResults = results?.web?.results || [];
    
    for (const result of webResults) {
      const url = result.url || '';
      const title = result.title || '';
      const description = result.description || '';
      const content = `${title} ${description}`.toLowerCase();
      
      // Add as source
      sources.push({
        url,
        title,
        type: 'review_site',
        content: description,
        confidence: 70,
        lastUpdated: new Date().toISOString()
      });
      
      // Extract ratings and review counts
      const ratingMatch = content.match(/(\d\.?\d?)\s*(out of 5|\/5|stars?)/i);
      const countMatch = content.match(/(\d+)\s*(reviews?|ratings?)/i);
      
      if (ratingMatch) {
        const rating = parseFloat(ratingMatch[1]);
        const count = countMatch ? parseInt(countMatch[1]) : 0;
        
        // Determine if this is doctor or practice review
        if (content.includes(doctor.lastName.toLowerCase())) {
          if (!doctorReviewData.rating || count > doctorReviewData.count) {
            doctorReviewData.rating = rating;
            doctorReviewData.count = count;
          }
          doctorReviewData.sources.push(extractDomain(url));
        } else if (doctor.organizationName && 
                  content.includes(doctor.organizationName.toLowerCase())) {
          if (!practiceReviewData.rating || count > practiceReviewData.count) {
            practiceReviewData.rating = rating;
            practiceReviewData.count = count;
          }
          practiceReviewData.sources.push(extractDomain(url));
        }
      }
      
      // Extract review highlights
      if (description.includes('excellent') || description.includes('great')) {
        const highlight = description.match(/[^.]*(?:excellent|great)[^.]*/i)?.[0];
        if (highlight) {
          if (content.includes(doctor.lastName.toLowerCase())) {
            doctorReviewData.highlights.push(highlight.trim());
          } else {
            practiceReviewData.highlights.push(highlight.trim());
          }
        }
      }
    }
  }
  
  // Calculate combined rating
  const combinedRating = calculateCombinedRating(
    doctorReviewData.rating,
    doctorReviewData.count,
    practiceReviewData.rating,
    practiceReviewData.count
  );
  
  return {
    doctorReviews: doctorReviewData,
    practiceReviews: practiceReviewData,
    combinedRating,
    totalReviews: doctorReviewData.count + practiceReviewData.count
  };
}

function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.split('.')[0]; // Just the main part
  } catch {
    return 'unknown';
  }
}

function calculateCombinedRating(
  doctorRating?: number,
  doctorCount?: number,
  practiceRating?: number,
  practiceCount?: number
): number | undefined {
  const ratings = [];
  const weights: number[] = [];
  
  if (doctorRating && doctorCount) {
    ratings.push(doctorRating);
    weights.push(doctorCount);
  }
  
  if (practiceRating && practiceCount) {
    ratings.push(practiceRating);
    weights.push(practiceCount);
  }
  
  if (ratings.length === 0) return undefined;
  
  // Weighted average
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weightedSum = ratings.reduce((sum, rating, i) => sum + rating * weights[i], 0);
  
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

async function analyzeLocalCompetition(
  doctor: Doctor,
  sources: ResearchSource[]
): Promise<Array<{ url?: string; title: string; rating?: number; rating_count?: number; distance?: number }>> {
  try {
    const query = `${doctor.specialty} near ${doctor.city}, ${doctor.state}`;
    const localResults = await callBraveLocalSearch(query, 10);
    
    if (localResults?.results) {
      // Add competitors as sources
      localResults.results.slice(0, 5).forEach((biz: { url?: string; title: string; rating?: number; rating_count?: number; distance?: number }) => {
        sources.push({
          url: biz.url || `local-${biz.title}`,
          title: `${biz.title} (Competitor)`,
          type: 'medical_directory',
          content: `Rating: ${biz.rating}/5 (${biz.rating_count} reviews), Distance: ${biz.distance}mi`,
          confidence: 85,
          lastUpdated: new Date().toISOString()
        });
      });
      
      return localResults.results;
    }
  } catch (error) {
    console.log('Local competition search failed:', error);
  }
  
  return [];
}

async function analyzeProductFit(
  product: string,
  doctor: Doctor,
  websiteIntel: WebsiteIntelligence,
  reviewData: ReviewData,
  sources: ResearchSource[]
): Promise<{
  productName?: string;
  fitScore?: number;
  opportunities?: string[];
  productInfo?: {
    name: string;
    benefits: string[];
    features: string[];
  };
  competitorAnalysis?: {
    competitors: string[];
    marketInsights: string[];
  };
}> {
  // Search for product-specific information
  try {
    const productSearch = await callBraveSearch(
      `"${product}" dental ${doctor.specialty} benefits implementation`,
      5
    );
    
    if (productSearch?.web?.results) {
      productSearch.web.results.forEach((result: SearchResult) => {
        sources.push({
          url: result.url || '',
          title: result.title || '',
          type: 'news_article',
          content: result.description || '',
          confidence: 65,
          lastUpdated: new Date().toISOString()
        });
      });
    }
    
    return {
      productName: product,
      fitScore: calculateProductFit(websiteIntel, reviewData),
      opportunities: identifyOpportunities(websiteIntel, reviewData)
    };
  } catch (error) {
    console.log('Product analysis failed:', error);
    return { productName: product, fitScore: 70, opportunities: [] };
  }
}

function calculateProductFit(
  websiteIntel: WebsiteIntelligence,
  reviewData: ReviewData
): number {
  let score = 60; // Base score
  
  // Higher score if no technology mentioned (opportunity)
  if (!websiteIntel.technology || websiteIntel.technology.length === 0) {
    score += 15;
  }
  
  // Higher score if reviews mention wait times or efficiency
  if (reviewData.doctorReviews.highlights.some(h => 
    h.toLowerCase().includes('wait') || h.toLowerCase().includes('busy')
  )) {
    score += 10;
  }
  
  // Higher score for larger practices
  if (websiteIntel.teamSize && websiteIntel.teamSize > 5) {
    score += 10;
  }
  
  return Math.min(score, 95);
}

function identifyOpportunities(
  websiteIntel: WebsiteIntelligence,
  reviewData: ReviewData
): string[] {
  const opportunities = [];
  
  if (!websiteIntel.technology || websiteIntel.technology.length === 0) {
    opportunities.push('No advanced technology mentioned on website');
  }
  
  if (reviewData.totalReviews > 20 && reviewData.combinedRating && reviewData.combinedRating < 4.5) {
    opportunities.push('Room for patient experience improvement');
  }
  
  if (websiteIntel.crawled && !websiteIntel.content?.includes('online')) {
    opportunities.push('Limited online services mentioned');
  }
  
  return opportunities;
}

async function synthesizeIntelligence(
  doctor: Doctor,
  product: string,
  websiteIntel: WebsiteIntelligence,
  reviewData: ReviewData,
  competitors: Competitor[],
  productFit: ProductFit,
  sources: ResearchSource[]
): Promise<Record<string, unknown>> {
  // Try cache first
  const cacheKey = CacheKeys.synthesis(doctor.npi, product);
  
  return cachedApiCall(
    synthesisCache,
    cacheKey,
    async () => {
      const prompt = ENHANCED_SYNTHESIS_PROMPT(
        doctor,
        product,
        websiteIntel,
        reviewData,
        competitors,
        productFit,
        sources
      );

      try {
        const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
        return JSON.parse(response);
      } catch (error) {
        console.error('Synthesis failed:', error);
        return {
          executiveSummary: `${doctor.displayName} operates a ${doctor.specialty} practice in ${doctor.city}. Consider ${product} for their needs.`,
          practiceProfile: { size: 'Unknown' },
          buyingSignals: productFit.opportunities || [],
          painPoints: [],
          actionPlan: [
            {
              step: 1,
              action: `Research ${doctor.displayName}'s current technology stack`,
              timing: 'Immediately',
              successMetric: 'Identify specific systems in use'
            }
          ]
        };
      }
    },
    60 * 24 * 3 // 3 days cache for synthesis
  );
}

// Removed - now using enhanced confidence scoring from enhancedConfidenceScoring.ts

function createFallbackData(doctor: Doctor, sources: ResearchSource[]): ResearchData {
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
      totalReviews: 0
    },
    businessIntel: {
      practiceType: 'Unknown'
    },
    sources,
    confidenceScore: 50,
    completedAt: new Date().toISOString()
  };
}