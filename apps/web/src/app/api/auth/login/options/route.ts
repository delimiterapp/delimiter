import { NextRequest, NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { rpID } from '@/lib/webauthn'
import { generateChallengeId, storeChallenge } from '@/lib/challenges'

export async function POST(_req: NextRequest) {
  const challengeId = generateChallengeId()

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'preferred',
    // Empty allowCredentials enables discoverable credential (passkey) flow
  })

  storeChallenge(challengeId, options.challenge)

  return NextResponse.json({ challengeId, options })
}
