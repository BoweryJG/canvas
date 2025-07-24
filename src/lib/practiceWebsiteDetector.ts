/**
 * Advanced Practice Website Detection Logic
 * Determines if a website is a doctor's actual practice website vs directory/other
 */

export interface WebsiteAnalysis {
  isPracticeWebsite: boolean;
  confidence: number;
  websiteType: 'practice' | 'directory' | 'social' | 'news' | 'hospital' | 'unknown';
  signals: {
    positive: string[];
    negative: string[];
  };
  practiceDetails?: {
    name?: string;
    customDomain?: boolean;
    hasAppointmentSystem?: boolean;
    hasContactInfo?: boolean;
    hasDoctorBio?: boolean;
    hasServices?: boolean;
  };
}

/**
 * Main function to analyze if a URL is a practice website
 */
export function analyzePracticeWebsite(
  url: string,
  pageTitle?: string,
  pageDescription?: string,
  doctorName?: string,
  location?: string
): WebsiteAnalysis {
  const urlLower = url.toLowerCase();
  const titleLower = (pageTitle || '').toLowerCase();
  const descLower = (pageDescription || '').toLowerCase();
  
  const analysis: WebsiteAnalysis = {
    isPracticeWebsite: false,
    confidence: 0,
    websiteType: 'unknown',
    signals: {
      positive: [],
      negative: []
    }
  };

  // Step 1: Check for known directories (INSTANT DISQUALIFICATION)
  const directories = [
    'healthgrades.com',
    'vitals.com',
    'zocdoc.com',
    'webmd.com',
    'ratemds.com',
    'yelp.com',
    'yellowpages.com',
    'whitepages.com',
    'bbb.org',
    'angi.com',
    'thumbtack.com',
    'psychology-today.com',
    'goodtherapy.org',
    'findadoctor',
    'npidb.org',
    'npino.com',
    'doctor.com',
    'wellness.com'
  ];

  for (const dir of directories) {
    if (urlLower.includes(dir)) {
      analysis.websiteType = 'directory';
      analysis.confidence = 100;
      analysis.signals.negative.push(`Known directory site: ${dir}`);
      return analysis;
    }
  }

  // Step 2: Check for social media (MEDIUM-HIGH CONFIDENCE for official pages)
  const socialMedia = [
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'youtube.com',
    'tiktok.com'
  ];

  for (const social of socialMedia) {
    if (urlLower.includes(social)) {
      analysis.websiteType = 'social';
      
      // Check if it's an official practice/doctor page
      const isOfficialPage = analyzeOfficialSocialMedia(url, pageTitle, doctorName);
      
      if (isOfficialPage) {
        // Official practice social media pages are valid for verification!
        if (social === 'facebook.com' || social === 'instagram.com') {
          analysis.confidence = 75; // High confidence for official FB/IG
          analysis.signals.positive.push(`Official ${social} practice page`);
          analysis.isPracticeWebsite = false; // Not a website, but valid for verification
          analysis.practiceDetails = {
            hasContactInfo: true,
            customDomain: false
          };
          
          // Extract practice name from social media title if possible
          if (pageTitle) {
            const practiceName = extractPracticeNameFromSocial(pageTitle);
            if (practiceName) {
              analysis.practiceDetails.name = practiceName;
              analysis.signals.positive.push(`Practice name: ${practiceName}`);
            }
          }
        } else if (social === 'linkedin.com') {
          analysis.confidence = 65;
          analysis.signals.positive.push('Professional LinkedIn profile');
        } else {
          analysis.confidence = 50;
          analysis.signals.positive.push(`Official ${social} presence`);
        }
      } else {
        // Personal or unverified social media
        analysis.confidence = 30;
        analysis.signals.negative.push(`Unverified ${social} page`);
      }
      
      return analysis;
    }
  }

  // Step 3: Check for hospital/health system sites (MEDIUM CONFIDENCE)
  const hospitalIndicators = [
    '.edu/',
    '.gov/',
    'hospital',
    'health-system',
    'medical-center',
    'clinic.mayo',
    'clevelandclinic',
    'mountsinai',
    'kaiserpermanente'
  ];

  for (const indicator of hospitalIndicators) {
    if (urlLower.includes(indicator)) {
      analysis.websiteType = 'hospital';
      analysis.confidence = 60;
      analysis.signals.negative.push(`Part of larger health system`);
      
      // But if doctor's name is in the URL path, might be their profile page
      if (doctorName && urlLower.includes(doctorName.toLowerCase().replace(/\s+/g, '-'))) {
        analysis.signals.positive.push('Doctor-specific page within system');
        analysis.confidence = 40;
      }
      return analysis;
    }
  }

  // Step 4: Positive signals for practice websites
  let confidenceScore = 50; // Start neutral
  analysis.websiteType = 'practice'; // Assume practice unless proven otherwise

  // Check domain quality
  const domain = extractDomain(url);
  
  // A: Custom domain (not on website builder)
  const websiteBuilders = ['wix.com', 'squarespace.com', 'weebly.com', 'wordpress.com', 'blogspot.com'];
  const hasCustomDomain = !websiteBuilders.some(builder => urlLower.includes(builder));
  
  if (hasCustomDomain) {
    confidenceScore += 15;
    analysis.signals.positive.push('Custom domain (not website builder)');
    analysis.practiceDetails = { ...analysis.practiceDetails, customDomain: true };
  } else {
    confidenceScore -= 10;
    analysis.signals.negative.push('Using generic website builder');
  }

  // B: Domain matches practice pattern
  const practicePatterns = [
    /^[a-z]+dental/,        // puredental, smiledental
    /^[a-z]+medical/,       // bestmedical
    /^[a-z]+clinic/,        // familyclinic
    /^[a-z]+surgery/,       // oralsurgery
    /^[a-z]+health/,        // familyhealth
    /^[a-z]+care/,          // primarycare
    /^[a-z]+ortho/,         // smileortho
    /^dr[a-z]+/,            // drsmith
    /^[a-z]+associates/,    // smithassociates
    /^[a-z]+md/,            // smithmd
    /^[a-z]+dds/            // whitedds
  ];

  if (practicePatterns.some(pattern => pattern.test(domain))) {
    confidenceScore += 20;
    analysis.signals.positive.push('Domain follows practice naming pattern');
  }

  // C: Doctor name in domain or URL
  if (doctorName) {
    const nameParts = doctorName.toLowerCase().split(/\s+/);
    const lastName = nameParts[nameParts.length - 1];
    
    if (domain.includes(lastName) || urlLower.includes(lastName)) {
      confidenceScore += 15;
      analysis.signals.positive.push('Doctor name in URL');
    }
  }

  // D: Location match
  if (location) {
    const locationParts = location.toLowerCase().split(/[,\s]+/);
    const city = locationParts[0];
    
    if (urlLower.includes(city) || titleLower.includes(city)) {
      confidenceScore += 10;
      analysis.signals.positive.push('Location matches');
    }
  }

  // E: Title and description analysis
  const practiceKeywords = [
    'dental practice',
    'dental office',
    'medical practice',
    'clinic',
    'surgery center',
    'oral surgery',
    'orthodontics',
    'pediatric',
    'family practice',
    'appointment',
    'new patients',
    'services',
    'our team',
    'meet the doctor',
    'office hours',
    'insurance accepted'
  ];

  const matchedKeywords = practiceKeywords.filter(keyword => 
    titleLower.includes(keyword) || descLower.includes(keyword)
  );

  if (matchedKeywords.length > 0) {
    confidenceScore += matchedKeywords.length * 5;
    analysis.signals.positive.push(`Practice keywords: ${matchedKeywords.join(', ')}`);
  }

  // F: Check for specific practice indicators in title
  if (titleLower.includes('home') || titleLower.includes('welcome')) {
    confidenceScore += 10;
    analysis.signals.positive.push('Homepage title pattern');
  }

  // G: Check for appointment/contact indicators
  const appointmentIndicators = ['appointment', 'contact', 'call us', 'schedule', 'book online'];
  if (appointmentIndicators.some(ind => descLower.includes(ind))) {
    confidenceScore += 15;
    analysis.signals.positive.push('Has appointment/contact information');
    analysis.practiceDetails = { ...analysis.practiceDetails, hasAppointmentSystem: true };
  }

  // H: Negative signals
  const negativeIndicators = [
    'review',
    'rating',
    'compare',
    'find doctors',
    'doctor directory',
    'physician finder',
    'locate a',
    'search for'
  ];

  const foundNegative = negativeIndicators.filter(ind => 
    titleLower.includes(ind) || descLower.includes(ind)
  );

  if (foundNegative.length > 0) {
    confidenceScore -= foundNegative.length * 10;
    analysis.signals.negative.push(`Directory indicators: ${foundNegative.join(', ')}`);
  }

  // Final scoring
  analysis.confidence = Math.max(0, Math.min(100, confidenceScore));
  analysis.isPracticeWebsite = analysis.confidence >= 60;

  // Extract practice name if possible
  if (analysis.isPracticeWebsite && pageTitle) {
    analysis.practiceDetails = {
      ...analysis.practiceDetails,
      name: extractPracticeName(pageTitle, domain)
    };
  }

  return analysis;
}

/**
 * Extract domain name from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '').split('.')[0];
  } catch {
    return '';
  }
}

/**
 * Extract practice name from page title
 */
function extractPracticeName(title: string, domain: string): string {
  // Common patterns:
  // "Pure Dental | Buffalo NY Dentist"
  // "Smith Family Dentistry - Home"
  // "Dr. John Smith, DDS"
  
  let practiceName = title.split(/[\|\-–—]/)[0].trim();
  
  // Remove common suffixes
  practiceName = practiceName
    .replace(/\s*,?\s*(DDS|DMD|MD|DO|PC|PLLC|LLC|PA)\.?$/gi, '')
    .replace(/\s*home\s*$/i, '')
    .replace(/\s*welcome\s*$/i, '')
    .trim();
  
  // If no good name from title, use domain
  if (!practiceName || practiceName.length < 3) {
    practiceName = domain
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  return practiceName;
}

/**
 * Quick check if URL is definitely a directory
 */
export function isDefinitelyDirectory(url: string): boolean {
  const directories = [
    'healthgrades', 'vitals', 'zocdoc', 'webmd', 'ratemds',
    'yelp', 'yellowpages', 'findadoctor', 'npidb'
  ];
  
  const urlLower = url.toLowerCase();
  return directories.some(dir => urlLower.includes(dir));
}

/**
 * Quick check if URL might be a practice website
 */
export function mightBePracticeWebsite(url: string): boolean {
  if (isDefinitelyDirectory(url)) return false;
  
  const urlLower = url.toLowerCase();
  const practiceIndicators = [
    'dental', 'medical', 'clinic', 'practice', 'surgery',
    'health', 'care', 'ortho', 'pediatric', 'family'
  ];
  
  return practiceIndicators.some(ind => urlLower.includes(ind));
}

/**
 * Analyze if a social media page is an official practice/doctor page
 */
function analyzeOfficialSocialMedia(url: string, pageTitle?: string, doctorName?: string): boolean {
  const urlLower = url.toLowerCase();
  const titleLower = (pageTitle || '').toLowerCase();
  
  // Facebook specific checks
  if (urlLower.includes('facebook.com')) {
    // Official pages have /pg/ or are direct facebook.com/practicename
    if (urlLower.includes('/pg/') || !urlLower.includes('/profile.php')) {
      // Check for practice indicators in URL or title
      const practiceIndicators = ['dental', 'medical', 'clinic', 'surgery', 'health', 'orthodontic'];
      const hasPracticeIndicator = practiceIndicators.some(ind => 
        urlLower.includes(ind) || titleLower.includes(ind)
      );
      
      // Check for doctor name
      const hasDoctorName = doctorName && titleLower.includes(doctorName.toLowerCase().split(' ')[0]);
      
      return !!(hasPracticeIndicator || hasDoctorName);
    }
  }
  
  // Instagram specific checks
  if (urlLower.includes('instagram.com')) {
    // Check if it's a business/practice account
    const practiceIndicators = ['dental', 'medical', 'clinic', 'dds', 'md', 'orthodontics'];
    const hasPracticeIndicator = practiceIndicators.some(ind => 
      urlLower.includes(ind) || titleLower.includes(ind)
    );
    
    // Many practices use format: @drsmithdental or @smithdentalcare
    const hasDoctor = urlLower.includes('dr') || (doctorName && urlLower.includes(doctorName.toLowerCase().split(' ')[0]));
    
    return !!(hasPracticeIndicator || hasDoctor);
  }
  
  // LinkedIn - check if it's company page vs personal
  if (urlLower.includes('linkedin.com')) {
    return urlLower.includes('/company/') || titleLower.includes('practice') || titleLower.includes('clinic');
  }
  
  return false;
}

/**
 * Extract practice name from social media page title
 */
function extractPracticeNameFromSocial(title: string): string {
  // Remove common social media suffixes
  const practiceName = title
    .replace(/\s*[\|\-–—]\s*Facebook$/i, '')
    .replace(/\s*[\|\-–—]\s*Instagram$/i, '')
    .replace(/\s*\(@[^)]+\)$/i, '') // Remove Instagram handle
    .replace(/\s*[\|\-–—]\s*Home$/i, '')
    .trim();
  
  // If it's too generic, return empty
  if (practiceName.toLowerCase() === 'home' || practiceName.length < 3) {
    return '';
  }
  
  return practiceName;
}