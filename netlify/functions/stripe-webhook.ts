import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // You'll need to add this to your .env
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sig = event.headers['stripe-signature'];
  if (!sig) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing stripe signature' }),
    };
  }

  try {
    // Verify webhook signature
    const webhookEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle different event types
    switch (webhookEvent.type) {
      case 'checkout.session.completed': {
        const session = webhookEvent.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = webhookEvent.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = webhookEvent.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = webhookEvent.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = webhookEvent.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${webhookEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      }),
    };
  }
};

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  if (!userId || !session.subscription) return;

  // Retrieve the subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  // Get the price ID from the subscription
  const priceId = subscription.items.data[0]?.price.id;
  const customerId = subscription.customer as string;

  // Determine the plan based on price ID
  const plan = getPlanFromPriceId(priceId);

  // Update user profile with subscription info
  const { error } = await supabase
    .from('user_profiles')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription: {
        plan: plan.name,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        credits_remaining: plan.credits,
        credits_used: 0,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
  }

  // Record in subscription history
  await supabase.from('subscription_history').insert({
    user_id: userId,
    action: 'created',
    plan: plan.name,
    stripe_subscription_id: subscription.id,
    metadata: {
      price_id: priceId,
      amount: subscription.items.data[0]?.price.unit_amount,
      currency: subscription.items.data[0]?.price.currency,
    },
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!profile) return;

  const priceId = subscription.items.data[0]?.price.id;
  const plan = getPlanFromPriceId(priceId);

  await supabase
    .from('user_profiles')
    .update({
      subscription_status: subscription.status,
      subscription: {
        plan: plan.name,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        credits_remaining: plan.credits,
        credits_used: 0,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  // Record in subscription history
  await supabase.from('subscription_history').insert({
    user_id: profile.id,
    action: 'updated',
    plan: plan.name,
    stripe_subscription_id: subscription.id,
    metadata: {
      status: subscription.status,
    },
  });
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!profile) return;

  await supabase
    .from('user_profiles')
    .update({
      subscription_status: 'canceled',
      subscription: {
        plan: 'explorer',
        status: 'canceled',
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: true,
        credits_remaining: 0,
        credits_used: 0,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id);

  // Record cancellation
  await supabase.from('subscription_history').insert({
    user_id: profile.id,
    action: 'canceled',
    plan: 'explorer',
    stripe_subscription_id: subscription.id,
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  // You can add additional logic here for successful payments
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  // You can add logic here to handle failed payments
  // e.g., send notification emails, update user status, etc.
}

function getPlanFromPriceId(priceId: string): { name: string; credits: number } {
  // Map price IDs to plans - aligned with subscription.config.ts
  const priceToPlan: Record<string, { name: string; credits: number }> = {
    [process.env.STRIPE_PRICE_EXPLORER_MONTHLY!]: { name: 'explorer', credits: 50 },
    [process.env.STRIPE_PRICE_EXPLORER_ANNUAL!]: { name: 'explorer', credits: 50 },
    [process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY!]: { name: 'professional', credits: 200 },
    [process.env.STRIPE_PRICE_PROFESSIONAL_ANNUAL!]: { name: 'professional', credits: 200 },
    [process.env.STRIPE_PRICE_GROWTH_MONTHLY!]: { name: 'growth', credits: 500 },
    [process.env.STRIPE_PRICE_GROWTH_ANNUAL!]: { name: 'growth', credits: 500 },
    [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!]: { name: 'enterprise', credits: 1500 },
    [process.env.STRIPE_PRICE_ENTERPRISE_ANNUAL!]: { name: 'enterprise', credits: 1500 },
    [process.env.STRIPE_PRICE_ELITE_MONTHLY!]: { name: 'elite', credits: -1 }, // unlimited
    [process.env.STRIPE_PRICE_ELITE_ANNUAL!]: { name: 'elite', credits: -1 },
  };

  return priceToPlan[priceId] || { name: 'free', credits: 5 };
}