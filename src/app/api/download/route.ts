import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'image.jpg';

  console.log(`[Download API] Requesting: ${url}`); // ✅ Debug URL

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url);
    
    // ✅ เช็ค Status Code จาก Cloud Storage
    if (!response.ok) {
        console.error(`[Download API] Cloud Error: ${response.status} ${response.statusText}`);
        return NextResponse.json({ error: `Cloud Storage Error: ${response.statusText}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    console.log(`[Download API] Content-Type: ${contentType}`); // ✅ Debug Type

    // ถ้า Content-Type ไม่ใช่รูปภาพ (เช่นเป็น text/html หรือ application/xml) แสดงว่า URL ผิด
    if (!contentType || !contentType.startsWith('image/')) {
        const text = await response.text();
        console.error(`[Download API] Invalid Content-Type. Response: ${text.substring(0, 100)}...`);
        return NextResponse.json({ error: 'Invalid file type from source' }, { status: 400 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error(`[Download API] Fetch Error:`, error);
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 });
  }
}