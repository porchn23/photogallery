import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ฟังก์ชันสร้าง Admin Client เฉพาะตอนจะใช้งานจริง
const getSupabaseAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase URL or Service Role Key in Environment Variables");
  }

  return createClient(url, key);
};

export async function POST(request: Request) {
  try {
    const event = await request.json();
    console.log("--- Webhook Received --- Event Type:", event.key);

    if (event.key === 'charge.complete') {
      const charge = event.data;

      if (charge.status === 'successful') {
        const amount = charge.amount / 100;
        const userId = charge.metadata.user_id;

        if (userId) {
          // เรียกใช้ Admin Client ตรงนี้
          const supabaseAdmin = getSupabaseAdmin();

          // 1. ดึงยอดเงินปัจจุบัน
          const { data: userData, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('wallet_balance')
            .eq('id', userId)
            .single();

          if (fetchError) throw fetchError;

          const currentBalance = userData?.wallet_balance || 0;
          const newBalance = currentBalance + amount;

          // 2. อัปเดตยอดเงิน
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ wallet_balance: newBalance })
            .eq('id', userId);

          if (updateError) throw updateError;

          // 3. บันทึกธุรกรรม
          await supabaseAdmin.from('wallet_transactions').insert({
            user_id: userId,
            amount: amount,
            type: 'topup',
            description: `เติมเงินสำเร็จผ่าน PromptPay (Charge: ${charge.id})`
          });

          console.log(`SUCCESS: User ${userId} balance updated: ${currentBalance} -> ${newBalance}`);
        }
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("WEBHOOK ERROR:", error.message);
    // ต้องตอบ 200 หรือ 500 ตามสถานการณ์ แต่ในที่นี้ตอบ 500 เพื่อให้ Omise รู้ว่าเรามีปัญหา
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}