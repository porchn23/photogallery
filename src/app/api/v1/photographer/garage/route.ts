import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

// GET: ดึงรายการกล้องทั้งหมดในคลัง (ยกเว้นที่ลบแล้ว)
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('cameras')
    .select('*')
    .eq('owner_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: ลงทะเบียนกล้องใหม่ (ระบบจะสุ่ม FTP ให้อัตโนมัติจาก DB Default)
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { nickname, brand, model } = await request.json()

    if (!nickname) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อเรียกกล้อง' }, { status: 400 })
    }

    // สร้าง Serial Number สุ่มสำหรับระบบ
    const serialNumber = 'CAM-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    const { data, error } = await supabase
      .from('cameras')
      .insert({
        owner_id: user.id,
        nickname,
        brand: brand || '',
        model: model || '',
        serial_number: serialNumber,
        status: 'active'
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}