import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ADMIN_ROLES } from '@/lib/constants'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const role = req.nextauth.token?.role as string | undefined

    if (pathname.startsWith('/admin') && !(role && (ADMIN_ROLES as string[]).includes(role))) {
      return NextResponse.redirect(new URL('/login?callbackUrl=/admin', req.url))
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
          return Boolean(token)
        }
        return true
      },
    },
    pages: { signIn: '/login' },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
}
