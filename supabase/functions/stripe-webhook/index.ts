import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

  // ── Verify Stripe signature ────────────────────────────────────────────────
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Missing signature: ${(err as Error).message}`, { status: 400 });
  }

  // ── Supabase admin client (bypasses RLS) ───────────────────────────────────
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // ── Idempotency: skip already-processed events ────────────────────────────
  const { data: existing } = await supabase
    .from('stripe_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single();

  if (existing) {
    return new Response(JSON.stringify({ received: true, skipped: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await supabase.from('stripe_events').insert({ stripe_event_id: event.id, type: event.type });

  // ── Handle events ──────────────────────────────────────────────────────────
  try {
    switch (event.type) {

      // Checkout completed → record customer mapping + set real subscription status
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;

        if (!userId) {
          console.error('checkout.session.completed: no client_reference_id on session', session.id);
          break;
        }

        // Fetch the actual subscription to get the real status (e.g. 'trialing', 'active')
        let subscriptionStatus = 'active';
        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          subscriptionStatus = sub.status;
        }

        // Map this Supabase user to their Stripe customer ID
        await supabase.from('stripe_customers').upsert({
          id: userId,
          stripe_customer_id: customerId,
        });

        await supabase
          .from('users')
          .update({ subscription_status: subscriptionStatus })
          .eq('id', userId);

        console.log(`Subscription ${subscriptionStatus} for user ${userId}`);
        break;
      }

      // Subscription status changed (trial ends, renewal, upgrade, past_due, etc.)
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (customerData) {
          await supabase
            .from('users')
            .update({ subscription_status: sub.status })
            .eq('id', customerData.id);
          console.log(`Updated subscription status to ${sub.status} for user ${customerData.id}`);
        } else {
          console.error('customer.subscription.updated: no user found for customer', customerId);
        }
        break;
      }

      // Subscription cancelled / expired
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (customerData) {
          await supabase
            .from('users')
            .update({ subscription_status: 'cancelled' })
            .eq('id', customerData.id);
          console.log(`Cancelled subscription for user ${customerData.id}`);
        }
        break;
      }

      // Payment failed
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: customerData } = await supabase
          .from('stripe_customers')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (customerData) {
          await supabase
            .from('users')
            .update({ subscription_status: 'past_due' })
            .eq('id', customerData.id);
          console.log(`Marked past_due for user ${customerData.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error handling event ${event.type}:`, err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
