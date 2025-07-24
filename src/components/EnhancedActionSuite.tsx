import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type EnhancedScanResult } from '../lib/enhancedAI';
import { type ResearchData } from '../lib/webResearch';
import { 
  generatePersonalizedOutreach, 
  createCampaignSequence, 
  sendSMS,
  type PersonalizedOutreach,
  type OutreachCampaign
} from '../lib/outreachSystem';
import { generatePDFReport } from '../lib/simplePdfExport';
import { generateDeepResearchReport } from '../lib/deepResearchReport';
import { createCRMIntegration, type CRMConfig } from '../lib/crmIntegration';
import { 
  generateMcKinseyExecutiveReport,
  generateInitialOutreachReport,
  generateFollowUpReport,
  generateBreakthroughReport,
  generateClosingReport
} from '../lib/salesRepReports';
import CRMIntegrationPanel from './CRMIntegrationPanel';
import BatchAnalysisPanel from './BatchAnalysisPanel';
import { MultiChannelMagicLink } from './MultiChannelMagicLink';
import { generateEmailFromScanResult } from '../lib/emailTemplates';
import { generateEnhancedSMS, generateEnhancedWhatsApp, generateEnhancedLinkedIn } from '../lib/enhancedEmailTemplates';
import { type EmailCampaign } from '../lib/magicLinks';
import { generateMultiChannelCampaign } from '../lib/aiContentGeneration';
import { SubscriptionModal } from './SubscriptionModal';
import { SEOReportModal } from './SEOReportModal';
import { useAuth } from '../auth/hooks';
import { findProcedureByName } from '../lib/procedureDatabase';
import { type InstantIntelligence } from '../lib/instantIntelligence';
import ShareIntelligenceModal from './ShareIntelligenceModal';
import { type SubscriptionTier } from '../types/magicLink';
import MetallicScrew from './PremiumComponents/MetallicScrew';

interface EnhancedActionSuiteProps {
  scanResult: EnhancedScanResult | Record<string, unknown>;
  researchData?: ResearchData;
  instantIntel?: InstantIntelligence;
  deepScanResults?: Record<string, unknown>;
  scanData?: Record<string, unknown>;
}

/**
 * Generate dynamic report name based on product
 */
function generateDynamicReportName(productName: string, doctorName: string): string {
  const safeDoctorName = String((typeof doctorName === 'object' && doctorName && 'name' in doctorName ? (doctorName as { name: string }).name : doctorName) || 'Unknown Doctor');
  const cleanDoctorName = safeDoctorName.replace(/^Dr\.?\s*/i, '');
  return `${productName} Impact Report for Dr. ${cleanDoctorName}`;
}

interface OutreachState {
  loading: boolean;
  content?: PersonalizedOutreach;
  campaign?: OutreachCampaign;
  sent: boolean;
  error?: string;
}

const EnhancedActionSuite: React.FC<EnhancedActionSuiteProps> = ({ 
  scanResult, 
  researchData,
  instantIntel,
  deepScanResults,
  scanData
}) => {
  const [activeTab, setActiveTab] = useState<'outreach' | 'reports' | 'analytics' | 'crm' | 'batch'>('outreach');
  const [emailState] = useState<OutreachState>({ loading: false, sent: false });
  const [smsState, setSmsState] = useState<OutreachState>({ loading: false, sent: false });
  const [campaignState, setCampaignState] = useState<OutreachState>({ loading: false, sent: false });
  const [pdfState, setPdfState] = useState<{ loading: boolean; error?: string }>({ loading: false });
  const [deepReportState, setDeepReportState] = useState<{ loading: boolean; error?: string }>({ loading: false });
  const [salesReportState, setSalesReportState] = useState<{ loading: boolean; error?: string; type?: string }>({ loading: false });
  const [crmConfigs, setCrmConfigs] = useState<CRMConfig[]>([]);
  const [crmSyncState, setCrmSyncState] = useState<{ loading: boolean; error?: string; success?: boolean }>({ loading: false });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBatchAnalysis, setShowBatchAnalysis] = useState(false);
  const [magicLinkCampaign, setMagicLinkCampaign] = useState<EmailCampaign | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [showSEOReport, setShowSEOReport] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { user } = useAuth();
  
  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    preferredName: typeof scanResult.doctor === 'string' ? scanResult.doctor : scanResult.doctor?.name || 'Unknown Doctor'
  });
  
  // Sales rep information
  const [salesRepInfo, setSalesRepInfo] = useState({
    name: 'Sales Representative',
    company: 'Your Company',
    product: 'Your Product'
  });

  
  // Determine user tier (you would get this from user subscription data)
  const getUserTier = (): SubscriptionTier => {
    // TODO: Get actual tier from user subscription
    // For now, default to 'free' if no user, 'starter' if logged in
    if (!user) return 'free';
    // In production, check user.subscription_tier or similar
    return 'starter'; // Default for logged in users
  };

  /**
   * Generate personalized SMS
   */
  const handleGenerateSMS = useCallback(async () => {
    // If instant intelligence is available, use it directly
    if (instantIntel) {
      setSmsState({ 
        loading: false, 
        sent: false, 
        content: {
          subject: '',
          content: instantIntel.outreachTemplates.sms,
          personalizations: [typeof scanResult.doctor === 'string' ? scanResult.doctor : scanResult.doctor?.name || 'Unknown Doctor'],
          researchInsights: [],
          urgencyScore: 8,
          expectedResponse: 'Quick response'
        }
      });
      return;
    }
    
    if (!researchData) return;
    
    setSmsState({ loading: true, sent: false });
    
    try {
      const outreach = await generatePersonalizedOutreach(
        scanResult,
        researchData,
        'first_contact',
        'sms'
      );
      
      setSmsState({ 
        loading: false, 
        sent: false, 
        content: outreach 
      });
      
    } catch (error) {
      setSmsState({ 
        loading: false, 
        sent: false, 
        error: error instanceof Error ? error.message : 'Failed to generate SMS' 
      });
    }
  }, [scanResult, researchData, instantIntel]);

  /**
   * Send SMS
   */
  const handleSendSMS = useCallback(async () => {
    if (!smsState.content || !contactInfo.phone) return;
    
    setSmsState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await sendSMS(
        contactInfo.phone,
        smsState.content.content
      );
      
      if (result.success) {
        setSmsState(prev => ({ 
          ...prev, 
          loading: false, 
          sent: true 
        }));
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      setSmsState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to send SMS' 
      }));
    }
  }, [smsState.content, contactInfo.phone]);

  /**
   * Create multi-touch campaign
   */
  const handleCreateCampaign = useCallback(async () => {
    if (!researchData && !instantIntel) return;
    
    setCampaignState({ loading: true, sent: false });
    
    try {
      // If we have instant intelligence, create a simplified campaign using that data
      if (instantIntel && !researchData) {
        const simplifiedCampaign: OutreachCampaign = {
          id: `instant-campaign-${Date.now()}`,
          doctorName: scanResult.doctor,
          productName: scanResult.product,
          templates: [],
          sequence: [
            {
              id: 'day-1-email',
              day: 1,
              type: 'email',
              time: '9:00 AM',
              templateId: 'instant-email'
            },
            {
              id: 'day-3-sms',
              day: 3,
              type: 'sms',
              time: '2:00 PM',
              templateId: 'instant-sms'
            },
            {
              id: 'day-5-linkedin',
              day: 5,
              type: 'linkedin',
              time: '11:00 AM',
              templateId: 'instant-linkedin'
            }
          ],
          analytics: {
            sent: 0,
            opened: 0,
            clicked: 0,
            replied: 0,
            meetings: 0,
            revenue: 0
          },
          status: 'draft'
        };
        
        setCampaignState({ 
          loading: false, 
          sent: false, 
          campaign: simplifiedCampaign 
        });
        return;
      }
      
      const campaign = await createCampaignSequence(
        scanResult,
        researchData!,
        scanResult.score > 80 ? 'aggressive' : 'professional'
      );
      
      setCampaignState({ 
        loading: false, 
        sent: false, 
        campaign 
      });
      
    } catch (error) {
      setCampaignState({ 
        loading: false, 
        sent: false, 
        error: error instanceof Error ? error.message : 'Failed to create campaign' 
      });
    }
  }, [scanResult, researchData, instantIntel]);

  /**
   * Export PDF report
   */
  const handleExportPDF = useCallback(async () => {
    setPdfState({ loading: true });
    
    try {
      console.log('Generating comprehensive PDF intelligence brief...');
      
      // Get unified and scraped data for fallback
      const unifiedFallbackData = deepScanResults?.unified;
      const scrapedFallbackData = unifiedFallbackData?.scrapedWebsiteData;
      
      // Create intelligent fallback research data using all available data sources
      const fallbackResearchData = researchData || {
        doctorName: scanResult.doctor || 
                    scanData?.doctor || 
                    deepScanResults?.doctorName || 
                    'Healthcare Professional',
        practiceInfo: {
          name: scanData?.practiceInfo?.name ||
                deepScanResults?.practiceInfo?.name ||
                `${scanResult.doctor || 'Healthcare Professional'} Medical Practice`,
          address: scanData?.location ||
                   scanResult.location ||
                   deepScanResults?.address ||
                   'Practice Location',
          phone: scanData?.phone ||
                 'Contact Information',
          website: scanData?.website ||
                   deepScanResults?.website ||
                   'Practice Website',
          specialties: scanData?.specialties ||
                       (scanResult.specialty ? [scanResult.specialty] : ['Medical Practice']),
          services: scanData?.services ||
                    deepScanResults?.services ||
                    ['Healthcare Services'],
          technology: scanData?.technology ||
                      deepScanResults?.technology ||
                      [],
          staff: scanData?.staff ||
                 deepScanResults?.staffCount ||
                 5,
          established: scanData?.established ||
                       '2020'
        },
        credentials: {
          medicalSchool: scanData?.medicalSchool ||
                         'Medical School',
          residency: scanData?.residency ||
                     'Residency Training',
          boardCertifications: scanData?.certifications ||
                               ['Board Certified'],
          yearsExperience: scanData?.experience ||
                           10,
          hospitalAffiliations: scanData?.affiliations ||
                                ['Hospital Affiliation']
        },
        reviews: scanData?.reviews ||
                 deepScanResults?.reviews || {
                   averageRating: scanResult.score ? scanResult.score / 20 : 4.0,
                   totalReviews: 0,
                   commonPraise: [],
                   commonConcerns: [],
                   recentFeedback: []
                 },
        businessIntel: scanData?.businessIntel ||
                       deepScanResults?.businessIntel || {
                         practiceType: scrapedFallbackData?.practiceInfo?.practiceType || 
                                       scanData?.practiceType || 
                                       'Medical Practice',
                         patientVolume: scanData?.patientVolume || 'Not Available',
                         marketPosition: scanData?.marketPosition || 'Not Available',
                         recentNews: scrapedFallbackData?.recentNews || [],
                         growthIndicators: scrapedFallbackData?.competitiveAdvantages || 
                                           scanData?.growthIndicators || 
                                           [],
                         technologyStack: unifiedFallbackData?.intelligence?.practiceInfo?.technologies || 
                                          scrapedFallbackData?.practiceInfo?.technologies || 
                                          scanData?.technology || 
                                          deepScanResults?.technology || 
                                          [],
                         specialty: scanResult.specialty || 
                                    'Healthcare'
                       },
        sources: scanData?.sources ||
                 deepScanResults?.sources ||
                 [],
        confidenceScore: scanData?.confidenceScore ||
                         instantIntel?.confidenceScore ||
                         deepScanResults?.confidenceScore ||
                         (scanResult.score || 0),
        completedAt: scanData?.completedAt ||
                     deepScanResults?.completedAt ||
                     new Date().toISOString()
      };
      
      // Pass the REAL data to the PDF generator
      const realResearchData = {
        ...fallbackResearchData,
        deepScanResults: deepScanResults,
        scanData: scanData,
        actualSearchResults: deepScanResults?.basic || deepScanResults?.enhanced || {},
        product: scanData?.product || scanResult.product
      };
      
      const pdfBlob = await generatePDFReport(scanResult, realResearchData, {
        includeLogo: true,
        includeResearch: true,
        includeOutreach: true,
        includeStrategy: true,
        format: 'detailed',
        branding: 'canvas'
      });
      
      console.log('PDF Blob created:', pdfBlob);
      console.log('PDF Blob size:', pdfBlob.size);
      console.log('PDF Blob type:', pdfBlob.type);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF generation failed - empty blob');
      }
      
      // Force download instead of opening blob URL
      try {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Safer filename generation
        const doctorName = String(((scanResult.doctor as { name?: string })?.name || scanResult.doctor) || 'Unknown-Doctor').replace(/[^a-zA-Z0-9]/g, '-');
        const filename = `canvas-intelligence-${doctorName}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.download = filename;
        
        console.log('Download link created:', link.href);
        console.log('Download filename:', filename);
        
        // Set additional attributes for better compatibility
        link.style.display = 'none';
        link.target = '_blank';
        
        document.body.appendChild(link);
        
        // Add a small delay to ensure the link is in the DOM
        setTimeout(() => {
          try {
            link.click();
            console.log('Download link clicked');
            
            setTimeout(() => {
              try {
                if (document.body.contains(link)) {
                  document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
                console.log('Download cleanup completed');
              } catch (cleanupError) {
                console.error('Download cleanup error:', cleanupError);
              }
            }, 100);
          } catch (clickError) {
            console.error('Download click error:', clickError);
            // Fallback: try direct download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
          }
        }, 10);
      } catch (downloadError) {
        console.error('Download setup error:', downloadError);
        throw new Error('Failed to setup download mechanism');
      }
      
      setPdfState({ loading: false });
      console.log('✅ PDF intelligence brief generated successfully');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate PDF' 
      });
    }
  }, [scanResult, researchData, deepScanResults, instantIntel?.confidenceScore, scanData]);

  /**
   * Generate Deep Research Report (20+ pages)
   */
  const handleGenerateDeepReport = useCallback(async () => {
    setDeepReportState({ loading: true });
    
    try {
      console.log('Generating comprehensive 20+ page deep research report...');
      
      // DEBUG: Log available data sources
      console.log('🔍 DEBUGGING DATA SOURCES:');
      console.log('scanResult:', scanResult);
      console.log('researchData:', researchData);
      console.log('instantIntel:', instantIntel);
      console.log('scanResult.specialty:', scanResult.specialty);
      console.log('scanResult.location:', scanResult.location);
      
      // Get unified and scraped data for fallback
      const unifiedFallbackData = deepScanResults?.unified;
      const scrapedFallbackData = unifiedFallbackData?.scrapedWebsiteData;
      
      // If we have real data, use it intelligently instead of fallback
      const intelligentResearchData = researchData || {
        doctorName: scanResult.doctor || 'Healthcare Professional',
        practiceInfo: {
          name: `${scanResult.doctor || 'Healthcare Professional'} Medical Practice`,
          address: 'Practice Location',
          phone: 'Contact Information',
          website: 'Practice Website',
          specialties: ['Medical Practice'],
          services: ['Healthcare Services'],
          technology: [],
          staff: 5,
          established: '2020'
        },
        credentials: {
          medicalSchool: 'Medical School',
          residency: 'Residency Training',
          boardCertifications: ['Board Certified'],
          yearsExperience: 10,
          hospitalAffiliations: ['Hospital Affiliation']
        },
        reviews: scanData?.reviews ||
                 deepScanResults?.reviews || {
                   averageRating: scanResult.score ? scanResult.score / 20 : 4.0,
                   totalReviews: 0,
                   commonPraise: [],
                   commonConcerns: [],
                   recentFeedback: []
                 },
        businessIntel: scanData?.businessIntel ||
                       deepScanResults?.businessIntel || {
                         practiceType: scrapedFallbackData?.practiceInfo?.practiceType || 
                                       scanData?.practiceType || 
                                       'Medical Practice',
                         patientVolume: scanData?.patientVolume || 'Not Available',
                         marketPosition: scanData?.marketPosition || 'Not Available',
                         recentNews: scrapedFallbackData?.recentNews || [],
                         growthIndicators: scrapedFallbackData?.competitiveAdvantages || 
                                           scanData?.growthIndicators || 
                                           [],
                         technologyStack: unifiedFallbackData?.intelligence?.practiceInfo?.technologies || 
                                          scrapedFallbackData?.practiceInfo?.technologies || 
                                          scanData?.technology || 
                                          deepScanResults?.technology || 
                                          [],
                         specialty: scanResult.specialty || 
                                    'Healthcare'
                       },
        sources: scanData?.sources ||
                 deepScanResults?.sources ||
                 [],
        confidenceScore: scanData?.confidenceScore ||
                         instantIntel?.confidenceScore ||
                         deepScanResults?.confidenceScore ||
                         (scanResult.score || 0),
        completedAt: scanData?.completedAt ||
                     deepScanResults?.completedAt ||
                     new Date().toISOString()
      };
      
      console.log('📊 FINAL DATA BEING SENT TO REPORT:', intelligentResearchData);
      
      const pdfBlob = await generateDeepResearchReport(scanResult, intelligentResearchData, {
        includeMarketAnalysis: true,
        includeCompetitorProfiles: true,
        includeIndustryTrends: true,
        includeRegulatoryInsights: true,
        includeFinancialProjections: true,
        includeDetailedPersona: true,
        format: 'comprehensive'
      });
      
      console.log('Deep Research PDF Blob created:', pdfBlob);
      console.log('Deep Research PDF Blob size:', pdfBlob.size);
      console.log('Deep Research PDF Blob type:', pdfBlob.type);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Deep research PDF generation failed - empty blob');
      }
      
      // Force download instead of opening blob URL
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `deep-research-${String(((scanResult.doctor as { name?: string })?.name || scanResult.doctor) || 'Unknown-Doctor').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      link.download = filename;
      
      console.log('Deep Research download link created:', link.href);
      console.log('Deep Research download filename:', filename);
      
      document.body.appendChild(link);
      
      // Add a small delay to ensure the link is in the DOM
      setTimeout(() => {
        link.click();
        console.log('Deep Research download link clicked');
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('Deep Research download cleanup completed');
        }, 100);
      }, 10);
      
      setDeepReportState({ loading: false });
      console.log('✅ Deep research report generated successfully');
      
    } catch (error) {
      console.error('Deep research report generation error:', error);
      setDeepReportState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate deep research report' 
      });
    }
  }, [scanResult, researchData, deepScanResults?.businessIntel, deepScanResults?.completedAt, deepScanResults?.confidenceScore, deepScanResults?.reviews, deepScanResults?.sources, deepScanResults?.technology, deepScanResults?.unified, instantIntel, scanData?.businessIntel, scanData?.completedAt, scanData?.confidenceScore, scanData?.growthIndicators, scanData?.marketPosition, scanData?.patientVolume, scanData?.practiceType, scanData?.reviews, scanData?.sources, scanData?.technology]);

  /**
   * Generate Sales Rep Reports
   */
  const handleGenerateSalesReport = useCallback(async (reportType: 'mckinsey_executive' | 'initial_outreach' | 'follow_up' | 'breakthrough' | 'closing') => {
    // Add null safety checks for salesRepInfo
    if (!salesRepInfo || !salesRepInfo.name) {
      console.error('Sales rep information is not properly initialized');
      setSalesReportState({
        loading: false,
        error: 'Sales rep information is missing. Please refresh the page and try again.'
      });
      return;
    }
    
    setSalesReportState({ loading: true, type: reportType });
    
    try {
      console.log(`Generating ${reportType} sales rep report...`);
      
      // DEBUG: Log available data sources for sales report
      console.log('🔍 DEBUGGING SALES REPORT DATA SOURCES:');
      console.log('scanResult:', scanResult);
      console.log('researchData:', researchData);
      console.log('instantIntel:', instantIntel);
      console.log('salesRepInfo:', salesRepInfo);
      
      // Use unified intelligence data if available for non-generic reports
      const unifiedData = deepScanResults?.unified;
      const scrapedData = unifiedData?.scrapedWebsiteData;
      
      // Create intelligent research data using actual scraped data
      const intelligentSalesResearchData = researchData || {
        doctorName: scanResult.doctor || 'Healthcare Professional',
        practiceInfo: {
          name: unifiedData?.intelligence?.practiceInfo?.name || 
                scrapedData?.title ||
                `${scanResult.doctor || 'Healthcare Professional'} Medical Practice`,
          address: unifiedData?.discovery?.address?.full || 
                   scanData?.location || 
                   'Practice Location',
          phone: scanData?.phone || 'Contact Information',
          website: unifiedData?.discovery?.practiceWebsite || 
                   scrapedData?.url || 
                   'Practice Website',
          specialties: unifiedData?.intelligence?.practiceInfo?.services || 
                       scanData?.specialties || 
                       ['Medical Practice'],
          services: unifiedData?.intelligence?.practiceInfo?.services || 
                    scrapedData?.practiceInfo?.services || 
                    ['Healthcare Services'],
          technology: unifiedData?.intelligence?.practiceInfo?.technologies || 
                      scrapedData?.practiceInfo?.technologies || 
                      [],
          staff: scrapedData?.practiceInfo?.teamSize || 
                 scanData?.staff || 
                 5,
          established: scanData?.established || '2020'
        },
        credentials: {
          medicalSchool: 'Medical School',
          residency: 'Residency Training',
          boardCertifications: ['Board Certified'],
          yearsExperience: 10,
          hospitalAffiliations: ['Hospital Affiliation']
        },
        reviews: scanData?.reviews ||
                 deepScanResults?.reviews || {
                   averageRating: scanResult.score ? scanResult.score / 20 : 4.0,
                   totalReviews: 0,
                   commonPraise: [],
                   commonConcerns: [],
                   recentFeedback: []
                 },
        businessIntel: scanData?.businessIntel ||
                       deepScanResults?.businessIntel || {
                         practiceType: scrapedData?.practiceInfo?.practiceType || 
                                       scanData?.practiceType || 
                                       'Medical Practice',
                         patientVolume: scanData?.patientVolume || 'Not Available',
                         marketPosition: scanData?.marketPosition || 'Not Available',
                         recentNews: scrapedData?.recentNews || [],
                         growthIndicators: scrapedData?.competitiveAdvantages || 
                                           scanData?.growthIndicators || 
                                           [],
                         technologyStack: unifiedData?.intelligence?.practiceInfo?.technologies || 
                                          scrapedData?.practiceInfo?.technologies || 
                                          scanData?.technology || 
                                          deepScanResults?.technology || 
                                          [],
                         specialty: scanResult.specialty || 
                                    'Healthcare'
                       },
        sources: scanData?.sources ||
                 deepScanResults?.sources ||
                 [],
        confidenceScore: scanData?.confidenceScore ||
                         instantIntel?.confidenceScore ||
                         deepScanResults?.confidenceScore ||
                         (scanResult.score || 0),
        completedAt: scanData?.completedAt ||
                     deepScanResults?.completedAt ||
                     new Date().toISOString()
      };
      
      // Ensure all salesRepInfo properties exist with fallbacks
      const safeSalesRepInfo = {
        name: salesRepInfo.name || 'Sales Representative',
        company: salesRepInfo.company || 'Your Company',
        product: salesRepInfo.product || 'Your Product'
      };
      
      let pdfBlob: Blob;
      
      switch (reportType) {
        case 'mckinsey_executive':
          console.log('📊 SENDING TO MCKINSEY REPORT:', intelligentSalesResearchData);
          pdfBlob = await generateMcKinseyExecutiveReport(
            scanResult,
            intelligentSalesResearchData,
            safeSalesRepInfo.name,
            safeSalesRepInfo.company,
            safeSalesRepInfo.product
          );
          break;
        case 'initial_outreach':
          console.log('📊 SENDING TO INITIAL OUTREACH REPORT:', intelligentSalesResearchData);
          pdfBlob = await generateInitialOutreachReport(
            scanResult,
            intelligentSalesResearchData,
            safeSalesRepInfo.name,
            safeSalesRepInfo.company,
            safeSalesRepInfo.product
          );
          break;
        case 'follow_up':
          console.log('📊 SENDING TO FOLLOW UP REPORT:', intelligentSalesResearchData);
          pdfBlob = await generateFollowUpReport(
            scanResult,
            intelligentSalesResearchData,
            safeSalesRepInfo.name,
            safeSalesRepInfo.company,
            safeSalesRepInfo.product
          );
          break;
        case 'breakthrough':
          console.log('📊 SENDING TO BREAKTHROUGH REPORT:', intelligentSalesResearchData);
          pdfBlob = await generateBreakthroughReport(
            scanResult,
            intelligentSalesResearchData,
            safeSalesRepInfo.name,
            safeSalesRepInfo.company,
            safeSalesRepInfo.product
          );
          break;
        case 'closing':
          console.log('📊 SENDING TO CLOSING REPORT:', intelligentSalesResearchData);
          pdfBlob = await generateClosingReport(
            scanResult,
            intelligentSalesResearchData,
            safeSalesRepInfo.name,
            safeSalesRepInfo.company,
            safeSalesRepInfo.product
          );
          break;
      }
      
      console.log('Sales Report PDF Blob created:', pdfBlob);
      console.log('Sales Report PDF Blob size:', pdfBlob.size);
      console.log('Sales Report PDF Blob type:', pdfBlob.type);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('Sales report PDF generation failed - empty blob');
      }
      
      // Force download instead of opening blob URL
      try {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        
        // Safer filename generation
        const doctorName = String(((scanResult.doctor as { name?: string })?.name || scanResult.doctor) || 'Unknown-Doctor').replace(/[^a-zA-Z0-9]/g, '-');
        const filename = `sales-report-${reportType}-${doctorName}-${new Date().toISOString().split('T')[0]}.pdf`;
        link.download = filename;
        
        console.log('Sales Report download link created:', link.href);
        console.log('Sales Report download filename:', filename);
        
        // Set additional attributes for better compatibility
        link.style.display = 'none';
        link.target = '_blank';
        
        document.body.appendChild(link);
        
        // Add a small delay to ensure the link is in the DOM
        setTimeout(() => {
          try {
            link.click();
            console.log('Sales Report download link clicked');
            
            setTimeout(() => {
              try {
                if (document.body.contains(link)) {
                  document.body.removeChild(link);
                }
                URL.revokeObjectURL(url);
                console.log('Sales Report download cleanup completed');
              } catch (cleanupError) {
                console.error('Sales Report cleanup error:', cleanupError);
              }
            }, 100);
          } catch (clickError) {
            console.error('Sales Report click error:', clickError);
            // Fallback: try direct download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
          }
        }, 10);
      } catch (downloadError) {
        console.error('Sales Report download setup error:', downloadError);
        throw new Error('Failed to setup download mechanism');
      }
      
      setSalesReportState({ loading: false });
      console.log(`✅ ${reportType} sales rep report generated successfully`);
      
    } catch (error) {
      console.error('Sales rep report generation error:', error);
      setSalesReportState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate sales rep report' 
      });
    }
  }, [scanResult, researchData, salesRepInfo]);

  /**
   * Sync to CRM
   */
  const handleSyncToCRM = useCallback(async () => {
    if (!researchData) return;

    const enabledCRMs = crmConfigs.filter(config => config.enabled);
    if (enabledCRMs.length === 0) {
      setCrmSyncState({ loading: false, error: 'No CRM integrations enabled' });
      return;
    }

    setCrmSyncState({ loading: true });

    try {
      console.log('🔄 Syncing to enabled CRM systems...');
      
      const syncPromises = enabledCRMs.map(async (config) => {
        const manager = createCRMIntegration(config);
        return await manager.syncToggCRM(
          scanResult,
          researchData,
          emailState.content // Include outreach data if available
        );
      });

      const results = await Promise.all(syncPromises);
      const failedSyncs = results.filter(r => !r.success);

      if (failedSyncs.length > 0) {
        const errorMessage = `${failedSyncs.length} CRM sync(s) failed: ${failedSyncs.map(f => f.error).join(', ')}`;
        setCrmSyncState({ loading: false, error: errorMessage });
      } else {
        setCrmSyncState({ loading: false, success: true });
        console.log('✅ All CRM syncs completed successfully');
      }

    } catch (error) {
      console.error('CRM sync error:', error);
      setCrmSyncState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to sync to CRM' 
      });
    }
  }, [scanResult, researchData, crmConfigs, emailState.content, deepScanResults?.businessIntel, deepScanResults?.completedAt, deepScanResults?.confidenceScore, deepScanResults?.reviews, deepScanResults?.sources, deepScanResults?.technology, deepScanResults?.unified, instantIntel, scanData?.businessIntel, scanData?.completedAt, scanData?.confidenceScore, scanData?.established, scanData?.growthIndicators, scanData?.location, scanData?.marketPosition, scanData?.patientVolume, scanData?.phone, scanData?.practiceType, scanData?.reviews, scanData?.sources, scanData?.specialties, scanData?.staff, scanData?.technology]);

  /**
   * Handle CRM configuration changes
   */
  const handleCRMConfigChange = useCallback((configs: CRMConfig[]) => {
    setCrmConfigs(configs);
  }, []);

  return (
    <motion.div 
      className="enhanced-action-suite"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Instant Intelligence Indicator */}
      {instantIntel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="instant-intel-banner"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            borderRadius: '12px',
            padding: '16px 24px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            <div>
              <h4 style={{ 
                margin: 0, 
                color: '#00ff88',
                fontSize: '16px',
                fontWeight: 600
              }}>
                Instant Intelligence Active
              </h4>
              <p style={{ 
                margin: '4px 0 0 0', 
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
                Pre-loaded outreach templates ready to send • Generated in {instantIntel.generatedIn}ms
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#00d4ff'
          }}>
            <span>Confidence: {instantIntel.confidenceScore}%</span>
          </div>
        </motion.div>
      )}
      
      {/* Tab Navigation */}
      <div className="action-tabs">
        <button 
          className={`tab ${activeTab === 'outreach' ? 'active' : ''}`}
          onClick={() => setActiveTab('outreach')}
        >
          🎯 Smart Outreach
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📊 Reports & Export
        </button>
        <button 
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Performance Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'crm' ? 'active' : ''}`}
          onClick={() => setActiveTab('crm')}
        >
          🔗 CRM Integration
        </button>
        <button 
          className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
          onClick={() => setActiveTab('batch')}
        >
          👥 Batch Analysis
        </button>
      </div>

      {/* Contact Information */}
      <div className="contact-section" style={{ position: 'relative' }}>
        <MetallicScrew position="top-left" />
        <MetallicScrew position="top-right" />
        <MetallicScrew position="bottom-left" />
        <MetallicScrew position="bottom-right" />
        <h4>🎯 Target Contact Information</h4>
        <div className="contact-inputs">
          <input
            type="email"
            placeholder="doctor@practice.com"
            value={contactInfo.email}
            onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
            className="contact-input"
          />
          <input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={contactInfo.phone}
            onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
            className="contact-input"
          />
          <input
            type="text"
            placeholder="Preferred name"
            value={contactInfo.preferredName}
            onChange={(e) => setContactInfo(prev => ({ ...prev, preferredName: e.target.value }))}
            className="contact-input"
          />
        </div>
      </div>

      {/* Sales Rep Information */}
      <div className="sales-rep-section" style={{ position: 'relative' }}>
        <MetallicScrew position="top-left" />
        <MetallicScrew position="top-right" />
        <MetallicScrew position="bottom-left" />
        <MetallicScrew position="bottom-right" />
        <h4>👨‍💼 Sales Rep Information</h4>
        <div className="contact-inputs">
          <input
            type="text"
            placeholder="Your Name"
            value={salesRepInfo.name}
            onChange={(e) => setSalesRepInfo(prev => ({ ...prev, name: e.target.value }))}
            className="contact-input"
          />
          <input
            type="text"
            placeholder="Company Name"
            value={salesRepInfo.company}
            onChange={(e) => setSalesRepInfo(prev => ({ ...prev, company: e.target.value }))}
            className="contact-input"
          />
          <input
            type="text"
            placeholder="Product/Service"
            value={salesRepInfo.product}
            onChange={(e) => setSalesRepInfo(prev => ({ ...prev, product: e.target.value }))}
            className="contact-input"
          />
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'outreach' && (
          <motion.div
            key="outreach"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="tab-content outreach-content"
          >
            {(!researchData && !instantIntel) && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading outreach data...</p>
              </div>
            )}
            {/* Email Outreach */}
            <div className="outreach-section" style={{ position: 'relative' }}>
              <MetallicScrew position="top-left" />
              <MetallicScrew position="top-right" />
              <MetallicScrew position="bottom-left" />
              <MetallicScrew position="bottom-right" />
              <div className="section-header">
                <h4>📧 Personalized Email Outreach</h4>
                <div className="quality-indicators">
                  <span className="research-quality">{scanResult.researchQuality}</span>
                  <span className="confidence-score">{scanResult.score}% fit</span>
                </div>
              </div>
              
              <div className="outreach-actions">
                <button 
                  onClick={async () => {
                    // If instant intelligence is available, it's already loaded
                    if (instantIntel) {
                      // Campaign is already set via useEffect
                      return;
                    }
                    
                    // Check subscription
                    if (!user?.subscription || user.subscription.status !== 'active') {
                      setUpgradeFeature('AI-Powered Email Generation');
                      setShowUpgradeModal(true);
                      return;
                    }
                    
                    // Generate using AI
                    try {
                      const procedure = await findProcedureByName(scanResult.product);
                      const aiCampaign = await generateMultiChannelCampaign(
                        scanResult.doctor,
                        scanResult.product,
                        researchData!,
                        salesRepInfo.name,
                        salesRepInfo.company,
                        procedure || undefined
                      );
                      
                      // Create campaign object
                      const campaign: EmailCampaign = {
                        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        to: contactInfo.email,
                        subject: aiCampaign.email.subject,
                        body: aiCampaign.email.body
                      };
                      
                      setMagicLinkCampaign(campaign);
                    } catch (error) {
                      console.error('Failed to generate AI email:', error);
                      // Fallback to template
                      const campaign = generateEmailFromScanResult(
                        scanResult,
                        salesRepInfo,
                        'initial',
                        researchData
                      );
                      campaign.to = contactInfo.email;
                      setMagicLinkCampaign(campaign);
                    }
                  }}
                  disabled={!researchData && !instantIntel}
                  className="generate-btn"
                  style={{ 
                    display: instantIntel ? 'none' : 'block' // Hide button if instant intel is available
                  }}
                >
                  🧠 Generate AI Email
                </button>
                
                {instantIntel && (
                  <div className="instant-intel-indicator" style={{
                    padding: '10px 20px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '8px',
                    color: '#00ff88',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ⚡ Instant Intelligence Loaded - Ready to Send!
                  </div>
                )}
              </div>

              {magicLinkCampaign && (
                <>
                  <div className="outreach-preview">
                    <div className="preview-header">
                      <strong>To:</strong> {magicLinkCampaign.to || 'Enter recipient email above'}
                    </div>
                    <div className="preview-header">
                      <strong>Subject:</strong> {magicLinkCampaign.subject}
                    </div>
                    <div className="preview-content" style={{ 
                      maxHeight: '300px', 
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                      padding: '15px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      marginTop: '10px'
                    }}>
                      {magicLinkCampaign.body}
                    </div>
                  </div>
                  
                  {/* Multi-Channel Magic Link Sender */}
                  <div style={{ marginTop: '20px' }}>
                    <MultiChannelMagicLink
                      campaign={{
                        ...magicLinkCampaign,
                        phone: contactInfo.phone,
                        smsMessage: instantIntel ? instantIntel.outreachTemplates.sms : generateEnhancedSMS(scanResult, researchData),
                        whatsappMessage: instantIntel ? instantIntel.outreachTemplates.sms : generateEnhancedWhatsApp(scanResult, researchData),
                        linkedinMessage: instantIntel ? instantIntel.outreachTemplates.linkedin : generateEnhancedLinkedIn(scanResult, researchData),
                        linkedinUrl: researchData?.linkedinUrl
                      }}
                      doctor={{
                        name: scanResult.doctor,
                        email: contactInfo.email,
                        phone: contactInfo.phone,
                        linkedinUrl: researchData?.linkedinUrl
                      }}
                      onSent={(channel) => {
                        // Track which channel was used
                        console.log(`${channel} link opened`);
                      }}
                      onUpgradeClick={() => setShowUpgradeModal(true)}
                    />
                  </div>
                  
                  {/* Email Type Selector */}
                  <div style={{ 
                    marginTop: '15px', 
                    display: 'flex', 
                    gap: '10px',
                    justifyContent: 'center'
                  }}>
                    <button
                      onClick={() => {
                        const campaign = generateEmailFromScanResult(scanResult, salesRepInfo, 'initial', researchData);
                        campaign.to = contactInfo.email;
                        setMagicLinkCampaign(campaign);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(123, 66, 246, 0.2)',
                        border: '1px solid rgba(123, 66, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Initial Outreach
                    </button>
                    <button
                      onClick={() => {
                        const campaign = generateEmailFromScanResult(scanResult, salesRepInfo, 'follow_up', researchData);
                        campaign.to = contactInfo.email;
                        setMagicLinkCampaign(campaign);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(123, 66, 246, 0.2)',
                        border: '1px solid rgba(123, 66, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Follow-Up
                    </button>
                    <button
                      onClick={() => {
                        const campaign = generateEmailFromScanResult(scanResult, salesRepInfo, 'closing', researchData);
                        campaign.to = contactInfo.email;
                        setMagicLinkCampaign(campaign);
                      }}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(123, 66, 246, 0.2)',
                        border: '1px solid rgba(123, 66, 246, 0.3)',
                        borderRadius: '6px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Closing
                    </button>
                  </div>
                </>
              )}

              {emailState.error && (
                <div className="error-message">
                  ❌ {emailState.error}
                </div>
              )}
            </div>

            {/* SMS Outreach */}
            <div className="outreach-section" style={{ position: 'relative' }}>
              <MetallicScrew position="top-left" />
              <MetallicScrew position="top-right" />
              <MetallicScrew position="bottom-left" />
              <MetallicScrew position="bottom-right" />
              <div className="section-header">
                <h4>💬 Smart SMS Outreach</h4>
                <span className="character-limit">160 char limit</span>
              </div>
              
              <div className="outreach-actions">
                <button 
                  onClick={handleGenerateSMS}
                  disabled={smsState.loading || (!researchData && !instantIntel)}
                  className="generate-btn"
                  style={{ 
                    display: instantIntel && smsState.content ? 'none' : 'block'
                  }}
                >
                  {smsState.loading ? '🔄 Generating...' : '🧠 Generate SMS'}
                </button>
                
                {instantIntel && !smsState.content && (
                  <div className="instant-intel-indicator" style={{
                    padding: '10px 20px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: '8px',
                    color: '#00ff88',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    ⚡ Instant SMS Template Ready - Click Generate to Load
                  </div>
                )}
                
                {smsState.content && (
                  <button 
                    onClick={handleSendSMS}
                    disabled={!contactInfo.phone || smsState.loading || smsState.sent}
                    className="send-btn sms"
                  >
                    {smsState.loading ? '📤 Sending...' : smsState.sent ? '✅ Sent!' : '💬 Send SMS'}
                  </button>
                )}
              </div>

              {smsState.content && (
                <div className="outreach-preview sms">
                  <div className="sms-bubble">
                    {smsState.content.content}
                  </div>
                  <div className="sms-meta">
                    <span>Length: {smsState.content.content.length}/160</span>
                    <span>Urgency: {smsState.content.urgencyScore}/10</span>
                  </div>
                </div>
              )}

              {smsState.error && (
                <div className="error-message">
                  ❌ {smsState.error}
                </div>
              )}
            </div>

            {/* Campaign Builder */}
            <div className="outreach-section" style={{ position: 'relative' }}>
              <MetallicScrew position="top-left" />
              <MetallicScrew position="top-right" />
              <MetallicScrew position="bottom-left" />
              <MetallicScrew position="bottom-right" />
              <div className="section-header">
                <h4>🚀 Multi-Touch Campaign</h4>
                <span className="campaign-type">
                  {scanResult.score > 80 ? 'Aggressive' : 'Professional'} Sequence
                </span>
              </div>
              
              <div className="outreach-actions">
                <button 
                  onClick={handleCreateCampaign}
                  disabled={campaignState.loading || (!researchData && !instantIntel)}
                  className="generate-btn campaign"
                >
                  {campaignState.loading ? '🔄 Building...' : '🎯 Build Campaign'}
                </button>
                
                {instantIntel && !researchData && (
                  <div className="instant-intel-note" style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.7)'
                  }}>
                    📌 Using instant intelligence for rapid campaign creation
                  </div>
                )}
              </div>

              {campaignState.campaign && (
                <div className="campaign-preview">
                  <h5>Campaign Sequence ({campaignState.campaign.sequence.length} touches)</h5>
                  <div className="sequence-timeline">
                    {campaignState.campaign.sequence.map((step) => (
                      <div key={step.id} className="timeline-step">
                        <div className="step-day">Day {step.day}</div>
                        <div className="step-type">{step.type.toUpperCase()}</div>
                        <div className="step-time">{step.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {campaignState.error && (
                <div className="error-message">
                  ❌ {campaignState.error}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="tab-content reports-content"
          >
            {(!researchData && !instantIntel && !scanResult) && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading report data...</p>
              </div>
            )}
            
            {/* Always show report buttons - disable if no data */}
            <div className="reports-section" style={{ position: 'relative' }}>
              <MetallicScrew position="top-left" />
              <MetallicScrew position="top-right" />
              <MetallicScrew position="bottom-left" />
              <MetallicScrew position="bottom-right" />
              {/* Status indicator */}
              <div className="reports-status">
                {(researchData || instantIntel || scanResult) ? (
                  <div className="status-ready">
                    ✅ <strong>Report Data Ready</strong> - Click any button below to generate and download reports
                  </div>
                ) : (
                  <div className="status-waiting">
                    ⏳ <strong>Waiting for scan data</strong> - Complete a doctor scan first to generate reports
                  </div>
                )}
              </div>
              <div className="reports-category">
                <h4>📊 Intelligence Reports</h4>
                <div className="reports-grid">
                  <button 
                    onClick={handleExportPDF} 
                    disabled={pdfState.loading}
                    className="report-btn"
                  >
                    {pdfState.loading ? '🔄 Generating...' : '📄 Intelligence Brief (PDF)'}
                  </button>
                  <button 
                    onClick={handleGenerateDeepReport}
                    disabled={deepReportState.loading}
                    className="report-btn"
                  >
                    {deepReportState.loading ? '🔄 Researching...' : '📊 Deep Research Report (20+ pages)'}
                  </button>
                  <button 
                    onClick={() => setShowSEOReport(true)}
                    disabled={!researchData?.practiceInfo?.website}
                    className="report-btn"
                  >
                    🔍 SEO Analysis Report
                  </button>
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="report-btn share-btn"
                    style={{
                      background: 'linear-gradient(135deg, #00FFC6, #00D4FF)',
                      color: '#000',
                      fontWeight: 700
                    }}
                  >
                    🔗 Share Intelligence Report
                  </button>
                </div>
              </div>

              <div className="reports-category">
                <h4>🎯 Sales Rep Reports</h4>
                <div className="sales-reports-grid">
                  <button 
                    onClick={() => handleGenerateSalesReport('mckinsey_executive')}
                    disabled={salesReportState.loading}
                    className="sales-report-btn executive"
                  >
                    {salesReportState.loading && salesReportState.type === 'mckinsey_executive' 
                      ? '🔄 Generating...' 
                      : `📈 ${generateDynamicReportName(scanResult.product, scanResult.doctor)} (10 pages)`}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('initial_outreach')}
                    disabled={salesReportState.loading}
                    className="sales-report-btn initial"
                  >
                    {salesReportState.loading && salesReportState.type === 'initial_outreach' ? '🔄 Generating...' : '🎯 Initial Outreach Brief'}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('follow_up')}
                    disabled={salesReportState.loading}
                    className="sales-report-btn follow-up"
                  >
                    {salesReportState.loading && salesReportState.type === 'follow_up' ? '🔄 Generating...' : '📞 Follow-Up Strategy'}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('breakthrough')}
                    disabled={salesReportState.loading}
                    className="sales-report-btn breakthrough"
                  >
                    {salesReportState.loading && salesReportState.type === 'breakthrough' ? '🔄 Generating...' : '🚀 Breakthrough Strategy'}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('closing')}
                    disabled={salesReportState.loading}
                    className="sales-report-btn closing"
                  >
                    {salesReportState.loading && salesReportState.type === 'closing' ? '🔄 Generating...' : '🎯 Closing Strategy'}
                  </button>
                </div>
                
                <div className="sales-reports-description">
                  <p><strong>{scanResult.product} Impact Report:</strong> Comprehensive analysis showing how {scanResult.product} will specifically benefit this practice, with financial projections, competitive positioning, and implementation roadmap</p>
                  <p><strong>Initial Outreach:</strong> Believable cold outreach messages using specific practice details to establish credibility and show genuine research</p>
                  <p><strong>Follow-Up Strategy:</strong> Objection handling, refined messaging, and next-step recommendations</p>
                  <p><strong>Breakthrough Strategy:</strong> Obstacle analysis, alternative approaches, and urgency creation tactics</p>
                  <p><strong>Closing Strategy:</strong> Decision maker analysis, final push tactics, and implementation planning</p>
                </div>
              </div>
            </div>

            {pdfState.error && (
              <div className="error-message">
                ❌ {pdfState.error}
              </div>
            )}

            {deepReportState.error && (
              <div className="error-message">
                ❌ {deepReportState.error}
              </div>
            )}

            {salesReportState.error && (
              <div className="error-message">
                ❌ {salesReportState.error}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="tab-content analytics-content"
          >
            {!scanResult && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading analytics data...</p>
              </div>
            )}
            
            {scanResult && (
            <div style={{ position: 'relative' }}>
              <MetallicScrew position="top-left" />
              <MetallicScrew position="top-right" />
              <MetallicScrew position="bottom-left" />
              <MetallicScrew position="bottom-right" />
            <div className="analytics-dashboard">
              <div className="metric-card">
                <h4>Research Quality</h4>
                <div className="metric-value">{scanResult?.researchQuality || 'N/A'}</div>
                <div className="metric-description">Quality of research data found</div>
              </div>
              <div className="metric-card">
                <h4>Practice Fit</h4>
                <div className="metric-value">{scanResult?.score || 0}%</div>
                <div className="metric-description">Match score for this practice</div>
              </div>
              <div className="metric-card">
                <h4>Data Sources</h4>
                <div className="metric-value">{researchData?.sources?.length || scanResult?.researchSources || 0}</div>
                <div className="metric-description">Number of data sources used</div>
              </div>
              <div className="metric-card">
                <h4>Confidence Level</h4>
                <div className="metric-value">{researchData?.confidenceScore || instantIntel?.confidenceScore || scanResult?.score || 0}%</div>
                <div className="metric-description">Confidence in research findings</div>
              </div>
              <div className="metric-card">
                <h4>Practice Type</h4>
                <div className="metric-value">{researchData?.businessIntel?.practiceType || 'Unknown'}</div>
                <div className="metric-description">Type of medical practice</div>
              </div>
              <div className="metric-card">
                <h4>Patient Volume</h4>
                <div className="metric-value">{researchData?.businessIntel?.patientVolume || 'Unknown'}</div>
                <div className="metric-description">Estimated patient volume</div>
              </div>
              <div className="metric-card">
                <h4>Years Experience</h4>
                <div className="metric-value">{researchData?.credentials?.yearsExperience || 'N/A'}</div>
                <div className="metric-description">Doctor's years of experience</div>
              </div>
              <div className="metric-card">
                <h4>Review Rating</h4>
                <div className="metric-value">{researchData?.reviews?.averageRating || 'N/A'}</div>
                <div className="metric-description">Average patient review rating</div>
              </div>
            </div>
            
            {researchData?.businessIntel?.growthIndicators && researchData.businessIntel.growthIndicators.length > 0 && (
              <div className="growth-indicators">
                <h4>Growth Indicators</h4>
                <div className="indicators-list">
                  {researchData.businessIntel.growthIndicators.map((indicator, index) => (
                    <div key={index} className="indicator-item">
                      ✅ {indicator}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {researchData?.businessIntel?.recentNews && researchData.businessIntel.recentNews.length > 0 && (
              <div className="recent-news">
                <h4>Recent News</h4>
                <div className="news-list">
                  {researchData.businessIntel.recentNews.map((news, index) => (
                    <div key={index} className="news-item">
                      📰 {news}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {researchData?.businessIntel?.technologyStack && researchData.businessIntel.technologyStack.length > 0 && (
              <div className="technology-stack">
                <h4>Technology Stack</h4>
                <div className="tech-list">
                  {researchData.businessIntel.technologyStack.map((tech, index) => (
                    <div key={index} className="tech-item">
                      💻 {tech}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
            )}
          </motion.div>
        )}

        {activeTab === 'crm' && (
          <motion.div
            key="crm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="tab-content crm-content"
          >
            {!researchData && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading CRM data...</p>
              </div>
            )}
            <div className="crm-sync-section" style={{ position: 'relative' }}>
              <MetallicScrew position="top-left" />
              <MetallicScrew position="top-right" />
              <MetallicScrew position="bottom-left" />
              <MetallicScrew position="bottom-right" />
              <div className="section-header">
                <h4>🔗 CRM Synchronization</h4>
                <div className="sync-status">
                  {crmConfigs.filter(c => c.enabled).length > 0 ? (
                    <span className="status-enabled">✅ {crmConfigs.filter(c => c.enabled).length} CRM(s) Enabled</span>
                  ) : (
                    <span className="status-disabled">❌ No CRMs Configured</span>
                  )}
                </div>
              </div>
              
              <div className="sync-actions">
                <button 
                  onClick={handleSyncToCRM}
                  disabled={crmSyncState.loading || !researchData || crmConfigs.filter(c => c.enabled).length === 0}
                  className="sync-btn"
                >
                  {crmSyncState.loading ? '🔄 Syncing...' : '🚀 Sync to CRM'}
                </button>
              </div>

              {crmSyncState.success && (
                <div className="success-message">
                  ✅ Successfully synced to all enabled CRM systems
                </div>
              )}

              {crmSyncState.error && (
                <div className="error-message">
                  ❌ {crmSyncState.error}
                </div>
              )}

              <div className="sync-preview">
                <h5>📋 Data to be synced:</h5>
                <div className="preview-items">
                  <div className="preview-item">
                    <strong>Contact:</strong> {scanResult.doctor}
                  </div>
                  <div className="preview-item">
                    <strong>Company:</strong> {researchData?.practiceInfo?.name || `${scanResult.doctor} Medical Practice`}
                  </div>
                  <div className="preview-item">
                    <strong>Opportunity:</strong> {scanResult.doctor} - {scanResult.product} Opportunity
                  </div>
                  <div className="preview-item">
                    <strong>Practice Score:</strong> {scanResult.score}%
                  </div>
                  <div className="preview-item">
                    <strong>Activities:</strong> Research notes, follow-up tasks{emailState.content ? ', outreach email' : ''}
                  </div>
                </div>
              </div>
            </div>

            <CRMIntegrationPanel onConfigChange={handleCRMConfigChange} />
          </motion.div>
        )}

        {activeTab === 'batch' && (
          <motion.div
            key="batch"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="tab-content batch-content"
          >
            {!scanResult && (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading batch analysis...</p>
              </div>
            )}
            <div className="batch-analysis-section" style={{ position: 'relative' }}>
              <MetallicScrew position="top-left" />
              <MetallicScrew position="top-right" />
              <MetallicScrew position="bottom-left" />
              <MetallicScrew position="bottom-right" />
              <div className="section-header">
                <h4>👥 Multi-Doctor Batch Analysis</h4>
                <p>Analyze multiple doctors simultaneously for efficient prospecting and lead qualification</p>
              </div>

              <div className="batch-features">
                <div className="feature-grid">
                  <div className="feature-card">
                    <div className="feature-icon">📊</div>
                    <h5>Bulk Processing</h5>
                    <p>Analyze dozens of doctors at once with automated queuing and progress tracking</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📈</div>
                    <h5>Smart Prioritization</h5>
                    <p>Automatically prioritize high-value prospects based on specialty and fit scores</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📄</div>
                    <h5>CSV Import/Export</h5>
                    <p>Import doctor lists from CSV files and export results for further analysis</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h5>Lead Scoring</h5>
                    <p>Get comprehensive scores and recommendations for each doctor analyzed</p>
                  </div>
                </div>
              </div>

              <div className="batch-actions">
                <button 
                  className="launch-batch-btn"
                  onClick={() => setShowBatchAnalysis(true)}
                >
                  🚀 Launch Batch Analysis
                </button>
                <div className="batch-info">
                  <span>✨ Process up to 100 doctors per batch</span>
                  <span>⚡ Average 30 seconds per doctor</span>
                  <span>🎯 Intelligent prioritization included</span>
                </div>
              </div>

              {/* Sample workflow */}
              <div className="workflow-preview">
                <h5>📋 Typical Workflow</h5>
                <div className="workflow-steps">
                  <div className="workflow-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <strong>Import Data</strong>
                      <span>Upload CSV with doctor names, practices, and contact info</span>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <strong>Configure Analysis</strong>
                      <span>Set options for research depth and prioritization</span>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <strong>Run Analysis</strong>
                      <span>Automated processing with real-time progress tracking</span>
                    </div>
                  </div>
                  <div className="workflow-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <strong>Review Results</strong>
                      <span>Prioritized leads with scores, insights, and recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Options */}
      <div className="advanced-section">
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="advanced-toggle"
        >
          ⚙️ Advanced Options {showAdvanced ? '▼' : '▶'}
        </button>
        
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="advanced-options"
          >
            <div className="option-group">
              <label>
                <input type="checkbox" /> Include competitive intelligence
              </label>
              <label>
                <input type="checkbox" /> Add ROI calculator
              </label>
              <label>
                <input type="checkbox" /> Schedule follow-up reminders
              </label>
            </div>
          </motion.div>
        )}
      </div>

      {/* Batch Analysis Modal */}
      <AnimatePresence>
        {showBatchAnalysis && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowBatchAnalysis(false);
              }
            }}
          >
            <BatchAnalysisPanel onClose={() => setShowBatchAnalysis(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowUpgradeModal(false);
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(123, 66, 246, 0.3)',
                borderRadius: '16px',
                padding: '40px',
                maxWidth: '600px',
                width: '90%',
                color: '#fff',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
              }}
            >
              <h2 style={{ 
                fontSize: '28px', 
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                🚀 Upgrade to Send from YOUR Email
              </h2>
              
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>✨ Magic Links - Available in Paid Plans</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '10px' }}>📧 Emails open in YOUR email client</li>
                  <li style={{ marginBottom: '10px' }}>👤 Sends from YOUR email address</li>
                  <li style={{ marginBottom: '10px' }}>🎯 Maintains sender authenticity</li>
                  <li style={{ marginBottom: '10px' }}>📊 Track opens and engagement</li>
                </ul>
              </div>
              
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '30px'
              }}>
                <h4 style={{ fontSize: '18px', marginBottom: '15px' }}>📈 Closer Plan - $97/month</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li>✅ 10 Magic Link emails per month</li>
                  <li>✅ 100 AI credits</li>
                  <li>✅ Full Market Insights access</li>
                  <li>✅ Export to PDF/Excel</li>
                </ul>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    window.location.href = '/pricing';
                    setShowUpgradeModal(false);
                  }}
                  style={{
                    padding: '14px 28px',
                    background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  View Pricing Plans
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  style={{
                    padding: '14px 28px',
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subscription Modal */}
      <SubscriptionModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        currentPlan={user?.subscription?.tier || 'none'}
      />
      
      {/* SEO Report Modal */}
      {researchData?.practiceInfo?.website && (
        <SEOReportModal
          open={showSEOReport}
          onClose={() => setShowSEOReport(false)}
          websiteUrl={researchData.practiceInfo.website}
          doctorName={scanResult.doctor}
          location={researchData.practiceInfo.address || ''}
          specialty={researchData.enhancedInsights?.specialty}
          userId={user?.id}
        />
      )}
      
      {/* Share Intelligence Modal */}
      <ShareIntelligenceModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        reportData={{
          scanResult,
          researchData,
          deepScanResults,
          scanData,
          instantIntel
        }}
        doctorName={scanResult.doctor}
        userTier={getUserTier()}
        userId={user?.id || 'anonymous'}
      />
    </motion.div>
  );
};

export default EnhancedActionSuite;