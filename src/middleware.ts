import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  // Create Supabase client for middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.delete({ name, ...options })
          response.cookies.delete({ name, ...options })
        },
      },
    }
  )

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  if (isPublicRoute) {
    // Redirect authenticated users away from auth pages
    if (session && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/app', request.url))
    }
    return response
  }

  // Admin routes require authentication and proper role
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Check user role from session metadata
    const userRole = session.user?.user_metadata?.role
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/app', request.url))
    }

    return response
  }

  // Protected routes require authentication
  if (pathname.startsWith('/app')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
