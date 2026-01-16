import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. ตรวจสอบสิทธิ์
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { title, start_time } = await request.json()
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
    const startTimeISO = start_time ? new Date(start_time).toISOString() : new Date().toISOString()

    // 4. หักเงิน
    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_balance: userData.wallet_balance - cost })
      .eq('id', user.id)

    if (updateError) throw new Error('การหักเงินล้มเหลว')

    // 5. สร้าง Event
    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert({
        owner_id: user.id,
        title,
        start_time: startTimeISO,
        join_code: joinCode,
        max_cameras: 1,
        storage_days: 2, // ค่าเริ่มต้นตามแผนใหม่
        status: 'active'
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