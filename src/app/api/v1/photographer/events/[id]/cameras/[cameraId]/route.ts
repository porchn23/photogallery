import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string, cameraId: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId, cameraId } = await params
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. รับค่าจาก Body
    const body = await request.json()
    const { ai_model_id, ai_beauty_enabled, action } = body

    // 3. ดึงค่าปัจจุบันจาก Database เพื่อตรวจสอบสิทธิ์และใช้ทำ Toggle
    const { data: currentRecord, error: findError } = await supabase
      .from('event_cameras')
      .select('id, ai_beauty_enabled, ai_model_id')
      .eq('event_id', eventId)
      .eq('camera_id', cameraId)
      .eq('status', 'active')
      .single()

    if (findError || !currentRecord) {
      return NextResponse.json({ error: 'ไม่พบการเชื่อมต่อกล้องนี้ในงานที่ระบุ' }, { status: 404 })
    }

    // 4. เตรียมข้อมูลสำหรับอัปเดต
    const updateData: any = {}

    // กรณีที่ 1: สลับสถานะ (Toggle) ถ้ามีการส่ง action: "toggle" มา
    if (action === 'toggle') {
      updateData.ai_beauty_enabled = !currentRecord.ai_beauty_enabled
    } 
    // กรณีที่ 2: อัปเดตค่าตามที่ส่งมาโดยตรง
    else {
      if (ai_beauty_enabled !== undefined) updateData.ai_beauty_enabled = ai_beauty_enabled
      if (ai_model_id !== undefined) updateData.ai_model_id = ai_model_id
    }

    // 5. บันทึกข้อมูลลง Database
    const { data: updatedData, error: updateError } = await supabase
      .from('event_cameras')
      .update(updateData)
      .eq('id', currentRecord.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      message: 'อัปเดตการตั้งค่ากล้องเรียบร้อยแล้ว',
      data: {
        ai_beauty_enabled: updatedData.ai_beauty_enabled,
        ai_model_id: updatedData.ai_model_id
      }
    })

  } catch (error: any) {
    console.error('API ERROR [Camera Settings]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}