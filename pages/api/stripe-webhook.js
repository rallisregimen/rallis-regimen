import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise(function(resolve, reject) {
    var chunks = [];
    req.on('data', function(chunk) { chunks.push(chunk); });
    req.on('end', function() { resolve(Buffer.concat(chunks)); });
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  var rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    return res.status(400).json({ error: 'Failed to read body' });
  }

  var sig = req.headers['stripe-signature'];
  var webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  var event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  var supabase = getSupabase();

  try {
    switch (event.type) {

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        var sub = event.data.object;
        var customerId = sub.customer;
        var status = sub.status; // 'active', 'trialing', 'past_due', 'canceled', 'unpaid'
        await supabase.from('profiles')
          .update({
            subscription_status: status,
            subscription_tier: sub.items && sub.items.data[0] ? sub.items.data[0].price.id : 'monthly',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);
        console.log('Subscription updated:', customerId, status);
        break;
      }

      case 'customer.subscription.deleted': {
        var sub = event.data.object;
        var customerId = sub.customer;
        await supabase.from('profiles')
          .update({
            subscription_status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);
        console.log('Subscription canceled:', customerId);
        break;
      }

      case 'invoice.payment_failed': {
        var invoice = event.data.object;
        var customerId = invoice.customer;
        await supabase.from('profiles')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId);
        console.log('Payment failed:', customerId);
        break;
      }

      case 'invoice.payment_succeeded': {
        var invoice = event.data.object;
        var customerId = invoice.customer;
        // Restore to active if previously past_due
        await supabase.from('profiles')
          .update({
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', customerId)
          .eq('subscription_status', 'past_due');
        console.log('Payment succeeded:', customerId);
        break;
      }

      default:
        console.log('Unhandled webhook event:', event.type);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
