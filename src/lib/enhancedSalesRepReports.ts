/**
 * Enhanced Sales Rep Reports with Product Intelligence
 * Extends base reports with product/procedure market insights
 */

import type { EnhancedScanResult } from './enhancedAI';
import type { ResearchData } from './webResearch';
import type { ProductIntelligence } from './productProcedureIntelligence';

/**
 * Generate McKinsey Executive Report with product intelligence
 */
export async function generateEnhancedMcKinseyExecutiveReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  const productIntel = researchData.productIntelligence as ProductIntelligence;
  const doctorIntel = researchData.enhancedInsights;
  const combinedStrategy = researchData.combinedStrategy;
  
  // For now, create a text-based report
  // In production, this would use jsPDF for proper formatting
  const content = `
MCKINSEY-STYLE EXECUTIVE BRIEF
================================

Prepared for: ${salesRepName}
Company: ${companyName}
Date: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
-----------------
${doctorIntel?.executiveSummary || 'Analysis indicates strong opportunity alignment.'}

OPPORTUNITY SCORE: ${doctorIntel?.opportunityScore || scanResult.score}%
Perfect Match Score: ${combinedStrategy?.perfectMatchScore || 85}%

MARKET INTELLIGENCE: ${productName}
-----------------------------------
• Market Awareness: ${productIntel?.marketData?.awareness || 0}/100
• Local Adoption Rate: ${productIntel?.localInsights?.adoptionRate || 'Unknown'}
• Price Range: $${productIntel?.marketData?.pricingRange?.low || 0} - $${productIntel?.marketData?.pricingRange?.high || 0}
• Expected ROI: ${productIntel?.marketData?.roi?.min || '2'}x - ${productIntel?.marketData?.roi?.max || '5'}x

PRACTICE PROFILE: ${scanResult.doctor}
--------------------------------------
${doctorIntel?.practiceProfile ? Object.entries(doctorIntel.practiceProfile)
  .map(([key, value]) => `• ${key}: ${value}`)
  .join('\n') : 'Profile data unavailable'}

COMPETITIVE POSITION
--------------------
${doctorIntel?.competitivePosition?.marketRank || 'Market position unknown'}

Top Competitors Using ${productName}:
${productIntel?.localInsights?.topAdopters?.slice(0, 3).map((a: string) => `• ${a}`).join('\n') || 'No local adoption data'}

VALUE PROPOSITION
-----------------
${combinedStrategy?.messagingStrategy?.valueProps?.map((v: any) => `• ${v}`).join('\n') || 
  'Custom value propositions to be developed'}

RECOMMENDED APPROACH
--------------------
Opening: ${combinedStrategy?.messagingStrategy?.primaryHook || 'Standard introduction'}
Channel: ${doctorIntel?.salesStrategy?.channel || 'Email'}
Timing: ${doctorIntel?.salesStrategy?.timing || 'Business hours'}

FINANCIAL PROJECTIONS
---------------------
Investment: $${productIntel?.marketData?.pricingRange?.low || 0} - $${productIntel?.marketData?.pricingRange?.high || 0}
ROI Timeline: ${productIntel?.marketData?.roi?.average || '18 months'}
Expected Return: ${productIntel?.marketData?.roi?.max || '5'}x investment

IMPLEMENTATION ROADMAP
----------------------
${combinedStrategy?.nextSteps?.map((step: any, i: number) => `${i + 1}. ${step}`).join('\n') || 
  '1. Initial contact\n2. Needs assessment\n3. Demonstration\n4. Proposal\n5. Close'}

KEY SUCCESS FACTORS
-------------------
${doctorIntel?.buyingSignals?.map((s: any) => `✓ ${s}`).join('\n') || 'Success factors to be identified'}

RISK MITIGATION
---------------
Common Objections:
${Object.entries(doctorIntel?.salesStrategy?.objectionHandlers || {})
  .map(([obj, response]) => `• ${obj}\n  Response: ${response}`)
  .join('\n\n') || 'Objection handling to be developed'}

Market Barriers:
${productIntel?.localInsights?.barriers?.map(b => `• ${b}`).join('\n') || 'No significant barriers identified'}

APPENDIX: LOCAL MARKET DATA
---------------------------
Social Proof:
${productIntel?.localInsights?.socialProof?.slice(0, 2).map(p => `"${p}"`).join('\n\n') || 'Local testimonials pending'}
  `.trim();
  
  return new Blob([content], { type: 'text/plain' });
}

/**
 * Generate Initial Outreach Report with product intelligence
 */
export async function generateEnhancedInitialOutreachReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  _companyName: string,
  productName: string
): Promise<Blob> {
  const productIntel = researchData.productIntelligence as ProductIntelligence;
  const doctorIntel = researchData.enhancedInsights;
  const combinedStrategy = researchData.combinedStrategy;
  
  const content = `
INITIAL OUTREACH BRIEF
======================

Sales Rep: ${salesRepName}
Target: Dr. ${scanResult.doctor}
Product: ${productName}

QUICK INTELLIGENCE SUMMARY
--------------------------
Practice Fit: ${scanResult.score}%
Market Readiness: ${productIntel?.marketData?.awareness || 50}%
Opportunity Score: ${doctorIntel?.opportunityScore || scanResult.score}%

PRIMARY APPROACH
----------------
${combinedStrategy?.messagingStrategy?.primaryHook || 'Standard introduction approach'}

KEY TALKING POINTS
------------------
${combinedStrategy?.messagingStrategy?.valueProps?.map((v: any, i: number) => `${i + 1}. ${v}`).join('\n') || 
  '1. ROI within 18 months\n2. Proven local success\n3. Competitive advantage'}

LOCAL MARKET CONTEXT
--------------------
• ${productIntel?.localInsights?.topAdopters?.[0] || 'Leading practices'} already using ${productName}
• Average investment: $${((productIntel?.marketData?.pricingRange?.low || 0) + 
  (productIntel?.marketData?.pricingRange?.high || 0)) / 2}
• Typical results: ${productIntel?.marketData?.typicalResults || '2-5x ROI'}

CONVERSATION STARTERS
---------------------
1. "${doctorIntel?.salesStrategy?.perfectPitch || `Have you considered how ${productName} could enhance your practice?`}"
2. Reference ${productIntel?.localInsights?.socialProof?.[0] || 'local success stories'}
3. Mention ${doctorIntel?.buyingSignals?.[0] || 'practice growth opportunities'}

OPTIMAL CONTACT STRATEGY
------------------------
Channel: ${doctorIntel?.salesStrategy?.channel || 'Email'}
Timing: ${doctorIntel?.salesStrategy?.timing || 'Tuesday-Thursday, 10am-3pm'}
Follow-up: Within ${combinedStrategy?.closingStrategy?.timeline || '48-72 hours'}

EXPECTED OBJECTIONS
-------------------
${Object.keys(doctorIntel?.salesStrategy?.objectionHandlers || {}).slice(0, 3)
  .map(obj => `• ${obj}`)
  .join('\n') || '• Cost concerns\n• Implementation time\n• Current solutions'}

SUCCESS METRICS
---------------
• Response within 48 hours: High interest
• Questions about ROI: Ready to engage
• Requests competitor comparison: Decision mode

NEXT STEPS
----------
${combinedStrategy?.nextSteps?.slice(0, 3).map((step: any, i: number) => `${i + 1}. ${step}`).join('\n') || 
  '1. Send personalized email\n2. Follow up within 48 hours\n3. Schedule discovery call'}
  `.trim();
  
  return new Blob([content], { type: 'text/plain' });
}

/**
 * Generate Follow-Up Report with product intelligence
 */
export async function generateEnhancedFollowUpReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  _salesRepName: string,
  _companyName: string,
  _productName: string
): Promise<Blob> {
  const productIntel = researchData.productIntelligence as ProductIntelligence;
  const doctorIntel = researchData.enhancedInsights;
  
  const content = `
FOLLOW-UP STRATEGY REPORT
=========================

ENGAGEMENT STATUS
-----------------
Initial Contact: Completed
Response: ${doctorIntel?.actionItems?.[0]?.includes('follow') ? 'Engaged' : 'Pending'}
Interest Level: ${doctorIntel?.opportunityScore || scanResult.score}%

REFINED MESSAGING
-----------------
Address: ${doctorIntel?.painPoints?.[0] || 'Practice efficiency concerns'}
Emphasize: ${productIntel?.competitiveLandscape?.differentiators?.[0] || 'Unique value proposition'}
Urgency: ${productIntel?.marketData?.limitedTimeOffers?.[0] || 'Market timing opportunity'}

COMPETITIVE INTELLIGENCE
------------------------
• Main competitor: ${productIntel?.competitiveLandscape?.topCompetitors?.[0] || 'Status quo'}
• Our advantage: ${productIntel?.competitiveLandscape?.differentiators?.join(', ') || 'Superior technology'}
• Market share: ${productIntel?.competitiveLandscape?.marketShare || 'Growing'}%

CASE STUDY TO SHARE
-------------------
${productIntel?.localInsights?.recentCases?.[0] || `Similar practice achieved ${productIntel?.marketData?.typicalResults || 'significant ROI'}`}

OBJECTION RESPONSES
-------------------
${Object.entries(doctorIntel?.salesStrategy?.objectionHandlers || {})
  .slice(0, 2)
  .map(([obj, response]) => `If "${obj}":\n→ ${response}`)
  .join('\n\n') || 'Standard objection handling applies'}

NEXT TOUCH POINTS
-----------------
1. Share relevant case study
2. Offer ROI calculator
3. Propose on-site demonstration
4. Connect with reference customer

ESCALATION TRIGGERS
-------------------
• No response after 3 attempts → Breakthrough strategy
• Competitor mentioned → Competitive comparison
• Budget concerns → Flexible payment options
  `.trim();
  
  return new Blob([content], { type: 'text/plain' });
}

/**
 * Generate Breakthrough Report with product intelligence
 */
export async function generateEnhancedBreakthroughReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  _salesRepName: string,
  _companyName: string,
  productName: string
): Promise<Blob> {
  const productIntel = researchData.productIntelligence as ProductIntelligence;
  const doctorIntel = researchData.enhancedInsights;
  const combinedStrategy = researchData.combinedStrategy;
  
  const content = `
BREAKTHROUGH STRATEGY REPORT
============================

SITUATION ANALYSIS
------------------
Engagement Level: Low/Stalled
Market Pressure: ${productIntel?.competitiveLandscape?.marketShare || 0}% competitor adoption
Time Sensitivity: ${combinedStrategy?.messagingStrategy?.urgencyTrigger || 'Standard'}

PATTERN INTERRUPT TACTICS
-------------------------
1. Executive Briefing: Position as exclusive market intelligence
2. Peer Pressure: "${productIntel?.localInsights?.topAdopters?.[0] || 'Leading practices'} just implemented"
3. FOMO Creation: Limited availability in ${scanResult.location || 'your area'}
4. Direct Challenge: "Can you afford NOT to evaluate this?"

ALTERNATIVE APPROACHES
----------------------
• Go higher: Target ${doctorIntel?.decisionMakers?.primary || 'practice owner'}
• Go wider: Engage ${doctorIntel?.decisionMakers?.influencers?.join(', ') || 'key staff'}
• Go deeper: Address hidden concern about ${doctorIntel?.painPoints?.[0] || 'change management'}

NEW VALUE ANGLES
----------------
${combinedStrategy?.messagingStrategy?.valueProps?.slice(1, 4).map((v: any) => `• ${v}`).join('\n') || 
  '• Competitive differentiation\n• Patient satisfaction scores\n• Staff efficiency gains'}

URGENCY AMPLIFIERS
------------------
• Market window: ${productIntel?.marketData?.adoptionRate || 0}% adoption (early advantage)
• Price increase: Coming in ${combinedStrategy?.closingStrategy?.timeline || 'Q2'}
• Capacity limits: Only ${3 - (productIntel?.localInsights?.topAdopters?.length || 0)} slots in area

BREAKTHROUGH MESSAGE
--------------------
"Dr. ${scanResult.doctor.split(' ').pop()}, 

${productIntel?.localInsights?.topAdopters?.[0] || 'Your competitors'} just gained a significant advantage with ${productName}. 

With only ${3 - (productIntel?.localInsights?.topAdopters?.length || 0)} implementation slots remaining in ${scanResult.location || 'your area'} this quarter, I wanted to ensure you had the opportunity to evaluate this before it's too late.

Would you prefer a 15-minute executive briefing or should I send the competitive analysis directly?"

ESCALATION PATH
---------------
Day 1: Breakthrough email
Day 3: LinkedIn connection with message
Day 5: Call to office manager
Day 7: Send physical package
Day 10: Final opportunity email
  `.trim();
  
  return new Blob([content], { type: 'text/plain' });
}

/**
 * Generate Closing Report with product intelligence
 */
export async function generateEnhancedClosingReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  _salesRepName: string,
  _companyName: string,
  _productName: string
): Promise<Blob> {
  const productIntel = researchData.productIntelligence as ProductIntelligence;
  const doctorIntel = researchData.enhancedInsights;
  const combinedStrategy = researchData.combinedStrategy;
  
  const content = `
CLOSING STRATEGY REPORT
=======================

DEAL STATUS
-----------
Opportunity Score: ${doctorIntel?.opportunityScore || scanResult.score}%
Decision Timeline: ${doctorIntel?.budgetIndicators?.purchaseTimeframe || 'Immediate'}
Budget Confirmed: ${doctorIntel?.budgetIndicators?.techBudget ? 'Yes' : 'Pending'}

FINAL VALUE STACK
-----------------
Investment: $${productIntel?.marketData?.pricingRange?.low || 0} - $${productIntel?.marketData?.pricingRange?.high || 0}
Expected ROI: ${productIntel?.marketData?.roi?.max || '5'}x in ${productIntel?.marketData?.roi?.average || '18 months'}
Competitive Advantage: ${productIntel?.competitiveLandscape?.differentiators?.[0] || 'Market leadership'}
Risk Mitigation: ${productIntel?.marketData?.limitedTimeOffers?.[0] || '90-day guarantee'}

DECISION DRIVERS
----------------
${combinedStrategy?.closingStrategy?.decisionDrivers?.map((d: any) => `✓ ${d}`).join('\n') || 
  '✓ ROI certainty\n✓ Competitive pressure\n✓ Implementation support\n✓ Peer success'}

CLOSING TACTICS
---------------
1. Assumptive Close: "When would you like to begin implementation?"
2. Alternative Close: "Would you prefer training in May or June?"
3. Urgency Close: "${productIntel?.marketData?.limitedTimeOffers?.[0] || 'Special pricing ends Friday'}"
4. Risk Reversal: "90-day pilot with full refund option"

NEGOTIATION PARAMETERS
----------------------
• List Price: $${productIntel?.marketData?.pricingRange?.high || 0}
• Floor Price: $${productIntel?.marketData?.pricingRange?.low || 0}
• Payment Terms: ${combinedStrategy?.closingStrategy?.timeline || 'Net 30'}
• Included Services: Training, support, updates

FINAL OBJECTION HANDLERS
------------------------
"Too expensive" → "Let's calculate the ROI based on ${productIntel?.marketData?.typicalResults || 'typical results'}"
"Need to think" → "What specific concerns can I address right now?"
"Not the right time" → "When will be? Let's schedule follow-up for then."

CLOSE SEQUENCE
--------------
1. Summarize value: ${combinedStrategy?.messagingStrategy?.primaryHook || 'Core benefit'}
2. Confirm fit: "Based on our discussions, this addresses your need for..."
3. Ask for commitment: "Shall we move forward?"
4. Handle final objection if any
5. Confirm next steps and timeline

POST-CLOSE ACTIONS
------------------
• Send contract within 2 hours
• Schedule implementation call
• Introduce customer success team
• Begin onboarding preparation
• Request referrals at 30 days
  `.trim();
  
  return new Blob([content], { type: 'text/plain' });
}