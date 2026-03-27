import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', appUrl))
  }

  const checkoutUrl = process.env.WHOP_CHECKOUT_URL
  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Checkout not configured' }, { status: 500 })
  }

  // Append user ID so the webhook can tie payment back to the user
  // and redirect back to the app after checkout
  const url = new URL(checkoutUrl)
  url.searchParams.set('metadata[user_id]', session.userId)
  url.searchParams.set('d', `${appUrl}/dashboard`)

  return NextResponse.redirect(url.toString())
}
