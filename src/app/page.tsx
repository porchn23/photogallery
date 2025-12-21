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
  // 1. Auth Guard - ตรวจสอบสถานะการเข้าใช้งาน
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
      
      {/* --- AI Typographic Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { to { background-position: 200% center; } }
        
        /* อนิเมชั่นการพูดของ AI - ปรับให้ดูพริ้วไหวขึ้น */
        @keyframes aiTalking {
          0%, 100% { opacity: 0.15; transform: scale(1) translateY(0); filter: blur(0px); }
          50% { opacity: 0.6; transform: scale(1.1) translateY(-2px); filter: blur(0.5px); }
        }

        /* อนิเมชั่นการไหลของข้อมูล (Matrix-like) */
        @keyframes dataFlow {
          0% { transform: translateY(0); opacity: 0.2; }
          50% { opacity: 0.5; color: #3b82f6; }
          100% { transform: translateY(-10px); opacity: 0.2; }
        }

        .ai-char {
          display: inline-block;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.2;
          letter-spacing: 3px;
          user-select: none;
          transition: all 0.3s ease;
        }

        /* หน้ากากควบคุมรูปทรงใบหน้าให้ดูนุ่มนวลและใหญ่ขึ้น */
        .face-mask-huge {
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
        }
      ` }} />

      {/* --- Background: Full Screen Talking AI Face --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.18] bg-[#fafafa]">
        <div className="w-screen h-screen flex flex-wrap content-center justify-center face-mask-huge px-[5vw]">
          {/* เพิ่มจำนวนตัวอักษรเป็น 4,000+ ตัวเพื่อให้เต็มพื้นที่หน้าจออย่างหนาแน่น */}
          {Array.from({ length: 4200 }).map((_, i) => {
            // คำนวณหาตำแหน่งกึ่งกลางเพื่อสร้าง "ริมฝีปาก" ที่ใหญ่ขึ้นตามขนาดหน้าจอ
            const isLipArea = i > 1800 && i < 2400 && i % 100 > 30 && i % 100 < 70;
            const chars = "01{}/\\<>[]|_+=*";
            const randomChar = chars[Math.floor(Math.random() * chars.length)];
            
            return (
              <span 
                key={i} 
                className={`ai-char ${isLipArea ? 'animate-[aiTalking_0.4s_ease-in-out_infinite]' : 'animate-[dataFlow_4s_linear_infinite]'}`}
                style={{ 
                  animationDelay: `${Math.random() * 5}s`,
                  fontSize: isLipArea ? '14px' : '9px',
                  fontWeight: isLipArea ? '900' : '300',
                  color: isLipArea ? '#2563eb' : 'inherit'
                }}
              >
                {randomChar}
              </span>
            );
          })}
        </div>
        
        {/* Ambient Glows เพื่อเพิ่มมิติความล้ำ */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/30 via-transparent to-transparent -z-10" />
      </div>

      {/* --- Navigation Bar --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-zinc-100/50">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-sm border border-zinc-100 bg-white group">
              <Image 
                src="/rooplife-logo/android-chrome-192x192.png" 
                alt="Logo" 
                fill 
                className="object-contain p-1.5 transition-transform group-hover:scale-110" 
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter uppercase leading-none">ROOPLIFE</span>
              <span className="text-[7px] font-black text-blue-600 tracking-[0.5em] uppercase mt-1.5">Neural Asset Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <Link href="/login" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">Sign In</Link>
            <Link href="/login" className="px-7 py-3 bg-zinc-950 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-48 md:pt-64 pb-36 px-6 z-10 text-center">
        <div className="max-w-5xl mx-auto space-y-14 relative">
          
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/90 backdrop-blur-md text-zinc-400 rounded-full border border-zinc-200 shadow-sm cursor-default">
            <Sparkles size={16} className="text-blue-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em]">Advanced Semantic Intelligence</span>
          </div>
          
          <div className="space-y-8">
            <h1 className="text-6xl md:text-[7rem] font-medium tracking-tight leading-[0.95] text-zinc-950">
              ยกระดับการจัดการภาพถ่าย <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-zinc-950 via-blue-500/90 to-zinc-950 bg-[length:200%_auto] animate-[shimmer_12s_linear_infinite]">
                ด้วยพลังปัญญาประดิษฐ์
              </span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-lg md:text-2xl text-zinc-500 font-medium leading-relaxed italic opacity-80">
              "เปลี่ยนทุกพิกเซลให้กลายเป็นข้อมูลที่ทรงพลัง ด้วยระบบ AI อัจฉริยะ <br className="hidden md:block" /> ที่ถูกสร้างขึ้นมาเพื่อยกระดับงานศิลปะและเทคโนโลยีให้เป็นหนึ่งเดียว"
            </p>
          </div>
          
          <div className="flex justify-center pt-8">
            <Link href="/login" className="px-16 py-8 bg-zinc-950 text-white rounded-[2.5rem] font-bold text-lg flex items-center gap-6 hover:scale-[1.03] active:scale-95 transition-all shadow-2xl shadow-blue-900/10 group">
              เริ่มต้นสร้างอีเวนต์ <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* --- Workflow Section --- */}
      <section className="relative z-10 py-32 bg-white/40 backdrop-blur-md border-y border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
            {[
              { icon: <Zap size={24} />, title: "Quantum Speed", desc: "การประมวลผลระดับวินาที เพื่อผลลัพธ์ที่ทันเวลาที่สุด" },
              { icon: <Camera size={24} />, title: "Auto-Semantic", desc: "วิเคราะห์และแยกหมวดหมู่ภาพถ่ายอย่างแม่นยำ" },
              { icon: <Sparkles size={24} />, title: "Neural Logic", desc: "ตรรกะ AI ขั้นสูงที่เข้าใจบริบทของงานภาพถ่าย" },
              { icon: <Users size={24} />, title: "Professional Trust", desc: "มาตรฐานที่ช่างภาพระดับแนวหน้าเลือกใช้งาน" }
            ].map((step, i) => (
              <div key={i} className="p-12 bg-white/80 backdrop-blur-xl border border-zinc-100 rounded-[3.5rem] space-y-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden relative">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-950 group-hover:text-white transition-all shadow-inner relative z-10">
                  {step.icon}
                </div>
                <div className="space-y-4 relative z-10">
                  <h4 className="text-2xl font-bold tracking-tight">{step.title}</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed font-medium italic opacity-80">{step.desc}</p>
                </div>
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-blue-100/50 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 py-20 bg-white/90 backdrop-blur-md border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-9 h-9 grayscale opacity-30 hover:opacity-100 transition-opacity">
              <Image src="/rooplife-logo/android-chrome-192x192.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="space-y-2.5">
              <p className="text-[10px] font-black tracking-[0.5em] text-zinc-300 uppercase leading-none">ROOPLIFE SEMANTIC TECHNOLOGY</p>
              <p className="text-[9px] text-zinc-200 uppercase tracking-[0.2em] font-medium italic">Empowering Photographers with Intelligent Infrastructure.</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 opacity-20 hover:opacity-100 transition-opacity">
             <Lock size={10} className="text-zinc-400" />
             <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] leading-none">Secured by Supabase PKCE Flow</span>
          </div>
        </div>
      </footer>
    </div>
  )
}