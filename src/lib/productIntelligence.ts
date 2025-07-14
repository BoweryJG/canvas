/**
 * PRODUCT INTELLIGENCE ENGINE
 * Integrates Supabase product data with doctor insights for hyper-personalized messaging
 */

import { findProcedureByName, getRelatedProducts, type DentalProcedure, type AestheticProcedure } from './procedureDatabase';
import { type ScrapedWebsiteData } from './firecrawlWebScraper';
import { type DeepIntelligenceResult } from './deepIntelligenceGatherer';
import { callPerplexityResearch } from './apiEndpoints';

export interface ProductIntelligence {
  product: DentalProcedure | AestheticProcedure;
  relatedProducts: string[];
  matchScore: number; // How well product matches practice needs (0-100)
  integrationOpportunities: string[]; // How product integrates with their tech
  roiCalculation: {
    estimatedRevenue: number;
    timeToROI: string;
    patientVolumeIncrease: string;
  };
  competitiveAdvantages: string[]; // Why this product vs competitors
  implementationPlan: {
    timeframe: string;
    steps: string[];
    requiredTraining: string;
  };
  personalizedBenefits: string[]; // Benefits specific to THIS practice
  objectionHandlers: Array<{
    objection: string;
    response: string;
  }>;
}

/**
 * Generate comprehensive product intelligence based on practice data
 */
export async function generateProductIntelligence(
  productName: string,
  practiceData: DeepIntelligenceResult,
  scrapedData?: ScrapedWebsiteData
): Promise<ProductIntelligence | null> {
  console.log(`🎯 Generating product intelligence for ${productName}`);
  
  // Find product in Supabase
  const product = await findProcedureByName(productName);
  if (!product) {
    console.error(`Product not found in database: ${productName}`);
    return null;
  }
  
  // Get related products
  const relatedProducts = await getRelatedProducts(product);
  
  // Calculate match score based on practice characteristics
  const matchScore = calculateMatchScore(product, practiceData, scrapedData);
  
  // Identify integration opportunities with their tech stack
  const integrationOpportunities = identifyIntegrationOpportunities(
    product,
    scrapedData?.techStack
  );
  
  // Calculate ROI based on practice size and specialty
  const roiCalculation = calculateROI(
    product,
    practiceData,
    scrapedData
  );
  
  // Identify competitive advantages
  const competitiveAdvantages = await identifyCompetitiveAdvantages(
    product,
    scrapedData?.painPoints || [],
    scrapedData?.competitiveAdvantages || []
  );
  
  // Create implementation plan
  const implementationPlan = createImplementationPlan(
    product,
    scrapedData?.practiceInfo?.teamSize || 5
  );
  
  // Generate personalized benefits
  const personalizedBenefits = generatePersonalizedBenefits(
    product,
    practiceData,
    scrapedData
  );
  
  // Create objection handlers
  const objectionHandlers = createObjectionHandlers(
    product,
    practiceData,
    scrapedData
  );
  
  return {
    product,
    relatedProducts,
    matchScore,
    integrationOpportunities,
    roiCalculation,
    competitiveAdvantages,
    implementationPlan,
    personalizedBenefits,
    objectionHandlers
  };
}

/**
 * Calculate how well the product matches the practice's needs
 */
function calculateMatchScore(
  product: DentalProcedure | AestheticProcedure,
  practiceData: DeepIntelligenceResult,
  scrapedData?: ScrapedWebsiteData
): number {
  let score = 50; // Base score
  
  // Specialty match
  if (product.specialty && (practiceData.practiceInfo as any)?.specialties?.includes(product.specialty)) {
    score += 20;
  }
  
  // Service match - do they already offer related services?
  if (scrapedData?.services) {
    const relatedServices = scrapedData.services.filter(service => 
      product.keywords?.some(keyword => 
        service.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    if (relatedServices.length > 0) {
      score += 15; // They understand the space
    }
  }
  
  // Pain point match
  if (scrapedData?.painPoints) {
    // Check if product addresses any pain points
    if (scrapedData.painPoints.includes('No online appointment scheduling') && 
        product.name.toLowerCase().includes('scheduling')) {
      score += 20;
    }
    if (scrapedData.painPoints.includes('No patient portal') && 
        product.name.toLowerCase().includes('portal')) {
      score += 20;
    }
  }
  
  // Technology readiness
  if (scrapedData?.techStack?.cms && scrapedData.techStack.cms !== 'Static HTML') {
    score += 10; // They're tech-savvy
  }
  
  // Practice size match
  const teamSize = scrapedData?.practiceInfo?.teamSize || 5;
  if (teamSize > 10 && product.category?.includes('enterprise')) {
    score += 15;
  } else if (teamSize <= 5 && !product.category?.includes('enterprise')) {
    score += 15;
  }
  
  return Math.min(score, 100);
}

/**
 * Identify how the product integrates with their existing tech
 */
function identifyIntegrationOpportunities(
  product: DentalProcedure | AestheticProcedure,
  techStack?: ScrapedWebsiteData['techStack']
): string[] {
  const opportunities: string[] = [];
  
  if (!techStack) {
    return ['Seamless integration with existing systems'];
  }
  
  // CMS integrations
  if (techStack.cms === 'WordPress') {
    opportunities.push('Direct WordPress plugin integration available');
  } else if (techStack.cms === 'Squarespace') {
    opportunities.push('Squarespace widget for easy embedding');
  }
  
  // Analytics integrations
  if (techStack.analytics?.includes('Google Analytics')) {
    opportunities.push('Full Google Analytics event tracking included');
  }
  
  // Marketing integrations
  if (techStack.marketing?.includes('Mailchimp')) {
    opportunities.push('Native Mailchimp integration for patient communications');
  } else if (techStack.marketing?.includes('HubSpot')) {
    opportunities.push('HubSpot CRM sync for seamless lead management');
  }
  
  // Generic opportunities based on product type
  if (product.category?.includes('scheduling')) {
    opportunities.push('Syncs with existing calendar systems');
  }
  if (product.category?.includes('imaging')) {
    opportunities.push('DICOM compatible with existing imaging systems');
  }
  
  return opportunities;
}

/**
 * Calculate ROI based on practice characteristics
 */
function calculateROI(
  product: DentalProcedure | AestheticProcedure,
  _practiceData: DeepIntelligenceResult,
  scrapedData?: ScrapedWebsiteData
): ProductIntelligence['roiCalculation'] {
  const teamSize = scrapedData?.practiceInfo?.teamSize || 5;
  const avgPrice = product.average_price || 10000;
  
  // Estimate based on practice size
  let monthlyRevenueLift = 0;
  let patientVolumeIncrease = '10-15%';
  
  if (teamSize > 10) {
    // Large practice
    monthlyRevenueLift = avgPrice * 0.3; // 30% of product cost monthly
    patientVolumeIncrease = '15-25%';
  } else if (teamSize > 5) {
    // Medium practice
    monthlyRevenueLift = avgPrice * 0.25;
    patientVolumeIncrease = '12-20%';
  } else {
    // Small practice
    monthlyRevenueLift = avgPrice * 0.2;
    patientVolumeIncrease = '10-15%';
  }
  
  // Calculate time to ROI
  const monthsToROI = Math.ceil(avgPrice / monthlyRevenueLift);
  const timeToROI = monthsToROI <= 6 ? `${monthsToROI} months` : 
                    monthsToROI <= 12 ? 'Under 1 year' : 
                    '12-18 months';
  
  return {
    estimatedRevenue: Math.round(monthlyRevenueLift * 12),
    timeToROI,
    patientVolumeIncrease
  };
}

/**
 * Identify competitive advantages based on practice needs
 */
async function identifyCompetitiveAdvantages(
  product: DentalProcedure | AestheticProcedure,
  painPoints: string[],
  existingAdvantages: string[]
): Promise<string[]> {
  const advantages: string[] = [];
  
  // Address specific pain points
  painPoints.forEach(painPoint => {
    if (painPoint.includes('No online') && product.category?.includes('digital')) {
      advantages.push('Solves your online presence gap immediately');
    }
    if (painPoint.includes('difficult to update') && product.category?.includes('management')) {
      advantages.push('Makes practice management effortless');
    }
    if (painPoint.includes('No analytics') && product.keywords?.includes('analytics')) {
      advantages.push('Built-in analytics dashboard for data-driven decisions');
    }
  });
  
  // Enhance existing advantages
  existingAdvantages.forEach(advantage => {
    if (advantage.includes('24/7') && product.category?.includes('support')) {
      advantages.push('Complements your 24/7 service with automated support');
    }
    if (advantage.includes('Same-day') && product.category?.includes('scheduling')) {
      advantages.push('Optimizes your same-day appointment workflow');
    }
  });
  
  // Add product-specific advantages
  if (product.related_products?.length) {
    advantages.push(`Integrates with ${product.related_products.length} other leading solutions`);
  }
  
  // Use AI to generate unique advantages
  try {
    const prompt = `Generate 2 unique competitive advantages for ${product.name} 
                    that would appeal to a ${product.specialty || 'medical'} practice. 
                    Be specific and compelling. Format: One advantage per line.`;
    
    const aiAdvantages = await callPerplexityResearch(prompt, 'search');
    const lines = aiAdvantages.split('\n').filter((line: string) => line.trim());
    advantages.push(...lines.slice(0, 2));
  } catch (error) {
    console.error('AI advantage generation failed:', error);
  }
  
  return advantages.slice(0, 5); // Return top 5 advantages
}

/**
 * Create implementation plan based on practice size
 */
function createImplementationPlan(
  _product: DentalProcedure | AestheticProcedure,
  teamSize: number
): ProductIntelligence['implementationPlan'] {
  let timeframe = '2-4 weeks';
  let requiredTraining = 'Half-day training session';
  
  if (teamSize > 10) {
    timeframe = '4-6 weeks';
    requiredTraining = '2 full-day training sessions with department heads';
  } else if (teamSize <= 3) {
    timeframe = '1-2 weeks';
    requiredTraining = '2-hour virtual training';
  }
  
  const steps = [
    'Initial consultation and needs assessment',
    'System configuration and customization',
    'Data migration from existing systems',
    `Staff training (${requiredTraining})`,
    'Soft launch with select patients',
    'Full deployment and go-live',
    '30-day follow-up and optimization'
  ];
  
  return {
    timeframe,
    steps,
    requiredTraining
  };
}

/**
 * Generate benefits specific to this practice
 */
function generatePersonalizedBenefits(
  _product: DentalProcedure | AestheticProcedure,
  practiceData: DeepIntelligenceResult,
  scrapedData?: ScrapedWebsiteData
): string[] {
  const benefits: string[] = [];
  
  // Website-specific benefits
  if ((scrapedData as any)?.website) {
    try {
      const domain = new URL((scrapedData as any).website).hostname;
      benefits.push(`Seamlessly integrates with ${domain}'s existing patient flow`);
    } catch {
      // Fallback if URL parsing fails
      const websiteName = (scrapedData as any).website.replace(/^https?:\/\//, '').split('/')[0];
      if (websiteName) {
        benefits.push(`Seamlessly integrates with ${websiteName}'s existing patient flow`);
      }
    }
  }
  
  // Tech stack benefits
  if (scrapedData?.techStack?.cms) {
    benefits.push(`Works perfectly with your ${scrapedData.techStack.cms} website`);
  }
  
  // Team-specific benefits
  if (scrapedData?.staff?.length) {
    benefits.push(`Reduces workload for your ${scrapedData.staff.length}-member team`);
    if (scrapedData.staff[0]) {
      benefits.push(`Gives Dr. ${scrapedData.staff[0]} more time for patient care`);
    }
  }
  
  // Location-specific benefits
  if (practiceData.practiceInfo?.address) {
    benefits.push(`Proven success with practices in ${practiceData.practiceInfo.address}`);
  }
  
  // Service-specific benefits
  if (scrapedData?.services?.length) {
    const topService = scrapedData.services[0];
    benefits.push(`Especially powerful for ${topService} procedures`);
  }
  
  // Recent content benefits
  if (scrapedData?.recentContent?.blogPosts?.length) {
    benefits.push(`Supports your content marketing efforts with automated sharing`);
  }
  
  return benefits.slice(0, 6); // Return top 6 benefits
}

/**
 * Create objection handlers based on practice characteristics
 */
function createObjectionHandlers(
  product: DentalProcedure | AestheticProcedure,
  practiceData: DeepIntelligenceResult,
  scrapedData?: ScrapedWebsiteData
): ProductIntelligence['objectionHandlers'] {
  const handlers: ProductIntelligence['objectionHandlers'] = [];
  
  // Price objection
  handlers.push({
    objection: "It's too expensive for our practice",
    response: `Based on your practice size of ${scrapedData?.practiceInfo?.teamSize || 5} team members, 
              you'll see ROI in under ${calculateROI(product, practiceData, scrapedData).timeToROI}. 
              Similar practices report ${calculateROI(product, practiceData, scrapedData).patientVolumeIncrease} 
              increase in patient volume.`
  });
  
  // Time objection
  handlers.push({
    objection: "We don't have time for implementation",
    response: `Implementation takes only ${createImplementationPlan(product, scrapedData?.practiceInfo?.teamSize || 5).timeframe}, 
              and we handle 90% of the setup. Your team only needs 
              ${createImplementationPlan(product, scrapedData?.practiceInfo?.teamSize || 5).requiredTraining}.`
  });
  
  // Tech complexity objection
  if (scrapedData?.techStack?.cms) {
    handlers.push({
      objection: "We're not tech-savvy enough",
      response: `You're already successfully using ${scrapedData.techStack.cms}, which shows you can handle modern technology. 
                ${product.name} is even easier to use and integrates directly with your existing system.`
    });
  } else {
    handlers.push({
      objection: "We're not tech-savvy enough",
      response: `${product.name} is designed for medical professionals, not IT experts. 
                Our support team provides hands-on training and 24/7 assistance.`
    });
  }
  
  // Competition objection
  handlers.push({
    objection: "We're already using a competitor's solution",
    response: `Many practices switch to ${product.name} because of our unique ${product.keywords?.[0] || 'features'}. 
              We offer free data migration and a 30-day satisfaction guarantee, so there's no risk in trying.`
  });
  
  // Status quo objection
  if (scrapedData?.painPoints?.length) {
    handlers.push({
      objection: "Our current system works fine",
      response: `I noticed your website ${scrapedData.painPoints[0].toLowerCase()}. 
                ${product.name} addresses this directly while preserving what's already working well for you.`
    });
  }
  
  return handlers;
}

/**
 * Generate a compelling value proposition combining product and practice intelligence
 */
export function generateValueProposition(
  productIntel: ProductIntelligence,
  _practiceData: DeepIntelligenceResult,
  scrapedData?: ScrapedWebsiteData
): string {
  const benefits = productIntel.personalizedBenefits.slice(0, 2).join(' and ');
  const roi = productIntel.roiCalculation;
  
  let proposition = `${productIntel.product.name} ${benefits}, `;
  
  if ((scrapedData as any)?.website) {
    try {
      const hostname = new URL((scrapedData as any).website).hostname;
      proposition += `perfectly complementing ${hostname}'s digital presence. `;
    } catch {
      // Fallback if URL parsing fails
      const websiteName = (scrapedData as any).website.replace(/^https?:\/\//, '').split('/')[0];
      if (websiteName) {
        proposition += `perfectly complementing ${websiteName}'s digital presence. `;
      }
    }
  }
  
  proposition += `With an expected ${roi.patientVolumeIncrease} increase in patient volume, `;
  proposition += `you'll see ROI in ${roi.timeToROI}. `;
  
  if (productIntel.matchScore > 80) {
    proposition += `This is an exceptional fit for your practice (${productIntel.matchScore}% match score).`;
  } else if (productIntel.matchScore > 60) {
    proposition += `This solution aligns well with your practice needs.`;
  }
  
  return proposition;
}