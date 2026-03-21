import { NextRequest, NextResponse } from 'next/server'

const MAINTENANCE_BYPASS = ['/maintenance', '/_next', '/favicon.ico']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Maintenance mode — set MAINTENANCE_MODE=1 in env to enable.
  // Admins (valid admin_token cookie) always pass through.
  if (process.env.MAINTENANCE_MODE === '1') {
    const isBypassed = MAINTENANCE_BYPASS.some((p) => pathname.startsWith(p))
    if (!isBypassed) {
      const token = req.cookies.get('admin_token')
      const secret = process.env.ADMIN_SECRET
      const isAdminAuthed = secret && token?.value === secret

      if (!isAdminAuthed) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Service temporarily unavailable' },
            { status: 503, headers: { 'Retry-After': '3600' } }
          )
        }
        return NextResponse.redirect(new URL('/maintenance', req.url))
      }
    }
  }

  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin'
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login'

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get('admin_token')
    const secret = process.env.ADMIN_SECRET
    if (!secret || token?.value !== secret) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/:path*'],
}
