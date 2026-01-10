import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. ดึงข้อมูลพร้อมกันเพื่อความรวดเร็ว
    const [eventRes, photoCountRes, errorCountRes, activeCamerasRes] = await Promise.all([
      supabase.from('events').select('title, storage_days, created_at, start_time').eq('id', eventId).single(),
      supabase.from('photos').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
      supabase.from('processing_jobs').select('id', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'error'),
      supabase.from('event_cameras').select('id, camera_id, last_seen, cameras(nickname)').eq('event_id', eventId).eq('status', 'active')
    ])

    if (eventRes.error || !eventRes.data) return NextResponse.json({ error: 'ไม่พบงาน' }, { status: 404 })

    // 3. สรุปผลลัพธ์
    return NextResponse.json({
      success: true,
      event: eventRes.data,
      stats: {
        total_photos: photoCountRes.count || 0,
        total_errors: errorCountRes.count || 0,
        active_cameras: activeCamerasRes.data?.length || 0
      },
      cameras: activeCamerasRes.data || []
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}