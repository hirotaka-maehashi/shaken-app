import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { plan, quantity, user_id } = await req.json()

  const priceMap: Record<string, string> = {
    light: 'price_1RVNo5GVBAikpCoVL3gecXQq',
    standard: 'price_1RVNq4GVBAikpCoVq1bEwN07',
    premium: 'price_1RVNqcGVBAikpCoVP3prCbSg',
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
    success_url: 'https://shakenapp.vercel.app/dashboard?status=success',
    cancel_url: 'https://shakenapp.vercel.app/plans?status=cancelled',
    metadata: {
      user_id,
      plan,
      quantity,
    },
  })

  return NextResponse.json({ url: session.url })
}
