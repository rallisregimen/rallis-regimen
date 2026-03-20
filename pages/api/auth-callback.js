// pages/api/auth-callback.js
// Handles post-Stripe redirect - creates Supabase user and sends magic link

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  var sessionId = req.query.session_id;
  var bypass = req.query.bypass;
  var name = req.query.name;
  var email = req.query.email;

  // Admin bypass for testing
  if (bypass === 'true' && email) {
    var supabase = getAdminSupabase();
    try {
      // Create or get user
      var listResult = await supabase.auth.admin.listUsers();
      var existingUser = listResult.data && listResult.data.users
        ? listResult.data.users.find(function(u) { return u.email === email; })
        : null;

      var userId;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        var createResult = await supabase.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: { full_name: name || '' }
        });
        if (createResult.error) throw createResult.error;
        userId = createResult.data.user.id;
      }

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        full_name: name || '',
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      });

      // Send magic link so they can log in
      await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: { redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/intake' }
      });

      // Redirect to a "check your email" page
      return res.redirect('/check-email?email=' + encodeURIComponent(email));
    } catch (err) {
      console.error('Bypass auth error:', err);
      return res.redirect('/join?error=auth_failed');
    }
  }

  // Normal Stripe flow
  if (!sessionId) return res.redirect('/join?error=no_session');

  try {
    var session = await stripe.checkout.sessions.retrieve(sessionId);
    var customerEmail = session.customer_details && session.customer_details.email
      ? session.customer_details.email
      : session.metadata && session.metadata.email;
    var customerName = session.customer_details && session.customer_details.name
      ? session.customer_details.name
      : session.metadata && session.metadata.name || '';

    if (!customerEmail) return res.redirect('/join?error=no_email');

    var supabase = getAdminSupabase();

    // Check if user already exists
    var listResult = await supabase.auth.admin.listUsers();
    var existingUser = listResult.data && listResult.data.users
      ? listResult.data.users.find(function(u) { return u.email === customerEmail; })
      : null;

    var userId;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      var createResult = await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
        user_metadata: { full_name: customerName }
      });
      if (createResult.error) throw createResult.error;
      userId = createResult.data.user.id;
    }

    // Upsert profile with subscription info
    await supabase.from('profiles').upsert({
      id: userId,
      email: customerEmail,
      full_name: customerName,
      stripe_customer_id: session.customer,
      subscription_status: 'active',
      subscription_tier: session.metadata && session.metadata.plan ? session.metadata.plan : 'monthly',
      updated_at: new Date().toISOString()
    });

    // Send magic link to log them in
    var linkResult = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: customerEmail,
      options: { redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/intake' }
    });

    if (linkResult.error) throw linkResult.error;

    // Redirect to check-email page
    return res.redirect('/check-email?email=' + encodeURIComponent(customerEmail));
  } catch (err) {
    console.error('Auth callback error:', err);
    return res.redirect('/join?error=auth_failed');
  }
}
