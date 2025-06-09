/**
 * AI-Powered Content Generation
 * Uses Claude and GPT-4 for personalized outreach content
 */

import { callPerplexityAPI } from './apiEndpoints';
import type { ResearchData } from './webResearch';
import type { DentalProcedure, AestheticProcedure } from './procedureDatabase';

export interface GeneratedContent {
  email: {
    subject: string;
    body: string;
    preheader?: string;
  };
  sms: {
    message: string;
    followUp?: string;
  };
  linkedin?: {
    connectionRequest: string;
    message: string;
  };
}

/**
 * Generate personalized email using AI
 */
export async function generatePersonalizedEmail(
  doctorName: string,
  productName: string,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  procedure?: DentalProcedure | AestheticProcedure
): Promise<{ subject: string; body: string; preheader?: string }> {
  const insights = researchData.enhancedInsights;
  const website = researchData.sources.find(s => s.type === 'practice')?.url;
  
  // Build context-rich prompt
  const prompt = `Generate a highly personalized sales email for Dr. ${doctorName} about ${productName}.

CONTEXT:
- Doctor: ${doctorName}
- Specialty: ${insights?.specialty || procedure?.specialty || 'Healthcare Professional'}
- Practice: ${insights?.practiceName || 'Practice'}
- Location: ${researchData.location || ''}
- Website: ${website || 'Not found'}
- Product: ${productName}
- Product Category: ${procedure?.category || 'Healthcare Solution'}
- Sales Rep: ${salesRepName} from ${companyName}

KEY INSIGHTS:
${insights?.keyInsights ? insights.keyInsights.join('\n') : '- Modern practice seeking innovative solutions'}
${insights?.painPoints ? `\nPAIN POINTS:\n${insights.painPoints.join('\n')}` : ''}
${insights?.buyingSignals ? `\nBUYING SIGNALS:\n${insights.buyingSignals.join('\n')}` : ''}

WEBSITE ANALYSIS:
${website ? `- Found official practice website
- Technology level: ${insights?.technologyStack?.level || 'Unknown'}
- Current solutions: ${insights?.technologyStack?.current?.join(', ') || 'Unknown'}` : '- No website found, likely traditional practice'}

REQUIREMENTS:
1. Subject line: Compelling, personalized, mentions specific benefit
2. Opening: Reference something specific about their practice (from website or location)
3. Body: Connect product benefits to their specific needs/pain points
4. Social proof: Mention similar practices in their area (if available)
5. CTA: Soft ask for 15-minute conversation
6. Tone: Professional but conversational, not salesy
7. Length: 150-200 words max
8. Preheader: 40-50 characters that complements subject

FORMAT:
Subject: [Your subject line]
Preheader: [Your preheader text]
Body: [Your email body]`;

  try {
    const response = await callPerplexityAPI(prompt, 'gpt-4');
    
    // Parse the response
    const lines = response.split('\n');
    let subject = '';
    let preheader = '';
    let body = '';
    let currentSection = '';
    
    for (const line of lines) {
      if (line.startsWith('Subject:')) {
        subject = line.replace('Subject:', '').trim();
        currentSection = 'subject';
      } else if (line.startsWith('Preheader:')) {
        preheader = line.replace('Preheader:', '').trim();
        currentSection = 'preheader';
      } else if (line.startsWith('Body:')) {
        body = line.replace('Body:', '').trim();
        currentSection = 'body';
      } else if (currentSection === 'body' && line.trim()) {
        body += '\n' + line;
      }
    }
    
    // Fallback if parsing fails
    if (!subject || !body) {
      return {
        subject: `${productName} can transform your ${insights?.specialty || 'practice'}, Dr. ${doctorName}`,
        body: response || generateFallbackEmail(doctorName, productName, insights),
        preheader: preheader || `Proven results in ${researchData.location}`
      };
    }
    
    return { subject, body: body.trim(), preheader };
  } catch (error) {
    console.error('AI email generation failed:', error);
    return {
      subject: `${productName} can transform your ${insights?.specialty || 'practice'}, Dr. ${doctorName}`,
      body: generateFallbackEmail(doctorName, productName, insights),
      preheader: `Proven results in ${researchData.location}`
    };
  }
}

/**
 * Generate personalized SMS using AI
 */
export async function generatePersonalizedSMS(
  doctorName: string,
  productName: string,
  researchData: ResearchData,
  salesRepName: string
): Promise<{ message: string; followUp?: string }> {
  const insights = researchData.enhancedInsights;
  
  const prompt = `Generate a personalized SMS message for Dr. ${doctorName} about ${productName}.

CONTEXT:
- Doctor: ${doctorName}
- Specialty: ${insights?.specialty || 'Healthcare'}
- Key insight: ${insights?.keyInsights?.[0] || 'Modern practice'}
- Product benefit: ${productName} helps with efficiency

REQUIREMENTS:
1. Maximum 160 characters
2. Personalized opening
3. One specific benefit
4. Soft CTA
5. Professional but friendly
6. Include rep name

Also generate a follow-up SMS (160 chars max) for 3 days later.`;

  try {
    const response = await callPerplexityAPI(prompt, 'claude-3-sonnet');
    
    // Simple parsing
    const messages = response.split('\n').filter(line => line.trim());
    return {
      message: messages[0] || generateFallbackSMS(doctorName, productName, salesRepName),
      followUp: messages[1]
    };
  } catch (error) {
    console.error('AI SMS generation failed:', error);
    return {
      message: generateFallbackSMS(doctorName, productName, salesRepName),
      followUp: `Hi Dr. ${doctorName}, following up on ${productName}. Any questions I can answer? -${salesRepName}`
    };
  }
}

/**
 * Fallback email template
 */
function generateFallbackEmail(
  doctorName: string,
  productName: string,
  insights: any
): string {
  return `Dear Dr. ${doctorName},

I noticed your ${insights?.specialty || 'practice'} in ${insights?.location || 'your area'} and wanted to share how ${productName} is helping similar practices ${insights?.painPoints?.[0] ? `address ${insights.painPoints[0]}` : 'improve patient outcomes and efficiency'}.

${insights?.technologyStack?.current?.[0] 
  ? `Since you're already using ${insights.technologyStack.current[0]}, ${productName} integrates seamlessly to enhance your existing workflow.`
  : `${productName} offers a modern solution that's easy to implement and delivers immediate ROI.`}

Would you be open to a brief 15-minute call to explore if this could benefit your practice?

Best regards,`;
}

/**
 * Fallback SMS template
 */
function generateFallbackSMS(
  doctorName: string,
  productName: string,
  salesRepName: string
): string {
  return `Hi Dr. ${doctorName}, ${productName} is helping practices like yours save 5+ hrs/week. Worth a quick chat? -${salesRepName}`;
}

/**
 * Generate complete multi-channel campaign
 */
export async function generateMultiChannelCampaign(
  doctorName: string,
  productName: string,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  procedure?: DentalProcedure | AestheticProcedure
): Promise<GeneratedContent> {
  // Generate all content in parallel
  const [email, sms] = await Promise.all([
    generatePersonalizedEmail(doctorName, productName, researchData, salesRepName, companyName, procedure),
    generatePersonalizedSMS(doctorName, productName, researchData, salesRepName)
  ]);
  
  // LinkedIn is optional - only for certain products/doctors
  let linkedin;
  if (researchData.sources.some(s => s.url.includes('linkedin'))) {
    linkedin = {
      connectionRequest: `Hi Dr. ${doctorName}, I help ${researchData.enhancedInsights?.specialty || 'healthcare'} professionals discover innovative solutions. Would love to connect!`,
      message: `Thanks for connecting! I wanted to share how ${productName} is transforming practices like yours. Open to a brief chat this week?`
    };
  }
  
  return {
    email,
    sms,
    linkedin
  };
}