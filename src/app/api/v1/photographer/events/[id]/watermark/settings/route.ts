import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    const body = await request.json()
    
    const { 
      enabled, 
      opacity, 
      size, 
      position 
    } = body

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. อัปเดตข้อมูลลง Database
    const { data, error } = await supabase
      .from('events')
      .update({
        watermark_enabled: enabled,
        watermark_opacity: opacity,
        watermark_size: size,
        watermark_position: position,
        watermark_version: Math.floor(Date.now() / 1000) // บังคับเปลี่ยน version เพื่อล้าง cache
      })
      .eq('id', eventId)
      .eq('owner_id', user.id) // เฉพาะเจ้าของงานเท่านั้น
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      settings: {
        enabled: data.watermark_enabled,
        opacity: data.watermark_opacity,
        size: data.watermark_size,
        position: data.watermark_position,
        version: data.watermark_version
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


// ... imports และ PATCH เดิม ...

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ดึงเฉพาะ setting ลายน้ำ
    const { data, error } = await supabase
      .from('events')
      .select('watermark_enabled, watermark_opacity, watermark_size, watermark_position, watermark_path, watermark_version')
      .eq('id', eventId)
      .single()

    if (error) throw error

    // Generate URL ถ้ามี
    let watermarkUrl = null
    if (data.watermark_version) {
       const bucket = process.env.NEXT_PUBLIC_DO_SPACES_BUCKET || 'face-grid-storage'
       const endpoint = (process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT || 'sgp1.digitaloceanspaces.com').replace('https://', '')
       const key = `face-grid-storage/${eventId}/watermark.png`
       watermarkUrl = `https://${bucket}.${endpoint}/${key}?v=${data.watermark_version}`
    }

    return NextResponse.json({
      success: true,
      settings: {
          enabled: data.watermark_enabled,
          opacity: data.watermark_opacity,
          size: data.watermark_size,
          position: data.watermark_position,
          url: watermarkUrl
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}