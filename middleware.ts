import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const middleware = async (request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const data = decodeJwtPayload(token)
      if (!data || !data.adminId) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}

function decodeJwtPayload(token: string) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }
  const encodedPayload = parts[1]
  const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
  const padding = base64.length % 4
  const paddedBase64 = padding > 0 ? base64 + '==='.slice(padding) : base64
  const decodedPayload = atob(paddedBase64)
  return JSON.parse(decodedPayload)
}
