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

/**
 * Generate PDF report with product intelligence support
 */
export async function generatePDFReport(
  scanResult: EnhancedScanResult,
  researchData: ResearchData,
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
  doc.rect(margin, yPosition, contentWidth, 60, 'F');
  yPosition += 15;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('EXECUTIVE SUMMARY', margin + 10, yPosition);
  yPosition += 10;
  
  // Key Details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Doctor: Dr. ${scanResult.doctor || 'Unknown'}`, margin + 10, yPosition);
  yPosition += 8;
  doc.text(`Product: ${scanResult.product || 'Not specified'}`, margin + 10, yPosition);
  yPosition += 8;
  doc.text(`Practice Fit Score: ${scanResult.score || 0}%`, margin + 10, yPosition);
  yPosition += 8;
  doc.text(`Research Quality: ${scanResult.researchQuality || 'Preliminary'}`, margin + 10, yPosition);
  yPosition = 120;
  
  // Professional Summary
  checkPageBreak();
  addWrappedText('PROFESSIONAL PROFILE', 14, true);
  yPosition += 5;
  
  if (scanResult.doctorProfile) {
    addWrappedText(scanResult.doctorProfile, 11);
  } else {
    addWrappedText('Dr. ' + (scanResult.doctor || 'Unknown') + ' is a healthcare professional with established practice presence. Further intelligence gathering recommended for comprehensive profile development.', 11);
  }
  yPosition += 10;
  
  // Product Intelligence
  checkPageBreak();
  addWrappedText('PRODUCT INTELLIGENCE: ' + (scanResult.product || 'Product').toUpperCase(), 14, true);
  yPosition += 5;
  
  if (scanResult.productIntel) {
    addWrappedText(scanResult.productIntel, 11);
  } else {
    addWrappedText(`${scanResult.product || 'This product'} represents a significant opportunity in the medical technology space. Market analysis indicates strong potential for adoption among forward-thinking practitioners.`, 11);
  }
  yPosition += 10;
  
  // Sales Strategy
  checkPageBreak();
  addWrappedText('STRATEGIC SALES APPROACH', 14, true);
  yPosition += 5;
  
  if (scanResult.salesBrief) {
    addWrappedText(scanResult.salesBrief, 11);
  } else {
    addWrappedText('Recommended approach: Lead with value proposition focusing on practice efficiency and patient outcomes. Emphasize ROI and competitive advantages. Schedule initial consultation to assess specific practice needs.', 11);
  }
  yPosition += 10;
  
  // Key Insights
  checkPageBreak();
  addWrappedText('KEY INSIGHTS & OPPORTUNITIES', 14, true);
  yPosition += 5;
  
  if (scanResult.insights && scanResult.insights.length > 0) {
    scanResult.insights.forEach((insight) => {
      checkPageBreak(20);
      // Remove emojis and clean up the text
      const cleanInsight = insight.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
      doc.setFontSize(11);
      doc.text('• ', margin, yPosition);
      const bulletLines = doc.splitTextToSize(cleanInsight, contentWidth - 10);
      doc.text(bulletLines, margin + 10, yPosition);
      yPosition += bulletLines.length * 5 + 5;
    });
  } else {
    const defaultInsights = [
      'Practice shows indicators of technology adoption readiness',
      'Geographic location presents favorable market conditions',
      'Professional network suggests influence within specialty community',
      'Timing aligns with industry trends toward modernization'
    ];
    defaultInsights.forEach(insight => {
      doc.setFontSize(11);
      doc.text('• ' + insight, margin, yPosition);
      yPosition += 8;
    });
  }
  yPosition += 10;
  
  // Practice Information (if available)
  if (researchData?.practiceInfo) {
    checkPageBreak();
    addWrappedText('PRACTICE INTELLIGENCE', 14, true);
    yPosition += 5;
    
    const practiceInfo = researchData.practiceInfo;
    if (practiceInfo.name) {
      doc.setFontSize(11);
      doc.text(`Practice: ${practiceInfo.name}`, margin, yPosition);
      yPosition += 8;
    }
    if (practiceInfo.address) {
      doc.text(`Location: ${practiceInfo.address}`, margin, yPosition);
      yPosition += 8;
    }
    if (practiceInfo.specialties && practiceInfo.specialties.length > 0) {
      doc.text(`Specialties: ${practiceInfo.specialties.join(', ')}`, margin, yPosition);
      yPosition += 8;
    }
    yPosition += 10;
  }
  
  // Next Steps
  checkPageBreak();
  addWrappedText('RECOMMENDED NEXT STEPS', 14, true);
  yPosition += 5;
  
  const nextSteps = [
    '1. Initial outreach via preferred communication channel',
    '2. Schedule discovery call to assess specific practice needs',
    '3. Prepare customized ROI analysis based on practice volume',
    '4. Coordinate product demonstration with key stakeholders',
    '5. Develop implementation timeline aligned with practice goals'
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
  doc.text(`Confidential - For Internal Use Only`, pageWidth - margin - 80, 280);
  
  // Convert to blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}