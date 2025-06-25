/**
 * Doctor Detection and NPI Lookup Integration
 * Detects doctor mentions in text and fetches their NPI information
 */

import { getApiEndpoint } from '../config/api';

export interface DoctorMention {
  fullName: string;
  firstName: string;
  lastName: string;
  title?: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export interface NPIDoctorInfo {
  npi: string;
  displayName: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  city: string;
  state: string;
  fullAddress: string;
  phone: string;
  organizationName: string;
}

// Common doctor titles and patterns
const DOCTOR_PATTERNS = [
  /\b(?:Dr\.?|Doctor)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)/gi,
  /\b([A-Z][a-z]+)\s+([A-Z][a-z]+),?\s+(?:MD|DO|DDS|DMD|DPM|OD|PharmD)/gi,
  /\bDr\.?\s+([A-Z][a-z]+)\s+(?:[A-Z]\.\s+)?([A-Z][a-z]+)/gi,
];

// Common first names to reduce false positives
const COMMON_FIRST_NAMES = new Set([
  'james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph',
  'thomas', 'charles', 'mary', 'patricia', 'jennifer', 'linda', 'elizabeth',
  'barbara', 'susan', 'jessica', 'sarah', 'karen'
]);

/**
 * Detects potential doctor mentions in text
 */
export function detectDoctorMentions(text: string): DoctorMention[] {
  const mentions: DoctorMention[] = [];
  const processedNames = new Set<string>();

  for (const pattern of DOCTOR_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const firstName = match[1];
      const lastName = match[2] || match[match.length - 1];
      const fullName = `${firstName} ${lastName}`;
      
      // Skip if already processed
      if (processedNames.has(fullName.toLowerCase())) continue;
      
      // Calculate confidence based on context
      let confidence = 0.5;
      
      // Boost confidence for common medical contexts
      const contextWindow = text.substring(
        Math.max(0, match.index - 50),
        Math.min(text.length, match.index + match[0].length + 50)
      );
      
      if (contextWindow.match(/\b(patient|practice|clinic|hospital|specialty|appointment|procedure)/i)) {
        confidence += 0.2;
      }
      
      if (COMMON_FIRST_NAMES.has(firstName.toLowerCase())) {
        confidence += 0.1;
      }
      
      if (match[0].includes('MD') || match[0].includes('DO') || match[0].includes('DDS')) {
        confidence += 0.2;
      }
      
      mentions.push({
        fullName,
        firstName,
        lastName,
        title: match[0].includes('Dr') ? 'Dr.' : undefined,
        confidence: Math.min(confidence, 1),
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
      
      processedNames.add(fullName.toLowerCase());
    }
  }
  
  return mentions.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Looks up doctor information from NPI registry
 */
export async function lookupDoctorNPI(
  firstName: string, 
  lastName: string,
  state?: string
): Promise<NPIDoctorInfo[]> {
  try {
    const params = new URLSearchParams({
      search: `${firstName} ${lastName}${state ? ' ' + state : ''}`
    });
    
    const response = await fetch(`${getApiEndpoint('npiLookup')}?${params}`);
    
    if (!response.ok) {
      throw new Error('NPI lookup failed');
    }
    
    const doctors = await response.json();
    return doctors;
  } catch (error) {
    console.error('NPI lookup error:', error);
    return [];
  }
}

/**
 * Finds the best matching doctor from NPI results
 */
export function findBestMatch(
  mention: DoctorMention,
  npiResults: NPIDoctorInfo[]
): NPIDoctorInfo | null {
  if (npiResults.length === 0) return null;
  
  // Score each result based on name similarity
  const scored = npiResults.map(doctor => {
    let score = 0;
    
    // Exact name match
    if (doctor.firstName.toLowerCase() === mention.firstName.toLowerCase()) score += 2;
    if (doctor.lastName.toLowerCase() === mention.lastName.toLowerCase()) score += 2;
    
    // Partial matches
    if (doctor.firstName.toLowerCase().startsWith(mention.firstName.toLowerCase())) score += 1;
    if (doctor.lastName.toLowerCase().startsWith(mention.lastName.toLowerCase())) score += 1;
    
    return { doctor, score };
  });
  
  // Sort by score and return best match
  scored.sort((a, b) => b.score - a.score);
  
  // Only return if score is high enough
  return scored[0].score >= 3 ? scored[0].doctor : null;
}

/**
 * Enriches text with doctor information
 */
export function enrichTextWithDoctorInfo(
  text: string,
  doctorInfo: Map<string, NPIDoctorInfo>
): string {
  let enrichedText = text;
  
  // Sort mentions by position (reverse order to maintain indices)
  const mentions = detectDoctorMentions(text).sort((a, b) => b.startIndex - a.startIndex);
  
  for (const mention of mentions) {
    const doctor = doctorInfo.get(mention.fullName);
    if (doctor) {
      const replacement = `${mention.fullName} (${doctor.specialty}, ${doctor.city}, ${doctor.state})`;
      enrichedText = 
        enrichedText.substring(0, mention.startIndex) +
        replacement +
        enrichedText.substring(mention.endIndex);
    }
  }
  
  return enrichedText;
}

/**
 * Generates sales context based on doctor information
 */
export function generateDoctorSalesContext(doctor: NPIDoctorInfo): string {
  const contexts: string[] = [];
  
  // Specialty-specific context
  if (doctor.specialty.toLowerCase().includes('dermatology')) {
    contexts.push('Focus on aesthetic procedures like Botox, fillers, and laser treatments');
  } else if (doctor.specialty.toLowerCase().includes('plastic')) {
    contexts.push('Emphasize comprehensive aesthetic solutions and combination treatments');
  } else if (doctor.specialty.toLowerCase().includes('dental')) {
    contexts.push('Highlight dental aesthetics and practice enhancement opportunities');
  }
  
  // Location context
  if (doctor.city) {
    contexts.push(`Consider local market dynamics in ${doctor.city}, ${doctor.state}`);
  }
  
  // Organization context
  if (doctor.organizationName) {
    contexts.push(`Part of ${doctor.organizationName} - consider group practice dynamics`);
  }
  
  return contexts.join('. ');
}