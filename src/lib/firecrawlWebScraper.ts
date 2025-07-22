/**
 * Firecrawl-based Web Scraper
 * Uses Firecrawl API to scrape and analyze practice websites
 */

export interface ScrapedWebsiteData {
  url: string;
  title?: string;
  description?: string;
  
  // DENTAL PROCEDURES & EQUIPMENT
  dentalProcedures: {
    implants: boolean;
    allOnX: boolean;
    guidedSurgery: boolean;
    generalDentistry: boolean;
    orthodontics: boolean;
    endodontics: boolean;
    periodontics: boolean;
    oralSurgery: boolean;
    cosmeticDentistry: boolean;
  };
  
  // DENTAL IMPLANT SYSTEMS
  implantSystems: {
    straumann: boolean;
    megaGen: boolean;
    nobel: boolean;
    neodent: boolean;
    zimmerBiomet: boolean;
    biohorizons: boolean;
    other: string[];
  };
  
  // DENTAL TECHNOLOGY
  dentalTechnology: {
    cbct: boolean;
    itero: boolean;
    cerec: boolean;
    primescan: boolean;
    trios: boolean;
    coneBeam: boolean;
    digitalImpressions: boolean;
    cad_cam: boolean;
    laser: boolean;
  };
  
  // AESTHETIC PROCEDURES
  aestheticProcedures: {
    botox: boolean;
    fillers: boolean;
    prp: boolean;
    exosomes: boolean;
    threads: boolean;
    microNeedling: boolean;
    chemicalPeels: boolean;
    skinTightening: boolean;
  };
  
  // AESTHETIC DEVICES & LASERS
  aestheticDevices: {
    fraxel: boolean;
    clearAndBrilliant: boolean;
    solta: boolean;
    thermage: boolean;
    coolSculpting: boolean;
    ultherapy: boolean;
    morpheus8: boolean;
    co2Laser: boolean;
    ipl: boolean;
    picosure: boolean;
    otherLasers: string[];
  };
  
  // INJECTABLE BRANDS
  injectableBrands: {
    juvederm: boolean;
    restylane: boolean;
    sculptra: boolean;
    radiesse: boolean;
    bellaFill: boolean;
    rha: boolean;
    versa: boolean;
    dysport: boolean;
    xeomin: boolean;
    otherFillers: string[];
  };
  
  // PRACTICE INFO (simplified)
  practiceInfo: {
    doctorNames: string[];
    specialties: string[];
    teamSize?: number;
    locations?: number;
  };
  
  // CONTACT (simplified)
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  
  // COMPETITIVE INTELLIGENCE
  competitiveAdvantages: string[];
  missingProcedures: string[]; // Opportunities for sales
}

/**
 * Call the backend's firecrawl-scrape endpoint (using Firecrawl API)
 */
async function callScraper(url: string): Promise<any> {
  try {
    // Use the apiEndpoints callFirecrawlScrape function
    const { callFirecrawlScrape } = await import('./apiEndpoints');
    
    const response = await callFirecrawlScrape(url, {
      formats: ['markdown']
    });

    return response;
  } catch (error) {
    console.error('Scraper API error:', error);
    throw error;
  }
}

/**
 * Scrape a practice website using Firecrawl with smart extraction based on product type
 */
export async function scrapePracticeWebsite(url: string, productName?: string): Promise<ScrapedWebsiteData | null> {
  try {
    console.log(`🕷️ Scraping website with Canvas Scraper: ${url}`);
    
    const result = await callScraper(url);
    
    if (!result.success || !result.data) {
      console.error('No content returned from scraper');
      return null;
    }
    
    // Transform the scraper data to our medical-focused format
    const data = result.data;
    const content = (data.content || data.markdown || '').toLowerCase();
    const html = (data.html || '').toLowerCase();
    const fullText = content + ' ' + html;
    
    // Determine extraction focus based on product type
    const extractionType = determineExtractionType(productName);
    console.log(`🎯 Focusing extraction on: ${extractionType} (Product: ${productName})`);
    
    // Smart extraction based on product type
    let dentalProcedures = createEmptyDentalProcedures();
    let implantSystems = createEmptyImplantSystems();
    let dentalTechnology = createEmptyDentalTechnology();
    let aestheticProcedures = createEmptyAestheticProcedures();
    let aestheticDevices = createEmptyAestheticDevices();
    let injectableBrands = createEmptyInjectableBrands();
    
    if (extractionType === 'dental' || extractionType === 'both') {
      dentalProcedures = extractDentalProcedures(fullText);
      implantSystems = extractImplantSystems(fullText);
      dentalTechnology = extractDentalTechnology(fullText);
    }
    
    if (extractionType === 'aesthetic' || extractionType === 'both') {
      aestheticProcedures = extractAestheticProcedures(fullText);
      aestheticDevices = extractAestheticDevices(fullText);
      injectableBrands = extractInjectableBrands(fullText);
    }
    
    // Extract practice info
    const practiceInfo = extractPracticeInfo(fullText);
    
    // Identify missing procedures (opportunities)
    const missingProcedures = identifyMissingProcedures(dentalProcedures, aestheticProcedures);
    
    // Extract competitive advantages
    const competitiveAdvantages = extractCompetitiveAdvantages(
      dentalProcedures, 
      dentalTechnology, 
      aestheticDevices
    );
    
    const scrapedData: ScrapedWebsiteData = {
      url,
      title: data.title || '',
      description: data.metaDescription || '',
      dentalProcedures,
      implantSystems,
      dentalTechnology,
      aestheticProcedures,
      aestheticDevices,
      injectableBrands,
      practiceInfo,
      contactInfo: {
        phone: data.phones?.[0],
        email: data.emails?.[0],
        address: data.addresses?.[0]
      },
      competitiveAdvantages,
      missingProcedures
    };
    
    // Log what we found
    const foundProcedures = Object.entries(dentalProcedures).filter(([_, v]) => v).length +
                           Object.entries(aestheticProcedures).filter(([_, v]) => v).length;
    const foundTech = Object.entries(dentalTechnology).filter(([_, v]) => v).length +
                      Object.entries(aestheticDevices).filter(([_, v]) => v).length;
    
    console.log(`✅ Successfully scraped ${url} - Found ${foundProcedures} procedures, ${foundTech} technologies`);
    return scrapedData;
    
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Determine what type of extraction to perform based on product name
 */
function determineExtractionType(productName?: string): 'dental' | 'aesthetic' | 'both' {
  if (!productName) return 'both'; // Default to both if no product specified
  
  const product = productName.toLowerCase();
  
  // Dental product keywords
  const dentalKeywords = [
    'yomi', 'straumann', 'megagen', 'nobel', 'neodent', 'zimmer', 'biohorizons',
    'cbct', 'itero', 'cerec', 'primescan', 'trios', 'implant', 'dental',
    'periodontal', 'endodontic', 'orthodontic', 'oral surgery'
  ];
  
  // Aesthetic product keywords  
  const aestheticKeywords = [
    'fraxel', 'clear and brilliant', 'solta', 'thermage', 'coolsculpting',
    'botox', 'dysport', 'xeomin', 'juvederm', 'restylane', 'sculptra',
    'morpheus8', 'ultherapy', 'prp', 'exosome', 'microneedling',
    'laser', 'ipl', 'aesthetic', 'cosmetic', 'dermatology'
  ];
  
  const isDental = dentalKeywords.some(keyword => product.includes(keyword));
  const isAesthetic = aestheticKeywords.some(keyword => product.includes(keyword));
  
  if (isDental && isAesthetic) return 'both';
  if (isDental) return 'dental';
  if (isAesthetic) return 'aesthetic';
  
  return 'both'; // Default if we can't determine
}

/**
 * Create empty dental procedures object
 */
function createEmptyDentalProcedures(): ScrapedWebsiteData['dentalProcedures'] {
  return {
    implants: false,
    allOnX: false,
    guidedSurgery: false,
    generalDentistry: false,
    orthodontics: false,
    endodontics: false,
    periodontics: false,
    oralSurgery: false,
    cosmeticDentistry: false
  };
}

/**
 * Create empty implant systems object
 */
function createEmptyImplantSystems(): ScrapedWebsiteData['implantSystems'] {
  return {
    straumann: false,
    megaGen: false,
    nobel: false,
    neodent: false,
    zimmerBiomet: false,
    biohorizons: false,
    other: []
  };
}

/**
 * Create empty dental technology object
 */
function createEmptyDentalTechnology(): ScrapedWebsiteData['dentalTechnology'] {
  return {
    cbct: false,
    itero: false,
    cerec: false,
    primescan: false,
    trios: false,
    coneBeam: false,
    digitalImpressions: false,
    cad_cam: false,
    laser: false
  };
}

/**
 * Create empty aesthetic procedures object
 */
function createEmptyAestheticProcedures(): ScrapedWebsiteData['aestheticProcedures'] {
  return {
    botox: false,
    fillers: false,
    prp: false,
    exosomes: false,
    threads: false,
    microNeedling: false,
    chemicalPeels: false,
    skinTightening: false
  };
}

/**
 * Create empty aesthetic devices object
 */
function createEmptyAestheticDevices(): ScrapedWebsiteData['aestheticDevices'] {
  return {
    fraxel: false,
    clearAndBrilliant: false,
    solta: false,
    thermage: false,
    coolSculpting: false,
    ultherapy: false,
    morpheus8: false,
    co2Laser: false,
    ipl: false,
    picosure: false,
    otherLasers: []
  };
}

/**
 * Create empty injectable brands object
 */
function createEmptyInjectableBrands(): ScrapedWebsiteData['injectableBrands'] {
  return {
    juvederm: false,
    restylane: false,
    sculptra: false,
    radiesse: false,
    bellaFill: false,
    rha: false,
    versa: false,
    dysport: false,
    xeomin: false,
    otherFillers: []
  };
}

/**
 * Extract dental procedures from website content
 */
function extractDentalProcedures(content: string): ScrapedWebsiteData['dentalProcedures'] {
  return {
    implants: /dental\s*implant|implant\s*dentistry|teeth\s*implant/i.test(content),
    allOnX: /all[\s-]?on[\s-]?[46x]|all[\s-]?on[\s-]?four|all[\s-]?on[\s-]?six/i.test(content),
    guidedSurgery: /guided\s*surgery|guided\s*implant|surgical\s*guide/i.test(content),
    generalDentistry: /general\s*dentistry|cleanings?|fillings?|cavity|cavities/i.test(content),
    orthodontics: /orthodontic|braces|invisalign|clear\s*align/i.test(content),
    endodontics: /endodontic|root\s*canal|pulp\s*therapy/i.test(content),
    periodontics: /periodontic|gum\s*disease|gum\s*treatment|scaling/i.test(content),
    oralSurgery: /oral\s*surgery|maxillofacial|extraction|wisdom\s*teeth/i.test(content),
    cosmeticDentistry: /cosmetic\s*dentistry|veneers?|teeth\s*whitening|smile\s*makeover/i.test(content)
  };
}

/**
 * Extract implant systems from website content
 */
function extractImplantSystems(content: string): ScrapedWebsiteData['implantSystems'] {
  const systems = {
    straumann: /straumann/i.test(content),
    megaGen: /megagen|mega\s*gen/i.test(content),
    nobel: /nobel\s*biocare|nobel/i.test(content),
    neodent: /neodent/i.test(content),
    zimmerBiomet: /zimmer\s*biomet|zimmer/i.test(content),
    biohorizons: /biohorizons|bio\s*horizons/i.test(content),
    other: [] as string[]
  };
  
  // Check for other implant systems
  const otherSystems = [
    'Hiossen', 'Dentium', 'Osstem', 'Anthogyr', 'Dentsply', 'Astra Tech'
  ];
  
  otherSystems.forEach(system => {
    if (new RegExp(system, 'i').test(content)) {
      systems.other.push(system);
    }
  });
  
  return systems;
}

/**
 * Extract dental technology from website content
 */
function extractDentalTechnology(content: string): ScrapedWebsiteData['dentalTechnology'] {
  return {
    cbct: /cbct|cone\s*beam|3d\s*x[\s-]?ray|3d\s*imaging/i.test(content),
    itero: /itero|i[\s-]?tero/i.test(content),
    cerec: /cerec/i.test(content),
    primescan: /primescan|prime\s*scan/i.test(content),
    trios: /trios|3shape/i.test(content),
    coneBeam: /cone\s*beam/i.test(content),
    digitalImpressions: /digital\s*impression|intraoral\s*scan/i.test(content),
    cad_cam: /cad[\s\/]?cam|computer[\s-]aided/i.test(content),
    laser: /dental\s*laser|laser\s*dentistry|soft\s*tissue\s*laser/i.test(content)
  };
}

/**
 * Extract aesthetic procedures from website content
 */
function extractAestheticProcedures(content: string): ScrapedWebsiteData['aestheticProcedures'] {
  return {
    botox: /botox|botulinum/i.test(content),
    fillers: /filler|dermal\s*filler|facial\s*filler|lip\s*filler/i.test(content),
    prp: /prp|platelet[\s-]?rich[\s-]?plasma|vampire/i.test(content),
    exosomes: /exosome/i.test(content),
    threads: /thread\s*lift|pdo\s*thread|lifting\s*thread/i.test(content),
    microNeedling: /micro[\s-]?needling|dermapen|skinpen/i.test(content),
    chemicalPeels: /chemical\s*peel|glycolic|salicylic\s*acid/i.test(content),
    skinTightening: /skin\s*tightening|radiofrequency|rf\s*treatment/i.test(content)
  };
}

/**
 * Extract aesthetic devices and lasers from website content
 */
function extractAestheticDevices(content: string): ScrapedWebsiteData['aestheticDevices'] {
  const devices = {
    fraxel: /fraxel/i.test(content),
    clearAndBrilliant: /clear\s*(?:and|&)\s*brilliant/i.test(content),
    solta: /solta/i.test(content),
    thermage: /thermage/i.test(content),
    coolSculpting: /coolsculpting|cool\s*sculpting/i.test(content),
    ultherapy: /ultherapy|ulthera/i.test(content),
    morpheus8: /morpheus\s*8|morpheus/i.test(content),
    co2Laser: /co2\s*laser|fractional\s*co2/i.test(content),
    ipl: /ipl|intense\s*pulsed\s*light|photofacial/i.test(content),
    picosure: /picosure|pico/i.test(content),
    otherLasers: [] as string[]
  };
  
  // Check for other laser systems
  const otherLaserSystems = [
    'Halo', 'BBL', 'V-Beam', 'Nd:YAG', 'Alexandrite', 'Diode', 'Erbium'
  ];
  
  otherLaserSystems.forEach(laser => {
    if (new RegExp(laser, 'i').test(content)) {
      devices.otherLasers.push(laser);
    }
  });
  
  return devices;
}

/**
 * Extract injectable brands from website content
 */
function extractInjectableBrands(content: string): ScrapedWebsiteData['injectableBrands'] {
  const brands = {
    juvederm: /juvederm|juvéderm/i.test(content),
    restylane: /restylane/i.test(content),
    sculptra: /sculptra/i.test(content),
    radiesse: /radiesse/i.test(content),
    bellaFill: /bellafill|bella\s*fill/i.test(content),
    rha: /rha\s*collection|rha\s*filler/i.test(content),
    versa: /versa|revanesse/i.test(content),
    dysport: /dysport/i.test(content),
    xeomin: /xeomin/i.test(content),
    otherFillers: [] as string[]
  };
  
  // Check for other filler brands
  const otherBrands = [
    'Voluma', 'Vollure', 'Volbella', 'Kybella', 'Belotero', 'Teosyal'
  ];
  
  otherBrands.forEach(brand => {
    if (new RegExp(brand, 'i').test(content)) {
      brands.otherFillers.push(brand);
    }
  });
  
  return brands;
}

/**
 * Extract practice information from website content
 */
function extractPracticeInfo(content: string): ScrapedWebsiteData['practiceInfo'] {
  return {
    doctorNames: extractStaffNames(content),
    specialties: extractSpecialties(content),
    teamSize: estimateTeamSize(content),
    locations: extractLocationCount(content)
  };
}

/**
 * Identify missing procedures (sales opportunities)
 */
function identifyMissingProcedures(
  dentalProcedures: ScrapedWebsiteData['dentalProcedures'],
  aestheticProcedures: ScrapedWebsiteData['aestheticProcedures']
): string[] {
  const missing: string[] = [];
  
  // High-value dental opportunities
  if (!dentalProcedures.implants) missing.push('Dental implants (high-value opportunity)');
  if (!dentalProcedures.allOnX) missing.push('All-on-X procedures (premium implant service)');
  if (!dentalProcedures.guidedSurgery) missing.push('Guided surgery (technology upgrade)');
  
  // Aesthetic opportunities
  if (!aestheticProcedures.botox) missing.push('Botox treatments (high-margin)');
  if (!aestheticProcedures.fillers) missing.push('Dermal fillers (recurring revenue)');
  if (!aestheticProcedures.microNeedling) missing.push('Microneedling (growing trend)');
  
  return missing;
}

/**
 * Extract competitive advantages based on procedures and technology
 */
function extractCompetitiveAdvantages(
  dentalProcedures: ScrapedWebsiteData['dentalProcedures'],
  dentalTechnology: ScrapedWebsiteData['dentalTechnology'],
  aestheticDevices: ScrapedWebsiteData['aestheticDevices']
): string[] {
  const advantages: string[] = [];
  
  // Technology advantages
  if (dentalTechnology.cbct && dentalTechnology.itero) {
    advantages.push('Advanced imaging suite (CBCT + iTero)');
  }
  if (dentalProcedures.guidedSurgery) {
    advantages.push('Guided surgery capabilities');
  }
  
  // Premium procedure advantages
  if (dentalProcedures.allOnX) {
    advantages.push('All-on-X specialization (premium positioning)');
  }
  if (aestheticDevices.fraxel || aestheticDevices.clearAndBrilliant) {
    advantages.push('Premium laser technology');
  }
  
  // Multiple technology systems
  const laserCount = Object.values(aestheticDevices).filter(Boolean).length;
  if (laserCount >= 3) {
    advantages.push(`Multi-platform laser practice (${laserCount} technologies)`);
  }
  
  return advantages;
}

/**
 * Extract medical specialties from content
 */
function extractSpecialties(content: string): string[] {
  const specialties: string[] = [];
  const specialtyPatterns = [
    { name: 'Implant Dentistry', pattern: /implant\s*dentistry|oral\s*surgery/i },
    { name: 'Cosmetic Dentistry', pattern: /cosmetic\s*dentistry|aesthetic\s*dentistry/i },
    { name: 'Orthodontics', pattern: /orthodontic|braces|invisalign/i },
    { name: 'Periodontics', pattern: /periodontic|gum\s*treatment/i },
    { name: 'Endodontics', pattern: /endodontic|root\s*canal/i },
    { name: 'Dermatology', pattern: /dermatolog|skin\s*care/i },
    { name: 'Plastic Surgery', pattern: /plastic\s*surgery|cosmetic\s*surgery/i },
    { name: 'Medical Aesthetics', pattern: /medical\s*aesthetic|aesthetic\s*medicine/i }
  ];
  
  for (const specialty of specialtyPatterns) {
    if (specialty.pattern.test(content)) {
      specialties.push(specialty.name);
    }
  }
  
  return specialties;
}

/**
 * Extract location count from content
 */
function extractLocationCount(content: string): number {
  // Look for multiple location indicators
  const locationIndicators = [
    /(\d+)\s*location/gi,
    /(\d+)\s*office/gi,
    /(\d+)\s*clinic/gi
  ];
  
  for (const pattern of locationIndicators) {
    const match = content.match(pattern);
    if (match) {
      const count = parseInt(match[1]);
      if (count > 1 && count < 20) { // Reasonable range
        return count;
      }
    }
  }
  
  // Default to 1 if no multiple locations detected
  return 1;
}

function extractStaffNames(content: string): string[] {
  const staffNames: string[] = [];
  // Look for "Dr." pattern
  const drPattern = /Dr\.\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
  const matches = content.matchAll(drPattern);
  
  for (const match of matches) {
    if (match[1] && !staffNames.includes(match[1])) {
      staffNames.push(match[1]);
    }
  }
  
  return staffNames.slice(0, 10); // Limit to 10 staff members
}

function estimateTeamSize(content: string): number {
  const staffMentions = (content.match(/\b(doctor|dentist|hygienist|assistant|staff|team)\b/gi) || []).length;
  if (staffMentions > 20) return 10; // Large practice
  if (staffMentions > 10) return 5;  // Medium practice
  return 3; // Small practice
}


/**
 * Find practice website from search results
 */
export async function findPracticeWebsite(
  _doctorName: string, 
  searchResults?: any[]
): Promise<string | null> {
  
  // Check search results for actual practice websites
  if (searchResults && searchResults.length > 0) {
    for (const result of searchResults) {
      const url = result.url || result.link;
      if (!url) continue;
      
      // Skip directory sites
      const directoryDomains = [
        'yelp.com', 'healthgrades.com', 'zocdoc.com', 
        'vitals.com', 'ratemds.com', 'yellowpages.com',
        'facebook.com', 'linkedin.com', 'doximity.com'
      ];
      
      const isDirectory = directoryDomains.some(domain => 
        url.includes(domain)
      );
      
      if (!isDirectory && url.includes('.com')) {
        console.log(`✅ Found likely practice website: ${url}`);
        return url;
      }
    }
  }
  
  return null;
}