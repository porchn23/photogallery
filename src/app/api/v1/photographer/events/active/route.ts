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
        .neq('status', 'archived'), // แก้ไข: ดึงทั้งหมดที่ไม่ใช่ archived เพื่อมาคำนวณ status เอง

      // 2. งานที่เข้าร่วม (ดึงผ่านตาราง event_members)
      supabase
        .from('event_members')
        .select(`
          events (
            id, title, start_time, status, max_cameras, storage_days, join_code, created_at, watermark_enabled, owner_id
          )
        `)
        .eq('user_id', user.id)
        .neq('events.status', 'archived') // แก้ไข: เช่นกัน
    ])

    if (ownerRes.error) throw ownerRes.error
    if (memberRes.error) throw memberRes.error

    // ฟังก์ชั่นคำนวณ Status
    const calculateStatus = (event: any) => {
        if (!event.start_time) return event.status; 
        if (event.status === 'archived') return 'archived'; // ถ้าถูกลบ/เก็บถาวร ให้คงเดิม

        const now = new Date().getTime();
        const startTime = new Date(event.start_time).getTime();
        const storageDays = event.storage_days || 0;
        
        // วันหมดอายุ = start_time + storage_days
        const expireTime = new Date(event.start_time);
        expireTime.setDate(expireTime.getDate() + storageDays);
        const expireTimestamp = expireTime.getTime();

        if (now < startTime) {
            return 'pending'; // ยังไม่ถึงเวลางาน
        } else if (now > expireTimestamp) {
            return 'expired'; // หมดอายุแล้ว
        } else {
            return 'active'; // กำลังดำเนินงาน
        }
    };

    // รวมข้อมูลและระบุ Role + Recalculate Status
    const ownerEvents = (ownerRes.data || []).map(e => ({ 
        ...e, 
        role: 'owner',
        status: calculateStatus(e) // Override status
    }))
    
    // กรองและ Map Member Events
    const joinedEvents = (memberRes.data || [])
      .filter(m => m.events !== null)
      .map(m => {
          const eventData = m.events as any;
          return { 
              ...eventData, 
              role: 'member',
              status: calculateStatus(eventData) // Override status
          };
      })

    // รวมร่างและกำจัดตัวซ้ำ (Deduplicate)
    const allEventsMap = new Map()
    
    joinedEvents.forEach(e => allEventsMap.set(e.id, e))
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