/**
 * SEO Analysis System
 * Analyzes practice websites for local SEO optimization opportunities
 */

import { callBraveSearch } from './apiEndpoints';

export interface SEOAnalysis {
  url: string;
  score: number;
  issues: SEOIssue[];
  opportunities: SEOOpportunity[];
  competitors: LocalCompetitor[];
  keywords: KeywordAnalysis[];
  technicalSEO: TechnicalSEO;
  localSEO: LocalSEO;
  contentAnalysis: ContentAnalysis;
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info';
  category: string;
  issue: string;
  impact: string;
  solution: string;
}

export interface SEOOpportunity {
  title: string;
  description: string;
  estimatedImpact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
}

export interface LocalCompetitor {
  name: string;
  url: string;
  ranking: number;
  strengths: string[];
}

export interface KeywordAnalysis {
  keyword: string;
  monthlySearches: number;
  difficulty: number;
  currentRanking?: number;
  opportunity: boolean;
}

export interface TechnicalSEO {
  pageSpeed: {
    mobile: number;
    desktop: number;
  };
  mobileFriendly: boolean;
  https: boolean;
  schema: boolean;
  sitemap: boolean;
  robots: boolean;
}

export interface LocalSEO {
  googleMyBusiness: boolean;
  napConsistency: boolean;
  localDirectories: number;
  reviews: {
    google: number;
    average: number;
  };
  localKeywords: boolean;
}

export interface ContentAnalysis {
  titleTag: {
    exists: boolean;
    optimized: boolean;
    length: number;
  };
  metaDescription: {
    exists: boolean;
    optimized: boolean;
    length: number;
  };
  headings: {
    h1Count: number;
    hasKeywords: boolean;
  };
  contentLength: number;
  uniqueContent: boolean;
  freshness: string;
}

/**
 * Perform comprehensive SEO analysis for a practice website
 */
export async function analyzePracticeSEO(
  websiteUrl: string,
  doctorName: string,
  location: string,
  specialty: string,
  userId?: string
): Promise<SEOAnalysis> {
  console.log(`🔍 Starting SEO analysis for ${websiteUrl}`);
  
  // Initialize analysis
  const analysis: SEOAnalysis = {
    url: websiteUrl,
    score: 0,
    issues: [],
    opportunities: [],
    competitors: [],
    keywords: [],
    technicalSEO: {
      pageSpeed: { mobile: 0, desktop: 0 },
      mobileFriendly: false,
      https: false,
      schema: false,
      sitemap: false,
      robots: false
    },
    localSEO: {
      googleMyBusiness: false,
      napConsistency: false,
      localDirectories: 0,
      reviews: { google: 0, average: 0 },
      localKeywords: false
    },
    contentAnalysis: {
      titleTag: { exists: false, optimized: false, length: 0 },
      metaDescription: { exists: false, optimized: false, length: 0 },
      headings: { h1Count: 0, hasKeywords: false },
      contentLength: 0,
      uniqueContent: true,
      freshness: 'unknown'
    }
  };
  
  // Run analyses in parallel
  const [
    technicalAnalysis,
    localAnalysis,
    competitorAnalysis,
    keywordAnalysis
  ] = await Promise.all([
    analyzeTechnicalSEO(websiteUrl),
    analyzeLocalSEO(websiteUrl, doctorName, location, specialty, userId),
    analyzeCompetitors(doctorName, location, specialty, userId),
    analyzeKeywords(doctorName, location, specialty, userId)
  ]);
  
  // Merge results
  analysis.technicalSEO = technicalAnalysis.technical;
  analysis.contentAnalysis = technicalAnalysis.content;
  analysis.issues.push(...technicalAnalysis.issues);
  
  analysis.localSEO = localAnalysis.local;
  analysis.issues.push(...localAnalysis.issues);
  analysis.opportunities.push(...localAnalysis.opportunities);
  
  analysis.competitors = competitorAnalysis;
  analysis.keywords = keywordAnalysis;
  
  // Calculate overall score
  analysis.score = calculateSEOScore(analysis);
  
  // Generate opportunities based on analysis
  analysis.opportunities.push(...generateOpportunities(analysis, specialty));
  
  return analysis;
}

/**
 * Analyze technical SEO aspects
 */
async function analyzeTechnicalSEO(url: string): Promise<{
  technical: TechnicalSEO;
  content: ContentAnalysis;
  issues: SEOIssue[];
}> {
  const issues: SEOIssue[] = [];
  
  // Check HTTPS
  const isHttps = url.startsWith('https://');
  if (!isHttps) {
    issues.push({
      type: 'critical',
      category: 'Security',
      issue: 'Website not using HTTPS',
      impact: 'Google prioritizes secure sites. Patients may see "Not Secure" warnings.',
      solution: 'Install SSL certificate and redirect all HTTP traffic to HTTPS'
    });
  }
  
  // Simulate technical checks (in production, would use actual APIs)
  const technical: TechnicalSEO = {
    pageSpeed: {
      mobile: isHttps ? 75 : 60,
      desktop: isHttps ? 85 : 70
    },
    mobileFriendly: true,
    https: isHttps,
    schema: false, // Would check for structured data
    sitemap: true, // Would check for sitemap.xml
    robots: true // Would check for robots.txt
  };
  
  // Content analysis simulation
  const content: ContentAnalysis = {
    titleTag: {
      exists: true,
      optimized: false,
      length: 55
    },
    metaDescription: {
      exists: true,
      optimized: false,
      length: 150
    },
    headings: {
      h1Count: 1,
      hasKeywords: false
    },
    contentLength: 800,
    uniqueContent: true,
    freshness: 'Recent updates detected'
  };
  
  // Add issues for poor page speed
  if (technical.pageSpeed.mobile < 70) {
    issues.push({
      type: 'warning',
      category: 'Performance',
      issue: 'Slow mobile page speed',
      impact: 'Poor user experience and lower Google rankings',
      solution: 'Optimize images, enable caching, minimize JavaScript'
    });
  }
  
  // Check content optimization
  if (!content.headings.hasKeywords) {
    issues.push({
      type: 'warning',
      category: 'Content',
      issue: 'Main keywords missing from headings',
      impact: 'Reduced relevance for target searches',
      solution: 'Include location and specialty keywords in H1 and H2 tags'
    });
  }
  
  return { technical, content, issues };
}

/**
 * Analyze local SEO factors
 */
async function analyzeLocalSEO(
  _url: string,
  doctorName: string,
  location: string,
  _specialty: string,
  userId?: string
): Promise<{
  local: LocalSEO;
  issues: SEOIssue[];
  opportunities: SEOOpportunity[];
}> {
  const issues: SEOIssue[] = [];
  const opportunities: SEOOpportunity[] = [];
  
  // Search for Google My Business listing
  const gmbQuery = `"${doctorName}" "${location}" site:google.com/maps`;
  const gmbResults = await callBraveSearch(gmbQuery, 3, userId);
  const hasGMB = gmbResults.web?.results?.some((r: any) => r.url.includes('google.com/maps'));
  
  // Search for local directory listings
  const directoryQuery = `"${doctorName}" "${location}" (healthgrades OR vitals OR yelp)`;
  const directoryResults = await callBraveSearch(directoryQuery, 10, userId);
  const directoryCount = directoryResults.web?.results?.filter((r: any) => 
    ['healthgrades', 'vitals', 'yelp', 'yellowpages'].some(d => r.url.includes(d))
  ).length || 0;
  
  const local: LocalSEO = {
    googleMyBusiness: hasGMB || false,
    napConsistency: true, // Would verify Name, Address, Phone across listings
    localDirectories: directoryCount,
    reviews: {
      google: hasGMB ? 25 : 0, // Would fetch actual review count
      average: hasGMB ? 4.5 : 0
    },
    localKeywords: true // Would check for city/neighborhood keywords
  };
  
  // Add issues and opportunities
  if (!hasGMB) {
    issues.push({
      type: 'critical',
      category: 'Local SEO',
      issue: 'No Google My Business listing found',
      impact: 'Missing from Google Maps and local pack results',
      solution: 'Claim and optimize Google My Business profile immediately'
    });
    
    opportunities.push({
      title: 'Create Google My Business Profile',
      description: 'Claim your free GMB listing to appear in local searches and Google Maps',
      estimatedImpact: 'high',
      difficulty: 'easy',
      timeframe: '1-2 hours'
    });
  }
  
  if (directoryCount < 5) {
    opportunities.push({
      title: 'Expand Directory Presence',
      description: `Currently listed on ${directoryCount} directories. Target 10-15 healthcare directories.`,
      estimatedImpact: 'medium',
      difficulty: 'easy',
      timeframe: '2-3 hours'
    });
  }
  
  return { local, issues, opportunities };
}

/**
 * Analyze local competitors
 */
async function analyzeCompetitors(
  doctorName: string,
  location: string,
  specialty: string,
  userId?: string
): Promise<LocalCompetitor[]> {
  const competitors: LocalCompetitor[] = [];
  
  // Search for competing practices
  const competitorQuery = `${specialty} "${location}" -"${doctorName}"`;
  const results = await callBraveSearch(competitorQuery, 10, userId);
  
  if (results.web?.results) {
    const seen = new Set<string>();
    
    for (const result of results.web.results.slice(0, 5)) {
      const domain = new URL(result.url).hostname.replace('www.', '');
      
      if (!seen.has(domain) && !result.url.includes(doctorName.toLowerCase())) {
        seen.add(domain);
        
        competitors.push({
          name: result.title.split('-')[0].trim(),
          url: result.url,
          ranking: competitors.length + 1,
          strengths: analyzeCompetitorStrengths(result)
        });
      }
    }
  }
  
  return competitors;
}

/**
 * Analyze competitor strengths from search result
 */
function analyzeCompetitorStrengths(result: any): string[] {
  const strengths: string[] = [];
  
  if (result.title.length > 50 && result.title.length < 60) {
    strengths.push('Optimized title tags');
  }
  
  if (result.description && result.description.length > 120) {
    strengths.push('Compelling meta descriptions');
  }
  
  if (result.url.includes('https')) {
    strengths.push('Secure website (HTTPS)');
  }
  
  if (result.age && result.age.includes('year')) {
    strengths.push('Established domain authority');
  }
  
  return strengths;
}

/**
 * Analyze keyword opportunities
 */
async function analyzeKeywords(
  _doctorName: string,
  location: string,
  specialty: string,
  _userId?: string
): Promise<KeywordAnalysis[]> {
  const keywords: KeywordAnalysis[] = [];
  
  // Generate keyword variations
  const keywordVariations = [
    `${specialty} ${location}`,
    `${specialty} near me`,
    `best ${specialty} ${location}`,
    `${location} ${specialty}`,
    `${specialty} ${location.split(',')[0]}`, // City only
    `affordable ${specialty} ${location}`,
    `top ${specialty} ${location}`,
    `${specialty} open Saturday ${location}`,
    `emergency ${specialty} ${location}`,
    `${specialty} insurance ${location}`
  ];
  
  // Simulate keyword data (in production, would use keyword research API)
  for (const keyword of keywordVariations) {
    keywords.push({
      keyword,
      monthlySearches: Math.floor(Math.random() * 1000) + 100,
      difficulty: Math.floor(Math.random() * 100),
      currentRanking: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 1 : undefined,
      opportunity: Math.random() > 0.3
    });
  }
  
  // Sort by opportunity
  return keywords.sort((a, b) => {
    const scoreA = a.monthlySearches / (a.difficulty + 1);
    const scoreB = b.monthlySearches / (b.difficulty + 1);
    return scoreB - scoreA;
  });
}

/**
 * Calculate overall SEO score
 */
function calculateSEOScore(analysis: SEOAnalysis): number {
  let score = 0;
  
  // Technical SEO (30 points)
  if (analysis.technicalSEO.https) score += 10;
  if (analysis.technicalSEO.mobileFriendly) score += 5;
  if (analysis.technicalSEO.pageSpeed.mobile > 70) score += 10;
  if (analysis.technicalSEO.schema) score += 5;
  
  // Local SEO (40 points)
  if (analysis.localSEO.googleMyBusiness) score += 20;
  if (analysis.localSEO.localDirectories > 5) score += 10;
  if (analysis.localSEO.reviews.google > 10) score += 10;
  
  // Content (30 points)
  if (analysis.contentAnalysis.titleTag.optimized) score += 10;
  if (analysis.contentAnalysis.contentLength > 500) score += 10;
  if (analysis.contentAnalysis.headings.hasKeywords) score += 10;
  
  return Math.min(score, 100);
}

/**
 * Generate SEO opportunities based on analysis
 */
function generateOpportunities(
  analysis: SEOAnalysis,
  specialty: string
): SEOOpportunity[] {
  const opportunities: SEOOpportunity[] = [];
  
  // Content opportunities
  if (analysis.contentAnalysis.contentLength < 1000) {
    opportunities.push({
      title: 'Expand Service Pages',
      description: `Create detailed pages for each ${specialty} service with 1000+ words`,
      estimatedImpact: 'high',
      difficulty: 'medium',
      timeframe: '2-4 weeks'
    });
  }
  
  // Schema markup
  if (!analysis.technicalSEO.schema) {
    opportunities.push({
      title: 'Implement Medical Schema Markup',
      description: 'Add structured data for medical practice, doctors, and services',
      estimatedImpact: 'medium',
      difficulty: 'easy',
      timeframe: '1-2 days'
    });
  }
  
  // Local content
  opportunities.push({
    title: 'Create Location-Specific Content',
    description: `Write blog posts about ${specialty} topics relevant to your local community`,
    estimatedImpact: 'medium',
    difficulty: 'easy',
    timeframe: 'Ongoing'
  });
  
  return opportunities;
}