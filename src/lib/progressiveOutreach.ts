/**
 * Progressive Outreach System - Tiered sales materials that improve with research depth
 * Generic → Pro → Genius as more intelligence is gathered
 */

export type OutreachTier = 'generic' | 'pro' | 'genius';

export interface OutreachMaterial {
  tier: OutreachTier;
  availableAt: number; // Percentage of research complete
  subject: string;
  emailContent: string;
  followUpSequence: Array<{
    day: number;
    subject: string;
    content: string;
  }>;
  personalizations: string[];
  confidence: number;
  talkingPoints: string[];
  callScript?: string;
  smsTemplate?: string;
}

export interface OutreachCapabilities {
  generic: {
    available: boolean;
    features: string[];
  };
  pro: {
    available: boolean;
    features: string[];
  };
  genius: {
    available: boolean;
    features: string[];
  };
}

/**
 * Outreach tiers and when they become available
 */
export const OUTREACH_TIERS = {
  generic: {
    name: "Generic Outreach",
    description: "Basic templates with minimal personalization",
    availableAt: 10, // Available after instant intel (10% complete)
    apiCalls: 0, // Uses template engine, no API calls
    features: [
      "Basic email template",
      "Product-focused messaging",
      "Standard follow-up sequence",
      "Generic value propositions"
    ]
  },
  pro: {
    name: "Pro Outreach",
    description: "Personalized messaging based on practice data",
    availableAt: 35, // Available after basic research (35% complete)
    apiCalls: 1, // One AI call to personalize
    features: [
      "Personalized subject lines",
      "Practice-specific pain points",
      "Customized value props",
      "3-touch follow-up sequence",
      "Basic objection handling"
    ]
  },
  genius: {
    name: "Genius Outreach",
    description: "Hyper-personalized multi-channel campaigns",
    availableAt: 65, // Available after enhanced research (65% complete)
    apiCalls: 2, // Multiple AI calls for deep personalization
    features: [
      "Psychological profiling",
      "Competitive positioning",
      "Multi-channel sequences",
      "7-touch campaigns",
      "Trigger-based messaging",
      "Video script generation",
      "LinkedIn outreach templates"
    ]
  }
};

/**
 * Generate outreach based on available research data
 */
interface ResearchData {
  doctorName: string;
  productName: string;
  score?: number;
  practiceInfo?: {
    name?: string;
    specialty?: string;
    technology?: string[];
  };
  insights?: string[];
  location?: string;
  reviews?: {
    highlight?: string;
    commonPraise?: string[];
  };
  competitiveIntel?: {
    trigger?: string;
    focus?: string;
  };
  profile?: {
    communicationStyle?: string;
    primaryMotivator?: string;
    triggerWords?: string[];
    decisionStyle?: string;
    preferredNextStep?: string;
  };
}

export async function generateProgressiveOutreach(
  researchData: ResearchData,
  researchProgress: number,
  requestedTier?: OutreachTier
): Promise<OutreachMaterial> {
  
  // Determine best available tier based on research progress
  const availableTier = determineAvailableTier(researchProgress, requestedTier);
  
  switch (availableTier) {
    case 'generic':
      return generateGenericOutreach(researchData);
    case 'pro':
      return await generateProOutreach(researchData);
    case 'genius':
      return await generateGeniusOutreach(researchData);
    default:
      return generateGenericOutreach(researchData);
  }
}

/**
 * Generic Outreach - Available immediately with basic data
 */
function generateGenericOutreach(data: ResearchData): OutreachMaterial {
  const { doctorName, productName } = data;
  
  return {
    tier: 'generic',
    availableAt: 10,
    subject: `${productName} - Efficiency Solution for Your Practice`,
    emailContent: `Dear Dr. ${doctorName},

I hope this email finds you well. I'm reaching out because ${productName} has been helping medical practices like yours improve efficiency and patient outcomes.

Our solution offers:
• Streamlined workflows that save 2-3 hours daily
• Improved patient satisfaction scores
• ROI within 6 months

Would you be open to a brief 15-minute call to explore if ${productName} could benefit your practice?

Best regards,
[Your Name]`,
    followUpSequence: [
      {
        day: 3,
        subject: `Quick follow-up - ${productName}`,
        content: `Dr. ${doctorName}, just wanted to make sure my previous email reached you...`
      },
      {
        day: 7,
        subject: `Last attempt - ${productName} opportunity`,
        content: `Dr. ${doctorName}, I'll keep this brief. ${productName} could really help your practice...`
      }
    ],
    personalizations: ['Doctor name', 'Product name'],
    confidence: 40,
    talkingPoints: [
      'General practice efficiency',
      'Industry-standard benefits',
      'Common pain points'
    ]
  };
}

/**
 * Pro Outreach - Available after basic research (35% complete)
 */
async function generateProOutreach(data: ResearchData): Promise<OutreachMaterial> {
  const { doctorName, productName, score, practiceInfo, insights } = data;
  
  // Use one AI call to personalize based on practice data
  const { callClaudeOutreach } = await import('./apiEndpoints');
  
  const prompt = `Generate personalized outreach for Dr. ${doctorName}
Product: ${productName}
Practice Score: ${score}
Practice Info: ${JSON.stringify(practiceInfo)}
Insights: ${insights?.join(', ')}

Create a professional but personalized email that references specific practice details.`;

  try {
    const aiResponse = await callClaudeOutreach(prompt);
    const generated = JSON.parse(aiResponse.choices[0].message.content);
    
    return {
      tier: 'pro',
      availableAt: 35,
      subject: generated.subject || `${productName} - Custom Solution for ${practiceInfo?.name || 'Your Practice'}`,
      emailContent: generated.content || generateProFallback(data),
      followUpSequence: [
        {
          day: 2,
          subject: `Following up on ${practiceInfo?.specialty || 'practice'} efficiency`,
          content: personalizeFollowUp(data, 1)
        },
        {
          day: 5,
          subject: `Quick question about your ${practiceInfo?.technology?.[0] || 'current systems'}`,
          content: personalizeFollowUp(data, 2)
        },
        {
          day: 10,
          subject: `${productName} success story - similar to your practice`,
          content: personalizeFollowUp(data, 3)
        }
      ],
      personalizations: generated.personalizations || [
        'Practice name',
        'Specialty mentioned',
        'Technology referenced',
        'Location-specific'
      ],
      confidence: 70,
      talkingPoints: [
        `Practice uses ${practiceInfo?.technology?.join(', ') || 'modern systems'}`,
        `Located in competitive ${data.location || 'market'}`,
        `Fit score of ${score ?? 0}% indicates strong alignment`,
        ...(generated.researchInsights as string[] || [])
      ],
      callScript: generateCallScript(data, 'pro')
    };
  } catch (_error) {
    return {
      ...generateProFallback(data),
      tier: 'pro',
      availableAt: 35
    };
  }
}

/**
 * Genius Outreach - Available after enhanced research (65% complete)
 */
async function generateGeniusOutreach(data: ResearchData): Promise<OutreachMaterial> {
  const { 
    doctorName, 
    productName, 
    practiceInfo, 
    reviews, 
    competitiveIntel 
  } = data;
  
  const { callClaudeOutreach } = await import('./apiEndpoints');
  
  // First AI call - Deep psychological profiling
  const profilingPrompt = `Analyze Dr. ${doctorName} psychological profile for sales:
Practice data: ${JSON.stringify(practiceInfo)}
Reviews: ${JSON.stringify(reviews)}
Competitive intel: ${JSON.stringify(competitiveIntel)}
Create a psychological profile including:
- Decision-making style
- Communication preferences  
- Key motivators
- Potential objections`;

  // Second AI call - Hyper-personalized campaign
  const campaignPrompt = `Create genius-level outreach campaign:
Doctor: ${doctorName}
Product: ${productName}
Full Intelligence: ${JSON.stringify(data)}
Competitive Intel: ${JSON.stringify(competitiveIntel)}

Generate:
1. Multi-channel campaign (email, LinkedIn, phone)
2. 7-touch sequence with trigger points
3. Competitive differentiation messaging
4. ROI calculations specific to their practice
5. Video message script
6. Objection handling guide`;

  try {
    const [profileResponse, campaignResponse] = await Promise.all([
      callClaudeOutreach(profilingPrompt),
      callClaudeOutreach(campaignPrompt)
    ]);
    
    const profile = JSON.parse(profileResponse.choices[0].message.content);
    const campaign = JSON.parse(campaignResponse.choices[0].message.content);
    
    return {
      tier: 'genius',
      availableAt: 65,
      subject: campaign.subject || `${doctorName}, saw your ${reviews?.highlight || 'recent update'} - quick thought`,
      emailContent: campaign.emailContent || generateGeniusEmail(data, profile),
      followUpSequence: campaign.sequence || generateGeniusSequence(data, profile),
      personalizations: [
        'Psychological triggers',
        'Specific review mentions',
        'Competitor comparisons',
        'ROI calculations',
        'Staff names mentioned',
        'Recent practice news',
        ...campaign.personalizations || []
      ],
      confidence: 95,
      talkingPoints: [
        ...profile.keyInsights || [],
        ...campaign.competitiveAdvantages || [],
        `Estimated ROI: ${campaign.roi || '6-8 months'}`,
        `Decision style: ${profile.decisionStyle || 'Analytical'}`,
        `Best approach: ${profile.communicationStyle || 'Data-driven'}`
      ],
      callScript: campaign.callScript || generateCallScript(data, 'genius'),
      smsTemplate: campaign.smsTemplate || generateSmsTemplate(data)
    };
    
  } catch (error) {
    console.error('Genius outreach generation failed:', error);
    // Fallback to enhanced pro version
    return {
      ...(await generateProOutreach(data)),
      tier: 'genius',
      availableAt: 65,
      confidence: 80
    };
  }
}

/**
 * Helper functions
 */
function determineAvailableTier(
  progress: number, 
  requested?: OutreachTier
): OutreachTier {
  if (progress >= 65 && (!requested || requested === 'genius')) {
    return 'genius';
  } else if (progress >= 35 && (!requested || requested === 'pro')) {
    return 'pro';
  } else {
    return 'generic';
  }
}

interface ProFallbackResult {
  subject: string;
  emailContent: string;
  followUpSequence: Array<{ day: number; subject: string; content: string }>;
  personalizations: string[];
  confidence: number;
  talkingPoints: string[];
}

function generateProFallback(data: ResearchData): ProFallbackResult {
  return {
    subject: `${data.productName} - Tailored for ${data.practiceInfo?.specialty || 'Your Specialty'}`,
    emailContent: `Dear Dr. ${data.doctorName},

I noticed your practice ${data.practiceInfo?.name ? `(${data.practiceInfo.name})` : ''} specializes in ${data.practiceInfo?.specialty || 'patient care'}. 

${data.productName} has been particularly successful with practices like yours, helping them:
• Reduce administrative burden by 40%
• Improve patient scheduling efficiency
• Integrate seamlessly with ${data.practiceInfo?.technology?.[0] || 'existing systems'}

Based on my research, your practice could benefit from our ${(data.score ?? 0) > 80 ? 'premium' : 'standard'} implementation package.

Would you have 15 minutes this week to discuss how ${data.productName} aligns with your practice goals?

Best regards,
[Your Name]`,
    followUpSequence: [],
    personalizations: ['Practice name', 'Specialty', 'Technology mentioned'],
    confidence: 60,
    talkingPoints: []
  };
}

function personalizeFollowUp(data: ResearchData, touchNumber: number): string {
  const templates = {
    1: `Dr. ${data.doctorName}, I wanted to follow up on my previous email about ${data.productName}. Given your practice's focus on ${data.practiceInfo?.specialty || 'quality care'}, I think you'd find our approach particularly relevant...`,
    2: `Hi Dr. ${data.doctorName}, I noticed your practice ${data.practiceInfo?.technology ? `uses ${data.practiceInfo.technology[0]}` : 'values efficiency'}. ${data.productName} integrates seamlessly with similar systems. Quick question - what's your biggest workflow challenge right now?`,
    3: `Dr. ${data.doctorName}, I wanted to share a quick success story from a ${data.practiceInfo?.specialty || 'medical'} practice similar to yours. They saw 35% improvement in patient flow within 60 days...`
  };
  
  return templates[touchNumber as keyof typeof templates] || templates[1];
}

function generateCallScript(data: ResearchData, tier: 'pro' | 'genius'): string {
  if (tier === 'genius') {
    return `GENIUS CALL SCRIPT for Dr. ${data.doctorName}

OPENING (match their communication style: ${data.profile?.communicationStyle || 'professional'})
"Hi Dr. ${data.doctorName}, I know you're busy so I'll be brief. I'm calling about ${data.productName}. 
I noticed [specific trigger from research: ${data.competitiveIntel?.trigger || 'your recent expansion'}]..."

KEY POINTS (based on psychological profile):
• Lead with: ${data.profile?.primaryMotivator || 'efficiency gains'}
• Avoid: ${data.profile?.triggerWords || 'pushy sales language'}
• Reference: ${data.reviews?.commonPraise?.[0] || 'your reputation for innovation'}

OBJECTION HANDLING:
[Customized based on profile]`;
  }
  
  return `PRO CALL SCRIPT for Dr. ${data.doctorName}

OPENING:
"Hi Dr. ${data.doctorName}, I'm [Name] from ${data.productName}. I've been researching practices in ${data.location || 'your area'} 
and noticed your ${data.practiceInfo?.specialty || 'practice'} might benefit from our solution..."

KEY POINTS:
• Practice-specific benefit
• ROI timeline
• Integration simplicity`;
}

function generateSmsTemplate(data: ResearchData): string {
  return `Dr. ${data.doctorName}, following up on ${data.productName}. Based on your practice's ${data.competitiveIntel?.focus || 'needs'}, 
I have a specific insight to share. Worth a quick call? [Your Name]`;
}

interface Profile {
  triggerWords?: string[];
  decisionStyle?: string;
  preferredNextStep?: string;
}

function generateGeniusEmail(data: ResearchData, profile: Profile): string {
  return `[Genius-level personalized email based on deep research and psychological profiling]

Subject line uses trigger words: ${profile.triggerWords?.join(', ')}
Opening references: ${(data.reviews as unknown)?.recentUpdate || 'recent practice development'}
Body leverages: ${profile.decisionStyle} decision-making style
Close uses: ${profile.preferredNextStep || 'low-pressure invitation'}`;
}

function generateGeniusSequence(_data: ResearchData, _profile: Profile): Array<{ day: number; subject: string; content: string }> {
  return [
    { day: 1, subject: 'LinkedIn connection', content: 'Personalized LinkedIn message...' },
    { day: 3, subject: 'Email follow-up', content: 'Reference LinkedIn view...' },
    { day: 5, subject: 'Value-add content', content: 'Industry report relevant to them...' },
    { day: 8, subject: 'Peer success story', content: 'Similar practice case study...' },
    { day: 12, subject: 'Competitive insight', content: 'Market intelligence share...' },
    { day: 15, subject: 'Video message', content: 'Personalized video link...' },
    { day: 20, subject: 'Final value prop', content: 'ROI calculation specific to them...' }
  ];
}

/**
 * Get current outreach capabilities based on research progress
 */
export function getOutreachCapabilities(researchProgress: number): OutreachCapabilities {
  return {
    generic: {
      available: researchProgress >= 10,
      features: OUTREACH_TIERS.generic.features
    },
    pro: {
      available: researchProgress >= 35,
      features: researchProgress >= 35 
        ? OUTREACH_TIERS.pro.features 
        : ['Unlocks at 35% research complete']
    },
    genius: {
      available: researchProgress >= 65,
      features: researchProgress >= 65
        ? OUTREACH_TIERS.genius.features
        : ['Unlocks at 65% research complete']
    }
  };
}