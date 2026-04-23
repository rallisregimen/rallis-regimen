import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Simple admin auth check
  var adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  var userId = req.body && req.body.userId;
  var days = (req.body && req.body.days) || 30;

  if (!userId) return res.status(400).json({ error: 'userId required' });

  var supabase = getSupabase();

  try {
    var profileResult = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name, subscription_status')
      .eq('id', userId)
      .single();

    if (profileResult.error || !profileResult.data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    var profile = profileResult.data;
    var customerId = profile.stripe_customer_id;

    if (!customerId) {
      return res.status(400).json({ error: 'No Stripe customer found for this user' });
    }

    // Get their active subscription
    var subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 5
    });

    var activeSub = subscriptions.data.find(function(s) {
      return s.status === 'active' || s.status === 'trialing' || s.status === 'past_due';
    });

    if (!activeSub) {
      return res.status(400).json({ error: 'No active subscription found for this user' });
    }

    // Calculate new trial end — either extend from now or from current trial end
    var currentTrialEnd = activeSub.trial_end;
    var baseDate = currentTrialEnd && currentTrialEnd > Math.floor(Date.now() / 1000)
      ? currentTrialEnd
      : Math.floor(Date.now() / 1000);
    var newTrialEnd = baseDate + (days * 24 * 60 * 60);

    // Update the subscription trial end
    await stripe.subscriptions.update(activeSub.id, {
      trial_end: newTrialEnd,
      proration_behavior: 'none'
    });

    var newDate = new Date(newTrialEnd * 1000).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    return res.status(200).json({
      success: true,
      message: 'Extended ' + days + ' days for ' + (profile.full_name || profile.email),
      nextBillingDate: newDate
    });

  } catch (err) {
    console.error('Extend subscription error:', err);
    return res.status(500).json({ error: err.message || 'Failed to extend subscription' });
  }
}
