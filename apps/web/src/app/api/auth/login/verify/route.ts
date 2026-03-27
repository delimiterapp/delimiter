import { NextRequest, NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { db } from '@/lib/db'
import { rpID, origin } from '@/lib/webauthn'
import { getChallenge } from '@/lib/challenges'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { challengeId, credential } = await req.json()

  const expectedChallenge = getChallenge(challengeId)
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Challenge expired. Try again.' }, { status: 400 })
  }

  // Look up credential by ID from the passkey response
  const dbCredential = await db.credential.findUnique({
    where: { credentialId: credential.id },
    include: { user: true },
  })

  if (!dbCredential) {
    return NextResponse.json({ error: 'Credential not recognized. Please sign up first.' }, { status: 404 })
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

  await createSession(dbCredential.user.id)

  return NextResponse.json({
    verified: true,
    user: { id: dbCredential.user.id, email: dbCredential.user.email },
  })
}

type AuthenticatorTransport = 'ble' | 'cable' | 'hybrid' | 'internal' | 'nfc' | 'smart-card' | 'usb'
