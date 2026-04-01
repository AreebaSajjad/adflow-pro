import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

const protectedRoutes: Record<string, string[]> = {
  '/dashboard/client': ['client', 'admin', 'super_admin'],
  '/dashboard/moderator': ['moderator', 'admin', 'super_admin'],
  '/dashboard/admin': ['admin', 'super_admin'],
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  // Check if route needs protection
  const matchedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  )

  if (!matchedRoute) return NextResponse.next()

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const payload = verifyToken(token)

  // Invalid token → redirect to login
  if (!payload) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Wrong role → redirect to their own dashboard
  const allowedRoles = protectedRoutes[matchedRoute]
  if (!allowedRoles.includes(payload.role)) {
    return NextResponse.redirect(new URL(`/dashboard/${payload.role}`, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}