import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { rpName, rpID } from '@/lib/webauthn'
import { generateChallengeId, storeChallenge } from '@/lib/challenges'
import { randomBytes } from 'crypto'

export async function POST(_req: NextRequest) {
  const challengeId = generateChallengeId()
  const userName = `user-${randomBytes(4).toString('hex')}`

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName,
    userDisplayName: 'Delimiter User',
    attestationType: 'none',
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  })

  storeChallenge(challengeId, options.challenge)

  return NextResponse.json({ challengeId, options })
}
