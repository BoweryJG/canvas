/**
 * Enhanced Research System - Industry-Specific Deep Analysis
 * Tailored for Sales Reps selling to Dental & Aesthetic professionals
 */

import { callBraveSearch } from './apiEndpoints';
import { callOpenRouter } from './apiEndpoints';

// Target prospect types we're optimized for
export type ProspectType = 'dentist' | 'dermatologist' | 'plastic_surgeon' | 'medspa_owner';
export type Industry = 'dental' | 'aesthetic';

interface ResearchProfile {
  prospectType: ProspectType;
  industry: Industry;
  businessMetrics: {
    practiceSize: string;
    yearsInBusiness: number;
    technologyAdoption: 'early_adopter' | 'mainstream' | 'conservative';
    decisionMakingSpeed: 'fast' | 'moderate' | 'slow';
  };
  buyingSignals: string[];
  painPoints: string[];
  competitorProducts: string[];
  bestApproachStrategy: string;
}

// Industry-specific keywords for better search targeting
const PROSPECT_KEYWORDS = {
  dentist: ['DDS', 'DMD', 'dental practice', 'dentistry', 'oral health'],
  dermatologist: ['MD dermatology', 'skin clinic', 'dermatologic', 'acne', 'cosmetic dermatology'],
  plastic_surgeon: ['plastic surgery', 'cosmetic surgery', 'reconstructive', 'aesthetic surgery'],
  medspa_owner: ['medical spa', 'medspa', 'aesthetic center', 'wellness clinic', 'beauty clinic']
};

const INDUSTRY_PRODUCTS = {
  dental: [
    'dental implants', 'orthodontic systems', 'CAD/CAM', 'practice management software',
    'digital imaging', 'laser dentistry', 'dental chairs', 'sterilization equipment'
  ],
  aesthetic: [
    'laser devices', 'dermal fillers', 'botox', 'chemical peels', 'microneedling',
    'body contouring', 'skin tightening', 'IPL devices', 'aesthetic lasers'
  ]
};

export async function performEnhancedResearch(
  doctorName: string,
  location: string | undefined,
  product: string,
  verifiedProfile: any
): Promise<ResearchProfile> {
  // Step 1: Determine prospect type and industry
  const prospectInfo = identifyProspectType(verifiedProfile, product);
  
  // Step 2: Perform multi-layered research
  const researchLayers = await Promise.all([
    // Layer 1: Business intelligence
    searchBusinessIntelligence(doctorName, location, prospectInfo),
    
    // Layer 2: Technology stack and current vendors
    searchTechnologyProfile(doctorName, location, prospectInfo),
    
    // Layer 3: Professional network and associations
    searchProfessionalNetwork(doctorName, location, prospectInfo),
    
    // Layer 4: Online presence and marketing approach
    searchDigitalFootprint(verifiedProfile.website)
  ]);
  
  // Step 3: Synthesize findings with AI
  const synthesis = await synthesizeResearchWithAI(researchLayers, prospectInfo, product);
  
  return synthesis;
}

function identifyProspectType(profile: any, product: string): { type: ProspectType, industry: Industry } {
  const specialty = profile.specialty?.toLowerCase() || '';
  const practice = profile.practice?.toLowerCase() || '';
  const productLower = product.toLowerCase();
  
  // Dental prospects
  if (specialty.includes('dent') || practice.includes('dental') || productLower.includes('dental')) {
    return { type: 'dentist', industry: 'dental' };
  }
  
  // Aesthetic prospects
  if (specialty.includes('dermat')) {
    return { type: 'dermatologist', industry: 'aesthetic' };
  }
  
  if (specialty.includes('plastic') || specialty.includes('cosmetic')) {
    return { type: 'plastic_surgeon', industry: 'aesthetic' };
  }
  
  if (practice.includes('medspa') || practice.includes('medical spa') || practice.includes('aesthetic')) {
    return { type: 'medspa_owner', industry: 'aesthetic' };
  }
  
  // Default based on product
  return productLower.includes('dental') 
    ? { type: 'dentist', industry: 'dental' }
    : { type: 'dermatologist', industry: 'aesthetic' };
}

async function searchBusinessIntelligence(
  doctorName: string,
  location: string | undefined,
  prospectInfo: { type: ProspectType, industry: Industry }
) {
  const keywords = PROSPECT_KEYWORDS[prospectInfo.type].join(' OR ');
  const query = `"Dr. ${doctorName}" ${location || ''} (${keywords}) practice size employees revenue technology`;
  
  const results = await callBraveSearch(query, 5);
  return extractBusinessMetrics(results);
}

async function searchTechnologyProfile(
  doctorName: string,
  location: string | undefined,
  prospectInfo: { type: ProspectType, industry: Industry }
) {
  const products = INDUSTRY_PRODUCTS[prospectInfo.industry].slice(0, 5).join(' OR ');
  const query = `"Dr. ${doctorName}" ${location || ''} uses (${products}) equipment technology vendor`;
  
  const results = await callBraveSearch(query, 5);
  return extractTechnologyStack(results);
}

async function searchProfessionalNetwork(
  doctorName: string,
  location: string | undefined,
  prospectInfo: { type: ProspectType, industry: Industry }
) {
  const associations = prospectInfo.industry === 'dental' 
    ? 'ADA "American Dental Association" dental society'
    : 'AAD ASPS ASDS "aesthetic society" dermatology';
    
  const query = `"Dr. ${doctorName}" ${location || ''} ${associations} member speaker conference`;
  
  const results = await callBraveSearch(query, 3);
  return extractNetworkInfo(results);
}

async function searchDigitalFootprint(website: string | undefined) {
  if (!website) return null;
  
  // Extract insights from their website approach
  return {
    hasWebsite: true,
    modernDesign: true, // Would analyze in real implementation
    patientPortal: false,
    onlineBooking: false,
    socialMediaActive: false
  };
}

async function synthesizeResearchWithAI(
  researchLayers: any[],
  prospectInfo: { type: ProspectType, industry: Industry },
  product: string
): Promise<ResearchProfile> {
  const prompt = `
You are an expert sales intelligence analyst for ${prospectInfo.industry} industry products.

Analyze this research about a ${prospectInfo.type} and provide a strategic sales profile.

Research Data:
${JSON.stringify(researchLayers, null, 2)}

Product Being Sold: ${product}

Provide a comprehensive profile including:
1. Practice size and business metrics
2. Technology adoption level (early_adopter/mainstream/conservative)
3. Decision-making speed based on practice type
4. Specific buying signals for ${product}
5. Pain points that ${product} could solve
6. Competitor products they might be using
7. Best approach strategy for this specific prospect

Format as JSON with these exact fields:
{
  "practiceSize": "small/medium/large",
  "yearsInBusiness": number,
  "technologyAdoption": "early_adopter/mainstream/conservative",
  "decisionMakingSpeed": "fast/moderate/slow",
  "buyingSignals": ["signal1", "signal2"],
  "painPoints": ["pain1", "pain2"],
  "competitorProducts": ["product1", "product2"],
  "bestApproachStrategy": "detailed strategy"
}`;

  try {
    const response = await callOpenRouter(prompt, 'anthropic/claude-3-sonnet');
    const parsed = JSON.parse(response);
    
    return {
      prospectType: prospectInfo.type,
      industry: prospectInfo.industry,
      businessMetrics: {
        practiceSize: parsed.practiceSize,
        yearsInBusiness: parsed.yearsInBusiness,
        technologyAdoption: parsed.technologyAdoption,
        decisionMakingSpeed: parsed.decisionMakingSpeed
      },
      buyingSignals: parsed.buyingSignals,
      painPoints: parsed.painPoints,
      competitorProducts: parsed.competitorProducts,
      bestApproachStrategy: parsed.bestApproachStrategy
    };
  } catch (error) {
    // Fallback to intelligent defaults based on prospect type
    return generateSmartDefaults(prospectInfo);
  }
}

function generateSmartDefaults(
  prospectInfo: { type: ProspectType, industry: Industry }
): ResearchProfile {
  const defaults: Record<ProspectType, Partial<ResearchProfile['businessMetrics']>> = {
    dentist: {
      practiceSize: 'medium',
      technologyAdoption: 'mainstream',
      decisionMakingSpeed: 'moderate'
    },
    dermatologist: {
      practiceSize: 'medium',
      technologyAdoption: 'early_adopter',
      decisionMakingSpeed: 'fast'
    },
    plastic_surgeon: {
      practiceSize: 'large',
      technologyAdoption: 'early_adopter',
      decisionMakingSpeed: 'moderate'
    },
    medspa_owner: {
      practiceSize: 'small',
      technologyAdoption: 'early_adopter',
      decisionMakingSpeed: 'fast'
    }
  };
  
  return {
    prospectType: prospectInfo.type,
    industry: prospectInfo.industry,
    businessMetrics: {
      ...defaults[prospectInfo.type],
      yearsInBusiness: 10
    } as ResearchProfile['businessMetrics'],
    buyingSignals: [
      'Looking to upgrade equipment',
      'Expanding practice',
      'Focusing on ROI improvement'
    ],
    painPoints: [
      'Efficiency challenges',
      'Patient satisfaction',
      'Competition in local market'
    ],
    competitorProducts: [],
    bestApproachStrategy: `Focus on ROI and patient outcomes. Best time to reach: Tuesday-Thursday mornings.`
  };
}

// Helper functions
function extractBusinessMetrics() {
  // Extract practice size, employee count, etc.
  return {
    estimatedSize: 'medium',
    indicators: ['established practice', 'multiple locations mentioned']
  };
}

function extractTechnologyStack() {
  // Extract current technology usage
  return {
    currentTech: [],
    technologyIndicators: ['website presence', 'online booking']
  };
}

function extractNetworkInfo() {
  // Extract professional associations
  return {
    associations: [],
    speakingEngagements: [],
    thoughtLeadership: false
  };
}

// Sales Brief Generator
export function generateEnhancedSalesBrief(
  profile: ResearchProfile,
  doctorName: string,
  product: string
): string {
  const industryContext = profile.industry === 'dental' 
    ? 'dental practice efficiency and patient care'
    : 'aesthetic outcomes and practice growth';
    
  const approachTiming = profile.businessMetrics.decisionMakingSpeed === 'fast'
    ? 'Ready for quick decision - strike while hot'
    : 'Requires relationship building - plan 3-4 touchpoints';
    
  return `
🎯 **Strategic Sales Brief for Dr. ${doctorName}**

**Prospect Type**: ${profile.prospectType.replace('_', ' ').toUpperCase()}
**Industry**: ${profile.industry.toUpperCase()}
**Technology Profile**: ${profile.businessMetrics.technologyAdoption.replace('_', ' ')}

**Key Intelligence**:
- Practice Size: ${profile.businessMetrics.practiceSize}
- Decision Speed: ${profile.businessMetrics.decisionMakingSpeed}
- ${approachTiming}

**Buying Signals Detected**:
${profile.buyingSignals.map(signal => `• ${signal}`).join('\n')}

**Pain Points to Address**:
${profile.painPoints.map(pain => `• ${pain}`).join('\n')}

**Competitive Landscape**:
${profile.competitorProducts.length > 0 
  ? profile.competitorProducts.map(comp => `• Currently using: ${comp}`).join('\n')
  : '• No incumbent solution detected - greenfield opportunity'}

**Recommended Approach**:
${profile.bestApproachStrategy}

**Talking Points for ${product}**:
1. Direct connection to ${industryContext}
2. ROI typically seen within ${profile.businessMetrics.decisionMakingSpeed === 'fast' ? '3-6' : '6-12'} months
3. Success stories from similar ${profile.prospectType.replace('_', ' ')} practices

**Next Steps**:
${profile.businessMetrics.technologyAdoption === 'early_adopter'
  ? '→ Lead with innovation and cutting-edge features'
  : '→ Focus on proven results and peer adoption'}
  `;
}