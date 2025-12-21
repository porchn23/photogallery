import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. บอก Next.js ว่าหน้านี้ต้องทำงานแบบ Real-time เท่านั้น ห้ามทำ Static Build
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // ดึงค่า Config จาก Environment
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    

    // ตรวจสอบข้อมูลที่ Omise ส่งมา
    const event = await request.json();
    console.log("--- Webhook Received --- Event:", event.key);
    console.log("--- DEBUG WEBHOOK DATA ---", JSON.stringify(event, null, 2)); // เพิ่มบรรทัดนี้    // 2. เริ่มทำงานเฉพาะเมื่อเป็นเหตุการณ์ 'charge.complete'

    if (event.key === 'charge.complete') {
      const charge = event.data;


      // 3. ถ้าจ่ายเงินสำเร็จ (successful)
      if (charge.status === 'successful') {
        const userId = charge.metadata?.user_id;
        const amount = charge.amount / 100;

        if (!userId) throw new Error("No user_id found in metadata");
        if (!supabaseUrl || !supabaseServiceKey) throw new Error("Missing Supabase Configuration");

        // 4. สร้าง Admin Client เฉพาะตอนที่มีรายการจริงเข้ามา (ป้องกัน Build Error)
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // --- เริ่มอัปเดตเงินใน Supabase ---
        const { data: userData, error: fetchError } = await supabaseAdmin
          .from('users')
          .select('wallet_balance')
          .eq('id', userId)
          .single();

        if (fetchError) throw fetchError;

        const currentBalance = userData?.wallet_balance || 0;
        const newBalance = currentBalance + amount;

        // อัปเดตยอดเงิน
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ wallet_balance: newBalance })
          .eq('id', userId);

        if (updateError) throw updateError;

        // บันทึกธุรกรรมลงประวัติ
        await supabaseAdmin.from('wallet_transactions').insert({
          user_id: userId,
          amount: amount,
          type: 'topup',
          description: `เติมเงินสำเร็จ (Charge: ${charge.id})`
        });

        console.log(`SUCCESS: Updated ${userId} balance: ${currentBalance} -> ${newBalance}`);
      }
    }

    // ตอบกลับ Omise 200 OK เสมอเพื่อบอกว่าเราได้รับข้อมูลแล้ว
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("WEBHOOK_ERROR:", error.message);
    // ส่ง 500 เพื่อให้ Omise พยายามส่งใหม่ (Retry) หากระบบเราขัดข้อง
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}