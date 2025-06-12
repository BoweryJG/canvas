/**
 * Instant Intelligence System
 * Generates tactical sales intelligence in 15-30 seconds
 * Using only NPI data + product knowledge
 */

import { callPerplexityResearch } from './apiEndpoints';
import { findProcedureByName } from './procedureDatabase';

export interface InstantIntelligence {
  tacticalBrief: string;
  keyInsights: string[];
  painPoints: string[];
  approachStrategy: {
    opening: string;
    valueProps: string[];
    objectionHandlers: Map<string, string>;
  };
  outreachTemplates: {
    email: {
      subject: string;
      body: string;
    };
    sms: string;
    linkedin: string;
  };
  confidenceScore: number;
  generatedIn: number; // milliseconds
}

export async function generateInstantIntelligence(
  doctorName: string,
  specialty: string,
  location: string,
  productName: string,
  npi?: string,
  practiceName?: string,
  onProgress?: (stage: string, percentage: number) => void
): Promise<InstantIntelligence> {
  const startTime = Date.now();
  
  try {
    // Progress: Starting
    onProgress?.('Analyzing practice profile...', 10);
    
    // Look up procedure information from database
    const procedureInfo = await findProcedureByName(productName);
    const procedureContext = procedureInfo ? `
PROCEDURE/PRODUCT DETAILS:
- Category: ${procedureInfo.category}
- Specialty: ${procedureInfo.specialty || specialty}
- Average Price: $${procedureInfo.average_price || 'Variable'}
- Related Products: ${procedureInfo.related_products?.join(', ') || 'Various options'}
- Keywords: ${procedureInfo.keywords?.join(', ') || productName}
` : '';
    
    // Build comprehensive prompt for single-shot intelligence
    const intelligencePrompt = `
You are an expert medical sales intelligence analyst. Generate immediate, actionable sales intelligence.

DOCTOR INFORMATION:
- Name: ${doctorName}
- Specialty: ${specialty}
- Location: ${location}
${practiceName ? `- Practice: ${practiceName}` : ''}
${npi ? `- NPI: ${npi} (verified)` : ''}

PRODUCT TO SELL: ${productName}
${procedureContext}

Generate comprehensive sales intelligence including:

1. TACTICAL BRIEF (2-3 sentences):
   - Immediate approach strategy
   - Why this doctor needs this product NOW
   - Best entry angle

2. KEY INSIGHTS (3-5 bullet points):
   - Specialty-specific pain points
   - Practice type indicators
   - Decision-making factors
   - Budget/purchasing patterns for this specialty

3. PAIN POINTS (specific to ${specialty} and ${productName}):
   - Current workflow inefficiencies that ${productName} solves
   - Common complaints in this specialty related to ${productName}
   - Regulatory/compliance challenges
   - Technology gaps ${productName} addresses

4. APPROACH STRATEGY:
   - Best opening line connecting ${productName} to ${specialty} needs
   - 3 value propositions for ${productName} specific to their practice
   - Common objections about ${productName} and responses

5. OUTREACH TEMPLATES:
   A. Email (personalized for ${doctorName}):
      - Subject line (under 50 chars)
      - Body (under 150 words, conversational)
   
   B. SMS (under 160 chars):
      - Friendly, professional, specific benefit
   
   C. LinkedIn (under 300 chars):
      - Connection request message

Focus on ${specialty}-specific insights. Be specific, actionable, and sales-focused.
Format response as JSON with clear sections.`;

    // Progress: Making API call
    onProgress?.('Generating tactical intelligence...', 40);
    
    const response = await callPerplexityResearch(intelligencePrompt);
    
    // Progress: Processing response
    onProgress?.('Processing insights...', 70);
    
    // Parse the response
    let parsedIntelligence;
    try {
      // Handle different response types
      let responseText = '';
      if (typeof response === 'string') {
        responseText = response;
      } else if (response?.choices?.[0]?.message?.content) {
        responseText = response.choices[0].message.content;
      } else if (response?.content) {
        responseText = response.content;
      } else {
        console.warn('Unexpected response format:', response);
        responseText = JSON.stringify(response);
      }
      
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedIntelligence = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: parse structured text
        parsedIntelligence = parseStructuredResponse(responseText);
      }
    } catch (error) {
      console.error('Failed to parse intelligence response:', error);
      parsedIntelligence = {};
    }
    
    // Progress: Finalizing
    onProgress?.('Finalizing intelligence brief...', 90);
    
    // Build the final intelligence object
    const intelligence: InstantIntelligence = {
      tacticalBrief: parsedIntelligence.tacticalBrief || generateDefaultBrief(doctorName, specialty, productName),
      keyInsights: parsedIntelligence.keyInsights || generateDefaultInsights(specialty),
      painPoints: parsedIntelligence.painPoints || generateDefaultPainPoints(specialty),
      approachStrategy: {
        opening: parsedIntelligence.approachStrategy?.opening || `Hi Dr. ${doctorName.split(' ').pop()}, I noticed your ${specialty} practice in ${location}...`,
        valueProps: parsedIntelligence.approachStrategy?.valueProps || generateDefaultValueProps(specialty, productName),
        objectionHandlers: new Map(Object.entries(parsedIntelligence.approachStrategy?.objections || generateDefaultObjections()))
      },
      outreachTemplates: {
        email: parsedIntelligence.outreachTemplates?.email || generateDefaultEmail(doctorName, specialty, productName, location),
        sms: parsedIntelligence.outreachTemplates?.sms || generateDefaultSMS(doctorName, productName),
        linkedin: parsedIntelligence.outreachTemplates?.linkedin || generateDefaultLinkedIn(doctorName, specialty)
      },
      confidenceScore: npi ? 95 : 85, // Higher confidence with NPI
      generatedIn: Date.now() - startTime
    };
    
    // Progress: Complete
    onProgress?.('Intelligence ready!', 100);
    
    return intelligence;
    
  } catch (error) {
    console.error('Failed to generate instant intelligence:', error);
    
    // Return default intelligence on error
    return {
      tacticalBrief: generateDefaultBrief(doctorName, specialty, productName),
      keyInsights: generateDefaultInsights(specialty),
      painPoints: generateDefaultPainPoints(specialty),
      approachStrategy: {
        opening: `Hi Dr. ${doctorName.split(' ').pop()}, I work with ${specialty} practices in ${location}...`,
        valueProps: generateDefaultValueProps(specialty, productName),
        objectionHandlers: new Map(Object.entries(generateDefaultObjections()))
      },
      outreachTemplates: {
        email: generateDefaultEmail(doctorName, specialty, productName, location),
        sms: generateDefaultSMS(doctorName, productName),
        linkedin: generateDefaultLinkedIn(doctorName, specialty)
      },
      confidenceScore: npi ? 85 : 75,
      generatedIn: Date.now() - startTime
    };
  }
}

// Helper function to parse structured text response
function parseStructuredResponse(response: string | any): any {
  const result: any = {};
  
  // Ensure response is a string
  const responseText = typeof response === 'string' ? response : JSON.stringify(response);
  
  // Extract tactical brief
  const briefMatch = responseText.match(/TACTICAL BRIEF[:\s]*([\s\S]*?)(?=KEY INSIGHTS|PAIN POINTS|$)/i);
  if (briefMatch) {
    result.tacticalBrief = briefMatch[1].trim();
  }
  
  // Extract key insights
  const insightsMatch = responseText.match(/KEY INSIGHTS[:\s]*([\s\S]*?)(?=PAIN POINTS|APPROACH|$)/i);
  if (insightsMatch) {
    result.keyInsights = insightsMatch[1]
      .split(/[\n•\-]/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }
  
  // Extract pain points
  const painMatch = responseText.match(/PAIN POINTS[:\s]*([\s\S]*?)(?=APPROACH|OUTREACH|$)/i);
  if (painMatch) {
    result.painPoints = painMatch[1]
      .split(/[\n•\-]/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }
  
  // Extract approach strategy
  const approachMatch = responseText.match(/APPROACH STRATEGY[:\s]*([\s\S]*?)(?=OUTREACH|EMAIL|$)/i);
  if (approachMatch) {
    const approachText = approachMatch[1];
    result.approachStrategy = {
      opening: approachText.match(/opening[:\s]*(.*?)(?=value|$)/i)?.[1]?.trim(),
      valueProps: approachText.match(/value prop[:\s]*([\s\S]*?)(?=objection|$)/i)?.[1]
        ?.split(/[\n•\-]/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
    };
  }
  
  // Extract outreach templates
  result.outreachTemplates = {};
  
  const emailMatch = responseText.match(/EMAIL[:\s]*([\s\S]*?)(?=SMS|LINKEDIN|$)/i);
  if (emailMatch) {
    const emailText = emailMatch[1];
    result.outreachTemplates.email = {
      subject: emailText.match(/subject[:\s]*(.*?)(?=body|$)/i)?.[1]?.trim(),
      body: emailText.match(/body[:\s]*([\s\S]*?)$/i)?.[1]?.trim()
    };
  }
  
  const smsMatch = responseText.match(/SMS[:\s]*(.*?)(?=LINKEDIN|$)/i);
  if (smsMatch) {
    result.outreachTemplates.sms = smsMatch[1].trim();
  }
  
  const linkedinMatch = responseText.match(/LINKEDIN[:\s]*(.*?)$/i);
  if (linkedinMatch) {
    result.outreachTemplates.linkedin = linkedinMatch[1].trim();
  }
  
  return result;
}

// Default generators for each specialty
function generateDefaultBrief(doctorName: string, specialty: string, productName: string): string {
  const lastName = doctorName.split(' ').pop();
  
  // Specific briefs for known products
  if (productName.toLowerCase().includes('yomi')) {
    return `Dr. ${lastName}'s ${specialty} practice is ideal for Yomi robotic-guided implant surgery. ` +
           `As an oral surgeon, they likely place multiple implants weekly and would benefit from Yomi's precision and efficiency. ` +
           `Lead with improved patient outcomes and reduced chair time.`;
  }
  
  return `Dr. ${lastName}'s ${specialty} practice represents a high-value opportunity for ${productName}. ` +
         `Target their need for efficiency and patient outcomes. ` +
         `Lead with ROI and time savings specific to ${specialty} workflows.`;
}

function generateDefaultInsights(specialty: string): string[] {
  const specialtyInsights: Record<string, string[]> = {
    'oral surgery': [
      '📊 High-value procedures with surgical suite requirements',
      '💰 Average revenue per procedure: $3,000-$15,000',
      '⚡ Technology adoption leaders in dental field',
      '🎯 Decision maker: Usually the practice owner'
    ],
    'orthodontics': [
      '📊 High patient volume with recurring visits',
      '💰 Focus on efficiency and patient experience',
      '⚡ Early adopters of digital workflows',
      '🎯 Key metrics: chair time and case acceptance'
    ],
    'general dentistry': [
      '📊 Broad patient base requiring versatile solutions',
      '💰 Price-sensitive with focus on ROI',
      '⚡ Gradual technology adopters',
      '🎯 Staff buy-in crucial for implementation'
    ]
  };
  
  // Find matching specialty
  const key = Object.keys(specialtyInsights).find(k => 
    specialty.toLowerCase().includes(k)
  );
  
  return specialtyInsights[key || 'general dentistry'] || [
    '📊 Practice efficiency is top priority',
    '💰 ROI-focused decision making',
    '⚡ Growing interest in digital solutions',
    '🎯 Patient satisfaction drives purchases'
  ];
}

function generateDefaultPainPoints(specialty: string): string[] {
  if (specialty.toLowerCase().includes('oral')) {
    return [
      'Complex scheduling for surgical procedures',
      'Insurance pre-authorization delays',
      'Referral coordination challenges',
      'Inventory management for surgical supplies'
    ];
  } else if (specialty.toLowerCase().includes('orthodont')) {
    return [
      'Long treatment monitoring workflows',
      'Patient compliance tracking',
      'Digital impression integration',
      'Treatment planning efficiency'
    ];
  } else {
    return [
      'Time-consuming administrative tasks',
      'Patient communication gaps',
      'Insurance claim processing',
      'Staff training and retention'
    ];
  }
}

function generateDefaultValueProps(specialty: string, productName: string): string[] {
  // Yomi-specific value props
  if (productName.toLowerCase().includes('yomi')) {
    return [
      'Yomi provides haptic guidance for precise implant placement, reducing complications by up to 50%',
      'Real-time 3D navigation eliminates the need for surgical guides, saving $500-1000 per case',
      'Increased case acceptance with live visualization patients can understand'
    ];
  }
  
  return [
    `${productName} reduces chair time by 30% for ${specialty} procedures`,
    `Seamless integration with existing ${specialty} workflows`,
    `Proven ROI within 6 months for similar practices`
  ];
}

function generateDefaultObjections(): Record<string, string> {
  return {
    'Too expensive': 'Many practices see ROI within 3-6 months. Let me show you the numbers...',
    'Too busy': 'Implementation takes just 2 hours with our white-glove onboarding',
    'Happy with current': 'I understand. Many of our happiest customers said the same before seeing the time savings...',
    'Need to think': 'Of course. What specific concerns can I address to help your evaluation?'
  };
}

function generateDefaultEmail(doctorName: string, specialty: string, productName: string, location: string): any {
  const lastName = doctorName.split(' ').pop();
  
  // Yomi-specific email
  if (productName.toLowerCase().includes('yomi')) {
    return {
      subject: `Yomi Robot - Implant Precision in ${location}`,
      body: `Dr. ${lastName},

I noticed your oral surgery practice in ${location} and wanted to reach out about how Yomi is transforming implant placement for practices like yours.

Yomi's robotic guidance system is helping oral surgeons achieve sub-millimeter accuracy while reducing surgery time by 30%. Several practices in NY have eliminated surgical guides entirely, saving $500-1000 per case.

Would you be interested in seeing how Yomi could enhance your implant cases? I have a 10-minute case study video from a practice similar to yours.

Best regards,
[Your name]`
    };
  }
  
  return {
    subject: `${productName} for ${location} ${specialty}`,
    body: `Dr. ${lastName},

I work with ${specialty} practices in ${location} helping them save 5+ hours per week on administrative tasks.

${productName} specifically addresses the unique challenges of ${specialty} workflows, and I'd love to show you how practices like yours are seeing immediate improvements in efficiency.

Would you be open to a brief 15-minute call this week to explore if this could benefit your practice?

Best regards,
[Your name]`
  };
}

function generateDefaultSMS(doctorName: string, productName: string): string {
  const lastName = doctorName.split(' ').pop();
  
  if (productName.toLowerCase().includes('yomi')) {
    return `Hi Dr. ${lastName}, Yomi robot is helping NY oral surgeons place implants 30% faster with haptic guidance. Worth a quick chat? [Your name]`;
  }
  
  return `Hi Dr. ${lastName}, I help practices save 5+ hrs/week with ${productName}. Worth a quick chat? [Your name]`;
}

function generateDefaultLinkedIn(doctorName: string, specialty: string): string {
  const lastName = doctorName.split(' ').pop();
  return `Dr. ${lastName}, I noticed your ${specialty} practice and wanted to connect. I help similar practices improve efficiency and patient outcomes. Would love to share insights relevant to your specialty.`;
}