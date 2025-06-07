/**
 * Enhanced Synthesis Prompts for Comprehensive Sales Intelligence
 * Generates actionable, specific insights instead of generic messages
 */

export const ENHANCED_SYNTHESIS_PROMPT = (
  doctor: any,
  product: string,
  websiteIntel: any,
  reviewData: any,
  competitors: any[],
  productFit: any,
  sources: any[]
) => `You are an elite medical sales intelligence analyst. Create a COMPREHENSIVE, ACTIONABLE sales brief.

DOCTOR: ${doctor.displayName}, ${doctor.specialty}
LOCATION: ${doctor.city}, ${doctor.state}
ORGANIZATION: ${doctor.organizationName || 'Private Practice'}
NPI VERIFIED: Yes

PRACTICE WEBSITE: ${websiteIntel.url || 'Not found'}
Website Analyzed: ${websiteIntel.crawled ? 'Yes - Full Analysis' : 'No'}
Services Offered: ${websiteIntel.services?.join(', ') || 'Unknown'}
Technology Stack: ${websiteIntel.technology?.join(', ') || 'Not specified'}
Team Size: ${websiteIntel.teamSize || 'Unknown'}
Practice Philosophy: ${websiteIntel.philosophy || 'Not found'}

REPUTATION DATA:
- Doctor Reviews: ${reviewData.doctorReviews.rating || 'No rating'}/5 (${reviewData.doctorReviews.count} reviews)
  Sources: ${reviewData.doctorReviews.sources.join(', ')}
- Practice Reviews: ${reviewData.practiceReviews.rating || 'No rating'}/5 (${reviewData.practiceReviews.count} reviews)
- Combined Rating: ${reviewData.combinedRating || 'No rating'}/5 (${reviewData.totalReviews} total reviews)
- Review Highlights: ${reviewData.doctorReviews.highlights.slice(0, 3).join('; ')}

LOCAL COMPETITIVE LANDSCAPE:
${competitors.slice(0, 5).map(c => `- ${c.title}: ${c.rating}/5 (${c.rating_count} reviews), ${c.distance}mi away`).join('\n')}
Market Density: ${competitors.length} similar practices within 5 miles

PRODUCT FIT ANALYSIS FOR ${product.toUpperCase()}:
Fit Score: ${productFit.fitScore}/100
Identified Opportunities: ${productFit.opportunities?.join(', ') || 'None specifically identified'}
Potential Barriers: ${productFit.barriers?.join(', ') || 'None identified'}

TOTAL INTELLIGENCE SOURCES: ${sources.length}
Source Types: ${[...new Set(sources.map(s => s.type))].join(', ')}

Create a detailed JSON response following this EXACT structure:

{
  "executiveSummary": "3-4 sentences that tell a STORY: What's the biggest opportunity? Why is this practice perfect for ${product}? What's the urgency/timing factor? What's the expected outcome?",
  
  "practiceProfile": {
    "size": "Be specific: solo/2-5 providers/6-10 providers/10+ providers",
    "estimatedAnnualRevenue": "Use review volume and practice size to estimate",
    "patientVolume": "Estimate: <1000/1000-3000/3000-5000/5000+ based on reviews and size",
    "patientDemographics": "Infer from location and services",
    "technologyAdoption": "conservative/mainstream/progressive with SPECIFIC examples",
    "currentSystems": ["List any technology/systems mentioned or inferred"],
    "decisionMakers": "Who likely makes purchasing decisions",
    "expansionSignals": ["List any growth indicators: hiring, new services, locations, etc"]
  },
  
  "marketPosition": {
    "competitiveStanding": "Market leader/Strong competitor/Average/Struggling - with evidence",
    "uniqueStrengths": ["What differentiates them from the ${competitors.length} local competitors"],
    "competitiveVulnerabilities": ["Where competitors might be winning patients"],
    "marketOpportunities": ["Gaps in local market they could fill with ${product}"]
  },
  
  "buyingSignals": [
    {
      "signal": "Specific observation (e.g., 'Website mentions expanding to second location')",
      "evidence": "Direct quote or data point",
      "urgency": "high/medium/low",
      "relevanceToProduct": "How ${product} helps with this specific signal"
    }
  ],
  
  "painPoints": [
    {
      "issue": "Specific challenge based on data (not generic)",
      "evidence": "Review quote, website gap, or competitive disadvantage",
      "businessImpact": "How this affects revenue/efficiency/patient satisfaction",
      "solution": "SPECIFIC way ${product} addresses this",
      "roi": "Potential return if solved"
    }
  ],
  
  "approachStrategy": {
    "bestChannel": {
      "primary": "email/phone/linkedin/in-person",
      "reasoning": "Why this channel based on practice profile"
    },
    "timing": {
      "bestDayTime": "Specific recommendation (e.g., 'Tuesday-Thursday, 12-1pm')",
      "reasoning": "Based on practice type and patient flow",
      "urgencyTrigger": "What event/timing makes this urgent"
    },
    "messaging": {
      "opener": "SPECIFIC first sentence that references their practice/situation",
      "hookStatement": "One sentence that captures the main value prop",
      "differentiator": "Why ${product} vs what they have/competitors offer"
    },
    "valueProps": [
      "Specific benefit #1 with metric/outcome",
      "Specific benefit #2 tied to their situation",
      "Specific benefit #3 addressing their pain point"
    ],
    "socialProof": {
      "relevantCaseStudy": "Similar practice type/size that succeeded",
      "metric": "Specific improvement percentage or dollar amount",
      "localAngle": "Other ${doctor.city} practices using ${product} if applicable"
    },
    "objectionHandling": [
      {
        "likelyObjection": "Most probable pushback based on profile",
        "response": "Specific counter-argument",
        "proofPoint": "Data or example to support response"
      }
    ]
  },
  
  "actionPlan": [
    {
      "step": 1,
      "action": "Specific first action with ${product} context",
      "timing": "When to do this",
      "successMetric": "How to measure if this worked"
    },
    {
      "step": 2,
      "action": "Specific follow-up action",
      "timing": "X days after step 1",
      "successMetric": "Expected response/outcome"
    },
    {
      "step": 3,
      "action": "Specific closing action",
      "timing": "Based on previous responses",
      "successMetric": "Deal progression indicator"
    }
  ],
  
  "intelligenceGaps": {
    "missingData": ["What we couldn't find but would be valuable"],
    "assumptions": ["What we inferred vs confirmed"],
    "validationNeeded": ["What to verify in first conversation"]
  },
  
  "personalizedInsights": {
    "conversationStarters": [
      "Topic they'd be interested in based on their background",
      "Recent event/news about their practice to reference",
      "Shared connection or interest if found"
    ],
    "rapportBuilders": ["Non-business topics based on location/interests"],
    "closingPower": "The ONE thing that will likely close this deal"
  },
  
  "salesBrief": "Create a POWERFUL 2-3 sentence tactical sales brief that a rep can use immediately. Include: 1) The specific hook/angle based on their situation, 2) The key benefit of ${product} for their exact needs, 3) A compelling reason to meet THIS WEEK. Make it conversational and natural, not salesy."
}

BE SPECIFIC. NO GENERIC STATEMENTS. Every point must be backed by data from the provided information.`;

export const PRODUCT_SPECIFIC_PROMPTS: Record<string, string> = {
  yomi: `Focus on: precision, patient comfort, implant success rates, ROI from complex cases`,
  'itero element': `Focus on: digital workflow, patient experience, case acceptance, lab integration`,
  invisalign: `Focus on: patient demand, treatment efficiency, practice differentiation, case variety`,
  dental: `Focus on: efficiency gains, patient satisfaction, technology adoption, competitive advantage`
};

export const ENHANCED_EMAIL_PROMPT = (
  doctorName: string,
  practiceInsights: any,
  product: string
) => `Create a SPECIFIC, PERSONALIZED email that will get a response.

CONTEXT:
- Doctor: ${doctorName}
- Key Insight: ${practiceInsights.executiveSummary}
- Their Pain Point: ${practiceInsights.painPoints?.[0]?.issue}
- Buying Signal: ${practiceInsights.buyingSignals?.[0]?.signal}
- Value Prop: ${practiceInsights.approachStrategy?.valueProps?.[0]}

Write an email that:
1. Subject line references THEIR specific situation (not generic)
2. Opening line shows you know their practice (reference specific detail)
3. Bridge to how ${product} solved this for similar practice
4. Specific metric/outcome they can expect
5. Soft CTA that's easy to say yes to

Keep it under 150 words. Make every word count.`;

export const FOLLOW_UP_SEQUENCE_PROMPT = (
  previousInteraction: string,
  insights: any
) => `Create a follow-up strategy based on no response to initial outreach.

Previous approach: ${previousInteraction}
Practice profile: ${insights.practiceProfile.size}, ${insights.practiceProfile.technologyAdoption}
Main opportunity: ${insights.buyingSignals?.[0]?.signal}

Design 3 follow-up touches:
1. Different angle/channel
2. New information or urgency
3. Final attempt with clear value

Each should be progressively shorter and more direct.`;