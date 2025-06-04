/**
 * Canvas Outreach System - Comprehensive Email, SMS, and Communication Platform
 * Integrates with multiple providers for real outreach capabilities
 */

import { type EnhancedScanResult } from './enhancedAI';
import { type ResearchData } from './webResearch';

export interface OutreachTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'call_script' | 'linkedin';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
  content: string;
  variables: string[];
  industry: string[];
  effectiveness: number; // 0-100
}

export interface OutreachCampaign {
  id: string;
  doctorName: string;
  productName: string;
  templates: OutreachTemplate[];
  sequence: CampaignStep[];
  analytics: CampaignAnalytics;
  status: 'draft' | 'active' | 'paused' | 'completed';
}

export interface CampaignStep {
  id: string;
  day: number;
  time: string;
  type: 'email' | 'sms' | 'call' | 'linkedin';
  templateId: string;
  conditions?: string[];
}

export interface CampaignAnalytics {
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  meetings: number;
  revenue: number;
}

export interface PersonalizedOutreach {
  subject: string;
  content: string;
  personalizations: string[];
  researchInsights: string[];
  urgencyScore: number;
  expectedResponse: string;
}

/**
 * Generate personalized outreach using Claude 4 and research data
 */
export async function generatePersonalizedOutreach(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  templateType: 'first_contact' | 'follow_up' | 'break_through' | 'closing',
  channel: 'email' | 'sms' | 'linkedin'
): Promise<PersonalizedOutreach> {
  
  const { callClaudeOutreach } = await import('./apiEndpoints');
  
  const researchContext = buildResearchContext(researchData);
  const scanContext = buildScanContext(scanResult);
  
  const prompt = `Generate a highly personalized ${channel} ${templateType} for medical device sales using this intelligence:

SCAN INTELLIGENCE:
${scanContext}

RESEARCH INTELLIGENCE:
${researchContext}

REQUIREMENTS:
- Use specific practice details from research (technology, staff size, specialties)
- Reference verified facts, not assumptions
- Match urgency to scan score (${scanResult.score}% alignment)
- Include subtle competitive intelligence
- Focus on ROI and practice efficiency
- Use professional medical sales tone
- Length: ${channel === 'sms' ? '160 chars max' : channel === 'email' ? '200-300 words' : '150-200 words'}

OUTPUT FORMAT:
{
  "subject": "${channel === 'email' ? 'email subject line' : 'N/A'}",
  "content": "personalized message content",
  "personalizations": ["specific research detail 1", "detail 2", "detail 3"],
  "researchInsights": ["insight that drives urgency", "competitive angle", "roi focus"],
  "urgencyScore": number 1-10,
  "expectedResponse": "predicted response based on practice profile"
}`;

  try {
    const response = await callClaudeOutreach(prompt);
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      subject: result.subject || `${scanResult.product} Opportunity for ${scanResult.doctor}`,
      content: result.content || generateFallbackContent(scanResult, channel),
      personalizations: result.personalizations || [],
      researchInsights: result.researchInsights || [],
      urgencyScore: result.urgencyScore || 5,
      expectedResponse: result.expectedResponse || 'Professional acknowledgment'
    };
    
  } catch (error) {
    console.error('Outreach generation failed:', error);
    return generateFallbackOutreach(scanResult, templateType, channel);
  }
}

/**
 * Create multi-touch campaign sequence
 */
export async function createCampaignSequence(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  _campaignType: 'aggressive' | 'professional' | 'consultative'
): Promise<OutreachCampaign> {
  
  const templates: OutreachTemplate[] = [];
  const sequence: CampaignStep[] = [];
  
  // Generate campaign based on scan score and research quality
  const intensity = scanResult.score > 80 ? 'high' : scanResult.score > 60 ? 'medium' : 'low';
  
  // Day 1: Initial outreach
  const initialEmail = await generatePersonalizedOutreach(scanResult, researchData, 'first_contact', 'email');
  templates.push({
    id: 'initial-email',
    name: 'Research-Based Introduction',
    type: 'email',
    urgency: intensity as any,
    subject: initialEmail.subject,
    content: initialEmail.content,
    variables: ['doctorName', 'practiceName', 'technology', 'specialties'],
    industry: ['medical_devices', 'pharmaceuticals'],
    effectiveness: 85
  });
  
  sequence.push({
    id: 'step-1',
    day: 1,
    time: '09:00',
    type: 'email',
    templateId: 'initial-email'
  });
  
  // Day 3: LinkedIn connection (if no email response)
  const linkedinMessage = await generatePersonalizedOutreach(scanResult, researchData, 'first_contact', 'linkedin');
  templates.push({
    id: 'linkedin-connect',
    name: 'Professional Network Outreach',
    type: 'linkedin',
    urgency: 'medium',
    content: linkedinMessage.content,
    variables: ['doctorName', 'practiceType', 'mutualConnections'],
    industry: ['healthcare'],
    effectiveness: 72
  });
  
  sequence.push({
    id: 'step-2',
    day: 3,
    time: '14:00',
    type: 'linkedin',
    templateId: 'linkedin-connect',
    conditions: ['no_email_response']
  });
  
  // Day 7: Value-focused follow-up
  const followupEmail = await generatePersonalizedOutreach(scanResult, researchData, 'follow_up', 'email');
  templates.push({
    id: 'value-followup',
    name: 'ROI-Focused Follow-up',
    type: 'email',
    urgency: intensity as any,
    subject: followupEmail.subject,
    content: followupEmail.content,
    variables: ['roi_data', 'case_studies', 'implementation_timeline'],
    industry: ['medical_devices'],
    effectiveness: 78
  });
  
  sequence.push({
    id: 'step-3',
    day: 7,
    time: '10:30',
    type: 'email',
    templateId: 'value-followup',
    conditions: ['no_response']
  });
  
  // Day 14: Breakthrough attempt
  if (intensity === 'high') {
    const breakthroughSMS = await generatePersonalizedOutreach(scanResult, researchData, 'break_through', 'sms');
    templates.push({
      id: 'breakthrough-sms',
      name: 'High-Value SMS Breakthrough',
      type: 'sms',
      urgency: 'urgent',
      content: breakthroughSMS.content,
      variables: ['doctorName', 'urgent_opportunity'],
      industry: ['medical_devices'],
      effectiveness: 65
    });
    
    sequence.push({
      id: 'step-4',
      day: 14,
      time: '11:00',
      type: 'sms',
      templateId: 'breakthrough-sms',
      conditions: ['no_response', 'high_value_prospect']
    });
  }
  
  return {
    id: `campaign-${Date.now()}`,
    doctorName: scanResult.doctor,
    productName: scanResult.product,
    templates,
    sequence,
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
 * Send email using multiple provider options
 */
export async function sendEmail(
  to: string,
  subject: string,
  content: string,
  attachments?: File[]
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  try {
    // Primary: SendGrid integration
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        content,
        provider: 'sendgrid',
        attachments: attachments?.map(f => ({
          name: f.name,
          content: f,
          type: f.type
        }))
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true, messageId: result.messageId };
    } else {
      throw new Error(result.error);
    }
    
  } catch (error) {
    console.error('Email sending failed:', error);
    
    // Fallback: EmailJS client-side
    try {
      const fallbackResult = await sendEmailFallback(to, subject, content);
      return fallbackResult;
    } catch (fallbackError) {
      return { 
        success: false, 
        error: `Email failed: ${error}. Fallback failed: ${fallbackError}` 
      };
    }
  }
}

/**
 * Send SMS using Twilio
 */
export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  
  try {
    const response = await fetch('/.netlify/functions/send-sms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message })
    });
    
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'SMS failed' };
  }
}

/**
 * Schedule outreach campaign
 */
export async function scheduleCampaign(campaign: OutreachCampaign): Promise<boolean> {
  try {
    // Store campaign in Supabase
    // @ts-ignore
    const { supabase } = await import('../auth/supabase');
    
    const { error } = await supabase
      .from('canvas_campaigns')
      .insert({
        id: campaign.id,
        doctor_name: campaign.doctorName,
        product_name: campaign.productName,
        templates: campaign.templates,
        sequence: campaign.sequence,
        status: campaign.status,
        created_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    // Schedule individual steps
    for (const step of campaign.sequence) {
      await scheduleStep(campaign.id, step);
    }
    
    return true;
    
  } catch (error) {
    console.error('Campaign scheduling failed:', error);
    return false;
  }
}

// Helper functions
function buildResearchContext(researchData: ResearchData): string {
  return `
PRACTICE: ${researchData.practiceInfo.name || 'Unknown'}
LOCATION: ${researchData.practiceInfo.address || 'Unknown'}
TECHNOLOGY: ${researchData.practiceInfo.technology?.join(', ') || 'Unknown'}
SPECIALTIES: ${researchData.practiceInfo.specialties?.join(', ') || 'Unknown'}
STAFF SIZE: ${researchData.practiceInfo.staff || 'Unknown'}
CONFIDENCE: ${researchData.confidenceScore}%
SOURCES: ${researchData.sources.length} verified sources
  `.trim();
}

function buildScanContext(scanResult: EnhancedScanResult): string {
  return `
DOCTOR: ${scanResult.doctor}
PRODUCT: ${scanResult.product}
ALIGNMENT SCORE: ${scanResult.score}%
RESEARCH QUALITY: ${scanResult.researchQuality}
FACT-BASED: ${scanResult.factBased ? 'Yes' : 'No'}
KEY INSIGHTS: ${scanResult.insights.join(', ')}
  `.trim();
}

function generateFallbackContent(scanResult: EnhancedScanResult, channel: string): string {
  const templates = {
    email: `Dear Dr. ${scanResult.doctor},

I hope this email finds you well. Based on my research of your practice, I believe ${scanResult.product} could provide significant value to your operations.

Our analysis shows a ${scanResult.score}% alignment between your practice needs and our solution's capabilities.

Would you be open to a brief 15-minute conversation to explore this opportunity?

Best regards,
[Your Name]`,
    
    sms: `Dr. ${scanResult.doctor}, ${scanResult.product} shows ${scanResult.score}% fit for your practice. Quick call to discuss? [Your Name]`,
    
    linkedin: `Hello Dr. ${scanResult.doctor}, I've been researching innovative solutions for practices like yours. ${scanResult.product} shows strong potential for your operations. Would you be open to connecting?`
  };
  
  return templates[channel as keyof typeof templates] || templates.email;
}

function generateFallbackOutreach(
  scanResult: EnhancedScanResult, 
  _templateType: string, 
  channel: string
): PersonalizedOutreach {
  return {
    subject: `${scanResult.product} Opportunity - ${scanResult.score}% Practice Fit`,
    content: generateFallbackContent(scanResult, channel),
    personalizations: ['Practice-specific research', 'Technology alignment'],
    researchInsights: ['High practice fit score', 'Efficiency opportunity'],
    urgencyScore: Math.floor(scanResult.score / 10),
    expectedResponse: 'Professional consideration'
  };
}

async function sendEmailFallback(_to: string, _subject: string, _content: string) {
  // EmailJS or other client-side email service integration
  return { success: false, error: 'Fallback email not implemented' };
}

async function scheduleStep(campaignId: string, step: CampaignStep) {
  // Implement step scheduling logic
  console.log(`Scheduling step ${step.id} for campaign ${campaignId}`);
}