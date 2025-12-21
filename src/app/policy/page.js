'use client';
import Link from 'next/link';
import { ChevronLeft, ShieldCheck, Lock, FileText, Scale } from 'lucide-react';

export default function PolicyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium uppercase tracking-widest">Back to Login</span>
          </Link>
          <h1 className="text-sm font-black tracking-[0.3em] uppercase opacity-50">Legal & Privacy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-16 space-y-20">
        {/* Intro */}
        <section className="text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2.5rem] flex items-center justify-center text-blue-600 mx-auto shadow-sm">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-4xl font-medium tracking-tight">นโยบายและความเป็นส่วนตัว</h2>
          <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
            เราให้ความสำคัญสูงสุดกับการปกป้องข้อมูลส่วนบุคคลของช่างภาพและบุคคลในภาพถ่ายของคุณ
          </p>
        </section>

        {/* PDPA Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Lock className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">1. PDPA & Data Privacy</h3>
          </div>
          <div className="grid gap-6 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            <p>
              แอปพลิเคชัน <strong>ROOPLIFE</strong> ดำเนินการจัดเก็บและประมวลผลข้อมูลตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA) โดยมีรายละเอียดดังนี้:
            </p>
            <ul className="list-disc pl-6 space-y-4 not-italic">
              <li><strong>การเก็บข้อมูลใบหน้า:</strong> ระบบจะประมวลผลภาพถ่ายเพื่อแยกกลุ่มใบหน้า (Face Clustering) เฉพาะภายใน Event ที่กำหนดเท่านั้น ข้อมูลเหล่านี้จะไม่ถูกนำไปใช้เพื่อระบุตัวตนในเชิงพาณิชย์อื่น</li>
              <li><strong>ระยะเวลาการจัดเก็บ:</strong> ข้อมูลภาพถ่ายและข้อมูลชีวมิติจะถูกเก็บไว้เป็นเวลา 2 วัน (หรือตามแพ็กเกจที่ซื้อเพิ่ม) หลังจากนั้นระบบจะลบข้อมูลออกจาก Server โดยถาวร</li>
              <li><strong>สิทธิ์ของเจ้าของข้อมูล:</strong> ผู้ใช้งานหรือบุคคลในภาพมีสิทธิ์ร้องขอให้ลบข้อมูลส่วนบุคคลออกจากระบบได้ทันทีผ่านช่องทางติดต่อทีมงาน</li>
            </ul>
          </div>
        </section>

        {/* Terms of Service Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <FileText className="text-purple-500" size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">2. Terms of Service</h3>
          </div>
          <div className="grid gap-6 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            <ul className="list-decimal pl-6 space-y-4 not-italic">
              <li>ช่างภาพต้องเป็นผู้รับผิดชอบต่อลิขสิทธิ์และสิทธิ์ของบุคคลในภาพที่อัปโหลดเข้าสู่ระบบ</li>
              <li>การกระทำใดๆ ที่เป็นการละเมิดสิทธิ์หรือผิดกฎหมายผ่านทางแอปพลิเคชัน จะถือเป็นความรับผิดชอบของผู้ใช้แต่เพียงผู้เดียว</li>
              <li>ระบบมีหน้าที่เป็นเพียงเครื่องมือในการจัดการและแสดงผลภาพถ่ายเท่านั้น ไม่รับผิดชอบต่อความสูญหายของข้อมูลในกรณีที่เกิดจากความประมาทของผู้ใช้</li>
            </ul>
          </div>
        </section>

        {/* Payments Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Scale className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">3. Refund & Cancellation</h3>
          </div>
          <div className="grid gap-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <p>
              รายการเติมเงินและค่าบริการเปิด Event เป็นรายการชำระแบบ Prepaid ซึ่งไม่สามารถขอคืนเงินได้ในทุกกรณี โปรดตรวจสอบรายละเอียดก่อนทำรายการทุกครั้ง
            </p>
          </div>
        </section>

        {/* Footer Contact */}
        <footer className="pt-20 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Need Help?</p>
          <p className="text-sm font-medium underline">support@rooplife.com</p>
          <p className="text-[9px] text-zinc-500 mt-12 uppercase tracking-widest">© 2025 ROOPLIFE FACE GRID TECHNOLOGY</p>
        </footer>
      </main>
    </div>
  );
}