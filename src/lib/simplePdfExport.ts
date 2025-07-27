// @ts-nocheck
/**
 * Simple PDF Export Implementation
 * Provides basic PDF generation functionality with product intelligence support
 */

import type { EnhancedScanResult } from './enhancedAI';
import type { ResearchData } from './webResearch';
import { jsPDF } from 'jspdf';

export interface PDFExportOptions {
  includeLogo?: boolean;
  includeResearch?: boolean;
  includeOutreach?: boolean;
  includeStrategy?: boolean;
  format?: 'compact' | 'detailed' | 'executive';
  branding?: 'canvas' | 'custom';
}

// Product-specific strategies
const PRODUCT_STRATEGIES: Record<string, unknown> = {
  'YOMI': {
    category: 'Robotic Surgery System',
    keyBenefits: [
      'Precision implant placement with robotic guidance',
      'Reduced surgery time by up to 50%',
      'Improved patient outcomes and satisfaction',
      'ROI typically achieved within 18-24 months'
    ],
    targetSpecialties: ['Oral Surgery', 'Periodontics', 'Prosthodontics', 'Implant Dentistry'],
    salesApproach: 'Focus on practice efficiency, precision outcomes, and competitive differentiation. Emphasize how YOMI positions them as technology leaders in their market.',
    objectionHandling: {
      'Cost': 'Compare to lost revenue from referred cases. Show ROI calculator.',
      'Learning Curve': 'Comprehensive training program, ongoing support, quick adoption.',
      'Space': 'Compact design, mobile unit, minimal footprint required.'
    },
    competitiveAdvantage: 'First FDA-cleared robotic dental surgery system. No direct competitors in robotic dental surgery space.'
  },
  'BOTOX': {
    category: 'Aesthetic Injectable',
    keyBenefits: [
      'Most recognized brand in aesthetics',
      'Predictable results with established protocols',
      'High patient demand and satisfaction',
      'Excellent profit margins per treatment'
    ],
    targetSpecialties: ['Dermatology', 'Plastic Surgery', 'Med Spa', 'Aesthetic Medicine'],
    salesApproach: 'Emphasize brand recognition, patient demand, and profitability. Focus on training support and marketing co-op opportunities.',
    objectionHandling: {
      'Competition': 'Gold standard with most clinical data and patient preference.',
      'Price': 'Premium pricing justified by results and patient willingness to pay.',
      'Storage': 'Simple refrigeration requirements, long shelf life.'
    },
    competitiveAdvantage: 'Market leader with 70%+ market share. Strongest brand recognition among patients.'
  }
};

/**
 * Generate PDF report with product intelligence support
 */
export async function generatePDFReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData & { deepScanResults?: unknown, scanData?: unknown, actualSearchResults?: unknown, product?: string },
  _options?: PDFExportOptions
): Promise<Blob> {
  // Use enhanced exporter if product intelligence is available
  if (researchData.productIntelligence || researchData.enhancedInsights) {
    const { generateEnhancedPDFReport } = await import('./enhancedPdfExport');
    return generateEnhancedPDFReport(scanResult, researchData, scanResult.product || 'Product');
  }
  
  // Create a comprehensive PDF using jsPDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;
  
  // Get the actual product name
  const productName = researchData.product || scanResult.product || 'Product';
  const productUpper = productName.toUpperCase();
  const productStrategy = PRODUCT_STRATEGIES[productUpper] || null;
  
  // Get actual search results
  const searchResults = (researchData as unknown).actualSearchResults || {};
  const deepScanData = (researchData as unknown).deepScanResults || {};
  
  // Helper function to add text with wrapping
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * (fontSize * 0.4) + 5;
  };
  
  // Helper function to check page break
  const checkPageBreak = (neededSpace: number = 30) => {
    if (yPosition + neededSpace > 280) {
      doc.addPage();
      yPosition = margin;
    }
  };
  
  // Header with branding
  doc.setFillColor(10, 10, 15);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CANVAS INTELLIGENCE BRIEF', margin, 25);
  doc.setTextColor(0, 0, 0);
  yPosition = 50;
  
  // Executive Summary Box
  doc.setFillColor(245, 245, 250);
  doc.rect(margin, yPosition, contentWidth, 70, 'F');
  yPosition += 15;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', margin + 10, yPosition);
  yPosition += 10;
  
  // Key Details from ACTUAL search
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  const doctorName = searchResults.doctor || scanResult.doctor || 'Unknown';
  doc.text(`Doctor: Dr. ${doctorName}`, margin + 10, yPosition);
  yPosition += 8;
  doc.text(`Product: ${productName}`, margin + 10, yPosition);
  yPosition += 8;
  doc.text(`Practice Fit Score: ${searchResults.confidence || scanResult.score || 0}%`, margin + 10, yPosition);
  yPosition += 8;
  
  // Add actual source URL if found
  if (searchResults.source) {
    doc.text(`Source: ${searchResults.source}`, margin + 10, yPosition);
    yPosition += 8;
  }
  yPosition = 130;
  
  // Professional Profile from ACTUAL search results
  checkPageBreak();
  addWrappedText('PROFESSIONAL PROFILE', 14, true);
  yPosition += 5;
  
  // Use actual search summary
  if (searchResults.summary) {
    addWrappedText(searchResults.summary, 11);
  } else if (scanResult.doctorProfile) {
    addWrappedText(scanResult.doctorProfile as string, 11);
  } else {
    addWrappedText(`Dr. ${doctorName} - Professional profile pending detailed analysis.`, 11);
  }
  
  // Add actual key points from search
  if (searchResults.keyPoints && Array.isArray(searchResults.keyPoints) && searchResults.keyPoints.length > 0) {
    yPosition += 5;
    searchResults.keyPoints.forEach((point: string) => {
      // Remove emoji characters using simpler regex
      const cleanPoint = point.replace(/[\u2600-\u27BF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDDFF]/g, '').trim();
      if (cleanPoint) {
        doc.setFontSize(11);
        doc.text('• ' + cleanPoint, margin, yPosition);
        yPosition += 8;
      }
    });
  }
  yPosition += 10;
  
  // PRODUCT-SPECIFIC Intelligence Section
  checkPageBreak();
  addWrappedText(`${productUpper} OPPORTUNITY ANALYSIS`, 14, true);
  yPosition += 5;
  
  if (productStrategy) {
    // Product Category
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Product Category: ${productStrategy.category}`, margin, yPosition);
    yPosition += 10;
    
    // Key Benefits for THIS product
    doc.setFont('helvetica', 'normal');
    doc.text(`${productUpper} Key Benefits:`, margin, yPosition);
    yPosition += 8;
    productStrategy.keyBenefits.forEach((benefit: string) => {
      doc.setFontSize(11);
      doc.text('• ' + benefit, margin + 10, yPosition);
      yPosition += 8;
    });
    yPosition += 5;
    
    // Target Specialties
    if (productStrategy.targetSpecialties.length > 0) {
      doc.setFontSize(12);
      doc.text(`Ideal for: ${productStrategy.targetSpecialties.join(', ')}`, margin, yPosition);
      yPosition += 10;
    }
  } else {
    // Generic product analysis for unknown products
    addWrappedText(`${productName} represents an opportunity to enhance practice capabilities and patient outcomes. Detailed product intelligence analysis recommended.`, 11);
  }
  yPosition += 10;
  
  // PRODUCT-SPECIFIC Sales Strategy
  checkPageBreak();
  addWrappedText(`${productUpper} SALES STRATEGY`, 14, true);
  yPosition += 5;
  
  if (productStrategy) {
    addWrappedText(productStrategy.salesApproach, 11);
    yPosition += 10;
    
    // Objection Handling for THIS product
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Common Objections & Responses:', margin, yPosition);
    yPosition += 8;
    
    Object.entries(productStrategy.objectionHandling).forEach(([objection, response]) => {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`"${objection}": `, margin, yPosition);
      doc.setFont('helvetica', 'normal');
      const responseLines = doc.splitTextToSize(response as string, contentWidth - 20);
      doc.text(responseLines, margin + 10, yPosition + 8);
      yPosition += 8 + (responseLines.length * 5) + 5;
    });
    
    // Competitive Advantage
    yPosition += 5;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Competitive Advantage:', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const compLines = doc.splitTextToSize(productStrategy.competitiveAdvantage, contentWidth);
    doc.text(compLines, margin, yPosition);
    yPosition += compLines.length * 5 + 10;
  } else {
    addWrappedText(`Develop a customized approach highlighting ${productName}'s unique value proposition and alignment with practice goals.`, 11);
  }
  
  // Contact Information (if available from search)
  if (deepScanData.basic?.source || deepScanData.enhanced?.source) {
    checkPageBreak();
    addWrappedText('CONTACT INTELLIGENCE', 14, true);
    yPosition += 5;
    
    doc.setFontSize(11);
    if (deepScanData.basic?.source) {
      doc.text(`Website: ${deepScanData.basic.source}`, margin, yPosition);
      yPosition += 8;
    }
    // Extract any social media or contact info from keyPoints
    const allKeyPoints = [...(deepScanData.basic?.keyPoints || []), ...(deepScanData.enhanced?.keyPoints || [])];
    allKeyPoints.forEach((point: string) => {
      if (point.includes('Instagram') || point.includes('@')) {
        doc.text(`Social: ${point}`, margin, yPosition);
        yPosition += 8;
      }
    });
    yPosition += 10;
  }
  
  // Next Steps - PRODUCT SPECIFIC
  checkPageBreak();
  addWrappedText(`${productUpper} IMPLEMENTATION ROADMAP`, 14, true);
  yPosition += 5;
  
  const nextSteps = productStrategy ? [
    `1. Initial ${productName} consultation - assess specific practice needs`,
    `2. ${productStrategy.category} ROI analysis based on current patient volume`,
    `3. Schedule ${productName} demonstration with clinical team`,
    `4. Review ${productName} training and support programs`,
    `5. Develop custom implementation timeline for ${productName} integration`
  ] : [
    `1. Initial outreach to discuss ${productName} opportunity`,
    `2. Needs assessment for ${productName} implementation`,
    `3. Custom ROI analysis for ${productName}`,
    `4. Product demonstration and evaluation`,
    `5. Implementation planning and support`
  ];
  
  nextSteps.forEach(step => {
    checkPageBreak(15);
    doc.setFontSize(11);
    doc.text(step, margin, yPosition);
    yPosition += 8;
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated by Canvas Intelligence Platform | ${new Date().toLocaleString()}`, margin, 280);
  doc.text(`Confidential - ${productName} Opportunity Analysis`, pageWidth - margin - 80, 280);
  
  // Convert to blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}