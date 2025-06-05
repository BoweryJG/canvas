/**
 * Product/Procedure Intelligence System
 * Researches the product/procedure in the local market context
 */

import { callBraveSearch, callBraveLocalSearch, callOpenRouter } from './apiEndpoints';

export interface ProductIntelligence {
  productName: string;
  location: string;
  marketData: {
    awareness: number; // 1-100 awareness score
    competitorProducts: CompetitorProduct[];
    pricingRange: {
      low: number;
      average: number;
      high: number;
      currency: string;
    };
    marketSize: string;
    growthRate: string;
  };
  competitiveLandscape: {
    topCompetitors: string[];
    marketLeader: string;
    differentiators: string[];
    weaknesses: string[];
  };
  localInsights: {
    adoptionRate: string;
    recentCases: string[];
    socialProof: SocialPost[];
    localExperts: string[];
    barriers: string[];
  };
  messagingStrategy: {
    keyBenefits: string[];
    objectionHandlers: Record<string, string>;
    competitivePitch: string;
    localizedAngle: string;
  };
}

interface CompetitorProduct {
  name: string;
  company: string;
  marketShare: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
}

interface SocialPost {
  platform: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  reach: string;
  date: string;
}

export async function gatherProductIntelligence(
  product: string,
  location: { city: string; state: string },
  specialty?: string
): Promise<ProductIntelligence> {
  console.log(`🔍 Researching ${product} in ${location.city}, ${location.state}`);
  
  try {
    // Phase 1: Gather market data
    const marketData = await gatherMarketData(product, location, specialty);
    
    // Phase 2: Analyze local competitive landscape
    const competitiveData = await analyzeLocalCompetition(product, location);
    
    // Phase 3: Gather local insights and social proof
    const localInsights = await gatherLocalInsights(product, location);
    
    // Phase 4: Synthesize with Claude 4 Opus
    const synthesis = await synthesizeProductIntelligence(
      product,
      location,
      marketData,
      competitiveData,
      localInsights
    );
    
    return synthesis;
    
  } catch (error) {
    console.error('Product intelligence error:', error);
    return createBasicProductIntelligence(product, location);
  }
}

async function gatherMarketData(
  product: string,
  location: { city: string; state: string },
  specialty?: string
): Promise<any> {
  const queries = [
    // General market research
    `"${product}" dental market size pricing ${location.state}`,
    
    // Competitor analysis
    `"${product}" alternatives competitors comparison dental`,
    
    // Local adoption
    `"${product}" adoption rate dental practices ${location.city} ${location.state}`,
    
    // Pricing research
    `"${product}" cost price dental ${specialty || 'practice'} ${location.state}`
  ];
  
  const results = await Promise.all(
    queries.map(q => callBraveSearch(q, 10))
  );
  
  return {
    marketSize: results[0],
    competitors: results[1],
    adoption: results[2],
    pricing: results[3]
  };
}

async function analyzeLocalCompetition(
  product: string,
  location: { city: string; state: string }
): Promise<any> {
  // Search for local practices using this product
  const localQuery = `"${product}" dental practices near ${location.city}, ${location.state}`;
  const localResults = await callBraveLocalSearch(localQuery, 20);
  
  // Search for competitor products in the area
  const competitorQuery = `dental technology equipment "${product}" alternatives ${location.city}`;
  const competitorResults = await callBraveSearch(competitorQuery, 10);
  
  return {
    localAdopters: localResults,
    competitorProducts: competitorResults
  };
}

async function gatherLocalInsights(
  product: string,
  location: { city: string; state: string }
): Promise<any> {
  const queries = [
    // Recent social media posts
    `"${product}" dental ${location.city} site:facebook.com OR site:instagram.com OR site:linkedin.com`,
    
    // Case studies and success stories
    `"${product}" success story case study dental ${location.state}`,
    
    // Local dental society mentions
    `"${product}" dental society association ${location.state}`,
    
    // Recent news and announcements
    `"${product}" dental news announcement ${location.city} ${location.state}`
  ];
  
  const results = await Promise.all(
    queries.map(q => callBraveSearch(q, 5))
  );
  
  return {
    socialPosts: results[0],
    caseStudies: results[1],
    societyMentions: results[2],
    recentNews: results[3]
  };
}

async function synthesizeProductIntelligence(
  product: string,
  location: { city: string; state: string },
  marketData: any,
  competitiveData: any,
  localInsights: any
): Promise<ProductIntelligence> {
  const prompt = `You are a medical device/product market intelligence expert. Analyze this comprehensive data about ${product} in ${location.city}, ${location.state} and create actionable intelligence.

PRODUCT: ${product}
LOCATION: ${location.city}, ${location.state}

MARKET DATA:
${JSON.stringify(marketData, null, 2)}

COMPETITIVE LANDSCAPE:
${JSON.stringify(competitiveData, null, 2)}

LOCAL INSIGHTS:
${JSON.stringify(localInsights, null, 2)}

Create a comprehensive product intelligence report with:

1. MARKET AWARENESS (1-100 score based on search volume, social mentions)
2. COMPETITIVE ANALYSIS (who's winning, why, pricing)
3. LOCAL ADOPTION PATTERNS (early adopters, resistance points)
4. SOCIAL PROOF (specific examples from the data)
5. MESSAGING STRATEGY (what resonates locally)

Return as JSON matching the ProductIntelligence interface with specific, localized insights.

Focus on:
- Actual pricing ranges found in the data
- Real competitor names and their positioning
- Specific local practices using/discussing the product
- Recent social media posts and their sentiment
- Local barriers to adoption
- Winning message angles for this specific market`;

  try {
    const response = await callOpenRouter(prompt, 'anthropic/claude-opus-4-20250514');
    return JSON.parse(response);
  } catch (error) {
    console.error('Claude 4 synthesis error:', error);
    // Fallback
    return createBasicProductIntelligence(product, location);
  }
}

function createBasicProductIntelligence(
  product: string,
  location: { city: string; state: string }
): ProductIntelligence {
  return {
    productName: product,
    location: `${location.city}, ${location.state}`,
    marketData: {
      awareness: 50,
      competitorProducts: [],
      pricingRange: {
        low: 0,
        average: 0,
        high: 0,
        currency: 'USD'
      },
      marketSize: 'Unknown',
      growthRate: 'Unknown'
    },
    competitiveLandscape: {
      topCompetitors: [],
      marketLeader: 'Unknown',
      differentiators: [],
      weaknesses: []
    },
    localInsights: {
      adoptionRate: 'Unknown',
      recentCases: [],
      socialProof: [],
      localExperts: [],
      barriers: []
    },
    messagingStrategy: {
      keyBenefits: [`${product} can improve practice efficiency`],
      objectionHandlers: {},
      competitivePitch: `Consider ${product} for your practice`,
      localizedAngle: 'Modern solution for modern practices'
    }
  };
}

/**
 * Combine doctor and product intelligence for ultimate personalization
 */
export function combineIntelligence(
  doctorIntel: any,
  productIntel: ProductIntelligence
): any {
  return {
    // Doctor-specific + product-specific insights
    personalizedPitch: `Dr. ${doctorIntel.doctorName}, ${productIntel.competitiveLandscape.topCompetitors.length > 0 
      ? `while many ${doctorIntel.location} practices use ${productIntel.competitiveLandscape.topCompetitors[0]}, ${productIntel.productName} offers ${productIntel.competitiveLandscape.differentiators[0]}` 
      : `${productIntel.productName} is gaining traction in ${doctorIntel.location}`}`,
    
    // Localized competitive advantage
    competitiveEdge: productIntel.localInsights.adoptionRate === 'Low' 
      ? 'Be an early adopter and differentiate your practice'
      : 'Join leading practices already seeing success',
    
    // Price anchoring based on local market
    priceContext: `Investment range in ${productIntel.location}: $${productIntel.marketData.pricingRange.low.toLocaleString()} - $${productIntel.marketData.pricingRange.high.toLocaleString()}`,
    
    // Social proof specific to area
    localProof: productIntel.localInsights.socialProof.filter(p => p.sentiment === 'positive').slice(0, 3),
    
    // Objections based on local barriers
    anticipatedObjections: productIntel.localInsights.barriers,
    
    // Urgency based on competitive landscape
    urgencyAngle: productIntel.competitiveLandscape.topCompetitors.length > 2
      ? 'Your competitors are already evaluating similar solutions'
      : 'Gain first-mover advantage in your area'
  };
}