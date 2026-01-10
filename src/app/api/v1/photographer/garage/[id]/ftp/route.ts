import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: cameraId } = await params
    
    // 1. ตรวจสอบสิทธิ์
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. ดึงข้อมูลกล้อง (ต้องเป็นของตัวเองเท่านั้น)
    const { data, error } = await supabase
      .from('cameras')
      .select('nickname, ftp_url, ftp_port, ftp_user, ftp_pass')
      .eq('id', cameraId)
      .eq('owner_id', user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'ไม่พบกล้องนี้ในคลังของคุณ' }, { status: 404 })
    }

    // 3. ส่งคืนข้อมูลเฉพาะส่วนที่ใช้ตั้งค่า FTP
    return NextResponse.json({
      success: true,
      nickname: data.nickname,
      ftp_config: {
        host: data.ftp_url,
        port: data.ftp_port,
        user: data.ftp_user,
        pass: data.ftp_pass
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}