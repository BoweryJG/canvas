/**
 * AI-Powered Content Generation
 * Uses Claude and GPT-4 for personalized outreach content
 */

import { callPerplexityResearch } from './apiEndpoints';
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
 * Generate personalized email using AI with deep website intelligence
 */
export async function generatePersonalizedEmail(
  doctorName: string,
  productName: string,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  procedure?: DentalProcedure | AestheticProcedure,
  scrapedWebsiteData?: any,
  productIntelligence?: any
): Promise<{ subject: string; body: string; preheader?: string }> {
  const insights = researchData.enhancedInsights;
  const website = researchData.sources.find(s => s.type === 'practice_website')?.url || researchData.practiceInfo?.website;
  
  // Extract specific "wow factor" details from scraped data
  const wowFactors: string[] = [];
  
  if (scrapedWebsiteData) {
    // Recent blog post reference
    if (scrapedWebsiteData.recentContent?.blogPosts?.[0]) {
      wowFactors.push(`I enjoyed your recent post about "${scrapedWebsiteData.recentContent.blogPosts[0].title}"`);
    }
    
    // Team member reference
    if (scrapedWebsiteData.staff?.[1]) { // Skip first (usually the main doctor)
      wowFactors.push(`Your team member ${scrapedWebsiteData.staff[1]} seems fantastic`);
    }
    
    // Tech stack reference
    if (scrapedWebsiteData.techStack?.cms) {
      wowFactors.push(`I noticed you're using ${scrapedWebsiteData.techStack.cms} - great choice for flexibility`);
    }
    
    // Social media reference
    if (scrapedWebsiteData.socialMedia?.instagram && scrapedWebsiteData.socialMedia?.instagramFollowers) {
      wowFactors.push(`Your Instagram engagement is impressive (${scrapedWebsiteData.socialMedia.instagramFollowers} followers!)`);
    }
    
    // Award reference
    if (scrapedWebsiteData.practiceInfo?.awards?.[0]) {
      wowFactors.push(`Congratulations on ${scrapedWebsiteData.practiceInfo.awards[0]}`);
    }
    
    // Service they're proud of
    if (scrapedWebsiteData.services?.[0]) {
      wowFactors.push(`Your ${scrapedWebsiteData.services[0]} service page really stands out`);
    }
  }
  
  // Build hyper-personalized prompt
  const prompt = `Generate a highly personalized sales email for Dr. ${doctorName} about ${productName} that will make them think "how did they know that?"

WEBSITE INTELLIGENCE:
- Website: ${website}
- CMS: ${scrapedWebsiteData?.techStack?.cms || 'Unknown'}
- Analytics: ${scrapedWebsiteData?.techStack?.analytics?.join(', ') || 'None detected'}
- Marketing Tools: ${scrapedWebsiteData?.techStack?.marketing?.join(', ') || 'None detected'}
- Team Size: ${scrapedWebsiteData?.practiceInfo?.teamSize || 'Unknown'}
- Services: ${scrapedWebsiteData?.services?.slice(0, 3).join(', ') || 'Unknown'}
- Recent Blog: ${scrapedWebsiteData?.recentContent?.blogPosts?.[0]?.title || 'No recent posts'}
- Social Media: ${Object.keys(scrapedWebsiteData?.socialMedia || {}).filter(k => scrapedWebsiteData.socialMedia[k]).join(', ') || 'None'}

PAIN POINTS DISCOVERED:
${scrapedWebsiteData?.painPoints?.join('\n') || 'None identified'}

COMPETITIVE ADVANTAGES:
${scrapedWebsiteData?.competitiveAdvantages?.join('\n') || 'None identified'}

PRODUCT INTELLIGENCE:
- Match Score: ${productIntelligence?.matchScore || 'N/A'}%
- ROI Timeline: ${productIntelligence?.roiCalculation?.timeToROI || 'N/A'}
- Integration: ${productIntelligence?.integrationOpportunities?.[0] || 'Seamless'}
- Key Benefit: ${productIntelligence?.personalizedBenefits?.[0] || 'Improved efficiency'}

WOW FACTOR REFERENCES (pick 1-2 that feel most natural):
${wowFactors.join('\n') || 'None available'}

DOCTOR INFO:
- Name: Dr. ${doctorName}
- Specialty: ${insights?.specialty || procedure?.specialty || 'Healthcare'}
- Location: ${researchData.practiceInfo?.address || 'Location'}

REQUIREMENTS:
1. Subject: Mention something SPECIFIC from their website (not generic)
2. Opening: Use ONE wow factor reference naturally
3. Body: Connect ${productName} to a SPECIFIC pain point or opportunity
4. Include: Actual ROI numbers or timeline
5. Reference: Their tech stack or current tools
6. Close: Specific time suggestion based on their practice
7. Length: 150-200 words max
8. Tone: Like you've studied their practice deeply

FORMAT:
Subject: [Specific reference from their website]
Preheader: [Complement subject, 40-50 chars]
Body: [Hyper-personalized message]`;

  try {
    const response = await callPerplexityResearch(prompt, 'search');
    
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
        preheader: preheader || `Proven results in ${researchData.practiceInfo?.address || 'your area'}`
      };
    }
    
    return { subject, body: body.trim(), preheader };
  } catch (error) {
    console.error('AI email generation failed:', error);
    return {
      subject: `${productName} can transform your ${insights?.specialty || 'practice'}, Dr. ${doctorName}`,
      body: generateFallbackEmail(doctorName, productName, insights),
      preheader: `Proven results in ${researchData.practiceInfo?.address || 'your area'}`
    };
  }
}

/**
 * Generate personalized SMS using AI with website intelligence
 */
export async function generatePersonalizedSMS(
  doctorName: string,
  productName: string,
  researchData: ResearchData,
  salesRepName: string,
  scrapedWebsiteData?: any,
  productIntelligence?: any
): Promise<{ message: string; followUp?: string }> {
  const insights = researchData.enhancedInsights;
  
  // Pick the most impactful detail for SMS
  let specificDetail = '';
  if (scrapedWebsiteData?.practiceInfo?.teamSize) {
    specificDetail = `your ${scrapedWebsiteData.practiceInfo.teamSize}-person team`;
  } else if (scrapedWebsiteData?.services?.[0]) {
    specificDetail = `your ${scrapedWebsiteData.services[0]} patients`;
  } else if (scrapedWebsiteData?.techStack?.cms) {
    specificDetail = `practices using ${scrapedWebsiteData.techStack.cms}`;
  }
  
  const prompt = `Generate a personalized SMS for Dr. ${doctorName} that shows deep knowledge of their practice.

SPECIFIC DETAILS:
- Practice website: ${researchData.sources.find(s => s.type === 'practice_website')?.url || 'Not found'}
- Team size: ${scrapedWebsiteData?.practiceInfo?.teamSize || 'Unknown'}
- Top service: ${scrapedWebsiteData?.services?.[0] || 'General'}
- CMS: ${scrapedWebsiteData?.techStack?.cms || 'Unknown'}
- ROI timeline: ${productIntelligence?.roiCalculation?.timeToROI || 'Quick'}

REQUIREMENTS:
1. Max 160 characters
2. Reference ONE specific detail about their practice
3. Include concrete benefit (time saved, ROI, etc.)
4. Natural, not salesy
5. Sign with -${salesRepName}

Also generate follow-up SMS (160 chars) that references their specific pain point: ${scrapedWebsiteData?.painPoints?.[0] || 'efficiency'}`;

  try {
    const response = await callPerplexityResearch(prompt, 'search');
    
    // Simple parsing
    const messages = response.split('\n').filter((line: string) => line.trim());
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
 * Generate complete multi-channel campaign with deep personalization
 */
export async function generateMultiChannelCampaign(
  doctorName: string,
  productName: string,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  procedure?: DentalProcedure | AestheticProcedure,
  scrapedWebsiteData?: any,
  productIntelligence?: any
): Promise<GeneratedContent> {
  // Generate all content in parallel with enhanced data
  const [email, sms] = await Promise.all([
    generatePersonalizedEmail(
      doctorName, 
      productName, 
      researchData, 
      salesRepName, 
      companyName, 
      procedure,
      scrapedWebsiteData,
      productIntelligence
    ),
    generatePersonalizedSMS(
      doctorName, 
      productName, 
      researchData, 
      salesRepName,
      scrapedWebsiteData,
      productIntelligence
    )
  ]);
  
  // LinkedIn with specific references
  let linkedin;
  if (scrapedWebsiteData?.socialMedia?.linkedin || researchData.sources.some(s => s.url.includes('linkedin'))) {
    // Create hyper-personalized LinkedIn messages
    const connectionDetail = scrapedWebsiteData?.recentContent?.blogPosts?.[0] 
      ? `Enjoyed your post on ${scrapedWebsiteData.recentContent.blogPosts[0].title}` 
      : scrapedWebsiteData?.practiceInfo?.awards?.[0]
      ? `Impressed by ${scrapedWebsiteData.practiceInfo.awards[0]}`
      : `Helping ${researchData.enhancedInsights?.specialty || 'healthcare'} leaders like you`;
    
    const messageDetail = productIntelligence?.roiCalculation?.timeToROI
      ? `${productName} delivers ROI in ${productIntelligence.roiCalculation.timeToROI} for practices like yours`
      : scrapedWebsiteData?.painPoints?.[0]
      ? `${productName} specifically addresses ${scrapedWebsiteData.painPoints[0].toLowerCase()}`
      : `${productName} is transforming practices in ${researchData.practiceInfo?.address || 'your area'}`;
    
    linkedin = {
      connectionRequest: `Hi Dr. ${doctorName}, ${connectionDetail}. Would love to connect and share insights!`,
      message: `Thanks for connecting! ${messageDetail}. Worth a quick 15-min chat this week?`
    };
  }
  
  return {
    email,
    sms,
    linkedin
  };
}

/**
 * Generate a "wow factor" opening line based on website intelligence
 */
export function generateWowFactorOpening(
  doctorName: string,
  scrapedData: any
): string {
  const options: string[] = [];
  
  // Recent achievement
  if (scrapedData?.practiceInfo?.awards?.[0]) {
    options.push(`Dr. ${doctorName}, congratulations on ${scrapedData.practiceInfo.awards[0]} - well deserved!`);
  }
  
  // Recent content
  if (scrapedData?.recentContent?.blogPosts?.[0]) {
    options.push(`Dr. ${doctorName}, your recent post on "${scrapedData.recentContent.blogPosts[0].title}" really resonated with me.`);
  }
  
  // Team recognition
  if (scrapedData?.staff?.length > 3) {
    options.push(`Dr. ${doctorName}, your ${scrapedData.staff.length}-member team at ${new URL(scrapedData.url).hostname} is impressive.`);
  }
  
  // Tech savvy
  if (scrapedData?.techStack?.cms && scrapedData?.techStack?.analytics?.length) {
    options.push(`Dr. ${doctorName}, I see you're leveraging ${scrapedData.techStack.cms} with advanced analytics - smart approach!`);
  }
  
  // Social proof
  if (scrapedData?.socialMedia?.instagramFollowers > 1000) {
    options.push(`Dr. ${doctorName}, ${scrapedData.socialMedia.instagramFollowers} Instagram followers - you've built quite a following!`);
  }
  
  // Service excellence
  if (scrapedData?.services?.length > 5) {
    options.push(`Dr. ${doctorName}, offering ${scrapedData.services.length} specialized services shows your commitment to comprehensive care.`);
  }
  
  // Default to website reference
  if (options.length === 0 && scrapedData?.url) {
    const domain = new URL(scrapedData.url).hostname;
    options.push(`Dr. ${doctorName}, ${domain} showcases your practice beautifully.`);
  }
  
  return options[0] || `Dr. ${doctorName}, your practice stands out in the community.`;
}