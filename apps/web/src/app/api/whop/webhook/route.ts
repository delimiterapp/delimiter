import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function verifyWebhook(body: string, headers: Headers, secret: string): Promise<boolean> {
  const svixId = headers.get('svix-id')
  const svixTimestamp = headers.get('svix-timestamp')
  const svixSignature = headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return false
  }

  // Check timestamp is within 5 minutes to prevent replay attacks
  const ts = parseInt(svixTimestamp)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - ts) > 300) {
    return false
  }

  // Whop secrets are prefixed with "whsec_" — strip it and base64-decode
  const rawSecret = secret.startsWith('whsec_') ? secret.slice(6) : secret
  const keyBytes = Uint8Array.from(atob(rawSecret), (c) => c.charCodeAt(0))

  // Sign: "${svix_id}.${svix_timestamp}.${body}"
  const signedContent = `${svixId}.${svixTimestamp}.${body}`
  const encoder = new TextEncoder()

  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedContent))
  const expectedSig = `v1,${btoa(String.fromCharCode(...new Uint8Array(sig)))}`

  // svix-signature can contain multiple space-separated signatures
  const signatures = svixSignature.split(' ')
  return signatures.some((s) => s === expectedSig)
}

export async function POST(req: NextRequest) {
  const secret = process.env.WHOP_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  const body = await req.text()

  const valid = await verifyWebhook(body, req.headers, secret)
  if (!valid) {
    console.error('Whop webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: Record<string, unknown>
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Whop uses "action" in v5 SDK format
  const eventType = (event.action || event.event) as string | undefined

  const data = event.data as Record<string, unknown> | undefined
  const metadata = data?.metadata as Record<string, unknown> | undefined

  // Handle payment/membership completion
  if (eventType === 'membership.went_valid' || eventType === 'payment.succeeded') {
    const userId = metadata?.user_id as string | undefined
    if (!userId) {
      console.error('Whop webhook missing user_id in metadata — payment may not be attributed:', JSON.stringify(metadata))
      return NextResponse.json(
        { error: 'Missing user_id in metadata' },
        { status: 422 }
      )
    }

    try {
      await db.user.update({
        where: { id: userId },
        data: {
          plan: 'pro',
          onboardingComplete: true,
        },
      })
      console.log(`Upgraded user ${userId} to pro via Whop webhook`)
    } catch (err) {
      console.error(`Failed to upgrade user ${userId}:`, err)
      return NextResponse.json({ error: 'Failed to upgrade user' }, { status: 500 })
    }
  }

  // Handle cancellation/expiry
  if (eventType === 'membership.went_invalid') {
    const userId = metadata?.user_id as string | undefined
    if (userId) {
      try {
        await db.user.update({
          where: { id: userId },
          data: { plan: 'free' },
        })
        console.log(`Downgraded user ${userId} to free via Whop webhook`)
      } catch (err) {
        console.error(`Failed to downgrade user ${userId}:`, err)
        return NextResponse.json({ error: 'Failed to downgrade user' }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ received: true })
}
