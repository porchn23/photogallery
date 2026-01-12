import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. จัดการ Pre-flight request (OPTIONS) สำหรับ CORS
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // 2. สร้าง Response ตั้งต้น
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 3. สร้าง Supabase Client
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
      global: {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
        },
      },
    }
  )

  // 4. ตรวจสอบ User
      // ✅ เพิ่ม Logic เช็ค Status และ Reactivate
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: dbUser } = await supabase
          .from('users')
          .select('status')
          .eq('id', user.id)
          .single()

        // ถ้า User เคยลบบัญชีไปแล้ว (status = deleted) ให้ Reactivate กลับมาเป็น active
        if (dbUser?.status === 'deleted') {
            await supabase
              .from('users')
              .update({ status: 'active' }) // กลับมาใช้งานได้
              .eq('id', user.id)
            
            console.log(`User ${user.id} has been reactivated.`)
        }
      }

  console.log(`--- DEBUG PROXY --- Path: ${pathname} | User: ${user ? 'Found' : 'Not Found'}`)

  // 5. Logic การเข้าถึง (Authorization Logic)
  
  // กรณี API: ถ้าไม่มีสิทธิ์ให้คืน 401
  if (pathname.startsWith('/api/v1/photographer') && !user) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { 
      status: 401,
      headers: { 'Access-Control-Allow-Origin': '*' } // ใส่ CORS ให้ Error ด้วย
    })
  }

  // กรณี Dashboard: ถ้าไม่มีสิทธิ์ให้ไปหน้า Login
  if (!user && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // กรณี Login แล้ว: ห้ามเข้าหน้า Login ซ้ำ
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 6. เพิ่ม CORS Headers ให้กับทุก Response สำเร็จ
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/login',
    '/api/v1/photographer/:path*'
  ],
}