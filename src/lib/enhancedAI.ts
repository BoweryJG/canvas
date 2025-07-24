import { type ResearchData } from './webResearch';
import { getClaude4Prompt, CLAUDE_OUTPUT_FORMATS } from './claude-prompts';
import { type EnhancedScanResult as EnhancedScanResultType } from '../types/scan';

// Re-export the type from consolidated types
export type EnhancedScanResult = EnhancedScanResultType;

/**
 * Call our Netlify function for AI analysis
 */
async function callClaudeAPI(messages: Array<{role: string, content: string}>, temperature = 0.3, max_tokens = 2000) {
  try {
    const response = await fetch('/.netlify/functions/claude-outreach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: JSON.stringify({ messages, temperature, max_tokens })
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI API call failed:', error);
    throw error;
  }
}

/**
 * Enhanced AI scan that uses real research data instead of inferences
 */
export async function performEnhancedAIScan(
  doctorName: string, 
  productName: string, 
  researchData: ResearchData
): Promise<EnhancedScanResult> {
  
  try {
    console.log(`🧠 Starting enhanced AI analysis with ${researchData.confidenceScore}% research confidence`);

    // Stage 1: Research-backed Doctor Analysis
    const doctorAnalysis = await generateResearchBackedDoctorProfile(doctorName, researchData);
    
    // Stage 2: Product Intelligence (enhanced with practice context)
    const productAnalysis = await generateContextualProductIntel(productName, researchData);
    
    // Stage 3: Fact-based Sales Strategy
    const salesStrategy = await generateFactBasedSalesStrategy(doctorName, productName, doctorAnalysis, productAnalysis, researchData);

    // Determine research quality
    const researchQuality = determineResearchQuality(researchData);
    
    return {
      doctor: doctorName,
      product: productName,
      score: salesStrategy.score,
      doctorProfile: doctorAnalysis,
      productIntel: productAnalysis,
      salesBrief: salesStrategy.salesBrief,
      insights: salesStrategy.insights,
      researchQuality,
      researchSources: researchData.sources.length,
      factBased: researchData.confidenceScore > 60
    };

  } catch (error) {
    console.error('Enhanced AI scan failed:', error);
    throw error;
  }
}

/**
 * Generate doctor profile based on actual research data
 */
async function generateResearchBackedDoctorProfile(doctorName: string, researchData: ResearchData): Promise<string> {
  
  const hasResearchData = researchData.confidenceScore > 30;
  
  if (hasResearchData) {
    // Use real research data
    const researchContext = buildResearchContext(researchData);
    
    const response = await callClaudeAPI([
      {
        role: "system",
        content: getClaude4Prompt('research')
      },
      {
        role: "user",
        content: `Create a comprehensive profile for Dr. ${doctorName} based on this verified research data:

${researchContext}

ANALYSIS REQUIREMENTS:
- Lead with CONFIRMED FACTS from the research
- Clearly identify when making reasonable inferences
- Focus on sales-relevant insights
- Include specific practice details that impact sales approach
- Note technology adoption patterns if evident
- Highlight growth indicators and market positioning

Use the structured analysis format provided in your system instructions.

${CLAUDE_OUTPUT_FORMATS.STRUCTURED_ANALYSIS}`
      }
    ], 0.2, 800);

    return response || "";
    
  } else {
    // Fallback to inference-based analysis with clear disclaimers  
    const response = await callClaudeAPI([
      {
        role: "system",
        content: "You are a medical sales analyst creating profiles based on limited public information. Always clearly indicate when information is inferred vs. confirmed."
      },
      {
        role: "user",
        content: `⚠️ LIMITED RESEARCH AVAILABLE FOR DR. ${doctorName}

Create a profile based on name analysis and general medical practice patterns. 

IMPORTANT: Clearly mark all information as "INFERRED" since no specific research data was found. Focus on:
- Likely specialty based on name patterns
- General practice characteristics to investigate
- Questions to research before sales approach
- Recommended information gathering steps

Make it clear this is preliminary analysis requiring further research.`
      }
    ], 0.3, 500);

    return `⚠️ PRELIMINARY ANALYSIS - LIMITED RESEARCH DATA\n\n${response || ""}`;
  }
}

/**
 * Generate product intelligence with practice context
 */
async function generateContextualProductIntel(productName: string, researchData: ResearchData): Promise<string> {
  
  const practiceContext = extractPracticeContext(researchData);
  
  const response = await callClaudeAPI([
    {
      role: "system",
      content: getClaude4Prompt('strategy')
    },
    {
      role: "user",
      content: `Analyze ${productName} for sales positioning in this specific practice context:

PRACTICE CONTEXT:
${practiceContext}

ANALYSIS FOCUS:
- How this product fits the verified practice characteristics
- Workflow integration with their confirmed technology stack
- ROI potential based on practice size/type
- Implementation considerations for their specific setup
- Competitive positioning in their market context
- Value propositions most relevant to their patient demographics

Provide strategic insights that leverage the specific practice intelligence gathered.`
    }
  ], 0.2, 600);

  return response || "";
}

/**
 * Generate fact-based sales strategy with specific recommendations
 */
async function generateFactBasedSalesStrategy(
  doctorName: string, 
  productName: string, 
  doctorProfile: string, 
  productIntel: string, 
  researchData: ResearchData
): Promise<{ score: number; insights: string[]; salesBrief: string }> {
  
  const specificIntelligence = extractSpecificIntelligence(researchData);
  
  const response = await callClaudeAPI([
    {
      role: "system", 
      content: getClaude4Prompt('tactical')
    },
    {
      role: "user",
      content: `Create a tactical sales strategy for selling ${productName} to Dr. ${doctorName} based on this intelligence:

DOCTOR PROFILE:
${doctorProfile}

PRODUCT ANALYSIS:
${productIntel}

SPECIFIC PRACTICE INTELLIGENCE:
${specificIntelligence}

PROVIDE:
1. Sales Readiness Score (0-100) with detailed reasoning
2. 4 specific tactical insights based on the research findings
3. Detailed opening approach leveraging confirmed practice details
4. Key value points that align with their verified needs/challenges
5. Likely objections based on practice characteristics and response strategies

Format as JSON:
{
  "score": number with reasoning,
  "insights": [4 specific, research-backed insights],
  "salesBrief": "comprehensive strategy leveraging specific practice intelligence"
}

Base recommendations on FACTS from research, not general assumptions.`
    }
  ], 0.1, 1000);

  try {
    const content = response || '{}';
    const cleanedContent = content.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const strategyData = JSON.parse(cleanedContent);
    
    return {
      score: strategyData.score || 75,
      insights: strategyData.insights || [],
      salesBrief: strategyData.salesBrief || ""
    };
  } catch {
    console.warn('Strategy JSON parse failed, using fallback');
    return {
      score: 65,
      insights: [
        "Research-based analysis recommends further investigation",
        "Practice-specific approach needed based on findings",
        "Technology compatibility should be verified",
        "Timing optimization based on practice patterns"
      ],
      salesBrief: `Strategic approach for Dr. ${doctorName} requires leveraging the specific practice intelligence gathered to customize the ${productName} presentation.`
    };
  }
}

/**
 * Build comprehensive research context for AI analysis
 */
function buildResearchContext(researchData: ResearchData): string {
  let context = "";
  
  // Practice Information
  if (researchData.practiceInfo && Object.keys(researchData.practiceInfo).length > 0) {
    context += "VERIFIED PRACTICE INFORMATION:\n";
    if (researchData.practiceInfo.name) context += `- Practice Name: ${researchData.practiceInfo.name}\n`;
    if (researchData.practiceInfo.address) context += `- Location: ${researchData.practiceInfo.address}\n`;
    if (researchData.practiceInfo.specialties?.length) context += `- Specialties: ${researchData.practiceInfo.specialties.join(', ')}\n`;
    if (researchData.practiceInfo.services?.length) context += `- Services: ${researchData.practiceInfo.services.join(', ')}\n`;
    if (researchData.practiceInfo.technology?.length) context += `- Technology: ${researchData.practiceInfo.technology.join(', ')}\n`;
    context += "\n";
  }
  
  // Credentials
  if (researchData.credentials && Object.keys(researchData.credentials).length > 0) {
    context += "VERIFIED CREDENTIALS:\n";
    if (researchData.credentials.medicalSchool) context += `- Medical School: ${researchData.credentials.medicalSchool}\n`;
    if (researchData.credentials.boardCertifications?.length) context += `- Board Certifications: ${researchData.credentials.boardCertifications.join(', ')}\n`;
    if (researchData.credentials.hospitalAffiliations?.length) context += `- Hospital Affiliations: ${researchData.credentials.hospitalAffiliations.join(', ')}\n`;
    context += "\n";
  }
  
  // Patient Reviews
  if (researchData.reviews && Object.keys(researchData.reviews).length > 0) {
    context += "PATIENT FEEDBACK ANALYSIS:\n";
    if (researchData.reviews.averageRating) context += `- Average Rating: ${researchData.reviews.averageRating}/5\n`;
    if (researchData.reviews.totalReviews) context += `- Total Reviews: ${researchData.reviews.totalReviews}\n`;
    if (researchData.reviews.commonPraise?.length) context += `- Common Praise: ${researchData.reviews.commonPraise.join(', ')}\n`;
    if (researchData.reviews.commonConcerns?.length) context += `- Common Concerns: ${researchData.reviews.commonConcerns.join(', ')}\n`;
    context += "\n";
  }
  
  // Business Intelligence
  if (researchData.businessIntel && Object.keys(researchData.businessIntel).length > 0) {
    context += "BUSINESS INTELLIGENCE:\n";
    if (researchData.businessIntel.practiceType) context += `- Practice Type: ${researchData.businessIntel.practiceType}\n`;
    if (researchData.businessIntel.patientVolume) context += `- Patient Volume: ${researchData.businessIntel.patientVolume}\n`;
    if (researchData.businessIntel.recentNews?.length) context += `- Recent News: ${researchData.businessIntel.recentNews.join('; ')}\n`;
    context += "\n";
  }
  
  // Research Sources
  context += `RESEARCH SOURCES (${researchData.sources.length} total):\n`;
  researchData.sources.forEach(source => {
    context += `- ${source.type}: ${source.title} (Confidence: ${source.confidence}%)\n`;
  });
  
  return context || "No verified research data available - analysis based on general patterns.";
}

/**
 * Extract practice context for product analysis
 */
function extractPracticeContext(researchData: ResearchData): string {
  const context = [];
  
  if (researchData.practiceInfo?.specialties?.length) {
    context.push(`Specialties: ${researchData.practiceInfo.specialties.join(', ')}`);
  }
  
  if (researchData.practiceInfo?.technology?.length) {
    context.push(`Technology Stack: ${researchData.practiceInfo.technology.join(', ')}`);
  }
  
  if (researchData.businessIntel?.practiceType) {
    context.push(`Practice Type: ${researchData.businessIntel.practiceType}`);
  }
  
  if (researchData.businessIntel?.patientVolume) {
    context.push(`Patient Volume: ${researchData.businessIntel.patientVolume}`);
  }
  
  return context.join('\n') || "Limited practice context available";
}

/**
 * Extract specific intelligence for sales strategy
 */
function extractSpecificIntelligence(researchData: ResearchData): string {
  const intelligence = [];
  
  // Practice specifics
  if (researchData.practiceInfo?.website) {
    intelligence.push(`Practice Website: ${researchData.practiceInfo.website}`);
  }
  
  if (researchData.practiceInfo?.phone) {
    intelligence.push(`Direct Contact: ${researchData.practiceInfo.phone}`);
  }
  
  // Patient feedback insights
  if (researchData.reviews?.commonConcerns?.length) {
    intelligence.push(`Patient Concerns: ${researchData.reviews.commonConcerns.join(', ')}`);
  }
  
  if (researchData.reviews?.commonPraise?.length) {
    intelligence.push(`Patient Praise Points: ${researchData.reviews.commonPraise.join(', ')}`);
  }
  
  // Growth indicators
  if (researchData.businessIntel?.growthIndicators?.length) {
    intelligence.push(`Growth Indicators: ${researchData.businessIntel.growthIndicators.join(', ')}`);
  }
  
  // Recent news
  if (researchData.businessIntel?.recentNews?.length) {
    intelligence.push(`Recent News: ${researchData.businessIntel.recentNews.join('; ')}`);
  }
  
  return intelligence.join('\n') || "Limited specific intelligence available";
}

/**
 * Determine research quality level
 */
function determineResearchQuality(researchData: ResearchData): 'verified' | 'partial' | 'inferred' | 'unknown' {
  const score = researchData.confidenceScore;
  const sourceCount = researchData.sources.length;
  
  if (score >= 80 && sourceCount >= 3) return 'verified';
  if (score >= 60 && sourceCount >= 2) return 'partial';
  if (score >= 30 && sourceCount >= 1) return 'inferred';
  return 'unknown';
}