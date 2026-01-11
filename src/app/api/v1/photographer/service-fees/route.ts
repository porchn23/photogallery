import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = await createClient()

    // 1. ตรวจสอบสิทธิ์ (ป้องกันคนนอกยิงดูราคาเล่น)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ดึงรายการค่าบริการทั้งหมด
    const { data, error } = await supabase
      .from('service_fees')
      .select('service_key, price, description')
      .order('service_key', { ascending: true })

    if (error) throw error

    // 3. จัดรูปแบบข้อมูลส่งกลับ
    return NextResponse.json({
      success: true,
      fees: data // ส่งเป็น Array ให้ App เอาไป filter หรือ map ใช้ได้ง่าย
    })

  } catch (error: any) {
    console.error('API ERROR [Get Service Fees]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}