import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'delimiter-dev-secret-change-in-production'
)

const protectedPaths = ['/dashboard', '/console', '/settings']
const authPaths = ['/sign-in', '/sign-up']

async function isValidSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('session')?.value
  if (!token) return false
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    const valid = await isValidSession(request)
    if (!valid) {
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  if (authPaths.some((p) => pathname.startsWith(p))) {
    const valid = await isValidSession(request)
    if (valid) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/console/:path*', '/settings/:path*', '/sign-in', '/sign-up'],
}
