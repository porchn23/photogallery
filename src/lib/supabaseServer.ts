// src/lib/supabaseServer.ts
import { createServerClient } from '@supabase/ssr'
import { cookies,headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  const headersList = await headers() // นำเข้า headers จาก next/headers


  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // เซ็ตคุกกี้ไม่ได้ใน Server Component (ไม่ใช่ปัญหาสำหรับ API)
          }
        },
      },
      global: {
        headers: {
          Authorization: headersList.get('Authorization') || '',
        },
      },      
    }
  )
}