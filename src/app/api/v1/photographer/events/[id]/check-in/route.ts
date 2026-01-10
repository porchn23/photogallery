import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ปรับเป็น Promise ตามมาตรฐาน Next.js 15+
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params // ต้อง await params ก่อนดึง ID
    
    // 1. ตรวจสอบสิทธิ์ตากล้อง
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { camera_id, ai_model_id, ai_beauty_enabled } = body

    if (!camera_id) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสกล้อง (camera_id)' }, { status: 400 })
    }

    // 2. ตรวจสอบว่าตากล้องเป็นเจ้าของกล้องตัวนี้จริงหรือไม่
    const { data: cameraData, error: cameraError } = await supabase
      .from('cameras')
      .select('id')
      .eq('id', camera_id)
      .eq('owner_id', user.id)
      .single()

    if (cameraError || !cameraData) {
      return NextResponse.json({ error: 'ไม่พบกล้องนี้ในคลังของคุณ หรือคุณไม่มีสิทธิ์ใช้งาน' }, { status: 404 })
    }

    // 3. ตรวจสอบโควตา Slot ของอีเวนต์
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('max_cameras')
      .eq('id', eventId)
      .single()

    if (eventError || !eventData) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลอีเวนต์' }, { status: 404 })
    }

    // นับจำนวนกล้องที่กำลัง Active อยู่ในงานนี้
    const { count: activeCount } = await supabase
      .from('event_cameras')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'active')

    if ((activeCount || 0) >= (eventData.max_cameras || 1)) {
      return NextResponse.json({ error: 'Slot กล้องในงานนี้เต็มแล้ว กรุณาซื้อ Slot เพิ่ม' }, { status: 400 })
    }

    // 4. Logic เก้าอี้ดนตรี: ปิดสถานะ Active ของกล้องนี้จากทุกงานก่อนหน้า (ถ้ามี)
    await supabase
      .from('event_cameras')
      .update({ 
        status: 'inactive', 
        last_seen: new Date().toISOString() 
      })
      .eq('camera_id', camera_id)
      .eq('status', 'active')

    // 5. เชื่อมต่อกล้องเข้าสู่งานใหม่ (Check-in)
    const { data: checkInData, error: checkInError } = await supabase
      .from('event_cameras')
      .upsert({
        event_id: eventId,
        camera_id: camera_id,
        user_id: user.id,
        status: 'active',
        last_seen: new Date().toISOString(),
        ai_model_id: ai_model_id || 1,
        ai_beauty_enabled: ai_beauty_enabled || false
      }, {
        onConflict: 'event_id, camera_id'
      })
      .select()
      .single()

    if (checkInError) {
      console.error('Check-in Database Error:', checkInError.message)
      throw new Error('ไม่สามารถเชื่อมต่อกล้องได้: ' + checkInError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'เชื่อมต่อกล้องเข้าสู่อีเวนต์เรียบร้อยแล้ว',
      data: checkInData
    })

  } catch (error: any) {
    console.error('API ERROR [Check-in]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}