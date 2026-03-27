import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000'))
  }

  const checkoutUrl = process.env.WHOP_CHECKOUT_URL
  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Checkout not configured' }, { status: 500 })
  }

  // Append user ID so the webhook can tie payment back to the user
  const url = new URL(checkoutUrl)
  url.searchParams.set('metadata[user_id]', session.userId)

  return NextResponse.redirect(url.toString())
}
