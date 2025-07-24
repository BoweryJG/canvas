/**
 * Enhanced PDF Export with Product Intelligence
 * Extends the base PDF export to include product/procedure insights
 */

import jsPDF from 'jspdf';
import { type EnhancedScanResult } from './enhancedAI';
import { type ResearchData } from './webResearch';
import { type ProductIntelligence } from './productProcedureIntelligence';

export class EnhancedPDFExporter {
  doc: jsPDF;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF('portrait', 'pt', 'letter');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 50;
    this.lineHeight = 16;
    this.currentY = this.margin;
  }

  /**
   * Add Product Intelligence Section
   */
  addProductIntelligence(researchData: ResearchData, product: string): void {
    const productIntel = researchData.productIntelligence as unknown as ProductIntelligence;
    if (!productIntel) return;

    this.addSectionHeader(`${product.toUpperCase()} MARKET INTELLIGENCE`);
    
    // Market Overview
    this.addSubsectionHeader('Local Market Analysis');
    
    if (productIntel.marketData) {
      this.addMetric('Market Awareness', `${productIntel.marketData.awareness || 0}/100`);
      if (productIntel.marketData.adoptionRate) {
        this.addMetric('Adoption Rate', `${productIntel.marketData.adoptionRate}%`);
      }
      this.addMetric('Price Range', 
        `$${productIntel.marketData.pricingRange?.low || 0} - $${productIntel.marketData.pricingRange?.high || 0}`
      );
      if (productIntel.marketData.roi) {
        this.addMetric('Average ROI', 
          `${productIntel.marketData.roi.min || '0'}x - ${productIntel.marketData.roi.max || '0'}x in ${productIntel.marketData.roi.average || '18 months'}`
        );
      }
    }
    
    this.currentY += 20;
    
    // Competitive Landscape
    this.addSubsectionHeader('Competitive Analysis');
    
    if (productIntel.competitiveLandscape) {
      this.addBulletList('Top Competitors', productIntel.competitiveLandscape.topCompetitors || []);
      this.addBulletList('Key Differentiators', productIntel.competitiveLandscape.differentiators || []);
      if (productIntel.competitiveLandscape.marketShare) {
        this.addMetric('Market Share', `${productIntel.competitiveLandscape.marketShare}%`);
      }
    }
    
    this.currentY += 20;
    
    // Local Insights
    this.addSubsectionHeader('Local Market Intelligence');
    
    if (productIntel.localInsights) {
      this.addMetric('Local Adoption', productIntel.localInsights.adoptionRate || 'Unknown');
      
      if (productIntel.localInsights.topAdopters && productIntel.localInsights.topAdopters.length > 0) {
        this.addBulletList('Current Users', productIntel.localInsights.topAdopters.slice(0, 3));
      }
      
      if (productIntel.localInsights.barriers?.length > 0) {
        this.addBulletList('Common Barriers', productIntel.localInsights.barriers);
      }
      
      if (productIntel.localInsights.socialProof && productIntel.localInsights.socialProof.length > 0) {
        this.currentY += 15;
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Local Success Stories:', this.margin, this.currentY);
        this.currentY += 15;
        
        productIntel.localInsights.socialProof.slice(0, 2).forEach(proof => {
          this.doc.setFont('helvetica', 'italic');
          this.doc.setFontSize(10);
          const lines = this.doc.splitTextToSize(`"${proof.content}"`, this.pageWidth - 2 * this.margin - 20);
          lines.forEach((line: string) => {
            this.currentY += this.lineHeight;
            this.doc.text(line, this.margin + 20, this.currentY);
          });
          this.currentY += 10;
        });
      }
    }
  }

  /**
   * Add Combined Strategy Section
   */
  addCombinedStrategy(researchData: ResearchData, _doctor: string, _product: string): void {
    const combined = researchData.combinedStrategy as {
      perfectMatchScore?: number;
      messagingStrategy?: {
        primaryHook?: string;
        valueProps?: string[];
        urgencyTrigger?: string;
      };
      closingStrategy?: {
        approach?: string;
        timeline?: string;
        decisionDrivers?: string[];
      };
      nextSteps?: string[];
    };
    if (!combined) return;

    this.addSectionHeader('PERSONALIZED SALES STRATEGY');
    
    // Perfect Match Score
    if (combined.perfectMatchScore !== undefined) {
      this.currentY += 20;
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(123, 66, 246); // Canvas purple
      const scoreText = `Perfect Match Score: ${combined.perfectMatchScore}%`;
      const scoreWidth = this.doc.getTextWidth(scoreText);
      this.doc.text(scoreText, (this.pageWidth - scoreWidth) / 2, this.currentY);
      this.doc.setTextColor(0, 0, 0);
      this.currentY += 30;
    }
    
    // Messaging Strategy
    if (combined.messagingStrategy) {
      this.addSubsectionHeader('Recommended Messaging');
      
      if (combined.messagingStrategy.primaryHook) {
        this.addQuote('Primary Hook', combined.messagingStrategy.primaryHook);
      }
      
      if (combined.messagingStrategy.valueProps && combined.messagingStrategy.valueProps.length > 0) {
        this.addBulletList('Value Propositions', combined.messagingStrategy.valueProps);
      }
      
      if (combined.messagingStrategy.urgencyTrigger) {
        this.addQuote('Urgency Trigger', combined.messagingStrategy.urgencyTrigger);
      }
    }
    
    this.currentY += 20;
    
    // Closing Strategy
    if (combined.closingStrategy) {
      this.addSubsectionHeader('Closing Approach');
      
      if (combined.closingStrategy.approach) {
        this.addMetric('Recommended Approach', combined.closingStrategy.approach);
      }
      
      if (combined.closingStrategy.timeline) {
        this.addMetric('Expected Timeline', combined.closingStrategy.timeline);
      }
      
      if (combined.closingStrategy.decisionDrivers && combined.closingStrategy.decisionDrivers.length > 0) {
        this.addBulletList('Key Decision Drivers', combined.closingStrategy.decisionDrivers);
      }
    }
    
    // Next Steps
    if (combined.nextSteps && combined.nextSteps.length > 0) {
      this.currentY += 20;
      this.addSubsectionHeader('Recommended Next Steps');
      
      combined.nextSteps.forEach((step: string, index: number) => {
        this.currentY += 18;
        this.doc.setFontSize(11);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(`${index + 1}. ${step}`, this.margin + 10, this.currentY);
      });
    }
  }

  /**
   * Enhanced Executive Summary with Product Intelligence
   */
  addEnhancedExecutiveSummary(
    scanResult: EnhancedScanResult,
    researchData: ResearchData,
    _product: string
  ): void {
    this.addSectionHeader('EXECUTIVE SUMMARY');
    
    // Enhanced opportunity statement
    const enhancedInsights = researchData.enhancedInsights as {
      executiveSummary?: string;
      opportunityScore?: number;
    };
    const productIntel = researchData.productIntelligence as unknown as ProductIntelligence;
    
    if (enhancedInsights?.executiveSummary) {
      this.currentY += 20;
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'normal');
      const summaryLines = this.doc.splitTextToSize(
        enhancedInsights.executiveSummary as string,
        this.pageWidth - 2 * this.margin
      );
      summaryLines.forEach((line: string) => {
        this.currentY += this.lineHeight + 2;
        this.doc.text(line, this.margin, this.currentY);
      });
    }
    
    this.currentY += 25;
    
    // Key Metrics Grid
    this.doc.setDrawColor(230, 230, 230);
    this.doc.setFillColor(248, 248, 248);
    
    const boxWidth = (this.pageWidth - 2 * this.margin - 30) / 3;
    const boxHeight = 80;
    let xPos = this.margin;
    
    // Practice Fit Score
    this.drawMetricBox(xPos, this.currentY, boxWidth, boxHeight, 'Practice Fit', `${scanResult.score}%`);
    
    // Product Market Fit
    xPos += boxWidth + 15;
    const marketFit = productIntel?.marketData?.awareness || 50;
    this.drawMetricBox(xPos, this.currentY, boxWidth, boxHeight, 'Market Readiness', `${marketFit}%`);
    
    // Opportunity Score
    xPos += boxWidth + 15;
    const oppScore = enhancedInsights?.opportunityScore || scanResult.score;
    this.drawMetricBox(xPos, this.currentY, boxWidth, boxHeight, 'Opportunity Score', `${oppScore}%`);
    
    this.currentY += boxHeight + 30;
    
    // Quick Wins
    if (productIntel?.localInsights?.socialProof && productIntel.localInsights.socialProof.length > 0) {
      this.addSubsectionHeader('Proven Success in Local Market');
      this.currentY += 15;
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'italic');
      const proof = productIntel.localInsights.socialProof[0].content;
      const proofLines = this.doc.splitTextToSize(`"${proof}"`, this.pageWidth - 2 * this.margin - 20);
      proofLines.forEach((line: string) => {
        this.currentY += this.lineHeight;
        this.doc.text(line, this.margin + 10, this.currentY);
      });
    }
  }

  // Helper methods
  private addSectionHeader(text: string): void {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(51, 51, 51);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 8;
    
    // Add underline
    this.doc.setDrawColor(123, 66, 246);
    this.doc.setLineWidth(2);
    this.doc.line(this.margin, this.currentY, this.margin + 100, this.currentY);
    this.currentY += 25;
    
    this.doc.setTextColor(0, 0, 0);
  }

  private addSubsectionHeader(text: string): void {
    this.checkPageBreak(40);
    this.doc.setFontSize(13);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(70, 70, 70);
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += 20;
  }

  private addMetric(label: string, value: string): void {
    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${label}:`, this.margin + 10, this.currentY);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(value, this.margin + 150, this.currentY);
  }

  private addBulletList(title: string, items: string[]): void {
    if (items.length === 0) return;
    
    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${title}:`, this.margin + 10, this.currentY);
    this.currentY += 15;
    
    this.doc.setFont('helvetica', 'normal');
    items.forEach(item => {
      this.checkPageBreak(20);
      this.doc.text(`• ${item}`, this.margin + 20, this.currentY);
      this.currentY += 15;
    });
  }

  private addQuote(label: string, quote: string): void {
    this.currentY += 15;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${label}:`, this.margin + 10, this.currentY);
    this.currentY += 15;
    
    this.doc.setFont('helvetica', 'italic');
    this.doc.setFontSize(10);
    const lines = this.doc.splitTextToSize(`"${quote}"`, this.pageWidth - 2 * this.margin - 30);
    lines.forEach((line: string) => {
      this.checkPageBreak(20);
      this.doc.text(line, this.margin + 20, this.currentY);
      this.currentY += this.lineHeight;
    });
  }

  private drawMetricBox(x: number, y: number, width: number, height: number, label: string, value: string): void {
    // Draw box
    this.doc.roundedRect(x, y, width, height, 8, 8, 'FD');
    
    // Add label
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const labelWidth = this.doc.getTextWidth(label);
    this.doc.text(label, x + (width - labelWidth) / 2, y + 25);
    
    // Add value
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(123, 66, 246);
    const valueWidth = this.doc.getTextWidth(value);
    this.doc.text(value, x + (width - valueWidth) / 2, y + 55);
    
    this.doc.setTextColor(0, 0, 0);
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  addNewPage(): void {
    this.doc.addPage();
    this.currentY = this.margin;
  }
}

/**
 * Generate enhanced PDF with product intelligence
 */
export async function generateEnhancedPDFReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
  product: string
): Promise<Blob> {
  const exporter = new EnhancedPDFExporter();
  
  // Cover page
  exporter.addNewPage();
  
  // Enhanced executive summary
  exporter.addEnhancedExecutiveSummary(scanResult, researchData, product);
  
  // Product intelligence section
  exporter.addNewPage();
  exporter.addProductIntelligence(researchData, product);
  
  // Combined strategy
  exporter.addNewPage();
  exporter.addCombinedStrategy(researchData, scanResult.doctor, product);
  
  return exporter.doc.output('blob');
}