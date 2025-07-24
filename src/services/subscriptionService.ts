/**
 * Centralized subscription service that integrates with osbackend
 * This replaces individual Stripe integrations with unified backend API
 */

const OSBACKEND_URL = 'https://osbackend-zl1h.onrender.com';

export interface UnifiedSubscription {
  tier: string;
  name: string;
  monthly: {
    amount: number;
    priceId: string;
  };
  annual: {
    amount: number;
    priceId: string;
  };
  features: {
    calls: number | 'unlimited';
    emails: number | 'unlimited';
    canvas_scans: number | 'unlimited';
    basic: string[];
    premium?: string[];
  };
}

export interface SubscriptionPlans {
  [key: string]: UnifiedSubscription;
}

class SubscriptionService {
  async getRepXPlans(): Promise<SubscriptionPlans> {
    try {
      const response = await fetch(`${OSBACKEND_URL}/api/stripe/repx/plans`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to fetch RepX plans');
    } catch (error) {
      console.error('Error fetching RepX plans:', error);
      throw new Error(`Failed to fetch RepX plans: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createCheckoutSession(tier: string, billingCycle: 'monthly' | 'annual', customerEmail?: string): Promise<string> {
    try {
      const response = await fetch(`${OSBACKEND_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          billingCycle,
          customerEmail: customerEmail || '',
          successUrl: `${window.location.origin}/subscription/success`,
          cancelUrl: `${window.location.origin}/subscription/cancel`,
        }),
      });

      const data = await response.json();
      
      if (data.success && data.data && data.data.url) {
        return data.data.url;
      }
      throw new Error('Failed to create checkout session');
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSubscriptionStatus(customerEmail: string) {
    try {
      const response = await fetch(`${OSBACKEND_URL}/api/stripe/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_email: customerEmail,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return null;
    }
  }

  async cancelSubscription(subscriptionId: string, customerEmail?: string) {
    try {
      const response = await fetch(`${OSBACKEND_URL}/api/stripe/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          customer_email: customerEmail,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error('Failed to cancel subscription');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map Canvas subscription tiers to RepX tiers for unified access
   * This allows Canvas users to access RepX features based on their Canvas tier
   */
  mapCanvasToRepXTier(canvasTier: string): string | null {
    const tierMapping = {
      'free': null, // No RepX access
      'explorer': 'repx1', // Basic professional calling
      'professional': 'repx2', // Professional + email integration
      'growth': 'repx3', // Full Canvas + territory command
      'enterprise': 'repx4', // Executive operations
      'elite': 'repx5', // Elite global access
    };

    return tierMapping[canvasTier as keyof typeof tierMapping] || null;
  }

  /**
   * Check if user has access to specific RepX features based on Canvas tier
   */
  hasRepXAccess(canvasTier: string): boolean {
    const repxTier = this.mapCanvasToRepXTier(canvasTier);
    return repxTier !== null;
  }

  /**
   * Get feature limits based on Canvas tier
   */
  async getFeatureLimits(canvasTier: string) {
    const repxTier = this.mapCanvasToRepXTier(canvasTier);
    
    if (!repxTier) {
      return {
        calls: 0,
        emails: 0,
        canvas_scans: canvasTier === 'free' ? 5 : 10, // Canvas-only limits
      };
    }

    try {
      const plans = await this.getRepXPlans();
      const plan = plans[repxTier];
      
      return {
        calls: plan.features.calls,
        emails: plan.features.emails,
        canvas_scans: plan.features.canvas_scans,
      };
    } catch (error) {
      console.error('Error fetching feature limits:', error);
      return {
        calls: 0,
        emails: 0,
        canvas_scans: 0,
      };
    }
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;