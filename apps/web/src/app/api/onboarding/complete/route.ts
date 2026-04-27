import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function POST() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await db.user.update({
    where: { id: session.userId },
    data: { onboardingComplete: true },
  })

  return NextResponse.json({ ok: true })
}
