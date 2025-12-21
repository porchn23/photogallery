import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Zap, Camera, Users, ShieldCheck, 
  ArrowRight, CheckCircle2, Cloud, Sparkles, Lock
} from 'lucide-react'

export default async function LandingPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* --- Navigation Bar --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden border border-zinc-100 shadow-sm">
              <Image src="/rooplife-logo/android-chrome-192x192.png" alt="Logo" fill className="object-contain p-1" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">ROOPLIFE</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <Link href="/login" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="px-5 py-2 bg-black text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/10">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 md:pt-48 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-50 text-zinc-500 rounded-full border border-zinc-100 animate-fade-in">
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Next-Gen AI Face Recognition</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-zinc-950">
            ยกระดับการจัดการภาพถ่าย <br />
            <span className="text-zinc-400">ด้วยพลังปัญญาประดิษฐ์</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-base md:text-lg text-zinc-500 font-medium leading-relaxed italic">
            "ระบบคัดแยกใบหน้าอัตโนมัติแบบ Real-time ที่ออกแบบมา <br className="hidden md:block" /> เพื่อตากล้องมืออาชีพและ Digital Asset Management"
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/5">
              เริ่มต้นสร้างอีเวนต์ <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Workflow Section --- */}
      <section className="py-24 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 text-center">
            <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600 mb-3">The Workflow</h2>
            <h3 className="text-3xl md:text-4xl font-medium tracking-tight">ขั้นตอนการทำงานที่แสนง่าย</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Zap size={20} />, title: "Create Job", desc: "เปิดงานใหม่ใน 10 วินาที พร้อมระบบคำนวณที่โปร่งใส" },
              { icon: <Camera size={20} />, title: "Connect FTP", desc: "เชื่อมต่อกล้องเข้ากับระบบอัตโนมัติ ยืดหยุ่นสูงสุด" },
              { icon: <Sparkles size={20} />, title: "AI Process", desc: "AI คัดแยกใบหน้าเบื้องหลังทันทีที่รูปถูกอัปโหลด" },
              { icon: <Users size={20} />, title: "Deliver", desc: "ลูกค้าหารูปตัวเองเจอในเสี้ยววินาที เพียงแค่สแกนหน้า" }
            ].map((step, i) => (
              <div key={i} className="p-8 bg-white border border-zinc-100 rounded-3xl space-y-5 shadow-sm hover:shadow-md transition-all group">
                <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                  {step.icon}
                </div>
                <h4 className="text-xl font-bold tracking-tight">{step.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium italic">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-3">
              <h2 className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-600">Core Features</h2>
              <h3 className="text-4xl md:text-5xl font-medium tracking-tight leading-none text-zinc-950">เหตุผลที่มืออาชีพ <br />เลือกใช้ ROOPLIFE</h3>
            </div>
            
            <div className="grid gap-6">
              {[
                { title: "Real-time Processing", desc: "คัดแยกใบหน้าทันทีขณะถ่ายงาน ไม่ต้องรอประมวลผลหลังจบงาน" },
                { title: "Musical Chairs System", desc: "สลับเปลี่ยนกล้องระหว่างงานได้อย่างอิสระ รองรับทีมงานทุกขนาด" },
                { title: "Pay-as-you-go", desc: "เติมเงินเท่าที่ใช้จริง ไม่มีค่าธรรมเนียมรายเดือนแฝง" },
                { title: "Privacy First", desc: "ระบบจัดเก็บข้อมูลปลอดภัย มาตรฐาน PDPA พร้อมการล็อคอิน Google" }
              ].map((feature, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="space-y-1">
                    <h5 className="text-base font-bold tracking-tight text-zinc-900">{feature.title}</h5>
                    <p className="text-zinc-500 text-[13px] leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative aspect-square bg-zinc-950 rounded-[3rem] overflow-hidden group shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-purple-600/10" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Cloud size={60} className="text-zinc-800 mx-auto" strokeWidth={1} />
                  <p className="text-zinc-600 text-[8px] font-black uppercase tracking-[0.4em]">High-Performance Engine</p>
                </div>
             </div>
             <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
                <p className="text-zinc-300 text-xs font-medium italic leading-relaxed text-center">
                  "นวัตกรรมการจัดการภาพถ่ายที่เปลี่ยนโจทย์ยาก ให้เป็นเรื่องง่ายในคลิกเดียว"
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* --- Minimal Centered Footer --- */}
      <footer className="py-20 border-t border-zinc-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          
          {/* Quick Links */}
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            <Link href="/policy" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/policy" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Terms of Service</Link>
            <a href="mailto:support@rooplife.com" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Support</a>
          </div>

          {/* Centered Brand Info */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden grayscale opacity-30">
              <Image src="/rooplife-logo/android-chrome-192x192.png" alt="Logo" fill className="object-contain" />
            </div>
            
            <div className="space-y-3">
              <p className="text-[10px] font-black tracking-[0.3em] text-zinc-400 uppercase">
                ROOPLIFE FACE GRID TECHNOLOGY
              </p>
              <p className="text-[9px] text-zinc-300 uppercase tracking-[0.2em]">
                © 2025 All Rights Reserved. Professional Imaging Solutions.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-50 rounded-full border border-zinc-100">
               <Lock size={10} className="text-zinc-300" />
               <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Secured by Supabase PKCE Flow</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  )
}