import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 1. ตรวจสอบสิทธิ์ (Authentication)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. รับค่า Join Code
    const body = await request.json()
    const { join_code } = body

    if (!join_code) {
      return NextResponse.json({ error: 'กรุณาระบุ Join Code' }, { status: 400 })
    }

    // 3. ค้นหา Event จาก Join Code
    // ต้องเป็นงานที่ยังไม่ถูก archive
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, owner_id, status, join_code')
      .eq('join_code', join_code)
      .neq('status', 'archived')
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'ไม่พบอีเวนต์ หรือรหัสเข้าร่วมไม่ถูกต้อง' }, { status: 404 })
    }

    // 4. ตรวจสอบว่าเป็นเจ้าของงานหรือไม่?
    if (event.owner_id === user.id) {
      return NextResponse.json({ error: 'คุณเป็นเจ้าของอีเวนต์นี้อยู่แล้ว' }, { status: 400 })
    }

    // 5. ตรวจสอบว่าเข้าร่วมไปแล้วหรือยัง?
    const { data: existingMember, error: memberCheckError } = await supabase
      .from('event_members')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json({ error: 'คุณได้เข้าร่วมอีเวนต์นี้ไปแล้ว' }, { status: 400 })
    }

    // 6. เพิ่มชื่อเข้าสู่ทีมงาน (Insert Member)
    const { error: joinError } = await supabase
      .from('event_members')
      .insert({
        event_id: event.id,
        user_id: user.id,
        role: 'member' // กำหนด role เริ่มต้นเป็น member
      })

    if (joinError) {
      console.error('Join Event Error:', joinError.message)
      throw new Error('ไม่สามารถเข้าร่วมอีเวนต์ได้')
    }

    return NextResponse.json({
      success: true,
      message: `เข้าร่วมงาน "${event.title}" สำเร็จ`,
      event: {
        id: event.id,
        title: event.title,
        status: event.status
      }
    })

  } catch (error: any) {
    console.error('API ERROR [Join Event]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}