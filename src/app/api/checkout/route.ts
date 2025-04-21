import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { plan, quantity, user_id } = await req.json()

  const priceMap: Record<string, string> = {
    light: 'price_1RGHCA2eCwQ1Wyg3kgSXJhU1',
    standard: 'price_1RGHIZ2eCwQ1Wyg3amCvZefp',
    premium: 'price_1RGHJ92eCwQ1Wyg3fQIWZHFH',
  }

  const priceId = priceMap[plan]

  if (!priceId || !user_id) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: quantity || 1,
      },
    ],
    success_url: 'http://localhost:3000/dashboard?status=success',
    cancel_url: 'http://localhost:3000/plans?status=cancelled',
    metadata: {
      user_id,
      plan,
      quantity,
    },
  })

  return NextResponse.json({ url: session.url })
}
