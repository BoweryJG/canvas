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
 * Generate personalized outreach using Claude and medical intelligence
 */
export async function generatePersonalizedOutreach(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  templateType: 'first_contact' | 'follow_up' | 'break_through' | 'closing',
  channel: 'email' | 'sms' | 'linkedin'
): Promise<PersonalizedOutreach> {
  
  const { callClaudeOutreach } = await import('./apiEndpoints');
  
  // Use new medical intelligence if available
  const scrapedData = (researchData as any).scrapedWebsiteData;
  const medicalContext = scrapedData ? buildMedicalOutreachContext(scrapedData, scanResult.product) : buildResearchContext(researchData);
  const scanContext = buildScanContext(scanResult);
  
  const prompt = `Generate a believable cold ${channel} ${templateType} for medical device sales. This must NOT sound like spam.

DOCTOR: ${scanResult.doctor}
PRODUCT: ${scanResult.product}
PRACTICE INTELLIGENCE:
${medicalContext}

CRITICAL REQUIREMENTS FOR BELIEVABLE OUTREACH:
- Reference SPECIFIC details from their website that prove you researched them
- Mention their current procedures/technology to establish credibility
- Don't sound like a generic sales email - be conversational
- Show genuine understanding of their practice type
- Connect the product to what they already do
- Keep it brief and professional
- ${templateType === 'first_contact' ? 'This is cold outreach - they don\'t know you' : 'This is follow-up communication'}

TONE: Professional but conversational, like a knowledgeable colleague
LENGTH: ${channel === 'sms' ? '160 chars max' : channel === 'email' ? '150 words max' : '100 words max'}

EXAMPLE CREDIBILITY HOOKS:
- "I noticed you offer [specific procedure] and use [specific technology]..."
- "I saw on your website that you have [specific equipment/service]..."
- "Given your practice's focus on [specific area], I thought you'd be interested..."

OUTPUT FORMAT:
{
  "subject": "${channel === 'email' ? 'professional subject line' : 'N/A'}",
  "content": "believable message content that proves research",
  "personalizations": ["specific website detail 1", "specific procedure/tech 2", "practice strength 3"],
  "researchInsights": ["why this product fits their practice", "competitive opportunity", "specific benefit"],
  "urgencyScore": number 1-10,
  "expectedResponse": "predicted response based on credibility"
}`;

  try {
    const response = await callClaudeOutreach(prompt);
    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      subject: result.subject || generateBelievableSubject(scanResult.product, scanResult.doctor),
      content: result.content || generateBelievableFallback(scanResult, scrapedData, channel),
      personalizations: result.personalizations || [],
      researchInsights: result.researchInsights || [],
      urgencyScore: result.urgencyScore || 6,
      expectedResponse: result.expectedResponse || 'Professional consideration'
    };
    
  } catch (error) {
    console.error('Outreach generation failed:', error);
    return generateBelievableOutreach(scanResult, scrapedData, templateType, channel);
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
  // Use enhanced campaign if product intelligence is available
  if (researchData.productIntelligence || researchData.enhancedInsights) {
    const { createProductAwareCampaign } = await import('./enhancedOutreachSystem');
    const campaign = await createProductAwareCampaign(scanResult, researchData, {
      name: 'Sales Rep',
      company: 'Company',
      product: scanResult.product
    });
    
    // Convert to standard format
    return {
      id: campaign.id,
      doctorName: campaign.doctorName,
      productName: campaign.productName,
      templates: [],
      sequence: campaign.sequence.map(step => ({
        id: step.id,
        day: step.day,
        time: step.time,
        type: step.channel as any,
        templateId: step.id,
        conditions: step.triggers
      })),
      analytics: campaign.analytics,
      status: campaign.status
    };
  }
  
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
PROCEDURES: ${researchData.practiceInfo.services?.join(', ') || 'Unknown'}
TECHNOLOGY: ${researchData.practiceInfo.technologies?.join(', ') || 'Unknown'}
SPECIALTIES: ${researchData.practiceInfo.specialties?.join(', ') || 'Unknown'}
STAFF SIZE: ${researchData.practiceInfo.teamSize || 'Unknown'}
CONFIDENCE: ${researchData.confidenceScore}%
SOURCES: ${researchData.sources.length} verified sources
  `.trim();
}

/**
 * Build medical context from scraped website data for outreach
 */
function buildMedicalOutreachContext(scrapedData: any, productName: string): string {
  if (!scrapedData) return 'Medical data unavailable';
  
  const productCategory = determineProductCategory(productName);
  let context = '';
  
  if (productCategory === 'dental' || productCategory === 'both') {
    const dentalProcs = Object.entries(scrapedData.dentalProcedures || {})
      .filter(([_, has]) => has)
      .map(([proc, _]) => proc);
    
    const implantSystems = Object.entries(scrapedData.implantSystems || {})
      .filter(([_, has]) => has)
      .map(([system, _]) => system);
    
    const dentalTech = Object.entries(scrapedData.dentalTechnology || {})
      .filter(([_, has]) => has)
      .map(([tech, _]) => tech);
    
    if (dentalProcs.length > 0 || implantSystems.length > 0 || dentalTech.length > 0) {
      context += `DENTAL PRACTICE DETAILS:
• Procedures: ${dentalProcs.join(', ') || 'Standard dental services'}
• Implant Systems: ${implantSystems.join(', ') || 'Not specified'}
• Technology: ${dentalTech.join(', ') || 'Traditional equipment'}
`;
    }
  }
  
  if (productCategory === 'aesthetic' || productCategory === 'both') {
    const aestheticProcs = Object.entries(scrapedData.aestheticProcedures || {})
      .filter(([_, has]) => has)
      .map(([proc, _]) => proc);
    
    const aestheticDevices = Object.entries(scrapedData.aestheticDevices || {})
      .filter(([_, has]) => has)
      .map(([device, _]) => device);
    
    const injectables = Object.entries(scrapedData.injectableBrands || {})
      .filter(([_, has]) => has)
      .map(([brand, _]) => brand);
    
    if (aestheticProcs.length > 0 || aestheticDevices.length > 0 || injectables.length > 0) {
      context += `AESTHETIC PRACTICE DETAILS:
• Procedures: ${aestheticProcs.join(', ') || 'Basic aesthetic services'}
• Devices/Lasers: ${aestheticDevices.join(', ') || 'Standard equipment'}
• Injectable Brands: ${injectables.join(', ') || 'Not specified'}
`;
    }
  }
  
  return context || 'Practice details to be determined';
}

/**
 * Determine product category for outreach context
 */
function determineProductCategory(productName: string): 'dental' | 'aesthetic' | 'both' {
  const product = productName.toLowerCase();
  const dentalKeywords = ['yomi', 'straumann', 'implant', 'dental', 'cbct', 'itero'];
  const aestheticKeywords = ['fraxel', 'botox', 'juvederm', 'coolsculpting', 'laser', 'aesthetic'];
  
  const isDental = dentalKeywords.some(keyword => product.includes(keyword));
  const isAesthetic = aestheticKeywords.some(keyword => product.includes(keyword));
  
  if (isDental && isAesthetic) return 'both';
  if (isDental) return 'dental';
  if (isAesthetic) return 'aesthetic';
  return 'both';
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

/**
 * Generate believable subject line
 */
function generateBelievableSubject(productName: string, doctorName: string): string {
  const cleanName = doctorName.replace(/^Dr\.?\s*/i, '');
  const subjects = [
    `${productName} integration for your practice`,
    `${productName} opportunity - ${cleanName}`,
    `Quick question about your practice setup`,
    `Technology upgrade opportunity`
  ];
  return subjects[0]; // Use first one for consistency
}

/**
 * Generate believable fallback content using medical intelligence
 */
function generateBelievableFallback(
  scanResult: EnhancedScanResult, 
  scrapedData: any,
  channel: string
): string {
  const productCategory = determineProductCategory(scanResult.product);
  let credibilityHook = '';
  
  // Build credibility based on what we found on their website
  if (scrapedData) {
    if (productCategory === 'dental') {
      const procedures = Object.entries(scrapedData.dentalProcedures || {})
        .filter(([_, has]) => has)
        .map(([proc, _]) => proc);
      
      const technology = Object.entries(scrapedData.dentalTechnology || {})
        .filter(([_, has]) => has)
        .map(([tech, _]) => tech);
      
      if (procedures.length > 0) {
        credibilityHook = `I noticed your practice offers ${procedures[0]}`;
      } else if (technology.length > 0) {
        credibilityHook = `I saw you have ${technology[0]} capability`;
      }
    } else if (productCategory === 'aesthetic') {
      const procedures = Object.entries(scrapedData.aestheticProcedures || {})
        .filter(([_, has]) => has)
        .map(([proc, _]) => proc);
      
      const devices = Object.entries(scrapedData.aestheticDevices || {})
        .filter(([_, has]) => has)
        .map(([device, _]) => device);
      
      if (procedures.length > 0) {
        credibilityHook = `I noticed you offer ${procedures[0]} treatments`;
      } else if (devices.length > 0) {
        credibilityHook = `I saw you have ${devices[0]} technology`;
      }
    }
  }
  
  if (!credibilityHook) {
    credibilityHook = `I've been researching your practice`;
  }
  
  const templates = {
    email: `Dr. ${scanResult.doctor.replace(/^Dr\.?\s*/i, '')},

${credibilityHook} and thought ${scanResult.product} might be a good fit for your setup.

Given your current capabilities, this could enhance your procedural efficiency and patient outcomes. 

Would you be open to a brief conversation to discuss how this might work for your practice?

Best regards,
[Your Name]`,
    
    sms: `Dr. ${scanResult.doctor.replace(/^Dr\.?\s*/i, '')}, ${credibilityHook}. ${scanResult.product} could enhance your current setup. Quick call to discuss? [Your Name]`,
    
    linkedin: `Hello Dr. ${scanResult.doctor.replace(/^Dr\.?\s*/i, '')}, ${credibilityHook}. ${scanResult.product} shows strong potential for practices like yours. Would you be open to connecting?`
  };
  
  return templates[channel as keyof typeof templates] || templates.email;
}

/**
 * Generate believable outreach fallback
 */
function generateBelievableOutreach(
  scanResult: EnhancedScanResult,
  scrapedData: any, 
  _templateType: string, 
  channel: string
): PersonalizedOutreach {
  return {
    subject: generateBelievableSubject(scanResult.product, scanResult.doctor),
    content: generateBelievableFallback(scanResult, scrapedData, channel),
    personalizations: ['Website research', 'Practice-specific details', 'Technology alignment'],
    researchInsights: ['Practice compatibility', 'Enhancement opportunity', 'Professional upgrade'],
    urgencyScore: 6,
    expectedResponse: 'Professional consideration'
  };
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