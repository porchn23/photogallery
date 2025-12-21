import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// สร้าง Supabase Client พิเศษสำหรับหลังบ้าน (ใช้ Service Role Key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ต้องใช้ตัวนี้นะครับถึงจะแก้เงินได้ชัวร์
);

export async function POST(request: Request) {
  try {
    const event = await request.json();

    // 1. ตรวจสอบว่าเป็นเหตุการณ์ 'charge.complete' หรือไม่
    if (event.key === 'charge.complete') {
      const charge = event.data;

      // 2. ตรวจสอบว่าจ่ายสำเร็จจริงไหม (status === 'successful')
      if (charge.status === 'successful') {
        const amount = charge.amount / 100; // แปลงจากสตางค์เป็นบาท
        const userId = charge.metadata.user_id; // ดึง User ID ที่เราฝากไว้ตอนสร้าง Charge

        console.log(`--- Webhook Success --- User: ${userId}, Amount: ${amount} THB`);

        if (userId) {
          // 3. เริ่มอัปเดตข้อมูลใน Supabase
          // ก. ดึงยอดเงินปัจจุบัน
          const { data: userData, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('wallet_balance')
            .eq('id', userId)
            .single();

          if (fetchError) throw fetchError;

          const currentBalance = userData?.wallet_balance || 0;
          const newBalance = currentBalance + amount;

          // ข. อัปเดตยอดเงินใหม่
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ wallet_balance: newBalance })
            .eq('id', userId);

          if (updateError) throw updateError;

          // ค. บันทึกประวัติธุรกรรม (Transactions)
          await supabaseAdmin.from('wallet_transactions').insert({
            user_id: userId,
            amount: amount,
            type: 'topup',
            description: `เติมเงินสำเร็จผ่าน PromptPay (Charge: ${charge.id})`
          });

          console.log(`Updated balance for user ${userId}: ${currentBalance} -> ${newBalance}`);
        }
      }
    }

    // ตอบกลับ Omise ว่าเราได้รับข้อมูลแล้ว (ต้องตอบ 200 OK เสมอ)
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error("WEBHOOK ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}