import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  // Check if user is authenticated and has admin role
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .single()

    if (!session || profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*']
}