/**
 * Sequential Thinking Research Intelligence
 * Adaptive research pipeline that uses reasoning to optimize API calls
 */

import { type Doctor } from '../components/DoctorAutocomplete';
import { callBraveSearch, callBraveLocalSearch, callFirecrawlScrape, callPerplexityResearch, callOpenRouter } from './apiEndpoints';
import { type ResearchData, type ResearchSource } from './webResearch';

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
    const response = await callOpenRouter(
      `${systemPrompt}\n\n${userPrompt}`,
      'anthropic/claude-opus-4'
    );
    
    // Try to parse as JSON
    const parsed = JSON.parse(response);
    return {
      thought: parsed.thought || response,
      nextThoughtNeeded: parsed.nextThoughtNeeded ?? (params.thoughtNumber < params.totalThoughts),
      thoughtNumber: parsed.thoughtNumber || params.thoughtNumber || 1,
      totalThoughts: parsed.totalThoughts || params.totalThoughts || 3,
      isRevision: params.isRevision,
      revisesThought: params.revisesThought
    };
  } catch (error) {
    // Fallback if JSON parsing fails
    console.warn('Sequential Thinking JSON parse failed, using raw response');
    return {
      thought: response,
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
  // Extract practice website if found
  const practiceWebsite = searchResults.find(r => 
    !r.url.includes('healthgrades') && 
    !r.url.includes('zocdoc') &&
    !r.url.includes('yelp') &&
    (r.url.includes(doctor.lastName.toLowerCase()) || 
     r.title.toLowerCase().includes(doctor.lastName.toLowerCase()))
  );

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
  analysisThought: string
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
  const competitors = [];
  
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
  product: string
): Promise<any> {
  // Use Sequential Thinking to identify the most important insights
  const synthesisPlan = await callSequentialThinking({
    thought: `Research complete for ${doctor.displayName} selling ${product}.
Key findings:
- Website: ${strategy.websiteUrl || 'Not found'}
- Focus areas covered: ${strategy.focusAreas.join(', ')}
- Key questions: ${strategy.keyQuestions.join('; ')}

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
  const enhancedPrompt = `Synthesize research for ${doctor.displayName} selling ${product}.

Sequential Thinking Analysis:
${synthesisPlan.thought}

Sales Approach Recommendation:
${salesApproach.thought}

Research Data:
${JSON.stringify(researchData, null, 2)}

Create a comprehensive sales intelligence report.`;

  return await callOpenRouter(enhancedPrompt, 'anthropic/claude-opus-4');
}