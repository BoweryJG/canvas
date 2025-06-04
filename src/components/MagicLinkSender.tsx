import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../auth/useSubscription';
import { generateMagicLink, isEmailTooLong, EmailCampaign } from '../lib/magicLinks';
import { useAuth } from '../auth';

interface MagicLinkSenderProps {
  campaign: EmailCampaign;
  onSent?: () => void;
  onUpgradeClick?: () => void;
}

export const MagicLinkSender: React.FC<MagicLinkSenderProps> = ({
  campaign,
  onSent,
  onUpgradeClick
}) => {
  const { user } = useAuth();
  const { 
    canSendMagicLink, 
    magicLinksRemaining, 
    trackUsage,
    tier,
    isFreeTier 
  } = useSubscription();
  
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  
  const handleSend = async () => {
    const { allowed, reason } = canSendMagicLink();
    
    if (!allowed) {
      if (isFreeTier) {
        alert('Magic Links are available in paid plans. Upgrade to Closer to get 10 magic links per month!');
        onUpgradeClick?.();
      } else {
        alert(reason || 'Cannot send magic link');
      }
      return;
    }
    
    setSending(true);
    
    try {
      // Check if email is too long
      if (isEmailTooLong(campaign)) {
        // For now, just truncate (later we'll implement temp page)
        campaign.body = campaign.body.substring(0, 1500) + '...';
      }
      
      // Generate magic link with tracking
      const magicLink = generateMagicLink(campaign, {
        trackingId: campaign.id,
        provider: detectUserEmailProvider(user?.email)
      });
      
      // Open in new tab
      window.open(magicLink, '_blank');
      
      // Track usage
      await trackUsage('magic_link', {
        campaign_id: campaign.id,
        recipient: campaign.to
      });
      
      setSent(true);
      onSent?.();
      
      // Reset after delay
      setTimeout(() => {
        setSending(false);
        setSent(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error sending magic link:', error);
      setSending(false);
    }
  };
  
  const detectUserEmailProvider = (email?: string): any => {
    if (!email) return 'default';
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (domain?.includes('gmail')) return 'gmail';
    if (domain?.includes('outlook') || domain?.includes('hotmail')) return 'outlook';
    return 'default';
  };
  
  if (isFreeTier) {
    return (
      <div className="magic-link-upgrade">
        <button 
          onClick={onUpgradeClick}
          className="upgrade-btn"
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔒 Unlock Magic Links
          <span style={{ fontSize: '14px', opacity: 0.9 }}>
            (Closer Plan)
          </span>
        </button>
      </div>
    );
  }
  
  return (
    <div className="magic-link-sender">
      <AnimatePresence mode="wait">
        {!sent ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                padding: '14px 28px',
                background: sending 
                  ? '#6B7280'
                  : 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0, 255, 136, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!sending) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 255, 136, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 255, 136, 0.3)';
              }}
            >
              {sending ? (
                <>
                  <span className="loading-spinner" 
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTopColor: '#000',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }}
                  />
                  Opening your email...
                </>
              ) : (
                <>
                  ✨ Send from MY Email
                  {magicLinksRemaining > 0 && magicLinksRemaining !== Infinity && (
                    <span style={{
                      fontSize: '12px',
                      opacity: 0.8,
                      background: 'rgba(0,0,0,0.2)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {magicLinksRemaining} left
                    </span>
                  )}
                </>
              )}
            </button>
            
            <p style={{
              marginTop: '8px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center'
            }}>
              Opens in your email client • Sends from your address
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              padding: '20px',
              background: 'rgba(0, 255, 136, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#00ff88' }}>
              Email opened in your client!
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '5px' }}>
              Just hit send when you're ready
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};