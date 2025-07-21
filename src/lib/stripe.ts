import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { supabase } from '../auth/supabase';
import { SUBSCRIPTION_TIERS } from '../auth/subscription.config';

// Initialize Stripe
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
let stripePromise: Promise<Stripe | null>;

if (stripePublishableKey) {
  stripePromise = loadStripe(stripePublishableKey);
} else {
  console.warn('Stripe publishable key not found');
  stripePromise = Promise.resolve(null);
}

export const stripe = stripePromise;

// RepX Enhancement Levels - Stripe price IDs for each tier
export const STRIPE_PRICE_IDS: Record<string, { monthly: string | null; annual: string | null }> = {
  free: {
    monthly: null, // Free tier
    annual: null
  },
  repx1: {
    monthly: import.meta.env.VITE_STRIPE_REPX1_MONTHLY_PRICE_ID || 'price_1RRutVGRiAPUZqWuDMSAqHsD',
    annual: import.meta.env.VITE_STRIPE_REPX1_ANNUAL_PRICE_ID || 'price_1RWMSCGRiAPUZqWu30j19b9G'
  },
  repx2: {
    monthly: import.meta.env.VITE_STRIPE_REPX2_MONTHLY_PRICE_ID || 'price_1RRushGRiAPUZqWuIvqueK7h',
    annual: import.meta.env.VITE_STRIPE_REPX2_ANNUAL_PRICE_ID || 'price_1RWMT4GRiAPUZqWuqiNhkZfw'
  },
  repx3: {
    monthly: import.meta.env.VITE_STRIPE_REPX3_MONTHLY_PRICE_ID || 'price_1RWMW3GRiAPUZqWuoTA0eLUC',
    annual: import.meta.env.VITE_STRIPE_REPX3_ANNUAL_PRICE_ID || 'price_1RRus5GRiAPUZqWup3jk1S8U'
  },
  repx4: {
    monthly: import.meta.env.VITE_STRIPE_REPX4_MONTHLY_PRICE_ID || 'price_1RRurNGRiAPUZqWuklICsE4P',
    annual: import.meta.env.VITE_STRIPE_REPX4_ANNUAL_PRICE_ID || 'price_1RWMWjGRiAPUZqWu6YBZY7o4'
  },
  repx5: {
    monthly: import.meta.env.VITE_STRIPE_REPX5_MONTHLY_PRICE_ID || 'price_1RRuqbGRiAPUZqWu3f91wnNx',
    annual: import.meta.env.VITE_STRIPE_REPX5_ANNUAL_PRICE_ID || 'price_1RWMXEGRiAPUZqWuPwcgrovN'
  }
};

// Create checkout session
export async function createCheckoutSession(
  tier: keyof typeof SUBSCRIPTION_TIERS,
  billingCycle: 'monthly' | 'annual' = 'monthly',
  _userId: string,
  _userEmail?: string
) {
  try {
    const tierPrices = STRIPE_PRICE_IDS[tier as keyof typeof STRIPE_PRICE_IDS];
    const priceId = tierPrices?.[billingCycle];
    if (!priceId) {
      // If annual price not set up, fall back to monthly
      if (billingCycle === 'annual' && tierPrices?.monthly) {
        throw new Error('Annual billing not available for this plan yet. Please select monthly billing.');
      }
      throw new Error('Invalid subscription tier or billing cycle');
    }

    // Call backend API to create checkout session
    const response = await fetch('https://osbackend-zl1h.onrender.com/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier,
        billingCycle,
        priceId,
        customerEmail: _userEmail,
        successUrl: `${window.location.origin}/dashboard?subscription=success`,
        cancelUrl: `${window.location.origin}/pricing?subscription=canceled`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    const result = await response.json();
    return result.data?.sessionId || result.sessionId;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

// Redirect to Stripe Checkout
export async function redirectToCheckout(
  tier: keyof typeof SUBSCRIPTION_TIERS,
  billingCycle: 'monthly' | 'annual' = 'monthly'
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const stripeInstance = await stripe;
  if (!stripeInstance) {
    throw new Error('Stripe not initialized');
  }

  const sessionId = await createCheckoutSession(
    tier,
    billingCycle,
    user.id,
    user.email!
  );

  const { error } = await stripeInstance.redirectToCheckout({ sessionId });
  
  if (error) {
    console.error('Stripe redirect error:', error);
    throw error;
  }
}

// Create customer portal session
export async function redirectToCustomerPortal() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's stripe customer ID from profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      throw new Error('No active subscription found');
    }

    // Call Netlify function to create portal session
    const response = await fetch('/.netlify/functions/stripe-create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerId: profile.stripe_customer_id,
        returnUrl: window.location.href
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error('Error redirecting to customer portal:', error);
    throw error;
  }
}

// Check subscription status
export async function checkSubscriptionStatus(userId: string) {
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription')
      .eq('user_id', userId)
      .single();

    if (!profile?.subscription) {
      return {
        isActive: false,
        tier: 'explorer' as const,
        status: 'inactive' as const
      };
    }

    const sub = profile.subscription;
    return {
      isActive: sub.status === 'active',
      tier: sub.tier,
      status: sub.status,
      currentPeriodEnd: sub.endDate,
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd || false
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return {
      isActive: false,
      tier: 'explorer' as const,
      status: 'error' as const
    };
  }
}

// Update subscription in database (called by webhook)
export async function updateSubscriptionFromWebhook(
  userId: string,
  stripeSubscription: any,
  stripeCustomerId: string
) {
  try {
    // Map Stripe price ID to tier
    let tier: keyof typeof SUBSCRIPTION_TIERS = 'explorer';
    let billingCycle: 'monthly' | 'annual' = 'monthly';
    
    // Find matching tier based on price ID
    for (const [tierName, prices] of Object.entries(STRIPE_PRICE_IDS)) {
      if (prices.monthly === stripeSubscription.items.data[0].price.id) {
        tier = tierName as keyof typeof SUBSCRIPTION_TIERS;
        billingCycle = 'monthly';
        break;
      } else if (prices.annual === stripeSubscription.items.data[0].price.id) {
        tier = tierName as keyof typeof SUBSCRIPTION_TIERS;
        billingCycle = 'annual';
        break;
      }
    }

    const tierConfig = SUBSCRIPTION_TIERS[tier];
    
    // Update user profile
    const { error } = await supabase
      .from('user_profiles')
      .update({
        subscription: {
          tier,
          status: stripeSubscription.status,
          credits: tierConfig.credits,
          creditsUsed: 0,
          magicLinksUsed: 0,
          magicLinksLimit: tierConfig.magicLinks,
          billingCycle,
          startDate: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
          endDate: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
          stripeCustomerId,
          stripeSubscriptionId: stripeSubscription.id,
          cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
        }
      })
      .eq('user_id', userId);

    if (error) throw error;

    // Log subscription change
    await supabase
      .from('subscription_history')
      .insert({
        user_id: userId,
        old_tier: 'explorer', // You might want to fetch the previous tier
        new_tier: tier,
        change_type: 'upgrade',
        stripe_event_id: stripeSubscription.id,
        metadata: {
          billingCycle,
          priceId: stripeSubscription.items.data[0].price.id
        }
      });

  } catch (error) {
    console.error('Error updating subscription from webhook:', error);
    throw error;
  }
}