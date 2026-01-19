import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

/**
 * PATCH: อัปเดตสถานะ Phone Bridge ของกล้อง
 * Endpoint: /api/v1/photographer/garage/[id]/bridge
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: cameraId } = await params
    
    // 1. ตรวจสอบสิทธิ์ (ต้อง Login)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. รับค่าจาก Body (is_bridge_enabled, bridge_folder_path, bridge_last_active)
    const body = await request.json()
    const { is_bridge_enabled, bridge_folder_path, bridge_last_active } = body

    // 3. เตรียมข้อมูลสำหรับอัปเดต
    const updateData: any = {}
    if (is_bridge_enabled !== undefined) updateData.is_bridge_enabled = is_bridge_enabled
    if (bridge_folder_path !== undefined) updateData.bridge_folder_path = bridge_folder_path
    if (bridge_last_active !== undefined) {
        updateData.bridge_last_active = bridge_last_active
    } else if (is_bridge_enabled === true) {
        // ถ้าเปิดใช้งานแต่ไม่ได้ส่งเวลามา ให้ใช้เวลาปัจจุบัน
        updateData.bridge_last_active = new Date().toISOString()
    }

    // 4. บันทึกข้อมูลลงตาราง cameras (ต้องเป็นเจ้าของกล้องเท่านั้น)
    const { data, error } = await supabase
      .from('cameras')
      .update(updateData)
      .eq('id', cameraId)
      .eq('owner_id', user.id)
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'ไม่พบกล้องนี้ในคลังของคุณ หรือไม่มีสิทธิ์แก้ไข' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'อัปเดตสถานะ Phone Bridge เรียบร้อยแล้ว',
      data: {
        id: data.id,
        is_bridge_enabled: data.is_bridge_enabled,
        bridge_folder_path: data.bridge_folder_path,
        bridge_last_active: data.bridge_last_active
      }
    })

  } catch (error: any) {
    console.error('API ERROR [Update Bridge Status]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}