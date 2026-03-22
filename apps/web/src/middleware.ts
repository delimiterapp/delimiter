import { NextRequest, NextResponse } from 'next/server'

const protectedPaths = ['/dashboard', '/console', '/settings']
const authPaths = ['/sign-in', '/sign-up']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get('session')?.value

  // Redirect unauthenticated users away from protected pages
  if (protectedPaths.some((p) => pathname.startsWith(p))) {
    if (!session) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some((p) => pathname.startsWith(p))) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/console/:path*', '/settings/:path*', '/sign-in', '/sign-up'],
}
