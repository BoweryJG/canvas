/**
 * Enhanced Sales Rep Reports with Medical Intelligence
 * Uses new medical-focused scraping data for procedure-specific reports
 */

import type { EnhancedScanResult } from './enhancedAI';
import type { ResearchData } from './webResearch';
import type { ProductIntelligence } from './productProcedureIntelligence';
import type { ScrapedWebsiteData } from './firecrawlWebScraper';

/**
 * Generate dynamic product name for reports
 */
function generateReportTitle(productName: string, doctorName: string): string {
  // Clean up doctor name (remove "Dr." prefix if present)
  const safeDoctorName = doctorName || 'Unknown Doctor';
  const cleanDoctorName = safeDoctorName.replace(/^Dr\.?\s*/i, '');
  return `${productName} Impact Report for Dr. ${cleanDoctorName}`;
}

/**
 * Determine if product is dental, aesthetic, or both
 */
function getProductCategory(productName: string): 'dental' | 'aesthetic' | 'both' {
  const product = productName.toLowerCase();
  
  const dentalKeywords = ['yomi', 'straumann', 'megagen', 'nobel', 'neodent', 'implant', 'dental', 'cbct', 'itero'];
  const aestheticKeywords = ['fraxel', 'clear and brilliant', 'botox', 'juvederm', 'coolsculpting', 'laser', 'aesthetic'];
  
  const isDental = dentalKeywords.some(keyword => product.includes(keyword));
  const isAesthetic = aestheticKeywords.some(keyword => product.includes(keyword));
  
  if (isDental && isAesthetic) return 'both';
  if (isDental) return 'dental';
  if (isAesthetic) return 'aesthetic';
  return 'both';
}

/**
 * Build medical context from scraped website data
 */
function buildMedicalContext(scrapedData: ScrapedWebsiteData, productCategory: string): string {
  let context = '';
  
  if (productCategory === 'dental' || productCategory === 'both') {
    const currentDentalProcs = Object.entries(scrapedData.dentalProcedures || {})
      .filter(([_, has]) => has)
      .map(([proc, _]) => proc);
    
    const currentImplantSystems = Object.entries(scrapedData.implantSystems || {})
      .filter(([_, has]) => has)
      .map(([system, _]) => system);
    
    const currentDentalTech = Object.entries(scrapedData.dentalTechnology || {})
      .filter(([_, has]) => has)
      .map(([tech, _]) => tech);
    
    context += `DENTAL CAPABILITIES:
• Current Procedures: ${currentDentalProcs.join(', ') || 'None detected'}
• Implant Systems: ${currentImplantSystems.join(', ') || 'None detected'}
• Technology: ${currentDentalTech.join(', ') || 'None detected'}

`;
  }
  
  if (productCategory === 'aesthetic' || productCategory === 'both') {
    const currentAestheticProcs = Object.entries(scrapedData.aestheticProcedures || {})
      .filter(([_, has]) => has)
      .map(([proc, _]) => proc);
    
    const currentAestheticDevices = Object.entries(scrapedData.aestheticDevices || {})
      .filter(([_, has]) => has)
      .map(([device, _]) => device);
    
    const currentInjectables = Object.entries(scrapedData.injectableBrands || {})
      .filter(([_, has]) => has)
      .map(([brand, _]) => brand);
    
    context += `AESTHETIC CAPABILITIES:
• Current Procedures: ${currentAestheticProcs.join(', ') || 'None detected'}
• Devices/Lasers: ${currentAestheticDevices.join(', ') || 'None detected'}
• Injectable Brands: ${currentInjectables.join(', ') || 'None detected'}

`;
  }
  
  context += `COMPETITIVE ADVANTAGES:
${scrapedData.competitiveAdvantages?.map(adv => `• ${adv}`).join('\n') || '• To be assessed'}

SALES OPPORTUNITIES:
${scrapedData.missingProcedures?.map(missing => `• ${missing}`).join('\n') || '• Comprehensive evaluation needed'}`;
  
  return context;
}

/**
 * Generate Product Impact Report (replaces McKinsey Executive Report)
 */
export async function generateProductImpactReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  // Get the scraped website data from the unified intelligence
  const scrapedData = (researchData as any).scrapedWebsiteData as ScrapedWebsiteData;
  const productCategory = getProductCategory(productName);
  const reportTitle = generateReportTitle(productName, scanResult.doctor);
  
  // Build medical context from our new scraping data
  const medicalContext = scrapedData ? buildMedicalContext(scrapedData, productCategory) : 'Medical data unavailable';
  
  const content = `
${reportTitle.toUpperCase()}
${'='.repeat(reportTitle.length)}

Prepared for: ${salesRepName}
Company: ${companyName}
Date: ${new Date().toLocaleDateString()}
Practice Analysis Score: ${scanResult.score}%

EXECUTIVE SUMMARY
-----------------
This impact analysis evaluates how ${productName} will specifically benefit Dr. ${String(((scanResult.doctor as any)?.name || scanResult.doctor) || 'Unknown Doctor').replace(/^Dr\.?\s*/i, '')}'s practice based on comprehensive website intelligence and current capabilities assessment.

Practice Alignment Score: ${scanResult.score}%
Implementation Readiness: ${scanResult.score > 80 ? 'HIGH' : scanResult.score > 60 ? 'MEDIUM' : 'DEVELOPING'}

CURRENT PRACTICE ANALYSIS
--------------------------
${medicalContext}

PRACTICE INFORMATION:
• Team Size: ${scrapedData?.practiceInfo?.teamSize || 'To be determined'}
• Specialties: ${scrapedData?.practiceInfo?.specialties?.join(', ') || 'General practice'}
• Locations: ${scrapedData?.practiceInfo?.locations || 1} location(s)

${productName.toUpperCase()} IMPACT ANALYSIS
${'='.repeat(productName.length + 16)}

STRATEGIC BENEFITS:
• Enhanced procedural capabilities aligned with current practice focus
• Competitive differentiation in local market
• Premium positioning for ${productCategory} procedures
• Technology integration with existing workflow

FINANCIAL PROJECTIONS
---------------------
Expected ROI: 250-400% within 18-24 months
Implementation Timeline: 90-120 days
Training Investment: 40-60 hours total team training
Break-even Point: 6-12 months depending on utilization

IMPLEMENTATION ROADMAP
----------------------
Phase 1 (Days 1-30): Initial Assessment & Planning
• Detailed practice workflow analysis
• Team training needs assessment
• Technology integration planning
• Success metrics establishment

Phase 2 (Days 31-60): Installation & Training
• Equipment installation and setup
• Comprehensive team training program
• Workflow optimization
• Initial procedure protocols

Phase 3 (Days 61-90): Optimization & Scale
• Performance monitoring and adjustment
• Advanced training modules
• Marketing and patient communication
• Success metric tracking

COMPETITIVE POSITIONING
-----------------------
Market Advantages:
• First-mover advantage in ${productCategory} technology
• Premium procedure pricing capability
• Enhanced patient outcomes and satisfaction
• Referral generation from superior results

Local Market Impact:
• Differentiation from traditional practices
• Attraction of quality-focused patients
• Potential for expanded service offerings
• Enhanced practice valuation

SUCCESS METRICS & KPIs
----------------------
30-Day Metrics:
• Team training completion: 100%
• System utilization rate: >80%
• Initial patient procedures: 5-10 cases

90-Day Metrics:
• Procedure volume increase: 25-40%
• Patient satisfaction scores: >4.5/5.0
• Efficiency improvement: 20-30%
• ROI tracking on target

RISK MITIGATION
---------------
Implementation Risks:
• Staff adoption - Mitigated by comprehensive training
• Patient acceptance - Managed through education
• Technical integration - Supported by dedicated support team

Success Factors:
• Leadership commitment to change
• Team engagement in training
• Patient communication strategy
• Ongoing performance monitoring

NEXT STEPS
----------
Immediate Actions (Next 7 Days):
1. Schedule executive briefing with practice leadership
2. Conduct detailed operational assessment
3. Develop customized implementation proposal
4. Arrange reference practice visits/calls

This analysis demonstrates strong alignment between ${productName} and Dr. ${String(((scanResult.doctor as any)?.name || scanResult.doctor) || 'Unknown Doctor').replace(/^Dr\.?\s*/i, '')}'s practice capabilities, indicating excellent potential for successful implementation and significant practice impact.

---
Report prepared using Canvas Medical Intelligence Platform
  `.trim();
  
  return new Blob([content], { type: 'text/plain' });
}

/**
 * Backward compatibility: McKinsey Executive Report now redirects to Product Impact Report
 */
export async function generateEnhancedMcKinseyExecutiveReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  // Redirect to new Product Impact Report
  return generateProductImpactReport(scanResult, researchData, salesRepName, companyName, productName);
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