import React, { useState } from 'react';
import { 
  Button, 
  ButtonGroup, 
  Menu, 
  MenuItem, 
  CircularProgress,
  Alert,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext_20250730';
import { FeatureGate, TierBadge, UpgradePrompt, RepXTier } from '../unified-auth';
import { generatePDFReport } from '../lib/simplePdfExport';
import { generateDeepResearchReport } from '../lib/deepResearchReport';

interface ExportActionsProps {
  scanResult: any;
  researchData?: any;
  deepScanResults?: any;
  scanData?: any;
}

export const ExportActions_20250730: React.FC<ExportActionsProps> = ({
  scanResult,
  researchData,
  deepScanResults,
  scanData
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [exportType, setExportType] = useState<'basic' | 'deep'>('basic');
  
  const { tier, canExportReports } = useUnifiedAuth();
  
  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!canExportReports()) {
      setShowUpgradeModal(true);
      return;
    }
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleBasicPDF = async () => {
    setLoading(true);
    handleClose();
    
    try {
      // Create a properly typed ResearchData object with all required fields
      const enrichedResearchData: any = {
        // Required ResearchData fields
        doctorName: scanResult?.doctor?.name || '',
        practiceInfo: researchData?.practiceInfo || scanResult?.practice || {},
        credentials: researchData?.credentials || [],
        reviews: researchData?.reviews || [],
        procedures: researchData?.procedures || [],
        insurance: researchData?.insurance || [],
        location: researchData?.location || {},
        competitors: researchData?.competitors || [],
        summary: researchData?.summary || '',
        
        // Additional fields from the original data
        websiteData: researchData?.websiteData || {},
        marketAnalysis: researchData?.marketAnalysis || {},
        practiceInsights: researchData?.practiceInsights || {},
        competitorInfo: researchData?.competitorInfo || {},
        outreachSuggestions: researchData?.outreachSuggestions || [],
        
        // Deep scan and product data
        deepScanResults: deepScanResults,
        scanData: scanData,
        actualSearchResults: deepScanResults?.basic || {},
        product: scanData?.product || scanResult.product
      };
      
      const pdfBlob = await generatePDFReport(scanResult, enrichedResearchData, {
        includeLogo: true,
        includeResearch: true,
        includeOutreach: true,
        includeStrategy: true,
        format: 'detailed',
      });
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scanResult.doctor.name || 'Report'}_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF report');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeepReport = async () => {
    if (tier < RepXTier.Rep4) {
      setExportType('deep');
      setShowUpgradeModal(true);
      handleClose();
      return;
    }
    
    setLoading(true);
    handleClose();
    
    try {
      const intelligentResearchData = {
        ...researchData,
        scanData: scanData,
        timestamp: new Date().toISOString()
      };
      
      const pdfBlob = await generateDeepResearchReport(scanResult, intelligentResearchData, {
        includeMarketAnalysis: true,
        includeCompetitorProfiles: true,
        includeIndustryTrends: true,
        includeRegulatoryInsights: true,
        includeFinancialProjections: true,
      });
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${scanResult.doctor.name || 'Deep_Report'}_Executive_Brief_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Deep report generation error:', error);
      alert('Failed to generate executive report');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <ButtonGroup variant="contained" sx={{ boxShadow: 2 }}>
        <Button
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
          onClick={handleExportClick}
          disabled={loading}
        >
          Export Reports
        </Button>
        <TierBadge tier={tier} style={{ marginLeft: '8px' }} />
      </ButtonGroup>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <FeatureGate
          feature="phoneAccess"
          fallback={
            <Box sx={{ p: 2, maxWidth: 300 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                Report exports require RepX³ Business or higher
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Upgrade to export professional PDF reports with market intelligence
              </Typography>
            </Box>
          }
        >
          <MenuItem onClick={handleBasicPDF}>
            <PdfIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body1">Standard PDF Report</Typography>
              <Typography variant="caption" color="text.secondary">
                Includes practice analysis and outreach strategy
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem 
            onClick={handleDeepReport}
            disabled={tier < RepXTier.Rep4}
          >
            <DocIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body1">
                Executive Intelligence Report
                {tier < RepXTier.Rep4 && (
                  <Chip 
                    label="Rep⁴+" 
                    size="small" 
                    sx={{ ml: 1 }}
                    color="warning"
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Deep market analysis with financial projections
              </Typography>
            </Box>
          </MenuItem>
          
          <MenuItem 
            disabled={tier < RepXTier.Rep5}
          >
            <EmailIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body1">
                White Label Report
                {tier < RepXTier.Rep5 && (
                  <Chip 
                    label="Rep⁵" 
                    size="small" 
                    sx={{ ml: 1 }}
                    color="error"
                  />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Custom branded report with your logo
              </Typography>
            </Box>
          </MenuItem>
        </FeatureGate>
      </Menu>
      
      {showUpgradeModal && (
        <UpgradePrompt
          currentTier={tier}
          requiredTier={exportType === 'deep' ? RepXTier.Rep4 : RepXTier.Rep3}
          feature={exportType === 'deep' ? 'Executive Intelligence Reports' : 'Report Exports'}
          onUpgrade={() => {
            window.location.href = `https://osbackend-zl1h.onrender.com/upgrade?feature=export&from=${tier}`;
          }}
          onCancel={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
};