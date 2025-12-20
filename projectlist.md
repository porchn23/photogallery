# 🔒 Face Grid: Phase 4 Master Requirements & Checklist

**Project:** Face Grid (Frontend & Dashboard)
**Status:** **LOCKED (ห้ามแก้ไขจนกว่าจะได้รับอนุญาต)**
**Tech Stack:** Next.js 14, Supabase, Tailwind CSS
**Currency:** THB (บาท)

---

## 1. Core Concept (คอนเซปต์หลัก)

ระบบหน้าบ้าน (Frontend) ทำหน้าที่เป็น **"Minimal Command Center"** สำหรับช่างภาพ
* **Mobile-First:** ใช้งานง่าย ปุ่มใหญ่ เน้นจบงานไว
* **Prepaid Wallet:** เติมเงินบาท (THB) ก่อนใช้งาน
* **Team Collaboration:** ทำงานร่วมกันผ่าน Join Code โดยใช้ FTP User ส่วนตัวของใครของมัน

---

## 2. Business Logic & Pricing (กฎการเงิน)

ระบบใช้หน่วยเงิน **บาท (THB)** ตัดเงินจาก `wallet_balance`

1.  **Create Event (ค่าเปิดงาน):** **100 บาท**
    * ได้รับ: สิทธิ์ใช้งาน 1 กล้อง + เก็บรูป 3 วัน (นับจาก Start Time)
2.  **Add Camera Slot (ค่าเพิ่มกล้อง):** **50 บาท** / 1 Slot
    * เงื่อนไข: จ่ายเพื่อเปิดช่องว่าง สำหรับรับกล้องเพิ่ม (ใช้ได้ตลอดงาน)
3.  **Extend Storage (ค่าเพิ่มวันเก็บรูป):** **50 บาท** / 1 วัน
    * เงื่อนไข: จ่ายเพื่อเลื่อนวันหมดอายุรูปออกไป

---

## 3. Development Checklist (รายการสิ่งที่ต้องทำ)

### 3.1 โครงสร้างพื้นฐาน (Core Infrastructure) 🏗️
- [ ] **Project Setup:** สร้าง Next.js 14 Project (App Router) + TypeScript
- [ ] **UI Framework:** ติดตั้ง Tailwind CSS และ Shadcn/UI (Button, Card, Dialog, Input, Toast)
- [ ] **Supabase Client:** สร้าง `lib/supabase.ts` เชื่อมต่อ Client Side
- [ ] **Database Types:** สร้าง `types/database.ts` ให้ตรงกับ Schema ล่าสุด (Users, Events, Cameras, Wallet, Transactions)
- [ ] **Environment Config:** ตั้งค่า `.env.local` (SUPABASE_URL, ANON_KEY)

### 3.2 ระบบยืนยันตัวตน (Authentication & Identity) 🔐
- [ ] **Login Page:** สร้างหน้า Login รองรับ Google Sign-in และ Apple Sign-in
- [ ] **Auth Middleware:** ระบบป้องกัน Route `/dashboard` (Redirect ไป Login ถ้าไม่มี Session)
- [ ] **User Profile:** แสดง Avatar และชื่อผู้ใช้
- [ ] **FTP Credential Display:**
    - [ ] แสดง Username/Password ของ FTP ที่ระบบสร้างให้ (Auto-generated)
    - [ ] ปุ่ม Copy to Clipboard สำหรับนำไปใส่กล้อง

### 3.3 ระบบกระเป๋าเงิน (Wallet System) 💰
- [ ] **Wallet Balance UI:** Component แสดงยอดเงินคงเหลือ (THB) มุมขวาบน
- [ ] **Mockup Top-up:**
    - [ ] Modal จำลองการเติมเงิน (เลือกจำนวนเงิน -> ยืนยัน)
    - [ ] บันทึกข้อมูลลงตาราง `wallet_transactions`
    - [ ] อัปเดตยอดเงินใน `users.wallet_balance`
- [ ] **Transaction History:** หน้าดูประวัติการเงิน (เติมเงิน, จ่ายค่าเปิดงาน, จ่ายค่า Slot)

### 3.4 ระบบจัดการอีเวนต์ (Event Management) 📅
- [ ] **Dashboard Landing (Empty State):**
    - [ ] ปุ่ม **(+) Create New Event** (ขนาดใหญ่)
    - [ ] ปุ่ม **(->) Join with Code**
- [ ] **Create Event Logic:**
    - [ ] ตรวจสอบเงินในกระเป๋า (ต้องมี >= 100 บาท)
    - [ ] ตัดเงิน 100 บาท และสร้าง Event ลง Database
    - [ ] Gen รหัส **Join Code** (6 หลัก) อัตโนมัติ
- [ ] **Join Event Logic:**
    - [ ] Input กรอกรหัส Join Code
    - [ ] ตรวจสอบความถูกต้องของรหัส
    - [ ] เพิ่ม User ลงในตาราง `event_members`
    - [ ] Redirect ไปหน้า Monitor

### 3.5 หน้าจอควบคุมหลัก (Live Monitor Dashboard) 🖥️
- [ ] **Monitor Header:**
    - [ ] แสดงชื่อ Event และ **Join Code** (ตัวใหญ่)
    - [ ] ปุ่ม **Finish/Archive Event** (จบงาน/ปิดรับรูป)
- [ ] **Camera Grid System:**
    - [ ] แสดงการ์ด Slot ตามจำนวน `max_cameras`
    - [ ] **Active Slot:** แสดงสถานะ Online/Offline, Serial Number, รูปที่ส่งมา
    - [ ] **Empty Slot:** แสดงปุ่มว่าง หรือสถานะรอเชื่อมต่อ
    - [ ] **Kick Action:** ปุ่มลบกล้องออกจาก Slot (เคลียร์ Serial ออกจาก DB เพื่อให้กล้องใหม่เข้าเสียบแทน)
- [ ] **Quick Purchase (Add Slot):**
    - [ ] ปุ่ม **(+) Add Slot (50 THB)**
    - [ ] Logic ตัดเงิน 50 บาท และเพิ่ม `max_cameras` +1 ทันที
- [ ] **Manual Upload (VIP Lane):**
    - [ ] พื้นที่ Drag & Drop ไฟล์รูปภาพ
    - [ ] Upload API ส่งไฟล์ไป Server โดย **ไม่นับโควตากล้อง**
- [ ] **Real-time Listener:**
    - [ ] อัปเดตสถานะกล้องทันทีเมื่อมีการเปลี่ยนแปลง (ใช้ `supabase.channel`)
    - [ ] ตัวเลข Counter รูปขยับทันทีเมื่อมีรูปเข้า

### 3.6 การตั้งค่าอีเวนต์และทีม (Settings & Team) ⚙️
- [ ] **Storage Extension:**
    - [ ] แสดงวันหมดอายุรูปปัจจุบัน (คำนวณจาก `start_time` + `storage_days`)
    - [ ] ปุ่ม **(+) Extend 1 Day (50 THB)**
    - [ ] Logic ตัดเงิน 50 บาท และเพิ่ม `storage_days` +1
- [ ] **Team Management:**
    - [ ] ตารางแสดงรายชื่อสมาชิก (Members) ที่ Join เข้ามา
    - [ ] ปุ่ม **Kick Member** (ลบสมาชิกออกจากงาน)

---

## 4. Technical Rules (กฎเหล็กทางเทคนิค)

1.  **Exclusive Camera Lock:** กล้อง 1 Serial Number สามารถ Active ได้แค่ **1 Event** เท่านั้น ณ เวลาเดียวกัน (ระบบต้องเช็คก่อน Add)
2.  **FTP Gatekeeper:**
    * หาก User ไม่มี Active Event หรือไม่ได้ Join Event -> FTP ต้อง Login ไม่เข้า
    * หาก Active -> FTP อนุญาตให้ส่งไฟล์ได้ตามโควต้าของ Event Owner
3.  **Safe Migration:** การแก้ไข Database ต้องใช้ `ALTER TABLE` เท่านั้น ห้าม `DROP` ตารางเดิมที่มีข้อมูล

---
*End of Document*