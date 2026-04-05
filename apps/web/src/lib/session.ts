import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

let _secret: Uint8Array | null = null

function getSecret(): Uint8Array {
  if (_secret) return _secret
  const raw = process.env.JWT_SECRET
  if (!raw && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production')
  }
  _secret = new TextEncoder().encode(raw || 'delimiter-dev-secret-change-in-production')
  return _secret
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret())

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return token
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (typeof payload.userId !== 'string' || !payload.userId) {
      return null
    }
    return { userId: payload.userId }
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
