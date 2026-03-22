import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: { projects: true },
  })

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    projects: user.projects.map((p) => ({
      id: p.id,
      name: p.name,
      key: p.key,
    })),
  })
}
