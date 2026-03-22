import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { db } from '@/lib/db'
import { rpID, origin } from '@/lib/webauthn'
import { getChallenge } from '@/lib/challenges'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email, credential } = await req.json()

  const expectedChallenge = getChallenge(email)
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Challenge expired. Try again.' }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { credentials: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const dbCredential = user.credentials.find((c) => c.credentialId === credential.id)
  if (!dbCredential) {
    return NextResponse.json({ error: 'Credential not recognized' }, { status: 400 })
  }

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: dbCredential.credentialId,
        publicKey: new Uint8Array(dbCredential.publicKey),
        counter: Number(dbCredential.counter),
        transports: dbCredential.transports as AuthenticatorTransport[],
      },
    })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  if (!verification.verified) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  // Update counter
  await db.credential.update({
    where: { id: dbCredential.id },
    data: { counter: verification.authenticationInfo.newCounter },
  })

  await createSession(user.id)

  return NextResponse.json({
    verified: true,
    user: { id: user.id, email: user.email },
  })
}

type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb'
