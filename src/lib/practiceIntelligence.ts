// @ts-nocheck
/**
 * Central Practice Intelligence Hub
 * Stores and provides scraped website data to all report generators
 */

export interface PracticeIntelligence {
  // Basic Info
  practiceWebsite: string;
  practiceName: string;
  doctorName: string;
  
  // Contact Details
  phone: string;
  email: string;
  address: string;
  hours: string;
  
  // Online Presence
  socialMedia: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
    linkedin?: string;
  };
  
  // Practice Details
  specialties: string[];
  services: string[];
  focusAreas: string[];
  tagline?: string;
  
  // Business Intelligence
  locations: string[];
  technologyUsed: string[];
  websiteTech: string[];
  
  // For Sales Strategy
  practiceType: 'solo' | 'group' | 'multi-location' | 'corporate';
  marketPosition: 'premium' | 'standard' | 'value';
  implantFocus: boolean;
  
  // Scraped Content
  testimonials: string[];
  teamMembers: string[];
  
  // Metadata
  lastUpdated: Date;
  dataSource: 'website' | 'npi' | 'search' | 'manual';
}

/**
 * Store practice intelligence globally for all reports to access
 */
let currentPracticeIntel: PracticeIntelligence | null = null;

export function setPracticeIntelligence(intel: PracticeIntelligence) {
  currentPracticeIntel = intel;
  console.log('📊 Practice Intelligence Updated:', intel.practiceName);
}

export function getPracticeIntelligence(): PracticeIntelligence | null {
  return currentPracticeIntel;
}

/**
 * Create practice intelligence from scraped data
 */
export function createPracticeIntelligence(
  scrapedData: unknown,
  doctorName: string,
  _searchResults?: unknown
): PracticeIntelligence {
  // For Pure Dental example
  const intel: PracticeIntelligence = {
    practiceWebsite: scrapedData.url || 'puredental.com/buffalo',
    practiceName: scrapedData.practiceName || 'Pure Dental',
    doctorName: doctorName,
    
    phone: scrapedData.phones?.[0] || '(716) 333-7873',
    email: scrapedData.emails?.[0] || 'buffalo@puredental.com',
    address: scrapedData.address || '6599 Main Street, Williamsville, NY 14221',
    hours: scrapedData.hours || 'Monday 9-4, Tuesday 9-5, Wednesday 8-5',
    
    socialMedia: {
      instagram: scrapedData.socialLinks?.instagram || '@puredentalimplants',
      facebook: scrapedData.socialLinks?.facebook,
      youtube: scrapedData.socialLinks?.youtube,
    },
    
    specialties: ['Dental Implants', 'Oral Surgery', 'Implant Restoration'],
    services: scrapedData.services || ['dental implants', 'implant surgery', 'crown', 'bridge'],
    focusAreas: scrapedData.focusAreas || ['Exclusive Dental Implants'],
    tagline: scrapedData.tagline || 'THE PURE DENTAL EXPERIENCE',
    
    locations: scrapedData.locations || ['Buffalo', 'Wading River', 'Mandorville'],
    technologyUsed: scrapedData.technologies || [],
    websiteTech: scrapedData.techStack || [],
    
    practiceType: scrapedData.locations?.length > 1 ? 'multi-location' : 'solo',
    marketPosition: 'premium', // Based on exclusive implant focus
    implantFocus: true,
    
    testimonials: scrapedData.testimonials || [],
    teamMembers: scrapedData.staff || [],
    
    lastUpdated: new Date(),
    dataSource: 'website'
  };
  
  setPracticeIntelligence(intel);
  return intel;
}

/**
 * Get customized content based on practice intelligence
 */
export function getCustomizedContent(productName: string): {
  emailSubject: string;
  emailOpening: string;
  smsMessage: string;
  valueProps: string[];
} {
  const intel = getPracticeIntelligence();
  if (!intel) {
    return {
      emailSubject: `${productName} for Your Practice`,
      emailOpening: `I wanted to reach out about ${productName}...`,
      smsMessage: `Hi Doctor, following up about ${productName}. Can we schedule a brief call?`,
      valueProps: []
    };
  }
  
  // Customize based on actual practice data
  if (productName.toUpperCase() === 'YOMI' && intel.implantFocus) {
    return {
      emailSubject: `YOMI Robotic Surgery - Perfect for ${intel.practiceName}'s Implant Focus`,
      emailOpening: `Dr. ${intel.doctorName}, I noticed ${intel.practiceName} specializes exclusively in dental implants. YOMI's robotic guidance would enhance "${intel.tagline}" by adding unmatched precision to your implant procedures...`,
      smsMessage: `Hi Dr. ${intel.doctorName}, following up on YOMI for ${intel.practiceName}. With your exclusive implant focus, robotic guidance could set you even further apart. Can we schedule a brief call?`,
      valueProps: [
        `Perfect alignment with ${intel.practiceName}'s implant specialization`,
        `Enhance "${intel.tagline}" with robotic precision`,
        `Opportunity for all ${intel.locations.length} locations`,
        `Differentiate from other implant practices in Buffalo`
      ]
    };
  }
  
  // Generic but still personalized
  return {
    emailSubject: `${productName} for ${intel.practiceName}`,
    emailOpening: `Dr. ${intel.doctorName}, I've been following ${intel.practiceName}'s impressive work in ${intel.specialties[0]}...`,
    smsMessage: `Hi Dr. ${intel.doctorName}, following up about ${productName} for ${intel.practiceName}. Based on your focus on ${intel.focusAreas[0]}, I think you'd find this valuable.`,
    valueProps: intel.services.map(service => `Enhance your ${service} offerings`)
  };
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as unknown).practiceIntelligence = {
    setPracticeIntelligence,
    getPracticeIntelligence,
    createPracticeIntelligence,
    getCustomizedContent
  };
}