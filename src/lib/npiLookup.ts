/**
 * NPI Lookup Service for Agent System
 * Provides real-time doctor identification via NPI Registry
 */

import { getApiEndpoint } from '../config/api';

export interface NPIDoctor {
  npi: string;
  displayName: string;
  firstName: string;
  lastName: string;
  credential: string;
  specialty: string;
  address: string;
  city: string;
  state: string;
  fullAddress: string;
  phone: string;
  organizationName: string;
}

/**
 * Search for doctors by name using the NPI Registry
 */
export async function searchDoctorsByName(searchTerm: string): Promise<NPIDoctor[]> {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

  try {
    const response = await fetch(`${getApiEndpoint('npiLookup')}?search=${encodeURIComponent(searchTerm)}`);
    
    if (!response.ok) {
      throw new Error('Failed to search NPI registry');
    }

    const doctors = await response.json();
    return doctors;
  } catch (error) {
    console.error('NPI lookup error:', error);
    return [];
  }
}

/**
 * Get a specific doctor by NPI number
 */
export async function getDoctorByNPI(npi: string): Promise<NPIDoctor | null> {
  if (!npi) {
    return null;
  }

  try {
    const response = await fetch(`${getApiEndpoint('npiLookup')}?npi=${encodeURIComponent(npi)}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch doctor by NPI');
    }

    const doctors = await response.json();
    return doctors.length > 0 ? doctors[0] : null;
  } catch (error) {
    console.error('NPI lookup error:', error);
    return null;
  }
}

/**
 * Extract doctor name from user message using NLP patterns
 */
export function extractDoctorName(message: string): string | null {
  // Common patterns for doctor mentions
  const patterns = [
    /(?:dr\.?|doctor)\s+([a-z]+(?:\s+[a-z]+)?)/i,
    /talking (?:to|with|about)\s+(?:dr\.?|doctor)?\s*([a-z]+(?:\s+[a-z]+)?)/i,
    /(?:for|about|with)\s+([a-z]+(?:\s+[a-z]+)?)\s*(?:md|dds|do)/i,
    /([a-z]+(?:\s+[a-z]+)?),?\s*(?:md|dds|do)/i
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Smart doctor identification from conversation context
 */
export async function identifyDoctorFromContext(
  message: string,
  previousContext?: { doctorNPI?: string; doctorName?: string }
): Promise<NPIDoctor | null> {
  // Check if we already have a doctor in context
  if (previousContext?.doctorNPI) {
    const doctor = await getDoctorByNPI(previousContext.doctorNPI);
    if (doctor) {
      return doctor;
    }
  }

  // Try to extract doctor name from message
  const extractedName = extractDoctorName(message);
  if (extractedName) {
    const doctors = await searchDoctorsByName(extractedName);
    if (doctors.length === 1) {
      // Single match - high confidence
      return doctors[0];
    } else if (doctors.length > 1) {
      // Multiple matches - need disambiguation
      // For now, return the first match, but in a real implementation
      // you'd want to ask the user to clarify
      return doctors[0];
    }
  }

  return null;
}

/**
 * Format doctor information for agent display
 */
export function formatDoctorInfo(doctor: NPIDoctor): string {
  const parts = [
    doctor.displayName,
    doctor.specialty !== 'Not specified' ? `(${doctor.specialty})` : '',
    doctor.organizationName ? `at ${doctor.organizationName}` : '',
    doctor.city && doctor.state ? `in ${doctor.city}, ${doctor.state}` : ''
  ].filter(Boolean);

  return parts.join(' ');
}