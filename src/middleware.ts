import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  console.log(`--- DEBUG MIDDLEWARE --- Path: ${pathname} | User: ${user ? 'Found' : 'Not Found'}`)

  // กรณีพยายามเข้า Dashboard แต่ไม่มี User
  if (!user && pathname.startsWith('/dashboard')) {
    console.log('DEBUG: No user in dashboard, redirecting to login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // กรณีล็อคอินแล้วแต่พยายามเข้าหน้า Login
  if (user && pathname === '/login') {
    console.log('DEBUG: User exists, redirecting from login to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}