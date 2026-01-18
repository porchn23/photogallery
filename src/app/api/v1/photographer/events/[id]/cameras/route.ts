// src/app/api/v1/photographer/events/[id]/cameras/route.ts

import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    
    // 1. ตรวจสอบสิทธิ์
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. ดึงรายการกล้องที่ Active อยู่ในงานนี้
    const { data, error } = await supabase
      .from('event_cameras')
      .select(`
        id,
        camera_id,
        user_id,
        status,
        last_seen,
        is_online,
        ai_beauty_enabled,
        ai_model_id,
        cameras (
          nickname,
          brand,
          model,
          serial_number
        ),
        ai_models (
          name,
          code
        ),
        users (
          full_name,
          avatar_url,
          phone_number
        )
      `)
      .eq('event_id', eventId)
      .eq('status', 'active')
      .order('last_seen', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      count: data?.length || 0,
      cameras: data
    })

  } catch (error: any) {
    console.error('API ERROR [Get Event Cameras]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}