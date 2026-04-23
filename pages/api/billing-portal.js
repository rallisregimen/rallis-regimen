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

  var userId = req.body && req.body.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  var supabase = getSupabase();

  try {
    // Get stripe_customer_id from profiles
    var profileResult = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', userId)
      .single();

    if (profileResult.error || !profileResult.data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    var customerId = profileResult.data.stripe_customer_id;

    if (!customerId) {
      return res.status(400).json({ error: 'No billing account found. Contact support.' });
    }

    var appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.rallisregimen.com';

    var session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: appUrl + '/dashboard',
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error('Billing portal error:', err);
    return res.status(500).json({ error: 'Could not open billing portal. Try again or contact support.' });
  }
}
