/**
 * Mock research data for testing UI without API calls
 */

import type { ExtendedResearchData } from './types/research';
import type { ResearchStrategy } from './sequentialThinkingResearch';

export const MOCK_MODE = import.meta.env.DEV && 
  (window.location.search.includes('mock=true') || localStorage.getItem('mockMode') === 'true');

export function enableMockMode() {
  localStorage.setItem('mockMode', 'true');
  console.log('🧪 Mock mode enabled - refresh to use mock data');
}

export function disableMockMode() {
  localStorage.removeItem('mockMode');
  console.log('🚀 Mock mode disabled - refresh to use real APIs');
}

// Add to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).enableMockMode = enableMockMode;
  (window as any).disableMockMode = disableMockMode;
}

export async function mockSequentialThinking(params: any): Promise<any> {
  // Simulate thinking delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    thought: `Analyzing ${params.thought}... Found relevant information about practice technology and growth indicators.`,
    nextThoughtNeeded: params.thoughtNumber < params.totalThoughts,
    thoughtNumber: params.thoughtNumber || 1,
    totalThoughts: params.totalThoughts || 3,
    keyInsights: ['Practice uses modern technology', 'Growth indicators present'],
    nextActions: ['Search for website', 'Analyze reviews']
  };
}

export async function mockBraveSearch(query: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    web: {
      results: [
        {
          title: "Pure Dental - Modern Dentistry in Williamsville",
          url: "https://www.puredental.com",
          snippet: "Dr. Gregory White leads Pure Dental with cutting-edge technology including CBCT imaging and full arch implant capabilities..."
        },
        {
          title: "Dr. Gregory White DDS - Patient Reviews",
          url: "https://www.healthgrades.com/dentist/dr-gregory-white",
          snippet: "4.9/5 stars from 127 reviews. Patients praise Dr. White's expertise in oral surgery and implant procedures..."
        },
        {
          title: "Pure Dental Technology Stack",
          url: "https://www.puredental.com/technology",
          snippet: "Our practice features: Cone Beam CT (CBCT), Digital Impressions, Same-day crowns with CEREC, Guided implant surgery..."
        }
      ]
    }
  };
}

export async function mockFirecrawlScrape(url: string): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    content: `
# Pure Dental - Advanced Oral Surgery & Implant Center

## About Dr. Gregory White, DDS
Dr. White specializes in oral and maxillofacial surgery with over 15 years of experience. Board certified and fellowship trained in advanced implant techniques.

## Technology Stack
- **CBCT Imaging**: Latest generation Carestream CS 9600 for precise 3D imaging
- **Digital Workflow**: Full digital impressions with iTero Element 5D
- **Surgical Guides**: In-house 3D printing for guided surgery
- **Practice Management**: Eaglesoft with integrated patient communication

## Services
- Full arch implant rehabilitation (All-on-4, All-on-6)
- Complex bone grafting procedures
- Wisdom teeth extraction
- TMJ treatment
- Sleep apnea surgical solutions

## Recent Updates
- Expanded surgical suite with advanced monitoring (2024)
- Added second CBCT unit to reduce wait times
- Implemented AI-assisted treatment planning software
    `,
    metadata: {
      title: "Pure Dental - Dr. Gregory White",
      description: "Advanced oral surgery and implant center in Williamsville, NY"
    }
  };
}

export async function mockOpenRouterSynthesis(prompt: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const synthesis = {
    practiceProfile: {
      name: "Pure Dental",
      size: "Large multi-doctor practice",
      focus: "Oral surgery and advanced implantology"
    },
    technologyStack: {
      current: ["CBCT Carestream CS 9600", "iTero Element 5D", "Eaglesoft", "3D Printing"],
      gaps: ["Patient engagement platform", "AI treatment planning expansion", "Integrated lab communication"],
      readiness: "Early adopter - actively investing in technology"
    },
    buyingSignals: [
      "Recently expanded surgical suite",
      "Added second CBCT unit (capacity growth)",
      "Implementing AI-assisted planning",
      "Focus on efficiency and patient experience"
    ],
    painPoints: [
      "Managing high patient volume efficiently",
      "Coordinating complex cases across specialists",
      "Streamlining lab communication for same-day restorations"
    ],
    competition: {
      currentVendors: ["Eaglesoft", "Carestream", "iTero"],
      recentPurchases: ["Second CBCT unit", "AI treatment planning software"]
    },
    approachStrategy: {
      bestTiming: "Q1 - After holiday season, planning for year",
      preferredChannel: "Direct office visit or personalized email",
      keyMessage: "Enhance your advanced surgical capabilities with integrated solutions",
      avoidTopics: ["Price comparisons with current vendors initially"]
    },
    decisionMakers: {
      primary: "Dr. Gregory White - Owner/Lead Surgeon",
      influencers: ["Office Manager", "Lead Surgical Assistant", "IT Coordinator"]
    },
    salesBrief: `**TACTICAL SALES BRIEF**

**1. PRACTICE OVERVIEW**
Dr. Gregory White runs Pure Dental, a cutting-edge oral surgery center in Williamsville specializing in full arch implants and complex procedures. The practice features dual CBCT units, digital workflows, and in-house 3D printing, positioning them as technology leaders in the Buffalo market.

**2. OPPORTUNITY ANALYSIS**
• **Integration Gap**: While they have premium individual systems (Carestream CBCT, iTero, Eaglesoft), there's an opportunity to unify their digital workflow
• **Growth Management**: Recent expansion with second CBCT shows growth - they need scalable solutions for increasing patient volume
• **AI Enhancement**: Already implementing AI planning, indicating openness to advanced automation and efficiency tools

**3. RECOMMENDED APPROACH**
Schedule a brief 15-minute demo focused on workflow integration and efficiency gains. Lead with how your solution complements their existing Eaglesoft/CBCT setup. Emphasize ROI through time savings in treatment planning and case presentation. Best timing is early Q1 when they're planning annual technology investments. Prepare case studies from similar high-tech oral surgery practices.`
  };
  
  return JSON.stringify(synthesis);
}

export function createMockResearchData(): ExtendedResearchData {
  return {
    doctorName: "Dr. Gregory White",
    practiceInfo: {
      name: "Pure Dental",
      website: "https://www.puredental.com",
      phone: "(716) 555-0100",
      address: "5500 Main St, Williamsville, NY 14221",
      specialties: ["Oral Surgery", "Implantology"],
      technology: ["CBCT", "Digital Impressions", "3D Printing"]
    },
    credentials: {
      medicalSchool: "University at Buffalo School of Dental Medicine",
      boardCertifications: ["American Board of Oral and Maxillofacial Surgery"],
      yearsInPractice: 15
    },
    reviews: {
      averageRating: 4.9,
      totalReviews: 127,
      commonPraise: ["Expertise", "Technology", "Patient care"],
      commonConcerns: ["Wait times during busy periods"]
    },
    businessIntel: {
      practiceType: "Private Practice - Specialty",
      patientVolume: "High - 50+ surgeries/month",
      marketPosition: "Premium provider in Buffalo market",
      technologyStack: ["CBCT", "Eaglesoft", "iTero", "3D Printing"],
      specialty: "Oral and Maxillofacial Surgery"
    },
    sources: [
      {
        type: 'practice_website',
        title: 'Pure Dental Official Website',
        url: 'https://www.puredental.com',
        content: 'Comprehensive practice information including technology and services',
        confidence: 95,
        lastUpdated: new Date().toISOString()
      },
      {
        type: 'review_site',
        title: 'Healthgrades Reviews',
        url: 'https://www.healthgrades.com',
        content: '127 patient reviews with 4.9/5 average',
        confidence: 90,
        lastUpdated: new Date().toISOString()
      },
      {
        type: 'medical_directory',
        title: 'Technology Research',
        url: 'dental-technology-news.com',
        content: 'Featured article on practice technology adoption',
        confidence: 85,
        lastUpdated: new Date().toISOString()
      }
    ],
    confidenceScore: 92,
    completedAt: new Date().toISOString(),
    enhancedInsights: {
      practiceProfile: {
        size: "Large multi-doctor practice",
        focus: "Advanced surgical procedures"
      },
      technologyStack: {
        current: ["CBCT", "Digital workflow", "3D printing"],
        gaps: ["Integration platform", "AI expansion"],
        readiness: "Early adopter"
      },
      buyingSignals: ["Recent expansion", "Technology investment"],
      painPoints: ["Workflow efficiency", "Case coordination"],
      salesBrief: "Focus on integration and efficiency gains"
    }
  } as ExtendedResearchData;
}

export function createMockStrategy(): ResearchStrategy {
  return {
    searchQueries: [
      '"Dr. Gregory White" dentist Williamsville',
      '"Pure Dental" technology CBCT',
      '"Pure Dental" reviews patients'
    ],
    skipWebsiteScrape: false,
    skipReviews: false,
    skipCompetitorAnalysis: false,
    focusAreas: ['technology_stack', 'growth_indicators', 'patient_volume'],
    websiteUrl: 'https://www.puredental.com',
    competitorNames: ['Eaglesoft', 'Dentrix', 'Open Dental'],
    keyQuestions: [
      'What is their current technology stack?',
      'What are their growth indicators?',
      'Who makes purchasing decisions?',
      'What are their pain points?'
    ]
  };
}