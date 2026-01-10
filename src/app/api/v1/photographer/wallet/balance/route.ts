// src/app/api/v1/photographer/wallet/balance/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'

export async function GET(request: Request){
  const supabase = await createClient()
  
  // ดึง User จาก Token ที่ Middleware ตรวจผ่านแล้ว
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    request.headers.get('Authorization')?.split(' ')[1] // ดึงเฉพาะ Token หลังคำว่า Bearer
  )
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ดึงยอดเงินจริงจากฐานข้อมูล
  const { data, error } = await supabase
    .from('users')
    .select('wallet_balance')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    balance: data.wallet_balance,
    userId: user.id
  })
}