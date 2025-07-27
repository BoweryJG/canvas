// @ts-nocheck
/**
 * @deprecated Use unifiedCanvasResearch() from './unifiedCanvasResearch' instead
 * 
 * Enhanced NPI-based Research System
 * Pulls comprehensive data including website, reviews, credentials, and more
 * 
 * MIGRATION NOTICE:
 * This file is deprecated. Please use:
 * import { unifiedCanvasResearch } from './unifiedCanvasResearch';
 */

import { callBraveSearch } from './apiEndpoints';
import { callClaude } from './apiEndpoints';
import { type ResearchData, type ResearchSource } from './webResearch';
import { type Doctor } from '../components/DoctorAutocomplete';

// Interfaces for enhanced research data
interface PracticeWebsiteData {
  website: string;
  phone: string;
  email: string;
  sources: ResearchSource[];
}

interface ReviewData {
  averageRating?: number;
  totalReviews: number;
  commonPraise: string[];
  commonConcerns: string[];
  recentFeedback: string[];
  sources: ResearchSource[];
}

interface CredentialsData {
  credential: string;
  specialty: string;
  npi: string;
  verified: boolean;
  boardCertifications?: string[];
  education?: string[];
  sources?: ResearchSource[];
  medicalSchool?: string | null;
  residency?: string | null;
  yearsExperience?: number | null;
  hospitalAffiliations?: string[];
}

interface BusinessIntelData {
  practiceType: string;
  patientVolume: string;
  marketPosition: string;
  recentNews: string[];
  growthIndicators: string[];
  estimatedRevenue?: string;
  techAdoption?: string;
  technologyAdoption?: string;
  practiceSize?: string;
  sources?: ResearchSource[];
}

interface AdditionalInfoData {
  technology: string[];
  professionalActivities: string[];
  recentNews: string[];
}

interface SynthesisData {
  doctor: Doctor;
  practiceWebsite: PracticeWebsiteData;
  reviews: ReviewData;
  credentials: CredentialsData;
  businessIntel: BusinessIntelData;
  additionalInfo: AdditionalInfoData;
}

interface SearchResult {
  url?: string;
  title?: string;
  description?: string;
}

interface BraveSearchResponse {
  web?: {
    results?: SearchResult[];
  };
}

// Helper to safely parse AI JSON responses
function parseAIResponse(response: unknown): unknown {
  if (typeof response !== 'string') return response;
  
  // Clean markdown code blocks if present
  let cleanResponse = response;
  if (response.includes('```')) {
    cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
  }
  
  // Remove any leading text before the JSON
  const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanResponse = jsonMatch[0];
  }
  
  return JSON.parse(cleanResponse);
}

export async function conductNPIEnhancedResearch(
  doctor: Doctor,
  _product: string
): Promise<ResearchData> {
  console.log('🔬 Starting NPI-enhanced comprehensive research for:', doctor.displayName);
  
  let practiceWebsite, reviews, credentials, businessIntel, additionalInfo;
  
  try {
    // Parallel research for all data points - but handle errors individually
    const results = await Promise.allSettled([
      findPracticeWebsite(doctor),
      gatherReviews(doctor),
      validateCredentials(doctor),
      gatherBusinessIntelligence(doctor),
      searchAdditionalInfo(doctor)
    ]);
    
    // Extract results, using defaults for any failures
    practiceWebsite = results[0].status === 'fulfilled' ? results[0].value : { website: '', phone: doctor.phone, email: '', sources: [] };
    reviews = results[1].status === 'fulfilled' ? results[1].value : { averageRating: undefined, totalReviews: 0, commonPraise: [], commonConcerns: [], recentFeedback: [], sources: [] };
    credentials = results[2].status === 'fulfilled' ? results[2].value : { credential: doctor.credential, specialty: doctor.specialty, npi: doctor.npi, verified: true };
    businessIntel = results[3].status === 'fulfilled' ? results[3].value : { practiceType: 'Unknown', patientVolume: 'Unknown', marketPosition: 'Unknown', recentNews: [], growthIndicators: [] };
    additionalInfo = results[4].status === 'fulfilled' ? results[4].value : { technology: [], professionalActivities: [], recentNews: [] };

    // Synthesize all research into a comprehensive profile
    const synthesizedData = await synthesizeResearchData({
      doctor,
      practiceWebsite,
      reviews,
      credentials,
      businessIntel,
      additionalInfo
    });

    return synthesizedData;
  } catch (error) {
    console.error('Error in NPI-enhanced research synthesis:', error);
    // Even if synthesis fails, try to return data with website if we found it
    return {
      ...createBasicResearchData(doctor),
      practiceInfo: {
        ...createBasicResearchData(doctor).practiceInfo,
        website: practiceWebsite?.website || ''
      },
      sources: practiceWebsite?.sources || []
    };
  }
}

async function findPracticeWebsite(doctor: Doctor): Promise<PracticeWebsiteData> {
  // Build smart search query based on available information
  let searchQuery = '';
  
  // Try multiple search strategies
  const searchQueries = [];
  
  // First, try specific practice names if mentioned in organization
  if (doctor.organizationName) {
    searchQueries.push(`"${doctor.organizationName}" ${doctor.city} ${doctor.state}`);
    if (doctor.organizationName.toLowerCase().includes('pure dental')) {
      searchQueries.push(`"Pure Dental" Buffalo NY`);
    }
  }
  
  // Also search for doctor name with common practice names
  searchQueries.push(`"${doctor.displayName}" "Pure Dental" ${doctor.city}`);
  searchQueries.push(`${doctor.displayName} ${doctor.city} ${doctor.state} dental practice -directory -healthgrades -sharecare`);
  
  // Use the first query for now
  searchQuery = searchQueries[0] || `${doctor.displayName} ${doctor.city} ${doctor.state} dental practice website`;
  
  let practiceWebsite = '';
  const practicePhone = doctor.phone || '';
  const practiceEmail = '';
  
  try {
    // Execute the search
    console.log('Searching for practice website with query:', searchQuery);
    const response = await callBraveSearch(searchQuery, 10);
    const results = response?.web?.results || [];
    
    // Search for the actual practice website in results
    if (results && Array.isArray(results)) {
      // Priority 1: Look for actual practice websites (not directories)
      const practiceIndicators = ['dental', 'dds', 'dentistry', 'oral', 'smile', 'teeth'];
      const directoryDomains = ['ada.org', 'healthgrades.com', 'zocdoc.com', 'vitals.com', 'yelp.com', 'sharecare.com', 'npidb.org', 'npino.com', 'ratemds.com', 'wellness.com'];
      
      for (const result of results) {
        const url = result.url || '';
        const urlLower = url.toLowerCase();
        const titleLower = (result.title || '').toLowerCase();
        const descLower = (result.description || '').toLowerCase();
        
        // Skip directory sites
        const isDirectory = directoryDomains.some(domain => urlLower.includes(domain));
        if (isDirectory) continue;
        
        // Check if this looks like a practice website
        const isPracticeSite = practiceIndicators.some(indicator => 
          urlLower.includes(indicator) || titleLower.includes(indicator)
        );
        
        // Check if it mentions the doctor or practice
        const doctorLastName = doctor.lastName.toLowerCase();
        const mentionsDoctor = titleLower.includes(doctorLastName) || 
                             descLower.includes(doctorLastName) ||
                             (doctor.organizationName && 
                              (titleLower.includes(doctor.organizationName.toLowerCase()) ||
                               descLower.includes(doctor.organizationName.toLowerCase())));
        
        // Prioritize Pure Dental if found
        if (urlLower.includes('puredental.com') || titleLower.includes('pure dental')) {
          practiceWebsite = url;
          console.log('Found Pure Dental website:', practiceWebsite);
          break;
        }
        
        if (isPracticeSite || mentionsDoctor) {
          practiceWebsite = url;
          console.log('Found likely practice website:', practiceWebsite);
          break;
        }
      }
      
      // Priority 2: If no practice site found, look for any mention of a website in content
      if (!practiceWebsite) {
        for (const result of results) {
          const content = (result.description || '') + ' ' + (result.title || '');
          
          // Look for website mentions
          const websitePatterns = [
            /(?:website|visit|online at|www):?\s*((?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:com|net|org|dental|health)[^\s]*)/gi,
            /(?:pure|family|gentle|comfort|smile|bright)\s*dental\.com/gi,
            /(www\.[a-zA-Z0-9-]+dental[a-zA-Z0-9-]*\.com)/gi
          ];
          
          for (const pattern of websitePatterns) {
            const matches = Array.from(content.matchAll(pattern));
            for (const match of matches) {
              let foundUrl = match[1] || match[0];
              if (!foundUrl.startsWith('http')) {
                foundUrl = 'https://' + foundUrl.replace(/^www\./, '');
              }
              
              // Skip if it's a directory
              const isDirectory = directoryDomains.some(domain => foundUrl.includes(domain));
              if (!isDirectory) {
                practiceWebsite = foundUrl;
                console.log('Found website mention in content:', practiceWebsite);
                break;
              }
            }
            if (practiceWebsite) break;
          }
          
          if (practiceWebsite) break;
        }
      }
      
      // Priority 3: Extract from specific mentions like "Pure Dental"
      if (!practiceWebsite) {
        // Check for common dental practice patterns
        const commonPracticeNames = ['pure dental', 'family dental', 'smile dental', 'gentle dental'];
        
        for (const result of results) {
          const content = ((result.description || '') + ' ' + (result.title || '') + ' ' + (result.url || '')).toLowerCase();
          
          // Check for Pure Dental specifically (since it's a known case)
          if (content.includes('pure dental') || content.includes('puredental')) {
            // Look for the actual URL
            const pureMatch = content.match(/(?:https?:\/\/)?(?:www\.)?puredental\.com[^\s]*/);
            if (pureMatch) {
              practiceWebsite = pureMatch[0];
              if (!practiceWebsite.startsWith('http')) {
                practiceWebsite = 'https://' + practiceWebsite;
              }
              console.log('Found Pure Dental website:', practiceWebsite);
              break;
            }
          }
          
          // Check if the result URL itself is the practice website
          if (result.url && commonPracticeNames.some(name => result.url.toLowerCase().includes(name.replace(' ', '')))) {
            practiceWebsite = result.url;
            console.log('Found practice website from URL:', practiceWebsite);
            break;
          }
        }
      }
    }
    
    return {
      website: practiceWebsite,
      phone: practicePhone,
      email: practiceEmail,
      sources: results.slice(0, 3).map((result: SearchResult) => ({
        url: result.url || '',
        title: result.title || '',
        type: 'practice_website' as const,
        content: result.description || '',
        confidence: 80,
        lastUpdated: new Date().toISOString()
      }))
    };
  } catch (error) {
    console.error('Error finding practice website:', error);
    return { website: '', phone: doctor.phone, email: '', sources: [] };
  }
}

async function gatherReviews(doctor: Doctor): Promise<ReviewData> {
  const searchQuery = `"${doctor.displayName}" "${doctor.city}" reviews rating patients`;
  
  try {
    const response = await callBraveSearch(searchQuery, 10);
    
    // AI analysis of reviews
    const reviewAnalysis = await analyzeReviewsWithAI(response, doctor);
    
    // Return both the analysis and the raw sources
    const searchResults = (response as BraveSearchResponse)?.web?.results || [];
    return {
      ...reviewAnalysis,
      sources: searchResults.map((result: SearchResult) => ({
        url: result.url || '',
        title: result.title || '',
        type: 'review_site' as const,
        content: result.description || '',
        confidence: 75,
        lastUpdated: new Date().toISOString()
      }))
    };
  } catch (error) {
    console.error('Error gathering reviews:', error);
    return {
      averageRating: undefined,
      totalReviews: 0,
      commonPraise: [],
      commonConcerns: [],
      recentFeedback: [],
      sources: []
    };
  }
}

async function validateCredentials(doctor: Doctor): Promise<CredentialsData> {
  // NPI data already validates basic credentials
  const npiCredentials = {
    credential: doctor.credential,
    specialty: doctor.specialty,
    npi: doctor.npi,
    verified: true
  };
  
  // Search for additional credentials
  const searchQuery = `"${doctor.displayName}" "medical school" residency "board certified" CV`;
  
  try {
    const response = await callBraveSearch(searchQuery, 5);
    const enhancedCredentials = await extractCredentialsWithAI(response, doctor, npiCredentials);
    
    return enhancedCredentials;
  } catch (error) {
    console.error('Error validating credentials:', error);
    return {
      ...npiCredentials,
      medicalSchool: null,
      residency: null,
      boardCertifications: [doctor.specialty],
      yearsExperience: null,
      hospitalAffiliations: []
    };
  }
}

async function gatherBusinessIntelligence(doctor: Doctor): Promise<BusinessIntelData> {
  const searchQuery = `"${doctor.displayName}" OR "${doctor.organizationName || ''}" "${doctor.city}" practice size technology equipment staff`;
  
  try {
    const response = await callBraveSearch(searchQuery, 10);
    const businessData = await analyzeBusinessDataWithAI(response, doctor);
    
    return businessData;
  } catch (error) {
    console.error('Error gathering business intelligence:', error);
    return {
      practiceType: doctor.organizationName ? 'Group Practice' : 'Private Practice',
      patientVolume: 'Medium',
      marketPosition: 'Established',
      recentNews: [],
      growthIndicators: []
    };
  }
}

async function searchAdditionalInfo(doctor: Doctor): Promise<AdditionalInfoData> {
  // Search for technology usage, recent news, professional activities
  const queries = [
    `"${doctor.displayName}" technology "uses" OR "implements" OR "adopts"`,
    `"${doctor.displayName}" "speaking" OR "conference" OR "published"`,
    `"${doctor.organizationName || doctor.displayName}" "expands" OR "new" OR "announcement"`
  ];
  
  try {
    const results = await Promise.all(
      queries.map(q => callBraveSearch(q, 3))
    );
    
    return {
      technology: extractTechnologyMentions(results[0]),
      professionalActivities: extractProfessionalActivities(results[1]),
      recentNews: extractRecentNews(results[2])
    };
  } catch (error) {
    console.error('Error searching additional info:', error);
    return { technology: [], professionalActivities: [], recentNews: [] };
  }
}

async function analyzeReviewsWithAI(searchResults: unknown, doctor: Doctor): Promise<Omit<ReviewData, 'sources'>> {
  const results = (searchResults as BraveSearchResponse)?.web?.results || (searchResults as SearchResult[]) || [];
  
  if (!results || results.length === 0) {
    return {
      averageRating: undefined,
      totalReviews: 0,
      commonPraise: [],
      commonConcerns: [],
      recentFeedback: []
    };
  }
  
  const prompt = `
Analyze these search results about Dr. ${doctor.displayName} to extract review information.

Search Results:
${JSON.stringify(results.slice(0, 5), null, 2)}

You must respond with ONLY valid JSON, no other text. Return exactly this structure:
{
  "averageRating": number or null,
  "totalReviews": number,
  "commonPraise": ["max 3 items"],
  "commonConcerns": ["max 2 items"],
  "recentFeedback": ["max 3 recent comments"]
}

If no review data is found, use null for averageRating and empty arrays for lists.
IMPORTANT: Respond with ONLY the JSON object, no explanations or other text.`;

  try {
    const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
    
    // Clean response if wrapped in markdown
    let cleanResponse = response;
    if (typeof response === 'string' && response.includes('```')) {
      cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }
    
    return parseAIResponse(cleanResponse) as Omit<ReviewData, 'sources'>;
  } catch (error) {
    console.error('Error analyzing reviews with AI:', error);
    return {
      averageRating: undefined,
      totalReviews: 0,
      commonPraise: [],
      commonConcerns: [],
      recentFeedback: []
    };
  }
}

async function extractCredentialsWithAI(searchResults: unknown, doctor: Doctor, npiCredentials: CredentialsData): Promise<CredentialsData> {
  const results = (searchResults as BraveSearchResponse)?.web?.results || (searchResults as SearchResult[]) || [];
  
  const prompt = `
Extract medical credentials from these search results about Dr. ${doctor.displayName}.

NPI Verified Data:
${JSON.stringify(npiCredentials, null, 2)}

Search Results:
${JSON.stringify(results.slice(0, 3), null, 2)}

Return ONLY a JSON object with:
{
  "credential": "${npiCredentials.credential}",
  "specialty": "${npiCredentials.specialty}",
  "npi": "${npiCredentials.npi}",
  "verified": true,
  "medicalSchool": "school name or null",
  "residency": "residency info or null",
  "boardCertifications": ["certifications"],
  "yearsExperience": number or null,
  "hospitalAffiliations": ["hospitals"]
}`;

  try {
    const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
    return parseAIResponse(response) as CredentialsData;
  } catch (_error) {
    return {
      ...npiCredentials,
      medicalSchool: null,
      residency: null,
      boardCertifications: [doctor.specialty],
      yearsExperience: null,
      hospitalAffiliations: []
    };
  }
}

async function analyzeBusinessDataWithAI(searchResults: unknown, doctor: Doctor): Promise<BusinessIntelData> {
  const results = (searchResults as BraveSearchResponse)?.web?.results || (searchResults as SearchResult[]) || [];
  
  const prompt = `
Analyze business intelligence from these search results about ${doctor.organizationName || doctor.displayName}.

Search Results:
${JSON.stringify(results.slice(0, 5), null, 2)}

Return ONLY a JSON object with:
{
  "practiceType": "Private Practice/Group Practice/Hospital/Academic",
  "patientVolume": "Low/Medium/High",
  "marketPosition": "New/Growing/Established/Leading",
  "practiceSize": "small/medium/large",
  "technologyAdoption": "conservative/mainstream/early_adopter",
  "recentNews": ["max 3 items"],
  "growthIndicators": ["max 3 items"]
}`;

  try {
    const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
    return parseAIResponse(response) as BusinessIntelData;
  } catch (_error) {
    return {
      practiceType: doctor.organizationName ? 'Group Practice' : 'Private Practice',
      patientVolume: 'Medium',
      marketPosition: 'Established',
      practiceSize: 'medium',
      technologyAdoption: 'mainstream',
      techAdoption: 'mainstream',
      estimatedRevenue: 'Unknown',
      recentNews: [],
      growthIndicators: []
    };
  }
}

async function synthesizeResearchData(data: SynthesisData): Promise<ResearchData> {
  const sources: ResearchSource[] = [];
  
  // Add ALL sources from various searches
  
  // 1. Practice website sources
  if (data.practiceWebsite.sources && Array.isArray(data.practiceWebsite.sources)) {
    sources.push(...data.practiceWebsite.sources.map((s) => ({
      url: s.url || '',
      title: s.title || '',
      type: 'practice_website' as const,
      content: s.content || '',
      confidence: 80,
      lastUpdated: new Date().toISOString()
    })));
  }
  
  // 2. Review sources
  if (data.reviews.sources && Array.isArray(data.reviews.sources)) {
    sources.push(...data.reviews.sources.map((s) => ({
      url: s.url || '',
      title: s.title || '',
      type: 'review_site' as const,
      content: s.content || '',
      confidence: 75,
      lastUpdated: new Date().toISOString()
    })));
  }
  
  // 3. Credential sources (if we added them)
  if (data.credentials.sources && Array.isArray(data.credentials.sources)) {
    sources.push(...data.credentials.sources.map((s) => ({
      url: s.url || '',
      title: s.title || '',
      type: 'medical_directory' as const,
      content: s.content || '',
      confidence: 85,
      lastUpdated: new Date().toISOString()
    })));
  }
  
  // 4. Business intel sources
  if (data.businessIntel.sources && Array.isArray(data.businessIntel.sources)) {
    sources.push(...data.businessIntel.sources.map((s) => ({
      url: s.url || '',
      title: s.title || '',
      type: 'news_article' as const,
      content: s.content || '',
      confidence: 70,
      lastUpdated: new Date().toISOString()
    })));
  }
  
  // Add recent news if available
  if (data.businessIntel && Array.isArray(data.businessIntel.recentNews)) {
    data.businessIntel.recentNews.forEach((news: string) => {
      sources.push({
        url: '',
        title: news,
        type: 'news_article' as const,
        content: news,
        confidence: 70,
        lastUpdated: new Date().toISOString()
      });
    });
  }
  
  // Calculate confidence score based on data completeness
  let confidenceScore = 50; // Base score for NPI verification
  if (data.practiceWebsite.website) confidenceScore += 10;
  if (data.reviews.averageRating) confidenceScore += 10;
  if (data.credentials.medicalSchool) confidenceScore += 10;
  if (data.businessIntel.practiceSize || data.businessIntel.practiceType) confidenceScore += 10;
  if (data.additionalInfo.technology.length > 0) confidenceScore += 10;
  
  // Add points for sources found
  if (sources.length > 0) confidenceScore += Math.min(sources.length * 2, 10);
  
  return {
    doctorName: data.doctor.displayName,
    practiceInfo: {
      name: data.doctor.organizationName || `${data.doctor.displayName}'s Practice`,
      address: data.doctor.fullAddress,
      phone: data.doctor.phone,
      website: data.practiceWebsite.website,
      specialties: [data.doctor.specialty],
      services: extractServicesFromSpecialty(data.doctor.specialty),
      technology: data.additionalInfo.technology || [],
      staff: estimateStaffSize(data.businessIntel.practiceSize || 'medium'),
      established: undefined
    },
    credentials: {
      medicalSchool: data.credentials.medicalSchool || undefined,
      residency: data.credentials.residency || undefined,
      boardCertifications: data.credentials.boardCertifications || [data.doctor.specialty],
      yearsExperience: data.credentials.yearsExperience || undefined,
      hospitalAffiliations: data.credentials.hospitalAffiliations || []
    },
    reviews: data.reviews,
    businessIntel: {
      ...data.businessIntel,
      recentNews: [
        ...(Array.isArray(data.businessIntel.recentNews) ? data.businessIntel.recentNews : []),
        ...(Array.isArray(data.additionalInfo.recentNews) ? data.additionalInfo.recentNews : [])
      ].slice(0, 5)
    },
    sources,
    confidenceScore: Math.min(confidenceScore, 100),
    completedAt: new Date().toISOString()
  };
}

function createBasicResearchData(doctor: Doctor): ResearchData {
  return {
    doctorName: doctor.displayName,
    practiceInfo: {
      name: doctor.organizationName || `${doctor.displayName}'s Practice`,
      address: doctor.fullAddress,
      phone: doctor.phone,
      specialties: [doctor.specialty],
      services: extractServicesFromSpecialty(doctor.specialty)
    },
    credentials: {
      boardCertifications: [doctor.specialty],
      yearsExperience: undefined
    },
    reviews: {
      averageRating: undefined,
      totalReviews: 0,
      commonPraise: [],
      commonConcerns: [],
      recentFeedback: []
    },
    businessIntel: {
      practiceType: doctor.organizationName ? 'Group Practice' : 'Private Practice',
      patientVolume: 'Unknown',
      marketPosition: 'Established'
    },
    sources: [],
    confidenceScore: 50, // Base score for NPI verification
    completedAt: new Date().toISOString()
  };
}

function extractServicesFromSpecialty(specialty: string): string[] {
  const specialtyServices: Record<string, string[]> = {
    'oral surgery': ['Dental Implants', 'Wisdom Teeth Removal', 'Bone Grafting', 'TMJ Treatment'],
    'orthodontics': ['Braces', 'Invisalign', 'Retainers', 'Early Treatment'],
    'general dentistry': ['Cleanings', 'Fillings', 'Crowns', 'Root Canals'],
    'periodontics': ['Gum Disease Treatment', 'Dental Implants', 'Gum Grafting'],
    'endodontics': ['Root Canal Therapy', 'Endodontic Surgery', 'Cracked Teeth'],
    'pediatric dentistry': ['Children\'s Dentistry', 'Sealants', 'Fluoride Treatment'],
    'prosthodontics': ['Dentures', 'Bridges', 'Implant Restoration', 'Full Mouth Reconstruction']
  };
  
  const lowerSpecialty = specialty.toLowerCase();
  for (const [key, services] of Object.entries(specialtyServices)) {
    if (lowerSpecialty.includes(key)) {
      return services;
    }
  }
  
  return ['General Practice'];
}

function estimateStaffSize(practiceSize: string): number {
  switch (practiceSize?.toLowerCase()) {
    case 'small': return 5;
    case 'medium': return 15;
    case 'large': return 30;
    default: return 10;
  }
}

function extractTechnologyMentions(_results: unknown): string[] {
  // Extract technology mentions from search results
  const mentions: string[] = [];
  
  // Implementation would parse results for technology mentions
  return mentions;
}

function extractProfessionalActivities(_results: unknown): string[] {
  // Extract speaking engagements, publications, etc.
  return [];
}

function extractRecentNews(_results: unknown): string[] {
  // Extract recent news and announcements
  return [];
}