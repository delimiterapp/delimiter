import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getPipedreamClient } from '@/lib/pipedream'

/**
 * POST /api/connections/token
 *
 * Creates a short-lived Pipedream Connect token for the current user.
 * The frontend uses this token to open the auth popup.
 */
export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pd = getPipedreamClient()
  const result = await pd.tokens.create({
    externalUserId: session.userId,
    allowedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  })

  return NextResponse.json({
    token: result.token,
    expires_at: result.expiresAt,
  })
}
