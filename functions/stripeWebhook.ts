import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import Stripe from 'npm:stripe@14.11.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

Deno.serve(async (req) => {
    try {
        const body = await req.text();
        const signature = req.headers.get('stripe-signature');

        // Initialize base44 first for authentication
        const base44 = createClientFromRequest(req);
        
        // Verify webhook signature
        let event;
        try {
            event = await stripe.webhooks.constructEventAsync(
                body,
                signature,
                webhookSecret
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err.message);
            return Response.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Handle different event types
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const subscription = await stripe.subscriptions.retrieve(session.subscription);
                
                // Create or update subscription in database
                await base44.asServiceRole.entities.Subscription.create({
                    user_email: session.metadata.user_email,
                    plan: session.metadata.plan,
                    billing_cycle: session.metadata.billing_cycle || 'monthly',
                    status: 'active',
                    stripe_customer_id: session.customer,
                    stripe_subscription_id: session.subscription,
                    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    seats: 1
                });
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                
                // Update subscription status
                const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (existingSubs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
                        status: subscription.status,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end
                    });
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                
                // Mark subscription as canceled
                const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_subscription_id: subscription.id
                });

                if (existingSubs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
                        status: 'canceled'
                    });
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object;
                
                // Mark subscription as past_due
                const existingSubs = await base44.asServiceRole.entities.Subscription.filter({
                    stripe_customer_id: invoice.customer
                });

                if (existingSubs.length > 0) {
                    await base44.asServiceRole.entities.Subscription.update(existingSubs[0].id, {
                        status: 'past_due'
                    });
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return Response.json({ received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});