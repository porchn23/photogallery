import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Zap, Camera, Users, ShieldCheck, 
  ArrowRight, CheckCircle2, Cloud, Sparkles, Lock, Database
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
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
      
      {/* --- Chrome Dino Style AI Runner Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { to { background-position: 200% center; } }

        /* พื้นเลื่อน (Infinite Floor) */
        @keyframes floorMove {
          from { transform: translateX(0); }
          to { transform: translateX(-100px); }
        }

        /* ตัวคนวิ่ง (Human Running) */
        @keyframes humanRun {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }

        /* ตัวคนกระโดด (Auto Jump) */
        @keyframes autoJump {
          0%, 20%, 40%, 60%, 80%, 100% { transform: translateY(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateY(-70px); } /* กระโดดเมื่อเจอสิ่งกีดขวาง */
        }

        /* สิ่งกีดขวาง (Obstacles - Cameras/Data) */
        @keyframes obstacleMove {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100vw); }
        }

        .runner-container {
          position: fixed;
          bottom: 25%;
          left: 0;
          width: 100%;
          height: 150px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.4;
        }

        .ground-line {
          position: absolute;
          bottom: 50px;
          left: 0;
          width: 200%;
          height: 2px;
          background: repeating-linear-gradient(90deg, #e2e8f0 0, #e2e8f0 40px, transparent 40px, transparent 80px);
          animation: floorMove 1s linear infinite;
        }

        .human-runner {
          position: absolute;
          bottom: 52px;
          left: 15%;
          width: 40px;
          height: 60px;
          stroke: #3b82f6;
          stroke-width: 2;
          fill: none;
          animation: humanRun 0.4s steps(2) infinite, autoJump 5s infinite;
        }

        .obstacle {
          position: absolute;
          bottom: 52px;
          right: -100px;
          width: 30px;
          height: 30px;
          color: #94a3b8;
          animation: obstacleMove 2.5s linear infinite;
        }
      ` }} />

      {/* --- Background AI Runner Scene --- */}
      <div className="runner-container">
        {/* Ground */}
        <div className="ground-line" />
        
        {/* Automatic Runner (The AI Photographer) */}
        <svg className="human-runner" viewBox="0 0 40 60">
          <path d="M20,10 C20,5 25,5 25,10 C25,15 20,15 20,10 M20,15 L20,35 L10,50 M20,35 L30,50 M20,20 L35,25 L38,20" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Dynamic Obstacles (Cameras, Data, Cloud) */}
        <div className="obstacle" style={{ animationDelay: '0s' }}><Camera size={24} /></div>
        <div className="obstacle" style={{ animationDelay: '1.25s' }}><Database size={20} /></div>
        <div className="obstacle" style={{ animationDelay: '2.5s' }}><Zap size={22} /></div>
        <div className="obstacle" style={{ animationDelay: '3.75s' }}><Cloud size={24} /></div>
      </div>

      {/* --- UI Content (ซ้อนทับอยู่ด้านบน) --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-100 shadow-sm bg-white">
              <Image src="/rooplife-logo/android-chrome-192x192.png" alt="Logo" fill className="object-contain p-1" />
            </div>
            <span className="text-lg font-black tracking-tighter uppercase">ROOPLIFE</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black">Sign In</Link>
            <Link href="/login" className="px-5 py-2 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 md:pt-56 pb-24 px-6 z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-10 relative">
          
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur-md text-zinc-500 rounded-full border border-zinc-100 shadow-sm">
            <Sparkles size={14} className="text-blue-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em]">Autonomous AI Photographer Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight leading-[1.1] text-zinc-950">
            ยกระดับการจัดการภาพถ่าย <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-950 via-blue-500 to-zinc-950 bg-[length:200%_auto] animate-[shimmer_10s_linear_infinite]">
              ด้วยพลังปัญญาประดิษฐ์
            </span>
          </h1>
          
          <p className="max-w-xl mx-auto text-base md:text-lg text-zinc-500 font-medium leading-relaxed italic opacity-80">
            "ระบบที่วิ่งไปข้างหน้าพร้อมกับเทคโนโลยี AI <br className="hidden md:block" /> เพื่อจัดการทุกรูปถ่ายให้สมบูรณ์แบบโดยอัตโนมัติ"
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <Link href="/login" className="w-full sm:w-auto px-10 py-5 bg-zinc-950 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-900/10 group">
              เริ่มต้นสร้างอีเวนต์ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Workflow Section --- */}
      <section className="relative z-10 py-20 bg-white/40 backdrop-blur-sm border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Zap size={20} />, title: "Instant Setup", desc: "เริ่มงานใหม่ได้เร็วกว่าที่เคย" },
              { icon: <Camera size={20} />, title: "Live Upload", desc: "ส่งรูปเข้า Cloud ทันทีที่กดชัตเตอร์" },
              { icon: <Sparkles size={20} />, title: "AI Sorting", desc: "คัดแยกใบหน้าด้วย AI อัจฉริยะ" },
              { icon: <Users size={20} />, title: "Zero Wait", desc: "ลูกค้าได้รูปทันใจ ไม่ต้องรอนาน" }
            ].map((step, i) => (
              <div key={i} className="p-8 bg-white/80 backdrop-blur-md border border-zinc-100 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all group">
                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all">
                  {step.icon}
                </div>
                <h4 className="text-lg font-bold tracking-tight">{step.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed font-medium italic">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Minimal Footer --- */}
      <footer className="relative z-10 py-16 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-6 h-6 grayscale opacity-20">
              <Image src="/rooplife-logo/android-chrome-192x192.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-black tracking-[0.3em] text-zinc-300 uppercase leading-none">ROOPLIFE TECHNOLOGY</p>
              <p className="text-[8px] text-zinc-200 uppercase tracking-[0.1em]">© 2025 Professional Imaging Infrastructure.</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 opacity-20">
             <Lock size={8} className="text-zinc-400" />
             <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none text-center">Secured by Supabase PKCE Flow</span>
          </div>
        </div>
      </footer>
    </div>
  )
}