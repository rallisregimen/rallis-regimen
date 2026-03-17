import Stripe from 'stripe'
import { getServerSupabase } from '../../lib/supabase'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', c => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const rawBody = await getRawBody(req)
  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: err.message })
  }

  const supabase = getServerSupabase()
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const email = session.metadata?.email || session.customer_details?.email
      if (email) {
        await supabase.from('profiles').update({ stripe_customer_id: session.customer, subscription_status: 'active', subscription_tier: session.metadata?.plan || 'monthly', updated_at: new Date().toISOString() }).eq('email', email)
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object
      const customer = await stripe.customers.retrieve(sub.customer)
      if (customer.email) {
        await supabase.from('profiles').update({ subscription_status: 'cancelled', updated_at: new Date().toISOString() }).eq('email', customer.email)
      }
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object
      const customer = await stripe.customers.retrieve(invoice.customer)
      if (customer.email) {
        await supabase.from('profiles').update({ subscription_status: 'past_due', updated_at: new Date().toISOString() }).eq('email', customer.email)
      }
    }
    return res.status(200).json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: 'Handler failed' })
  }
}
