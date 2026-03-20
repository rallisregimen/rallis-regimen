import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  var bypass = req.query.bypass;
  var name = req.query.name || '';
  var email = req.query.email;
  var sessionId = req.query.session_id;

  var supabase = getAdminSupabase();

  // ADMIN BYPASS - skip email, create session directly
  if (bypass === 'true' && email) {
    try {
      // Create or get user
      var listResult = await supabase.auth.admin.listUsers();
      var users = (listResult.data && listResult.data.users) ? listResult.data.users : [];
      var existingUser = users.find(function(u) { return u.email === email; });

      var userId;
      if (existingUser) {
        userId = existingUser.id;
      } else {
        var createResult = await supabase.auth.admin.createUser({
          email: email,
          email_confirm: true,
          user_metadata: { full_name: name }
        });
        if (createResult.error) throw createResult.error;
        userId = createResult.data.user.id;
      }

      // Upsert profile
      await supabase.from('profiles').upsert({
        id: userId,
        email: email,
        full_name: name,
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      });

      // Generate a magic link and extract the token to create a real session
      var linkResult = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: { redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/intake' }
      });

      if (linkResult.error) throw linkResult.error;

      // Redirect directly to the magic link URL - no email needed
      var magicUrl = linkResult.data.properties && linkResult.data.properties.action_link
        ? linkResult.data.properties.action_link
        : linkResult.data.action_link;

      if (magicUrl) {
        return res.redirect(magicUrl);
      }

      // Fallback - redirect to intake anyway
      return res.redirect('/intake');
    } catch (err) {
      console.error('Bypass error:', err);
      return res.redirect('/intake');
    }
  }

  // STRIPE FLOW
  if (!sessionId) return res.redirect('/join?error=no_session');

  try {
    var session = await stripe.checkout.sessions.retrieve(sessionId);
    var customerEmail = (session.customer_details && session.customer_details.email)
      ? session.customer_details.email
      : (session.metadata && session.metadata.email);
    var customerName = (session.customer_details && session.customer_details.name)
      ? session.customer_details.name
      : (session.metadata && session.metadata.name) || '';

    if (!customerEmail) return res.redirect('/join?error=no_email');

    // Create or get user
    var listResult2 = await supabase.auth.admin.listUsers();
    var users2 = (listResult2.data && listResult2.data.users) ? listResult2.data.users : [];
    var existingUser2 = users2.find(function(u) { return u.email === customerEmail; });

    var userId2;
    if (existingUser2) {
      userId2 = existingUser2.id;
    } else {
      var createResult2 = await supabase.auth.admin.createUser({
        email: customerEmail,
        email_confirm: true,
        user_metadata: { full_name: customerName }
      });
      if (createResult2.error) throw createResult2.error;
      userId2 = createResult2.data.user.id;
    }

    // Upsert profile
    await supabase.from('profiles').upsert({
      id: userId2,
      email: customerEmail,
      full_name: customerName,
      stripe_customer_id: session.customer,
      subscription_status: 'trialing',
      subscription_tier: (session.metadata && session.metadata.plan) ? session.metadata.plan : 'monthly',
      updated_at: new Date().toISOString()
    });

    // Send magic link email to real paying member
    var linkResult2 = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: customerEmail,
      options: { redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/intake' }
    });

    if (linkResult2.error) throw linkResult2.error;

    return res.redirect('/check-email?email=' + encodeURIComponent(customerEmail));
  } catch (err) {
    console.error('Stripe auth error:', err);
    return res.redirect('/join?error=auth_failed');
  }
}
