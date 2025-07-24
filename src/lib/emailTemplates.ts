import { type EmailCampaign } from './magicLinks';
import type { ResearchData } from './webResearch';
import { generateEnhancedEmailCampaign } from './enhancedEmailTemplates';

interface ScanResult {
  doctor: string;
  product: string;
  score: number;
  doctorProfile: string;
  productIntel: string;
  salesBrief: string;
  insights: string[];
  email?: string;
  specialty?: string;
  location?: string;
  salesRep?: string;
}

export const generateEmailFromScanResult = (
  scanResult: ScanResult,
  salesRepInfo: { name: string; company: string; product: string },
  emailType: 'initial' | 'follow_up' | 'closing' = 'initial',
  researchData?: ResearchData
): EmailCampaign => {
  // Use enhanced templates if research data is available
  if (researchData?.productIntelligence || researchData?.enhancedInsights) {
    return generateEnhancedEmailCampaign({
      scanResult: scanResult,
      researchData,
      salesRep: salesRepInfo,
      type: emailType
    });
  }
  
  // Fallback to basic templates
  const id = `canvas-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  switch (emailType) {
    case 'initial':
      return generateInitialEmail(id, scanResult, salesRepInfo);
    case 'follow_up':
      return generateFollowUpEmail(id, scanResult, salesRepInfo);
    case 'closing':
      return generateClosingEmail(id, scanResult, salesRepInfo);
    default:
      return generateInitialEmail(id, scanResult, salesRepInfo);
  }
};

const generateInitialEmail = (
  id: string,
  scanResult: ScanResult,
  salesRepInfo: { name: string; company: string; product: string }
): EmailCampaign => {
  // Extract key insights for personalization
  const practiceInfo = scanResult.insights.find(i => i.includes('Practice size')) || '';
  const techAdoption = scanResult.insights.find(i => i.includes('Technology adoption')) || '';
  const keyBuyingSignal = scanResult.insights.find(i => i.includes('💡')) || '';
  
  const subject = `${scanResult.product} - Tailored Solution for ${scanResult.doctor.split(' ')[0]}'s Practice`;
  
  const body = `Dear Dr. ${scanResult.doctor.split(' ').pop()},

I hope this email finds you well. My name is ${salesRepInfo.name} from ${salesRepInfo.company}, and I've been researching practices like yours that are making significant impacts in patient care.

${practiceInfo ? `I noticed your ${practiceInfo.toLowerCase().replace(/[^\w\s]/gi, '')}. ` : ''}${techAdoption ? `Your practice's ${techAdoption.toLowerCase().replace(/[^\w\s]/gi, '')} particularly caught my attention, as it shows you're committed to delivering the best possible care to your patients.` : ''}

${keyBuyingSignal ? keyBuyingSignal.replace('💡', 'Based on my research,') : `I believe ${salesRepInfo.product} could be a valuable addition to your practice.`}

${scanResult.salesBrief.split('.')[0]}.

I'd love to schedule a brief 15-minute call to discuss how ${salesRepInfo.product} has helped similar practices:
• Increase efficiency by 30-40%
• Improve patient satisfaction scores
• Generate additional revenue streams

Would you be available for a quick conversation next Tuesday or Wednesday afternoon?

Best regards,
${salesRepInfo.name}
${salesRepInfo.company}

P.S. I've prepared a customized analysis showing exactly how ${salesRepInfo.product} could benefit your specific practice. I'd be happy to share this during our call.`;

  return {
    id,
    to: '', // Will be filled by user
    subject,
    body
  };
};

const generateFollowUpEmail = (
  id: string,
  scanResult: ScanResult,
  salesRepInfo: { name: string; company: string; product: string }
): EmailCampaign => {
  const subject = `Quick follow-up: ${scanResult.product} ROI analysis for your practice`;
  
  const body = `Dr. ${scanResult.doctor.split(' ').pop()},

I wanted to follow up on my previous email about ${salesRepInfo.product}.

I've been working with several practices in your area, and the results have been remarkable:
• Dr. Smith saw a 45% reduction in administrative time
• Dr. Johnson increased patient throughput by 35%
• Multiple practices reported ROI within 60 days

Given your practice's ${scanResult.score}% alignment score with our most successful implementations, I'm confident we could achieve similar or better results.

I've blocked out some time this week specifically for consultations. Would a 10-minute call on Thursday work for you?

Looking forward to connecting,
${salesRepInfo.name}

P.S. I can also share a case study from a practice very similar to yours during our call.`;

  return {
    id,
    to: '',
    subject,
    body
  };
};

const generateClosingEmail = (
  id: string,
  scanResult: ScanResult,
  salesRepInfo: { name: string; company: string; product: string }
): EmailCampaign => {
  const subject = `Final opportunity: Special pricing for ${scanResult.doctor.split(' ')[0]}'s practice`;
  
  const body = `Dr. ${scanResult.doctor.split(' ').pop()},

I hope I haven't been too persistent in reaching out. I'm genuinely excited about the potential impact ${salesRepInfo.product} could have on your practice.

This is my final email, but I wanted to share one last opportunity:

We're offering a limited-time incentive for practices like yours:
• 20% discount on implementation
• Free training for your entire staff
• 90-day money-back guarantee
• Priority support for the first year

This offer expires at the end of this week.

${scanResult.salesBrief.split('.').slice(-1)[0].trim()}.

If you're interested, I can send over a brief proposal that outlines everything. No call necessary - just reply with "SEND PROPOSAL" and I'll get it to you right away.

All the best,
${salesRepInfo.name}

P.S. Even if the timing isn't right, I'd be happy to keep you updated on industry trends and best practices. Just let me know.`;

  return {
    id,
    to: '',
    subject,
    body
  };
};

// Utility function to shorten email if needed
export const optimizeEmailLength = (campaign: EmailCampaign): EmailCampaign => {
  // Check total length
  const totalLength = campaign.subject.length + campaign.body.length + (campaign.to?.length || 0);
  
  if (totalLength > 1800) { // Leave room for URL encoding
    // Shorten body while keeping key points
    const lines = campaign.body.split('\n');
    const shortened = lines.slice(0, Math.floor(lines.length * 0.7)).join('\n') + '\n\n[Email shortened for compatibility]';
    
    return {
      ...campaign,
      body: shortened
    };
  }
  
  return campaign;
};