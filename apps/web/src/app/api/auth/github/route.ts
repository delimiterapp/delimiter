import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 })
  }

  const state = randomBytes(32).toString('hex')

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`,
    scope: 'read:user user:email',
    state,
  })

  const response = NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/',
  })

  return response
}
