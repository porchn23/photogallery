import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    
    // 1. ตรวจสอบสิทธิ์ (ต้อง Login ก่อนถึงจะลบได้)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. ทำ Soft Delete (เปลี่ยน status เป็น deleted)
    // หมายเหตุ: ตาราง users ต้องมี column 'status'
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        status: 'deleted',
        // อาจจะเพิ่ม timestamp วันที่ลบด้วยถ้ามี field (เช่น deleted_at)
        // deleted_at: new Date().toISOString() 
      })
      .eq('id', user.id)

    if (updateError) {
      throw updateError
    }

    // 3. (Optional) Sign out user จากฝั่ง Server
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'บัญชีของคุณถูกระงับการใช้งานแล้ว (Soft Delete)'
    })

  } catch (error: any) {
    console.error('API ERROR [Delete Account]:', error.message)
    return NextResponse.json({ 
      error: 'ไม่สามารถลบบัญชีได้',
      details: error.message 
    }, { status: 500 })
  }
}