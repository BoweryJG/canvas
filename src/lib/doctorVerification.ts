/**
 * Doctor Verification System - Quick identity confirmation
 * Uses Brave Search + optional Firecrawl for fast verification
 */

import { callBraveSearch } from './apiEndpoints';

interface VerificationResult {
  name: string;
  specialty: string;
  practice: string;
  location: string;
  website: string;
  phone: string;
  confidence: number;
  additionalInfo: string;
  sources: Array<{
    name: string;
    url: string;
    type: 'directory' | 'website' | 'review';
  }>;
  rawData: any; // Store raw search data for later synthesis
}

export async function verifyDoctor(doctorName: string, location?: string): Promise<VerificationResult> {
  // Quick targeted search for verification
  const searchQuery = location 
    ? `"Dr. ${doctorName}" "${location}" practice contact website`
    : `"Dr. ${doctorName}" practice contact website phone`;
  
  const results = await callBraveSearch(searchQuery, 8);
  
  // Extract verification data
  const profile = extractVerificationData(results.web?.results || [], doctorName, location);
  
  // If we have a good match, try to get website content
  if (profile.confidence > 70 && profile.website) {
    try {
      await enhanceWithWebsiteData(profile);
    } catch (error) {
      console.log('Website enhancement failed, using search data only');
    }
  }
  
  return profile;
}

function extractVerificationData(results: any[], doctorName: string, location?: string): VerificationResult {
  const profile: VerificationResult = {
    name: doctorName,
    specialty: '',
    practice: '',
    location: location || '',
    website: '',
    phone: '',
    confidence: 0,
    additionalInfo: '',
    sources: [],
    rawData: results
  };
  
  let totalConfidence = 0;
  let matchCount = 0;
  
  results.forEach(result => {
    const text = `${result.title} ${result.description}`.toLowerCase();
    const url = result.url.toLowerCase();
    
    // Check if this result is about our doctor
    if (!isRelevantResult(text, doctorName, location)) return;
    
    matchCount++;
    
    // Extract practice information
    if (!profile.practice) {
      profile.practice = extractPracticeInfo(result.title, result.description);
    }
    
    // Extract specialty
    if (!profile.specialty) {
      profile.specialty = extractSpecialty(text);
    }
    
    // Extract location if not provided
    if (!profile.location) {
      profile.location = extractLocation(text);
    }
    
    // Extract contact info
    if (!profile.phone) {
      profile.phone = extractPhone(text);
    }
    
    // Extract website (prefer practice websites over directories)
    if (!profile.website || (profile.website.includes('healthgrades') && !url.includes('healthgrades'))) {
      const website = extractWebsite(result.url, text);
      if (website) profile.website = website;
    }
    
    // Determine source type and add to sources
    const sourceType = getSourceType(url);
    profile.sources.push({
      name: getSourceName(url),
      url: result.url,
      type: sourceType
    });
    
    // Calculate confidence for this result
    const resultConfidence = calculateResultConfidence(text, url, doctorName, location);
    totalConfidence += resultConfidence;
  });
  
  // Overall confidence based on matches and data completeness
  if (matchCount > 0) {
    profile.confidence = Math.min(
      Math.round(totalConfidence / matchCount) + 
      (profile.practice ? 10 : 0) +
      (profile.website && !profile.website.includes('healthgrades') ? 15 : 0) +
      (profile.phone ? 5 : 0) +
      (profile.location ? 5 : 0),
      95
    );
  }
  
  // Generate additional context
  profile.additionalInfo = generateAdditionalInfo(profile, results);
  
  return profile;
}

function isRelevantResult(text: string, doctorName: string, location?: string): boolean {
  const nameWords = doctorName.toLowerCase().split(' ');
  const hasName = nameWords.every(word => text.includes(word));
  
  if (!hasName) return false;
  
  // Must include medical indicators
  const medicalTerms = ['doctor', 'dr.', 'md', 'dds', 'practice', 'medical', 'dental', 'physician'];
  const hasMedicalContext = medicalTerms.some(term => text.includes(term));
  
  if (!hasMedicalContext) return false;
  
  // If location provided, prefer results that mention it
  if (location) {
    return text.includes(location.toLowerCase());
  }
  
  return true;
}

function extractPracticeInfo(title: string, description: string): string {
  const fullText = `${title} ${description}`;
  
  // Common practice name patterns
  const patterns = [
    // "Dr. Name - Practice Name"
    /(?:dr\.?\s+\w+(?:\s+\w+)*)\s*[-–—]\s*([^|,\n]+(?:medical|dental|health|clinic|center|associates|group|practice|partners))/gi,
    // "Practice Name - Dr. Name"
    /^([^-|,\n]+(?:medical|dental|health|clinic|center|associates|group|practice|partners))\s*[-–—]/gi,
    // Practice in title
    /^([^-|,\n]+(?:medical|dental|health|clinic|center|associates|group|practice|partners))/gi,
    // "at Practice Name"
    /(?:at|with|of)\s+([^,\.\n]+(?:medical|dental|health|clinic|center|associates|group|practice|partners))/gi
  ];
  
  for (const pattern of patterns) {
    const match = fullText.match(pattern);
    if (match) {
      return match[1].trim().replace(/^\w+\s+/, ''); // Remove leading "Dr." if present
    }
  }
  
  return '';
}

function extractSpecialty(text: string): string {
  const specialties = [
    { patterns: ['general dentistry', 'general dentist', 'dentist', 'dental'], name: 'General Dentistry' },
    { patterns: ['orthodontist', 'orthodontics'], name: 'Orthodontics' },
    { patterns: ['oral surgeon', 'oral surgery'], name: 'Oral Surgery' },
    { patterns: ['periodontist', 'periodontics'], name: 'Periodontics' },
    { patterns: ['endodontist', 'endodontics'], name: 'Endodontics' },
    { patterns: ['cardiologist', 'cardiology'], name: 'Cardiology' },
    { patterns: ['dermatologist', 'dermatology'], name: 'Dermatology' },
    { patterns: ['neurologist', 'neurology'], name: 'Neurology' },
    { patterns: ['orthopedic', 'orthopedist'], name: 'Orthopedics' },
    { patterns: ['pediatrician', 'pediatrics'], name: 'Pediatrics' },
    { patterns: ['family medicine', 'family practice'], name: 'Family Medicine' },
    { patterns: ['internal medicine', 'internist'], name: 'Internal Medicine' },
    { patterns: ['psychiatrist', 'psychiatry'], name: 'Psychiatry' },
    { patterns: ['ophthalmologist', 'ophthalmology'], name: 'Ophthalmology' },
    { patterns: ['urologist', 'urology'], name: 'Urology' }
  ];
  
  for (const specialty of specialties) {
    if (specialty.patterns.some(pattern => text.includes(pattern))) {
      return specialty.name;
    }
  }
  
  return '';
}

function extractLocation(text: string): string {
  // City, State patterns
  const patterns = [
    /(?:in|located in|serving|of|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/g,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,\s*[A-Z]{2})/g
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1] || match[0];
    }
  }
  
  return '';
}

function extractPhone(text: string): string {
  const phonePattern = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/g;
  const match = text.match(phonePattern);
  return match ? match[0] : '';
}

function extractWebsite(url: string, text: string): string {
  // If the URL itself is a practice website (not a directory)
  if (!url.includes('healthgrades') && 
      !url.includes('vitals.com') && 
      !url.includes('webmd.com') &&
      !url.includes('zocdoc.com') &&
      !url.includes('yellowpages') &&
      (url.includes('.com') || url.includes('.org'))) {
    return url;
  }
  
  // Look for website mentions in text
  const websitePattern = /(?:website|visit|www\.)[\s:]*([a-zA-Z0-9.-]+\.(?:com|org|net|health))/i;
  const match = text.match(websitePattern);
  if (match) {
    const site = match[1];
    return site.startsWith('www.') ? `https://${site}` : `https://www.${site}`;
  }
  
  return '';
}

function getSourceType(url: string): 'directory' | 'website' | 'review' {
  if (url.includes('healthgrades') || 
      url.includes('vitals.com') || 
      url.includes('webmd.com') ||
      url.includes('zocdoc.com')) {
    return 'directory';
  }
  
  if (url.includes('review') || url.includes('rating')) {
    return 'review';
  }
  
  return 'website';
}

function getSourceName(url: string): string {
  if (url.includes('healthgrades')) return 'Healthgrades';
  if (url.includes('vitals.com')) return 'Vitals';
  if (url.includes('webmd.com')) return 'WebMD';
  if (url.includes('zocdoc.com')) return 'Zocdoc';
  
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return 'Medical Directory';
  }
}

function calculateResultConfidence(text: string, url: string, doctorName: string, location?: string): number {
  let confidence = 50;
  
  // Exact name match
  if (text.includes(doctorName.toLowerCase())) {
    confidence += 20;
  }
  
  // Location match
  if (location && text.includes(location.toLowerCase())) {
    confidence += 15;
  }
  
  // Professional directory
  if (url.includes('healthgrades') || url.includes('vitals')) {
    confidence += 10;
  }
  
  // Practice website
  if (!url.includes('healthgrades') && !url.includes('vitals') && url.includes('.com')) {
    confidence += 15;
  }
  
  // Contact information present
  if (text.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) {
    confidence += 5;
  }
  
  return Math.min(confidence, 90);
}

function generateAdditionalInfo(profile: VerificationResult, results: any[]): string {
  const info: string[] = [];
  
  if (profile.sources.length > 0) {
    const directorySources = profile.sources.filter(s => s.type === 'directory').length;
    if (directorySources > 0) {
      info.push(`Listed on ${directorySources} professional director${directorySources > 1 ? 'ies' : 'y'}`);
    }
    
    const websiteSources = profile.sources.filter(s => s.type === 'website').length;
    if (websiteSources > 0) {
      info.push(`Has active web presence`);
    }
  }
  
  // Extract any additional relevant details from the first result
  if (results.length > 0) {
    const firstResult = results[0];
    const description = firstResult.description;
    
    // Look for years of experience, education, etc.
    const yearsMatch = description.match(/(\d+)\s*years?\s*(?:of\s*)?(?:experience|practicing)/i);
    if (yearsMatch) {
      info.push(`${yearsMatch[1]} years of experience`);
    }
    
    const educationMatch = description.match(/(university|college|school)\s+of\s+[^,\.\n]+/gi);
    if (educationMatch) {
      info.push(`Educated at ${educationMatch[0]}`);
    }
  }
  
  return info.join(' • ');
}

async function enhanceWithWebsiteData(_profile: VerificationResult): Promise<void> {
  // Optional: Use Firecrawl to get more detailed website information
  // This would require calling the Firecrawl API
  // For now, we'll enhance with the search data we already have
  
  try {
    // You could implement Firecrawl scraping here for even more detailed info
    // const websiteData = await firecrawlScrape(profile.website);
    // But for speed, we'll rely on search results
    console.log('Website enhancement available but skipped for speed');
  } catch (error) {
    // Fail silently, search data is sufficient for verification
  }
}