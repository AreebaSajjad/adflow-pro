import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt'

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  const protectedRoutes: Record<string, string[]> = {
    '/dashboard/client': ['client', 'admin', 'super_admin'],
    '/dashboard/moderator': ['moderator', 'admin', 'super_admin'],
    '/dashboard/admin': ['admin', 'super_admin'],
  }

  const matchedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  )

  if (!matchedRoute) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const payload = verifyToken(token)

  if (!payload) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const allowedRoles = protectedRoutes[matchedRoute]
  if (!allowedRoles.includes(payload.role)) {
    if (payload.role === 'moderator') return NextResponse.redirect(new URL('/dashboard/moderator', req.url))
    if (payload.role === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', req.url))
    return NextResponse.redirect(new URL('/dashboard/client', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}