/**
 * Share Intelligence Modal - Tier-based sharing with magic links
 */

import { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  TextField,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  Divider,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close,
  ContentCopy,
  Lock,
  Schedule,
  Analytics,
  Business,
  CheckCircle,
  Share,
  Security,
  Group,
  CloudDownload,
  Visibility
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { MAGIC_LINK_CONFIGS, type SubscriptionTier, type MagicLink } from '../types/magicLink';
import { generateMagicLink } from '../lib/magicLinkGenerator';

interface Props {
  open: boolean;
  onClose: () => void;
  reportData: any;
  doctorName: string;
  userTier: SubscriptionTier;
  userId: string;
}

// Premium styled components
const ModalContainer = styled(Box)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 600px;
  background: linear-gradient(135deg, #1a1a2e 0%, #0a0a0f 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(159, 88, 250, 0.1);
  overflow: hidden;
`;

const Header = styled(Box)`
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Content = styled(Box)`
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.02);
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
`;

const TierBadge = styled(Chip)`
  background: ${props => {
    const tier = props.label?.toString().toLowerCase();
    switch(tier) {
      case 'starter': return 'linear-gradient(135deg, #00D4FF, #00FFC6)';
      case 'professional': return 'linear-gradient(135deg, #9F58FA, #4B96DC)';
      case 'enterprise': return 'linear-gradient(135deg, #FFD700, #FFA500)';
      default: return 'rgba(255, 255, 255, 0.1)';
    }
  }};
  color: #fff;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FeatureBox = styled(Box)`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
`;

const ShareButton = styled(Button)`
  background: linear-gradient(135deg, #00FFC6, #00D4FF);
  color: #000;
  font-weight: 700;
  padding: 12px 32px;
  border-radius: 12px;
  text-transform: none;
  font-size: 16px;
  box-shadow: 0 8px 32px rgba(0, 255, 198, 0.3);
  
  &:hover {
    background: linear-gradient(135deg, #00FFE1, #00E5FF);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 255, 198, 0.4);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.3);
  }
`;

const LinkDisplay = styled(Box)`
  background: rgba(0, 255, 198, 0.1);
  border: 1px solid rgba(0, 255, 198, 0.3);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
`;

export default function ShareIntelligenceModal({
  open,
  onClose,
  reportData,
  doctorName,
  userTier,
  userId
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<MagicLink | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Share options state
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [domainRestriction, setDomainRestriction] = useState('');
  const [allowComments, setAllowComments] = useState(false);
  
  const config = MAGIC_LINK_CONFIGS[userTier];
  const features = config.features;
  
  const handleGenerateLink = async () => {
    setIsGenerating(true);
    
    try {
      const link = await generateMagicLink({
        reportData,
        doctorName,
        userId,
        tier: userTier,
        password: usePassword ? password : undefined,
        customMessage: customMessage || undefined,
        domainRestrictions: domainRestriction ? [domainRestriction] : undefined,
        allowDownload: features.includes('download'),
        allowComments: allowComments && features.includes('comments'),
        requires2FA: features.includes('2fa')
      });
      
      setGeneratedLink(link);
    } catch (error) {
      console.error('Error generating magic link:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyLink = () => {
    if (generatedLink) {
      const url = `${window.location.origin}/intel/${generatedLink.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleClose = () => {
    setGeneratedLink(null);
    setPassword('');
    setUsePassword(false);
    setCustomMessage('');
    setDomainRestriction('');
    onClose();
  };
  
  return (
    <Modal open={open} onClose={handleClose}>
      <ModalContainer>
        <Header>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
              Share Intelligence Report
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              {doctorName}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TierBadge label={userTier} size="small" />
            <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.6)' }}>
              <Close />
            </IconButton>
          </Box>
        </Header>
        
        <Content>
          {!generatedLink ? (
            <>
              {/* Tier Features */}
              <FeatureBox>
                <Typography variant="subtitle2" sx={{ color: '#00FFC6', mb: 1 }}>
                  Your {userTier} plan includes:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    icon={<Schedule />}
                    label={config.expiration}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                  />
                  {features.includes('download') && (
                    <Chip
                      icon={<CloudDownload />}
                      label="PDF Download"
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                    />
                  )}
                  {features.includes('analytics_basic') && (
                    <Chip
                      icon={<Analytics />}
                      label="Analytics"
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                    />
                  )}
                  {features.includes('white_label') && (
                    <Chip
                      icon={<Business />}
                      label="White Label"
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
                    />
                  )}
                </Box>
              </FeatureBox>
              
              {/* Share Options */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Sharing Options
                </Typography>
                
                {/* Password Protection */}
                {features.includes('password') && (
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={usePassword}
                          onChange={(e) => setUsePassword(e.target.checked)}
                          sx={{ color: '#00FFC6' }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Lock sx={{ fontSize: 18 }} />
                          <span>Password Protection</span>
                        </Box>
                      }
                    />
                    <AnimatePresence>
                      {usePassword && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <TextField
                            fullWidth
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mt: 1 }}
                            size="small"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Box>
                )}
                
                {/* Custom Message */}
                {features.includes('custom_message') && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Personal Message (Optional)"
                      placeholder="Add a message for the recipient..."
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          bgcolor: 'rgba(255,255,255,0.02)'
                        }
                      }}
                    />
                  </Box>
                )}
                
                {/* Domain Restriction */}
                {features.includes('domain_lock') && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Domain Restriction (Optional)"
                      placeholder="example.com"
                      value={domainRestriction}
                      onChange={(e) => setDomainRestriction(e.target.value)}
                      helperText="Only users with email addresses from this domain can access"
                      size="small"
                      InputProps={{
                        startAdornment: <Security sx={{ mr: 1, color: 'rgba(255,255,255,0.5)' }} />
                      }}
                    />
                  </Box>
                )}
                
                {/* Comments */}
                {features.includes('comments') && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={allowComments}
                        onChange={(e) => setAllowComments(e.target.checked)}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Group sx={{ fontSize: 18 }} />
                        <span>Allow Comments & Collaboration</span>
                      </Box>
                    }
                  />
                )}
              </Box>
              
              {/* Upgrade Prompt */}
              {userTier === 'free' && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 2,
                    bgcolor: 'rgba(0, 212, 255, 0.1)',
                    color: '#00D4FF'
                  }}
                >
                  Upgrade to Starter for 7-day links, downloads, and analytics!
                </Alert>
              )}
              
              {/* Generate Button */}
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <ShareButton
                  fullWidth
                  onClick={handleGenerateLink}
                  disabled={isGenerating || (usePassword && !password)}
                  startIcon={isGenerating ? null : <Share />}
                >
                  {isGenerating ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <span>Generating Secure Link</span>
                      <LinearProgress 
                        sx={{ width: 100, height: 2 }} 
                        color="inherit"
                      />
                    </Box>
                  ) : (
                    'Generate Share Link'
                  )}
                </ShareButton>
              </Box>
            </>
          ) : (
            /* Generated Link Display */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <CheckCircle sx={{ fontSize: 64, color: '#00FFC6', mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Share Link Created!
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 1 }}>
                  Your intelligence report is ready to share
                </Typography>
              </Box>
              
              <LinkDisplay>
                <Typography 
                  sx={{ 
                    flex: 1, 
                    fontFamily: 'monospace',
                    fontSize: 14,
                    wordBreak: 'break-all'
                  }}
                >
                  {window.location.origin}/intel/{generatedLink.id}
                </Typography>
                <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
                  <IconButton 
                    onClick={handleCopyLink}
                    sx={{ 
                      bgcolor: 'rgba(0,255,198,0.2)',
                      '&:hover': { bgcolor: 'rgba(0,255,198,0.3)' }
                    }}
                  >
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </LinkDisplay>
              
              {/* Link Details */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Expires
                  </Typography>
                  <Typography variant="body2">
                    {config.expiration}
                  </Typography>
                </Box>
                {usePassword && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Password
                    </Typography>
                    <Typography variant="body2">
                      Protected <Lock sx={{ fontSize: 14, ml: 0.5 }} />
                    </Typography>
                  </Box>
                )}
                {features.includes('analytics_basic') && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      Analytics
                    </Typography>
                    <Typography variant="body2">
                      Enabled <Visibility sx={{ fontSize: 14, ml: 0.5 }} />
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setGeneratedLink(null)}
                  sx={{ 
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.8)'
                  }}
                >
                  Create Another
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleClose}
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                  }}
                >
                  Done
                </Button>
              </Box>
            </motion.div>
          )}
        </Content>
      </ModalContainer>
    </Modal>
  );
}