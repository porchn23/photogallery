import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    const body = await request.json()
    
    // 1. รับค่าที่ต้องการแก้ไข
    const { title, start_time } = body

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 3. ตรวจสอบว่าตากล้องเป็นเจ้าของงานจริงไหม
    const { data: eventData } = await supabase
      .from('events')
      .select('owner_id')
      .eq('id', eventId)
      .single()

    if (!eventData) return NextResponse.json({ error: 'ไม่พบงานนี้' }, { status: 404 })
    if (eventData.owner_id !== user.id) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์แก้ไขงานนี้' }, { status: 403 })
    }

    // 4. เตรียมข้อมูลอัปเดต
    const updateData: any = {}
    if (title) updateData.title = title
    if (start_time) updateData.start_time = new Date(start_time).toISOString()

    // 5. บันทึกลง Database
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


// เพิ่มต่อจากโค้ดเดิมใน src/app/api/v1/photographer/events/[id]/route.ts

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

    return NextResponse.json({
      success: true,
      event: {
        ...data,
        role: isOwner ? 'owner' : 'member',
        event_members: undefined // ล้างออกเพื่อให้คลีน
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}