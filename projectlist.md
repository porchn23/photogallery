# 🔒 ROOPLIFE Face Grid: Phase 4 Master Requirements & Checklist

**Project:** ROOPLIFE Face Grid (Frontend & Dashboard)
**Status:** **LOCKED (ห้ามแก้ไขจนกว่าจะได้รับอนุญาต)**
**Tech Stack:** Next.js 14, Supabase, Tailwind CSS
**Currency:** THB (บาท)

---

## 1. Core Concept (คอนเซปต์หลัก) 🧠

ระบบหน้าบ้าน (Frontend) ทำหน้าที่เป็น **"Minimal Command Center"** สำหรับช่างภาพ
* **Mobile-First (PWA):** ใช้งานง่ายบนมือถือ ติดตั้งได้โดยไม่ต้องผ่าน Store เน้นจบงานไว
* **Prepaid Wallet:** เติมเงินบาท (THB) ก่อนใช้งาน
* **My Garage Assets:** ลงทะเบียนกล้องครั้งเดียว ได้ FTP ถาวรประจำกล้อง (Register Once, Use Everywhere)
* **Musical Chairs:** การทำงานแบบเก้าอี้ดนตรี ใครจะส่งรูปต้องกด "Check-in" กล้องตัวเองเข้า Slot ในงาน

---

## 2. Business Logic & Pricing (กฎการเงิน) 💰

ระบบใช้หน่วยเงิน **บาท (THB)** ตัดเงินจาก `wallet_balance`

1.  **Create Event (ค่าเปิดงาน):** **100 บาท**
    * ได้รับ: สิทธิ์ใช้งาน 1 กล้อง (1 Slot) + เก็บรูป 3 วัน (นับจาก Start Time)
2.  **Add Camera Slot (ค่าเพิ่มกล้อง):** **50 บาท** / 1 Slot
    * เงื่อนไข: จ่ายเพื่อเพิ่มจำนวน "เก้าอี้ว่าง" ในงาน (Capacity) ให้รองรับกล้องได้มากขึ้น
3.  **Extend Storage (ค่าเพิ่มวันเก็บรูป):** **50 บาท** / 1 วัน
    * เงื่อนไข: จ่ายเพื่อเลื่อนวันหมดอายุรูปออกไป

---

## 3. Development Checklist (รายการสิ่งที่ต้องทำ) ✅

### 3.1 โครงสร้างพื้นฐาน (Core Infrastructure) 🏗️
- [ ] **Project Setup:** สร้าง Next.js 14 Project (App Router) + TypeScript
- [ ] **UI Framework:** ติดตั้ง Tailwind CSS และ Shadcn/UI (Button, Card, Dialog, Input, Toast)
- [ ] **Supabase Client:** สร้าง `lib/supabase.ts` เชื่อมต่อ Client Side
- [ ] **PWA Configuration:** ตั้งค่า `manifest.json` และ Icons ให้ติดตั้งบนมือถือได้
- [ ] **Database Types:** สร้าง `types/database.ts` ให้ตรงกับ Schema ล่าสุด (`users`, `cameras`, `events`, `event_checkins`, `wallet`)
- [ ] **Environment Config:** ตั้งค่า `.env.local` (SUPABASE_URL, ANON_KEY)

### 3.2 ระบบยืนยันตัวตน (Authentication & Identity) 🔐
- [ ] **Login Interface:** ออกแบบหน้า Login ที่เรียบง่าย (Mobile Friendly)
    - [ ] **Option 1: Phone Login (OTP)**
        - [ ] Input กรอกเบอร์โทรศัพท์ (Thailand +66)
        - [ ] ระบบส่ง SMS OTP (ใช้ Supabase Auth + SMS Provider)
        - [ ] Input กรอกรหัส OTP 6 หลัก -> เข้าใช้งานทันที
    - [ ] **Option 2: Google Login**
        - [ ] ปุ่ม "Continue with Google"
- [ ] **Auth Middleware:** ระบบป้องกัน Route `/dashboard` (Redirect ไป Login ถ้าไม่มี Session)
- [ ] **User Profile:**
    - [ ] รองรับ User ที่ไม่มี Email (กรณีใช้เบอร์โทร)
    - [ ] UI สำหรับตั้งชื่อ (Display Name) หลัง Login ครั้งแรก

### 3.3 ระบบคลังอุปกรณ์ (My Garage & Assets) 🎒
*ส่วนนี้ทำฟรี ลงทะเบียนครั้งเดียวใช้ได้ตลอดชีพ*
- [ ] **My Garage Page:** หน้าแสดงรายการกล้องทั้งหมดของฉัน
- [ ] **Add Camera Flow:**
    - [ ] ปุ่ม **(+) Add Camera** (ตั้งชื่อกล้องได้ เช่น *Sony A7 - Golf*)
    - [ ] ระบบ Gen **FTP User/Pass** ประจำกล้องให้อัตโนมัติ (ห้ามซ้ำในระบบ)
- [ ] **Camera Card:**
    - [ ] แสดงชื่อกล้อง และ FTP Credential
    - [ ] ปุ่ม Copy Config หรือ QR Code สำหรับนำไปใส่กล้อง

### 3.4 ระบบกระเป๋าเงิน (Wallet System) 💵
- [ ] **Wallet Balance UI:** Component แสดงยอดเงินคงเหลือ (THB) มุมขวาบน
- [ ] **Mockup Top-up:**
    - [ ] Modal จำลองการเติมเงิน (เลือกจำนวนเงิน -> ยืนยัน)
    - [ ] บันทึกข้อมูลลงตาราง `wallet_transactions`
    - [ ] อัปเดตยอดเงินใน `users.wallet_balance`
- [ ] **Transaction History:** หน้าดูประวัติการเงิน (เติมเงิน, จ่ายค่าเปิดงาน, จ่ายค่า Slot)

### 3.5 ระบบจัดการอีเวนต์ (Event Management) 📅
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
    - [ ] เพิ่ม User ลงใน Member List
    - [ ] Redirect ไปหน้า Monitor

### 3.6 หน้าจอควบคุมหลัก (Musical Chairs Dashboard) 💺
- [ ] **Monitor Header:**
    - [ ] แสดงชื่อ Event และ **Join Code**
    - [ ] **Status Bar:** แสดงจำนวน Slot ที่ใช้ไป (เช่น *Active: 2/3*)
    - [ ] ปุ่ม **Finish/Archive Event** (จบงาน)
- [ ] **Check-in System (การเสียบกล้อง):**
    - [ ] **Slot Grid:** แสดงรายการกล้องที่ Active อยู่
    - [ ] **Check-in Action:**
        - [ ] ปุ่ม **(+) Connect Camera**
        - [ ] Modal เด้งขึ้นมาให้เลือกกล้องจาก "My Garage"
        - [ ] **Validation:** ตรวจสอบว่า Slot เต็มหรือยัง?
            - [ ] ถ้าว่าง -> Insert ลง `event_checkins` -> กล้อง Online ✅
            - [ ] ถ้าเต็ม -> Alert "Event Full" ❌
- [ ] **Kick Action (Moderation):**
    - [ ] เจ้าของงานกดปุ่ม **Kick** ที่การ์ดกล้อง -> ลบ Record ออกจาก `event_checkins` (เพื่อให้คนอื่นเสียบแทนได้)
- [ ] **Quick Purchase (Add Slot):**
    - [ ] ปุ่ม **(+) Buy Slot (50 THB)**
    - [ ] Logic ตัดเงิน 50 บาท และเพิ่ม `max_slots` +1 ทันที
- [ ] **Manual Upload (VIP Lane):**
    - [ ] พื้นที่ Drag & Drop ไฟล์รูปภาพ (ส่งตรงไม่ผ่าน FTP กล้อง)
- [ ] **Real-time Listener:**
    - [ ] อัปเดตรายการกล้องทันทีที่มีคน Check-in/Kick ออก (ใช้ `supabase.channel`)

### 3.7 การตั้งค่าอีเวนต์และทีม (Settings & Team) ⚙️
- [ ] **Storage Extension:**
    - [ ] แสดงวันหมดอายุรูปปัจจุบัน (คำนวณจาก `start_time` + `storage_days`)
    - [ ] ปุ่ม **(+) Extend 1 Day (50 THB)**
    - [ ] Logic ตัดเงิน 50 บาท และเพิ่ม `storage_days` +1
- [ ] **Team Management:**
    - [ ] ตารางแสดงรายชื่อสมาชิก (Members) ที่ Join เข้ามา
    - [ ] ปุ่ม **Kick Member** (ลบสมาชิกออกจากงาน)

---

## 4. Technical Rules (กฎเหล็กทางเทคนิค) ⚠️

1.  **Unique Active Session:** กล้อง 1 ตัว (Reference จาก `camera_id`) สามารถ Check-in ได้แค่ **1 Event** เท่านั้น ณ เวลาเดียวกัน (ระบบต้องเช็ค Constraint นี้ใน Database)
2.  **FTP Gatekeeper Logic:**
    * เมื่อมี Connection เข้ามา -> ตรวจสอบ User/Pass ว่าตรงกับ `cameras` table หรือไม่?
    * **Active Check:** ตรวจสอบว่า `camera_id` นี้ มีรายชื่ออยู่ในตาราง `event_checkins` หรือไม่?
        * ถ้ามี -> **Accept** (รับรูป)
        * ถ้าไม่มี -> **Reject** (ตัดสาย)
3.  **Safe Migration:** การแก้ไข Database ต้องใช้ `ALTER TABLE` เท่านั้น ห้าม `DROP` ตารางเดิมที่มีข้อมูล

---
*End of Master Checklist*