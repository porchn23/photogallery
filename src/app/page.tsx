import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Zap, Camera, Users, ShieldCheck, 
  ArrowRight, CheckCircle2, Cloud, Sparkles, Lock,
  Globe, CreditCard, Settings, Plus, QrCode, FileImage, 
  Star, BarChart3 // ✅ เพิ่ม Icon ใหม่
} from 'lucide-react'

// นำเข้า Background ที่ลื่นไหลและพริ้วไหว
import AIFaceBackground from '../components/AIFaceBackground' 
import BeforeAfterSlider from '../components/BeforeAfterSlider'

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
    <div suppressHydrationWarning className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
      
      {/* --- Performance Optimized Fluid Background --- */}
      <AIFaceBackground />

      {/* --- Header / Navigation --- */}
      <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-xl border-b border-zinc-100/50">
      <div className="max-w-7xl mx-auto px-6 h-14 md:h-16 flex items-center justify-between">
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

      {/* --- 1. Hero Section --- */}
      <section className="relative pt-24 md:pt-32 pb-12 px-6 z-10 text-center">
        {/* Fluid Background Layer */}
        <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-white via-transparent to-white/80 pointer-events-none" />

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Badge ราคา & โปรโมชั่น */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-md text-zinc-600 rounded-full border border-zinc-200 shadow-sm cursor-default hover:scale-105 transition-transform">
            <Sparkles size={14} className="text-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">สมัครวันนี้ รับฟรี 200 เครดิต</span>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-tight px-4">
              เปลี่ยนงานอีเวนต์ให้ <span className="text-blue-600">ล้ำสมัย</span> <br />
              ด้วยระบบส่งภาพ <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-text-gradient">AI Real-time</span>
            </h1>
            
            <p className="max-w-xl mx-auto text-sm md:text-base text-zinc-500 font-medium leading-relaxed italic opacity-80 px-6">
              "แค่สแกน QR Code ลูกค้าก็ได้รูปตัวเองทันที ไม่ต้องรอนาน <br className="hidden md:block" /> ยกระดับประสบการณ์งานวิ่ง งานแต่ง และปาร์ตี้บริษัท ด้วยต้นทุนหลักร้อย"
            </p>
          </div>

          {/* Grid Icons (✅ ปรับปรุงตรงนี้) */}
          <div className="py-8 grid grid-cols-2 md:grid-cols-4 gap-6 justify-items-center max-w-4xl mx-auto">
            {[
              { icon: <Users size={20} />, title: "AI Face Sort", desc: "แยกหน้าคนอัตโนมัติ" },
              { icon: <Star size={20} />, title: "AI Scoring", desc: "ให้คะแนนความสวยด้วย AI" }, // ✅ เปลี่ยน Beauty เป็น Scoring
              { icon: <BarChart3 size={20} />, title: "Quality Check", desc: "วัดค่าความคมชัดของภาพ" }, // ✅ เปลี่ยน Screening เป็น Quality Check
              { icon: <Settings size={20} />, title: "AI Manager", desc: "จัดระเบียบไฟล์ภาพอัตโนมัติ" },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 group cursor-default">
                <div className="w-12 h-12 rounded-full bg-white border border-zinc-100 shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:border-blue-200 group-hover:shadow-blue-100 transition-all duration-300">
                  {item.icon}
                </div>
                <div className="text-center">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                  <p className="text-[9px] text-zinc-400 font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button Group */}
          <div className="flex flex-col items-center pt-0 space-y-4">
            <Link href="/login" className="px-10 py-5 bg-zinc-950 text-white rounded-2xl font-bold text-base flex items-center gap-4 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-900/10 group">
              เริ่มต้นสร้างอีเวนต์ <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Value Hook */}
            <p className="text-[10px] md:text-xs text-zinc-400 font-medium flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-default">
              <CheckCircle2 size={12} className="text-green-500" />
              อย่าปล่อยให้คู่แข่งแซงหน้า ในวันที่โลกหมุนด้วย AI
            </p>
          </div>

        </div>
      </section>

      {/* --- 2. How It Works (Step 1-2-3) --- */}
      <section className="relative z-10 py-24 px-6 bg-white overflow-hidden">
        
      <style>{`
          /* --- 1. Floating Icons (Camera -> AI -> QR) --- */
          /* ไอคอนลอยจากซ้ายไปขวา (Step 1 -> 2) */
          @keyframes float-step1 {
            0% { left: 18%; opacity: 0; transform: scale(0.5) translateY(-50%); }
            10% { opacity: 1; transform: scale(1) translateY(-50%); }
            90% { opacity: 1; transform: scale(1) translateY(-50%); }
            100% { left: 48%; opacity: 0; transform: scale(0.5) translateY(-50%); }
          }
          /* ไอคอนลอยจากซ้ายไปขวา (Step 2 -> 3) */
          @keyframes float-step2 {
            0% { left: 52%; opacity: 0; transform: scale(0.5) translateY(-50%); }
            10% { opacity: 1; transform: scale(1) translateY(-50%); }
            90% { opacity: 1; transform: scale(1) translateY(-50%); }
            100% { left: 82%; opacity: 0; transform: scale(0.5) translateY(-50%); }
          }
          .animate-float-1 { animation: float-step1 2.5s infinite linear; }
          .animate-float-2 { animation: float-step2 2.5s infinite linear 1.25s; }

          /* --- 2. Camera Flash (Step 1) --- */
          /* แสงแฟลชวาบเบาๆ ตรงกลางเลนส์ */
          @keyframes pro-flash {
            0%, 90%, 100% { opacity: 0; transform: scale(0.8); }
            92% { opacity: 0.8; transform: scale(1.2); }
            95% { opacity: 0; transform: scale(1.4); }
          }
          .animate-pro-flash { animation: pro-flash 3s infinite ease-out; }

          /* --- 3. AI Screening (Step 2) --- */
          /* ❌ รูปไม่ผ่าน: กลาง -> ล่าง (ใช้ Margin เลื่อนลง) */
          @keyframes reject-down { 
            0%, 40% { opacity: 0; transform: translate(-50%, -50%) scale(0); margin-top: 0; }
            45% { opacity: 1; transform: translate(-50%, -50%) scale(1); margin-top: 0; }
            55% { opacity: 1; transform: translate(-50%, -50%) scale(1); margin-top: 0; }
            70% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); margin-top: 40px; } 
            100% { opacity: 0; margin-top: 40px; }
          }

          /* ✅ รูปผ่าน: กลาง -> ขวา (ใช้ Margin เลื่อนขวา) */
          @keyframes pass-right { 
             0%, 60% { opacity: 0; transform: translate(-50%, -50%) scale(0); margin-left: 0; }
             65% { opacity: 1; transform: translate(-50%, -50%) scale(1); margin-left: 0; }
             75% { opacity: 1; transform: translate(-50%, -50%) scale(1); margin-left: 0; }
             90% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); margin-left: 40px; } 
             100% { opacity: 0; margin-left: 40px; }
          }

          .animate-reject { animation: reject-down 3s infinite ease-in-out; }
          .animate-pass { animation: pass-right 3s infinite ease-in-out; }

          /* --- 4. QR Scan (Step 3) --- */
          /* เส้นสแกนวิ่งลง */
          @keyframes scan-line {
            0% { top: 10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
          }
          .animate-scan { animation: scan-line 2s linear infinite; }
        `}</style>

        <div className="max-w-5xl mx-auto space-y-16 relative">
          
          {/* Header */}
          <div className="text-center space-y-3">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 text-white rounded-full shadow-lg shadow-zinc-200">
               <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
               <span className="text-[10px] font-bold uppercase tracking-widest">Workflow</span>
             </div>
             <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950">
               ทำงานง่ายใน <span className="text-blue-600">3 ขั้นตอน</span>
             </h2>
             <p className="text-zinc-500 text-sm max-w-lg mx-auto">
               เปลี่ยนความวุ่นวายหลังบ้าน ให้เป็นระบบอัตโนมัติที่ลื่นไหล
             </p>
          </div>

          {/* Steps Container */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            
            {/* Connecting Line (Desktop Only) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-zinc-100 z-0">
               {/* เส้นวิ่งวิบวับ */}
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200 to-transparent w-1/2 animate-[shimmer_2s_infinite]"></div>
            </div>

            {/* ✅ Icon ลอย 1: Camera -> AI */}
            <div className="hidden md:block absolute top-12 w-full h-0 z-0 pointer-events-none">
                <div className="absolute top-0 opacity-0 animate-float-1 bg-white p-1.5 rounded-lg border border-blue-100 shadow-sm text-blue-500 z-20">
                    <FileImage size={16} />
                </div>
            </div>

            {/* ✅ Icon ลอย 2: AI -> QR */}
            <div className="hidden md:block absolute top-12 w-full h-0 z-0 pointer-events-none">
                <div className="absolute top-0 opacity-0 animate-float-2 bg-white p-1.5 rounded-lg border border-purple-100 shadow-sm text-purple-500 z-20">
                    <FileImage size={16} />
                </div>
            </div>

            {/* Step 1: Shoot & Send */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-6 group">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-white border border-zinc-100 shadow-xl flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute inset-0 bg-blue-50/50 rounded-3xl transform rotate-6 scale-90 -z-10 transition-transform group-hover:rotate-12"></div>
                  
                  {/* กล้องนิ่ง สง่างาม */}
                  <div className="relative">
                    <Camera size={32} className="text-blue-600 relative z-10" />
                    
                    {/* ✅ แสงแฟลชสีขาวตรงกลางเลนส์ (วาบแล้วหายไป) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 bg-white rounded-full blur-[2px] animate-pro-flash z-20 shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
                    </div>
                  </div>

                  <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-sm border-4 border-white">1</div>
                </div>
                {/* Ping Animation */}
                <div className="absolute inset-0 bg-blue-400/20 rounded-3xl z-0 animate-ping opacity-0 group-hover:opacity-100 duration-1000"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Shoot & Send</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px] mx-auto">
                  ช่างภาพถ่ายภาพและส่งไฟล์ผ่าน <span className="font-bold text-zinc-700">FTP/FTPS</span> เข้าสู่ระบบ Cloud ได้ทันทีจากตัวกล้อง
                </p>
              </div>
            </div>

            {/* Step 2: AI Process */}
            <div suppressHydrationWarning={true} className="relative z-10 flex flex-col items-center text-center space-y-6 group delay-100">
              <div className="relative">
                {/* Main Icon Container */}
                <div className="w-24 h-24 rounded-3xl bg-white border border-zinc-100 shadow-xl flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
                   
                   {/* Background */}
                   <div className="absolute inset-0 bg-purple-50/50 rounded-3xl z-0"></div>

                   {/* AI Brain / Core Icon (ตรงกลาง) */}
                   <div className="relative z-10">
                      <Sparkles size={28} className="text-purple-600 drop-shadow-sm" />
                   </div>

                   {/* ❌ Animation: รูปเสีย (กลาง -> ล่าง) */}
                   <div className="absolute top-1/2 left-1/2 w-6 h-6 z-20 animate-reject">
                      <div className="w-full h-full bg-red-100 rounded-md flex items-center justify-center border border-red-200 shadow-sm">
                         <div className="text-[10px] font-bold text-red-500">✕</div>
                      </div>
                   </div>

                   {/* ✅ Animation: รูปดี (กลาง -> ขวา) */}
                   <div className="absolute top-1/2 left-1/2 w-6 h-6 z-20 animate-pass">
                      <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center border border-green-200 shadow-sm">
                         <CheckCircle2 size={14} className="text-green-600" />
                      </div>
                   </div>

                </div>

                {/* Badge เลข 2 */}
                <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-sm border-4 border-white z-50 shadow-sm transition-transform group-hover:-translate-y-2 duration-500">
                  2
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold">AI Screening & Scoring</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px] mx-auto">
                  AI คัดแยกรูปเสียให้คะแนนความสวยด้วย <span className="font-bold text-zinc-700">Golden Ratio</span> และส่งผ่านเฉพาะรูปคุณภาพสูง
                </p>
              </div>
            </div>

            {/* Step 3: Scan & Get */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-6 group delay-200">
              <div className="relative">
                {/* Main Icon Container */}
                <div className="w-24 h-24 rounded-3xl bg-white border border-zinc-100 shadow-xl flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500 overflow-hidden">
                   
                   {/* Background อ่อนๆ */}
                   <div className="absolute inset-0 bg-green-50/50 rounded-3xl transform rotate-3 scale-90 -z-10 transition-transform group-hover:rotate-6"></div>
                   
                   {/* ไอคอนหลัก */}
                   <div className="relative">
                     <QrCode size={32} className="text-green-600 relative z-10" />
                     
                     {/* ✅ เส้นสแกนสีเขียวเรืองแสง วิ่งลง */}
                     <div className="absolute left-[-10px] right-[-10px] h-[2px] bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-scan z-20"></div>
                   </div>

                </div>

                {/* ✅ ย้ายเลข 3 ออกมานอก Container */}
                <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-sm border-4 border-white z-50 shadow-sm transition-transform group-hover:-translate-y-2 duration-500">
                  3
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Scan & Get</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-[200px] mx-auto">
                  ลูกค้าสแกน <span className="font-bold text-zinc-700">QR Code</span> ค้นหาหน้าตัวเองและดาวน์โหลดรูปได้ทันที
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- New Section: AI Beauty Before/After Comparison --- */}
      <section className="relative z-10 py-24 px-6 bg-zinc-900 text-white overflow-hidden">
        
        {/* Background Effect */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-blue-500/5 blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          
          {/* Header Text: เน้นแก้ Pain Point ช่างภาพ */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full backdrop-blur-md border border-white/10">
              <Sparkles size={12} className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">AI Retouching Assistant</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              ส่งงานไว... <br className="md:hidden" />แต่ได้ไฟล์ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">คุณภาพระดับแมกกาซีน</span>
            </h2>
            
            <p className="text-zinc-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              ลืมการนั่งแต่งรูปทีละใบหลังจบงานไปได้เลย AI ของ Rooplife เรียนรู้จากกระบวนการ Retouch <br className="hidden md:block" /> ของมืออาชีพ
              ช่วยปรับผิวเนียน (Skin Smoothing) ให้อัตโนมัติในวินาทีที่รูปถูกอัปโหลด
            </p>
          </div>

          {/* Slider Component */}
          <BeforeAfterSlider />

          {/* Features List: เน้น Benefit ที่จับต้องได้ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
            {[
              { label: "Skin Texture", val: "Natural", desc: "เก็บรายละเอียดผิวเนียน ไม่เบลอจนหลอกตา" },
              { label: "Lighting", val: "Auto-Fill", desc: "เติมแสงให้ใบหน้าสว่างใส อย่างเป็นธรรมชาติ" },
              { label: "Processing Time", val: "< 3s", desc: "แต่งเสร็จในพริบตาพร้อมส่ง ถึงมือเจ้าภาพ" },
              { label: "Batch Edit", val: "Unlimited", desc: "รองรับรูปถ่าย ไม่จำกัดจำนวน" }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2 group cursor-default">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">{stat.label}</p>
                <p className="text-xl font-black text-white">{stat.val}</p>
                <p className="text-[10px] text-zinc-400 max-w-[150px] mx-auto opacity-60 group-hover:opacity-100 transition-opacity">{stat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- 3. Compatible Cameras (Updated: Real FTP Models) --- */}
      <section className="relative z-10 py-16 px-6 bg-white border-y border-zinc-100/50">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100/50">
              <Cloud size={12} className="animate-bounce" />
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Pro Gear Connectivity</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-950 uppercase">
              Compatible <span className="text-blue-600">Hardware</span>
            </h2>
            <p className="text-zinc-500 text-sm max-w-2xl mx-auto">
              รองรับการส่งภาพผ่าน <strong>FTP/FTPS/SFTP</strong> โดยตรงจากกล้องระดับโปรโมเดล <br className="hidden md:block" />
              เชื่อมต่อได้ทันทีโดยไม่ต้องผ่านคอมพิวเตอร์
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 items-start justify-items-center">
            {[
              { 
                name: 'Sony', 
                logo: 'sony.png', 
                models: 'A1, A9 III, A9 II, A7R V, A7 IV, A7S III, FX3, FX30' 
              },
              { 
                name: 'Canon', 
                logo: 'canon.png', 
                models: 'EOS R1, R3, R5 II, R5, R6 Mark II, 1D X Mark III' 
              },
              { 
                name: 'Nikon', 
                logo: 'nikon.png', 
                models: 'Z9, Z8, Z6 III, Zf, D6, D5, D850 (WT)' 
              },
              { 
                name: 'Fujifilm', 
                logo: 'fujifilm.png', 
                models: 'GFX100 II, X-H2S, X-H2, X-T5, X-S20' 
              },
              { 
                name: 'Panasonic', 
                logo: 'panasonic.png', 
                models: 'Lumix S5 IIX, GH7, GH6, BGH1, BS1H' 
              },
              { 
                name: 'Olympus', 
                logo: 'olympus.png', 
                models: 'OM-1 Mark II, OM-1, E-M1X, E-M1 Mark III' 
              },
            ].map((brand) => (
              <div key={brand.name} className="flex flex-col gap-4 group w-full max-w-[180px]">
                <div className="relative w-full aspect-[2.2/1] bg-[#fafafa] rounded-[1.5rem] flex items-center justify-center p-3 border border-zinc-100 hover:border-blue-500/30 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1.5 transition-all duration-500">
                  <div className="relative w-full h-full transition-all duration-500 group-hover:scale-110">
                    <Image 
                      src={`/brand-logo/${brand.logo}`} 
                      alt={brand.name} 
                      fill 
                      className="object-contain" 
                      priority
                    />
                  </div>
                </div>
                <div className="text-center space-y-1.5">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-950 transition-colors">
                    {brand.name}
                  </p>
                  <div className="px-2 py-2 bg-zinc-50 rounded-xl border border-zinc-100/50 group-hover:bg-blue-50 group-hover:border-blue-100/50 transition-colors">
                    <p className="text-[8px] md:text-[9px] text-zinc-500 group-hover:text-blue-600 font-bold uppercase tracking-tight leading-relaxed text-center break-words">
                      {brand.models.split(', ').join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 4. Use Cases (ย้ายขึ้นมา) --- */}
      <section className="relative z-10 py-24 px-6 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-zinc-950">
              Perfect for <span className="text-blue-600">Every Occasion</span>
            </h2>
            <p className="text-zinc-500 text-sm">ไม่ว่างานสเกลไหน ระบบของเราก็พร้อมรองรับ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: "Marathon & Sports", 
                desc: "ค้นหารูปนักวิ่งจากพันๆ คนได้ในเสี้ยววินาที ไม่ต้องเพ่งหาเบอร์ BIB อีกต่อไป",
                icon: <Zap size={24} className="text-orange-500" />,
                color: "bg-orange-50 border-orange-100"
              },
              { 
                title: "Wedding & Party", 
                desc: "แขกในงานได้รูปสวยๆ กลับบ้านทันที สร้างความประทับใจให้วันสำคัญ",
                icon: <Sparkles size={24} className="text-pink-500" />,
                color: "bg-pink-50 border-pink-100"
              },
              { 
                title: "Graduation", 
                desc: "บัณฑิตและญาติค้นหารูปง่ายๆ ถ่ายปุ๊บ ส่งปั๊บ จบงานได้ไฟล์ครบ",
                icon: <Users size={24} className="text-blue-500" />,
                color: "bg-blue-50 border-blue-100"
              },
              { 
                title: "Corporate Event", 
                desc: "ภาพลักษณ์องค์กรดูทันสมัย พนักงานแฮปปี้กับการได้รูปตัวเองอย่างรวดเร็ว",
                icon: <Globe size={24} className="text-indigo-500" />,
                color: "bg-indigo-50 border-indigo-100"
              }
            ].map((usecase, i) => (
              <div key={i} className={`p-6 rounded-2xl border ${usecase.color} hover:shadow-lg transition-all duration-300 group cursor-default`}>
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {usecase.icon}
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{usecase.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{usecase.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- 5. AI Core Architecture (ย้ายลงมา) --- */}
      <section className="relative z-10 py-24 px-6 bg-white overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto space-y-16 relative">
          
          {/* Section Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200">
              <Sparkles size={12} className="text-purple-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">Your Intelligent Assistant</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-950">
              Why Pro Photographers <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Trust Our AI</span>
            </h2>
            <p className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed">
              เราไม่ได้สร้างแค่ AI แต่เราสร้าง "ผู้ช่วยมือขวา" ที่เข้าใจกระบวนการทำงานของช่างภาพอย่างลึกซึ้ง <br className="hidden md:block" />
              ช่วยจัดการงานซ้ำซากจำเจให้คุณมีเวลาโฟกัสกับการสร้างสรรค์ผลงานได้เต็มที่
            </p>
          </div>

          {/* Grid Layout: 3 Columns (Core / Quality / Workflow) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-purple-200 transition-colors group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <Cloud size={20} />
                </div>
                <h3 className="text-lg font-bold tracking-tight">AI Sorting & Matching</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { title: "Smart Face Filter", desc: "เพียงแตะเลือกใบหน้า ระบบจะคัดกรองและสร้างอัลบั้มส่วนตัวที่รวมเฉพาะรูปของคุณให้อัตโนมัติ" },
                  { title: "Smart Grouping", desc: "จัดกลุ่มรูปภาพของคนเดียวกันไว้ด้วยกันโดยอัตโนมัติ ประหยัดเวลาคัดแยกนับชั่วโมง" },
                  { title: "High Accuracy", desc: "แม่นยำสูงแม้ในงานอีเวนต์คนเยอะ หรือสภาวะแสงที่ท้าทาย" },
                  { title: "Lightning Fast", desc: "ประมวลผลและส่งรูปถึงมือลูกค้าได้ภายในไม่กี่วินาทีหลังถ่าย" }
                ].map((item, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 pl-3.5 leading-relaxed">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Smart Quality Control (✅ Updated for Scoring) */}
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 hover:border-blue-200 transition-colors group">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-bold tracking-tight">AI Beauty & QC</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { title: "Golden Ratio Score", desc: "ให้คะแนนความสวย/สมมาตรของใบหน้า (Beauty Score) ด้วยหลักการ Golden Ratio" },
                  { title: "Quality Score", desc: "วัดค่าความคมชัดของภาพ (Blur Score) เพื่อคัดรูปที่ชัดที่สุดให้ลูกค้า" },
                  { title: "Best Shot Selection", desc: "เลือกรูปที่ 'ตาเปิด' และ 'ยิ้มสวยที่สุด' ขึ้นมาเป็นรูปปกให้อัตโนมัติ" },
                  { title: "Auto-Lighting Check", desc: "วิเคราะห์แสงและสีของภาพ เพื่อเตรียมพร้อมสำหรับการแต่งภาพขั้นต่อไป" }
                ].map((item, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 pl-3.5 leading-relaxed">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Professional Workflow */}
            <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 text-zinc-300 group shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-100 group-hover:scale-110 transition-transform border border-zinc-700">
                  <Settings size={20} />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white">Pro Workflow</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { title: "Master Quality", desc: "รักษารายละเอียดไฟล์ภาพต้นฉบับคุณภาพสูง (High-Res) ครบถ้วนทุกพิกเซล" },
                  { title: "Auto-Rotation", desc: "หมดปัญหารูปตะแคง AI หมุนภาพแนวตั้ง/แนวนอนให้อัตโนมัติ" },
                  { title: "Smart Crop", desc: "จัดองค์ประกอบภาพสำหรับการแสดงผลบนมือถือให้สวยงามที่สุด" },
                  { title: "Secure Delivery", desc: "ส่งงานอย่างปลอดภัย ไฟล์ไม่หาย ข้อมูลไม่รั่วไหล มาตรฐาน PDPA" }
                ].map((item, i) => (
                  <li key={i} className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                      <CheckCircle2 size={10} className="text-green-500" />
                      {item.title}
                    </span>
                    <span className="text-[10px] text-zinc-500 pl-5 leading-relaxed">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>            

          </div>
        </div>
      </section>

      {/* --- Key Feature Focus (Video) --- */}
      <section className="relative z-10 py-24 px-6">
      <div className="max-w-5xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
            <div className="flex-1 space-y-5">
              <h2 className="text-3xl md:text-4xl font-medium tracking-tight leading-tight text-zinc-950">
                AI Face Recognition <br /> 
                <span className="text-blue-600">สแกนปุ๊บ เจอปั๊บ</span>
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed italic">ไม่ต้องให้ลูกค้าเลื่อนหาภาพท่ามกลางรูปภาพนับพันอีกต่อไป AI ช่วยให้พวกเขาหารูปตัวเองเจอใน 1 วินาที</p>
              <ul className="space-y-2">
                {['คัดแยกภาพตามใบหน้าอัตโนมัติ', 'รองรับจำนวนคนได้มหาศาล', 'ความแม่นยำสูง'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-xs font-semibold text-zinc-700">
                    <CheckCircle2 size={14} className="text-green-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full aspect-video bg-zinc-950 rounded-[2.5rem] shadow-2xl flex items-center justify-center relative overflow-hidden group border border-white/10">
               {/* Video Loop */}
               <video 
                 src="/Assets/IMG_1358.mov" 
                 autoPlay 
                 loop 
                 muted 
                 playsInline 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* --- 6. Value Propositions (ย้ายลงมาสุด & ปรับเป็น 3 คอลัมน์) --- */}
      <section className="relative z-10 py-20 px-6 bg-[#fafafa]/50 backdrop-blur-sm border-y border-zinc-100">
      {/* ✅ ปรับ Grid เป็น 3 คอลัมน์ 2 แถว (grid-cols-1 md:grid-cols-3) */}
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16 text-center px-4">
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
          <div className="space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-500 mx-auto shadow-sm border border-zinc-100"><QrCode size={24} /></div>
            <h3 className="text-base font-bold tracking-tight">Instant QR Access</h3>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-[200px] mx-auto">สแกน QR Code เพื่อเข้าชมและดาวน์โหลดภาพถ่ายส่วนตัวได้ทันที</p>
          </div>
        </div>
      </section>      

      {/* --- Footer --- */}
      <footer className="relative z-10 py-12 bg-white/80 backdrop-blur-md border-t border-zinc-100">        <div className="max-w-4xl mx-auto px-6 text-center space-y-12">
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