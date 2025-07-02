/**
 * Shared Intelligence Landing Page - Where magic link recipients land
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Lock,
  Download,
  Visibility,
  Phone,
  LocationOn,
  Business,
  CheckCircle,
  ErrorOutline,
  Comment
} from '@mui/icons-material';
import { validateMagicLink, trackDownload } from '../lib/magicLinkGenerator';
import { generatePDFReport } from '../lib/simplePdfExport';
import { MAGIC_LINK_CONFIGS, type SubscriptionTier } from '../types/magicLink';

// Premium styled components
const PageContainer = styled(Box)`
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ContentCard = styled(Paper)`
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  max-width: 800px;
  width: 100%;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(159, 88, 250, 0.1);
`;

const Header = styled(Box)`
  text-align: center;
  margin-bottom: 40px;
`;

const Logo = styled(Typography)`
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #00D4FF 0%, #00FFC6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 8px;
`;

const PasswordForm = styled(Box)`
  display: flex;
  gap: 16px;
  margin: 24px 0;
`;

const ReportSection = styled(Box)`
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 24px;
  margin: 24px 0;
`;

const InfoRow = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  color: rgba(255, 255, 255, 0.8);
`;

const ActionButton = styled(Button)`
  background: linear-gradient(135deg, #00FFC6, #00D4FF);
  color: #000;
  font-weight: 700;
  padding: 12px 32px;
  border-radius: 12px;
  text-transform: none;
  margin: 8px;
  
  &:hover {
    background: linear-gradient(135deg, #00FFE1, #00E5FF);
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
  }
`;

export default function SharedIntelligence() {
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [linkData, setLinkData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    if (linkId) {
      validateLink();
    }
  }, [linkId]);
  
  const validateLink = async (attemptPassword?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await validateMagicLink(
        linkId!,
        attemptPassword,
        // In production, get user email if they're logged in
        undefined,
        // Get user IP from request headers in production
        undefined
      );
      
      if (result.valid && result.data) {
        setLinkData(result.data);
        setRequiresPassword(false);
      } else if (result.error === 'Password required') {
        setRequiresPassword(true);
      } else {
        setError(result.error || 'Invalid link');
      }
    } catch (err) {
      setError('Failed to validate link');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      validateLink(password);
    }
  };
  
  const handleDownloadPDF = async () => {
    if (!linkData) return;
    
    setDownloading(true);
    
    try {
      // Track download event
      await trackDownload(linkId!, 'pdf');
      
      // Generate PDF from report data
      const reportData = linkData.report_data;
      const pdfBlob = await generatePDFReport(
        reportData.scanResult,
        reportData.researchData || {},
        {
          includeLogo: true,
          includeResearch: true,
          includeOutreach: false,
          includeStrategy: false,
          format: 'detailed',
          branding: 'canvas'
        }
      );
      
      // Download PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${linkData.doctor_name.replace(/\s+/g, '-')}-intelligence-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download report');
    } finally {
      setDownloading(false);
    }
  };
  
  const handleSignUp = () => {
    // Navigate to sign up with pre-filled data
    navigate('/signup?source=shared_intelligence');
  };
  
  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#00FFC6' }} />
          <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.6)' }}>
            Loading intelligence report...
          </Typography>
        </Box>
      </PageContainer>
    );
  }
  
  if (error) {
    return (
      <PageContainer>
        <ContentCard>
          <Box sx={{ textAlign: 'center' }}>
            <ErrorOutline sx={{ fontSize: 64, color: '#ff6b6b', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Access Error
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
            >
              Go to Homepage
            </Button>
          </Box>
        </ContentCard>
      </PageContainer>
    );
  }
  
  if (requiresPassword) {
    return (
      <PageContainer>
        <ContentCard>
          <Header>
            <Logo>RepSpheres Canvas</Logo>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Intelligence Report Access
            </Typography>
          </Header>
          
          <Box sx={{ textAlign: 'center' }}>
            <Lock sx={{ fontSize: 48, color: '#00FFC6', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 3 }}>
              This report is password protected
            </Typography>
            
            <form onSubmit={handlePasswordSubmit}>
              <PasswordForm>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.02)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' }
                    }
                  }}
                />
                <ActionButton type="submit" disabled={!password}>
                  Access Report
                </ActionButton>
              </PasswordForm>
            </form>
          </Box>
        </ContentCard>
      </PageContainer>
    );
  }
  
  if (!linkData) return null;
  
  const reportData = linkData.report_data;
  const config = MAGIC_LINK_CONFIGS[linkData.tier as SubscriptionTier];
  
  return (
    <PageContainer>
      <ContentCard>
        <Header>
          <Logo>RepSpheres Canvas</Logo>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
            Intelligence Report
          </Typography>
        </Header>
        
        {/* Custom Message */}
        {linkData.custom_message && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              bgcolor: 'rgba(0, 212, 255, 0.1)',
              color: '#00D4FF'
            }}
          >
            {linkData.custom_message}
          </Alert>
        )}
        
        {/* Report Header */}
        <ReportSection>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {linkData.doctor_name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip 
                  label={`${reportData.scanResult?.confidence || reportData.deepScanResults?.confidence || 85}% Confidence`}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(0, 255, 198, 0.2)',
                    color: '#00FFC6'
                  }}
                />
                <Chip 
                  label={reportData.scanResult?.researchQuality || 'Verified'}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(0, 212, 255, 0.2)',
                    color: '#00D4FF'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                Shared on {new Date(linkData.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          {/* Key Information */}
          <Box>
            {reportData.researchData?.practiceInfo && (
              <>
                <InfoRow>
                  <Business />
                  <Typography>{reportData.researchData.practiceInfo.name}</Typography>
                </InfoRow>
                <InfoRow>
                  <LocationOn />
                  <Typography>{reportData.researchData.practiceInfo.address || 'Location not specified'}</Typography>
                </InfoRow>
                <InfoRow>
                  <Phone />
                  <Typography>{reportData.researchData.practiceInfo.phone || 'Contact information available'}</Typography>
                </InfoRow>
                {reportData.deepScanResults?.website && (
                  <InfoRow>
                    <Visibility />
                    <Typography>
                      Website: <a href={reportData.deepScanResults.website} target="_blank" rel="noopener noreferrer" style={{ color: '#00D4FF' }}>
                        {reportData.deepScanResults.website}
                      </a>
                    </Typography>
                  </InfoRow>
                )}
              </>
            )}
          </Box>
        </ReportSection>
        
        {/* Key Insights */}
        {reportData.scanResult?.insights && reportData.scanResult.insights.length > 0 && (
          <ReportSection>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Key Insights
            </Typography>
            <Box component="ul" sx={{ pl: 2, color: 'rgba(255,255,255,0.8)' }}>
              {reportData.scanResult.insights.map((insight: string, index: number) => (
                <li key={index} style={{ marginBottom: 8 }}>{insight}</li>
              ))}
            </Box>
          </ReportSection>
        )}
        
        {/* Actions */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', mt: 4 }}>
          {linkData.allow_download && (
            <ActionButton
              onClick={handleDownloadPDF}
              disabled={downloading}
              startIcon={downloading ? <CircularProgress size={20} /> : <Download />}
            >
              {downloading ? 'Generating PDF...' : 'Download Full Report'}
            </ActionButton>
          )}
          
          {linkData.allow_comments && (
            <ActionButton
              variant="outlined"
              startIcon={<Comment />}
              sx={{ 
                background: 'transparent',
                color: '#00FFC6',
                borderColor: '#00FFC6'
              }}
            >
              Add Comment
            </ActionButton>
          )}
          
          <ActionButton
            onClick={handleSignUp}
            startIcon={<CheckCircle />}
            sx={{
              background: 'linear-gradient(135deg, #9F58FA, #4B96DC)',
            }}
          >
            Create Your Own Reports
          </ActionButton>
        </Box>
        
        {/* Footer */}
        <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
            Powered by RepSpheres Canvas • AI Sales Intelligence
          </Typography>
          {linkData.tier === 'free' && (
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.3)', mt: 1, display: 'block' }}>
              This report expires in {config.expiration}
            </Typography>
          )}
        </Box>
      </ContentCard>
    </PageContainer>
  );
}