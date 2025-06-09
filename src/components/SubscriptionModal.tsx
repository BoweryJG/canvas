import React, { useState } from 'react';
import { Modal, Box, Typography, Button, CircularProgress } from '@mui/material';
import { CheckCircle, Star, TrendingUp } from '@mui/icons-material';
import { loadStripe } from '@stripe/stripe-js';
import { SUBSCRIPTION_TIERS } from '../auth/subscription.config';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  currentPlan?: string;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  onClose,
  feature,
  currentPlan = 'none'
}) => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    setLoading(tierId);
    
    try {
      // Get Stripe instance
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tierId,
          successUrl: window.location.href,
          cancelUrl: window.location.href
        })
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe redirect error:', error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Unable to start subscription. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const recommendedTier = feature.includes('email') || feature.includes('sms') 
    ? 'professional' 
    : 'starter';

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box sx={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%)',
        border: '2px solid #00ffc6',
        borderRadius: '20px',
        p: 4,
        maxWidth: 900,
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <Typography variant="h4" sx={{ 
          color: '#fff', 
          mb: 2, 
          textAlign: 'center',
          fontWeight: 700 
        }}>
          Upgrade to Unlock {feature}
        </Typography>

        <Typography sx={{ 
          color: 'rgba(255,255,255,0.7)', 
          mb: 4, 
          textAlign: 'center' 
        }}>
          Choose a plan to access advanced features and scale your outreach
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 3 
        }}>
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
            const isRecommended = key === recommendedTier;
            const isCurrentPlan = key === currentPlan;
            
            return (
              <Box
                key={key}
                sx={{
                  background: isRecommended 
                    ? 'linear-gradient(135deg, rgba(0,255,198,0.1) 0%, rgba(123,66,246,0.1) 100%)'
                    : 'rgba(255,255,255,0.05)',
                  border: isRecommended 
                    ? '2px solid #00ffc6' 
                    : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  p: 3,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 30px rgba(0,255,198,0.2)'
                  }
                }}
              >
                {isRecommended && (
                  <Box sx={{
                    position: 'absolute',
                    top: -12,
                    right: 20,
                    background: 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)',
                    color: '#000',
                    px: 2,
                    py: 0.5,
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <Star sx={{ fontSize: '1rem' }} />
                    RECOMMENDED
                  </Box>
                )}

                <Typography variant="h5" sx={{ 
                  color: '#fff', 
                  mb: 1,
                  fontWeight: 700 
                }}>
                  {tier.name}
                </Typography>

                <Typography variant="h3" sx={{ 
                  color: '#00ffc6', 
                  mb: 2,
                  fontWeight: 700 
                }}>
                  ${tier.price.monthly}
                  <Typography component="span" sx={{ 
                    fontSize: '1rem', 
                    color: 'rgba(255,255,255,0.5)' 
                  }}>
                    /mo
                  </Typography>
                </Typography>

                <Box sx={{ mb: 3 }}>
                  {tier.features.slice(0, 4).map((feature, idx) => (
                    <Box key={idx} sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1, 
                      mb: 1 
                    }}>
                      <CheckCircle sx={{ 
                        color: '#00ffc6', 
                        fontSize: '1rem' 
                      }} />
                      <Typography sx={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        fontSize: '0.9rem' 
                      }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={isCurrentPlan || loading !== null}
                  onClick={() => handleSubscribe(key)}
                  sx={{
                    background: isRecommended
                      ? 'linear-gradient(135deg, #00ffc6 0%, #7B42F6 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: isRecommended ? '#000' : '#fff',
                    fontWeight: 700,
                    py: 1.5,
                    '&:hover': {
                      background: isRecommended
                        ? 'linear-gradient(135deg, #00ffc6 20%, #7B42F6 100%)'
                        : 'rgba(255,255,255,0.2)'
                    }
                  }}
                >
                  {loading === key ? (
                    <CircularProgress size={20} />
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    <>
                      <TrendingUp sx={{ mr: 1 }} />
                      Start {tier.name}
                    </>
                  )}
                </Button>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ 
          mt: 4, 
          textAlign: 'center',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          pt: 3
        }}>
          <Typography sx={{ 
            color: 'rgba(255,255,255,0.5)', 
            fontSize: '0.9rem',
            mb: 2
          }}>
            All plans include 14-day money-back guarantee • Cancel anytime
          </Typography>
          
          <Button
            onClick={onClose}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#fff'
              }
            }}
          >
            Maybe Later
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};