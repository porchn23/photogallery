import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

// GET: ดึงข้อมูลรายละเอียดงาน (Event Detail) พร้อมคำนวณวันหมดอายุ
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

    // --- LOGIC คำนวณวันหมดอายุที่ถูกต้อง (อิงตาม Timezone ของงาน) ---
    const startTime = new Date(data.start_time || data.created_at);
    const storageDays = data.storage_days || 0;
    const offset = data.timezone_offset ?? 7; // ใช้ offset จาก DB (ถ้าไม่มีใช้ +7)

    // 1. วันหมดอายุจริง (UTC Timestamp)
    const expireTimeMs = startTime.getTime() + (storageDays * 24 * 60 * 60 * 1000);
    const expireDate = new Date(expireTimeMs);

    // 2. คำนวณวันที่เหลือแบบ Calendar Days ใน Timezone นั้นๆ
    const now = new Date();
    
    // ฟังก์ชันช่วยหา "จุดเริ่มของวัน" (00:00) ใน timezone ของงาน
    const getLocalDayTimestamp = (date: Date, offsetHours: number) => {
        const localTime = new Date(date.getTime() + (offsetHours * 60 * 60 * 1000));
        localTime.setUTCHours(0, 0, 0, 0);
        return localTime.getTime();
    };

    const todayLocal = getLocalDayTimestamp(now, offset);
    const startLocal = getLocalDayTimestamp(startTime, offset);
    const expireLocal = getLocalDayTimestamp(expireDate, offset);

    // ถ้ายังไม่ถึงวันเริ่มงาน ให้เริ่มนับจากวันเริ่มงาน (เพื่อให้ได้เลข 2 วันเป๊ะในวันแรก)
    const effectiveToday = Math.max(todayLocal, startLocal);
    const remainingDays = Math.max(0, Math.round((expireLocal - effectiveToday) / (1000 * 60 * 60 * 24)));
    
    const storageStatus = now.getTime() < expireTimeMs ? 'active' : 'expired';

    // แปลง start_time จาก UTC เป็น Local Time ตาม offset ของงานเพื่อคืนค่าให้ Mobile App
    const localStartTime = data.start_time 
      ? new Date(new Date(data.start_time).getTime() + (offset * 60 * 60 * 1000)).toISOString().replace('Z', '')
      : null;
    // -----------------------------------------------------------

    return NextResponse.json({
      success: true,
      event: {
        ...data,
        start_time: localStartTime, // คืนค่าเป็นเวลาท้องถิ่น (เช่น 02:33:56) ตามที่ต้องการ
        role: isOwner ? 'owner' : 'member',
        event_members: undefined, // ล้างออกเพื่อให้คลีน
        
        storage_info: {
            days_purchased: storageDays,
            expire_at: expireDate.toISOString(),
            remaining_days: remainingDays,
            status: storageStatus
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH: แก้ไขข้อมูลงาน
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    const body = await request.json()
    
    // 1. รับค่าที่ต้องการแก้ไข รวมถึงข้อมูล Timezone
    const { title, start_time, timezone, timezone_offset } = body

    // 2. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 3. ตรวจสอบสิทธิ์เจ้าของงาน
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
    if (timezone) updateData.timezone_name = timezone
    if (timezone_offset !== undefined) updateData.timezone_offset = timezone_offset
    
    // --- โค้ดที่ต้องแก้ไขเพื่อให้เวลาตรงเป๊ะ ---

    if (start_time) {
      // 1. ตรวจสอบว่าส่งมาเป็น ISO ที่มีโซนอยู่แล้วหรือไม่
      const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(start_time);
      
      if (hasZone) {
        // ถ้ามีโซนมาแล้ว (เช่น ...+07:00) ให้ใช้ได้เลย
        updateData.start_time = new Date(start_time).toISOString();
      } else {
        // 2. ถ้าไม่มีโซน (ส่งมาแค่ "2026-01-16T23:45:00")
        // เราจะสร้าง Date object จากค่านั้น (ซึ่ง JS จะมองเป็นเวลาเครื่อง) 
        // แล้วเราจะหักลบ Offset ออกด้วยมือเพื่อให้เป็น UTC ที่ถูกต้อง
        const localDate = new Date(start_time);
        const offset = timezone_offset ?? 7;
        
        // แปลงเวลาท้องถิ่นให้เป็น UTC โดยการ "ลบ" offset ออก (เป็นมิลลิวินาที)
        const utcTimestamp = localDate.getTime() - (offset * 60 * 60 * 1000);
        updateData.start_time = new Date(utcTimestamp).toISOString();
      }
    }

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