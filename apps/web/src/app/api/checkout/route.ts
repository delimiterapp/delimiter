import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/sign-in', appUrl))
  }

  const whopApiKey = process.env.WHOP_API_KEY
  const planId = process.env.WHOP_PLAN_ID

  if (!whopApiKey || !planId) {
    return NextResponse.json({ error: 'Checkout not configured' }, { status: 500 })
  }

  // Create a checkout session via Whop's Checkout Configuration API
  // This properly passes metadata and sets the redirect URL
  const res = await fetch('https://api.whop.com/api/v5/checkout_configurations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${whopApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      redirect_url: `${appUrl}/dashboard?upgraded=1`,
      metadata: {
        user_id: session.userId,
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Whop checkout creation failed:', err)
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
  }

  const data = await res.json()
  const purchaseUrl = data.purchase_url

  if (!purchaseUrl) {
    return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
  }

  // Whop returns a relative path like /checkout/plan_xxx?session=ch_xxx
  const checkoutUrl = purchaseUrl.startsWith('http')
    ? purchaseUrl
    : `https://whop.com${purchaseUrl}`

  return NextResponse.redirect(checkoutUrl)
}
