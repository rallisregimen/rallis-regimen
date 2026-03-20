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

async function createOrUpdateUser(supabase, email, name, password, stripeCustomerId, plan) {
  var listResult = await supabase.auth.admin.listUsers();
  var users = (listResult.data && listResult.data.users) ? listResult.data.users : [];
  var existingUser = users.find(function(u) { return u.email === email; });

  var userId;
  if (existingUser) {
    userId = existingUser.id;
    // Update password if provided
    if (password) {
      await supabase.auth.admin.updateUserById(userId, { password: password });
    }
  } else {
    var createData = {
      email: email,
      email_confirm: true,
      user_metadata: { full_name: name || '' }
    };
    if (password) createData.password = password;

    var createResult = await supabase.auth.admin.createUser(createData);
    if (createResult.error) throw createResult.error;
    userId = createResult.data.user.id;
  }

  await supabase.from('profiles').upsert({
    id: userId,
    email: email,
    full_name: name || '',
    stripe_customer_id: stripeCustomerId || null,
    subscription_status: stripeCustomerId ? 'trialing' : 'active',
    subscription_tier: plan || 'monthly',
    updated_at: new Date().toISOString()
  });

  return userId;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  var bypass = req.query.bypass;
  var name = req.query.name || '';
  var email = req.query.email;
  var password = req.query.password || '';
  var sessionId = req.query.session_id;

  var supabase = getAdminSupabase();

  // ADMIN BYPASS - create user with password, sign them in, go straight to intake
  if (bypass === 'true' && email) {
    try {
      await createOrUpdateUser(supabase, email, name, password, null, 'admin');

      // Sign them in directly and get a session token
      var signInResult = await supabase.auth.signInWithPassword({ email: email, password: password || 'RALLISTEST_default_2026' });

      if (signInResult.error || !signInResult.data.session) {
        // Fallback to magic link
        var linkResult = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: email,
          options: { redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/intake' }
        });
        if (linkResult.data && linkResult.data.properties && linkResult.data.properties.action_link) {
          return res.redirect(linkResult.data.properties.action_link);
        }
        return res.redirect('/intake');
      }

      var session = signInResult.data.session;
      // Redirect to intake with session tokens in URL fragment
      var intakeUrl = process.env.NEXT_PUBLIC_APP_URL + '/intake#access_token=' + session.access_token + '&refresh_token=' + session.refresh_token + '&type=signup';
      return res.redirect(intakeUrl);
    } catch (err) {
      console.error('Bypass error:', err);
      return res.redirect('/intake');
    }
  }

  // STRIPE FLOW
  if (!sessionId) return res.redirect('/join?error=no_session');

  try {
    var stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    var customerEmail = (stripeSession.customer_details && stripeSession.customer_details.email)
      ? stripeSession.customer_details.email
      : (stripeSession.metadata && stripeSession.metadata.email);
    var customerName = (stripeSession.customer_details && stripeSession.customer_details.name)
      ? stripeSession.customer_details.name
      : (stripeSession.metadata && stripeSession.metadata.name) || '';
    var customerPassword = stripeSession.metadata && stripeSession.metadata.password ? stripeSession.metadata.password : null;
    var plan = stripeSession.metadata && stripeSession.metadata.plan ? stripeSession.metadata.plan : 'monthly';

    if (!customerEmail) return res.redirect('/join?error=no_email');

    await createOrUpdateUser(supabase, customerEmail, customerName, customerPassword, stripeSession.customer, plan);

    if (customerPassword) {
      // Sign them in directly with their password
      var signInResult2 = await supabase.auth.signInWithPassword({ email: customerEmail, password: customerPassword });

      if (!signInResult2.error && signInResult2.data.session) {
        var session2 = signInResult2.data.session;
        var intakeUrl2 = process.env.NEXT_PUBLIC_APP_URL + '/intake#access_token=' + session2.access_token + '&refresh_token=' + session2.refresh_token + '&type=signup';
        return res.redirect(intakeUrl2);
      }
    }

    // Fallback to magic link if no password
    var linkResult2 = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: customerEmail,
      options: { redirectTo: process.env.NEXT_PUBLIC_APP_URL + '/intake' }
    });

    if (linkResult2.data && linkResult2.data.properties && linkResult2.data.properties.action_link) {
      return res.redirect(linkResult2.data.properties.action_link);
    }

    return res.redirect('/intake');
  } catch (err) {
    console.error('Stripe auth error:', err);
    return res.redirect('/join?error=auth_failed');
  }
}
