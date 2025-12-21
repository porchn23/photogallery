import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. บังคับให้ Next.js มองว่าเป็น Dynamic (ห้าม Pre-render ตอน Build)
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const event = await request.json();
    console.log("--- Webhook Received ---", event.key);

    if (event.key === 'charge.complete') {
      const charge = event.data;

      if (charge.status === 'successful') {
        const userId = charge.metadata?.user_id;
        const amount = charge.amount / 100;

        // 2. ตรวจสอบ Key ข้างในฟังก์ชัน POST เท่านั้น
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error("CRITICAL: Missing Supabase Env Vars on Production");
          return NextResponse.json({ error: "Configuration Error" }, { status: 500 });
        }

        if (userId) {
          // 3. สร้าง Client เฉพาะตอนที่มีการจ่ายเงินจริงเข้ามา
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

          // --- เริ่มกระบวนการอัปเดตเงิน ---
          const { data: userData, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('wallet_balance')
            .eq('id', userId)
            .single();

          if (!fetchError && userData) {
            const newBalance = (userData.wallet_balance || 0) + amount;
            
            // อัปเดตเงิน
            await supabaseAdmin
              .from('users')
              .update({ wallet_balance: newBalance })
              .eq('id', userId);

            // บันทึกประวัติ
            await supabaseAdmin.from('wallet_transactions').insert({
              user_id: userId,
              amount: amount,
              type: 'topup',
              description: `เติมเงินสำเร็จ (Charge: ${charge.id})`
            });
            
            console.log(`SUCCESS: User ${userId} balance updated to ${newBalance}`);
          }
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("WEBHOOK_POST_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}