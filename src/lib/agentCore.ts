/**
 * Agent Core System
 * Builds system prompts and manages agent behavior with NPI integration
 */

import type { NPIDoctorInfo } from './doctorDetection';

export interface AgentPersonality {
  tone: string;
  traits: string[];
  expertise: string[];
  communication_style: string;
}

export interface AgentContext {
  agentName: string;
  agentSpecialty: string[];
  personality: AgentPersonality;
  procedure?: {
    name: string;
    type: string;
    details?: unknown;
  };
  doctors?: NPIDoctorInfo[];
  conversationHistory?: Array<{ role: string; content: string; timestamp?: string }>;
  userProfile?: Record<string, unknown>;
}

/**
 * Builds the system prompt for an AI agent with doctor context
 */
export function buildSystemPrompt(context: AgentContext): string {
  const { agentName, agentSpecialty, personality, procedure, doctors, userProfile } = context;
  
  let prompt = `You are ${agentName}, a specialized AI sales representative for aesthetic and dental medical devices.

## Your Expertise
${agentSpecialty.map(s => `- ${s}`).join('\n')}

## Your Personality
- Communication style: ${personality.communication_style}
- Key traits: ${personality.traits.join(', ')}
- Tone: ${personality.tone}

## Core Capabilities
1. **Doctor Intelligence**: You can detect when doctors are mentioned and automatically look up their NPI information
2. **Contextual Sales Advice**: Provide tailored sales strategies based on doctor specialties and practice types
3. **Market Insights**: Share relevant market data and competitive intelligence
4. **Relationship Building**: Help build and maintain relationships with healthcare providers

## Doctor Detection Protocol
When a doctor's name is mentioned:
1. Acknowledge the mention naturally in conversation
2. If NPI data is available, incorporate relevant details (specialty, location) seamlessly
3. Provide sales insights specific to that doctor's practice type
4. Suggest relevant procedures or products for their specialty
5. Never display raw NPI numbers or technical data unless specifically requested

## Response Guidelines
- Be conversational and professional
- Use the doctor's proper title (Dr. LastName) when referring to them
- Provide actionable sales advice
- Reference specific products/procedures when relevant
- Maintain HIPAA compliance - never share patient information`;

  // Add procedure context if available
  if (procedure) {
    prompt += `\n\n## Current Focus Procedure
- Procedure: ${procedure.name}
- Type: ${procedure.type}
- You should relate discussions back to this procedure when relevant`;
  }

  // Add doctor context if available
  if (doctors && doctors.length > 0) {
    prompt += `\n\n## Known Healthcare Providers in This Conversation`;
    doctors.forEach(doctor => {
      prompt += `\n\n### ${doctor.displayName}
- Specialty: ${doctor.specialty}
- Location: ${doctor.city}, ${doctor.state}
- Organization: ${doctor.organizationName || 'Private Practice'}`;
      
      // Add specialty-specific insights
      prompt += `\n- Sales Focus: ${getDoctorSalesFocus(doctor)}`;
    });
  }

  // Add user profile context
  if (userProfile) {
    prompt += `\n\n## Sales Rep Profile
- Territory: ${userProfile.territory || 'Not specified'}
- Experience Level: ${userProfile.experience || 'Not specified'}
- Current Goals: ${userProfile.goals || 'Build relationships and increase sales'}`;
  }

  prompt += `\n\n## Important Reminders
- Always maintain a helpful, professional demeanor
- Provide specific, actionable advice
- Use data and examples when possible
- Build trust through expertise and reliability`;

  return prompt;
}

/**
 * Generates doctor-specific sales focus based on specialty
 */
function getDoctorSalesFocus(doctor: NPIDoctorInfo): string {
  const specialty = doctor.specialty.toLowerCase();
  
  const focusMap: Record<string, string> = {
    'dermatology': 'Aesthetic procedures (Botox, fillers, laser treatments), skin rejuvenation technologies',
    'plastic surgery': 'Comprehensive aesthetic solutions, advanced surgical equipment, combination treatments',
    'dentistry': 'Cosmetic dentistry solutions, practice growth tools, patient comfort technologies',
    'oral surgery': 'Surgical equipment, bone grafting materials, advanced imaging systems',
    'family medicine': 'Entry-level aesthetic treatments, practice diversification opportunities',
    'internal medicine': 'Age management solutions, wellness aesthetics, preventive treatments',
    'ophthalmology': 'Periocular aesthetics, dry eye treatments, cosmetic eye procedures',
    'otolaryngology': 'Facial aesthetics, rhinoplasty support tools, minimally invasive procedures',
    'facial plastic surgery': 'Premium aesthetic devices, advanced injection techniques, combination therapies'
  };

  // Find matching focus
  for (const [key, focus] of Object.entries(focusMap)) {
    if (specialty.includes(key)) {
      return focus;
    }
  }

  // Default focus
  return 'General aesthetic and medical device solutions';
}

/**
 * Processes a message to extract doctor mentions and insights
 */
export function processMessageForInsights(
  message: string, 
  doctors: NPIDoctorInfo[]
): Array<{action: string, title: string, message: string, data: unknown}> {
  const insights = [];
  const lowerMessage = message.toLowerCase();

  // Check for doctor research opportunities
  if (lowerMessage.includes('tell me about') || lowerMessage.includes('what do you know about')) {
    const doctorMentioned = doctors.find(doc => 
      lowerMessage.includes(doc.lastName.toLowerCase()) || 
      lowerMessage.includes(doc.firstName.toLowerCase())
    );
    
    if (doctorMentioned) {
      insights.push({
        action: 'research_doctor',
        title: 'Deep Research Available',
        message: `Get comprehensive insights about ${doctorMentioned.displayName}'s practice`,
        data: { doctorName: doctorMentioned.displayName, npi: doctorMentioned.npi }
      });
    }
  }

  // Check for sales strategy requests
  if (lowerMessage.includes('approach') || lowerMessage.includes('strategy') || lowerMessage.includes('pitch')) {
    doctors.forEach(doctor => {
      insights.push({
        action: 'show_sales_playbook',
        title: `Sales Playbook: ${doctor.specialty}`,
        message: `View tailored strategies for ${doctor.displayName}`,
        data: { doctor, specialty: doctor.specialty }
      });
    });
  }

  // Check for competitive analysis needs
  if (lowerMessage.includes('competitor') || lowerMessage.includes('other reps') || lowerMessage.includes('market share')) {
    insights.push({
      action: 'competitive_analysis',
      title: 'Competitive Intelligence',
      message: 'Analyze competitor presence in this territory',
      data: { doctors: doctors.map(d => ({ name: d.displayName, location: `${d.city}, ${d.state}` })) }
    });
  }

  return insights;
}

/**
 * Enhances agent responses with doctor context
 */
export function enhanceResponseWithDoctorContext(
  response: string,
  doctors: NPIDoctorInfo[]
): string {
  if (doctors.length === 0) return response;

  // Add contextual information at the end if relevant
  const specialties = [...new Set(doctors.map(d => d.specialty))].join(', ');

  // Check if response mentions any doctors
  const mentionsDoctor = doctors.some(doctor => 
    response.includes(doctor.lastName) || 
    response.includes(doctor.displayName)
  );

  if (mentionsDoctor && !response.includes('specialty') && !response.includes('located in')) {
    response += `\n\n*For your reference: The healthcare providers mentioned specialize in ${specialties}.*`;
  }

  return response;
}

/**
 * Generates doctor-aware conversation starters
 */
export function generateDoctorAwareStarters(doctors: NPIDoctorInfo[]): string[] {
  if (doctors.length === 0) {
    return [
      "Tell me about a doctor you'd like to connect with",
      "Which healthcare providers are you targeting this quarter?",
      "Do you have any upcoming appointments with doctors?",
      "What specialties are you focusing on?"
    ];
  }

  const starters: string[] = [];
  
  doctors.forEach(doctor => {
    starters.push(
      `How can I help you prepare for ${doctor.displayName}?`,
      `Would you like strategies specific to ${doctor.specialty} practices?`,
      `What products are you positioning for ${doctor.displayName}'s practice?`
    );
  });

  starters.push(
    "Are there other doctors in this area you're working with?",
    "How can I help you expand in this territory?"
  );

  return starters.slice(0, 4); // Return top 4 starters
}