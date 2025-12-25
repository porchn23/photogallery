import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Zap, Camera, Users, ShieldCheck, 
  ArrowRight, CheckCircle2, Cloud, Sparkles, Lock,
  Globe, CreditCard, Settings
} from 'lucide-react'

// นำเข้า Background ที่ลื่นไหลและพริ้วไหว
import AIFaceBackground from '../components/AIFaceBackground' 

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
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
      
      {/* --- Performance Optimized Fluid Background --- */}
      <AIFaceBackground />

      {/* --- Header / Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 md:h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden border border-zinc-100 shadow-sm bg-white">
              <Image src="/rooplife-logo/android-chrome-192x192.png" alt="Logo" fill className="object-contain p-1.5" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-black tracking-tighter uppercase leading-none">ROOPLIFE</span>
              <span className="text-[7px] font-bold text-blue-600 tracking-[0.4em] uppercase mt-1">Neural Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/login" className="px-5 py-2 md:px-6 md:py-2.5 bg-zinc-950 text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-black/5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-36 md:pt-48 pb-20 px-6 z-10 text-center">
        {/* CSS Animation สำหรับการเลื่อนของสีพาสเทล */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes text-gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-text-gradient {
            background-size: 200% auto;
            animation: text-gradient 6s linear infinite;
          }
        `}} />

        <div className="max-w-4xl mx-auto space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-md text-zinc-400 rounded-full border border-zinc-200 shadow-sm cursor-default">
            <Sparkles size={14} className="text-blue-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Next-Gen AI Photo Ecosystem</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-[1.1] px-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-blue-400 via-emerald-400 via-amber-400 to-pink-400 animate-text-gradient">
                ยกระดับการจัดการภาพถ่าย <br />
                ด้วยพลังปัญญาประดิษฐ์
              </span>
            </h1>
            
            <p className="max-w-xl mx-auto text-sm md:text-lg text-zinc-500 font-medium leading-relaxed italic opacity-80 px-6">
              "นวัตกรรมที่ช่วยให้ตากล้องมืออาชีพทำงานได้เร็วขึ้น <br className="hidden md:block" /> คัดแยกใบหน้าและส่งมอบความประทับใจในไม่กี่วินาที"
            </p>
          </div>
          
          <div className="flex justify-center pt-2">
            <Link href="/login" className="px-10 py-5 bg-zinc-950 text-white rounded-2xl font-bold text-base flex items-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-900/10 group">
              เริ่มต้นสร้างอีเวนต์ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Value Propositions (5 Key Pillars) --- */}
      {/* --- Value Propositions (7 Key Pillars) --- */}
      <section className="relative z-10 py-20 px-6 bg-[#fafafa]/50 backdrop-blur-sm border-y border-zinc-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-10 text-center px-4">
        <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-cyan-500 mx-auto shadow-sm border border-zinc-100"><Camera size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">AI Face Detection</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">ระบบตรวจจับและวิเคราะห์ใบหน้าอัจฉริยะ แม่นยำแม้ในสภาพแสงน้อย</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-pink-500 mx-auto shadow-sm border border-zinc-100"><Sparkles size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">AI Beauty</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">ยกระดับความสวยงามของภาพถ่ายด้วย AI Retouch ที่ดูเป็นธรรมชาติ</p>
          </div>
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 mx-auto shadow-sm border border-zinc-100"><Zap size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">Real-time Delivery</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">ลูกค้าได้รับภาพถ่ายทันที ผ่านระบบ AI คัดแยกใบหน้าอัจฉริยะ</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 mx-auto shadow-sm border border-zinc-100"><ShieldCheck size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">Secure & Private</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">มาตรฐาน PDPA และระบบจัดเก็บข้อมูลบน Cloud ที่มีความปลอดภัยสูง</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 mx-auto shadow-sm border border-zinc-100"><Settings size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">One-time FTP/FTPS</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">ตั้งค่า FTP/FTPS ครั้งเดียวใน Garage ใช้งานได้ทุกงาน ไม่ต้องตั้งค่าใหม่</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-500 mx-auto shadow-sm border border-zinc-100"><Users size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">Collaborative Shooting</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">รองรับช่างภาพหลายคนถ่ายงานเดียวกัน ซิงค์ทุกภาพเข้าสู่คลัง AI เดียวกันทันที</p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 mx-auto shadow-sm border border-zinc-100"><CreditCard size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">No Subscriptions</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">ไม่มีระบบรายเดือนให้ปวดหัว เติมเงินเท่าที่ใช้จริง โปร่งใส ไร้ข้อผูกมัด</p>
          </div>
        </div>
      </section>


      {/* --- Key Feature Focus --- */}
      <section className="relative z-10 py-28 px-6">
        <div className="max-w-5xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-5">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight text-zinc-950">
                AI Face Recognition <br /> 
                <span className="text-blue-600">สแกนปุ๊บ เจอปั๊บ</span>
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed italic">ไม่ต้องให้ลูกค้าเลื่อนหาภาพท่ามกลางรูปภาพนับพันอีกต่อไป AI ช่วยให้พวกเขาหารูปตัวเองเจอใน 1 วินาที</p>
              <ul className="space-y-2">
                {['คัดแยกภาพตามใบหน้าอัตโนมัติ', 'รองรับจำนวนคนได้มหาศาล', 'ความแม่นยำสูงแม้ใส่แมสก์'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs font-semibold text-zinc-700">
                    <CheckCircle2 size={14} className="text-green-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full aspect-video bg-zinc-950 rounded-[2.5rem] shadow-2xl flex items-center justify-center relative overflow-hidden group border border-white/10">
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10" />
               <Users size={60} className="text-zinc-800 opacity-20" />
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 py-16 bg-white/80 backdrop-blur-md border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-2">
            <Link href="/policy" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Terms of Service</Link>
            <a href="mailto:support@rooplife.com" className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-colors">Support</a>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-7 h-7 grayscale opacity-20">
              <Image src="/rooplife-logo/android-chrome-192x192.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black tracking-[0.3em] text-zinc-300 uppercase leading-none">ROOPLIFE TECHNOLOGY</p>
              <p className="text-[8px] text-zinc-200 uppercase tracking-[0.1em]">© 2025 Professional Imaging Infrastructure.</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 opacity-20 hover:opacity-100 transition-opacity">
             <Lock size={8} className="text-zinc-400" />
             <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Secured by Supabase PKCE Architecture</span>
          </div>
        </div>
      </footer>
    </div>
  )
}