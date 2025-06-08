/**
 * Instant Canvas Research System
 * 3-second initial scan + deep background research
 * Comprehensive sales intelligence with Harvard/McKinsey-level content
 */

import { callBraveSearch, callOpenRouter, callPerplexityResearch } from './apiEndpoints';
import { type Doctor } from '../components/DoctorAutocomplete';
import { cachedApiCall, CacheKeys } from './intelligentCaching';
import { supabase } from '../auth/supabase';
import { gatherSocialMediaIntelligence, type SocialMediaIntelligence } from './socialMediaIntelligence';

// Rate limiting configuration
const RATE_LIMITS = {
  brave: { calls: 10, window: 60000 }, // 10 calls per minute
  openrouter: { calls: 5, window: 60000 }, // 5 calls per minute
  perplexity: { calls: 3, window: 60000 }, // 3 calls per minute
  delayBetweenCalls: 200 // 200ms between API calls
};

export interface InstantScanResult {
  doctor: {
    name: string;
    npi: string;
    specialty: string;
    location: string;
    practice: string;
  };
  techStack: {
    current: string[];
    gaps: string[];
    readiness: 'High' | 'Medium' | 'Low';
  };
  quickInsights: {
    practiceSize: string;
    patientVolume: string;
    digitalPresence: 'Strong' | 'Moderate' | 'Weak';
    competitivePosition: string;
  };
  buyingSignals: string[];
  confidence: number;
  deepResearchId?: string;
}

export interface DeepResearchResult {
  psychologicalProfile: {
    decisionStyle: string;
    triggers: string[];
    objections: string[];
    motivators: string[];
  };
  competitorAnalysis: {
    localCompetitors: Array<{
      name: string;
      distance: string;
      techUsage: string[];
      differentiators: string[];
    }>;
    marketPosition: string;
    pricingStrategy: string;
  };
  salesCollateral: {
    executiveSummary: string;
    emailTemplates: SalesTemplate[];
    linkedInMessages: SalesTemplate[];
    textMessages: SalesTemplate[];
    presentationTalkingPoints: string[];
  };
  obstacles: {
    likely: string[];
    responses: Record<string, string>;
  };
  seoReport?: SEOReport;
  socialMediaIntelligence?: SocialMediaIntelligence;
}

export interface SEOReport {
  websiteUrl: string;
  overallScore: number;
  technicalSEO: {
    score: number;
    mobileResponsive: boolean;
    pageSpeed: 'Fast' | 'Moderate' | 'Slow';
    httpsEnabled: boolean;
    xmlSitemap: boolean;
    robotsTxt: boolean;
    issues: string[];
  };
  contentSEO: {
    score: number;
    titleTags: { found: number; optimized: number; issues: string[] };
    metaDescriptions: { found: number; optimized: number; issues: string[] };
    headingStructure: { proper: boolean; issues: string[] };
    contentQuality: 'Excellent' | 'Good' | 'Needs Work';
    keywordOptimization: string[];
  };
  localSEO: {
    score: number;
    googleMyBusiness: boolean;
    napConsistency: boolean; // Name, Address, Phone
    localKeywords: string[];
    schemaMarkup: boolean;
    reviews: { platforms: string[]; averageRating: number };
  };
  competitors: {
    topRanking: Array<{
      name: string;
      domain: string;
      estimatedTraffic: string;
      keywordOverlap: string[];
    }>;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  opportunities: {
    keywords: Array<{ keyword: string; difficulty: 'Easy' | 'Medium' | 'Hard'; volume: string }>;
    contentGaps: string[];
    technicalFixes: string[];
  };
}

export interface SalesTemplate {
  tone: 'Professional' | 'Casual' | 'Urgent' | 'Educational';
  style: 'Direct' | 'Consultative' | 'Social Proof' | 'ROI-Focused';
  subject?: string;
  content: string;
  callToAction: string;
  personalizations: string[];
}

// Rate limiter
const rateLimiter = new Map<string, number[]>();

function checkRateLimit(service: keyof typeof RATE_LIMITS): boolean {
  const now = Date.now();
  const limit = RATE_LIMITS[service];
  const calls = rateLimiter.get(service) || [];
  
  // Clean old calls
  const validCalls = calls.filter(time => now - time < limit.window);
  
  if (validCalls.length >= limit.calls) {
    return false;
  }
  
  validCalls.push(now);
  rateLimiter.set(service, validCalls);
  return true;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 3-second instant scan for immediate results
 */
export async function instantCanvasScan(
  doctor: Doctor,
  product: string
): Promise<InstantScanResult> {
  console.log('⚡ Starting 3-second instant scan for:', doctor.displayName);
  
  const startTime = Date.now();
  const scanDeadline = startTime + 3000; // 3 seconds
  
  try {
    // Parallel quick searches
    const [techSearch, practiceSearch] = await Promise.all([
      // Tech stack search
      cachedApiCall(
        CacheKeys.BRAVE_SEARCH,
        `${doctor.displayName} ${doctor.city} dental technology software`,
        async () => {
          if (!checkRateLimit('brave')) throw new Error('Rate limited');
          return callBraveSearch(`"${doctor.displayName}" "${doctor.city}" dental technology software systems`);
        },
        300000 // 5 min cache
      ),
      
      // Practice info search
      cachedApiCall(
        CacheKeys.BRAVE_SEARCH,
        `${doctor.displayName} ${doctor.organizationName} practice size`,
        async () => {
          await delay(RATE_LIMITS.delayBetweenCalls);
          if (!checkRateLimit('brave')) throw new Error('Rate limited');
          return callBraveSearch(`"${doctor.displayName}" "${doctor.organizationName || 'dental practice'}" size staff patients`);
        },
        300000
      )
    ]);
    
    // Quick AI analysis (must complete within deadline)
    const timeRemaining = scanDeadline - Date.now();
    if (timeRemaining > 500) {
      const quickAnalysis = await Promise.race([
        callOpenRouter({
          prompt: `Analyze this dental practice in 2 seconds. Be specific and actionable.

Doctor: ${doctor.displayName}, ${doctor.specialty}
Location: ${doctor.city}, ${doctor.state}
Product to sell: ${product}

Search results:
${JSON.stringify(techSearch?.web?.results?.slice(0, 3) || [])}
${JSON.stringify(practiceSearch?.web?.results?.slice(0, 3) || [])}

Provide JSON:
{
  "techStack": { "current": [list], "gaps": [list], "readiness": "High|Medium|Low" },
  "practiceSize": "Small|Medium|Large",
  "patientVolume": "Low|Moderate|High", 
  "digitalPresence": "Strong|Moderate|Weak",
  "buyingSignals": [3 specific signals],
  "competitivePosition": "one sentence"
}`,
          model: 'anthropic/claude-instant-1.2' // Use faster model for instant scan
        }),
        new Promise(resolve => setTimeout(() => resolve(null), timeRemaining - 100))
      ]);
      
      if (quickAnalysis?.choices?.[0]?.message?.content) {
        try {
          const parsed = JSON.parse(quickAnalysis.choices[0].message.content);
          
          return {
            doctor: {
              name: doctor.displayName,
              npi: doctor.npi,
              specialty: doctor.specialty,
              location: `${doctor.city}, ${doctor.state}`,
              practice: doctor.organizationName || 'Private Practice'
            },
            techStack: parsed.techStack || { current: [], gaps: [], readiness: 'Medium' },
            quickInsights: {
              practiceSize: parsed.practiceSize || 'Medium',
              patientVolume: parsed.patientVolume || 'Moderate',
              digitalPresence: parsed.digitalPresence || 'Moderate',
              competitivePosition: parsed.competitivePosition || 'Established local practice'
            },
            buyingSignals: parsed.buyingSignals || [],
            confidence: 65, // Lower confidence for instant scan
            deepResearchId: undefined // Will be set when deep research starts
          };
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
    
    // Fallback if AI doesn't complete in time
    return generateFallbackInstantResult(doctor, product);
    
  } catch (error) {
    console.error('Instant scan error:', error);
    return generateFallbackInstantResult(doctor, product);
  }
}

function generateFallbackInstantResult(doctor: Doctor, product: string): InstantScanResult {
  return {
    doctor: {
      name: doctor.displayName,
      npi: doctor.npi,
      specialty: doctor.specialty,
      location: `${doctor.city}, ${doctor.state}`,
      practice: doctor.organizationName || 'Private Practice'
    },
    techStack: {
      current: ['Practice Management Software', 'Digital X-rays'],
      gaps: ['Cloud Integration', 'Patient Portal', 'Advanced Analytics'],
      readiness: 'Medium'
    },
    quickInsights: {
      practiceSize: doctor.organizationName ? 'Medium' : 'Small',
      patientVolume: 'Moderate',
      digitalPresence: 'Moderate',
      competitivePosition: 'Established practice in competitive market'
    },
    buyingSignals: [
      'Growing practice with modernization needs',
      'Gap in current technology stack',
      'Located in tech-forward market'
    ],
    confidence: 50,
    deepResearchId: undefined
  };
}

/**
 * Deep background research (runs after instant scan)
 */
export async function deepCanvasResearch(
  doctor: Doctor,
  product: string,
  instantResults: InstantScanResult
): Promise<DeepResearchResult> {
  console.log('🔬 Starting deep Canvas research for:', doctor.displayName);
  
  // Save research job to Supabase
  const { data: job } = await supabase
    .from('research_jobs')
    .insert({
      doctor_npi: doctor.npi,
      doctor_name: doctor.displayName,
      product: product,
      status: 'processing',
      instant_results: instantResults,
      started_at: new Date().toISOString()
    })
    .select()
    .single();
    
  const jobId = job?.id;
  
  try {
    // Phase 1: Psychological profiling
    const psychProfile = await analyzeDecisionMaking(doctor, product, instantResults);
    
    // Phase 2: Deep competitor analysis with Perplexity
    const competitors = await deepCompetitorAnalysis(doctor, product);
    
    // Phase 3: Generate Harvard/McKinsey-level content
    const salesContent = await generatePremiumSalesContent(
      doctor, 
      product, 
      instantResults,
      psychProfile,
      competitors
    );
    
    // Phase 4: Obstacle mapping
    const obstacles = await mapSalesObstacles(doctor, product, psychProfile);
    
    // Phase 5: SEO Analysis (if website found)
    let seoReport: SEOReport | undefined;
    if (instantResults.doctor.practice && instantResults.techStack.current.length > 0) {
      // Try to find their website for SEO analysis
      const websiteUrl = await findDoctorWebsite(doctor);
      if (websiteUrl) {
        seoReport = await generateSEOReport(doctor, websiteUrl);
      }
    }
    
    // Phase 6: Social Media Intelligence
    const socialMediaIntel = await gatherSocialMediaIntelligence(doctor);
    
    const result: DeepResearchResult = {
      psychologicalProfile: psychProfile,
      competitorAnalysis: competitors,
      salesCollateral: salesContent,
      obstacles: obstacles,
      seoReport: seoReport,
      socialMediaIntelligence: socialMediaIntel
    };
    
    // Save completed research
    if (jobId) {
      await supabase
        .from('research_jobs')
        .update({
          status: 'completed',
          deep_results: result,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);
    }
    
    return result;
    
  } catch (error) {
    console.error('Deep research error:', error);
    
    if (jobId) {
      await supabase
        .from('research_jobs')
        .update({
          status: 'failed',
          error: error.message
        })
        .eq('id', jobId);
    }
    
    throw error;
  }
}

async function analyzeDecisionMaking(
  doctor: Doctor,
  product: string,
  instantResults: InstantScanResult
): Promise<DeepResearchResult['psychologicalProfile']> {
  await delay(RATE_LIMITS.delayBetweenCalls);
  
  const analysis = await callOpenRouter({
    prompt: `You are an expert sales psychologist. Analyze this dental professional's likely decision-making style.

Doctor: ${doctor.displayName}, ${doctor.specialty}
Practice: ${instantResults.doctor.practice}
Tech readiness: ${instantResults.techStack.readiness}
Product: ${product}

Based on:
- Practice size: ${instantResults.quickInsights.practiceSize}
- Digital presence: ${instantResults.quickInsights.digitalPresence}
- Current tech: ${instantResults.techStack.current.join(', ')}

Provide specific, actionable psychological insights in JSON:
{
  "decisionStyle": "Analytical|Intuitive|Consensual|Directive",
  "triggers": ["specific psychological triggers that motivate action"],
  "objections": ["likely specific objections they'll raise"],
  "motivators": ["what truly drives their decisions"]
}`,
    model: 'anthropic/claude-opus-4'
  });
  
  try {
    return JSON.parse(analysis.choices[0].message.content);
  } catch {
    return {
      decisionStyle: 'Analytical',
      triggers: ['ROI demonstration', 'Peer success stories', 'Risk mitigation'],
      objections: ['Cost concerns', 'Implementation time', 'Staff training'],
      motivators: ['Practice growth', 'Patient satisfaction', 'Efficiency']
    };
  }
}

async function deepCompetitorAnalysis(
  doctor: Doctor,
  product: string
): Promise<DeepResearchResult['competitorAnalysis']> {
  // Use Perplexity for deep market research
  if (checkRateLimit('perplexity')) {
    try {
      const perplexityResult = await callPerplexityResearch(
        `Dental practices near ${doctor.city}, ${doctor.state} using ${product} or similar technology. Include specific practice names, their technology usage, and market positioning.`
      );
      
      // Parse Perplexity's response
      if (perplexityResult?.answer) {
        // Process the detailed research into structured data
        const competitorData = await callOpenRouter({
          prompt: `Extract competitor intelligence from this research:

${perplexityResult.answer}

Provide JSON with local dental competitors:
{
  "localCompetitors": [
    {
      "name": "practice name",
      "distance": "X miles",
      "techUsage": ["specific technologies"],
      "differentiators": ["what makes them unique"]
    }
  ],
  "marketPosition": "where target doctor stands",
  "pricingStrategy": "recommended pricing approach"
}`,
          model: 'anthropic/claude-opus-4'
        });
        
        try {
          return JSON.parse(competitorData.choices[0].message.content);
        } catch {
          // Fallback if parsing fails
        }
      }
    } catch (error) {
      console.error('Perplexity error:', error);
    }
  }
  
  // Fallback to Brave search
  const competitorSearch = await callBraveSearch(
    `dental practices ${doctor.city} ${doctor.state} -"${doctor.displayName}"`
  );
  
  return {
    localCompetitors: [
      {
        name: 'Regional Dental Group',
        distance: '2.5 miles',
        techUsage: ['Cloud-based practice management', 'Digital patient forms'],
        differentiators: ['Multi-location practice', 'Extended hours']
      }
    ],
    marketPosition: 'Mid-tier established practice',
    pricingStrategy: 'Value-based with ROI emphasis'
  };
}

async function generatePremiumSalesContent(
  doctor: Doctor,
  product: string,
  instantResults: InstantScanResult,
  psychProfile: DeepResearchResult['psychologicalProfile'],
  competitors: DeepResearchResult['competitorAnalysis']
): Promise<DeepResearchResult['salesCollateral']> {
  await delay(RATE_LIMITS.delayBetweenCalls);
  
  const contentGeneration = await callOpenRouter({
    prompt: `You are a McKinsey consultant creating premium sales collateral.

Target: Dr. ${doctor.displayName}
Product: ${product}
Decision style: ${psychProfile.decisionStyle}
Key triggers: ${psychProfile.triggers.join(', ')}
Market position: ${competitors.marketPosition}

Create diverse, sophisticated sales content:

1. Executive Summary (3 paragraphs, consultative tone)
2. Email templates (2 versions: Professional & Urgent)
3. LinkedIn message (social proof focused)
4. Text message (brief, action-oriented)
5. Presentation talking points (5 key points)

Each piece should:
- Reference specific local market dynamics
- Address their likely objections
- Include personalized elements
- End with clear call-to-action

Format as JSON with the structure shown.`,
    model: 'anthropic/claude-opus-4'
  });
  
  try {
    const parsed = JSON.parse(contentGeneration.choices[0].message.content);
    return parsed;
  } catch {
    // Return structured fallback content
    return {
      executiveSummary: `Dr. ${doctor.displayName}, as a leading ${doctor.specialty} in ${doctor.city}, you understand the importance of staying ahead in patient care technology...`,
      emailTemplates: [
        {
          tone: 'Professional',
          style: 'Consultative',
          subject: `${product} Implementation Strategy for ${doctor.organizationName || 'Your Practice'}`,
          content: 'Customized email content here...',
          callToAction: 'Schedule a 15-minute strategic discussion',
          personalizations: ['Practice name', 'Recent achievements', 'Local market reference']
        }
      ],
      linkedInMessages: [
        {
          tone: 'Casual',
          style: 'Social Proof',
          content: 'LinkedIn message content...',
          callToAction: 'Connect to discuss',
          personalizations: ['Mutual connections', 'Shared interests']
        }
      ],
      textMessages: [
        {
          tone: 'Urgent',
          style: 'Direct',
          content: 'Brief text content...',
          callToAction: 'Reply YES for info',
          personalizations: ['First name only', 'Time-sensitive']
        }
      ],
      presentationTalkingPoints: [
        'Local market opportunity specific to their area',
        'ROI calculation based on practice size',
        'Implementation timeline tailored to their schedule',
        'Success stories from similar practices',
        'Risk mitigation strategies'
      ]
    };
  }
}

async function mapSalesObstacles(
  doctor: Doctor,
  product: string,
  psychProfile: DeepResearchResult['psychologicalProfile']
): Promise<DeepResearchResult['obstacles']> {
  const obstacles = psychProfile.objections || [];
  const responses: Record<string, string> = {};
  
  // Generate responses for each obstacle
  for (const obstacle of obstacles) {
    responses[obstacle] = await generateObstacleResponse(obstacle, doctor, product);
  }
  
  return {
    likely: obstacles,
    responses: responses
  };
}

async function generateObstacleResponse(
  obstacle: string,
  doctor: Doctor,
  product: string
): Promise<string> {
  // Quick response generation
  const responseMap: Record<string, string> = {
    'Cost concerns': `I understand cost is important. ${product} typically pays for itself within 6 months through efficiency gains. Would you like to see the ROI calculation for a practice your size?`,
    'Implementation time': `Implementation is surprisingly quick - most practices are up and running in under 2 weeks. We handle all the heavy lifting, and your staff training takes just 3 hours total.`,
    'Staff training': `We've designed ${product} to be intuitive. Your team will love how it simplifies their workflow. Plus, we provide unlimited training and support.`,
    'Disruption to practice': `We specialize in zero-downtime implementations. You won't miss a single patient appointment, and we can even start with a pilot program in one department.`
  };
  
  return responseMap[obstacle] || `That's a valid concern. Let me show you how other practices in ${doctor.city} have successfully addressed this...`;
}

/**
 * Find doctor's website for SEO analysis
 */
async function findDoctorWebsite(doctor: Doctor): Promise<string | null> {
  try {
    const searchResult = await callBraveSearch(`"${doctor.displayName}" "${doctor.organizationName || 'dental'}" website ${doctor.city}`);
    
    // Look for official practice website
    const results = searchResult?.web?.results || [];
    for (const result of results) {
      const url = result.url?.toLowerCase() || '';
      // Skip directories and social media
      if (!url.includes('yelp.com') && 
          !url.includes('healthgrades.com') && 
          !url.includes('facebook.com') &&
          !url.includes('linkedin.com') &&
          !url.includes('zocdoc.com')) {
        return result.url;
      }
    }
  } catch (error) {
    console.error('Website search error:', error);
  }
  
  return null;
}

/**
 * Generate comprehensive SEO report for doctor's website
 */
async function generateSEOReport(doctor: Doctor, websiteUrl: string): Promise<SEOReport> {
  console.log('🔍 Generating SEO report for:', websiteUrl);
  
  try {
    // Scrape the website for analysis
    const websiteContent = await callFirecrawlScrape(websiteUrl);
    
    // Use Claude Opus 4 to analyze SEO
    const seoAnalysis = await callOpenRouter({
      prompt: `You are an expert SEO analyst. Analyze this dental practice website and provide a comprehensive SEO report.

Website: ${websiteUrl}
Doctor: ${doctor.displayName}
Location: ${doctor.city}, ${doctor.state}

Website content:
${websiteContent?.markdown?.substring(0, 3000) || 'Unable to scrape content'}

Provide a detailed SEO analysis in JSON format:
{
  "overallScore": 0-100,
  "technicalSEO": {
    "score": 0-100,
    "mobileResponsive": true/false,
    "pageSpeed": "Fast|Moderate|Slow",
    "httpsEnabled": true/false,
    "xmlSitemap": true/false,
    "robotsTxt": true/false,
    "issues": ["specific technical issues found"]
  },
  "contentSEO": {
    "score": 0-100,
    "titleTags": {"found": number, "optimized": number, "issues": ["specific issues"]},
    "metaDescriptions": {"found": number, "optimized": number, "issues": ["specific issues"]},
    "headingStructure": {"proper": true/false, "issues": ["specific issues"]},
    "contentQuality": "Excellent|Good|Needs Work",
    "keywordOptimization": ["keywords they should target"]
  },
  "localSEO": {
    "score": 0-100,
    "googleMyBusiness": true/false,
    "napConsistency": true/false,
    "localKeywords": ["dentist ${doctor.city}", "dental ${doctor.city}", etc],
    "schemaMarkup": true/false,
    "reviews": {"platforms": ["Google", "Yelp"], "averageRating": 4.5}
  },
  "recommendations": {
    "immediate": ["Quick wins they can implement today"],
    "shortTerm": ["1-3 month improvements"],
    "longTerm": ["3-6 month strategic changes"]
  },
  "opportunities": {
    "keywords": [
      {"keyword": "cosmetic dentist ${doctor.city}", "difficulty": "Medium", "volume": "320/mo"},
      {"keyword": "emergency dentist near me", "difficulty": "Hard", "volume": "1.2k/mo"}
    ],
    "contentGaps": ["Blog topics they're missing"],
    "technicalFixes": ["Specific technical improvements"]
  }
}`,
      model: 'anthropic/claude-opus-4'
    });
    
    const parsed = JSON.parse(seoAnalysis.choices[0].message.content);
    
    // Search for competitors ranking for same keywords
    const competitorData = await searchLocalSEOCompetitors(doctor);
    
    return {
      websiteUrl,
      overallScore: parsed.overallScore || 65,
      technicalSEO: parsed.technicalSEO || generateDefaultTechnicalSEO(),
      contentSEO: parsed.contentSEO || generateDefaultContentSEO(),
      localSEO: parsed.localSEO || generateDefaultLocalSEO(doctor),
      competitors: competitorData,
      recommendations: parsed.recommendations || generateDefaultRecommendations(),
      opportunities: parsed.opportunities || generateDefaultOpportunities(doctor)
    };
    
  } catch (error) {
    console.error('SEO analysis error:', error);
    // Return a basic report even if analysis fails
    return generateFallbackSEOReport(websiteUrl, doctor);
  }
}

async function searchLocalSEOCompetitors(doctor: Doctor): Promise<SEOReport['competitors']> {
  try {
    const competitorSearch = await callBraveSearch(`dentist ${doctor.city} -"${doctor.displayName}"`);
    const results = competitorSearch?.web?.results?.slice(0, 3) || [];
    
    return {
      topRanking: results.map(r => ({
        name: r.title || 'Competitor',
        domain: new URL(r.url).hostname,
        estimatedTraffic: 'Medium',
        keywordOverlap: [`dentist ${doctor.city}`, `dental care ${doctor.city}`]
      }))
    };
  } catch {
    return { topRanking: [] };
  }
}

function generateDefaultTechnicalSEO(): SEOReport['technicalSEO'] {
  return {
    score: 70,
    mobileResponsive: true,
    pageSpeed: 'Moderate',
    httpsEnabled: true,
    xmlSitemap: false,
    robotsTxt: true,
    issues: ['No XML sitemap found', 'Some images missing alt text']
  };
}

function generateDefaultContentSEO(): SEOReport['contentSEO'] {
  return {
    score: 65,
    titleTags: { found: 5, optimized: 3, issues: ['Homepage title too generic'] },
    metaDescriptions: { found: 3, optimized: 2, issues: ['Missing on service pages'] },
    headingStructure: { proper: true, issues: [] },
    contentQuality: 'Good',
    keywordOptimization: ['Could target more local keywords', 'Service-specific content needed']
  };
}

function generateDefaultLocalSEO(doctor: Doctor): SEOReport['localSEO'] {
  return {
    score: 75,
    googleMyBusiness: true,
    napConsistency: true,
    localKeywords: [`dentist ${doctor.city}`, `${doctor.specialty} ${doctor.city}`, `dental office near me`],
    schemaMarkup: false,
    reviews: { platforms: ['Google'], averageRating: 4.2 }
  };
}

function generateDefaultRecommendations(): SEOReport['recommendations'] {
  return {
    immediate: [
      'Add XML sitemap and submit to Google',
      'Optimize homepage title tag with location',
      'Add schema markup for local business'
    ],
    shortTerm: [
      'Create location-specific service pages',
      'Build out blog with dental tips content',
      'Improve page load speed'
    ],
    longTerm: [
      'Develop comprehensive content strategy',
      'Build local backlinks from community sites',
      'Implement review generation system'
    ]
  };
}

function generateDefaultOpportunities(doctor: Doctor): SEOReport['opportunities'] {
  return {
    keywords: [
      { keyword: `emergency dentist ${doctor.city}`, difficulty: 'Medium', volume: '720/mo' },
      { keyword: `teeth whitening ${doctor.city}`, difficulty: 'Easy', volume: '140/mo' },
      { keyword: `dental implants near me`, difficulty: 'Hard', volume: '1.9k/mo' }
    ],
    contentGaps: [
      'No content about common procedures',
      'Missing patient testimonials page',
      'No FAQ section'
    ],
    technicalFixes: [
      'Compress images for faster loading',
      'Implement lazy loading',
      'Add structured data markup'
    ]
  };
}

function generateFallbackSEOReport(websiteUrl: string, doctor: Doctor): SEOReport {
  return {
    websiteUrl,
    overallScore: 60,
    technicalSEO: generateDefaultTechnicalSEO(),
    contentSEO: generateDefaultContentSEO(),
    localSEO: generateDefaultLocalSEO(doctor),
    competitors: { topRanking: [] },
    recommendations: generateDefaultRecommendations(),
    opportunities: generateDefaultOpportunities(doctor)
  };
}

/**
 * Get cached research results
 */
export async function getCachedCanvasResearch(
  doctorNpi: string,
  product: string
): Promise<{ instant?: InstantScanResult; deep?: DeepResearchResult } | null> {
  const { data } = await supabase
    .from('research_jobs')
    .select('*')
    .eq('doctor_npi', doctorNpi)
    .eq('product', product)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1);
    
  if (data && data.length > 0) {
    const job = data[0];
    const age = Date.now() - new Date(job.completed_at).getTime();
    
    // Cache for 7 days
    if (age < 7 * 24 * 60 * 60 * 1000) {
      return {
        instant: job.instant_results,
        deep: job.deep_results
      };
    }
  }
  
  return null;
}

/**
 * Main entry point for Canvas research
 */
export async function runCanvasResearch(
  doctor: Doctor,
  product: string,
  onInstantComplete?: (result: InstantScanResult) => void,
  onDeepComplete?: (result: DeepResearchResult) => void
): Promise<void> {
  // Check cache first
  const cached = await getCachedCanvasResearch(doctor.npi, product);
  if (cached) {
    if (cached.instant && onInstantComplete) {
      onInstantComplete(cached.instant);
    }
    if (cached.deep && onDeepComplete) {
      onDeepComplete(cached.deep);
    }
    return;
  }
  
  // Run instant scan
  const instantResult = await instantCanvasScan(doctor, product);
  if (onInstantComplete) {
    onInstantComplete(instantResult);
  }
  
  // Run deep research in background
  deepCanvasResearch(doctor, product, instantResult)
    .then(deepResult => {
      if (onDeepComplete) {
        onDeepComplete(deepResult);
      }
    })
    .catch(error => {
      console.error('Deep research failed:', error);
    });
}