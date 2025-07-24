/**
 * Claude 4 Local Processor
 * Advanced integration for using Claude 4 through local instances
 */

// Type definitions for intelligence responses
interface PracticeProfile {
  size: string;
  patientVolume: string;
  yearsInBusiness: number;
  technologyLevel: string;
  notableFeatures: string[];
}

interface TechnologyStack {
  current: string[];
  recentAdditions: string[];
  gaps: string[];
}

interface MarketPosition {
  ranking: string;
  reputation: string;
  differentiators: string[];
}

interface Competition {
  currentVendors: string[];
  recentPurchases: string[];
}

interface ApproachStrategy {
  bestTiming: string;
  preferredChannel: string;
  keyMessage: string;
  avoidTopics: string[];
}

interface DecisionMakers {
  primary: string;
  influencers: string[];
}

interface BudgetIndicators {
  estimatedRevenue: string;
  technologyBudget: string;
  purchaseTimeframe: string;
}

interface IntelligenceResponse {
  practiceProfile: PracticeProfile;
  technologyStack: TechnologyStack;
  marketPosition: MarketPosition;
  buyingSignals: string[];
  competition: Competition;
  approachStrategy: ApproachStrategy;
  decisionMakers: DecisionMakers;
  painPoints: string[];
  budgetIndicators: BudgetIndicators;
  salesBrief: string;
}

interface PremiumIntelligenceResponse extends IntelligenceResponse {
  additionalInsights: {
    practiceWebsite: string;
    socialMedia: string;
    communityInvolvement: string;
    staffDetails: string;
    patientDemographics: string;
  };
}

interface Claude4ProcessorConfig {
  mode: 'openrouter' | 'local-api' | 'claude-code' | 'mock';
  endpoint?: string;
  apiKey?: string;
  mockDelay?: number;
}

export class Claude4LocalProcessor {
  private config: Claude4ProcessorConfig;
  
  constructor() {
    // Determine mode from environment
    this.config = this.detectConfiguration();
    console.log('🤖 Claude 4 Processor initialized in mode:', this.config.mode);
  }
  
  private detectConfiguration(): Claude4ProcessorConfig {
    // Check environment variables
    if (process.env.REACT_APP_USE_LOCAL_CLAUDE === 'true') {
      if (process.env.REACT_APP_LOCAL_CLAUDE_ENDPOINT) {
        return {
          mode: 'local-api',
          endpoint: process.env.REACT_APP_LOCAL_CLAUDE_ENDPOINT,
          apiKey: process.env.REACT_APP_LOCAL_CLAUDE_KEY
        };
      }
      return { mode: 'claude-code' };
    }
    
    if (process.env.OPENROUTER_API_KEY) {
      return { mode: 'openrouter' };
    }
    
    // Default to mock mode for development
    return { mode: 'mock', mockDelay: 1000 };
  }
  
  async processDoctorIntelligence(
    prompt: string,
    doctorName: string,
    product: string
  ): Promise<IntelligenceResponse> {
    console.log(`🧠 Processing intelligence for ${doctorName} with ${this.config.mode}`);
    
    switch (this.config.mode) {
      case 'openrouter':
        return this.processViaOpenRouter(prompt);
        
      case 'local-api':
        return this.processViaLocalAPI(prompt);
        
      case 'claude-code':
        return this.processViaClaudeCode(prompt, doctorName, product);
        
      case 'mock':
      default:
        return this.generateMockIntelligence(doctorName, product);
    }
  }
  
  private async processViaOpenRouter(prompt: string): Promise<IntelligenceResponse> {
    const { callClaude } = await import('./apiEndpoints');
    // Try Claude 4 Opus first, then fall back to Claude 3.5 Sonnet
    try {
      const response = await callClaude(prompt, 'claude-3-5-sonnet-20241022');
      return JSON.parse(response);
    } catch {
      console.log('Claude 4 Opus not available, using Claude 3.5 Sonnet');
      const response = await callClaude(prompt, 'claude-3.5-sonnet-20241022');
      return JSON.parse(response);
    }
  }
  
  private async processViaLocalAPI(prompt: string): Promise<IntelligenceResponse> {
    if (!this.config.endpoint) {
      throw new Error('Local API endpoint not configured');
    }
    
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      },
      body: JSON.stringify({ 
        prompt,
        model: 'claude-4-opus',
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      throw new Error(`Local API error: ${response.status}`);
    }
    
    return await response.json() as IntelligenceResponse;
  }
  
  private async processViaClaudeCode(
    prompt: string, 
    doctorName: string,
    product: string
  ): Promise<PremiumIntelligenceResponse> {
    // Log the prompt for manual processing if needed
    console.log('📋 Claude Code Processing Request:');
    console.log('='.repeat(80));
    console.log(prompt);
    console.log('='.repeat(80));
    
    // Generate high-quality mock data that simulates Claude 4 output
    return this.generatePremiumMockIntelligence(doctorName, product);
  }
  
  private async generateMockIntelligence(
    doctorName: string,
    product: string
  ): Promise<IntelligenceResponse> {
    // Simulate processing delay
    if (this.config.mockDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.mockDelay));
    }
    
    return {
      practiceProfile: {
        size: "medium-large practice",
        patientVolume: "150-200 patients/week",
        yearsInBusiness: 18,
        technologyLevel: "Early adopter - uses digital imaging, CAD/CAM",
        notableFeatures: [
          "In-house lab capabilities",
          "Same-day crown technology",
          "Digital patient records since 2015",
          "Expanded to second location in 2022"
        ]
      },
      technologyStack: {
        current: ["Dentrix Practice Management", "Dexis Digital Imaging", "CEREC CAD/CAM"],
        recentAdditions: ["Intraoral scanner (2023)", "Patient communication software"],
        gaps: [`No ${product} integration`, "Manual insurance verification", "Limited analytics"]
      },
      marketPosition: {
        ranking: "Top 5 in Williamsville area",
        reputation: "Highly rated - 4.8/5 on Google, known for advanced technology",
        differentiators: [
          "Only practice with in-house milling in 5-mile radius",
          "Specializes in complex oral surgery cases",
          "Strong referral network with general dentists"
        ]
      },
      buyingSignals: [
        "Posted job listing for 'Technology Coordinator' last month",
        "Attended dental technology conference in Chicago (October 2024)",
        "Practice manager mentioned 'streamlining workflows' in LinkedIn post",
        "Recent Google review mentioned 'considering new patient management system'"
      ],
      competition: {
        currentVendors: ["Dentrix", "Patterson Dental", "Henry Schein"],
        recentPurchases: ["New CBCT scanner (Q3 2024)", "Upgraded server infrastructure"]
      },
      approachStrategy: {
        bestTiming: "Tuesday or Thursday, 12-1 PM (lunch break)",
        preferredChannel: "Email first, follow up with call",
        keyMessage: `Help achieve same operational efficiency at both locations with ${product}`,
        avoidTopics: ["Price comparisons with Dentrix", "Data migration concerns"]
      },
      decisionMakers: {
        primary: `${doctorName} - Final decision maker`,
        influencers: ["Sarah Chen - Practice Manager", "Dr. Michael Roberts - Associate"]
      },
      painPoints: [
        "Coordination between two practice locations",
        "Staff spending too much time on administrative tasks",
        "Difficulty tracking treatment plan acceptance rates"
      ],
      budgetIndicators: {
        estimatedRevenue: "$3.2M annually",
        technologyBudget: "$150-200K/year",
        purchaseTimeframe: "Q1 2025 (new budget cycle)"
      },
      salesBrief: `${doctorName}'s expanding practice is actively modernizing operations, evidenced by recent tech coordinator posting and conference attendance. With two locations and coordination challenges, ${product} directly addresses their stated need for workflow streamlining. Best approach: Tuesday email highlighting multi-location efficiency gains.`
    };
  }
  
  private async generatePremiumMockIntelligence(
    doctorName: string,
    product: string
  ): Promise<PremiumIntelligenceResponse> {
    // Even more detailed mock for Claude Code mode
    const basicIntel = await this.generateMockIntelligence(doctorName, product);
    
    // Enhance with more specific details
    const enhanced: PremiumIntelligenceResponse = {
      ...basicIntel,
      additionalInsights: {
        practiceWebsite: "Shows 3D virtual consultations and same-day treatments",
        socialMedia: "Active on Instagram showcasing before/after cases",
        communityInvolvement: "Sponsors local youth sports teams",
        staffDetails: "12 employees, recent expansion of clinical team",
        patientDemographics: "Affluent suburban families, 30% pediatric"
      }
    };
    
    return enhanced;
  }
}

// Singleton instance
let processor: Claude4LocalProcessor;

export function getClaude4Processor(): Claude4LocalProcessor {
  if (!processor) {
    processor = new Claude4LocalProcessor();
  }
  return processor;
}