/**
 * Enhanced Outreach System with Product Intelligence
 * Creates product-aware, hyper-personalized campaigns
 */

import type { EnhancedScanResult } from './enhancedAI';
import type { ResearchData } from './webResearch';
import { generateEnhancedEmailCampaign, generateEnhancedSMS, generateEnhancedLinkedIn } from './enhancedEmailTemplates';

export interface ProductAwareCampaign {
  id: string;
  doctorName: string;
  productName: string;
  sequence: CampaignStep[];
  productIntelligence: {
    marketPosition: string;
    competitiveAdvantage: string;
    localProof: string[];
    urgencyTriggers: string[];
  };
  personalization: {
    doctorPainPoints: string[];
    productFitScore: number;
    customValueProps: string[];
  };
  analytics: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
    meetings: number;
    revenue: number;
  };
  status: 'draft' | 'active' | 'paused' | 'completed';
}

export interface CampaignStep {
  id: string;
  day: number;
  time: string;
  channel: 'email' | 'sms' | 'linkedin' | 'call' | 'whatsapp';
  content: string;
  subject?: string;
  triggers: string[];
  fallback?: string;
}

/**
 * Create product-aware campaign sequence
 */
export async function createProductAwareCampaign(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepInfo: { name: string; company: string; product: string }
): Promise<ProductAwareCampaign> {
  const productIntel = researchData.productIntelligence;
  const doctorIntel = researchData.enhancedInsights;
  const combinedStrategy = researchData.combinedStrategy;
  
  const sequence: CampaignStep[] = [];
  
  // Day 1: Initial outreach with product intelligence
  const initialEmail = generateEnhancedEmailCampaign({
    scanResult,
    researchData,
    salesRep: salesRepInfo,
    type: 'initial'
  });
  
  sequence.push({
    id: 'day1-email',
    day: 1,
    time: doctorIntel?.salesStrategy?.timing || '10:00 AM',
    channel: 'email',
    subject: initialEmail.subject,
    content: initialEmail.body,
    triggers: ['campaign_start'],
    fallback: 'linkedin'
  });
  
  // Day 2: SMS if email opened but no reply
  if (productIntel?.marketData?.awareness > 70) {
    sequence.push({
      id: 'day2-sms',
      day: 2,
      time: '2:00 PM',
      channel: 'sms',
      content: generateEnhancedSMS(scanResult, researchData),
      triggers: ['email_opened', 'no_reply'],
      fallback: 'skip'
    });
  }
  
  // Day 3: LinkedIn connection
  sequence.push({
    id: 'day3-linkedin',
    day: 3,
    time: '11:00 AM',
    channel: 'linkedin',
    content: generateEnhancedLinkedIn(scanResult, researchData),
    triggers: ['no_email_response'],
    fallback: 'email'
  });
  
  // Day 7: Follow-up with case study
  const followUpEmail = generateEnhancedEmailCampaign({
    scanResult,
    researchData,
    salesRep: salesRepInfo,
    type: 'follow_up'
  });
  
  sequence.push({
    id: 'day7-followup',
    day: 7,
    time: '9:00 AM',
    channel: 'email',
    subject: followUpEmail.subject,
    content: followUpEmail.body,
    triggers: ['no_response'],
    fallback: 'sms'
  });
  
  // Day 10: Competitive intelligence share
  if (productIntel?.competitiveLandscape?.topCompetitors?.length > 0) {
    sequence.push({
      id: 'day10-competitive',
      day: 10,
      time: '3:00 PM',
      channel: 'email',
      subject: `${productIntel.competitiveLandscape.topCompetitors[0]} vs ${salesRepInfo.product} Analysis`,
      content: generateCompetitiveEmail(scanResult, researchData, salesRepInfo),
      triggers: ['engaged_no_meeting'],
      fallback: 'skip'
    });
  }
  
  // Day 14: Breakthrough with urgency
  if (combinedStrategy?.messagingStrategy?.urgencyTrigger) {
    sequence.push({
      id: 'day14-breakthrough',
      day: 14,
      time: '11:30 AM',
      channel: 'email',
      subject: combinedStrategy.messagingStrategy.urgencyTrigger,
      content: generateBreakthroughEmail(scanResult, researchData, salesRepInfo),
      triggers: ['no_response', 'high_value'],
      fallback: 'call'
    });
  }
  
  // Day 21: Final closing attempt
  const closingEmail = generateEnhancedEmailCampaign({
    scanResult,
    researchData,
    salesRep: salesRepInfo,
    type: 'closing'
  });
  
  sequence.push({
    id: 'day21-closing',
    day: 21,
    time: '10:00 AM',
    channel: 'email',
    subject: closingEmail.subject,
    content: closingEmail.body,
    triggers: ['last_attempt'],
    fallback: 'none'
  });
  
  return {
    id: `campaign-${Date.now()}`,
    doctorName: scanResult.doctor,
    productName: salesRepInfo.product,
    sequence,
    productIntelligence: {
      marketPosition: productIntel?.competitiveLandscape?.marketShare 
        ? `${productIntel.competitiveLandscape.marketShare}% market share`
        : 'Growing market presence',
      competitiveAdvantage: productIntel?.competitiveLandscape?.differentiators?.[0] || 
        'Superior technology',
      localProof: productIntel?.localInsights?.socialProof || [],
      urgencyTriggers: productIntel?.marketData?.limitedTimeOffers || []
    },
    personalization: {
      doctorPainPoints: doctorIntel?.painPoints || [],
      productFitScore: combinedStrategy?.perfectMatchScore || scanResult.score,
      customValueProps: combinedStrategy?.messagingStrategy?.valueProps || []
    },
    analytics: {
      sent: 0,
      opened: 0,
      clicked: 0,
      replied: 0,
      meetings: 0,
      revenue: 0
    },
    status: 'draft'
  };
}

/**
 * Generate competitive comparison email
 */
function generateCompetitiveEmail(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRep: { name: string; company: string; product: string }
): string {
  const productIntel = researchData.productIntelligence;
  const competitor = productIntel?.competitiveLandscape?.topCompetitors?.[0] || 'alternatives';
  
  return `Dr. ${scanResult.doctor.split(' ').pop()},

I noticed many ${scanResult.specialty || 'dental'} practices evaluating ${competitor} vs ${salesRep.product}.

Key differences that matter for practices like yours:

${productIntel?.competitiveLandscape?.differentiators?.map(d => `• ${salesRep.product}: ${d}`).join('\n') || 
`• ${salesRep.product}: Enhanced efficiency and ROI`}

${productIntel?.competitiveLandscape?.vsCompetitors || 
`Unlike ${competitor}, ${salesRep.product} offers seamless integration and proven results.`}

Worth a quick comparison call? I have a side-by-side analysis ready.

Best,
${salesRep.name}`;
}

/**
 * Generate breakthrough email with urgency
 */
function generateBreakthroughEmail(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRep: { name: string; company: string; product: string }
): string {
  const doctorIntel = researchData.enhancedInsights;
  const productIntel = researchData.productIntelligence;
  const urgency = researchData.combinedStrategy?.messagingStrategy?.urgencyTrigger;
  
  return `Dr. ${scanResult.doctor.split(' ').pop()},

${urgency || `Important update about ${salesRep.product} availability in your area.`}

${productIntel?.localInsights?.topAdopters?.[0] 
  ? `${productIntel.localInsights.topAdopters[0]} just secured one of the remaining slots.`
  : `Leading practices in ${scanResult.location || 'your area'} are moving quickly.`}

${doctorIntel?.competitivePosition?.vulnerabilities?.[0]
  ? `This directly addresses your ${doctorIntel.competitivePosition.vulnerabilities[0]}.`
  : `This could be the competitive edge you've been looking for.`}

I have just 15 minutes needed to share:
• Exclusive pricing valid only this month
• Implementation timeline for your practice
• Reference call with similar practice

Reply with "YES" for immediate scheduling.

${salesRep.name}
P.S. ${productIntel?.marketData?.limitedTimeOffers?.[0] || 'This opportunity won't last long.'}`;
}

/**
 * Optimize campaign based on engagement
 */
export function optimizeCampaign(
  campaign: ProductAwareCampaign,
  engagementData: {
    emailOpens: number;
    linkClicks: number;
    replies: number;
    bestDayTime: { day: string; time: string };
  }
): ProductAwareCampaign {
  // Adjust timing based on engagement
  if (engagementData.bestDayTime) {
    campaign.sequence = campaign.sequence.map(step => ({
      ...step,
      time: engagementData.bestDayTime.time
    }));
  }
  
  // Add more touchpoints if high engagement but no conversion
  if (engagementData.emailOpens > 3 && engagementData.replies === 0) {
    campaign.sequence.push({
      id: 'additional-value',
      day: campaign.sequence[campaign.sequence.length - 1].day + 3,
      time: '2:00 PM',
      channel: 'email',
      subject: 'Quick question about your evaluation process',
      content: 'Personalized based on engagement patterns...',
      triggers: ['high_engagement_no_conversion'],
      fallback: 'none'
    });
  }
  
  return campaign;
}

/**
 * Export campaign to CRM format
 */
export function exportCampaignToCRM(campaign: ProductAwareCampaign): any {
  return {
    name: `${campaign.productName} - ${campaign.doctorName}`,
    contacts: [{
      name: campaign.doctorName,
      customFields: {
        product_fit_score: campaign.personalization.productFitScore,
        pain_points: campaign.personalization.doctorPainPoints.join(', '),
        competitive_advantage: campaign.productIntelligence.competitiveAdvantage
      }
    }],
    sequences: campaign.sequence.map(step => ({
      delay_days: step.day,
      step_type: step.channel,
      subject: step.subject,
      body: step.content,
      send_time: step.time
    })),
    tags: [
      campaign.productName,
      `score_${Math.floor(campaign.personalization.productFitScore / 10) * 10}`,
      campaign.status
    ]
  };
}