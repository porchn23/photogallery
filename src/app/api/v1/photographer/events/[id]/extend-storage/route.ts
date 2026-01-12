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
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. ดึงข้อมูลอีเวนต์ และราคาค่าบริการจาก service_fees
    const [eventRes, feeRes] = await Promise.all([
      supabase.from('events').select('owner_id, storage_days, title').eq('id', eventId).single(),
      supabase.from('service_fees').select('price').eq('service_key', 'extend_storage').single()
    ])

    if (eventRes.error || !eventRes.data) return NextResponse.json({ error: 'ไม่พบข้อมูลอีเวนต์' }, { status: 404 })
    if (eventRes.data.owner_id !== user.id) return NextResponse.json({ error: 'คุณไม่มีสิทธิ์จัดการอีเวนต์นี้' }, { status: 403 })

    const cost = feeRes.data?.price || 49 // ราคาต่อ 1 วัน

    // 3. ตรวจสอบยอดเงินล่าสุดใน Wallet
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', user.id)
      .single()

    if (userError || !userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (userData.wallet_balance < cost) {
      return NextResponse.json({ 
        error: `ยอดเงินไม่พอสำหรับการต่ออายุ (ต้องการ ${cost} THB)` 
      }, { status: 400 })
    }

    // 4. ดำเนินการหักเงินและอัปเดต storage_days
    // 4.1 หักเงิน
    const { error: updateWalletError } = await supabase
      .from('users')
      .update({ wallet_balance: userData.wallet_balance - cost })
      .eq('id', user.id)

    if (updateWalletError) throw new Error('หักเงินไม่สำเร็จ')

    // 4.2 เพิ่ม storage_days (+1 วัน)
    const newStorageDays = (eventRes.data.storage_days || 3) + 1
    const { data: updatedEvent, error: updateEventError } = await supabase
      .from('events')
      .update({ 
        storage_days: newStorageDays,
        status: 'active' // ✅ บังคับเปลี่ยนสถานะเป็น Active ทันทีที่ต่ออายุ
      })
      .eq('id', eventId)
      .select()
      .single()

    if (updateEventError) {
      // Rollback: คืนเงินถ้าอัปเดตอีเวนต์พลาด
      await supabase.from('users').update({ wallet_balance: userData.wallet_balance }).eq('id', user.id)
      throw updateEventError
    }

    // 5. บันทึกประวัติธุรกรรม
    await supabase.from('wallet_transactions').insert({
      user_id: user.id,
      amount: -cost,
      type: 'extend_storage',
      description: `ต่ออายุการเก็บรูป (+1 วัน) ในงาน: ${eventRes.data.title}`
    })

    return NextResponse.json({
      success: true,
      message: 'ต่ออายุการเก็บรูปภาพเรียบร้อยแล้ว',
      storage_days: updatedEvent.storage_days,
      remaining_balance: userData.wallet_balance - cost
    })

  } catch (error: any) {
    console.error('API ERROR [Extend Storage]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}