import { NextRequest, NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { db } from '@/lib/db'
import { rpID, origin } from '@/lib/webauthn'
import { getChallenge } from '@/lib/challenges'
import { createSession } from '@/lib/session'
import { generateProjectKey } from '@/lib/project-key'

export async function POST(req: NextRequest) {
  let challengeId: string
  let credential: any
  try {
    const body = await req.json()
    challengeId = body.challengeId
    credential = body.credential
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const expectedChallenge = getChallenge(challengeId)
  if (!expectedChallenge) {
    return NextResponse.json({ error: 'Challenge expired. Try again.' }, { status: 400 })
  }

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })
  } catch (err: any) {
    console.error('Registration verification error:', err)
    const message = err?.message?.includes('origin')
      ? 'Origin mismatch. Check WEBAUTHN_ORIGIN env variable.'
      : err?.message?.includes('RP ID')
        ? 'RP ID mismatch. Check WEBAUTHN_RP_ID env variable.'
        : `Verification failed: ${err?.message || 'Unknown error'}`
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
  }

  const { credential: cred } = verification.registrationInfo

  // First user becomes superadmin
  const userCount = await db.user.count()
  const role = userCount === 0 ? 'superadmin' : 'user'

  const user = await db.user.create({
    data: {
      role,
      credentials: {
        create: {
          credentialId: cred.id,
          publicKey: Buffer.from(cred.publicKey),
          counter: cred.counter,
          transports: credential.response.transports || [],
        },
      },
      projects: {
        create: {
          name: 'Default',
          key: generateProjectKey(),
        },
      },
    },
    include: { projects: true },
  })

  await createSession(user.id)

  return NextResponse.json({
    verified: true,
    user: { id: user.id },
    project: user.projects[0],
  })
}
