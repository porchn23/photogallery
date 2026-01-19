import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. ดึงกล้องทั้งหมดของ User
    const { data: cameras, error: camError } = await supabase
      .from('cameras')
      .select('id, nickname, brand, model, serial_number, status')
      .eq('owner_id', user.id)
      .eq('status', 'active')

    if (camError) throw camError

    // 2. ดึงข้อมูลการใช้งานกล้องใน Event (เฉพาะที่ Active อยู่)
    const { data: activeUsages, error: usageError } = await supabase
      .from('event_cameras')
      .select(`
        camera_id,
        events (
          id, title, start_time, storage_days, status
        )
      `)
      .eq('status', 'active') // active connection
      .in('camera_id', cameras.map(c => c.id)) // เฉพาะกล้องของเรา

    if (usageError) throw usageError

    // 3. Process Data & Calculate Status
    const now = new Date().getTime();
    
    // Map เก็บว่ากล้องตัวไหนติดงานอะไรบ้าง (Key: camera_id, Value: Event Info)
    const busyCameraMap = new Map();

    activeUsages?.forEach((usage: any) => {
        const event = usage.events;
        if (!event) return;

        // คำนวณวันหมดอายุจริง
        const startTime = new Date(event.start_time).getTime();
        const storageDays = event.storage_days || 0;
        const expireTime = new Date(event.start_time);
        expireTime.setDate(expireTime.getDate() + storageDays);
        const expireTimestamp = expireTime.getTime();

        // Check Logic: Event ต้อง Active AND (ยังไม่เริ่ม OR ยังไม่หมดอายุ)
        // จริงๆ ถ้า active connection อยู่แสดงว่ายังไม่ Check-out แต่เราเช็ควันหมดอายุซ้ำเพื่อความชัวร์
        const isEventActive = event.status === 'active' && now <= expireTimestamp;

        if (isEventActive) {
            busyCameraMap.set(usage.camera_id, {
                event_id: event.id,
                event_title: event.title,
                expire_at: expireTime.toISOString()
            });
        }
    });

    // 4. สร้างรายการกล้องพร้อมสถานะ
    const cameraDetails = cameras.map(cam => {
        const busyInfo = busyCameraMap.get(cam.id);
        return {
            ...cam,
            work_status: busyInfo ? 'busy' : 'idle', // สถานะการทำงาน
            current_job: busyInfo || null // รายละเอียดงานที่ทำอยู่ (ถ้ามี)
        };
    });

    // 5. นับจำนวน
    const total = cameraDetails.length;
    const busy = cameraDetails.filter(c => c.work_status === 'busy').length;
    const idle = total - busy;

    return NextResponse.json({
      success: true,
      summary: {
          total_cameras: total,
          busy_cameras: busy,
          idle_cameras: idle
      },
      cameras: cameraDetails
    })

  } catch (error: any) {
    console.error('API ERROR [Garage Summary]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}