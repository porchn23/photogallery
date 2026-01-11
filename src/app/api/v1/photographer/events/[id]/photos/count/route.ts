import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    
    // 1. ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของงานหรือสมาชิก)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. นับจำนวนรูปทั้งหมดใน event นี้
    // ใช้ { count: 'exact', head: true } เพื่อให้ Supabase ส่งกลับแค่จำนวนเลข (ไม่ดึง Data มาจริงๆ) ซึ่งเร็วมาก
    const { count, error } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      event_id: eventId,
      total_photos: count || 0
    })

  } catch (error: any) {
    console.error('API ERROR [Get Photo Count]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}