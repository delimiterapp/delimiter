import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { db } from '@/lib/db'
import { rpID } from '@/lib/webauthn'
import { storeChallenge } from '@/lib/challenges'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { credentials: true },
  })

  if (!user || user.credentials.length === 0) {
    return NextResponse.json({ error: 'No account found. Please sign up first.' }, { status: 404 })
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: user.credentials.map((c) => ({
      id: c.credentialId,
      transports: c.transports as AuthenticatorTransport[],
    })),
    userVerification: 'preferred',
  })

  storeChallenge(email, options.challenge)

  return NextResponse.json(options)
}

type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb'
