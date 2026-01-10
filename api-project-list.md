# 📱 Project Blueprint: Photographer Mobile App API
**Project Name:** ROOPLIFE Photographer Command Center
**Goal:** สร้าง Mobile App (Back-office Tools) สำหรับตากล้อง เพื่อจัดการงาน, อุปกรณ์, และการเงิน โดยแยกส่วนการแสดงผลรูปภาพ (Gallery) ไว้บนเว็บตามเดิม

---

## 1. 🎯 วัตถุประสงค์หลัก (Core Objectives)
1.  **Safety & Security:** ย้าย Logic การเงินและการหักยอด (Wallet Deduction) ไปไว้ที่ Server API ทั้งหมด
2.  **On-site Mobility:** ช่วยให้ตากล้องจัดการงานหน้างานได้ด้วยมือถือเครื่องเดียว (สร้างงาน, ซื้อ Slot, เช็คสถานะกล้อง)
3.  **Connection Helper:** อำนวยความสะดวกในการเชื่อมต่อกล้อง (FTP Credentials) และแชร์ Gallery ให้แขก (QR Code)

---

## 2. 👥 User Journey & Functional Requirements

### 2.1 🔐 ระบบยืนยันตัวตน (Authentication)
*   **Login:** เข้าสู่ระบบด้วย Email/Password (Supabase Auth)
*   **Profile:** ดูข้อมูลส่วนตัวและสถานะบัญชี

### 2.2 💰 ระบบกระเป๋าเงิน (Wallet & Payments)
*   **View Balance:** แสดงยอดเงินคงเหลือ (`wallet_balance`) แบบ Real-time
*   **Top-up:** สร้าง PromptPay QR Code เพื่อเติมเงิน (Integration: Omise)
*   **History:** ดูประวัติการทำรายการย้อนหลัง (เติมเงิน, จ่ายค่าเปิดงาน, ค่า Slot, ค่า AI)

### 2.3 🎒 ระบบคลังอุปกรณ์ (My Garage)
*   **My Camera List:** แสดงรายการกล้องที่มีอยู่
*   **Add Camera:** ลงทะเบียนกล้องใหม่ -> ระบบ Gen FTP User/Pass อัตโนมัติ
*   **View FTP Info:** **(Highlight)** แสดงข้อมูล FTP Host, Port, Username, Password ตัวใหญ่ชัดเจน พร้อมปุ่ม Copy

### 2.4 📅 ระบบจัดการงาน (Event Management)
*   **Create Event:** สร้างงานใหม่ (หัก 100 THB) -> ได้ Join Code
*   **Join Event:** เข้าร่วมทีมงานอื่นด้วยรหัส 6 หลัก
*   **Event Control:**
    *   **Share QR:** แสดง QR Code ลิงก์ Web Gallery สำหรับให้แขกสแกน
    *   **Toggle Watermark:** เปิด/ปิด ลายน้ำ
    *   **Extend Storage:** ซื้อวันเก็บรูปเพิ่ม (50 THB/วัน)

### 2.5 📸 ระบบหน้างาน (Live Operations)
*   **Check-in Camera:** เลือกกล้องเข้า Slot งาน (Musical Chairs Concept)
*   **Add Slot:** ซื้อโควตากล้องเพิ่ม (50 THB/Slot) หาก Slot เต็ม
*   **AI Config:** เลือก AI Model และเปิด/ปิด AI Beauty (แสดงราคาต่อรูปชัดเจน)
*   **Health Monitor:**
    *   ไฟสถานะ Online/Offline
    *   Counter นับจำนวนรูป
    *   แจ้งเตือน Error หาก AI ประมวลผลล้มเหลว

---

## 3. 🛠 API Architecture & Roadmap

### 📦 Phase 1: Core Wallet & Event Logic (สำคัญที่สุด)
*จัดการเรื่องเงินและความถูกต้องของข้อมูล*
*   `GET  /api/v1/wallet/balance` - ดึงยอดเงิน
*   `POST /api/v1/wallet/topup` - เติมเงิน (Omise)
*   `POST /api/v1/events/create` - สร้างงานและหักเงิน (Server-side Logic)
*   `GET  /api/v1/ai/models` - ดึงรายการ AI Model และราคา

### 📦 Phase 2: Equipment & Connection
*ช่วยให้ตากล้องเชื่อมต่อระบบได้*
*   `GET  /api/v1/garage/ftp` - ดึงรหัส FTP
*   `GET  /api/v1/events/[id]/qr` - ดึง QR Code สำหรับแขก
*   `POST /api/v1/events/check-in` - เสียบกล้องเข้า Slot

### 📦 Phase 3: Control & Expansion
*เพิ่มความยืดหยุ่นหน้างาน*
*   `POST  /api/v1/events/[id]/slot` - ซื้อ Slot เพิ่ม
*   `PATCH /api/v1/events/[id]/config` - เปิด/ปิด ลายน้ำ และ AI

### จัดการ water mark
*   `POST /api/v1/events/[id]/config` - เปิด/ปิด ลายน้ำ และ AI

### 📦 Phase 4: Monitoring
*ตรวจสอบความผิดพลาด*
*   `GET /api/v1/events/[id]/health` - ดูสถานะ Error และ Upload Count

---

## 4. 📝 Database Impact (สิ่งที่ต้องคำนึงถึง)
*   **User Table:** `wallet_balance` ต้องถูกล็อกไม่ให้แก้ไขจาก Client (RLS Policy: Read Only for User)
*   **Event Table:** `max_cameras`, `storage_days`, `watermark_enabled` ต้องอัปเดตผ่าน API เท่านั้น
*   **Logs:** ทุกธุรกรรมการเงินต้องบันทึกลง `wallet_transactions` เสมอ

---

## 5. 💡 Business Rules Summary
1.  **No Direct Wallet Edit:** ห้าม Mobile App แก้ไขยอดเงินเองเด็ดขาด
2.  **Pay Before Use:** ระบบต้องเช็คยอดเงินก่อนสร้างงานหรือเพิ่ม Slot เสมอ
3.  **Transparent Pricing:** ต้องแสดงราคา (Cost) ให้ User เห็นก่อนกด Confirm ทุกครั้ง
