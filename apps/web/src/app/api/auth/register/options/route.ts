import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { db } from '@/lib/db'
import { rpName, rpID } from '@/lib/webauthn'
import { storeChallenge } from '@/lib/challenges'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const existing = await db.user.findUnique({
    where: { email },
    include: { credentials: true },
  })

  if (existing) {
    return NextResponse.json({ error: 'Account already exists. Please sign in.' }, { status: 409 })
  }

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: email,
    userDisplayName: email,
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
  })

  storeChallenge(email, options.challenge)

  return NextResponse.json(options)
}
