'use client';
import Link from 'next/link';
import { ChevronLeft, FileText, Scale, ShieldAlert, Globe, UserCheck } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-medium uppercase tracking-widest">Back to Login</span>
          </Link>
          <h1 className="text-sm font-black tracking-[0.3em] uppercase opacity-50">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-16 space-y-20">
        {/* Intro / Hero Header */}
        <section className="text-center space-y-6">
          <div className="w-20 h-20 bg-zinc-900 dark:bg-zinc-800 rounded-[2.5rem] flex items-center justify-center text-white mx-auto shadow-sm">
            <Scale size={40} />
          </div>
          <h2 className="text-4xl font-medium tracking-tight uppercase">ข้อกำหนดการใช้งาน</h2>
          <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
            ข้อตกลงและเงื่อนไขการใช้บริการแพลตฟอร์ม ROOPLIFE <br />
            <span className="text-[10px] font-bold opacity-50">ปรับปรุงล่าสุด: 25 ธันวาคม 2025</span>
          </p>
        </section>

        {/* 1. Acceptance of Terms */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <Globe className="text-blue-500" size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">1. การยอมรับข้อตกลง</h3>
          </div>
          <div className="grid gap-6 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            <p>
              การเข้าถึงหรือใช้งานแพลตฟอร์ม <strong>ROOPLIFE</strong> ถือว่าคุณได้อ่าน เข้าใจ และตกลงที่จะผูกพันตามข้อกำหนดและเงื่อนไขเหล่านี้ หากคุณไม่ตกลงตามเงื่อนไข โปรดระงับการใช้งานทันที
            </p>
          </div>
        </section>

        {/* 2. Photographer Responsibilities */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <UserCheck className="text-purple-500" size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">2. ความรับผิดชอบของผู้ใช้งาน</h3>
          </div>
          <div className="grid gap-6 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            <p>ในฐานะผู้ใช้งาน (ช่างภาพ/ผู้จัดงาน) คุณตกลงว่า:</p>
            <ul className="list-disc pl-6 space-y-4 not-italic">
              <li>คุณต้องเป็นเจ้าของลิขสิทธิ์ภาพถ่าย หรือได้รับอนุญาตอย่างถูกต้องจากเจ้าของลิขสิทธิ์</li>
              <li>คุณมีหน้าที่แจ้งบุคคลในภาพเกี่ยวกับการใช้ระบบ AI คัดแยกใบหน้า ตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล (PDPA)</li>
              <li>ภาพถ่ายที่อัปโหลดต้องไม่เป็นภาพลามกอนาจาร ละเมิดสิทธิส่วนบุคคล หรือผิดกฎหมาย</li>
            </ul>
          </div>
        </section>

        {/* 3. AI Processing & Data */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <FileText className="text-emerald-500" size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">3. การประมวลผลด้วย AI</h3>
          </div>
          <div className="grid gap-6 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            <p>ROOPLIFE ใช้เทคโนโลยี Neural Engine ในการตรวจจับและคัดแยกใบหน้า:</p>
            <ul className="list-disc pl-6 space-y-4 not-italic">
              <li>ระบบประมวลผลข้อมูลชีวมิติ (Biometric Data) เพื่อความสะดวกในการค้นหารูปภาพเท่านั้น</li>
              <li>ข้อมูลใบหน้าจะถูกเข้ารหัสและทำลายทิ้งตามระยะเวลาที่ระบบกำหนด (2-7 วัน ขึ้นอยู่กับแพ็กเกจ)</li>
              <li>เราไม่รับประกันความแม่นยำ 100% ของ AI ในกรณีที่สภาพแสงไม่เหมาะสมหรือมีการพรางใบหน้า</li>
            </ul>
          </div>
        </section>

        {/* 4. Limitation of Liability */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <ShieldAlert className="text-amber-500" size={24} />
            <h3 className="text-xl font-bold uppercase tracking-tight">4. การจำกัดความรับผิดชอบ</h3>
          </div>
          <div className="grid gap-6 text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
            <p>ROOPLIFE เป็นเพียงเครื่องมืออำนวยความสะดวกในการบริหารจัดการภาพถ่าย เราจะไม่รับผิดชอบต่อ:</p>
            <ul className="list-disc pl-6 space-y-4 not-italic">
              <li>ความสูญหายของข้อมูลในกรณีที่เกิดจากความประมาทของผู้ใช้ (เช่น การทำกุญแจ API หลุด)</li>
              <li>ข้อพิพาทด้านลิขสิทธิ์ระหว่างช่างภาพและบุคคลในภาพ</li>
              <li>การหยุดชะงักของบริการที่เกิดจากผู้ให้บริการคลาวด์หรือเหตุสุดวิสัย</li>
            </ul>
          </div>
        </section>

        {/* Footer Contact */}
        <footer className="pt-20 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Legal Support</p>
          <p className="text-sm font-medium underline">legal@rooplife.com</p>
          <p className="text-[9px] text-zinc-500 mt-12 uppercase tracking-widest">© 2025 ROOPLIFE TECHNOLOGY</p>
        </footer>
      </main>
    </div>
  );
}