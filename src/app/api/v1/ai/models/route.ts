import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // ดึงเฉพาะ Model ที่เปิดใช้งาน (is_active = true)
    const { data, error } = await supabase
      .from('ai_models')
      .select('id, name, description, price_per_photo, code')
      .eq('is_active', true)
      .order('price_per_photo', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}