import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. หา Event IDs ที่เป็น Owner
    const { data: ownerEvents } = await supabase
      .from('events')
      .select('id')
      .eq('owner_id', user.id)
      .neq('status', 'archived')
    const ownerEventIds = ownerEvents?.map(e => e.id) || []

    // 2. หา Event IDs ที่เป็น Member
    const { data: memberEvents } = await supabase
      .from('event_members')
      .select('event_id')
      .eq('user_id', user.id)

    let joinerEventIds: string[] = []
    if (memberEvents && memberEvents.length > 0) {
        const ids = memberEvents.map(m => m.event_id)
        const { data: activeJoinEvents } = await supabase
            .from('events')
            .select('id')
            .in('id', ids)
            .neq('status', 'archived')
        
        joinerEventIds = activeJoinEvents?.map(e => e.id) || []
    }

    // Helper function to create promises
    const countPhotos = (eventIds: string[]) => 
        eventIds.length > 0 ? supabase.from('photos').select('*', { count: 'exact', head: true }).in('event_id', eventIds) : Promise.resolve({ count: 0 });
    
    const countAiPhotos = (eventIds: string[]) => 
        eventIds.length > 0 ? supabase.from('photos').select('*', { count: 'exact', head: true }).in('event_id', eventIds).eq('ai_beauty', true) : Promise.resolve({ count: 0 });

    const countFaces = (eventIds: string[]) => 
        eventIds.length > 0 ? supabase.from('face_clusters').select('*', { count: 'exact', head: true }).in('event_id', eventIds) : Promise.resolve({ count: 0 });


    // 3. ดึงสถิติทั้งหมด Parallel
    const [
        ownerTotal, ownerAi,
        joinerTotal, joinerAi,
        ownerFaces, joinerFaces
    ] = await Promise.all([
        countPhotos(ownerEventIds),     // รูปทั้งหมด (Owner)
        countAiPhotos(ownerEventIds),   // รูป AI (Owner)
        
        countPhotos(joinerEventIds),    // รูปทั้งหมด (Joiner)
        countAiPhotos(joinerEventIds),  // รูป AI (Joiner)
        
        countFaces(ownerEventIds),      // หน้าคน (Owner)
        countFaces(joinerEventIds)      // หน้าคน (Joiner)
    ])

    return NextResponse.json({
      success: true,
      stats: {
          events: {
              owner_total: ownerEventIds.length,
              joiner_total: joinerEventIds.length,
              all_total: ownerEventIds.length + joinerEventIds.length
          },
          photos: {
              owner: {
                  total: ownerTotal.count || 0,
                  ai_processed: ownerAi.count || 0, // ✅ รูปที่ใช้ AI
                  normal: (ownerTotal.count || 0) - (ownerAi.count || 0)
              },
              joiner: {
                  total: joinerTotal.count || 0,
                  ai_processed: joinerAi.count || 0, // ✅ รูปที่ใช้ AI
                  normal: (joinerTotal.count || 0) - (joinerAi.count || 0)
              },
              total_ai_processed: (ownerAi.count || 0) + (joinerAi.count || 0)
          },
          faces: {
              in_owner_events: ownerFaces.count || 0,
              in_joiner_events: joinerFaces.count || 0,
              total: (ownerFaces.count || 0) + (joinerFaces.count || 0)
          }
      }
    })

  } catch (error: any) {
    console.error('API ERROR [Profile Stats]:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}