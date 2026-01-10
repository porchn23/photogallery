import { NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabaseServer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT,
  region: "sgp1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_DO_SPACES_KEY!,
    secretAccessKey: process.env.NEXT_PUBLIC_DO_SPACES_SECRET!
  }
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: eventId } = await params
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. รับไฟล์จาก Multipart Form
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file || file.type !== 'image/png') {
      return NextResponse.json({ error: 'กรุณาอัปโหลดไฟล์ PNG เท่านั้น' }, { status: 400 })
    }

    // 3. อัปโหลดไปที่ S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const key = `face-grid-storage/${eventId}/watermark.png`
    
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_DO_SPACES_BUCKET || 'face-grid-storage',
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      ACL: 'public-read'
    }))

    // 4. อัปเดต Database
    const newVersion = Math.floor(Date.now() / 1000)
    await supabase.from('events').update({
      watermark_enabled: true,
      watermark_version: newVersion,
      watermark_path: key
    }).eq('id', eventId)

    return NextResponse.json({ 
      success: true, 
      version: newVersion,
      path: key 
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}