import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

// GET: ดึงข้อมูลรายละเอียดงาน (Event Detail) พร้อมคำนวณวันหมดอายุ
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. ดึงข้อมูลงานแบบละเอียด
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        event_members (user_id)
      `)
      .eq('id', eventId)
      .single()

    if (error || !data) return NextResponse.json({ error: 'ไม่พบงานนี้' }, { status: 404 })

    // 3. ตรวจสอบสิทธิ์ (ต้องเป็นเจ้าของหรือสมาชิก)
    const isOwner = data.owner_id === user.id
    const isMember = data.event_members.some((m: any) => m.user_id === user.id)

    if (!isOwner && !isMember) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์เข้าถึงงานนี้' }, { status: 403 })
    }

    // --- LOGIC คำนวณวันหมดอายุ Storage (แก้ไขให้ใช้ start_time) ---
    const startTime = data.start_time ? new Date(data.start_time) : new Date(data.created_at)
    const storageDays = data.storage_days || 0
  

    // วันหมดอายุ = วันเริ่มงาน + จำนวนวันที่เก็บ
    const expireDate = new Date(startTime)
    expireDate.setDate(startTime.getDate() + storageDays)
    
    // คำนวณเวลาที่เหลือ (มิลลิวินาที)
    const now = new Date()
    const diffTime = expireDate.getTime() - now.getTime()
    
    // แปลงเป็นจำนวนวัน (ปัดเศษขึ้น) -> ถ้าติดลบแปลว่าหมดอายุแล้ว
    const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // สถานะ Storage: 'active' หรือ 'expired'
    const storageStatus = remainingDays > 0 ? 'active' : 'expired'
    // ----------------------------------------

    return NextResponse.json({
      success: true,
      event: {
        ...data,
        role: isOwner ? 'owner' : 'member',
        event_members: undefined, // ล้างออกเพื่อให้คลีน
        
        // ข้อมูล Storage ที่คำนวณเพิ่ม
        storage_info: {
            days_purchased: storageDays,
            expire_at: expireDate.toISOString(),
            remaining_days: remainingDays, // อาจติดลบได้ถ้าหมดอายุไปแล้ว
            status: storageStatus
        }
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH: แก้ไขข้อมูลงาน (โค้ดเดิม)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    const body = await request.json()
    
    const { title, start_time } = body

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: eventData } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single()

    if (!eventData) return NextResponse.json({ error: 'ไม่พบงานนี้' }, { status: 404 })
    if (eventData.owner_id !== user.id) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์แก้ไขงานนี้' }, { status: 403 })
    }

    const updateData: any = {}
    if (title) updateData.title = title
    if (start_time) updateData.start_time = new Date(start_time).toISOString()

    const { data: updated, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      event: updated
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}