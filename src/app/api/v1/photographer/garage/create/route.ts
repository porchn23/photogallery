import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. ตรวจสอบข้อมูล User จาก Auth Token
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. รับค่าจาก Body (Mobile App ส่งมาแค่ชื่อกล้องและแบรนด์)
    const { nickname, brand, model } = await request.json()

    if (!nickname) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อเรียกกล้อง (Nickname)' }, { status: 400 })
    }

    // 3. สร้าง Serial Number สุ่มสำหรับอ้างอิงภายในระบบ (ถ้าตากล้องไม่ได้ระบุมา)
    const serialNumber = 'CAM-' + Math.random().toString(36).substring(2, 8).toUpperCase()

    // 4. บันทึกลงตาราง cameras
    // หมายเหตุ: ftp_user, ftp_pass, ftp_url จะถูก Gen อัตโนมัติด้วย Default Value ใน Database
    const { data: newCamera, error: dbError } = await supabase
      .from('cameras')
      .insert({
        owner_id: user.id,
        nickname: nickname,
        brand: brand || '',
        model: model || '',
        serial_number: serialNumber,
        status: 'active'
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database Error:', dbError.message)
      return NextResponse.json({ error: 'ไม่สามารถลงทะเบียนกล้องได้' }, { status: 500 })
    }

    // 5. ส่งข้อมูลกล้องพร้อมรายละเอียด FTP กลับไปให้ Mobile App
    return NextResponse.json({
      success: true,
      camera: {
        id: newCamera.id,
        nickname: newCamera.nickname,
        serial_number: newCamera.serial_number,
        ftp_config: {
          host: newCamera.ftp_url,
          port: newCamera.ftp_port,
          user: newCamera.ftp_user,
          pass: newCamera.ftp_pass
        }
      }
    })

  } catch (error: any) {
    console.error('API ERROR:', error.message)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในระบบ' }, { status: 500 })
  }
}