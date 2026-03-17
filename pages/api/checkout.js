import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { email, name, plan = 'monthly' } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  try {
    const priceId = plan === 'annual' ? process.env.STRIPE_ANNUAL_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID
    const existing = await stripe.customers.list({ email, limit: 1 })
    let customer = existing.data[0] || await stripe.customers.create({ email, name })

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/intake?new=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/join?cancelled=true`,
      metadata: { email, name, plan }
    })

    return res.status(200).json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return res.status(500).json({ error: 'Failed to create checkout' })
  }
}
