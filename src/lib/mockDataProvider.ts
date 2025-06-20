/**
 * Mock Data Provider for Demo Mode
 * Provides rich, realistic sample data to showcase Canvas capabilities
 */

export interface MockDoctor {
  id: string;
  npi: string;
  name: string;
  title: string;
  specialty: string[];
  practiceInfo: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    website?: string;
  };
  procedures: {
    dental?: string[];
    aesthetic?: string[];
  };
  metrics: {
    patientVolume: string;
    yearsInPractice: number;
    acceptsNewPatients: boolean;
    insuranceAccepted: string[];
  };
  socialPresence: {
    hasWebsite: boolean;
    googleRating?: number;
    reviewCount?: number;
    lastActive?: string;
  };
  marketIntelligence: {
    competitorCount: number;
    marketShare: string;
    growthTrend: 'growing' | 'stable' | 'declining';
    opportunities: string[];
  };
  aiScore: number;
  insights: string[];
}

export const mockDoctors: MockDoctor[] = [
  {
    id: '1',
    npi: '1234567890',
    name: 'Dr. Sarah Chen',
    title: 'DDS, FICOI',
    specialty: ['Cosmetic Dentistry', 'Dental Implants'],
    practiceInfo: {
      name: 'Smile Innovations Dental Group',
      address: '789 Park Avenue',
      city: 'New York',
      state: 'NY',
      zip: '10021',
      phone: '(212) 555-0100',
      website: 'www.smileinnovationsny.com'
    },
    procedures: {
      dental: ['Dental Implants', 'All-on-4', 'Veneers', 'Invisalign', 'Teeth Whitening'],
      aesthetic: ['Botox', 'Dermal Fillers']
    },
    metrics: {
      patientVolume: 'High (2000+ active patients)',
      yearsInPractice: 15,
      acceptsNewPatients: true,
      insuranceAccepted: ['Delta Dental', 'Aetna', 'Cigna', 'MetLife']
    },
    socialPresence: {
      hasWebsite: true,
      googleRating: 4.8,
      reviewCount: 324,
      lastActive: '2 days ago'
    },
    marketIntelligence: {
      competitorCount: 12,
      marketShare: 'High (Top 10%)',
      growthTrend: 'growing',
      opportunities: [
        'Expanding implant services',
        'Strong digital presence',
        'Patient education focus'
      ]
    },
    aiScore: 92,
    insights: [
      'High-value practice with strong implant focus',
      'Excellent online reputation management',
      'Prime candidate for advanced implant solutions'
    ]
  },
  {
    id: '2',
    npi: '0987654321',
    name: 'Dr. Michael Rodriguez',
    title: 'DMD, AAFE',
    specialty: ['General Dentistry', 'Facial Aesthetics'],
    practiceInfo: {
      name: 'Rodriguez Family Dental',
      address: '456 Oak Street',
      city: 'Miami',
      state: 'FL',
      zip: '33133',
      phone: '(305) 555-0200',
      website: 'www.rodriguezdental.com'
    },
    procedures: {
      dental: ['Crowns', 'Bridges', 'Root Canals', 'Cleanings', 'Extractions'],
      aesthetic: ['Botox', 'Lip Fillers', 'PDO Threads', 'PRP Therapy']
    },
    metrics: {
      patientVolume: 'Medium (1000-1500 active patients)',
      yearsInPractice: 8,
      acceptsNewPatients: true,
      insuranceAccepted: ['Blue Cross', 'United Healthcare', 'Humana']
    },
    socialPresence: {
      hasWebsite: true,
      googleRating: 4.6,
      reviewCount: 156,
      lastActive: '1 week ago'
    },
    marketIntelligence: {
      competitorCount: 8,
      marketShare: 'Medium (Top 25%)',
      growthTrend: 'stable',
      opportunities: [
        'Growing aesthetic practice',
        'Hispanic market leader',
        'Expansion potential'
      ]
    },
    aiScore: 78,
    insights: [
      'Balanced dental/aesthetic practice',
      'Strong in local Hispanic community',
      'Opportunity for aesthetic product cross-selling'
    ]
  },
  {
    id: '3',
    npi: '1122334455',
    name: 'Dr. Jennifer Park',
    title: 'DDS, MS',
    specialty: ['Orthodontics', 'Pediatric Dentistry'],
    practiceInfo: {
      name: 'Park Orthodontics & Pediatric Dental',
      address: '123 Main Street',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      phone: '(206) 555-0300'
    },
    procedures: {
      dental: ['Braces', 'Invisalign', 'Retainers', 'Space Maintainers', 'Sealants']
    },
    metrics: {
      patientVolume: 'High (1800+ active patients)',
      yearsInPractice: 12,
      acceptsNewPatients: false,
      insuranceAccepted: ['Delta Dental', 'Premera', 'Regence']
    },
    socialPresence: {
      hasWebsite: false,
      googleRating: 4.7,
      reviewCount: 89,
      lastActive: '3 weeks ago'
    },
    marketIntelligence: {
      competitorCount: 6,
      marketShare: 'High (Top 15%)',
      growthTrend: 'growing',
      opportunities: [
        'No website - digital opportunity',
        'Waitlist indicates high demand',
        'Clear aligner growth potential'
      ]
    },
    aiScore: 85,
    insights: [
      'Successful practice at capacity',
      'Major digital presence opportunity',
      'Prime for practice management solutions'
    ]
  },
  {
    id: '4',
    npi: '5544332211',
    name: 'Dr. James Thompson',
    title: 'DDS, MAGD',
    specialty: ['General Dentistry', 'Sedation Dentistry'],
    practiceInfo: {
      name: 'Comfort Dental Care',
      address: '789 Elm Avenue',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      phone: '(303) 555-0400',
      website: 'www.comfortdentaldenver.com'
    },
    procedures: {
      dental: ['Full Mouth Restoration', 'Sedation Dentistry', 'TMJ Treatment', 'Sleep Apnea'],
      aesthetic: ['Smile Makeovers']
    },
    metrics: {
      patientVolume: 'Medium (1200 active patients)',
      yearsInPractice: 20,
      acceptsNewPatients: true,
      insuranceAccepted: ['Most PPO plans accepted']
    },
    socialPresence: {
      hasWebsite: true,
      googleRating: 4.9,
      reviewCount: 412,
      lastActive: 'Today'
    },
    marketIntelligence: {
      competitorCount: 15,
      marketShare: 'Medium (Top 20%)',
      growthTrend: 'stable',
      opportunities: [
        'Niche in anxiety patients',
        'Complex case expertise',
        'Referral network potential'
      ]
    },
    aiScore: 81,
    insights: [
      'Specializes in complex cases',
      'Excellent reputation for patient comfort',
      'Opportunity for sedation-related products'
    ]
  },
  {
    id: '5',
    npi: '9988776655',
    name: 'Dr. Lisa Wang',
    title: 'DMD, AAACD',
    specialty: ['Cosmetic Dentistry', 'Prosthodontics'],
    practiceInfo: {
      name: 'Beverly Hills Smile Studio',
      address: '9000 Wilshire Blvd',
      city: 'Beverly Hills',
      state: 'CA',
      zip: '90210',
      phone: '(310) 555-0500',
      website: 'www.beverlyhillssmilestudio.com'
    },
    procedures: {
      dental: ['Porcelain Veneers', 'Smile Design', 'Full Mouth Rehabilitation', 'Ceramic Crowns'],
      aesthetic: ['Lip Enhancement', 'Facial Rejuvenation']
    },
    metrics: {
      patientVolume: 'Low-Medium (500 active patients)',
      yearsInPractice: 18,
      acceptsNewPatients: true,
      insuranceAccepted: ['Out of network for all plans']
    },
    socialPresence: {
      hasWebsite: true,
      googleRating: 5.0,
      reviewCount: 198,
      lastActive: 'Yesterday'
    },
    marketIntelligence: {
      competitorCount: 20,
      marketShare: 'Niche (Top 5% by price)',
      growthTrend: 'growing',
      opportunities: [
        'Celebrity clientele',
        'Premium market leader',
        'International patient draw'
      ]
    },
    aiScore: 94,
    insights: [
      'Ultra-premium practice',
      'Influencer marketing opportunity',
      'High-ticket case potential'
    ]
  }
];

export interface MockMarketData {
  region: string;
  totalPractices: number;
  averagePatientValue: number;
  growthRate: string;
  topProcedures: string[];
  competitiveLandscape: {
    consolidation: string;
    dsoPresence: string;
    independentStrength: string;
  };
}

export const mockMarketIntelligence: MockMarketData = {
  region: 'National Overview',
  totalPractices: 186420,
  averagePatientValue: 1250,
  growthRate: '3.2% annually',
  topProcedures: [
    'Dental Implants (+12% YoY)',
    'Clear Aligners (+18% YoY)',
    'Cosmetic Dentistry (+8% YoY)',
    'Sleep Apnea Treatment (+22% YoY)',
    'Facial Aesthetics (+35% YoY)'
  ],
  competitiveLandscape: {
    consolidation: 'Accelerating - 30% DSO owned',
    dsoPresence: 'Growing in urban markets',
    independentStrength: 'Strong in suburban/rural'
  }
};

export interface MockInsight {
  category: 'opportunity' | 'strategy' | 'competitive' | 'trend';
  title: string;
  description: string;
  actionItems: string[];
  impact: 'high' | 'medium' | 'low';
}

export const mockAgentInsights: MockInsight[] = [
  {
    category: 'opportunity',
    title: 'Implant Market Expansion',
    description: 'Dental implant procedures are growing 12% YoY with average case values of $3,000-$5,000.',
    actionItems: [
      'Target practices with 10+ years experience',
      'Focus on All-on-4 certified doctors',
      'Highlight financing options'
    ],
    impact: 'high'
  },
  {
    category: 'strategy',
    title: 'Digital Practice Gap',
    description: '40% of practices lack modern websites or online booking, creating opportunity for digital solutions.',
    actionItems: [
      'Lead with digital presence audit',
      'Offer website + marketing bundles',
      'Show ROI from online patients'
    ],
    impact: 'high'
  },
  {
    category: 'competitive',
    title: 'DSO Consolidation Defense',
    description: 'Help independent practices compete with DSOs through efficiency and patient experience.',
    actionItems: [
      'Emphasize personalized care advantage',
      'Provide tools for operational efficiency',
      'Build referral networks'
    ],
    impact: 'medium'
  },
  {
    category: 'trend',
    title: 'Aesthetic Integration Rising',
    description: 'Dental practices adding aesthetic services see 25% revenue increase on average.',
    actionItems: [
      'Cross-sell aesthetic products',
      'Provide training resources',
      'Connect with aesthetic suppliers'
    ],
    impact: 'high'
  }
];

export class MockDataProvider {
  static getDoctors(): MockDoctor[] {
    return mockDoctors;
  }
  
  static getDoctor(id: string): MockDoctor | undefined {
    return mockDoctors.find(doc => doc.id === id);
  }
  
  static searchDoctors(query: string): MockDoctor[] {
    const lowercaseQuery = query.toLowerCase();
    return mockDoctors.filter(doc => 
      doc.name.toLowerCase().includes(lowercaseQuery) ||
      doc.practiceInfo.name.toLowerCase().includes(lowercaseQuery) ||
      doc.specialty.some(s => s.toLowerCase().includes(lowercaseQuery)) ||
      doc.practiceInfo.city.toLowerCase().includes(lowercaseQuery)
    );
  }
  
  static getMarketIntelligence(): MockMarketData {
    return mockMarketIntelligence;
  }
  
  static getAgentInsights(doctorId?: string): MockInsight[] {
    // Could filter insights based on doctor specialty/profile
    return mockAgentInsights;
  }
  
  static generatePersonalizedStrategy(doctor: MockDoctor): string[] {
    const strategies = [];
    
    if (doctor.aiScore > 90) {
      strategies.push('Premium partnership opportunity - high-value practice');
    }
    
    if (!doctor.socialPresence.hasWebsite) {
      strategies.push('Digital transformation candidate - no current website');
    }
    
    if (doctor.procedures.aesthetic && doctor.procedures.aesthetic.length > 0) {
      strategies.push('Cross-selling opportunity for aesthetic products');
    }
    
    if (doctor.metrics.acceptsNewPatients) {
      strategies.push('Growth-oriented practice - actively accepting patients');
    }
    
    return strategies;
  }
}