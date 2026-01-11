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

    // 2. ดึงสถิติต่างๆ แบบ Parallel
    const [photosRes, errorsRes, activeCamsRes, peopleRes] = await Promise.all([
      // นับจำนวนรูปทั้งหมด
      supabase.from('photos').select('*', { count: 'exact', head: true }).eq('event_id', eventId),
      
      // นับจำนวน Error (AI Failed)
      supabase.from('processing_jobs').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'error'),
      
      // นับจำนวนกล้องที่กำลัง Active
      supabase.from('event_cameras').select('*', { count: 'exact', head: true }).eq('event_id', eventId).eq('status', 'active'),

      // ✅ นับจำนวนคน (Face Clusters) ที่ AI แยกแยะได้
      supabase.from('face_clusters').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
    ])

    return NextResponse.json({
      success: true,
      health: {
        total_photos: photosRes.count || 0,
        total_errors: errorsRes.count || 0,
        active_cameras: activeCamsRes.count || 0,
        total_people: peopleRes.count || 0 // ✅ จำนวนคน
      }
    })

  } catch (error: any) {
    console.error('API ERROR [Get Event Health]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}