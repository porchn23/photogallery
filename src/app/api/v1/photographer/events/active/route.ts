import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. ตรวจสอบสิทธิ์ผู้ใช้งาน
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ดึงข้อมูล Event ที่มีสถานะเป็น active และเป็นของ User คนนี้
    const { data: events, error: dbError } = await supabase
      .from('events')
      .select(`
        id,
        title,
        start_time,
        status,
        max_cameras,
        storage_days,
        join_code,
        created_at,
        watermark_enabled
      `)
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (dbError) {
      console.error('Database Error:', dbError.message)
      return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลอีเวนต์ได้' }, { status: 500 })
    }

    // 3. ส่งข้อมูลกลับ
    return NextResponse.json({
      success: true,
      count: events.length,
      events: events
    })

  } catch (error: any) {
    console.error('API ERROR [Get Active Events]:', error.message)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในระบบ' }, { status: 500 })
  }
}