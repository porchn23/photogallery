import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    
    // 1. ตรวจสอบสิทธิ์ตากล้อง
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ดึงข้อมูลอีเวนต์ และราคาค่าบริการจาก service_fees พร้อมกัน
    const [eventRes, feeRes] = await Promise.all([
      supabase.from('events').select('owner_id, max_cameras, title').eq('id', eventId).single(),
      supabase.from('service_fees').select('price').eq('service_key', 'add_slot').single()
    ])

    if (eventRes.error || !eventRes.data) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลอีเวนต์' }, { status: 404 })
    }

    // ตรวจสอบว่าเป็นเจ้าของงานหรือไม่
    if (eventRes.data.owner_id !== user.id) {
      return NextResponse.json({ error: 'คุณไม่มีสิทธิ์จัดการอีเวนต์นี้' }, { status: 403 })
    }

    // กำหนดราคา (ถ้าใน DB ไม่มีให้ใช้ค่า Default 50)
    const cost = feeRes.data?.price || 50

    // 3. ตรวจสอบยอดเงินล่าสุดใน Wallet
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (userData.wallet_balance < cost) {
      return NextResponse.json({ 
        error: `ยอดเงินไม่พอสำหรับการเพิ่ม Slot (ต้องการ ${cost} THB, มียอดคงเหลือ ${userData.wallet_balance} THB)` 
      }, { status: 400 })
    }

    // 4. ดำเนินการหักเงินและอัปเดตจำนวน Slot
    // 4.1 หักเงินจาก Wallet
    const { error: updateWalletError } = await supabase
      .from('users')
      .update({ wallet_balance: userData.wallet_balance - cost })
      .eq('id', user.id)

    if (updateWalletError) throw new Error('หักเงินไม่สำเร็จ: ' + updateWalletError.message)

    // 4.2 เพิ่มจำนวน max_cameras ในอีเวนต์ (+1)
    const newMaxCameras = (eventRes.data.max_cameras || 1) + 1
    const { data: updatedEvent, error: updateEventError } = await supabase
      .from('events')
      .update({ max_cameras: newMaxCameras })
      .eq('id', eventId)
      .select()
      .single()

    if (updateEventError) {
      // Rollback: คืนเงินถ้าอัปเดตอีเวนต์พลาด
      await supabase.from('users').update({ wallet_balance: userData.wallet_balance }).eq('id', user.id)
      throw new Error('อัปเดต Slot ไม่สำเร็จ: ' + updateEventError.message)
    }

    // 5. บันทึกประวัติการทำรายการ (Transaction)
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      amount: -cost,
      type: 'add_slot',
      description: `ซื้อ Slot กล้องเพิ่ม (+1) ในงาน: ${eventRes.data.title}`
    })

    return NextResponse.json({
      success: true,
      message: 'ซื้อ Slot เพิ่มเรียบร้อยแล้ว',
      max_cameras: updatedEvent.max_cameras,
      remaining_balance: userData.wallet_balance - cost,
      cost_deducted: cost
    })

  } catch (error: any) {
    console.error('API ERROR [Add Slot]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}