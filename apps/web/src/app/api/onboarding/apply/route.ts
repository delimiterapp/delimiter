import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { githubUsername, orgName } = await req.json()

  if (!githubUsername || !orgName) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  await db.user.update({
    where: { id: session.userId },
    data: {
      plan: 'free',
      onboardingComplete: true,
      githubUsername,
      orgName,
    },
  })

  return NextResponse.json({ approved: true })
}
