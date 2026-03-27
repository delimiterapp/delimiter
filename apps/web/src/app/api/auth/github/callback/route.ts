import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { createSession } from '@/lib/session'
import { generateProjectKey } from '@/lib/project-key'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Verify state
  const cookieStore = await cookies()
  const storedState = cookieStore.get('oauth_state')?.value
  cookieStore.delete('oauth_state')

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/sign-in?error=invalid_state`)
  }

  // Exchange code for access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const tokenData = await tokenRes.json()
  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(`${appUrl}/sign-in?error=token_exchange_failed`)
  }

  const accessToken = tokenData.access_token

  // Get GitHub user profile
  const [userRes, emailsRes] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' },
    }),
  ])

  if (!userRes.ok) {
    return NextResponse.redirect(`${appUrl}/sign-in?error=github_api_failed`)
  }

  const githubUser = await userRes.json()
  const githubId: number = githubUser.id
  const githubUsername: string = githubUser.login
  const name: string | null = githubUser.name || null
  const avatarUrl: string | null = githubUser.avatar_url || null

  // Get primary email
  let email: string | null = githubUser.email
  if (!email && emailsRes.ok) {
    const emails = await emailsRes.json()
    const primary = emails.find((e: any) => e.primary && e.verified)
    email = primary?.email || emails.find((e: any) => e.verified)?.email || null
  }

  // Find or create user
  let user = await db.user.findUnique({ where: { githubId } })

  if (user) {
    // Update profile info on each login
    user = await db.user.update({
      where: { id: user.id },
      data: { email, name, avatarUrl, githubUsername },
    })
  } else {
    // First user becomes superadmin
    const userCount = await db.user.count()
    const role = userCount === 0 ? 'superadmin' : 'user'

    user = await db.user.create({
      data: {
        githubId,
        githubUsername,
        email,
        name,
        avatarUrl,
        role,
        projects: {
          create: {
            name: 'Default',
            key: generateProjectKey(),
          },
        },
      },
    })

    // Create default alert rule for the new project
    const project = await db.project.findFirst({ where: { userId: user.id } })
    if (project) {
      await db.alertRule.create({
        data: { projectId: project.id, provider: null, warnAt: 70, criticalAt: 90 },
      })
    }
  }

  await createSession(user.id)

  const redirectTo = user.onboardingComplete ? '/dashboard' : '/onboarding'
  return NextResponse.redirect(`${appUrl}${redirectTo}`)
}
