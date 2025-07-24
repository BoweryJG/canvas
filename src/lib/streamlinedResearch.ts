/**
 * Streamlined Research Pipeline
 * Minimal API calls, maximum efficiency
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { type ResearchSource } from './webResearch';
import { type ExtendedResearchData } from './types/research';
import { callBraveSearch, callFirecrawlScrape } from './apiEndpoints';
import { getApiEndpoint } from '../config/api';
import { findProcedureByName } from './procedureDatabase';
import { searchCache, cachedApiCall, CacheKeys } from './intelligentCaching';

interface BraveSearchResult {
  url?: string;
  title?: string;
  description?: string;
}

interface BraveSearchResponse {
  web?: {
    results?: BraveSearchResult[];
  };
}


interface ClaudeResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface StreamlinedProgress {
  updateStage?: (stage: string) => void;
  updateStep?: (stepId: string, status: 'pending' | 'active' | 'completed', result?: string) => void;
}

export async function streamlinedResearch(
  doctor: Doctor,
  product: string,
  progress?: StreamlinedProgress
): Promise<ExtendedResearchData> {
  console.log('🚀 Streamlined Research for:', doctor.displayName);
  console.log('📦 Product:', product);
  
  const sources: ResearchSource[] = [];
  const startTime = Date.now();
  
  try {
    // Phase 1: Collect Basic Data
    progress?.updateStage?.('Collecting practice information...');
    progress?.updateStep?.('search', 'active');
    
    // 1. Search for practice info and website
    const practiceSearch = await cachedApiCall<BraveSearchResponse>(
      searchCache,
      CacheKeys.search(`${doctor.displayName} ${doctor.city}`),
      async () => callBraveSearch(`"${doctor.displayName}" ${doctor.specialty} ${doctor.city} ${doctor.state} website contact`),
      30 // 30 min cache
    );
    
    // Extract website URL from search results
    let websiteUrl: string | null = null;
    interface PracticeInfo {
      phone?: string;
      address?: string;
      specialty?: string;
      currentTechnology?: string[];
      name?: string;
      specialties?: string[];
    }
    
    const practiceInfo: PracticeInfo = {
      phone: doctor.phone,
      address: doctor.fullAddress,
      specialty: doctor.specialty
    };
    
    if (practiceSearch?.web?.results) {
      const results = practiceSearch.web.results;
      
      // Find practice website
      websiteUrl = results.find((r: BraveSearchResult) => 
        r.url && 
        !r.url.includes('healthgrades') && 
        !r.url.includes('vitals.com') &&
        !r.url.includes('zocdoc')
      )?.url || null;
      
      // Extract any additional info from snippets
      results.forEach((result: BraveSearchResult) => {
        if (result.description) {
          // Extract phone if found
          const phoneMatch = result.description.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
          if (phoneMatch && !practiceInfo.phone) {
            practiceInfo.phone = phoneMatch[0];
          }
        }
      });
      
      sources.push({
        type: 'medical_directory',
        title: 'Practice Search',
        url: 'brave.com',
        content: JSON.stringify(results.slice(0, 3)),
        confidence: 85,
        lastUpdated: new Date().toISOString()
      });
    }
    
    progress?.updateStep?.('search', 'completed', websiteUrl ? 'Website found' : 'Basic info collected');
    
    // 2. Scrape website if found (optional)
    if (websiteUrl) {
      progress?.updateStep?.('website', 'active');
      try {
        const websiteData = await callFirecrawlScrape(websiteUrl);
        if (websiteData?.markdown) {
          sources.push({
            type: 'practice_website',
            title: 'Practice Website',
            url: websiteUrl,
            content: websiteData.markdown.substring(0, 5000), // Limit content size
            confidence: 95,
            lastUpdated: new Date().toISOString()
          });
          
          // Extract tech stack mentions
          const techKeywords = ['CEREC', 'CAD/CAM', 'laser', 'digital', '3D', 'cone beam', 'intraoral scanner'];
          const foundTech = techKeywords.filter(tech => 
            websiteData.markdown.toLowerCase().includes(tech.toLowerCase())
          );
          
          if (foundTech.length > 0) {
            practiceInfo.currentTechnology = foundTech;
          }
        }
        progress?.updateStep?.('website', 'completed', 'Website analyzed');
      } catch (error) {
        console.warn('Website scrape failed:', error instanceof Error ? error.message : String(error));
        progress?.updateStep?.('website', 'completed', 'Website unreachable');
      }
    }
    
    // 3. Get product/procedure info
    progress?.updateStep?.('product', 'active');
    const procedureInfo = await findProcedureByName(product);
    
    sources.push({
      type: 'product_research',
      title: `${product} Information`,
      url: 'internal-database',
      content: JSON.stringify(procedureInfo || { name: product, category: 'Medical Device' }),
      confidence: 100,
      lastUpdated: new Date().toISOString()
    });
    
    progress?.updateStep?.('product', 'completed', 'Product info loaded');
    
    // Phase 2: Single AI Analysis
    progress?.updateStage?.('Generating personalized intelligence...');
    progress?.updateStep?.('analysis', 'active');
    
    // Prepare context for Claude
    const context = {
      doctor: {
        name: doctor.displayName,
        location: `${doctor.city}, ${doctor.state}`,
        organization: doctor.organizationName,
        npi: doctor.npi,
        ...practiceInfo
      },
      product: {
        name: product,
        details: procedureInfo
      },
      websiteInsights: websiteUrl ? sources.find(s => s.type === 'practice_website')?.content : null,
      searchResults: sources.find(s => s.type === 'medical_directory')?.content
    };
    
    // Single comprehensive Claude call
    const analysis = await generateComprehensiveAnalysis(context);
    
    progress?.updateStep?.('analysis', 'completed', 'Intelligence generated');
    
    // Build final response
    const researchData: ExtendedResearchData = {
      doctorName: doctor.displayName,
      practiceInfo: analysis.practiceInfo || practiceInfo,
      businessIntel: analysis.businessIntel || {},
      sources,
      confidenceScore: 85,
      completedAt: new Date().toISOString(),
      technologyStack: analysis.technologyStack || {},
      marketPosition: analysis.marketPosition || {},
      buyingSignals: analysis.buyingSignals || [],
      approachStrategy: analysis.approachStrategy || {},
      painPoints: analysis.painPoints || [],
      salesBrief: analysis.salesBrief || '',
      totalTime: Date.now() - startTime,
      // Default empty objects for unused fields
      credentials: {
        medicalSchool: undefined,
        residency: undefined,
        boardCertifications: [],
        yearsExperience: undefined,
        hospitalAffiliations: []
      },
      reviews: {
        averageRating: undefined,
        totalReviews: undefined,
        commonPraise: [],
        commonConcerns: [],
        recentFeedback: []
      },
      competition: {},
      decisionMakers: {},
      budgetInfo: {}
    };
    
    return researchData;
    
  } catch (error) {
    console.error('Streamlined research error:', error instanceof Error ? error.message : String(error));
    // Return minimal data on error
    return createFallbackData(doctor, product, sources, Date.now() - startTime);
  }
}

interface AnalysisContext {
  doctor: {
    name: string;
    location: string;
    organization?: string;
    npi?: string;
    [key: string]: unknown;
  };
  product: {
    name: string;
    details?: unknown;
  };
  websiteInsights?: string | null;
  searchResults?: string;
}

interface AnalysisResult {
  practiceInfo?: Record<string, unknown>;
  businessIntel?: Record<string, unknown>;
  technologyStack?: Record<string, unknown>;
  marketPosition?: Record<string, unknown>;
  buyingSignals?: string[];
  approachStrategy?: Record<string, unknown>;
  painPoints?: string[];
  salesBrief?: string;
}

async function generateComprehensiveAnalysis(context: AnalysisContext): Promise<AnalysisResult> {
  const prompt = `
You are an expert medical sales intelligence analyst. Generate comprehensive, personalized sales intelligence.

CONTEXT:
${JSON.stringify(context, null, 2)}

Generate a complete analysis including:

1. PRACTICE INFO
- Enhance with any found details
- Technology currently in use
- Practice size/type indicators

2. BUSINESS INTEL
- Decision-making structure
- Budget indicators
- Technology adoption patterns

3. TECHNOLOGY STACK
- Current technologies identified
- Integration opportunities
- Gaps that ${context.product.name} could fill

4. BUYING SIGNALS
- Specific indicators this practice would benefit from ${context.product.name}
- Timing factors
- Urgency indicators

5. APPROACH STRATEGY
- Personalized opening approach
- Key value props for THIS specific practice
- Objection handling specific to their situation

6. PAIN POINTS
- Specific to ${context.doctor.specialty}
- That ${context.product.name} addresses
- Based on practice type/size

7. SALES BRIEF
- Executive summary (2-3 sentences)
- Why NOW for this practice
- Specific benefits for ${context.doctor.name}

Return as JSON with all sections filled. Be specific and reference actual details found about the practice.`;

  try {
    const response = await fetch(getApiEndpoint('anthropic'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        prompt,
        model: 'claude-3-5-sonnet-20241022'
      })
    });

    if (!response.ok) {
      throw new Error(`Backend Anthropic API error: ${response.status}`);
    }

    const data = await response.json() as ClaudeResponse;
    return JSON.parse(data.choices[0].message.content) as AnalysisResult;
  } catch (error) {
    console.error('AI analysis failed:', error instanceof Error ? error.message : String(error));
    return {};
  }
}

function createFallbackData(
  doctor: Doctor,
  product: string,
  sources: ResearchSource[],
  totalTime: number
): ExtendedResearchData {
  return {
    doctorName: doctor.displayName,
    practiceInfo: {
      name: doctor.organizationName || `${doctor.displayName}'s Practice`,
      phone: doctor.phone,
      address: doctor.fullAddress,
      specialties: [doctor.specialty]
    },
    businessIntel: {
      practiceType: 'Independent Practice',
      specialty: doctor.specialty
    },
    sources,
    confidenceScore: 60,
    completedAt: new Date().toISOString(),
    technologyStack: {},
    marketPosition: {},
    buyingSignals: [],
    approachStrategy: {
      bestTiming: 'Business hours',
      preferredChannel: 'Email'
    },
    painPoints: [],
    salesBrief: `${product} opportunity for ${doctor.displayName}'s ${doctor.specialty} practice in ${doctor.city}.`,
    totalTime,
    credentials: {
      medicalSchool: undefined,
      residency: undefined,
      boardCertifications: [],
      yearsExperience: undefined,
      hospitalAffiliations: []
    },
    reviews: {
      averageRating: undefined,
      totalReviews: undefined,
      commonPraise: [],
      commonConcerns: [],
      recentFeedback: []
    },
    competition: {},
    decisionMakers: {},
    budgetInfo: {}
  };
}