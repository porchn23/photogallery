import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home() {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  // ตรวจสอบ Session จากฝั่ง Server
  const { data: { user } } = await supabase.auth.getUser()

  // 1. ถ้าล็อคอินแล้ว -> ส่งไปหน้า Dashboard
  if (user) {
    redirect('/dashboard')
  }

  // 2. ถ้ายังไม่ได้ล็อคอิน -> ส่งไปหน้า Login
  redirect('/login')

  // หมายเหตุ: หน้านี้จะไม่ถูก render ออกมาจริงๆ เพราะถูก redirect ไปก่อน
  return null
}