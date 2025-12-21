import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

Deno.serve(async (req) => {
  try {
    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (!stripeSecretKey) {
      return Response.json({ 
        error: 'Stripe not configured',
        message: 'Please update your STRIPE_SECRET_KEY in Dashboard → Settings → Environment Variables'
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    // Authenticate user
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request
    const { priceId, plan, billingCycle = 'monthly' } = await req.json();
    
    if (!priceId || !plan) {
      return Response.json({ 
        error: 'Missing required fields: priceId and plan' 
      }, { status: 400 });
    }

    // Get or create Stripe customer
    let customer;
    const existingSubscriptions = await base44.asServiceRole.entities.Subscription.filter({
      user_email: user.email
    });

    if (existingSubscriptions.length > 0 && existingSubscriptions[0].stripe_customer_id) {
      try {
        customer = await stripe.customers.retrieve(existingSubscriptions[0].stripe_customer_id);
      } catch {
        customer = null;
      }
    }

    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || user.email,
        metadata: {
          user_id: user.id,
          user_email: user.email
        }
      });
    }

    // Get origin for redirect URLs
    const origin = (req.headers.get('origin') || req.headers.get('referer') || 'https://app.base44.com').replace(/\/$/, '');

    // Verify price exists
    await stripe.prices.retrieve(priceId);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/#/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#/pricing`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        plan: plan,
        billing_cycle: billingCycle
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          user_email: user.email,
          plan: plan
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto'
    });

    return Response.json({ 
      url: session.url,
      sessionId: session.id 
    });

  } catch (error) {
    console.error('Checkout error:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeAuthenticationError') {
      return Response.json({ 
        error: 'Invalid Stripe API key',
        message: 'Please update your STRIPE_SECRET_KEY in Dashboard → Settings → Environment Variables with a valid key from https://dashboard.stripe.com/apikeys'
      }, { status: 500 });
    }
    
    return Response.json({ 
      error: error.message || 'Checkout failed'
    }, { status: 500 });
  }
});