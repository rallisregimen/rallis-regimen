import Stripe from 'stripe';
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  var email = req.body.email;
  var name = req.body.name;
  var plan = req.body.plan || 'monthly';

  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    var priceId = plan === 'annual'
      ? process.env.STRIPE_ANNUAL_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;

    var existing = await stripe.customers.list({ email: email, limit: 1 });
    var customer = existing.data[0] || await stripe.customers.create({ email: email, name: name });

    var session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: {
        trial_period_days: 30,
        trial_settings: { end_behavior: { missing_payment_method: 'cancel' } }
      },
      payment_method_collection: 'always',
      // After payment, go to auth-callback which creates the user and sends magic link
      success_url: process.env.NEXT_PUBLIC_APP_URL + '/api/auth-callback?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/join?cancelled=true',
      metadata: { email: email, name: name || '', plan: plan }
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout' });
  }
}
