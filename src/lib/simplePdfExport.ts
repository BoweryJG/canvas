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
  
  // Create a proper PDF using jsPDF
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Canvas Intelligence Brief', 20, 20);
  
  // Add a line separator
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);
  
  // Doctor and Product info
  doc.setFontSize(14);
  doc.text(`Doctor: ${scanResult.doctor || 'Unknown'}`, 20, 40);
  doc.text(`Product: ${scanResult.product || 'Not specified'}`, 20, 50);
  doc.text(`Practice Fit Score: ${scanResult.score || 0}%`, 20, 60);
  
  // Executive Summary
  doc.setFontSize(16);
  doc.text('Executive Summary', 20, 80);
  doc.setFontSize(12);
  const summaryText = scanResult.salesBrief || 'No summary available';
  const summaryLines = doc.splitTextToSize(summaryText, 170);
  doc.text(summaryLines, 20, 90);
  
  // Key Insights
  const yPosition = 90 + (summaryLines.length * 5) + 10;
  doc.setFontSize(16);
  doc.text('Key Insights', 20, yPosition);
  doc.setFontSize(12);
  
  let currentY = yPosition + 10;
  if (scanResult.insights && scanResult.insights.length > 0) {
    scanResult.insights.forEach((insight) => {
      if (currentY > 270) {
        doc.addPage();
        currentY = 20;
      }
      const insightLines = doc.splitTextToSize(`• ${insight}`, 170);
      doc.text(insightLines, 20, currentY);
      currentY += insightLines.length * 5 + 5;
    });
  } else {
    doc.text('No insights available', 20, currentY);
  }
  
  // Footer
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 280);
  
  // Convert to blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}