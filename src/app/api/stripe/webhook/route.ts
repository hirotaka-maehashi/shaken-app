import { NextRequest } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../lib/stripe'
import { supabaseAdmin } from '../../../../utils/supabase-admin'
import { Stripe } from 'stripe'

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = (headers() as unknown as Headers).get('stripe-signature') ?? ''

  let event

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: unknown) {
    const error = err as Error
    console.error('Webhook Error:', error.message)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan
    const quantity = session.metadata?.quantity

    if (userId && plan && quantity) {
      await supabaseAdmin
        .from('users')
        .update({ plan, quantity })
        .eq('id', userId)

      console.log('✅ Supabase updated:', { userId, plan, quantity })
    }
  }

  return new Response('OK', { status: 200 })
}