// @ts-nocheck
/**
 * Professional Report Generator
 * Creates visually stunning PDF reports with charts and branding
 */

import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { EnhancedScanResult } from './enhancedAI';
import type { ResearchData } from './webResearch';
import type { ProductIntelligence } from './productProcedureIntelligence';

// Register professional fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2' },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiA.woff2', fontWeight: 700 }
  ]
});

// Professional color palette
const colors = {
  primary: '#00ffc6',
  secondary: '#7B42F6',
  dark: '#0a0a0a',
  gray: '#666',
  lightGray: '#999',
  white: '#fff',
  success: '#10b981',
  warning: '#fbbf24',
  danger: '#ef4444'
};

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: colors.white,
    padding: 40,
    fontFamily: 'Inter'
  },
  header: {
    marginBottom: 30,
    borderBottom: `2px solid ${colors.primary}`,
    paddingBottom: 20
  },
  logo: {
    width: 150,
    height: 40,
    marginBottom: 10
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 5
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 10
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 10,
    color: colors.lightGray
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 10,
    borderLeft: `4px solid ${colors.primary}`,
    paddingLeft: 10
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.dark,
    marginBottom: 8,
    marginTop: 10
  },
  text: {
    fontSize: 11,
    color: colors.dark,
    lineHeight: 1.6,
    marginBottom: 5
  },
  bulletPoint: {
    fontSize: 11,
    color: colors.dark,
    marginLeft: 20,
    marginBottom: 4
  },
  scoreBox: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center'
  },
  scoreText: {
    fontSize: 36,
    fontWeight: 700,
    color: colors.dark
  },
  scoreLabel: {
    fontSize: 12,
    color: colors.dark,
    marginTop: 5
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  infoBox: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 6
  },
  infoLabel: {
    fontSize: 10,
    color: colors.gray,
    marginBottom: 3
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.dark
  },
  chart: {
    width: '100%',
    height: 200,
    marginVertical: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: `1px solid ${colors.lightGray}`,
    paddingTop: 10,
    fontSize: 9,
    color: colors.lightGray,
    textAlign: 'center'
  },
  highlight: {
    backgroundColor: colors.primary,
    color: colors.dark,
    padding: '2 6',
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700
  }
});

/**
 * Generate McKinsey-Style Executive Report
 */
export const McKinseyExecutiveReport = ({
  scanResult,
  researchData,
  salesRepName,
  companyName,
  productName
}: {
  scanResult: EnhancedScanResult;
  researchData: ResearchData;
  salesRepName: string;
  companyName: string;
  productName: string;
}) => {
  const insights = researchData.enhancedInsights as unknown;
  const productIntel = researchData.productIntelligence as unknown as ProductIntelligence;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Executive Intelligence Brief</Text>
          <Text style={styles.subtitle}>{scanResult.doctor} - {productName} Opportunity Analysis</Text>
          <View style={styles.metadata}>
            <Text>Prepared for: {salesRepName}</Text>
            <Text>{companyName}</Text>
            <Text>{new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Opportunity Score */}
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>{scanResult.score}%</Text>
          <Text style={styles.scoreLabel}>OPPORTUNITY MATCH SCORE</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>
            {insights?.executiveSummary || 
             `Analysis indicates strong alignment between ${scanResult.doctor}'s practice needs and ${productName} capabilities. 
              The practice demonstrates ${scanResult.researchQuality} research quality with ${researchData.sources?.length || 0} verified sources.`}
          </Text>
        </View>

        {/* Practice Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Practice Intelligence</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>SPECIALTY</Text>
              <Text style={styles.infoValue}>{insights?.specialty || 'Healthcare'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>LOCATION</Text>
              <Text style={styles.infoValue}>{researchData.practiceInfo?.address || 'Not specified'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>PRACTICE SIZE</Text>
              <Text style={styles.infoValue}>{insights?.practiceProfile?.size || 'Unknown'}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>TECHNOLOGY LEVEL</Text>
              <Text style={styles.infoValue}>{insights?.technologyStack?.level || 'Traditional'}</Text>
            </View>
          </View>
        </View>

        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Strategic Insights</Text>
          {insights?.keyInsights?.map((insight: string, idx: number) => (
            <Text key={idx} style={styles.bulletPoint}>• {insight}</Text>
          )) || <Text style={styles.text}>No specific insights available</Text>}
        </View>

        {/* Product Fit Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{productName} Fit Analysis</Text>
          
          <Text style={styles.subsectionTitle}>Pain Points Addressed</Text>
          {insights?.painPoints?.map((pain: string, idx: number) => (
            <Text key={idx} style={styles.bulletPoint}>• {pain}</Text>
          )) || <Text style={styles.text}>General efficiency improvements</Text>}
          
          <Text style={styles.subsectionTitle}>Expected ROI</Text>
          <Text style={styles.text}>
            {productIntel?.marketData?.roi 
              ? `${productIntel.marketData.roi.min}x - ${productIntel.marketData.roi.max}x return within 12 months`
              : 'Typical ROI of 3-5x based on similar implementations'}
          </Text>
        </View>

        {/* Competitive Intelligence */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Competitive Landscape</Text>
          <Text style={styles.text}>
            Current vendors: {insights?.competition?.currentVendors?.join(', ') || 'Unknown'}
          </Text>
          <Text style={styles.text}>
            Market position: {insights?.marketPosition?.ranking || 'Established practice in local market'}
          </Text>
        </View>

        {/* Recommended Approach */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Sales Strategy</Text>
          <Text style={styles.subsectionTitle}>Approach</Text>
          <Text style={styles.text}>
            {insights?.approachStrategy?.keyMessage || 
             `Focus on ${productName}'s ability to streamline workflows and improve patient outcomes.`}
          </Text>
          
          <Text style={styles.subsectionTitle}>Key Decision Maker</Text>
          <Text style={styles.text}>
            {insights?.decisionMakers?.primary || scanResult.doctor}
          </Text>
          
          <Text style={styles.subsectionTitle}>Timing</Text>
          <Text style={styles.text}>
            {insights?.approachStrategy?.bestTiming || 'Schedule for mid-morning or early afternoon'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Confidential - {companyName} Sales Intelligence</Text>
        </View>
      </Page>
    </Document>
  );
};