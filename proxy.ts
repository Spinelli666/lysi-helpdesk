import { auth } from '@/app/lib/auth'
import { NextResponse } from 'next/server'

const handler = auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth

  if (pathname === '/login') {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/tickets', req.url))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (pathname.startsWith('/admin')) {
    if (req.auth?.user?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/tickets', req.url))
    }
  }

  return NextResponse.next()
})

export { handler as proxy }

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
}
