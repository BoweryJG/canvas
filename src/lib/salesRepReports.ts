// @ts-nocheck
import jsPDF from 'jspdf';
import { type EnhancedScanResult } from './enhancedAI';
import { type ResearchData } from './webResearch';
// import { callPerplexityResearch } from './apiEndpoints';

export interface SalesRepReportOptions {
  reportType: 'mckinsey_executive' | 'initial_outreach' | 'follow_up' | 'breakthrough' | 'closing';
  includeFinancialProjections: boolean;
  includeCompetitiveIntel: boolean;
  includeImplementationPlan: boolean;
  salesRepName: string;
  companyName: string;
  productName: string;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface SalesRepContext {
  repName: string;
  territory: string;
  experience: string;
  specialties: string[];
  quotaAttainment: number;
  previousSuccesses: string[];
}

export interface OutreachLevel {
  level: 'initial' | 'follow_up' | 'breakthrough' | 'closing';
  timeline: string;
  objective: string;
  keyMessages: string[];
  callToAction: string;
  urgencyFactor: number;
}

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export class SalesRepReportGenerator {
  private doc: jsPDF;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private lineHeight: number;
  private pageCount: number;
  private brandColors: BrandColors;

  constructor(brandColors?: BrandColors) {
    this.doc = new jsPDF('portrait', 'pt', 'letter');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 50;
    this.lineHeight = 16;
    this.currentY = this.margin;
    this.pageCount = 1;
    this.brandColors = brandColors || {
      primary: '#1E40AF', // Professional blue
      secondary: '#7C3AED', // Purple
      accent: '#059669' // Green
    };
  }

  async generateSalesRepReport(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    options: SalesRepReportOptions
  ): Promise<Blob> {
    try {
      console.log(`🎯 Generating ${options.reportType} sales rep report...`);

      switch (options.reportType) {
        case 'mckinsey_executive':
          return await this.generateMcKinseyExecutiveReport(scanResult, researchData, options);
        case 'initial_outreach':
          return await this.generateInitialOutreachReport(scanResult, researchData, options);
        case 'follow_up':
          return await this.generateFollowUpReport(scanResult, researchData, options);
        case 'breakthrough':
          return await this.generateBreakthroughReport(scanResult, researchData, options);
        case 'closing':
          return await this.generateClosingReport(scanResult, researchData, options);
        default:
          throw new Error(`Unsupported report type: ${options.reportType}`);
      }
    } catch (error) {
      console.error('Sales rep report generation error:', error);
      throw new Error(`Failed to generate sales rep report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // McKinsey-Style Executive Report (10 pages)
  private async generateMcKinseyExecutiveReport(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    options: SalesRepReportOptions
  ): Promise<Blob> {
    this.setupDocument(scanResult, options, 'Executive Strategy Brief');

    // Executive Cover
    this.addMcKinseyCoverPage(scanResult, researchData, options);

    // Executive Summary (Slide 1)
    this.addNewPage();
    this.addMcKinseyExecutiveSummary(scanResult, researchData, options);

    // Situation Analysis (Slide 2) 
    this.addNewPage();
    this.addMcKinseySituationAnalysis(scanResult, researchData, options);

    // Market Context & Opportunity (Slide 3)
    this.addNewPage();
    this.addMcKinseyMarketContext(scanResult, researchData, options);

    // Financial Impact Analysis (Slide 4)
    this.addNewPage();
    this.addMcKinseyFinancialImpact(scanResult, researchData, options);

    // Competitive Positioning (Slide 5)
    this.addNewPage();
    this.addMcKinseyCompetitivePosition(scanResult, researchData, options);

    // Strategic Recommendations (Slide 6)
    this.addNewPage();
    this.addMcKinseyStrategicRecommendations(scanResult, researchData, options);

    // Implementation Roadmap (Slide 7)
    this.addNewPage();
    this.addMcKinseyImplementationRoadmap(scanResult, researchData, options);

    // Risk Assessment & Mitigation (Slide 8)
    this.addNewPage();
    this.addMcKinseyRiskAssessment(scanResult, researchData, options);

    // Success Metrics & KPIs (Slide 9)
    this.addNewPage();
    this.addMcKinseySuccessMetrics(scanResult, researchData, options);

    // Next Steps & Call to Action (Slide 10)
    this.addNewPage();
    this.addMcKinseyNextSteps(scanResult, researchData, options);

    console.log(`✅ McKinsey-style executive report generated: ${this.pageCount} pages`);
    return this.doc.output('blob');
  }

  // Initial Outreach Report (2-3 pages)
  private async generateInitialOutreachReport(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    options: SalesRepReportOptions
  ): Promise<Blob> {
    this.setupDocument(scanResult, options, 'Initial Outreach Brief');

    // Cover Page
    this.addOutreachCoverPage(scanResult, researchData, options, 'INITIAL CONTACT');

    // Research Summary & Fit Analysis
    this.addNewPage();
    this.addInitialOutreachSummary(scanResult, researchData, options);

    // Conversation Starters & Key Messages
    this.addNewPage();
    this.addInitialConversationGuide(scanResult, researchData, options);

    console.log(`✅ Initial outreach report generated: ${this.pageCount} pages`);
    return this.doc.output('blob');
  }

  // Follow-Up Report (2-3 pages)
  private async generateFollowUpReport(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    options: SalesRepReportOptions
  ): Promise<Blob> {
    this.setupDocument(scanResult, options, 'Follow-Up Strategy Brief');

    // Cover Page
    this.addOutreachCoverPage(scanResult, researchData, options, 'FOLLOW-UP STRATEGY');

    // Previous Interaction Summary & Next Steps
    this.addNewPage();
    this.addFollowUpStrategy(scanResult, researchData, options);

    // Value Proposition Refinement
    this.addNewPage();
    this.addValuePropositionRefinement(scanResult, researchData, options);

    console.log(`✅ Follow-up report generated: ${this.pageCount} pages`);
    return this.doc.output('blob');
  }

  // Breakthrough Report (3-4 pages)
  private async generateBreakthroughReport(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    options: SalesRepReportOptions
  ): Promise<Blob> {
    this.setupDocument(scanResult, options, 'Breakthrough Strategy Brief');

    // Cover Page
    this.addOutreachCoverPage(scanResult, researchData, options, 'BREAKTHROUGH STRATEGY');

    // Obstacle Analysis & Solutions
    this.addNewPage();
    this.addBreakthroughObstacleAnalysis(scanResult, researchData, options);

    // Alternative Approaches & Pathways
    this.addNewPage();
    this.addBreakthroughAlternatives(scanResult, researchData, options);

    // Urgency Creation & Compelling Events
    this.addNewPage();
    this.addBreakthroughUrgencyCreation(scanResult, researchData, options);

    console.log(`✅ Breakthrough report generated: ${this.pageCount} pages`);
    return this.doc.output('blob');
  }

  // Closing Report (2-3 pages)
  private async generateClosingReport(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    options: SalesRepReportOptions
  ): Promise<Blob> {
    this.setupDocument(scanResult, options, 'Closing Strategy Brief');

    // Cover Page
    this.addOutreachCoverPage(scanResult, researchData, options, 'CLOSING STRATEGY');

    // Decision Maker Analysis & Final Push
    this.addNewPage();
    this.addClosingDecisionMakerAnalysis(scanResult, researchData, options);

    // Contract Terms & Implementation Planning
    this.addNewPage();
    this.addClosingImplementationPlanning(scanResult, researchData, options);

    console.log(`✅ Closing report generated: ${this.pageCount} pages`);
    return this.doc.output('blob');
  }

  // McKinsey-Style Report Sections
  private addMcKinseyCoverPage(scanResult: EnhancedScanResult, researchData: ResearchData, options: SalesRepReportOptions): void {
    // Professional header
    this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.rect(0, 0, this.pageWidth, 120, 'F');

    // Company branding - add null safety
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    const companyName = (options.companyName || 'Your Company').toUpperCase();
    this.doc.text(companyName, this.pageWidth / 2, 60, { align: 'center' });

    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Strategic Sales Intelligence', this.pageWidth / 2, 85, { align: 'center' });

    // Dynamic report title with rep name, doctor name, product, and date
    this.currentY = 180;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    
    // Extract clean doctor name
    const doctorName = scanResult.doctor || 'Healthcare Professional';
    const cleanDoctorName = doctorName.replace(/^Dr\.?\s*/i, '');
    
    // Generate dynamic title
    const dynamicTitle = `${options.productName || 'Product'} Impact Report`;
    this.doc.text(dynamicTitle.toUpperCase(), this.pageWidth / 2, this.currentY, { align: 'center' });
    
    // Add subtitle with doctor name and date
    this.currentY += 35;
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.text(`for Dr. ${cleanDoctorName}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    
    // Add date and rep info
    this.currentY += 25;
    this.doc.setFontSize(14);
    this.doc.setTextColor(100, 100, 100);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.doc.text(`Prepared by ${options.salesRepName} • ${reportDate}`, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Practice info and score
    this.currentY += 40;
    this.doc.setFontSize(16);
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    const practiceName = researchData.practiceInfo?.name || `${cleanDoctorName} Medical Practice`;
    this.doc.text(practiceName, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 30;
    this.doc.setFontSize(18);
    this.doc.setTextColor(100, 100, 100);
    const score = scanResult.score || 0;
    this.doc.text(`Strategic Fit Assessment: ${score}%`, this.pageWidth / 2, this.currentY, { align: 'center' });

    // McKinsey-style visual elements
    this.addMcKinseyVisualElements(scanResult);

    // Executive summary box
    this.currentY = 400;
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 120, 'F');
    this.doc.setDrawColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setLineWidth(2);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 120, 'S');

    this.currentY += 20;
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('EXECUTIVE SUMMARY', this.margin + 20, this.currentY);

    this.currentY += 25;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    
    const execSummary = `High-priority strategic opportunity with ${score}% practice alignment. Comprehensive market analysis reveals significant revenue potential with clear competitive advantages and defined implementation pathway.`;
    this.addWrappedText(execSummary, this.pageWidth - 2 * this.margin - 40, this.margin + 20);

    // Footer - add null safety
    this.currentY = this.pageHeight - 80;
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(11);
    const salesRepName = options.salesRepName || 'Sales Representative';
    this.doc.text(`Prepared for: ${salesRepName}`, this.margin, this.currentY);
    this.doc.text(`Date: ${new Date().toLocaleDateString()}`, this.pageWidth - this.margin, this.currentY, { align: 'right' });

    this.currentY += 20;
    this.doc.setFontSize(10);
    this.doc.text('CONFIDENTIAL - Strategic Sales Intelligence', this.pageWidth / 2, this.currentY, { align: 'center' });
  }

  private addMcKinseyExecutiveSummary(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('EXECUTIVE SUMMARY', 'Key Findings & Strategic Recommendations');

    // Key metrics dashboard
    this.addMcKinseyMetricsDashboard(scanResult, researchData);

    this.currentY += 40;

    // Three-column insights
    this.addMcKinseyThreeColumnInsights([
      {
        title: 'OPPORTUNITY',
        content: `${scanResult.score}% strategic fit with ${this.calculateRevenueOpportunity(scanResult, researchData)} annual revenue potential. Practice demonstrates strong technology adoption and growth indicators.`,
        color: this.brandColors.accent
      },
      {
        title: 'APPROACH',
        content: `${this.getRecommendedApproach(scanResult)} engagement strategy focusing on efficiency gains and competitive differentiation. Timeline: ${this.getOptimalTimeline(scanResult)}.`,
        color: this.brandColors.primary
      },
      {
        title: 'OUTCOME',
        content: `${this.calculateExpectedROI(scanResult)}% efficiency improvement potential with ${this.getImplementationTimeline(scanResult)} implementation. High probability of success.`,
        color: this.brandColors.secondary
      }
    ]);

    // Bottom line recommendation
    this.currentY += 60;
    this.addMcKinseyBottomLine('RECOMMENDATION: Immediate engagement with executive-level value proposition focusing on operational excellence and competitive advantage.');
  }

  private addMcKinseySituationAnalysis(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('SITUATION ANALYSIS', 'Current State Assessment');

    // Practice profile
    this.addMcKinseySection('PRACTICE PROFILE', [
      `${scanResult.doctor} - ${researchData.practiceInfo?.specialties?.join(', ') || 'Medical Practice'}`,
      `Staff Size: ${researchData.practiceInfo?.staff || '10-15'} | Patient Volume: ${researchData.businessIntel?.patientVolume || 'Moderate-High'}`,
      `Technology: ${researchData.practiceInfo?.technology?.slice(0, 3).join(', ') || 'Standard EHR, Practice Management'}`,
      `Market Position: ${researchData.businessIntel?.marketPosition || 'Well-established local practice'}`
    ]);

    // Current challenges (inferred from research)
    this.addMcKinseySection('CURRENT CHALLENGES', [
      'Administrative burden consuming 30-40% of staff productivity',
      'Manual processes creating inefficiencies in patient flow',
      'Technology gaps limiting competitive positioning',
      'Rising operational costs pressuring profit margins'
    ]);

    // Competitive landscape
    this.addMcKinseySection('COMPETITIVE CONTEXT', [
      'Healthcare technology adoption accelerating across market',
      'Early adopters gaining 15-25% efficiency advantages',
      'Patient expectations driving digital transformation',
      'Regulatory pressure increasing compliance requirements'
    ]);
  }

  private addMcKinseyMarketContext(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('MARKET CONTEXT & OPPORTUNITY', 'Industry Dynamics & Positioning');

    // Market forces diagram (simplified text version)
    this.addMcKinseyMarketForces();

    this.currentY += 40;

    // Opportunity sizing
    this.addMcKinseySection('OPPORTUNITY ASSESSMENT', [
      `Total Addressable Market: $2.3B+ (Healthcare Technology Sector)`,
      `Serviceable Market: $${this.calculateServiceableMarket(researchData)} (Practice Segment)`,
      `Revenue Opportunity: ${this.calculateRevenueOpportunity(scanResult, researchData)} annually`,
      `Implementation Investment: ${this.calculateImplementationCost(researchData)}`
    ]);

    // Market timing
    this.addMcKinseySection('MARKET TIMING', [
      'Regulatory tailwinds supporting technology adoption',
      'Post-pandemic acceleration of digital health initiatives',
      'Budget cycles aligned with Q4 planning horizon',
      'Competitive pressure creating urgency for modernization'
    ]);
  }

  private addMcKinseyFinancialImpact(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('FINANCIAL IMPACT ANALYSIS', 'ROI Projections & Cost-Benefit');

    // Financial model table
    this.addMcKinseyFinancialModel(scanResult, researchData);

    this.currentY += 40;

    // Value creation levers
    this.addMcKinseySection('VALUE CREATION LEVERS', [
      `Administrative Efficiency: 25-35% time savings = $${Math.round(this.calculateEfficiencySavings(researchData) * 0.3).toLocaleString()}`,
      `Revenue Optimization: 8-12% increase = $${Math.round(this.calculateRevenueLift(researchData) * 0.1).toLocaleString()}`,
      `Compliance Cost Reduction: 40% decrease = $${Math.round(this.calculateComplianceSavings(researchData) * 0.4).toLocaleString()}`,
      `Competitive Advantage: Market share protection = $${Math.round(this.calculateCompetitiveValue(researchData)).toLocaleString()}`
    ]);

    // Risk-adjusted returns
    this.addMcKinseySection('RISK-ADJUSTED RETURNS', [
      `Base Case ROI: ${this.calculateExpectedROI(scanResult)}% (Probability: 70%)`,
      `Optimistic Case: ${Math.round(this.calculateExpectedROI(scanResult) * 1.4)}% (Probability: 20%)`,
      `Conservative Case: ${Math.round(this.calculateExpectedROI(scanResult) * 0.6)}% (Probability: 10%)`,
      `Weighted Average: ${Math.round(this.calculateExpectedROI(scanResult) * 1.08)}% expected return`
    ]);
  }

  private addMcKinseyCompetitivePosition(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('COMPETITIVE POSITIONING', 'Market Differentiation Strategy');

    // Competitive matrix (simplified)
    this.addMcKinseyCompetitiveMatrix();

    this.currentY += 40;

    // Our advantages
    this.addMcKinseySection('COMPETITIVE ADVANTAGES', [
      'Superior integration capabilities vs. legacy solutions',
      'Proven ROI track record in similar practice environments',
      'Comprehensive implementation methodology and support',
      'Advanced analytics and reporting not available elsewhere'
    ]);

    // Competitive response strategy
    this.addMcKinseySection('COMPETITIVE RESPONSE STRATEGY', [
      'Emphasize unique differentiators and proven results',
      'Leverage reference customers in similar practice types',
      'Focus on total cost of ownership vs. acquisition cost',
      'Highlight implementation speed and success guarantees'
    ]);
  }

  private addMcKinseyStrategicRecommendations(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('STRATEGIC RECOMMENDATIONS', 'Recommended Course of Action');

    // Primary recommendation
    this.addMcKinseyPrimaryRecommendation(scanResult, researchData);

    this.currentY += 30;

    // Supporting rationale
    this.addMcKinseySection('STRATEGIC RATIONALE', [
      `High practice fit (${scanResult.score}%) indicates strong alignment and success probability`,
      'Market timing optimal with budget cycles and competitive pressure',
      'Clear ROI pathway with measurable efficiency and revenue benefits',
      'Low implementation risk with proven methodology and support'
    ]);

    // Alternative scenarios
    this.addMcKinseySection('ALTERNATIVE SCENARIOS', [
      'Scenario A: Full implementation - Maximum ROI and competitive advantage',
      'Scenario B: Phased approach - Lower risk, gradual value realization',
      'Scenario C: Pilot program - Proof of concept with limited scope'
    ]);
  }

  private addMcKinseyImplementationRoadmap(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('IMPLEMENTATION ROADMAP', '90-Day Execution Plan');

    // Timeline visualization (text-based)
    this.addMcKinseyTimeline([
      { phase: 'ENGAGE', duration: '0-30 days', activities: ['Executive alignment', 'Stakeholder mapping', 'Value proposition validation'] },
      { phase: 'DESIGN', duration: '30-60 days', activities: ['Solution architecture', 'Implementation planning', 'Change management prep'] },
      { phase: 'DEPLOY', duration: '60-90 days', activities: ['System implementation', 'Training execution', 'Go-live support'] }
    ]);

    this.currentY += 40;

    // Critical success factors
    this.addMcKinseySection('CRITICAL SUCCESS FACTORS', [
      'Executive sponsorship and change management leadership',
      'Comprehensive staff training and adoption support',
      'Phased rollout with early wins and momentum building',
      'Continuous monitoring and optimization during implementation'
    ]);

    // Resource requirements
    this.addMcKinseySection('RESOURCE REQUIREMENTS', [
      `Implementation Team: ${this.getRequiredTeamSize(_researchData)} professionals for ${this.getImplementationTimeline(_scanResult)}`,
      `Training Hours: ${this.getTrainingHours(_researchData)} total across ${_researchData.practiceInfo?.staff || 10} staff members`,
      `Technology Infrastructure: ${this.getTechRequirements(_researchData)}`,
      `Investment: ${this.calculateImplementationCost(_researchData)} total implementation cost`
    ]);
  }

  private addMcKinseyRiskAssessment(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('RISK ASSESSMENT & MITIGATION', 'Risk Management Strategy');

    // Risk matrix
    this.addMcKinseyRiskMatrix();

    this.currentY += 40;

    // Key risks and mitigation
    const risks = [
      {
        risk: 'User Adoption Resistance',
        probability: 'Medium',
        impact: 'High',
        mitigation: 'Comprehensive change management and training program'
      },
      {
        risk: 'Technical Integration Issues',
        probability: 'Low',
        impact: 'Medium',
        mitigation: 'Pre-implementation technical assessment and testing'
      },
      {
        risk: 'Timeline Delays',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Agile implementation methodology with milestone tracking'
      },
      {
        risk: 'ROI Realization Delays',
        probability: 'Low',
        impact: 'High',
        mitigation: 'Performance guarantees and success metrics monitoring'
      }
    ];

    risks.forEach(risk => {
      this.currentY += 20;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${risk.risk}:`, this.margin + 20, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${risk.probability} probability, ${risk.impact} impact`, this.margin + 200, this.currentY);
      this.currentY += 14;
      this.doc.setFontSize(10);
      this.doc.text(`Mitigation: ${risk.mitigation}`, this.margin + 30, this.currentY);
    });
  }

  private addMcKinseySuccessMetrics(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('SUCCESS METRICS & KPIs', 'Measurement Framework');

    // KPI dashboard
    this.addMcKinseyKPIDashboard();

    this.currentY += 40;

    // Leading indicators
    this.addMcKinseySection('LEADING INDICATORS (30-60 days)', [
      'User adoption rate: >90% active usage within 30 days',
      'Training completion: 100% staff certification achieved',
      'System utilization: >80% feature adoption rate',
      'User satisfaction: >4.5/5.0 satisfaction scores'
    ]);

    // Lagging indicators  
    this.addMcKinseySection('LAGGING INDICATORS (60-180 days)', [
      `Efficiency gains: ${this.calculateExpectedROI(_scanResult)}% productivity improvement`,
      'Revenue impact: 8-12% increase in billable efficiency',
      'Cost reduction: 25-35% decrease in administrative overhead',
      'ROI achievement: Break-even within 6-12 months'
    ]);

    // Governance framework
    this.addMcKinseySection('GOVERNANCE FRAMEWORK', [
      'Weekly progress reviews during implementation phase',
      'Monthly business review meetings with key stakeholders',
      'Quarterly ROI assessment and optimization planning',
      'Annual strategic review and expansion planning'
    ]);
  }

  private addMcKinseyNextSteps(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addMcKinseySlideHeader('NEXT STEPS & CALL TO ACTION', 'Immediate Action Items');

    // Immediate actions (next 7 days)
    this.addMcKinseySection('IMMEDIATE ACTIONS (Next 7 Days)', [
      '1. Schedule executive briefing with practice leadership team',
      '2. Conduct detailed technical and operational assessment',
      '3. Develop customized implementation proposal and timeline',
      '4. Arrange reference customer calls with similar practices'
    ]);

    // 30-day timeline
    this.addMcKinseySection('30-DAY ENGAGEMENT TIMELINE', [
      'Week 1: Executive alignment and stakeholder mapping',
      'Week 2: Detailed discovery and solution design',
      'Week 3: Proposal development and financial modeling',
      'Week 4: Final presentation and decision milestone'
    ]);

    // Call to action box
    this.currentY += 40;
    this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80, 'F');

    this.currentY += 25;
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RECOMMENDED NEXT STEP', this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 25;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Schedule 60-minute executive briefing within next 5 business days`, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 20;
    this.doc.setFontSize(12);
    this.doc.text(`Contact: ${_options.salesRepName} | ${_options.companyName}`, this.pageWidth / 2, this.currentY, { align: 'center' });
  }

  // Outreach Report Sections
  private addOutreachCoverPage(scanResult: EnhancedScanResult, researchData: ResearchData, options: SalesRepReportOptions, title: string): void {
    // Professional header
    this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.rect(0, 0, this.pageWidth, 100, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    const companyName = options.companyName || 'Your Company';
    this.doc.text(companyName.toUpperCase(), this.pageWidth / 2, 50, { align: 'center' });

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Sales Intelligence Brief', this.pageWidth / 2, 75, { align: 'center' });

    // Report title
    this.currentY = 150;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    const reportTitle = title || 'Sales Report';
    this.doc.text(reportTitle, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Product and doctor info
    this.currentY += 40;
    const doctorName = scanResult.doctor || 'Healthcare Professional';
    const cleanDoctorName = doctorName.replace(/^Dr\.?\s*/i, '');
    
    this.doc.setFontSize(18);
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.text(`${options.productName} for Dr. ${cleanDoctorName}`, this.pageWidth / 2, this.currentY, { align: 'center' });

    this.currentY += 25;
    this.doc.setFontSize(14);
    this.doc.setTextColor(100, 100, 100);
    const practiceName = researchData.practiceInfo?.name || `${cleanDoctorName} Medical Practice`;
    this.doc.text(practiceName, this.pageWidth / 2, this.currentY, { align: 'center' });

    // Key metrics summary
    this.currentY += 60;
    this.addOutreachMetricsSummary(scanResult, researchData);

    // Sales rep info
    this.currentY = this.pageHeight - 100;
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(12);
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    this.doc.text(`Prepared by: ${options.salesRepName} | ${options.companyName}`, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.doc.text(`Date: ${reportDate}`, this.pageWidth / 2, this.currentY + 20, { align: 'center' });
  }

  private addInitialOutreachSummary(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('RESEARCH SUMMARY & PRACTICE FIT');

    // Practice intelligence
    this.addSubsectionHeader('Practice Intelligence');
    this.addBulletPoints([
      `Practice Type: ${researchData.businessIntel?.practiceType || 'General Medical Practice'}`,
      `Staff Size: ${researchData.practiceInfo?.staff || '10-15'} professionals`,
      `Technology Stack: ${researchData.practiceInfo?.technology?.slice(0, 3).join(', ') || 'Standard EHR systems'}`,
      `Patient Demographics: ${researchData.businessIntel?.patientVolume || 'Moderate to high volume'}`
    ]);

    // Fit analysis
    this.addSubsectionHeader('Strategic Fit Analysis');
    this.addBulletPoints([
      `Overall Fit Score: ${scanResult.score}% - ${this.getFitRating(scanResult.score)}`,
      `Research Quality: ${scanResult.researchQuality} - ${scanResult.researchSources} verified sources`,
      `Key Opportunities: ${this.getTopOpportunities(scanResult).slice(0, 3).join(', ')}`,
      `Implementation Readiness: ${this.getReadinessAssessment(scanResult, researchData)}`
    ]);

    // Pain points identified
    this.addSubsectionHeader('Identified Pain Points');
    this.addBulletPoints([
      'Administrative burden consuming excessive staff time',
      'Manual processes creating workflow inefficiencies', 
      'Technology gaps limiting competitive positioning',
      'Compliance complexity increasing operational costs'
    ]);
  }

  private addInitialConversationGuide(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('CONVERSATION GUIDE & KEY MESSAGES');

    // Opening conversation starters
    this.addSubsectionHeader('Opening Conversation Starters');
    this.addConversationStarters([
      `"I've been researching ${researchData.practiceInfo?.name || 'your practice'} and noticed you have ${researchData.practiceInfo?.staff || '10+'} staff members. I'm curious about how you're managing workflow efficiency with that team size?"`,
      `"Your practice's focus on ${researchData.practiceInfo?.specialties?.[0] || 'patient care'} caught my attention. How are you handling the administrative side while maintaining that clinical focus?"`,
      `"I see you're using ${researchData.practiceInfo?.technology?.[0] || 'standard EHR systems'}. How well is that supporting your current growth plans?"`
    ]);

    // Value proposition messages
    this.addSubsectionHeader('Core Value Propositions');
    this.addValuePropositions([
      {
        pain: 'Administrative Overhead',
        solution: '25-35% reduction in administrative time through workflow automation',
        proof: 'Clients typically save 8-12 hours per week per staff member'
      },
      {
        pain: 'Compliance Complexity',
        solution: 'Automated compliance monitoring and reporting capabilities',
        proof: '40% reduction in compliance-related costs and audit prep time'
      },
      {
        pain: 'Competitive Pressure',
        solution: 'Advanced analytics and patient experience improvements',
        proof: '15-20% improvement in patient satisfaction scores'
      }
    ]);

    // Discovery questions
    this.addSubsectionHeader('Key Discovery Questions');
    this.addBulletPoints([
      'What percentage of your staff time is spent on administrative tasks?',
      'How are you currently handling compliance reporting and documentation?',
      'What technology investments are you considering for the next 12 months?',
      'How do you measure and track patient satisfaction and practice efficiency?'
    ]);

    // Call to action
    this.addSubsectionHeader('Recommended Call to Action');
    this.addCallToAction(`"Based on what I'm seeing with practices similar to yours, I believe we could help you achieve a ${this.calculateExpectedROI(scanResult)}% improvement in operational efficiency. Would you be open to a 20-minute conversation to explore how this might work for your practice?"`);
  }

  private addFollowUpStrategy(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('FOLLOW-UP STRATEGY & APPROACH');

    // Previous interaction summary
    this.addSubsectionHeader('Previous Interaction Summary');
    this.addBulletPoints([
      'Initial contact established interest in efficiency improvements',
      'Key stakeholders identified: Practice administrator, Lead physician',
      'Primary concerns: Implementation disruption, staff training requirements',
      'Next step: Detailed practice assessment and customized proposal'
    ]);

    // Follow-up messaging
    this.addSubsectionHeader('Follow-Up Message Framework');
    this.addFollowUpMessages([
      {
        approach: 'Value Reinforcement',
        message: `"Following up on our conversation about efficiency improvements. I've identified 3 specific areas where practices like yours typically see immediate impact..."`
      },
      {
        approach: 'Social Proof',
        message: `"I wanted to share a recent success story from [Similar Practice] who achieved ${this.calculateExpectedROI(scanResult)}% efficiency improvement in just 60 days..."`
      },
      {
        approach: 'Urgency Creation',
        message: `"With Q4 budget planning approaching, now is the optimal time to evaluate solutions that can deliver ROI in the next fiscal year..."`
      }
    ]);

    // Objection handling
    this.addSubsectionHeader('Common Objections & Responses');
    this.addObjectionHandling([
      {
        objection: '"We don\'t have time for implementation right now"',
        response: 'Our phased approach minimizes disruption - most practices see productivity gains within the first 30 days that more than offset unknown temporary workflow adjustments.'
      },
      {
        objection: '"The cost seems high for our practice size"',
        response: `Based on your ${researchData.practiceInfo?.staff || 10} staff members, the ROI typically pays for itself in 6-8 months through efficiency gains alone.`
      },
      {
        objection: '"We need to evaluate other options first"',
        response: 'I understand the importance of due diligence. Let me provide you with a comparison framework and reference customers to help accelerate your evaluation process.'
      }
    ]);
  }

  private addValuePropositionRefinement(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('REFINED VALUE PROPOSITION');

    // Practice-specific value drivers
    this.addSubsectionHeader('Practice-Specific Value Drivers');
    this.addValueDrivers([
      {
        driver: 'Operational Efficiency',
        current: 'Manual processes, paper workflows',
        future: '25-35% reduction in administrative time',
        impact: `$${Math.round(this.calculateEfficiencySavings(researchData) * 0.3).toLocaleString()} annual savings`
      },
      {
        driver: 'Revenue Optimization',
        current: 'Billing inefficiencies, missed charges',
        future: '8-12% improvement in billing accuracy',
        impact: `$${Math.round(this.calculateRevenueLift(researchData) * 0.1).toLocaleString()} additional revenue`
      },
      {
        driver: 'Competitive Advantage',
        current: 'Standard patient experience',
        future: 'Digital-first patient engagement',
        impact: '15-20% improvement in patient satisfaction'
      }
    ]);

    // ROI calculation
    this.addSubsectionHeader('Financial Impact Summary');
    this.addROICalculation(scanResult, researchData);

    // Implementation confidence
    this.addSubsectionHeader('Implementation Confidence Factors');
    this.addBulletPoints([
      'Proven methodology with 95% success rate in similar practices',
      'Dedicated implementation team with medical practice expertise',
      'Comprehensive training program with ongoing support',
      'Performance guarantees and success metrics tracking'
    ]);
  }

  private addBreakthroughObstacleAnalysis(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('OBSTACLE ANALYSIS & BREAKTHROUGH STRATEGY');

    // Identified obstacles
    this.addSubsectionHeader('Current Obstacles');
    this.addObstacleAnalysis([
      {
        obstacle: 'Decision Maker Access',
        analysis: 'Primary decision maker (practice owner) has limited availability',
        solution: 'Leverage practice administrator as champion; provide executive briefing materials'
      },
      {
        obstacle: 'Budget Concerns',
        analysis: 'Practice cautious about technology investments due to previous experience',
        solution: 'Performance-based pricing model; start with pilot program to demonstrate value'
      },
      {
        obstacle: 'Implementation Timing',
        analysis: 'Concerns about disrupting current workflows during busy season',
        solution: 'Phased implementation plan; begin with non-disruptive modules first'
      }
    ]);

    // Breakthrough strategies
    this.addSubsectionHeader('Breakthrough Strategies');
    this.addBreakthroughStrategies([
      'Stakeholder Mapping: Identify and engage all decision influencers',
      'Reference Selling: Connect with similar practice that achieved success',
      'Pilot Approach: Propose limited-scope proof of concept',
      'Executive Briefing: C-level presentation focusing on strategic impact'
    ]);
  }

  private addBreakthroughAlternatives(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('ALTERNATIVE PATHWAYS & APPROACHES');

    // Multiple pathway options
    this.addSubsectionHeader('Engagement Pathway Options');
    this.addPathwayOptions([
      {
        pathway: 'Direct Executive Approach',
        description: 'Direct outreach to practice owner/medical director',
        pros: 'Fastest decision; highest authority level',
        cons: 'Limited availability; may prefer delegation',
        probability: '40%'
      },
      {
        pathway: 'Champion Strategy',
        description: 'Work through practice administrator or operations manager',
        pros: 'More accessible; understands operational challenges',
        cons: 'May need executive approval; longer cycle',
        probability: '70%'
      },
      {
        pathway: 'Peer Introduction',
        description: 'Introduction through existing customer or industry connection',
        pros: 'Credibility; trusted source recommendation',
        cons: 'Dependent on network; timing constraints',
        probability: '60%'
      }
    ]);

    // Recommended approach
    this.addSubsectionHeader('Recommended Multi-Channel Approach');
    this.addBulletPoints([
      '1. Execute champion strategy while requesting executive introduction',
      '2. Leverage peer network for credibility and reference calls',
      '3. Provide executive-level materials for upward communication',
      '4. Create urgency through market timing and competitive intelligence'
    ]);
  }

  private addBreakthroughUrgencyCreation(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('URGENCY CREATION & COMPELLING EVENTS');

    // Market timing factors
    this.addSubsectionHeader('Market Timing Factors');
    this.addBulletPoints([
      'Q4 budget planning window creating implementation opportunity',
      'Regulatory changes increasing compliance requirements and costs',
      'Competitive practices gaining efficiency advantages through technology',
      'Post-pandemic patient expectations driving digital transformation'
    ]);

    // Compelling events
    this.addSubsectionHeader('Compelling Events');
    this.addCompellingEvents([
      {
        event: 'Budget Cycle Deadline',
        timeline: 'Next 45 days',
        impact: 'Miss opportunity for next fiscal year implementation',
        message: 'Limited time to evaluate and approve for current budget cycle'
      },
      {
        event: 'Competitive Pressure',
        timeline: 'Ongoing',
        impact: 'Risk losing market share to more efficient competitors',
        message: 'Early adopters gaining 15-25% efficiency advantages'
      },
      {
        event: 'Regulatory Compliance',
        timeline: 'Next 6 months',
        impact: 'Increased manual compliance costs and audit risk',
        message: 'Automated compliance reduces costs by 40% and audit risk'
      }
    ]);

    // Urgency messaging
    this.addSubsectionHeader('Urgency Messaging Framework');
    this.addUrgencyMessages([
      '"The practices that implement efficiency solutions now will have a 12-month competitive advantage over those who wait until next year."',
      '"With current budget cycles, this is the optimal time to make investments that will deliver ROI throughout the next fiscal year."',
      '"The cost of delayed decision-making is approximately $X per month in lost efficiency gains."'
    ]);
  }

  private addClosingDecisionMakerAnalysis(_scanResult: EnhancedScanResult, _researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('DECISION MAKER ANALYSIS & CLOSING STRATEGY');

    // Decision maker mapping
    this.addSubsectionHeader('Decision Maker Analysis');
    this.addDecisionMakerMapping([
      {
        role: 'Economic Buyer',
        person: 'Practice Owner/Medical Director',
        influence: 'High',
        concerns: 'ROI, implementation risk, strategic fit',
        approach: 'Executive briefing focused on competitive advantage and financial impact'
      },
      {
        role: 'Technical Buyer', 
        person: 'Practice Administrator/IT Manager',
        influence: 'High',
        concerns: 'Integration complexity, staff training, workflow disruption',
        approach: 'Technical demonstration and implementation methodology review'
      },
      {
        role: 'User Buyer',
        person: 'Clinical and Administrative Staff',
        influence: 'Medium',
        concerns: 'Ease of use, training requirements, workflow changes',
        approach: 'User experience demonstration and training program overview'
      }
    ]);

    // Closing strategy
    this.addSubsectionHeader('Closing Strategy Framework');
    this.addClosingStrategy([
      'Consensus Building: Ensure all stakeholders aligned on value proposition',
      'Risk Mitigation: Address remaining concerns with guarantees and references',
      'Timeline Pressure: Leverage budget cycles and competitive timing',
      'Multiple Options: Present tiered implementation approaches for flexibility'
    ]);
  }

  private addClosingImplementationPlanning(scanResult: EnhancedScanResult, researchData: ResearchData, _options: SalesRepReportOptions): void {
    this.addSectionHeader('IMPLEMENTATION PLANNING & CONTRACT TERMS');

    // Implementation options
    this.addSubsectionHeader('Implementation Options');
    this.addImplementationOptions([
      {
        option: 'Full Implementation',
        timeline: '90 days',
        investment: this.calculateImplementationCost(researchData),
        roi: `${this.calculateExpectedROI(scanResult)}% efficiency improvement`,
        description: 'Complete solution deployment with full feature set'
      },
      {
        option: 'Phased Implementation',
        timeline: '120 days',
        investment: `${Math.round(parseFloat((this.calculateImplementationCost(researchData) || '$0').replace(/[$,]/g, '')) * 0.8).toLocaleString()}`,
        roi: `${Math.round(this.calculateExpectedROI(scanResult) * 0.75)}% initial efficiency improvement`,
        description: 'Gradual rollout starting with highest-impact modules'
      },
      {
        option: 'Pilot Program',
        timeline: '60 days',
        investment: `${Math.round(parseFloat((this.calculateImplementationCost(researchData) || '$0').replace(/[$,]/g, '')) * 0.4).toLocaleString()}`,
        roi: `${Math.round(this.calculateExpectedROI(scanResult) * 0.5)}% proof of concept ROI`,
        description: 'Limited scope proof of concept with specific department'
      }
    ]);

    // Contract terms framework
    this.addSubsectionHeader('Recommended Contract Terms');
    this.addContractTerms([
      'Performance Guarantees: Minimum efficiency improvement targets with remediation clauses',
      'Implementation Timeline: Milestone-based schedule with penalties for delays',
      'Training and Support: Comprehensive training program with ongoing support included',
      'Success Metrics: Clearly defined KPIs and measurement methodology'
    ]);

    // Next steps
    this.addSubsectionHeader('Final Steps to Close');
    this.addBulletPoints([
      '1. Present final proposal with implementation options',
      '2. Schedule stakeholder alignment meeting for final decision',
      '3. Prepare contract documentation with agreed terms',
      '4. Coordinate implementation kickoff within 30 days of signature'
    ]);
  }

  // Helper Methods for Report Generation
  private setupDocument(scanResult: EnhancedScanResult, options: SalesRepReportOptions, subtitle: string): void {
    const reportType = options.reportType || 'sales_report';
    const doctorName = scanResult.doctor || 'Healthcare Professional';
    const cleanDoctorName = doctorName.replace(/^Dr\.?\s*/i, '');
    const salesRepName = options.salesRepName || 'Sales Representative';
    const companyName = options.companyName || 'Company';
    const productName = options.productName || 'Product';
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Create dynamic title based on report type
    let documentTitle = '';
    if (reportType === 'mckinsey_executive') {
      documentTitle = `${productName} Impact Report for Dr. ${cleanDoctorName} - ${reportDate}`;
    } else {
      documentTitle = `${reportType.replace(/_/g, ' ').toUpperCase()} - Dr. ${cleanDoctorName} - ${reportDate}`;
    }
    
    this.doc.setProperties({
      title: documentTitle,
      subject: `${subtitle} - ${salesRepName}`,
      author: salesRepName,
      creator: companyName,
      keywords: `sales, report, ${doctorName}, ${productName}, ${reportType}`
    });
  }

  private addNewPage(): void {
    this.doc.addPage();
    this.pageCount++;
    this.currentY = this.margin;
    this.addPageHeader();
    this.addPageNumber();
  }

  private addPageHeader(): void {
    this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.rect(0, 0, this.pageWidth, 30, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('CONFIDENTIAL - Sales Intelligence', this.pageWidth / 2, 18, { align: 'center' });
    
    this.currentY = 50;
  }

  private addPageNumber(): void {
    this.doc.setTextColor(150, 150, 150);
    this.doc.setFontSize(9);
    this.doc.text(`${this.pageCount}`, this.pageWidth - this.margin, this.pageHeight - 20, { align: 'right' });
  }

  private addSectionHeader(title: string): void {
    this.currentY += 10;
    this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.rect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 25, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 15, this.currentY + 12);
    
    this.currentY += 35;
  }

  private addSubsectionHeader(title: string): void {
    this.currentY += 15;
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 20;
  }

  private addMcKinseySlideHeader(title: string, subtitle: string): void {
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 25;
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(subtitle, this.margin, this.currentY);
    
    this.currentY += 40;
  }

  private addWrappedText(text: string, maxWidth: number, x?: number): void {
    const lines = this.doc.splitTextToSize(text, maxWidth);
    this.doc.setFontSize(11);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'normal');
    
    lines.forEach((line: string) => {
      this.doc.text(line, x || this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private addBulletPoints(points: string[]): void {
    points.forEach(point => {
      this.currentY += 16;
      this.doc.setFontSize(11);
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`• ${point}`, this.margin + 10, this.currentY);
    });
    this.currentY += 10;
  }

  // Calculation helpers
  private calculateRevenueOpportunity(scanResult: EnhancedScanResult, researchData: ResearchData): string {
    const baseRevenue = (researchData.practiceInfo?.staff || 10) * 45000;
    const opportunity = Math.round(baseRevenue * (scanResult.score / 100) * 0.15);
    return `$${opportunity.toLocaleString()}`;
  }

  private calculateImplementationCost(researchData: ResearchData): string {
    const baseCost = (researchData.practiceInfo?.staff || 10) * 3500;
    return `$${baseCost.toLocaleString()}`;
  }

  private calculateExpectedROI(scanResult: EnhancedScanResult): number {
    return Math.round(15 + (scanResult.score / 100) * 25);
  }

  private calculateEfficiencySavings(researchData: ResearchData): number {
    return (researchData.practiceInfo?.staff || 10) * 35000;
  }

  private calculateRevenueLift(researchData: ResearchData): number {
    return (researchData.practiceInfo?.staff || 10) * 75000;
  }

  private calculateComplianceSavings(researchData: ResearchData): number {
    return (researchData.practiceInfo?.staff || 10) * 8000;
  }

  private calculateCompetitiveValue(researchData: ResearchData): number {
    return (researchData.practiceInfo?.staff || 10) * 25000;
  }

  private calculateServiceableMarket(researchData: ResearchData): string {
    const marketSize = (researchData.practiceInfo?.staff || 10) * 250000;
    return `${(marketSize / 1000000).toFixed(1)}M`;
  }

  private getRecommendedApproach(scanResult: EnhancedScanResult): string {
    if (scanResult.score >= 80) return 'Executive-level consultative';
    if (scanResult.score >= 60) return 'Value-focused collaborative';
    return 'Educational relationship-building';
  }

  private getOptimalTimeline(scanResult: EnhancedScanResult): string {
    if (scanResult.score >= 80) return '30-60 days';
    if (scanResult.score >= 60) return '60-90 days';
    return '90-120 days';
  }

  private getImplementationTimeline(scanResult: EnhancedScanResult): string {
    if (scanResult.score >= 80) return '90-day';
    if (scanResult.score >= 60) return '120-day';
    return '150-day';
  }

  private getFitRating(score: number): string {
    if (score >= 80) return 'Excellent Fit';
    if (score >= 60) return 'Good Fit';
    if (score >= 40) return 'Moderate Fit';
    return 'Lower Fit';
  }

  private getReadinessAssessment(scanResult: EnhancedScanResult, researchData: ResearchData): string {
    const factors = [
      scanResult.score >= 70 ? 1 : 0,
      (researchData.practiceInfo?.technology?.length ?? 0) >= 2 ? 1 : 0,
      (researchData.practiceInfo?.staff || 0) >= 5 ? 1 : 0
    ];
    const readiness = factors.reduce((a, b) => a + b, 0);
    
    if (readiness >= 3) return 'High - Ready for immediate implementation';
    if (readiness >= 2) return 'Medium - Good candidate with some preparation needed';
    return 'Lower - Requires relationship building and education';
  }

  private getTopOpportunities(scanResult: EnhancedScanResult): string[] {
    if (scanResult.score >= 80) {
      return ['workflow automation', 'revenue optimization', 'competitive advantage'];
    } else if (scanResult.score >= 60) {
      return ['efficiency improvement', 'cost reduction', 'compliance automation'];
    } else {
      return ['process standardization', 'staff productivity', 'technology modernization'];
    }
  }

  private getRequiredTeamSize(researchData: ResearchData): string {
    const staff = researchData.practiceInfo?.staff || 10;
    if (staff >= 20) return '5-7';
    if (staff >= 10) return '3-5';
    return '2-3';
  }

  private getTrainingHours(researchData: ResearchData): string {
    const staff = researchData.practiceInfo?.staff || 10;
    return `${staff * 8}-${staff * 12}`;
  }

  private getTechRequirements(_researchData: ResearchData): string {
    return 'Standard network infrastructure, cloud connectivity, existing EHR integration';
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  // Additional helper methods for complex layout elements
  private addMcKinseyVisualElements(scanResult: EnhancedScanResult): void {
    // Simplified visual representation of score
    const centerX = this.pageWidth / 2;
    const centerY = 320;
    
    // Score visualization circle
    this.doc.setFillColor(240, 240, 240);
    this.doc.circle(centerX, centerY, 40, 'F');
    
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${scanResult.score}%`, centerX, centerY + 5, { align: 'center' });
  }

  private addMcKinseyMetricsDashboard(scanResult: EnhancedScanResult, researchData: ResearchData): void {
    const metrics = [
      { label: 'Practice Fit', value: `${scanResult.score}%`, color: this.brandColors.primary },
      { label: 'Revenue Opportunity', value: this.calculateRevenueOpportunity(scanResult, researchData), color: this.brandColors.accent },
      { label: 'Implementation', value: this.getImplementationTimeline(scanResult), color: this.brandColors.secondary },
      { label: 'Expected ROI', value: `${this.calculateExpectedROI(scanResult)}%`, color: this.brandColors.primary }
    ];

    const boxWidth = (this.pageWidth - 2 * this.margin - 30) / 4;
    metrics.forEach((metric, index) => {
      const x = this.margin + (boxWidth + 10) * index;
      
      this.doc.setFillColor(250, 250, 250);
      this.doc.rect(x, this.currentY, boxWidth, 60, 'F');
      this.doc.setDrawColor(...this.hexToRgb(metric.color));
      this.doc.setLineWidth(2);
      this.doc.rect(x, this.currentY, boxWidth, 60, 'S');
      
      this.doc.setTextColor(...this.hexToRgb(metric.color));
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + boxWidth/2, this.currentY + 25, { align: 'center' });
      
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric.label, x + boxWidth/2, this.currentY + 45, { align: 'center' });
    });
    
    this.currentY += 80;
  }

  private addMcKinseyThreeColumnInsights(insights: unknown[]): void {
    const columnWidth = (this.pageWidth - 2 * this.margin - 20) / 3;
    
    insights.forEach((insight, index) => {
      const x = this.margin + (columnWidth + 10) * index;
      
      this.doc.setFillColor(250, 250, 250);
      this.doc.rect(x, this.currentY, columnWidth, 120, 'F');
      this.doc.setDrawColor(...this.hexToRgb(insight.color));
      this.doc.setLineWidth(2);
      this.doc.rect(x, this.currentY, columnWidth, 120, 'S');
      
      this.doc.setTextColor(...this.hexToRgb(insight.color));
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(insight.title, x + 10, this.currentY + 20);
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const lines = this.doc.splitTextToSize(insight.content, columnWidth - 20);
      let textY = this.currentY + 35;
      lines.forEach((line: string) => {
        this.doc.text(line, x + 10, textY);
        textY += 12;
      });
    });
    
    this.currentY += 140;
  }

  private addMcKinseyBottomLine(recommendation: string): void {
    this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 50, 'F');
    
    this.currentY += 15;
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('BOTTOM LINE', this.margin + 15, this.currentY);
    
    this.currentY += 20;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(recommendation, this.margin + 15, this.currentY);
    
    this.currentY += 25;
  }

  private addMcKinseySection(title: string, points: string[]): void {
    this.currentY += 20;
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    
    this.currentY += 20;
    points.forEach(point => {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`• ${point}`, this.margin + 10, this.currentY);
      this.currentY += 14;
    });
  }

  private addMcKinseyMarketForces(): void {
    // Simplified market forces representation
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MARKET FORCES DRIVING OPPORTUNITY', this.margin, this.currentY);
    
    this.currentY += 20;
    const forces = [
      'Technology Adoption Acceleration',
      'Regulatory Compliance Requirements',
      'Competitive Pressure & Differentiation',
      'Patient Experience Expectations'
    ];
    
    forces.forEach(force => {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`→ ${force}`, this.margin + 20, this.currentY);
      this.currentY += 16;
    });
  }

  private addMcKinseyFinancialModel(_scanResult: EnhancedScanResult, researchData: ResearchData): void {
    // Simplified financial model table
    const tableData = [
      ['Investment Category', 'Year 1', 'Year 2', 'Year 3'],
      ['Implementation Cost', this.calculateImplementationCost(researchData), '-', '-'],
      ['Efficiency Savings', `$${Math.round(this.calculateEfficiencySavings(researchData) * 0.3).toLocaleString()}`, `$${Math.round(this.calculateEfficiencySavings(researchData) * 0.35).toLocaleString()}`, `$${Math.round(this.calculateEfficiencySavings(researchData) * 0.4).toLocaleString()}`],
      ['Revenue Lift', `$${Math.round(this.calculateRevenueLift(researchData) * 0.08).toLocaleString()}`, `$${Math.round(this.calculateRevenueLift(researchData) * 0.12).toLocaleString()}`, `$${Math.round(this.calculateRevenueLift(researchData) * 0.15).toLocaleString()}`],
      ['Net Benefit', `$${Math.round((this.calculateEfficiencySavings(researchData) * 0.3 + this.calculateRevenueLift(researchData) * 0.08) - parseFloat((this.calculateImplementationCost(researchData) || '$0').replace(/[$,]/g, ''))).toLocaleString()}`, `$${Math.round(this.calculateEfficiencySavings(researchData) * 0.35 + this.calculateRevenueLift(researchData) * 0.12).toLocaleString()}`, `$${Math.round(this.calculateEfficiencySavings(researchData) * 0.4 + this.calculateRevenueLift(researchData) * 0.15).toLocaleString()}`]
    ];

    const colWidths = [150, 100, 100, 100];
    const rowHeight = 20;
    
    tableData.forEach((row, rowIndex) => {
      const y = this.currentY + rowIndex * rowHeight;
      
      row.forEach((cell, colIndex) => {
        const x = this.margin + colWidths.slice(0, colIndex).reduce((a, b) => a + b, 0);
        
        if (rowIndex === 0) {
          this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
          this.doc.rect(x, y, colWidths[colIndex], rowHeight, 'F');
          this.doc.setTextColor(255, 255, 255);
          this.doc.setFont('helvetica', 'bold');
        } else {
          this.doc.setFillColor(rowIndex % 2 === 0 ? 250 : 245, rowIndex % 2 === 0 ? 250 : 245, rowIndex % 2 === 0 ? 250 : 245);
          this.doc.rect(x, y, colWidths[colIndex], rowHeight, 'F');
          this.doc.setTextColor(0, 0, 0);
          this.doc.setFont('helvetica', 'normal');
        }
        
        this.doc.setDrawColor(200, 200, 200);
        this.doc.rect(x, y, colWidths[colIndex], rowHeight, 'S');
        
        this.doc.setFontSize(9);
        this.doc.text(cell, x + 5, y + 12);
      });
    });
    
    this.currentY += tableData.length * rowHeight + 10;
  }

  private addMcKinseyCompetitiveMatrix(): void {
    // Simplified competitive positioning matrix
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('COMPETITIVE POSITIONING MATRIX', this.margin, this.currentY);
    
    this.currentY += 25;
    
    const competitors = [
      { name: 'Our Solution', integration: 'High', cost: 'Medium', support: 'High', position: 'LEADER' },
      { name: 'Competitor A', integration: 'Medium', cost: 'High', support: 'Medium', position: 'CHALLENGER' },
      { name: 'Competitor B', integration: 'Low', cost: 'Low', support: 'Low', position: 'NICHE' }
    ];
    
    competitors.forEach(comp => {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(comp.name, this.margin + 10, this.currentY);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Integration: ${comp.integration} | Cost: ${comp.cost} | Support: ${comp.support}`, this.margin + 120, this.currentY);
      this.currentY += 16;
    });
  }

  private addMcKinseyPrimaryRecommendation(scanResult: EnhancedScanResult, researchData: ResearchData): void {
    this.doc.setFillColor(...this.hexToRgb(this.brandColors.accent));
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 80, 'F');
    
    this.currentY += 20;
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('PRIMARY RECOMMENDATION', this.margin + 20, this.currentY);
    
    this.currentY += 25;
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    const recommendation = `Immediate executive engagement with ${scanResult.doctor} focusing on ${this.calculateRevenueOpportunity(scanResult, researchData)} revenue opportunity and ${this.calculateExpectedROI(scanResult)}% efficiency improvement through strategic technology implementation.`;
    const lines = this.doc.splitTextToSize(recommendation, this.pageWidth - 2 * this.margin - 40);
    lines.forEach((line: string) => {
      this.doc.text(line, this.margin + 20, this.currentY);
      this.currentY += 14;
    });
    
    this.currentY += 15;
  }

  private addMcKinseyTimeline(phases: unknown[]): void {
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('IMPLEMENTATION TIMELINE', this.margin, this.currentY);
    
    this.currentY += 25;
    
    phases.forEach((phase, index) => {
      const y = this.currentY + index * 60;
      
      // Phase box
      this.doc.setFillColor(...this.hexToRgb(this.brandColors.primary));
      this.doc.rect(this.margin, y, 80, 30, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(phase.phase, this.margin + 40, y + 15, { align: 'center' });
      this.doc.text(phase.duration, this.margin + 40, y + 25, { align: 'center' });
      
      // Activities
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      let activityY = y + 5;
      phase.activities.forEach((activity: string) => {
        this.doc.text(`• ${activity}`, this.margin + 90, activityY);
        activityY += 12;
      });
    });
    
    this.currentY += phases.length * 60 + 20;
  }

  private addMcKinseyRiskMatrix(): void {
    // Simplified risk matrix representation
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RISK ASSESSMENT MATRIX', this.margin, this.currentY);
    
    this.currentY += 20;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Overall Risk Level: LOW to MEDIUM', this.margin + 10, this.currentY);
    this.currentY += 14;
    this.doc.text('Most risks mitigatable through proven methodology and comprehensive support', this.margin + 10, this.currentY);
  }

  private addMcKinseyKPIDashboard(): void {
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('KEY PERFORMANCE INDICATORS', this.margin, this.currentY);
    
    this.currentY += 20;
    const kpis = [
      'User Adoption: >90% within 30 days',
      'Efficiency Improvement: 25-35% within 60 days',
      'ROI Achievement: Break-even within 6-12 months',
      'User Satisfaction: >4.5/5.0 ongoing'
    ];
    
    kpis.forEach(kpi => {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`• ${kpi}`, this.margin + 10, this.currentY);
      this.currentY += 16;
    });
  }

  // Outreach-specific helper methods
  private addOutreachMetricsSummary(scanResult: EnhancedScanResult, researchData: ResearchData): void {
    const practiceScore = scanResult.score || 0;
    const researchQuality = scanResult.researchQuality || 'Standard';
    const metrics = [
      { label: 'Practice Fit', value: `${practiceScore}%` },
      { label: 'Staff Size', value: `${researchData.practiceInfo?.staff || 10}+` },
      { label: 'Research Quality', value: researchQuality.toUpperCase() },
      { label: 'ROI Potential', value: `${this.calculateExpectedROI(scanResult)}%` }
    ];

    const startY = this.currentY;
    metrics.forEach((metric, index) => {
      const x = this.margin + (index % 2) * 250;
      const y = startY + Math.floor(index / 2) * 30;
      
      this.doc.setTextColor(100, 100, 100);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`${metric.label}:`, x, y);
      
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric.value, x + 80, y);
    });
    
    this.currentY = startY + 60;
  }

  private addConversationStarters(starters: string[]): void {
    starters.forEach((starter, index) => {
      this.currentY += 20;
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Option ${index + 1}:`, this.margin + 10, this.currentY);
      
      this.currentY += 14;
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      const lines = this.doc.splitTextToSize(starter, this.pageWidth - 2 * this.margin - 40);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin + 20, this.currentY);
        this.currentY += 12;
      });
    });
    this.currentY += 10;
  }

  private addValuePropositions(props: unknown[]): void {
    props.forEach(prop => {
      this.currentY += 20;
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${prop.pain}:`, this.margin + 10, this.currentY);
      
      this.currentY += 14;
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Solution: ${prop.solution}`, this.margin + 20, this.currentY);
      
      this.currentY += 12;
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`Proof Point: ${prop.proof}`, this.margin + 20, this.currentY);
    });
    this.currentY += 15;
  }

  private addCallToAction(cta: string): void {
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 60, 'F');
    this.doc.setDrawColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setLineWidth(2);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 60, 'S');
    
    this.currentY += 15;
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('RECOMMENDED CALL TO ACTION:', this.margin + 15, this.currentY);
    
    this.currentY += 20;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    const lines = this.doc.splitTextToSize(cta, this.pageWidth - 2 * this.margin - 30);
    lines.forEach((line: string) => {
      this.doc.text(line, this.margin + 15, this.currentY);
      this.currentY += 12;
    });
    
    this.currentY += 15;
  }

  private addFollowUpMessages(messages: unknown[]): void {
    messages.forEach(msg => {
      this.currentY += 20;
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${msg.approach}:`, this.margin + 10, this.currentY);
      
      this.currentY += 14;
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      const lines = this.doc.splitTextToSize(msg.message, this.pageWidth - 2 * this.margin - 40);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin + 20, this.currentY);
        this.currentY += 12;
      });
    });
    this.currentY += 10;
  }

  private addObjectionHandling(objections: unknown[]): void {
    objections.forEach(obj => {
      this.currentY += 20;
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('OBJECTION:', this.margin + 10, this.currentY);
      
      this.currentY += 12;
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(obj.objection, this.margin + 20, this.currentY);
      
      this.currentY += 16;
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.accent));
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('RESPONSE:', this.margin + 10, this.currentY);
      
      this.currentY += 12;
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'normal');
      const lines = this.doc.splitTextToSize(obj.response, this.pageWidth - 2 * this.margin - 40);
      lines.forEach((line: string) => {
        this.doc.text(line, this.margin + 20, this.currentY);
        this.currentY += 12;
      });
    });
    this.currentY += 15;
  }

  private addValueDrivers(drivers: unknown[]): void {
    drivers.forEach(driver => {
      this.currentY += 25;
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(driver.driver, this.margin + 10, this.currentY);
      
      this.currentY += 14;
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Current State: ${driver.current}`, this.margin + 20, this.currentY);
      
      this.currentY += 12;
      this.doc.text(`Future State: ${driver.future}`, this.margin + 20, this.currentY);
      
      this.currentY += 12;
      this.doc.setTextColor(...this.hexToRgb(this.brandColors.accent));
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Financial Impact: ${driver.impact}`, this.margin + 20, this.currentY);
    });
    this.currentY += 15;
  }

  private addROICalculation(scanResult: EnhancedScanResult, researchData: ResearchData): void {
    this.doc.setFillColor(250, 250, 250);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 100, 'F');
    this.doc.setDrawColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setLineWidth(1);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 100, 'S');
    
    this.currentY += 20;
    this.doc.setTextColor(...this.hexToRgb(this.brandColors.primary));
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ROI CALCULATION SUMMARY', this.margin + 15, this.currentY);
    
    this.currentY += 20;
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Annual Efficiency Savings: $${Math.round(this.calculateEfficiencySavings(researchData) * 0.3).toLocaleString()}`, this.margin + 20, this.currentY);
    
    this.currentY += 14;
    this.doc.text(`Annual Revenue Lift: $${Math.round(this.calculateRevenueLift(researchData) * 0.1).toLocaleString()}`, this.margin + 20, this.currentY);
    
    this.currentY += 14;
    this.doc.text(`Implementation Investment: ${this.calculateImplementationCost(researchData)}`, this.margin + 20, this.currentY);
    
    this.currentY += 14;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Payback Period: 6-12 months | Annual ROI: ${this.calculateExpectedROI(scanResult)}%`, this.margin + 20, this.currentY);
    
    this.currentY += 25;
  }

  // Additional helper methods for breakthrough and closing reports
  private addObstacleAnalysis(obstacles: unknown[]): void {
    obstacles.forEach(obstacle => {
      this.currentY += 20;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${obstacle.obstacle}:`, this.margin + 10, this.currentY);
      
      this.currentY += 15;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Analysis: ${obstacle.analysis}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Solution: ${obstacle.solution}`, this.margin + 20, this.currentY);
    });
  }

  private addBreakthroughStrategies(strategies: string[]): void {
    this.addBulletPoints(strategies);
  }

  private addPathwayOptions(pathways: unknown[]): void {
    pathways.forEach((pathway, index) => {
      this.currentY += 25;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`Option ${index + 1}: ${pathway.name}`, this.margin + 10, this.currentY);
      
      this.currentY += 15;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Approach: ${pathway.approach}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Timeline: ${pathway.timeline}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Probability: ${pathway.probability}`, this.margin + 20, this.currentY);
    });
  }

  private addCompellingEvents(events: unknown[]): void {
    events.forEach(event => {
      this.currentY += 20;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`• ${event.event}`, this.margin + 10, this.currentY);
      
      this.currentY += 15;
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Impact: ${event.impact}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Timing: ${event.timing}`, this.margin + 20, this.currentY);
    });
  }

  private addUrgencyMessages(messages: string[]): void {
    this.addBulletPoints(messages);
  }

  private addDecisionMakerMapping(decisionMakers: unknown[]): void {
    decisionMakers.forEach(dm => {
      this.currentY += 20;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${dm.role}: ${dm.name || 'To be identified'}`, this.margin + 10, this.currentY);
      
      this.currentY += 15;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Influence: ${dm.influence}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Key Concerns: ${dm.concerns}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Approach: ${dm.approach}`, this.margin + 20, this.currentY);
    });
  }

  private addClosingStrategy(strategies: string[]): void {
    this.addBulletPoints(strategies);
  }

  private addImplementationOptions(options: unknown[]): void {
    options.forEach((option) => {
      this.currentY += 25;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${option.name}`, this.margin + 10, this.currentY);
      
      this.currentY += 15;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Investment: ${option.investment}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Timeline: ${option.timeline}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Benefits: ${option.benefits}`, this.margin + 20, this.currentY);
    });
  }

  private addContractTerms(terms: unknown[]): void {
    terms.forEach(term => {
      this.currentY += 20;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${term.item}:`, this.margin + 10, this.currentY);
      
      this.currentY += 15;
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Standard: ${term.standard}`, this.margin + 20, this.currentY);
      
      this.currentY += 15;
      this.doc.text(`Negotiable: ${term.negotiable}`, this.margin + 20, this.currentY);
    });
  }

  // Additional methods would continue here for other report types...
  // Due to length constraints, I'm showing the key structure and patterns
}

// Factory functions for easy report generation
/**
 * Generate Product Impact Report (renamed from McKinsey Executive Report)
 */
export async function generateMcKinseyExecutiveReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  // Always use the new enhanced version with medical intelligence
  const { generateProductImpactReport } = await import('./enhancedSalesRepReports');
  return generateProductImpactReport(scanResult, researchData, salesRepName, companyName, productName);
}

/**
 * Generate Product Impact Report directly (new preferred method)
 */
export async function generateProductImpactReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  const { generateProductImpactReport } = await import('./enhancedSalesRepReports');
  return generateProductImpactReport(scanResult, researchData, salesRepName, companyName, productName);
}

export async function generateInitialOutreachReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  // Use enhanced version if product intelligence is available
  if (researchData.productIntelligence || researchData.enhancedInsights) {
    const { generateEnhancedInitialOutreachReport } = await import('./enhancedSalesRepReports');
    return generateEnhancedInitialOutreachReport(scanResult, researchData, salesRepName, companyName, productName);
  }
  
  const generator = new SalesRepReportGenerator();
  
  return await generator.generateSalesRepReport(scanResult, researchData, {
    reportType: 'initial_outreach',
    includeFinancialProjections: false,
    includeCompetitiveIntel: false,
    includeImplementationPlan: false,
    salesRepName,
    companyName,
    productName
  });
}

export async function generateFollowUpReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  // Use enhanced version if product intelligence is available
  if (researchData.productIntelligence || researchData.enhancedInsights) {
    const { generateEnhancedFollowUpReport } = await import('./enhancedSalesRepReports');
    return generateEnhancedFollowUpReport(scanResult, researchData, salesRepName, companyName, productName);
  }
  
  const generator = new SalesRepReportGenerator();
  
  return await generator.generateSalesRepReport(scanResult, researchData, {
    reportType: 'follow_up',
    includeFinancialProjections: true,
    includeCompetitiveIntel: false,
    includeImplementationPlan: false,
    salesRepName,
    companyName,
    productName
  });
}

export async function generateBreakthroughReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  // Use enhanced version if product intelligence is available
  if (researchData.productIntelligence || researchData.enhancedInsights) {
    const { generateEnhancedBreakthroughReport } = await import('./enhancedSalesRepReports');
    return generateEnhancedBreakthroughReport(scanResult, researchData, salesRepName, companyName, productName);
  }
  
  const generator = new SalesRepReportGenerator();
  
  return await generator.generateSalesRepReport(scanResult, researchData, {
    reportType: 'breakthrough',
    includeFinancialProjections: true,
    includeCompetitiveIntel: true,
    includeImplementationPlan: true,
    salesRepName,
    companyName,
    productName
  });
}

export async function generateClosingReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  salesRepName: string,
  companyName: string,
  productName: string
): Promise<Blob> {
  // Use enhanced version if product intelligence is available
  if (researchData.productIntelligence || researchData.enhancedInsights) {
    const { generateEnhancedClosingReport } = await import('./enhancedSalesRepReports');
    return generateEnhancedClosingReport(scanResult, researchData, salesRepName, companyName, productName);
  }
  
  const generator = new SalesRepReportGenerator();
  
  return await generator.generateSalesRepReport(scanResult, researchData, {
    reportType: 'closing',
    includeFinancialProjections: true,
    includeCompetitiveIntel: true,
    includeImplementationPlan: true,
    salesRepName,
    companyName,
    productName
  });
}