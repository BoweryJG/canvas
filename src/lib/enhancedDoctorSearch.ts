/**
 * Enhanced Doctor Search System
 * Intelligently finds doctor websites using procedure-aware search logic
 */

import { callBraveSearch } from './apiEndpoints';
import { findProcedureByName, getSpecialtySearchTerms } from './procedureDatabase';
import type { DentalProcedure, AestheticProcedure } from './procedureDatabase';

export interface EnhancedSearchResult {
  url: string;
  title: string;
  description: string;
  confidence: number;
  signals: string[];
  type: 'practice' | 'profile' | 'directory' | 'social';
  preview?: string;
}

/**
 * Enhanced doctor website search with procedure awareness
 */
export async function findDoctorWebsite(
  doctorName: string,
  city: string,
  state: string,
  productName?: string,
  userId?: string
): Promise<EnhancedSearchResult[]> {
  console.log(`🔍 Enhanced search for Dr. ${doctorName} in ${city}, ${state}`);
  
  // Clean inputs
  const cleanName = doctorName.replace(/^Dr\.?\s*/i, '').trim();
  const firstName = cleanName.split(' ')[0];
  const lastName = cleanName.split(' ').slice(-1)[0];
  
  // Get procedure intelligence if product provided
  let procedure: DentalProcedure | AestheticProcedure | null = null;
  let specialtyTerms: string[] = [];
  
  if (productName) {
    procedure = await findProcedureByName(productName);
    if (procedure) {
      specialtyTerms = getSpecialtySearchTerms(procedure);
      console.log(`📊 Found procedure data:`, procedure.name, specialtyTerms);
    }
  }
  
  // Build intelligent search queries
  const queries = buildSmartQueries(
    cleanName,
    firstName,
    lastName,
    city,
    state,
    specialtyTerms,
    procedure
  );
  
  // Execute searches in parallel
  const allResults: EnhancedSearchResult[] = [];
  
  for (const query of queries) {
    try {
      console.log(`🔎 Searching: ${query}`);
      const results = await callBraveSearch(query, 10, userId);
      
      if (results.web?.results) {
        for (const result of results.web.results) {
          const classified = classifyAndScoreResult(
            result,
            cleanName,
            firstName,
            lastName,
            city,
            state,
            specialtyTerms
          );
          
          // Only include high-confidence results
          if (classified.confidence > 30) {
            allResults.push(classified);
          }
        }
      }
    } catch (error) {
      console.error(`Search failed for query: ${query}`, error);
    }
  }
  
  // Sort by confidence and deduplicate
  const uniqueResults = deduplicateResults(allResults);
  return uniqueResults.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Build smart search queries based on specialty and location
 */
function buildSmartQueries(
  fullName: string,
  _firstName: string,
  lastName: string,
  city: string,
  state: string,
  specialtyTerms: string[],
  procedure: DentalProcedure | AestheticProcedure | null
): string[] {
  const queries: string[] = [];
  
  // Query 1: Direct practice website search
  queries.push(`"${fullName}" ${city} ${state} practice website -healthgrades -vitals -zocdoc -yelp`);
  
  // Query 2: "Meet Dr" pattern (very common on practice sites)
  queries.push(`"meet dr ${lastName}" ${city} ${state} -directory`);
  queries.push(`"about dr ${fullName}" ${city} -healthgrades`);
  
  // Query 3: Specialty-specific searches
  if (specialtyTerms.length > 0) {
    const mainSpecialty = specialtyTerms[0];
    queries.push(`"${fullName}" ${mainSpecialty} ${city} ${state}`);
    queries.push(`"dr ${lastName}" ${mainSpecialty} practice ${city}`);
  }
  
  // Query 4: Credential-based searches
  if (procedure?.specialty?.includes('dental') || procedure?.specialty?.includes('oral')) {
    queries.push(`"${fullName} DDS" ${city} ${state}`);
    queries.push(`"${fullName} DMD" ${city} dental practice`);
  } else if (procedure?.specialty?.includes('plastic') || procedure?.specialty?.includes('dermat')) {
    queries.push(`"${fullName} MD" ${city} ${state} cosmetic`);
    queries.push(`"dr ${fullName}" aesthetic practice ${city}`);
  }
  
  // Query 5: Location-specific patterns
  queries.push(`${lastName} ${specialtyTerms[0] || 'doctor'} ${city} ${state}`);
  
  // Query 6: Social media (often has practice info)
  queries.push(`"${fullName}" ${city} facebook practice page`);
  queries.push(`"dr ${lastName}" instagram ${city} ${specialtyTerms[0] || ''}`);
  
  return queries.slice(0, 6); // Limit to 6 queries
}

/**
 * Classify and score search results
 */
function classifyAndScoreResult(
  result: any,
  fullName: string,
  _firstName: string,
  lastName: string,
  city: string,
  state: string,
  specialtyTerms: string[]
): EnhancedSearchResult {
  const url = result.url.toLowerCase();
  const title = (result.title || '').toLowerCase();
  const description = (result.description || '').toLowerCase();
  
  let confidence = 0;
  const signals: string[] = [];
  let type: 'practice' | 'profile' | 'directory' | 'social' = 'directory';
  
  // Instant disqualifiers (directories)
  const directories = [
    'healthgrades', 'vitals', 'zocdoc', 'yelp', 'yellowpages',
    'webmd', 'realself', 'ratemds', 'sharecare', 'castle'
  ];
  
  if (directories.some(d => url.includes(d))) {
    return {
      url: result.url,
      title: result.title,
      description: result.description,
      confidence: 10,
      signals: ['directory'],
      type: 'directory'
    };
  }
  
  // High-value patterns for practice websites
  const practicePatterns = [
    { pattern: /meet.*dr|about.*dr|our.*doctor|our.*team/i, points: 40, signal: 'meet_doctor_page' },
    { pattern: /dr.*kissel|kissel.*dr/i, points: 30, signal: 'doctor_name_in_url' },
    { pattern: /implant.*periodontist|periodontal.*implant/i, points: 35, signal: 'specialty_match' },
    { pattern: new RegExp(`${lastName}.*${city}|${city}.*${lastName}`, 'i'), points: 25, signal: 'location_name_match' },
    { pattern: /\.com\/(meet|about|doctor|team|staff)/i, points: 30, signal: 'practice_url_pattern' }
  ];
  
  // Check URL patterns
  for (const { pattern, points, signal } of practicePatterns) {
    if (pattern.test(url)) {
      confidence += points;
      signals.push(signal);
      type = 'practice';
    }
  }
  
  // Check title patterns
  if (title.includes(lastName.toLowerCase()) || title.includes(fullName.toLowerCase())) {
    confidence += 20;
    signals.push('name_in_title');
  }
  
  if (title.includes(city.toLowerCase()) || title.includes(state.toLowerCase())) {
    confidence += 15;
    signals.push('location_in_title');
  }
  
  // Check for specialty terms
  for (const term of specialtyTerms) {
    if (title.includes(term.toLowerCase()) || url.includes(term.toLowerCase())) {
      confidence += 10;
      signals.push(`specialty_${term}`);
      break;
    }
  }
  
  // Social media classification
  if (url.includes('facebook.com') || url.includes('instagram.com')) {
    type = 'social';
    if (title.includes('practice') || title.includes('clinic') || title.includes(lastName.toLowerCase())) {
      confidence = 60;
      signals.push('official_social_page');
    } else {
      confidence = 30;
      signals.push('social_media');
    }
  }
  
  // LinkedIn is often good for verification
  if (url.includes('linkedin.com')) {
    type = 'profile';
    confidence = 50;
    signals.push('linkedin_profile');
  }
  
  // Custom domain bonus
  if (!url.includes('.wix') && !url.includes('.squarespace') && 
      !url.includes('.wordpress') && type === 'practice') {
    confidence += 10;
    signals.push('custom_domain');
  }
  
  // Extract preview if description contains useful info
  let preview = description;
  if (description.includes('meet') || description.includes('about')) {
    preview = description.substring(0, 200) + '...';
  }
  
  return {
    url: result.url,
    title: result.title,
    description: result.description,
    confidence: Math.min(confidence, 100),
    signals,
    type,
    preview
  };
}

/**
 * Deduplicate results by domain
 */
function deduplicateResults(results: EnhancedSearchResult[]): EnhancedSearchResult[] {
  const seen = new Map<string, EnhancedSearchResult>();
  
  for (const result of results) {
    try {
      const domain = new URL(result.url).hostname.replace('www.', '');
      const existing = seen.get(domain);
      
      // Keep the higher confidence result
      if (!existing || result.confidence > existing.confidence) {
        seen.set(domain, result);
      }
    } catch {
      // Invalid URL, skip
    }
  }
  
  return Array.from(seen.values());
}