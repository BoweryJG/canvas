/**
 * Enhanced Email Templates with Product Intelligence
 * Creates highly personalized emails using both doctor and product research
 */

import type { EnhancedScanResult } from './enhancedAI';
import type { ResearchData } from './webResearch';
import type { EmailCampaign } from './magicLinks';

interface SalesRepInfo {
  name: string;
  company: string;
  product: string;
}

interface EmailContext {
  scanResult: EnhancedScanResult;
  researchData?: ResearchData;
  salesRep: SalesRepInfo;
  type: 'initial' | 'follow_up' | 'closing';
}

/**
 * Generate product-aware email campaigns
 */
export function generateEnhancedEmailCampaign(
  context: EmailContext
): EmailCampaign {
  const { scanResult, researchData, salesRep, type } = context;
  
  // Extract intelligence
  const doctorIntel = researchData?.enhancedInsights || {};
  const productIntel = researchData?.productIntelligence || {};
  const combinedStrategy = researchData?.combinedStrategy || {};
  
  // Generate appropriate email based on type
  switch (type) {
    case 'initial':
      return generateInitialOutreach(scanResult, doctorIntel, productIntel, combinedStrategy, salesRep);
    case 'follow_up':
      return generateFollowUp(scanResult, doctorIntel, productIntel, combinedStrategy, salesRep);
    case 'closing':
      return generateClosing(scanResult, doctorIntel, productIntel, combinedStrategy, salesRep);
    default:
      return generateInitialOutreach(scanResult, doctorIntel, productIntel, combinedStrategy, salesRep);
  }
}

/**
 * Initial outreach with product market context
 */
function generateInitialOutreach(
  scanResult: EnhancedScanResult,
  doctorIntel: any,
  productIntel: any,
  combinedStrategy: any,
  salesRep: SalesRepInfo
): EmailCampaign {
  const practiceInsight = doctorIntel.practiceProfile?.notableFeatures?.[0] || 
    `your ${scanResult.specialty} practice`;
  
  const localProof = productIntel.localInsights?.socialProof?.[0] || 
    `practices in ${scanResult.location}`;
  
  const competitiveDiff = productIntel.competitiveLandscape?.differentiators?.[0] || 
    'enhanced patient outcomes';
  
  const marketPosition = doctorIntel.competitivePosition?.marketRank || 
    'leading practices in your area';
  
  const body = `Hi Dr. ${scanResult.doctor.split(' ').pop()},

I noticed ${practiceInsight} and your position as ${marketPosition}. ${doctorIntel.executiveSummary || ''}

${localProof ? `${localProof}` : `Leading ${scanResult.specialty} practices`} are seeing remarkable results with ${salesRep.product}, particularly for ${competitiveDiff}.

${productIntel.marketData?.awareness > 70 ? 
  `With ${salesRep.product} becoming the standard in ${scanResult.location}, ` :
  `As an early adopter opportunity in ${scanResult.location}, `}${combinedStrategy.messagingStrategy?.primaryHook || `this could help ${practiceInsight}.`}

${doctorIntel.buyingSignals?.[0] ? 
  `Given ${doctorIntel.buyingSignals[0]}, ` :
  'Based on your practice profile, '}the ROI typically ranges from ${productIntel.marketData?.roi?.low || '2'}x to ${productIntel.marketData?.roi?.high || '5'}x within ${productIntel.marketData?.roi?.timeframe || '18 months'}.

Worth a quick 15-minute call to explore how ${salesRep.product} could specifically benefit your practice?

Best regards,
${salesRep.name}
${salesRep.company}

P.S. ${combinedStrategy.messagingStrategy?.urgencyTrigger || `I have insights on how similar practices are using ${salesRep.product} that I'd love to share.`}`;

  return {
    id: `email-${Date.now()}`,
    to: scanResult.email || '',
    subject: generateSubjectLine(scanResult, doctorIntel, productIntel, 'initial'),
    body,
    replyTo: salesRep.email
  };
}

/**
 * Follow-up email with deeper insights
 */
function generateFollowUp(
  scanResult: EnhancedScanResult,
  doctorIntel: any,
  productIntel: any,
  combinedStrategy: any,
  salesRep: SalesRepInfo
): EmailCampaign {
  const painPoint = doctorIntel.painPoints?.[0] || 
    `challenges that ${scanResult.specialty} practices face`;
  
  const objection = Object.keys(doctorIntel.salesStrategy?.objectionHandlers || {})[0];
  const objectionResponse = objection ? 
    doctorIntel.salesStrategy.objectionHandlers[objection] : '';
  
  const caseStudy = productIntel.localInsights?.caseStudies?.[0] || 
    `A practice similar to yours`;
  
  const body = `Dr. ${scanResult.doctor.split(' ').pop()},

Following up on my previous email about ${salesRep.product}.

I understand ${painPoint}. ${caseStudy} ${productIntel.marketData?.typicalResults || 'saw significant improvements after implementation'}.

${objection && objectionResponse ? 
  `If you're concerned about ${objection}, ${objectionResponse}` :
  `Common concerns about ${salesRep.product} include implementation time and training, but our process typically takes just ${productIntel.implementationData?.timeframe || '2-3 weeks'} with minimal disruption.`}

${productIntel.competitiveLandscape?.vsCompetitors ? 
  `Unlike ${productIntel.competitiveLandscape.topCompetitors?.[0] || 'other solutions'}, ${salesRep.product} offers ${productIntel.competitiveLandscape.differentiators?.join(' and ') || 'unique advantages'}.` :
  `What sets ${salesRep.product} apart is the combination of technology and support we provide.`}

I have a ${combinedStrategy.messagingStrategy?.valueProps?.[0] || 'detailed ROI analysis'} specific to practices like yours. Could we schedule a brief call this week?

${doctorIntel.salesStrategy?.timing ? 
  `I'm available ${doctorIntel.salesStrategy.timing}.` :
  'I have openings Tuesday or Thursday afternoon.'}

Best regards,
${salesRep.name}

P.S. ${productIntel.marketData?.limitedTimeOffers?.[0] || `I can also share exclusive insights from ${productIntel.marketData?.recentAdopters || 'recent implementations'} in your area.`}`;

  return {
    id: `email-${Date.now()}`,
    to: scanResult.email || '',
    subject: generateSubjectLine(scanResult, doctorIntel, productIntel, 'follow_up'),
    body,
    replyTo: salesRep.email
  };
}

/**
 * Closing email with urgency
 */
function generateClosing(
  scanResult: EnhancedScanResult,
  doctorIntel: any,
  productIntel: any,
  combinedStrategy: any,
  salesRep: SalesRepInfo
): EmailCampaign {
  const competitorThreat = productIntel.competitiveLandscape?.marketShare > 30 ?
    `With ${productIntel.competitiveLandscape.topCompetitors?.[0] || 'competitors'} rapidly expanding in ${scanResult.location}, ` :
    '';
  
  const urgency = combinedStrategy.messagingStrategy?.urgencyTrigger || 
    productIntel.marketData?.limitedTimeOffers?.[0] ||
    'current incentives ending soon';
  
  const body = `Dr. ${scanResult.doctor.split(' ').pop()},

I wanted to reach out one final time about ${salesRep.product}.

${competitorThreat}${doctorIntel.competitivePosition?.vulnerabilities?.[0] ? 
  `addressing ${doctorIntel.competitivePosition.vulnerabilities[0]} could be crucial for maintaining your market position.` :
  'staying ahead of market changes is more important than ever.'}

We're currently offering ${urgency}, which could mean ${productIntel.marketData?.pricingRange ? 
  `savings of $${(productIntel.marketData.pricingRange.high - productIntel.marketData.pricingRange.low) * 0.2}` :
  'significant cost advantages'} for your practice.

${doctorIntel.budgetIndicators?.purchaseTimeframe ? 
  `Since you're likely planning for ${doctorIntel.budgetIndicators.purchaseTimeframe}, ` :
  'If you\'re evaluating solutions for next quarter, '}this timing could be ideal.

Would you prefer:
A) 15-minute executive briefing on ROI
B) Detailed proposal with practice-specific projections
C) Direct introduction to ${productIntel.localInsights?.referenceCustomers?.[0] || 'a reference practice'}

Just reply with A, B, or C, and I'll arrange everything.

Best regards,
${salesRep.name}

P.S. ${combinedStrategy.closingStrategy?.finalHook || `After this, I won't reach out again, but I'd hate for you to miss this opportunity to ${productIntel.marketData?.primaryBenefit || 'transform your practice'}.`}`;

  return {
    id: `email-${Date.now()}`,
    to: scanResult.email || '',
    subject: generateSubjectLine(scanResult, doctorIntel, productIntel, 'closing'),
    body,
    replyTo: salesRep.email
  };
}

/**
 * Generate intelligent subject lines
 */
function generateSubjectLine(
  scanResult: EnhancedScanResult,
  doctorIntel: any,
  productIntel: any,
  type: 'initial' | 'follow_up' | 'closing'
): string {
  const subjectStrategies = {
    initial: [
      () => `${productIntel.localInsights?.topAdopter || scanResult.location} practices seeing ${productIntel.marketData?.primaryBenefit || 'results'} with ${scanResult.product}`,
      () => `Quick question about ${doctorIntel.practiceProfile?.notableFeatures?.[0] || 'your practice'}`,
      () => `${scanResult.doctor.split(' ')[0]}, ${productIntel.marketData?.typicalResults || 'ROI insights'} for ${scanResult.specialty}`,
      () => `${doctorIntel.competitivePosition?.marketRank || 'Your practice'} + ${scanResult.product} opportunity`
    ],
    follow_up: [
      () => `Re: ${scanResult.product} ROI for ${scanResult.doctor}`,
      () => `${productIntel.localInsights?.caseStudies?.[0]?.split(' ')[0] || 'Practice'} case study you might like`,
      () => `Addressing ${doctorIntel.painPoints?.[0] || 'your concern'} with ${scanResult.product}`,
      () => `Quick update: ${productIntel.marketData?.limitedTimeOffers?.[0] || 'New development'}`
    ],
    closing: [
      () => `Final: ${productIntel.marketData?.limitedTimeOffers?.[0] || 'Opportunity'} for ${scanResult.doctor}`,
      () => `${scanResult.doctor.split(' ')[0]}, quick A/B/C question`,
      () => `Closing thoughts on ${scanResult.product} for your practice`,
      () => `Last check: ${urgencyScore(productIntel) > 70 ? 'Time-sensitive' : 'Important'} ${scanResult.product} update`
    ]
  };
  
  const strategies = subjectStrategies[type];
  const selectedStrategy = strategies[Math.floor(Math.random() * strategies.length)];
  
  return selectedStrategy();
}

/**
 * Calculate urgency score
 */
function urgencyScore(productIntel: any): number {
  let score = 50;
  
  if (productIntel.marketData?.limitedTimeOffers?.length > 0) score += 20;
  if (productIntel.competitiveLandscape?.marketShare > 50) score += 15;
  if (productIntel.marketData?.adoptionRate > 30) score += 15;
  
  return Math.min(score, 100);
}

/**
 * Generate SMS with product intelligence
 */
export function generateEnhancedSMS(
  scanResult: any,
  researchData?: ResearchData
): string {
  const productIntel = researchData?.productIntelligence || {};
  const doctorIntel = researchData?.enhancedInsights || {};
  const location = `${scanResult.city || ''}, ${scanResult.state || ''}`.trim();
  
  const templates = [
    () => `Dr. ${scanResult.doctor.split(' ').pop()}, ${productIntel.localInsights?.topAdopter || 'leading practices'} using ${scanResult.product} seeing ${productIntel.marketData?.primaryBenefit || 'great results'}. Worth a quick chat?`,
    () => `Hi Dr. ${scanResult.doctor.split(' ')[0]}, ${doctorIntel.buyingSignals?.[0] || `${scanResult.specialty || 'dental'} practices`} benefiting from ${scanResult.product}. 5 min call?`,
    () => `${productIntel.marketData?.typicalResults || 'ROI data'} for ${scanResult.product} in ${location || 'your area'}. Relevant for ${doctorIntel.practiceProfile?.size || 'your'} practice?`
  ];
  
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template().substring(0, 160); // Ensure SMS length limit
}

/**
 * Generate LinkedIn message with intelligence
 */
export function generateEnhancedLinkedIn(
  scanResult: any,
  researchData?: ResearchData
): string {
  const productIntel = researchData?.productIntelligence || {};
  const doctorIntel = researchData?.enhancedInsights || {};
  const salesRepName = scanResult.salesRep || 'Your Sales Rep';
  
  return `Hi Dr. ${scanResult.doctor.split(' ').pop()},

${doctorIntel.executiveSummary ? 
  `I noticed ${doctorIntel.executiveSummary.split('.')[0]}.` :
  `I've been following your work in ${scanResult.specialty || 'dentistry'}.`}

${productIntel.localInsights?.topAdopter ? 
  `${productIntel.localInsights.topAdopter} recently shared how ${scanResult.product} transformed their practice.` :
  `Leading ${scanResult.specialty || 'dental'} practices are adopting ${scanResult.product} for ${productIntel.marketData?.primaryBenefit || 'better outcomes'}.`}

Given ${doctorIntel.competitivePosition?.marketRank || 'your practice\'s position'}, I thought you might find their approach interesting.

Coffee sometime to discuss?

Best,
${salesRepName}`;
}

/**
 * Generate WhatsApp message
 */
export function generateEnhancedWhatsApp(
  scanResult: any,
  researchData?: ResearchData
): string {
  const productIntel = researchData?.productIntelligence || {};
  const combinedStrategy = researchData?.combinedStrategy || {};
  const salesRepName = scanResult.salesRep || 'Your Sales Rep';
  
  return `Hello Dr. ${scanResult.doctor.split(' ').pop()} 👋

I help ${scanResult.specialty || 'dental'} practices implement ${scanResult.product}.

${productIntel.marketData?.typicalResults || 'Practices typically see 2-5x ROI'} within ${productIntel.marketData?.roi?.timeframe || '18 months'}.

${combinedStrategy.messagingStrategy?.primaryHook || `Interested in learning how this could work for your practice?`}

Quick voice message or call at your convenience?

- ${salesRepName}`;
}