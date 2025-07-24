import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../auth/useSubscription';
import { generateMagicLink, type EmailCampaign } from '../lib/magicLinks';
import { useAuth } from '../auth';
import { supabase } from '../auth/supabase';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import BusinessIcon from '@mui/icons-material/Business';

interface OutreachCampaign extends EmailCampaign {
  phone?: string;
  phoneIntl?: string;
  linkedinId?: string;
  linkedinUrl?: string;
  smsMessage?: string;
  whatsappMessage?: string;
  linkedinMessage?: string;
}

interface MultiChannelMagicLinkProps {
  campaign: OutreachCampaign;
  doctor: {
    name: string;
    email?: string;
    phone?: string;
    linkedinId?: string;
    linkedinUrl?: string;
  };
  onSent?: (channel: string) => void;
  onUpgradeClick?: () => void;
}

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  generateLink: (campaign: OutreachCampaign, doctor: { name: string; email?: string; phone?: string; linkedinId?: string; linkedinUrl?: string; }) => string;
  available: boolean;
  requiresCopy?: boolean;
}

export const MultiChannelMagicLink: React.FC<MultiChannelMagicLinkProps> = ({
  campaign,
  doctor,
  onSent,
  onUpgradeClick
}) => {
  const { user } = useAuth();
  const { 
    canSendMagicLink, 
    magicLinksRemaining, 
    trackUsage,
    isFreeTier 
  } = useSubscription();
  
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [userBccEmail, setUserBccEmail] = useState<string | null>(null);

  const loadUserBccEmail = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('user_settings')
        .select('crm_bcc_email')
        .eq('user_id', user!.id)
        .single();
      
      if (data?.crm_bcc_email) {
        setUserBccEmail(data.crm_bcc_email);
      }
    } catch (error) {
      console.error('Error loading BCC email:', error);
    }
  }, [user]);

  // Load user's CRM BCC email
  useEffect(() => {
    if (user) {
      loadUserBccEmail();
    }
  }, [user, loadUserBccEmail]);

  // Format phone for international if needed
  const formatPhoneIntl = (phone: string) => {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Add US country code if not present
    if (digits.length === 10) {
      return `1${digits}`;
    }
    return digits;
  };

  // Define available channels
  const channels: Channel[] = [
    {
      id: 'email',
      name: 'Email',
      icon: <EmailIcon />,
      color: '#00ff88',
      generateLink: (campaign) => {
        // Add user's CRM BCC email if configured
        const campaignWithBcc = userBccEmail ? {
          ...campaign,
          bcc: userBccEmail
        } : campaign;
        
        return generateMagicLink(campaignWithBcc, {
          trackingId: campaign.id,
          provider: detectUserEmailProvider(user?.email)
        });
      },
      available: !!doctor.email
    },
    {
      id: 'sms',
      name: 'Text',
      icon: <SmsIcon />,
      color: '#00d4ff',
      generateLink: (_, doctor) => {
        const message = campaign.smsMessage || `Hi Dr. ${doctor.name}, ${campaign.body.substring(0, 160)}...`;
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        return isIOS 
          ? `sms:${doctor.phone}&body=${encodeURIComponent(message)}`
          : `sms:${doctor.phone}?body=${encodeURIComponent(message)}`;
      },
      available: !!doctor.phone
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: '#25D366',
      generateLink: (_, doctor) => {
        const phoneIntl = formatPhoneIntl(doctor.phone || '');
        const message = campaign.whatsappMessage || campaign.body.substring(0, 500);
        return `https://wa.me/${phoneIntl}?text=${encodeURIComponent(message)}`;
      },
      available: !!doctor.phone
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      color: '#0077B5',
      generateLink: (_, doctor) => {
        // LinkedIn doesn't support pre-filled messages via URL
        // Best we can do is open their profile or connection page
        if (doctor.linkedinUrl) {
          return doctor.linkedinUrl;
        }
        if (doctor.linkedinId) {
          return `https://www.linkedin.com/in/${doctor.linkedinId}`;
        }
        // Search for them
        return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(doctor.name)}`;
      },
      available: true, // Always available as we can search
      requiresCopy: true // User needs to copy message separately
    }
  ];

  const detectUserEmailProvider = (email?: string): 'gmail' | 'outlook' | 'default' => {
    if (!email) return 'default';
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain?.includes('gmail')) return 'gmail';
    if (domain?.includes('outlook') || domain?.includes('hotmail')) return 'outlook';
    return 'default';
  };

  const handleChannelClick = async (channel: Channel) => {
    const { allowed, reason } = canSendMagicLink();
    
    if (!allowed && channel.id === 'email') {
      if (isFreeTier) {
        alert('Magic Links are available in paid plans. Upgrade to get access!');
        onUpgradeClick?.();
      } else {
        alert(reason || 'Cannot send magic link');
      }
      return;
    }
    
    setSending(channel.id);
    
    try {
      // Generate the appropriate link
      const link = channel.generateLink(campaign, doctor);
      
      // Open in new tab
      window.open(link, '_blank');
      
      // Track usage (only for email for now)
      if (channel.id === 'email') {
        await trackUsage('magic_link', {
          campaign_id: campaign.id,
          recipient: campaign.to,
          channel: channel.id
        });
      }
      
      setSent(channel.id);
      onSent?.(channel.id);
      
      // Reset after delay
      setTimeout(() => {
        setSending(null);
        setSent(null);
      }, 3000);
      
    } catch (error) {
      console.error(`Error sending ${channel.name} link:`, error);
      setSending(null);
    }
  };

  const handleCopyMessage = (channel: Channel) => {
    let message = '';
    
    switch (channel.id) {
      case 'linkedin':
        message = campaign.linkedinMessage || campaign.body;
        break;
      case 'sms':
        message = campaign.smsMessage || `Hi Dr. ${doctor.name}, ${campaign.body.substring(0, 160)}...`;
        break;
      case 'whatsapp':
        message = campaign.whatsappMessage || campaign.body;
        break;
      default:
        message = campaign.body;
    }
    
    navigator.clipboard.writeText(message);
    setCopied(channel.id);
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  if (isFreeTier && channels.every(c => c.id === 'email')) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Button 
          onClick={onUpgradeClick}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
            py: 1.5,
            px: 3,
            borderRadius: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}
        >
          🔒 Unlock Multi-Channel Outreach
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ my: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 1
        }}>
          <h3 style={{ margin: 0, color: 'rgba(255, 255, 255, 0.9)' }}>
            Send Personalized Outreach
          </h3>
          {magicLinksRemaining > 0 && magicLinksRemaining !== Infinity && (
            <Box sx={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              background: 'rgba(255, 255, 255, 0.1)',
              px: 2,
              py: 0.5,
              borderRadius: 2
            }}>
              {magicLinksRemaining} sends remaining
            </Box>
          )}
        </Box>
        
        {userBccEmail && (
          <Tooltip title={`Emails will be BCC'd to: ${userBccEmail}`} arrow>
            <Chip
              icon={<BusinessIcon />}
              label="CRM Connected"
              size="small"
              sx={{
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderColor: '#00ff88',
                border: '1px solid',
                color: '#00ff88',
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-icon': {
                  color: '#00ff88',
                  fontSize: 16
                }
              }}
            />
          </Tooltip>
        )}
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 2 
      }}>
        {channels.map((channel) => {
          const isSent = sent === channel.id;
          const isSending = sending === channel.id;
          const isCopied = copied === channel.id;
          
          return (
            <Box key={channel.id} sx={{ position: 'relative' }}>
              <Tooltip 
                title={!channel.available ? `No ${channel.name} available for this contact` : ''}
                arrow
              >
                <span>
                  <Button
                    onClick={() => handleChannelClick(channel)}
                    disabled={!channel.available || isSending}
                    fullWidth
                    sx={{
                      py: 2,
                      px: 1.5,
                      background: isSent 
                        ? 'rgba(0, 255, 136, 0.2)'
                        : `linear-gradient(135deg, ${channel.color}20 0%, ${channel.color}40 100%)`,
                      color: channel.available ? '#fff' : 'rgba(255, 255, 255, 0.3)',
                      border: `1px solid ${channel.color}40`,
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.3s ease',
                      cursor: channel.available ? 'pointer' : 'not-allowed',
                      '&:hover': channel.available ? {
                        background: `linear-gradient(135deg, ${channel.color}30 0%, ${channel.color}50 100%)`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 20px ${channel.color}30`
                      } : {},
                      '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed'
                      }
                    }}
                  >
                    <AnimatePresence mode="wait">
                      {isSent ? (
                        <motion.div
                          key="sent"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 28, color: '#00ff88' }} />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="icon"
                          initial={{ scale: 1 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          style={{ color: channel.color }}
                        >
                          <Box sx={{ fontSize: 28 }}>
                            {channel.icon}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <Box sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      {isSending ? 'Opening...' : isSent ? 'Opened!' : channel.name}
                    </Box>
                  </Button>
                </span>
              </Tooltip>

              {channel.requiresCopy && channel.available && (
                <Tooltip title="Copy message to clipboard" arrow>
                  <Button
                    size="small"
                    onClick={() => handleCopyMessage(channel)}
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      minWidth: 32,
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: isCopied ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      p: 0,
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                  >
                    {isCopied ? (
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#000' }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 16, color: '#fff' }} />
                    )}
                  </Button>
                </Tooltip>
              )}
            </Box>
          );
        })}
      </Box>

      {channels.some(c => c.requiresCopy) && (
        <Alert 
          severity="info" 
          sx={{ 
            mt: 2, 
            background: 'rgba(0, 123, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.8)',
            '& .MuiAlert-icon': {
              color: '#00d4ff'
            }
          }}
        >
          💡 For LinkedIn, click the copy button to grab your message after opening the profile
        </Alert>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
};