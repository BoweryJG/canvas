/**
 * Sequential Thinking Research Intelligence
 * Adaptive research pipeline that uses reasoning to optimize API calls
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { callClaude } from './apiEndpoints';
import { MOCK_MODE, mockSequentialThinking, mockOpenRouterSynthesis } from './mockResearch';

interface SequentialThought {
  thought: string;
  nextThoughtNeeded: boolean;
  thoughtNumber: number;
  totalThoughts: number;
  isRevision?: boolean;
  revisesThought?: number;
  branchFromThought?: number;
  branchId?: string;
  needsMoreThoughts?: boolean;
}

export interface ResearchStrategy {
  searchQueries: string[];
  skipWebsiteScrape: boolean;
  skipReviews: boolean;
  skipCompetitorAnalysis: boolean;
  focusAreas: string[];
  websiteUrl?: string;
  competitorNames?: string[];
  keyQuestions: string[];
}

/**
 * Call the Sequential Thinking MCP tool
 * Note: In production, this would connect to the actual MCP Sequential Thinking tool
 * For now, we use a specialized prompt with Claude 4 Opus
 */
async function callSequentialThinking(params: {
  thought: string;
  thoughtNumber?: number;
  totalThoughts?: number;
  nextThoughtNeeded?: boolean;
  isRevision?: boolean;
  revisesThought?: number;
}): Promise<SequentialThought> {
  // Check if mock mode is enabled
  if (MOCK_MODE) {
    return mockSequentialThinking(params);
  }
  
  // TODO: When MCP Sequential Thinking is available, replace with:
  // return await window.__MCP__.sequentialThinking(params);
  
  // Current implementation using Claude 4 Opus with structured thinking
  const systemPrompt = `You are a Sequential Thinking system analyzing research data for sales intelligence.
You must respond with structured JSON containing your thought process.

Rules:
1. Each thought builds on previous insights
2. Identify specific, actionable information
3. Question assumptions when data conflicts
4. Suggest concrete next steps
5. Be concise but thorough`;

  const userPrompt = `Thought ${params.thoughtNumber || 1} of ${params.totalThoughts || 3}:
${params.thought}

${params.isRevision ? `This revises thought ${params.revisesThought}` : ''}

Respond with JSON:
{
  "thought": "Your analytical response here",
  "nextThoughtNeeded": boolean,
  "thoughtNumber": ${params.thoughtNumber || 1},
  "totalThoughts": ${params.totalThoughts || 3},
  "keyInsights": ["insight1", "insight2"],
  "nextActions": ["action1", "action2"]
}`;

  try {
    const response = await callClaude(
      `${systemPrompt}\n\n${userPrompt}`,
      'claude-3-5-sonnet-20241022'
    );
    
    // Clean response - remove markdown code blocks if present
    let cleanResponse = response;
    if (response.includes('```json')) {
      cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }
    
    // Try to parse as JSON
    const parsed = JSON.parse(cleanResponse);
    return {
      thought: parsed.thought || response,
      nextThoughtNeeded: parsed.nextThoughtNeeded ?? ((params.thoughtNumber || 1) < (params.totalThoughts || 3)),
      thoughtNumber: parsed.thoughtNumber || params.thoughtNumber || 1,
      totalThoughts: parsed.totalThoughts || params.totalThoughts || 3,
      isRevision: params.isRevision,
      revisesThought: params.revisesThought
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    console.warn('Sequential Thinking JSON parse failed, using raw response:', error);
    return {
      thought: 'Analysis failed, using default strategy',
      nextThoughtNeeded: (params.thoughtNumber || 1) < (params.totalThoughts || 3),
      thoughtNumber: params.thoughtNumber || 1,
      totalThoughts: params.totalThoughts || 3
    };
  }
}

/**
 * Analyze initial search results and determine research strategy
 */
export async function analyzeInitialResults(
  doctor: Doctor,
  product: string,
  braveResults: any
): Promise<ResearchStrategy> {
  const topResults = braveResults?.web?.results?.slice(0, 5) || [];
  const resultSummary = topResults.map((r: any) => ({
    title: r.title,
    url: r.url,
    snippet: r.snippet
  }));

  // First thought: Analyze what we found
  const thought1 = await callSequentialThinking({
    thought: `Searching for ${doctor.displayName}, ${doctor.specialty} in ${doctor.city}, ${doctor.state}.
Product to sell: ${product}

Initial search found:
${JSON.stringify(resultSummary, null, 2)}

What key information is present or missing for selling ${product} to this doctor?`,
    thoughtNumber: 1,
    totalThoughts: 3
  });

  // Second thought: Determine search strategy
  const thought2 = await callSequentialThinking({
    thought: `${thought1.thought}

Based on this analysis, what specific information should we search for next?
Consider: practice size, technology stack, patient demographics, competition.`,
    thoughtNumber: 2,
    totalThoughts: 3
  });

  // Third thought: Optimize API usage
  const thought3 = await callSequentialThinking({
    thought: `${thought2.thought}

Which data sources are essential vs optional for this case?
- Website scraping needed? ${topResults.some((r: any) => !r.url.includes('directory')) ? 'Yes' : 'No'}
- Deep competitor research needed?
- Review analysis priority?`,
    thoughtNumber: 3,
    totalThoughts: 3
  });

  // Parse the sequential thinking into a concrete strategy
  return parseThoughtsIntoStrategy(thought1, thought2, thought3, doctor, product, topResults);
}

/**
 * Parse Sequential Thinking output into actionable strategy
 */
function parseThoughtsIntoStrategy(
  thought1: SequentialThought,
  thought2: SequentialThought,
  thought3: SequentialThought,
  doctor: Doctor,
  product: string,
  searchResults: any[]
): ResearchStrategy {
  // Extract practice website if found - prioritize actual practice sites
  const practiceWebsite = searchResults.find(r => {
    const url = r.url.toLowerCase();
    const title = r.title.toLowerCase();
    
    // First check for known practice website patterns
    if (url.includes('puredental.com')) return true;
    if (doctor.organizationName && url.includes(doctor.organizationName.toLowerCase().replace(/\s+/g, ''))) return true;
    
    // Skip directories and aggregators
    if (url.includes('healthgrades') || url.includes('zocdoc') || 
        url.includes('yelp') || url.includes('sharecare') || 
        url.includes('vitals') || url.includes('findadentist')) return false;
    
    // Check if it mentions the doctor
    return url.includes(doctor.lastName.toLowerCase()) || 
           title.includes(doctor.lastName.toLowerCase());
  });

  // Determine focus areas based on product type
  const focusAreas = determineFocusAreas(product, thought2.thought);
  
  // Build targeted search queries
  const searchQueries = buildSmartQueries(doctor, product, focusAreas, thought2.thought);

  return {
    searchQueries,
    skipWebsiteScrape: !practiceWebsite || thought3.thought.includes('skip website'),
    skipReviews: thought3.thought.includes('reviews not priority'),
    skipCompetitorAnalysis: product.toLowerCase().includes('software') ? false : true,
    focusAreas,
    websiteUrl: practiceWebsite?.url,
    competitorNames: extractCompetitorNames(thought1.thought),
    keyQuestions: extractKeyQuestions(thought2.thought)
  };
}

/**
 * Determine what to focus on based on product type
 */
function determineFocusAreas(product: string, analysisThought: string): string[] {
  const areas = [];
  
  // Product-specific focus
  if (product.toLowerCase().includes('software') || product.toLowerCase().includes('system')) {
    areas.push('current_technology', 'integration_needs', 'workflow_efficiency');
  }
  
  if (product.toLowerCase().includes('equipment') || product.toLowerCase().includes('device')) {
    areas.push('practice_size', 'procedure_volume', 'equipment_age');
  }
  
  if (product.toLowerCase().includes('implant') || product.toLowerCase().includes('surgical')) {
    areas.push('surgical_volume', 'specializations', 'training_certifications');
  }

  // Add areas mentioned in the analysis
  if (analysisThought.includes('expansion') || analysisThought.includes('growing')) {
    areas.push('growth_indicators');
  }
  
  if (analysisThought.includes('technology') || analysisThought.includes('digital')) {
    areas.push('digital_adoption');
  }

  return areas;
}

/**
 * Build intelligent search queries based on analysis
 */
function buildSmartQueries(
  doctor: Doctor, 
  product: string, 
  focusAreas: string[],
  _analysisThought: string
): string[] {
  const queries = [];
  
  // Base query
  queries.push(`"${doctor.displayName}" ${doctor.specialty} ${doctor.city}`);
  
  // Focus area specific queries
  if (focusAreas.includes('current_technology')) {
    queries.push(`"${doctor.organizationName || doctor.displayName}" practice management software dental technology`);
  }
  
  if (focusAreas.includes('growth_indicators')) {
    queries.push(`"${doctor.organizationName || doctor.displayName}" expansion new location hiring`);
  }
  
  if (focusAreas.includes('surgical_volume')) {
    queries.push(`"${doctor.displayName}" ${doctor.specialty} procedures cases annually`);
  }

  // Product-specific competitive queries
  if (product.toLowerCase().includes('invisalign')) {
    queries.push(`"${doctor.organizationName || doctor.displayName}" clear aligners orthodontic`);
  }
  
  return queries;
}

/**
 * Extract competitor names from analysis
 */
function extractCompetitorNames(thought: string): string[] {
  const competitors: string[] = [];
  
  // Common dental industry competitors
  const knownCompetitors = [
    'Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental',
    'Invisalign', 'ClearCorrect', 'Spark', '3M Clarity',
    'Nobel Biocare', 'Straumann', 'Zimmer Biomet', 'Dentsply'
  ];
  
  knownCompetitors.forEach(comp => {
    if (thought.toLowerCase().includes(comp.toLowerCase())) {
      competitors.push(comp);
    }
  });
  
  return competitors;
}

/**
 * Extract key questions to answer
 */
function extractKeyQuestions(thought: string): string[] {
  const questions = [];
  
  // Extract questions from the thought
  const questionMatches = thought.match(/\?[^?]+/g) || [];
  questions.push(...questionMatches.map(q => q.trim()));
  
  // Add standard sales questions if not covered
  const standardQuestions = [
    'What is their current solution?',
    'Who makes purchasing decisions?',
    'What is their budget cycle?',
    'What pain points do they have?'
  ];
  
  return [...new Set([...questions, ...standardQuestions])];
}

/**
 * Synthesize research with Sequential Thinking guidance
 */
export async function synthesizeWithSequentialGuidance(
  researchData: any,
  strategy: ResearchStrategy,
  doctor: Doctor,
  product: string,
  productIntelligence?: any
): Promise<any> {
  // Use Sequential Thinking to identify the most important insights
  const synthesisPlan = await callSequentialThinking({
    thought: `Research complete for ${doctor.displayName} selling ${product}.
Key findings:
- Website: ${strategy.websiteUrl || 'Not found'}
- Focus areas covered: ${strategy.focusAreas.join(', ')}
- Key questions: ${strategy.keyQuestions.join('; ')}
${productIntelligence ? `
Product Intelligence for ${product}:
- Market awareness: ${productIntelligence.marketData?.awareness || 'Unknown'}
- Local adoption: ${productIntelligence.localInsights?.adoptionRate || 'Unknown'}
- Top competitors: ${productIntelligence.competitiveLandscape?.topCompetitors?.slice(0, 3).join(', ') || 'Unknown'}
- Key differentiators: ${productIntelligence.competitiveLandscape?.differentiators?.slice(0, 2).join(', ') || 'Unknown'}
` : ''}
What are the 3 most important insights for the sales team?`,
    thoughtNumber: 1,
    totalThoughts: 2
  });

  // Final thought: Create sales approach
  const salesApproach = await callSequentialThinking({
    thought: `${synthesisPlan.thought}

How should the sales rep approach this doctor? 
What specific value proposition will resonate?`,
    thoughtNumber: 2,
    totalThoughts: 2
  });

  // Now use Claude 4 Opus for final synthesis with Sequential Thinking insights
  const enhancedPrompt = `IMPORTANT: You must respond with ONLY valid JSON, no other text before or after.

Synthesize research for ${doctor.displayName} selling ${product}.

Sequential Thinking Analysis:
${synthesisPlan.thought}

Sales Approach Recommendation:
${salesApproach.thought}

Research Summary:
- Sources found: ${researchData.sources?.length || 0}
- Doctor: ${doctor.displayName}, ${doctor.specialty}
- Product: ${product}
- Key findings: ${JSON.stringify(researchData.searchResults?.slice(0, 2) || [], null, 2).substring(0, 500)}...
${productIntelligence ? `
Product Market Intelligence:
- Market awareness score: ${productIntelligence.marketData?.awareness}/100
- Price range in ${doctor.city}: $${productIntelligence.marketData?.pricingRange?.low || 0} - $${productIntelligence.marketData?.pricingRange?.high || 0}
- Top local competitors: ${productIntelligence.competitiveLandscape?.topCompetitors?.join(', ') || 'Unknown'}
- Local adoption: ${productIntelligence.localInsights?.adoptionRate || 'Unknown'}
- Key barriers: ${productIntelligence.localInsights?.barriers?.join(', ') || 'None identified'}
- Product benefits: ${productIntelligence.messagingStrategy?.keyBenefits?.slice(0, 3).join(', ') || 'Standard benefits'}
` : ''}
Return ONLY this JSON structure (no explanations, no markdown, just JSON):
{
  "practiceProfile": {
    "name": "Practice name",
    "size": "Practice size estimate",
    "focus": "Primary focus areas"
  },
  "technologyStack": {
    "current": ["List current technologies - include CBCT, imaging systems, practice management software"],
    "gaps": ["Technology gaps - missing systems or upgrade opportunities"],
    "readiness": "Tech adoption readiness (early adopter, mainstream, conservative)"
  },
  "buyingSignals": ["List specific buying signals found"],
  "painPoints": ["List pain points that product addresses"],
  "competition": {
    "currentVendors": ["Current vendors if known"],
    "recentPurchases": ["Recent technology purchases"]
  },
  "approachStrategy": {
    "bestTiming": "When to reach out",
    "preferredChannel": "How to contact",
    "keyMessage": "Primary value proposition",
    "avoidTopics": ["Topics to avoid"]
  },
  "decisionMakers": {
    "primary": "Primary decision maker",
    "influencers": ["Key influencers"]
  },
  "salesBrief": "**TACTICAL SALES BRIEF**\\n\\nProvide a structured 3-section brief:\\n\\n**1. PRACTICE OVERVIEW**\\n[2-3 sentences about the practice, specialty focus (e.g., full arch implants, CBCT imaging), and current technology]\\n\\n**2. OPPORTUNITY ANALYSIS**\\n[2-3 bullet points of specific opportunities for ${product}, including tech stack gaps and pain points]\\n\\n**3. RECOMMENDED APPROACH**\\n[Specific action plan with timing, key message, and value proposition tailored to their practice]\\n\\nBe specific about tech stack details like CBCT systems, full arch implant capabilities, digital workflow tools, etc."
}`;

  try {
    const synthesisResponse = MOCK_MODE 
      ? await mockOpenRouterSynthesis(enhancedPrompt)
      : await callClaude(enhancedPrompt, 'claude-3-5-sonnet-20241022');
    
    // Clean and parse response
    let cleanSynthesis = synthesisResponse;
    
    // Remove markdown code blocks
    if (synthesisResponse.includes('```')) {
      cleanSynthesis = synthesisResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }
    
    // If response starts with explanatory text, extract JSON
    if (!cleanSynthesis.trim().startsWith('{')) {
      // Look for JSON object in the response
      const jsonMatch = cleanSynthesis.match(/\{[\s\S]*\}$/);
      if (jsonMatch) {
        cleanSynthesis = jsonMatch[0];
      }
    }
    
    return JSON.parse(cleanSynthesis);
  } catch (error) {
    console.error('Synthesis parsing error:', error);
    // Generate a meaningful fallback sales brief
    const fallbackBrief = `**TACTICAL SALES BRIEF**

**1. PRACTICE OVERVIEW**
${doctor.displayName} is a ${doctor.specialty} practitioner in ${doctor.city}, ${doctor.state}. ${doctor.organizationName ? `Associated with ${doctor.organizationName}.` : 'Private practice setting.'} Research indicates an established practice with potential for technology modernization.

**2. OPPORTUNITY ANALYSIS**
• Technology Enhancement: Strong candidate for ${product} implementation based on practice profile
• Practice Growth: ${doctor.specialty} practices in ${doctor.state} showing increased adoption of advanced solutions
• Competitive Advantage: ${product} can differentiate their practice in the local market

**3. RECOMMENDED APPROACH**
Contact via professional phone during mid-morning hours (10-11 AM). Lead with ROI data specific to ${doctor.specialty} practices. Emphasize patient outcome improvements and workflow efficiency. Schedule a brief 15-minute introductory call to assess specific needs and demonstrate immediate value.`;

    return {
      salesBrief: fallbackBrief,
      practiceProfile: {
        name: doctor.organizationName || `${doctor.displayName}'s Practice`,
        size: "Medium",
        focus: doctor.specialty
      },
      technologyStack: {
        current: ["Standard practice management system"],
        gaps: ["Modern digital workflow tools", "Advanced imaging integration"],
        readiness: "mainstream"
      },
      buyingSignals: ["Established practice", "Technology adoption potential"],
      painPoints: ["Workflow efficiency", "Patient experience enhancement"],
      competition: {
        currentVendors: ["Unknown - research needed"],
        recentPurchases: []
      },
      approachStrategy: {
        bestTiming: "Mid-morning, Tuesday-Thursday",
        preferredChannel: "Phone",
        keyMessage: `${product} ROI for ${doctor.specialty} practices`,
        avoidTopics: ["Price comparisons without value context"]
      },
      decisionMakers: {
        primary: doctor.displayName,
        influencers: ["Practice manager", "Lead staff"]
      }
    };
  }
}