import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const secret = process.env.WHOP_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get('x-whop-signature') || req.headers.get('whop-signature') || ''

  // Verify webhook signature
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expectedSignature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)

  // Handle payment/membership completion
  if (event.event === 'membership.went_valid' || event.event === 'payment.succeeded') {
    const userId = event.data?.metadata?.user_id
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          plan: 'pro',
          onboardingComplete: true,
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
