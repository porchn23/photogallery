import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. ตรวจสอบสิทธิ์
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, start_time, timezone, timezone_offset } = await request.json()
    const cost = 100 // ราคาเปิดงาน

    if (!title) return NextResponse.json({ error: 'กรุณาระบุชื่ออีเวนต์' }, { status: 400 })

    // 2. เช็คยอดเงินจริงใน Database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (userError || !userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (userData.wallet_balance < cost) {
      return NextResponse.json({ error: `ยอดเงินไม่พอ (ต้องการ ${cost} THB)` }, { status: 400 })
    }

    // 3. เตรียมข้อมูล
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    
    const formatToISO = (dateStr: string) => {
      if (!dateStr) return new Date().toISOString();
      // ถ้าส่งมาเป็น "2026-01-16 23:25" ให้เปลี่ยนช่องว่างเป็น T และบวก +07:00 เข้าไป
      const cleanDate = dateStr.replace(' ', 'T');
      return cleanDate.includes('+') || cleanDate.includes('Z') 
          ? new Date(cleanDate).toISOString() 
          : new Date(`${cleanDate}+07:00`).toISOString();
    };

    // --- จัดการเรื่องเวลา (UTC Normalization) ---
    let startTimeISO;
    if (start_time) {
      // ตรวจสอบว่า start_time ที่ส่งมามีเครื่องหมายบอก Timezone หรือไม่ (เช่น Z หรือ +07:00)
      const hasZone = /Z|[+-]\d{2}:?\d{2}$/.test(start_time);
      
      if (hasZone) {
        // ถ้ามี Timezone มาแล้ว (เช่นส่งมาแบบ ISO เต็มรูปแบบ) ให้ใช้ค่านั้นได้เลย
        startTimeISO = new Date(start_time).toISOString();
      } else {
        // ถ้าไม่มี Timezone (มาแค่ "2026-01-16T17:45:00") 
        // เราต้องเอา timezone_offset ที่ส่งมา (เช่น 7) มาประกอบร่างให้เป็น ISO ที่สมบูรณ์
        const offset = timezone_offset ?? 7; // ค่าเริ่มต้นเป็น +7 (ไทย)
        const sign = offset >= 0 ? '+' : '-';
        const absOffset = Math.abs(offset).toString().padStart(2, '0');
        
        // สร้าง String แบบ "2026-01-16T17:45:00+07:00"
        const fullDateStr = `${start_time.replace(' ', 'T')}${sign}${absOffset}:00`;
        
        // แปลงเป็น Date Object (JS จะแปลงเป็น UTC ให้เองโดยอัตโนมัติ)
        startTimeISO = new Date(fullDateStr).toISOString();
      }
    } else {
      // ถ้าไม่ส่งมาเลย ให้ใช้เวลาปัจจุบัน
      startTimeISO = new Date().toISOString();
    }

    // 4. หักเงิน
    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: userData.wallet_balance - cost })
      .eq('id', user.id)

    if (updateError) throw new Error('การหักเงินล้มเหลว')

    // --- สร้าง Event ---
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        owner_id: user.id,
        title,
        start_time: startTimeISO,
        join_code: joinCode,
        max_cameras: 1,
        storage_days: 2,
        status: 'active',
        timezone_name: timezone || 'Asia/Bangkok',
        timezone_offset: timezone_offset ?? 7
      })
      .select()
      .single()

    if (eventError) {
      // คืนเงินถ้าสร้าง Event พลาด (Manual Rollback)
      await supabase.from('users').update({ wallet_balance: userData.wallet_balance }).eq('id', user.id)
      throw eventError
    }

    // 6. บันทึกประวัติเงินออก
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      amount: -cost,
      type: 'create_event',
      description: `สร้างอีเวนต์: ${title}`
    })

    return NextResponse.json({
      success: true,
      event: newEvent,
      remaining_balance: userData.wallet_balance - cost
    })

  } catch (error: any) {
    console.error('API ERROR:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}