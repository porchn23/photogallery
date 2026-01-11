import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const serviceKey = searchParams.get('key') // รับค่า key จาก URL

    // 1. ตรวจสอบสิทธิ์
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. สร้าง Query
    let query = supabase
      .from('service_fees')
      .select('service_key, price, description')

    // ถ้ามีการส่ง key มา ให้ filter เฉพาะตัวนั้น
    if (serviceKey) {
      query = query.eq('service_key', serviceKey)
    } else {
      query = query.order('service_key', { ascending: true })
    }

    const { data, error } = await query

    if (error) throw error

    // 3. จัดรูปแบบข้อมูลส่งกลับ
    // ถ้าขอ key เจาะจง และเจอข้อมูล ให้ส่งกลับเป็น object เดียว (optional แล้วแต่ design แต่ส่งเป็น array กว้างๆ ไว้ก่อนก็ปลอดภัยดีครับ)
    
    return NextResponse.json({
      success: true,
      fees: data
    })

  } catch (error: any) {
    console.error('API ERROR [Get Service Fees]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}