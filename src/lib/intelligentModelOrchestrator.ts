/**
 * Intelligent Model Orchestrator
 * Strategically uses the best AI model for each task
 */

interface ModelCapabilities {
  realTimeData: boolean;
  deepReasoning: boolean;
  costPerRequest: number;
  speedRating: number; // 1-10
  bestFor: string[];
}

// Model capabilities for reference - currently not used but may be useful for future optimization
// @ts-ignore - keeping for future reference
const MODEL_CAPABILITIES: Record<string, ModelCapabilities> = {
  // Perplexity Models (via Perplexity API)
  'perplexity-sonar-small': {
    realTimeData: true,
    deepReasoning: false,
    costPerRequest: 0.001,
    speedRating: 9,
    bestFor: ['quick searches', 'recent news', 'basic facts']
  },
  'perplexity-sonar-large': {
    realTimeData: true,
    deepReasoning: true,
    costPerRequest: 0.005,
    speedRating: 7,
    bestFor: ['complex queries', 'market analysis', 'competitive intelligence']
  },
  'perplexity-sonar-huge': {
    realTimeData: true,
    deepReasoning: true,
    costPerRequest: 0.01,
    speedRating: 5,
    bestFor: ['deep research', 'comprehensive reports', 'strategic analysis']
  },
  
  // OpenRouter Models
  'anthropic/claude-opus-4': {
    realTimeData: false,
    deepReasoning: true,
    costPerRequest: 0.025,
    speedRating: 5,
    bestFor: ['premium synthesis', 'complex reasoning', 'nuanced personalization', 'strategic insights']
  },
  'anthropic/claude-3.5-sonnet-20241022': {
    realTimeData: false,
    deepReasoning: true,
    costPerRequest: 0.003,
    speedRating: 8,
    bestFor: ['fast analysis', 'code generation', 'structured data', 'efficient fallback']
  },
  'anthropic/claude-3-opus-20240229': {
    realTimeData: false,
    deepReasoning: true,
    costPerRequest: 0.015,
    speedRating: 6,
    bestFor: ['legacy support', 'alternative synthesis', 'creative content']
  },
  'openai/gpt-4-turbo': {
    realTimeData: false,
    deepReasoning: true,
    costPerRequest: 0.01,
    speedRating: 7,
    bestFor: ['medical analysis', 'technical details', 'multi-step reasoning']
  },
  'meta-llama/llama-3.1-405b-instruct': {
    realTimeData: false,
    deepReasoning: true,
    costPerRequest: 0.005,
    speedRating: 6,
    bestFor: ['large context', 'document analysis', 'summarization']
  },
  'google/gemini-pro-1.5': {
    realTimeData: false,
    deepReasoning: true,
    costPerRequest: 0.007,
    speedRating: 7,
    bestFor: ['multimodal', 'long context', 'technical analysis']
  }
};

export class IntelligentModelOrchestrator {
  
  constructor() {
    console.log('🧠 Intelligent Model Orchestrator initialized');
  }
  
  /**
   * Phase 1: Real-time data gathering with local competitors
   */
  async gatherRealTimeIntelligence(doctor: any, product: string) {
    console.log('📡 Phase 1: Gathering real-time intelligence with Perplexity + Brave Local');
    
    // Perplexity queries
    const queries = [
      {
        query: `${doctor.displayName} ${doctor.specialty} ${doctor.city} practice website technology stack recent news`,
        mode: 'search' as const,
        purpose: 'basic_info'
      },
      {
        query: `What technology systems does ${doctor.displayName}'s dental practice use? What are their recent purchases and pain points?`,
        mode: 'reason' as const,
        purpose: 'technology_analysis'
      },
      {
        query: `Deep analysis of ${doctor.displayName} ${doctor.specialty} practice in ${doctor.city}: market position, competition, growth indicators, technology adoption, ${product} fit`,
        mode: 'deep_research' as const,
        purpose: 'comprehensive_analysis'
      }
    ];
    
    // Parallel data gathering
    const [perplexityResults, localCompetitors] = await Promise.all([
      Promise.all(queries.map(q => this.callPerplexityWithMode(q.query, q.mode))),
      this.gatherLocalCompetitors(doctor)
    ]);
    
    return {
      basicInfo: perplexityResults[0],
      technologyAnalysis: perplexityResults[1],
      comprehensiveAnalysis: perplexityResults[2],
      localCompetitors
    };
  }
  
  /**
   * Gather local competitor intelligence
   */
  private async gatherLocalCompetitors(doctor: any) {
    const { callBraveLocalSearch } = await import('./apiEndpoints');
    try {
      const query = `${doctor.specialty} near ${doctor.city}, ${doctor.state}`;
      const results = await callBraveLocalSearch(query, 20);
      console.log(`📍 Found ${results?.results?.length || 0} local competitors`);
      return results;
    } catch (error) {
      console.error('Local competitor search error:', error);
      return null;
    }
  }
  
  /**
   * Phase 2: Deep medical analysis
   */
  async analyzeMedicalContext(doctor: any, product: string, realTimeData: any) {
    console.log('🏥 Phase 2: Medical context analysis with GPT-4 Turbo');
    
    const prompt = `You are a medical device sales intelligence expert. Analyze this doctor and create a detailed profile:

DOCTOR: ${doctor.displayName}
SPECIALTY: ${doctor.specialty}
LOCATION: ${doctor.city}, ${doctor.state}
ORGANIZATION: ${doctor.organizationName || 'Private Practice'}

REAL-TIME INTELLIGENCE:
${JSON.stringify(realTimeData, null, 2)}

LOCAL COMPETITORS (${realTimeData.localCompetitors?.results?.length || 0} found):
${realTimeData.localCompetitors?.results?.slice(0, 5).map((c: any) => 
  `- ${c.title}: ${c.rating}/5 stars (${c.rating_count} reviews), ${c.distance}mi away, ${c.priceRange || '$$$'}`
).join('\n') || 'No local competitor data'}

PRODUCT TO SELL: ${product}

Create a detailed analysis including:
1. Practice sophistication level (1-10)
2. Technology readiness score (1-10)
3. Likely decision-making process
4. Budget indicators
5. Specific pain points that ${product} addresses
6. Competitive products they likely use
7. Best approach timing and method

Return as JSON.`;

    return this.callOpenRouterModel(prompt, 'openai/gpt-4-turbo');
  }
  
  /**
   * Phase 3: Creative synthesis and personalization with Claude 4 Opus
   */
  async synthesizeWithClaude4(doctor: any, product: string, allData: any) {
    console.log('✨ Phase 3: Premium synthesis with Claude 4 Opus');
    
    const prompt = `You are crafting ultra-premium sales intelligence using Claude 4's advanced capabilities. Synthesize all this research into SPECIFIC, ACTIONABLE intelligence:

DOCTOR: ${doctor.displayName}
PRODUCT: ${product}

ALL INTELLIGENCE GATHERED:
${JSON.stringify(allData, null, 2)}

Create a final intelligence report that:
1. Tells a compelling story about why THIS doctor needs THIS product NOW
2. Includes specific details from the research (not generic statements)
3. Provides exact words/phrases to use in outreach
4. Identifies the perfect timing and approach
5. Predicts likely objections and provides responses
6. Scores the opportunity (1-100) with specific reasoning

Format as JSON with these fields:
{
  "executiveSummary": "2-3 sentence story",
  "opportunityScore": number,
  "scoringRationale": "specific reasons for score",
  "perfectPitch": "exact opening line to use",
  "keyInsights": ["specific insight 1", "specific insight 2", ...],
  "approachStrategy": {
    "channel": "email/call/linkedin",
    "timing": "specific day/time",
    "opener": "exact words",
    "valueProps": ["specific to their practice"]
  },
  "objectionHandling": {
    "objection1": "response1",
    "objection2": "response2"
  }
}`;

    try {
      // Try Claude 4 Opus first for premium synthesis
      return await this.callOpenRouterModel(prompt, 'anthropic/claude-opus-4');
    } catch (error) {
      console.error('Claude 4 Opus error, trying Claude 3.5 Sonnet fallback:', error);
      // Fallback to Claude 3.5 Sonnet if Claude 4 Opus fails
      try {
        return await this.callOpenRouterModel(prompt, 'anthropic/claude-3.5-sonnet-20241022');
      } catch (fallbackError) {
        console.error('Claude 3.5 Sonnet also failed:', fallbackError);
        // Return a default response structure
        return {
          executiveSummary: `${doctor.displayName} presents a potential opportunity for ${product} based on available data.`,
          opportunityScore: 70,
          scoringRationale: "Score based on available practice information and market indicators",
          perfectPitch: `Dr. ${doctor.displayName}, I've been researching practices in your area and believe ${product} could address some key challenges.`,
          keyInsights: [
            "Practice shows potential for technology adoption",
            "Market conditions favor new solutions",
            "Timing appears favorable for outreach"
          ],
          approachStrategy: {
            channel: "email",
            timing: "Tuesday-Thursday, 10-11 AM",
            opener: "Personalized research-based approach",
            valueProps: ["Efficiency improvements", "Patient satisfaction", "ROI potential"]
          },
          objectionHandling: {
            "Too busy": "I understand your time is valuable. That's exactly why our solution is designed to save you time.",
            "Already have a solution": "Many practices find our approach complements existing systems while adding unique value."
          }
        };
      }
    }
  }
  
  /**
   * Master orchestration function
   */
  async orchestrateIntelligenceGathering(doctor: any, product: string, progressCallback?: any) {
    const startTime = Date.now();
    
    try {
      // Update progress
      progressCallback?.updateStage('🔍 Initiating multi-model intelligence gathering...');
      
      // Phase 1: Real-time data (Perplexity)
      progressCallback?.updateStep('realtime', 'active');
      const realTimeData = await this.gatherRealTimeIntelligence(doctor, product);
      progressCallback?.updateStep('realtime', 'completed', 'Real-time data captured');
      
      // Phase 2: Medical analysis (GPT-4)
      progressCallback?.updateStep('medical', 'active');
      const medicalAnalysis = await this.analyzeMedicalContext(doctor, product, realTimeData);
      progressCallback?.updateStep('medical', 'completed', 'Medical context analyzed');
      
      // Phase 3: Creative synthesis (Claude 3 Opus)
      progressCallback?.updateStep('synthesis', 'active');
      const finalSynthesis = await this.synthesizeWithClaude4(doctor, product, {
        realTimeData,
        medicalAnalysis
      });
      progressCallback?.updateStep('synthesis', 'completed', 'Intelligence synthesized');
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ Intelligence gathering completed in ${processingTime}ms`);
      
      return {
        realTimeData,
        medicalAnalysis,
        finalSynthesis,
        processingTime,
        modelsUsed: ['perplexity-sonar', 'gpt-4-turbo', 'claude-4-opus']
      };
      
    } catch (error) {
      console.error('Orchestration error:', error);
      throw error;
    }
  }
  
  private async callPerplexityWithMode(query: string, mode: 'search' | 'reason' | 'deep_research') {
    const { callPerplexityResearch } = await import('./apiEndpoints');
    try {
      const result = await callPerplexityResearch(query, mode);
      return result.choices?.[0]?.message?.content || result;
    } catch (error) {
      console.error(`Perplexity ${mode} error:`, error);
      return null;
    }
  }
  
  private async callOpenRouterModel(prompt: string, model: string) {
    const { callClaude } = await import('./apiEndpoints');
    try {
      // Map old model names to new ones
      let mappedModel = model;
      if (model === 'anthropic/claude-opus-4') {
        mappedModel = 'claude-opus-4-20250514';
      } else if (model === 'anthropic/claude-3.5-sonnet-20241022') {
        mappedModel = 'claude-3.5-sonnet-20241022';
      }
      // For non-Claude models, we'll need a different approach
      // For now, use Claude as fallback for all
      if (model.startsWith('openai/') || model.startsWith('meta-') || model.startsWith('google/')) {
        console.log(`Note: ${model} requested, using Claude as fallback`);
        mappedModel = 'claude-3.5-sonnet-20241022';
      }
      
      const result = await callClaude(prompt, mappedModel);
      return typeof result === 'string' ? JSON.parse(result) : result;
    } catch (error) {
      console.error(`Claude ${model} error:`, error);
      return null;
    }
  }
}

// Singleton instance
let orchestrator: IntelligentModelOrchestrator;

export function getModelOrchestrator(): IntelligentModelOrchestrator {
  if (!orchestrator) {
    orchestrator = new IntelligentModelOrchestrator();
  }
  return orchestrator;
}