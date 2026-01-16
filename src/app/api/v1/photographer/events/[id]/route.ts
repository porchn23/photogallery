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

    const startTimeMs = new Date(data.start_time || data.created_at).getTime();
    const storageDays = data.storage_days || 0;
    const nowTimeMs = Date.now();

    // 1. วันหมดอายุ (UTC Timestamp)
    const expireTimeMs = startTimeMs + (storageDays * 24 * 60 * 60 * 1000);
    const expireDate = new Date(expireTimeMs);

    // 2. ป้องกันเลขดีดเป็น 3 วัน (ถ้ายังไม่เริ่มงาน ให้ถือว่าตอนนี้คือเวลาเริ่มงาน)
    const effectiveNow = Math.max(nowTimeMs, startTimeMs);
    const diffMs = expireTimeMs - effectiveNow;

    // 3. คำนวณวันคงเหลือ (ปัดเศษขึ้น)
    const remainingDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    const storageStatus = nowTimeMs < expireTimeMs ? 'active' : 'expired';


    return NextResponse.json({
      success: true,
      event: {
        ...data,
        role: isOwner ? 'owner' : 'member',
        storage_info: {
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

// PATCH: แก้ไขข้อมูลงาน (โค้ดเดิม)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    const body = await request.json()
    
    // 1. รับค่าที่ต้องการแก้ไข รวมถึง Timezone ข้อมูล
    const { title, start_time, timezone, timezone_offset } = body

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
    if (timezone) updateData.timezone_name = timezone
    if (timezone_offset !== undefined) updateData.timezone_offset = timezone_offset
    
    if (start_time) {
      // ตรวจสอบว่า start_time มีโซนติดมาด้วยหรือไม่
      const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(start_time);
      if (hasZone) {
        updateData.start_time = new Date(start_time).toISOString();
      } else {
        // หากไม่มีโซน ให้ใช้ timezone_offset ที่ส่งมา (ถ้าไม่มีใช้ +07 เป็นค่าพื้นฐาน)
        const offset = timezone_offset ?? 7;
        const sign = offset >= 0 ? '+' : '-';
        const absOffset = Math.abs(offset).toString().padStart(2, '0');
        updateData.start_time = new Date(`${start_time}${sign}${absOffset}:00`).toISOString();
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