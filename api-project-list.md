📸 ROOPLIFE Photographer API Handbook (v1.0)
คู่มือฉบับนี้รวบรวม Endpoint ทั้งหมดสำหรับการจัดการคลังอุปกรณ์, อีเวนต์, การเงิน และการตั้งค่า AI สำหรับแอปพลิเคชันบนมือถือ
🚀 ข้อมูลพื้นฐาน (Base Information)
Base URL: https://your-api-domain.com/api/v1
Authentication: ทุก Request (ยกเว้น Login) ต้องส่ง Header:
Authorization: Bearer <supabase_access_token>
Content-Type: application/json (ยกเว้นการอัปโหลดไฟล์)
🏦 1. Wallet & AI Models
จัดการเรื่องการเงินและเรียกดูรุ่น AI ที่พร้อมใช้งาน
1.1 ตรวจสอบยอดเงิน (Get Balance)
Method: GET
Endpoint: /photographer/wallet/balance
Success Response: { "balance": 150.50, "userId": "uuid" }
1.2 รายการ AI Models (Get AI Models)
Method: GET
Endpoint: /ai/models
Success Response: Array<{ "id": number, "name": string, "price_per_photo": number, "description": string }>
🎒 2. My Garage (ระบบคลังอุปกรณ์)
ลงทะเบียนและจัดการข้อมูลการเชื่อมต่อ FTP ประจำตัวกล้อง
2.1 รายการกล้องทั้งหมด (List Cameras)
Method: GET
Endpoint: /photographer/garage
Success Response: Array<CameraObjects> (ยกเว้นสถานะ archived)
2.2 ลงทะเบียนกล้องใหม่ (Register Camera)
Method: POST
Endpoint: /photographer/garage/create
Payload: { "nickname": string, "brand": string, "model": string }
Success Response: คืนค่าข้อมูลกล้องพร้อม ftp_config (User/Pass)
2.3 ดึงรหัส FTP (Get FTP Config)
Method: GET
Endpoint: /photographer/garage/[cameraId]/ftp
Success Response: ข้อมูล Host, Port, Username, Password สำหรับนำไปกรอกที่ตัวกล้อง
2.4 ลบกล้อง (Archive Camera)
Method: DELETE
Endpoint: /photographer/garage/[cameraId]
Note: เป็นการ Soft Delete (เปลี่ยนสถานะเป็น archived)
📅 3. Event Management (จัดการงานหน้างาน)
ระบบจัดการอีเวนต์ การหักเงิน และการเสียบกล้อง (Musical Chairs)
3.1 สร้างอีเวนต์ใหม่ (Create Event)
Method: POST
Endpoint: /photographer/events/create
Payload: { "title": string, "start_time": "ISO-String" }
Cost: 100 THB (หรือตามตาราง service_fees)
Note: ระบบจะสุ่ม join_code 6 หลักให้โดยอัตโนมัติ
3.2 แก้ไขข้อมูลงาน (Update Event)
Method: PATCH
Endpoint: /photographer/events/[id]
Payload: { "title": string, "start_time": string }
3.3 เสียบกล้องเข้างาน (Check-in Camera)
Method: POST
Endpoint: /photographer/events/[id]/check-in
Payload: { "camera_id": "uuid", "ai_model_id": number }
Logic: กล้อง 1 ตัวสามารถ Active ได้แค่ 1 งาน ณ เวลาเดียวกัน (ระบบจะเตะจากงานเก่าให้อัตโนมัติ)
3.4 ซื้อ Slot เพิ่ม (Add Slot)
Method: POST
Endpoint: /photographer/events/[id]/add-slot
Cost: 50 THB (เพิ่มจำนวนกล้องสูงสุดที่รับได้ +1)
3.5 ต่ออายุการเก็บรูป (Extend Storage)
Method: POST
Endpoint: /photographer/events/[id]/extend-storage
Cost: 50 THB (เพิ่มจำนวนวันจัดเก็บ storage_days +1 วัน)
🎨 4. Watermark & AI Settings
ควบคุมคุณภาพและความสวยงามของรูปภาพ
4.1 อัปโหลดลายน้ำ (Upload Watermark)
Method: POST
Endpoint: /photographer/events/[id]/watermark/upload
Body: multipart/form-data (Key: file, Type: .png only)
4.2 ตั้งค่าลายน้ำ (Watermark Config)
Method: PATCH
Endpoint: /photographer/events/[id]/watermark/settings
Payload: { "enabled": boolean, "opacity": float, "size": int, "position": string }
4.3 เปิด-ปิด AI รายกล้อง (Camera AI Control)
Method: PATCH
Endpoint: /photographer/events/[id]/cameras/[cameraId]
Payload (Toggle): { "action": "toggle" }
Payload (Select Model): { "ai_model_id": number }
🚨 5. Monitoring & Health
ติดตามความเรียบร้อยขณะทำงาน
5.1 สรุปภาพรวมงาน (Event Health)
Method: GET
Endpoint: /photographer/events/[id]/health
Data: จำนวนรูปทั้งหมด, จำนวน Error AI, สถานะกล้องที่ Online อยู่
5.2 รายการรูปที่เสีย (Error Logs)
Method: GET
Endpoint: /photographer/events/[id]/errors
Data: แสดงลิสท์ 20 รูปหลังสุดที่ AI ประมวลผลไม่ผ่าน พร้อมเหตุผล
⚠️ Error Standard Responses
401 Unauthorized: Token หมดอายุหรือไม่ได้ส่งมา
403 Forbidden: ไม่มีสิทธิ์จัดการข้อมูล (เช่น พยายามแก้ Event คนอื่น)
400 Bad Request: ยอดเงินไม่พอ หรือ ส่งข้อมูลผิด Format
404 Not Found: ไม่พบข้อมูลในระบบ
จัดทำเมื่อ: 11 มกราคม 2026

api/v1/
├── auth/
│   └── login/ (Supabase Direct)
├── ai/
│   └── models/
│       └── route.ts            # GET: รายการ AI Model และราคา
├── wallet/
│   ├── balance/
│   │   └── route.ts            # GET: เช็คยอดเงินบาทปัจจุบัน
│   └── history/
│       └── route.ts            # GET: ประวัติธุรกรรม (หักค่าเปิดงาน/AI/Slot)
├── garage/
│   ├── route.ts                # GET: รายการกล้องในคลัง
│   ├── create/
│   │   └── route.ts            # POST: ลงทะเบียนกล้องใหม่ (Gen FTP)
│   └── [id]/
│       ├── route.ts            # DELETE: ลบกล้อง (Soft Delete)
│       └── ftp/
│           └── route.ts        # GET: ดูรหัส FTP ประจำกล้อง
└── events/
    ├── create/
    │   └── route.ts            # POST: สร้างงานใหม่ (หัก 100 THB)
    └── [id]/
        ├── route.ts            # PATCH: แก้ไขชื่อ/เวลาอีเวนต์
        ├── check-in/
        │   └── route.ts        # POST: เสียบกล้องเข้างาน (Musical Chairs)
        ├── add-slot/
        │   └── route.ts        # POST: ซื้อ Slot เพิ่ม (หัก 50 THB)
        ├── extend-storage/
        │   └── route.ts        # POST: ต่ออายุวันเก็บรูป (หัก 50 THB)
        ├── health/
        │   └── route.ts        # GET: มอนิเตอร์จำนวนรูปและสถานะกล้อง
        ├── errors/
        │   └── route.ts        # GET: รายการรูปที่ประมวลผลพลาด
        ├── cameras/
        │   └── [cameraId]/
        │       └── route.ts    # PATCH: เปิด-ปิด AI / เลือก AI Model รายกล้อง
        └── watermark/
            ├── upload/
            │   └── route.ts    # POST: อัปโหลดรูป PNG ลายน้ำ
            └── settings/
                └── route.ts    # PATCH: ปรับค่าแสดงผลลายน้ำ


💎 สรุป Business Logic สำคัญ
หมวดหมู่	Logic หลักที่ควรทราบ
ความปลอดภัย	ใช้ proxy.ts ดัก Authentication ทุก Path ภายใต้ /api/v1/photographer/*
การเงิน	ดึงราคาบริการจากตาราง service_fees เสมอ (ห้าม Hard-code ใน App)
กล้อง	กล้อง 1 ตัว มีรหัส FTP ถาวร แต่สามารถย้ายไปมาระหว่างอีเวนต์ได้ (เก้าอี้ดนตรี)
AI	หักเงินรายรูป (Pay-per-use) โดย Backend จะหักเงินอัตโนมัติเมื่อ AI ทำงานสำเร็จ
รูปภาพ	ระบบ Gallery สำหรับแขกยังคงใช้ URL เดิม: .../event/[eventId] (แอปตากล้องมีหน้าที่แค่ Gen QR)
🛠 เทคโนโลยีที่ใช้ (Tech Stack)
Next.js 15+: API Route Handlers
Supabase SSR: Auth & Database Interaction
S3 SDK: สำหรับจัดการไฟล์ภาพลายน้ำ (DigitalOcean Spaces)
Postman: แนะนำสำหรับการทดสอบ Integration เบื้องต้น
เอกสารนี้ใช้เป็นแผนงานตั้งแตะระดับ Architect สำหรับโครงการ Mobile App