import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, userId } = await request.json();
    
    const omise = require('omise')({
      publicKey: process.env.NEXT_PUBLIC_OMISE_PUBLIC_KEY,
      secretKey: process.env.OMISE_SECRET_KEY,
    });

    // 1. สร้าง Source
    const source = await omise.sources.create({
      type: 'promptpay',
      amount: amount * 100,
      currency: 'THB',
    });

    // 2. สร้าง Charge
    const charge = await omise.charges.create({
      amount: amount * 100,
      currency: 'THB',
      source: source.id,
      metadata: { user_id: userId }
    });

    // 3. ดึง URL รูปภาพจาก Omise (ตัวที่ติด 403)
    const downloadUri = charge.source?.scannable_code?.image?.download_uri;

    if (!downloadUri) {
      throw new Error("Omise ไม่ได้ส่ง URL ของ QR Code มาให้");
    }

    // --- ไม้ตาย: ให้ Server ไปโหลดรูปมาเองโดยใช้ Secret Key ยืนยันตัวตน ---
    const authHeader = Buffer.from(process.env.OMISE_SECRET_KEY + ':').toString('base64');
    const imageRes = await fetch(downloadUri, {
      headers: { 'Authorization': `Basic ${authHeader}` }
    });

    if (!imageRes.ok) throw new Error("ไม่สามารถดึงรูป QR จาก Omise ได้");

    // แปลงรูปเป็น Base64
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const contentType = imageRes.headers.get('content-type') || 'image/png';
    const qrDataBase64 = `data:${contentType};base64,${base64Image}`;

    return NextResponse.json({
      id: charge.id,
      qr_code: qrDataBase64, // ส่งรูปที่โหลดมาแล้วไปให้หน้าบ้าน
      status: charge.status
    });

  } catch (error: any) {
    console.error("API ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}