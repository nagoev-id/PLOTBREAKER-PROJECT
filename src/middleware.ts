import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!admin|api|_next/static|_next/image|favicon.ico|media).*)'],
}

export const middleware = (request: NextRequest): NextResponse => {
  const token = request.cookies.get('payload-token')
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
  return NextResponse.next()
}

export default middleware
