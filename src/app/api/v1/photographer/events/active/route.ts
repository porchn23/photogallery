import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ดึงข้อมูล 2 อย่างพร้อมกันเพื่อความเร็ว
    const [ownerRes, memberRes] = await Promise.all([
      // 1. งานที่เป็นเจ้าของ
      supabase
        .from('events')
        .select(`id, title, start_time, status, max_cameras, storage_days, join_code, created_at, watermark_enabled, owner_id`)
        .eq('owner_id', user.id)
        .eq('status', 'active'),

      // 2. งานที่เข้าร่วม (ดึงผ่านตาราง event_members)
      supabase
        .from('event_members')
        .select(`
          events (
            id, title, start_time, status, max_cameras, storage_days, join_code, created_at, watermark_enabled, owner_id
          )
        `)
        .eq('user_id', user.id)
        .eq('events.status', 'active')
    ])

    if (ownerRes.error) throw ownerRes.error
    if (memberRes.error) throw memberRes.error

    // รวมข้อมูลและระบุ Role
    const ownerEvents = (ownerRes.data || []).map(e => ({ ...e, role: 'owner' }))
    
    // กรองเอาเฉพาะข้อมูล event ที่ไม่เป็น null (กรณี join ไม่เจอหรือสถานะไม่ใช่ active)
    const joinedEvents = (memberRes.data || [])
      .filter(m => m.events !== null)
      .map(m => ({ ...(m.events as any), role: 'member' }))

    // รวมร่างและกำจัดตัวซ้ำ (เผื่อเจ้าของไปอยู่ใน member ด้วย)
    const allEventsMap = new Map()
    
    // ใส่ member ก่อน
    joinedEvents.forEach(e => allEventsMap.set(e.id, e))
    // ใส่ owner ทับ (ถ้าซ้ำ owner จะชนะและได้ role: 'owner')
    ownerEvents.forEach(e => allEventsMap.set(e.id, e))

    const finalEvents = Array.from(allEventsMap.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      success: true,
      count: finalEvents.length,
      events: finalEvents
    })

  } catch (error: any) {
    console.error('API ERROR [Get Active Events]:', error.message)
    return NextResponse.json({ 
      error: 'ไม่สามารถดึงข้อมูลอีเวนต์ได้',
      details: error.message 
    }, { status: 500 })
  }
}