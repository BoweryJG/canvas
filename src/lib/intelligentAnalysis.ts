/**
 * Intelligent Analysis System - Synthesize and condense doctor information
 * Identifies the correct doctor from search results and provides targeted insights
 */

import { callBraveSearch } from './apiEndpoints';

interface DoctorProfile {
  name: string;
  practice: string;
  location: string;
  specialty: string;
  website: string;
  profileUrl: string;
  confidence: number;
}

interface AnalysisResult {
  profile: DoctorProfile;
  synthesis: string;
  productAlignment: string;
  interestLevel: number;
  keyFactors: string[];
}

export async function analyzeDoctor(doctorName: string, location: string | undefined, product: string): Promise<AnalysisResult> {
  try {
    // Determine industry based on product or doctor specialty
    const isDental = product.toLowerCase().includes('dental') || 
                    product.toLowerCase().includes('implant') ||
                    product.toLowerCase().includes('ortho');
    const isAesthetic = product.toLowerCase().includes('aesthetic') || 
                       product.toLowerCase().includes('botox') ||
                       product.toLowerCase().includes('filler') ||
                       product.toLowerCase().includes('laser');
    
    // Industry-specific search optimization
    const industryKeywords = isDental ? 'dental dentist DDS practice' : 
                           isAesthetic ? 'aesthetic medspa dermatology cosmetic' : 
                           'medical practice';
    
    // Enhanced search with industry context
    const searchQuery = location 
      ? `"Dr. ${doctorName}" "${location}" ${industryKeywords} website contact`
      : `"Dr. ${doctorName}" ${industryKeywords} website contact`;
    
    const results = await callBraveSearch(searchQuery, 10);
    
    // Analyze results to find the right doctor
    const profiles = extractDoctorProfiles(results.web?.results || [], doctorName, location);
    
    // Pick the most likely match
    const bestProfile = selectBestProfile(profiles, location);
    
    // Generate intelligent synthesis
    const synthesis = generateSynthesis(bestProfile, product);
    
    return synthesis;
  } catch (error) {
    console.error('Analysis error:', error);
    return generateFallbackAnalysis(doctorName, location, product);
  }
}

function extractDoctorProfiles(results: any[], doctorName: string, location?: string): DoctorProfile[] {
  const profiles: DoctorProfile[] = [];
  const nameVariations = generateNameVariations(doctorName);
  
  results.forEach(result => {
    const text = `${result.title} ${result.description} ${result.url}`.toLowerCase();
    // const url = result.url.toLowerCase();
    
    // Check if this result mentions the doctor
    const matchesName = nameVariations.some(variation => 
      text.includes(variation.toLowerCase())
    );
    
    if (!matchesName) return;
    
    // Extract key information
    const profile: DoctorProfile = {
      name: doctorName,
      practice: extractPractice(text, result.title),
      location: extractLocation(text, location),
      specialty: extractSpecialty(text),
      website: extractWebsite(result.url, text),
      profileUrl: result.url,
      confidence: calculateConfidence(text, result.url, doctorName, location)
    };
    
    // Only add if we have meaningful data
    if (profile.practice || profile.specialty || profile.location) {
      profiles.push(profile);
    }
  });
  
  return profiles;
}

function generateNameVariations(doctorName: string): string[] {
  const parts = doctorName.split(' ');
  const variations = [
    doctorName,
    `Dr. ${doctorName}`,
    `${doctorName}, MD`,
    `${doctorName}, DDS`,
    `${doctorName}, DMD`,
    `Doctor ${doctorName}`
  ];
  
  // Add last name only variations
  if (parts.length > 1) {
    const lastName = parts[parts.length - 1];
    variations.push(
      `Dr. ${lastName}`,
      `${lastName}, MD`,
      `${lastName}, DDS`
    );
  }
  
  return variations;
}

function extractPractice(text: string, title: string): string {
  // Look for practice names in common patterns
  const patterns = [
    /(?:at|with|of)\s+([A-Z][^,\.\n]+(?:Medical|Dental|Health|Clinic|Center|Associates|Group|Practice|Partners))/gi,
    /([A-Z][^,\.\n]+(?:Medical|Dental|Health|Clinic|Center))\s+(?:in|at)/gi,
    /^([^-|]+(?:Medical|Dental|Health|Clinic|Center|Associates))/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern) || title.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }
  
  // Check if title contains practice name
  if (title.includes(' - ') && !title.toLowerCase().includes('dr.')) {
    const parts = title.split(' - ');
    if (parts[1] && parts[1].length > 5) {
      return parts[1].trim();
    }
  }
  
  return '';
}

function extractLocation(text: string, providedLocation?: string): string {
  if (providedLocation) {
    // Verify the location matches
    if (text.includes(providedLocation.toLowerCase())) {
      return providedLocation;
    }
  }
  
  // Look for city, state patterns
  const locationPattern = /(?:in|located in|serving|of)\s+([A-Za-z\s]+,\s*[A-Z]{2})/i;
  const match = text.match(locationPattern);
  if (match) {
    return match[1].trim();
  }
  
  // Look for just city names
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Buffalo', 'Rochester'];
  for (const city of cities) {
    if (text.includes(city.toLowerCase())) {
      return city;
    }
  }
  
  return '';
}

function extractSpecialty(text: string): string {
  const specialties = [
    { keywords: ['dentist', 'dental', 'dds', 'dmd', 'orthodont'], specialty: 'Dentistry' },
    { keywords: ['cardiolog'], specialty: 'Cardiology' },
    { keywords: ['dermatolog'], specialty: 'Dermatology' },
    { keywords: ['pediatric', 'children'], specialty: 'Pediatrics' },
    { keywords: ['family medicine', 'family practice', 'primary care'], specialty: 'Family Medicine' },
    { keywords: ['internal medicine', 'internist'], specialty: 'Internal Medicine' },
    { keywords: ['orthopedic', 'orthopaedic'], specialty: 'Orthopedics' },
    { keywords: ['obstetric', 'gynecolog', 'ob-gyn', 'obgyn'], specialty: 'OB/GYN' },
    { keywords: ['psychiatr', 'mental health'], specialty: 'Psychiatry' },
    { keywords: ['neurolog'], specialty: 'Neurology' },
    { keywords: ['general practice', 'gp'], specialty: 'General Practice' }
  ];
  
  for (const spec of specialties) {
    if (spec.keywords.some(keyword => text.includes(keyword))) {
      return spec.specialty;
    }
  }
  
  return 'Medical Professional';
}

function extractWebsite(url: string, text: string): string {
  // If URL is a direct practice website
  if (!url.includes('healthgrades') && 
      !url.includes('vitals.com') && 
      !url.includes('webmd.com') &&
      !url.includes('zocdoc.com')) {
    return url;
  }
  
  // Look for website mentions in text
  const websitePattern = /(?:website|visit|www\.)[\s:]*([\w\-]+\.(?:com|org|net|health))/i;
  const match = text.match(websitePattern);
  if (match) {
    return match[1].startsWith('www.') ? match[1] : `www.${match[1]}`;
  }
  
  return '';
}

function calculateConfidence(text: string, url: string, doctorName: string, location?: string): number {
  let confidence = 50; // Base confidence
  
  // Boost for exact name match
  if (text.includes(doctorName.toLowerCase())) {
    confidence += 20;
  }
  
  // Boost for location match
  if (location && text.includes(location.toLowerCase())) {
    confidence += 15;
  }
  
  // Boost for professional profiles
  if (url.includes('healthgrades.com') || url.includes('vitals.com')) {
    confidence += 10;
  }
  
  // Boost for practice website
  if (!url.includes('healthgrades') && !url.includes('vitals') && url.includes('.com')) {
    confidence += 5;
  }
  
  return Math.min(confidence, 95);
}

function selectBestProfile(profiles: DoctorProfile[], location?: string): DoctorProfile {
  if (profiles.length === 0) {
    return {
      name: '',
      practice: '',
      location: location || '',
      specialty: 'Medical Professional',
      website: '',
      profileUrl: '',
      confidence: 0
    };
  }
  
  // Sort by confidence and completeness
  profiles.sort((a, b) => {
    // First by confidence
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    
    // Then by data completeness
    const aScore = (a.practice ? 1 : 0) + (a.location ? 1 : 0) + (a.website ? 1 : 0);
    const bScore = (b.practice ? 1 : 0) + (b.location ? 1 : 0) + (b.website ? 1 : 0);
    return bScore - aScore;
  });
  
  return profiles[0];
}

function generateSynthesis(profile: DoctorProfile, product: string): AnalysisResult {
  const hasGoodData = profile.confidence > 60;
  
  // Generate comprehensive synthesis paragraph
  let synthesis = '';
  
  if (hasGoodData && profile.practice) {
    synthesis = `Dr. ${profile.name} is a ${profile.specialty} practicing at ${profile.practice}${profile.location ? ` in ${profile.location}` : ''}. `;
  } else if (profile.specialty) {
    synthesis = `Dr. ${profile.name} is a ${profile.specialty}${profile.location ? ` based in ${profile.location}` : ''}. `;
  } else {
    synthesis = `Dr. ${profile.name} is a medical professional${profile.location ? ` in ${profile.location}` : ''}. `;
  }
  
  // Add website info
  if (profile.website) {
    synthesis += `Their practice website is ${profile.website}. `;
  } else if (profile.profileUrl.includes('healthgrades')) {
    synthesis += `They maintain a professional profile on Healthgrades. `;
  }
  
  // Add practice insights
  if (profile.practice && profile.practice.toLowerCase().includes('group')) {
    synthesis += `As part of a group practice, they likely have established systems and may be more receptive to solutions that integrate well with existing infrastructure. `;
  } else if (profile.practice) {
    synthesis += `Operating within an established practice environment suggests readiness for proven solutions. `;
  }
  
  // Generate product alignment analysis
  const productAlignment = analyzeProductFit(profile, product);
  
  // Calculate interest level
  const interestLevel = calculateInterestLevel(profile, product);
  
  // Key factors for this specific doctor
  const keyFactors = generateKeyFactors(profile, product);
  
  return {
    profile,
    synthesis,
    productAlignment,
    interestLevel,
    keyFactors
  };
}

function analyzeProductFit(profile: DoctorProfile, product: string): string {
  const productLower = product.toLowerCase();
  const specialty = profile.specialty.toLowerCase();
  
  // Technology products
  if (productLower.includes('software') || productLower.includes('digital') || productLower.includes('app')) {
    if (profile.website) {
      return `Having an active web presence indicates Dr. ${profile.name} values digital solutions. ${product} would align well with their technology-forward approach.`;
    }
    return `As a modern practitioner, Dr. ${profile.name} would likely appreciate how ${product} streamlines clinical workflows and enhances patient care.`;
  }
  
  // Medical devices
  if (productLower.includes('device') || productLower.includes('equipment')) {
    if (specialty.includes('dentist')) {
      return `In dentistry, advanced equipment directly impacts patient outcomes. Dr. ${profile.name} would be interested in how ${product} improves procedure efficiency and patient comfort.`;
    }
    return `For a ${profile.specialty} practice, ${product} represents an opportunity to enhance diagnostic capabilities and treatment outcomes.`;
  }
  
  // Pharmaceuticals or treatments
  if (productLower.includes('pharma') || productLower.includes('treatment') || productLower.includes('therapy')) {
    return `Dr. ${profile.name}'s ${profile.specialty} practice would benefit from ${product}'s potential to expand treatment options and improve patient outcomes.`;
  }
  
  // Default analysis
  return `Based on their ${profile.specialty} practice${profile.practice ? ` at ${profile.practice}` : ''}, Dr. ${profile.name} would likely evaluate ${product} based on its ability to improve patient care, streamline operations, and provide measurable ROI.`;
}

function calculateInterestLevel(profile: DoctorProfile, product: string): number {
  let score = 70; // Base interest
  
  // Boost for data completeness (indicates established practice)
  if (profile.practice) score += 5;
  if (profile.website) score += 10;
  if (profile.location) score += 5;
  
  // Specialty alignment
  const productLower = product.toLowerCase();
  const specialty = profile.specialty.toLowerCase();
  
  if (productLower.includes('dental') && specialty.includes('dent')) {
    score += 10;
  } else if (productLower.includes('cardio') && specialty.includes('cardio')) {
    score += 10;
  }
  
  // Technology indicators
  if (profile.website && (productLower.includes('software') || productLower.includes('digital'))) {
    score += 5;
  }
  
  return Math.min(score, 95);
}

function generateKeyFactors(profile: DoctorProfile, product: string): string[] {
  const factors: string[] = [];
  
  // Location-based factors
  if (profile.location) {
    factors.push(`📍 Located in ${profile.location} - consider local market dynamics`);
  }
  
  // Practice type factors
  if (profile.practice) {
    if (profile.practice.toLowerCase().includes('group')) {
      factors.push('👥 Group practice - decision may involve multiple stakeholders');
    } else {
      factors.push('🏢 Established practice - likely has existing vendor relationships');
    }
  }
  
  // Specialty factors
  factors.push(`🏥 ${profile.specialty} - tailor messaging to specialty-specific benefits`);
  
  // Digital presence
  if (profile.website) {
    factors.push('💻 Active online presence - receptive to digital solutions');
  }
  
  // Product-specific factors
  const productLower = product.toLowerCase();
  if (productLower.includes('software') || productLower.includes('digital')) {
    factors.push('🔧 Technology product - emphasize integration and ease of use');
  } else if (productLower.includes('device')) {
    factors.push('⚡ Medical device - focus on clinical outcomes and ROI');
  }
  
  return factors;
}

function generateFallbackAnalysis(doctorName: string, location: string | undefined, product: string): AnalysisResult {
  return {
    profile: {
      name: doctorName,
      practice: '',
      location: location || '',
      specialty: 'Medical Professional',
      website: '',
      profileUrl: '',
      confidence: 40
    },
    synthesis: `Dr. ${doctorName} is a medical professional${location ? ` practicing in ${location}` : ''}. While specific practice details are limited, medical professionals in this region typically evaluate new solutions based on clinical efficacy, integration capabilities, and return on investment.`,
    productAlignment: `${product} would appeal to Dr. ${doctorName} if it demonstrably improves patient outcomes, streamlines workflows, or provides competitive advantages in their market.`,
    interestLevel: 75,
    keyFactors: [
      '🎯 Focus on universal pain points in medical practice',
      '📊 Lead with data and case studies',
      '💰 Emphasize ROI and efficiency gains',
      '🤝 Offer trial or pilot program'
    ]
  };
}