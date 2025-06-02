import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type EnhancedScanResult } from '../lib/enhancedAI';
import { type ResearchData } from '../lib/webResearch';
import { 
  generatePersonalizedOutreach, 
  createCampaignSequence, 
  sendEmail, 
  sendSMS,
  type PersonalizedOutreach,
  type OutreachCampaign
} from '../lib/outreachSystem';
import { generatePDFReport } from '../lib/pdfExport';
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

interface EnhancedActionSuiteProps {
  scanResult: EnhancedScanResult;
  researchData?: ResearchData;
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
  researchData 
}) => {
  const [activeTab, setActiveTab] = useState<'outreach' | 'reports' | 'analytics' | 'crm' | 'batch'>('outreach');
  const [emailState, setEmailState] = useState<OutreachState>({ loading: false, sent: false });
  const [smsState, setSmsState] = useState<OutreachState>({ loading: false, sent: false });
  const [campaignState, setCampaignState] = useState<OutreachState>({ loading: false, sent: false });
  const [pdfState, setPdfState] = useState<{ loading: boolean; error?: string }>({ loading: false });
  const [deepReportState, setDeepReportState] = useState<{ loading: boolean; error?: string }>({ loading: false });
  const [salesReportState, setSalesReportState] = useState<{ loading: boolean; error?: string; type?: string }>({ loading: false });
  const [crmConfigs, setCrmConfigs] = useState<CRMConfig[]>([]);
  const [crmSyncState, setCrmSyncState] = useState<{ loading: boolean; error?: string; success?: boolean }>({ loading: false });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showBatchAnalysis, setShowBatchAnalysis] = useState(false);
  
  // Sales rep information
  const [salesRepInfo, setSalesRepInfo] = useState({
    name: 'Sales Representative',
    company: 'Your Company',
    product: 'Your Product'
  });

  // Contact information state
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    preferredName: scanResult.doctor
  });

  /**
   * Generate personalized email outreach
   */
  const handleGenerateEmail = useCallback(async () => {
    if (!researchData) return;
    
    setEmailState({ loading: true, sent: false });
    
    try {
      const outreach = await generatePersonalizedOutreach(
        scanResult,
        researchData,
        'first_contact',
        'email'
      );
      
      setEmailState({ 
        loading: false, 
        sent: false, 
        content: outreach 
      });
      
    } catch (error) {
      setEmailState({ 
        loading: false, 
        sent: false, 
        error: error instanceof Error ? error.message : 'Failed to generate email' 
      });
    }
  }, [scanResult, researchData]);

  /**
   * Send generated email
   */
  const handleSendEmail = useCallback(async () => {
    if (!emailState.content || !contactInfo.email) return;
    
    setEmailState(prev => ({ ...prev, loading: true }));
    
    try {
      const result = await sendEmail(
        contactInfo.email,
        emailState.content.subject,
        emailState.content.content
      );
      
      if (result.success) {
        setEmailState(prev => ({ 
          ...prev, 
          loading: false, 
          sent: true 
        }));
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      setEmailState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      }));
    }
  }, [emailState.content, contactInfo.email]);

  /**
   * Generate personalized SMS
   */
  const handleGenerateSMS = useCallback(async () => {
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
  }, [scanResult, researchData]);

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
    if (!researchData) return;
    
    setCampaignState({ loading: true, sent: false });
    
    try {
      const campaign = await createCampaignSequence(
        scanResult,
        researchData,
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
  }, [scanResult, researchData]);

  /**
   * Export PDF report
   */
  const handleExportPDF = useCallback(async () => {
    if (!researchData) return;
    
    setPdfState({ loading: true });
    
    try {
      console.log('Generating comprehensive PDF intelligence brief...');
      
      const pdfBlob = await generatePDFReport(scanResult, researchData, {
        includeLogo: true,
        includeResearch: true,
        includeOutreach: true,
        includeStrategy: true,
        format: 'detailed',
        branding: 'canvas'
      });
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Canvas-Intelligence-Brief-${scanResult.doctor.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      setPdfState({ loading: false });
      console.log('✅ PDF intelligence brief generated successfully');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      setPdfState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate PDF' 
      });
    }
  }, [scanResult, researchData]);

  /**
   * Generate Deep Research Report (20+ pages)
   */
  const handleGenerateDeepReport = useCallback(async () => {
    if (!researchData) return;
    
    setDeepReportState({ loading: true });
    
    try {
      console.log('Generating comprehensive 20+ page deep research report...');
      
      const pdfBlob = await generateDeepResearchReport(scanResult, researchData, {
        includeMarketAnalysis: true,
        includeCompetitorProfiles: true,
        includeIndustryTrends: true,
        includeRegulatoryInsights: true,
        includeFinancialProjections: true,
        includeDetailedPersona: true,
        format: 'comprehensive'
      });
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Canvas-Deep-Research-${scanResult.doctor.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      setDeepReportState({ loading: false });
      console.log('✅ Deep research report generated successfully');
      
    } catch (error) {
      console.error('Deep research report generation error:', error);
      setDeepReportState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate deep research report' 
      });
    }
  }, [scanResult, researchData]);

  /**
   * Generate Sales Rep Reports
   */
  const handleGenerateSalesReport = useCallback(async (reportType: 'mckinsey_executive' | 'initial_outreach' | 'follow_up' | 'breakthrough' | 'closing') => {
    if (!researchData) return;
    
    setSalesReportState({ loading: true, type: reportType });
    
    try {
      console.log(`Generating ${reportType} sales rep report...`);
      
      let pdfBlob: Blob;
      let fileName: string;
      
      switch (reportType) {
        case 'mckinsey_executive':
          pdfBlob = await generateMcKinseyExecutiveReport(
            scanResult,
            researchData,
            salesRepInfo.name,
            salesRepInfo.company,
            salesRepInfo.product
          );
          fileName = `McKinsey-Executive-Brief-${scanResult.doctor.replace(/\s+/g, '-')}.pdf`;
          break;
        case 'initial_outreach':
          pdfBlob = await generateInitialOutreachReport(
            scanResult,
            researchData,
            salesRepInfo.name,
            salesRepInfo.company,
            salesRepInfo.product
          );
          fileName = `Initial-Outreach-Brief-${scanResult.doctor.replace(/\s+/g, '-')}.pdf`;
          break;
        case 'follow_up':
          pdfBlob = await generateFollowUpReport(
            scanResult,
            researchData,
            salesRepInfo.name,
            salesRepInfo.company,
            salesRepInfo.product
          );
          fileName = `Follow-Up-Strategy-${scanResult.doctor.replace(/\s+/g, '-')}.pdf`;
          break;
        case 'breakthrough':
          pdfBlob = await generateBreakthroughReport(
            scanResult,
            researchData,
            salesRepInfo.name,
            salesRepInfo.company,
            salesRepInfo.product
          );
          fileName = `Breakthrough-Strategy-${scanResult.doctor.replace(/\s+/g, '-')}.pdf`;
          break;
        case 'closing':
          pdfBlob = await generateClosingReport(
            scanResult,
            researchData,
            salesRepInfo.name,
            salesRepInfo.company,
            salesRepInfo.product
          );
          fileName = `Closing-Strategy-${scanResult.doctor.replace(/\s+/g, '-')}.pdf`;
          break;
      }
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.replace('.pdf', '')}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
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
  }, [scanResult, researchData, crmConfigs, emailState.content]);

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
      <div className="contact-section">
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
      <div className="sales-rep-section">
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
            {/* Email Outreach */}
            <div className="outreach-section">
              <div className="section-header">
                <h4>📧 Personalized Email Outreach</h4>
                <div className="quality-indicators">
                  <span className="research-quality">{scanResult.researchQuality}</span>
                  <span className="confidence-score">{scanResult.score}% fit</span>
                </div>
              </div>
              
              <div className="outreach-actions">
                <button 
                  onClick={handleGenerateEmail}
                  disabled={emailState.loading || !researchData}
                  className="generate-btn"
                >
                  {emailState.loading ? '🔄 Generating...' : '🧠 Generate Email'}
                </button>
                
                {emailState.content && (
                  <button 
                    onClick={handleSendEmail}
                    disabled={!contactInfo.email || emailState.loading || emailState.sent}
                    className="send-btn email"
                  >
                    {emailState.loading ? '📤 Sending...' : emailState.sent ? '✅ Sent!' : '📧 Send Email'}
                  </button>
                )}
              </div>

              {emailState.content && (
                <div className="outreach-preview">
                  <div className="preview-header">
                    <strong>Subject:</strong> {emailState.content.subject}
                  </div>
                  <div className="preview-content">
                    {emailState.content.content}
                  </div>
                  <div className="preview-insights">
                    <strong>Personalizations:</strong>
                    <ul>
                      {emailState.content.personalizations.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {emailState.error && (
                <div className="error-message">
                  ❌ {emailState.error}
                </div>
              )}
            </div>

            {/* SMS Outreach */}
            <div className="outreach-section">
              <div className="section-header">
                <h4>💬 Smart SMS Outreach</h4>
                <span className="character-limit">160 char limit</span>
              </div>
              
              <div className="outreach-actions">
                <button 
                  onClick={handleGenerateSMS}
                  disabled={smsState.loading || !researchData}
                  className="generate-btn"
                >
                  {smsState.loading ? '🔄 Generating...' : '🧠 Generate SMS'}
                </button>
                
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
            <div className="outreach-section">
              <div className="section-header">
                <h4>🚀 Multi-Touch Campaign</h4>
                <span className="campaign-type">
                  {scanResult.score > 80 ? 'Aggressive' : 'Professional'} Sequence
                </span>
              </div>
              
              <div className="outreach-actions">
                <button 
                  onClick={handleCreateCampaign}
                  disabled={campaignState.loading || !researchData}
                  className="generate-btn campaign"
                >
                  {campaignState.loading ? '🔄 Building...' : '🎯 Build Campaign'}
                </button>
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
            <div className="reports-section">
              <div className="reports-category">
                <h4>📊 Intelligence Reports</h4>
                <div className="reports-grid">
                  <button 
                    onClick={handleExportPDF} 
                    disabled={pdfState.loading || !researchData}
                    className="report-btn"
                  >
                    {pdfState.loading ? '🔄 Generating...' : '📄 Intelligence Brief (PDF)'}
                  </button>
                  <button 
                    onClick={handleGenerateDeepReport}
                    disabled={deepReportState.loading || !researchData}
                    className="report-btn"
                  >
                    {deepReportState.loading ? '🔄 Researching...' : '📊 Deep Research Report (20+ pages)'}
                  </button>
                </div>
              </div>

              <div className="reports-category">
                <h4>🎯 Sales Rep Reports</h4>
                <div className="sales-reports-grid">
                  <button 
                    onClick={() => handleGenerateSalesReport('mckinsey_executive')}
                    disabled={salesReportState.loading || !researchData}
                    className="sales-report-btn executive"
                  >
                    {salesReportState.loading && salesReportState.type === 'mckinsey_executive' ? '🔄 Generating...' : '📈 McKinsey Executive Brief (10 pages)'}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('initial_outreach')}
                    disabled={salesReportState.loading || !researchData}
                    className="sales-report-btn initial"
                  >
                    {salesReportState.loading && salesReportState.type === 'initial_outreach' ? '🔄 Generating...' : '🎯 Initial Outreach Brief'}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('follow_up')}
                    disabled={salesReportState.loading || !researchData}
                    className="sales-report-btn follow-up"
                  >
                    {salesReportState.loading && salesReportState.type === 'follow_up' ? '🔄 Generating...' : '📞 Follow-Up Strategy'}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('breakthrough')}
                    disabled={salesReportState.loading || !researchData}
                    className="sales-report-btn breakthrough"
                  >
                    {salesReportState.loading && salesReportState.type === 'breakthrough' ? '🔄 Generating...' : '🚀 Breakthrough Strategy'}
                  </button>
                  <button 
                    onClick={() => handleGenerateSalesReport('closing')}
                    disabled={salesReportState.loading || !researchData}
                    className="sales-report-btn closing"
                  >
                    {salesReportState.loading && salesReportState.type === 'closing' ? '🔄 Generating...' : '🎯 Closing Strategy'}
                  </button>
                </div>
                
                <div className="sales-reports-description">
                  <p><strong>McKinsey Executive Brief:</strong> 10-page strategic presentation with financial analysis, competitive positioning, and implementation roadmap</p>
                  <p><strong>Initial Outreach:</strong> Research summary, conversation starters, and value propositions for first contact</p>
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
            <div className="analytics-dashboard">
              <div className="metric-card">
                <h4>Research Quality</h4>
                <div className="metric-value">{scanResult.researchQuality}</div>
              </div>
              <div className="metric-card">
                <h4>Practice Fit</h4>
                <div className="metric-value">{scanResult.score}%</div>
              </div>
              <div className="metric-card">
                <h4>Data Sources</h4>
                <div className="metric-value">{scanResult.researchSources || 0}</div>
              </div>
              <div className="metric-card">
                <h4>Fact-Based</h4>
                <div className="metric-value">{scanResult.factBased ? 'Yes' : 'No'}</div>
              </div>
            </div>
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
            <div className="crm-sync-section">
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
            <div className="batch-analysis-section">
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
    </motion.div>
  );
};

export default EnhancedActionSuite;