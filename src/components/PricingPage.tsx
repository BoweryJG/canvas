import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SUBSCRIPTION_TIERS } from '../auth/subscription.config';
import { useAuth } from '../auth';
import { redirectToCheckout, redirectToCustomerPortal } from '../lib/stripe';

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const currentTier = user?.subscription?.tier || 'explorer';
  const [loading, setLoading] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const handleSelectPlan = async (tierName: string) => {
    if (tierName === 'explorer') {
      alert('Explorer is our free tier - no payment required!');
      return;
    }

    if (!user) {
      alert('Please sign in to subscribe to a plan');
      return;
    }

    setLoading(tierName);
    try {
      await redirectToCheckout(tierName as any, billingCycle);
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Failed to redirect to checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user?.subscription?.stripeCustomerId) {
      alert('No active subscription found');
      return;
    }

    setLoading('portal');
    try {
      await redirectToCustomerPortal();
    } catch (error) {
      console.error('Error redirecting to portal:', error);
      alert('Failed to redirect to customer portal. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a15 100%)',
      padding: '40px 20px',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '60px' }}
        >
          <h1 style={{
            fontSize: '48px',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Choose Your RepSpheres Plan
          </h1>
          <p style={{ fontSize: '20px', opacity: 0.8, marginBottom: '30px' }}>
            Unlock the full power of AI-driven medical sales intelligence
          </p>
          
          {/* Billing Cycle Toggle */}
          <div style={{
            display: 'inline-flex',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50px',
            padding: '4px',
            gap: '4px'
          }}>
            <button
              onClick={() => setBillingCycle('monthly')}
              style={{
                padding: '10px 24px',
                background: billingCycle === 'monthly' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                color: billingCycle === 'monthly' ? '#00ff88' : '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 500
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              style={{
                padding: '10px 24px',
                background: billingCycle === 'annual' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
                color: billingCycle === 'annual' ? '#00ff88' : '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 500
              }}
            >
              Annual (Save ~17%)
            </button>
          </div>

          {/* Manage Subscription Button for existing customers */}
          {user?.subscription?.stripeCustomerId && (
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={handleManageSubscription}
                disabled={loading === 'portal'}
                style={{
                  padding: '10px 24px',
                  background: 'transparent',
                  color: '#00ff88',
                  border: '1px solid #00ff88',
                  borderRadius: '8px',
                  cursor: loading === 'portal' ? 'wait' : 'pointer',
                  fontSize: '14px',
                  opacity: loading === 'portal' ? 0.7 : 1
                }}
              >
                {loading === 'portal' ? 'Loading...' : 'Manage Subscription'}
              </button>
            </div>
          )}
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: currentTier === key 
                  ? 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 212, 255, 0.1) 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: currentTier === key 
                  ? '2px solid rgba(0, 255, 136, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '30px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {tier.name === 'dominator' && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '-30px',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)',
                  color: '#fff',
                  padding: '5px 40px',
                  transform: 'rotate(45deg)',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  POPULAR
                </div>
              )}

              <h3 style={{
                fontSize: '28px',
                marginBottom: '10px',
                textTransform: 'capitalize'
              }}>
                {tier.displayName}
              </h3>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '48px', fontWeight: 700 }}>
                  ${billingCycle === 'annual' && tier.price.monthly > 0 
                    ? tier.price.annual 
                    : tier.price.monthly}
                </span>
                <span style={{ opacity: 0.7 }}>
                  {tier.price.monthly === 0 ? '' : billingCycle === 'annual' ? '/year' : '/month'}
                </span>
                {billingCycle === 'annual' && tier.price.monthly > 0 && (
                  <div style={{ fontSize: '14px', color: '#00ff88', marginTop: '5px' }}>
                    Save ${(tier.price.monthly * 12) - tier.price.annual} per year
                  </div>
                )}
              </div>

              <div style={{
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>{tier.credits === -1 ? 'Unlimited' : tier.credits}</strong> AI Credits
                </div>
                <div>
                  <strong>{tier.magicLinks === -1 ? 'Unlimited' : tier.magicLinks}</strong> Magic Links
                </div>
              </div>

              <ul style={{
                listStyle: 'none',
                padding: 0,
                marginBottom: '30px'
              }}>
                {tier.features.map((feature, i) => (
                  <li key={i} style={{
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}>
                    <span style={{ color: '#00ff88' }}>✓</span>
                    <span style={{ fontSize: '14px', opacity: 0.9 }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(key)}
                disabled={currentTier === key || loading === key}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: currentTier === key
                    ? 'rgba(255, 255, 255, 0.1)'
                    : loading === key
                    ? 'rgba(102, 126, 234, 0.5)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: currentTier === key || loading === key ? 'default' : 'pointer',
                  opacity: currentTier === key || loading === key ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {currentTier === key 
                  ? 'Current Plan' 
                  : loading === key 
                  ? 'Loading...' 
                  : 'Select Plan'}
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            padding: '40px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px'
          }}
        >
          <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>
            Need a Custom Solution?
          </h3>
          <p style={{ marginBottom: '20px', opacity: 0.8 }}>
            Contact us for custom enterprise plans, team pricing, and white-label solutions
          </p>
          <button
            onClick={() => window.location.href = 'mailto:sales@repspheres.com'}
            style={{
              padding: '14px 28px',
              background: 'transparent',
              color: '#fff',
              border: '2px solid rgba(0, 255, 136, 0.5)',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Contact Sales
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;