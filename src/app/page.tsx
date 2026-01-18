import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
// src/app/page.tsx บรรทัดที่ 6-11
import { 
  Zap, Camera, Users, ShieldCheck, 
  ArrowRight, CheckCircle2, Cloud, Sparkles, Lock,
  Globe, CreditCard, Settings, Plus, QrCode, FileImage, 
  Star, BarChart3, Smartphone, Usb, Wifi, Link2, Apple, PlayCircle, Download, LayoutDashboard, BellRing // เพิ่มไอคอนที่นี่
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ROOPLIFE",
    "operatingSystem": "Web, Mobile",
    "applicationCategory": "PhotographyApplication",
    "description": "AI Real-time photo delivery system for event photographers.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "THB"
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden relative">
      
      {/* --- Performance Optimized Fluid Background --- */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              เปลี่ยนงานอีเวนต์ให้ <span className="text-blue-600">ล้ำ สุดๆ</span> <br />
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
              { icon: <Star size={20} />, title: "AI Scoring", desc: "ให้คะแนนความสวยด้วย AI" }, 
              { icon: <BarChart3 size={20} />, title: "Quality Check", desc: "วัดค่าความคมชัดของภาพ" }, 
              { icon: <Sparkles size={20} />, title: "AI Beauty", desc: "แต่งหน้าใสอัตโนมัติ" },
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
        
        {/* ❌ ลบ <style> block ออก (คุณต้องเอา CSS ไปใส่ใน globals.css แทน) */}

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
               เปลี่ยนความวุ่นวายในการเตรียมระบบ ให้เป็นเรื่องง่าย ที่ใช้เพียงกล้อง + อินเตอร์เน็ต ก็มีระบบ QR CODE Real-time photo เท่ๆไว้ใช้
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
            <div className="relative z-10 flex flex-col items-center text-center space-y-6 group delay-100">
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
                         <div className="text-[10px] text-zinc-500">✓</div> {/* แก้เป็น text icon แทน lucide เพื่อลด error ถ้าหาไม่เจอ */}
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

      {/* --- Phone Bridge (Hybrid Connectivity) --- */}
      <section className="relative z-10 py-24 px-6 bg-blue-50/20 overflow-hidden border-y border-blue-100/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Visual Part */}
            <div className="relative order-2 lg:order-1">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 blur-[80px] rounded-full animate-pulse"></div>
                
                <div className="relative z-10 w-full h-full bg-white rounded-[3rem] shadow-2xl border border-zinc-100 flex items-center justify-center p-8">
                  <div className="flex flex-col items-center gap-8 w-full">
                    <div className="flex items-center justify-center gap-6 md:gap-12 w-full">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-50 rounded-2xl flex items-center justify-center shadow-sm border border-zinc-100 text-zinc-400">
                        <Camera size={32} />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Bridging</span>
                      </div>
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                        <Smartphone size={32} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-center space-y-1">
                        <Usb size={18} className="mx-auto text-blue-500" />
                        <p className="text-[10px] font-bold uppercase tracking-tighter">USB OTG</p>
                      </div>
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-center space-y-1">
                        <Wifi size={18} className="mx-auto text-blue-500" />
                        <p className="text-[10px] font-bold uppercase tracking-tighter">WiFi Direct</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Part */}
            <div className="space-y-8 order-1 lg:order-2">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full">
                  <Link2 size={12} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Hybrid Connectivity</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Phone Bridge: <br />
                  <span className="text-blue-600">รองรับกล้องทุกรุ่น</span> แม้ไม่มี FTP
                </h2>
                <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
                  เปลี่ยนมือถือของคุณให้เป็น "สะพาน" ส่งภาพเข้าสู่ระบบแกลเลอรีทันที 
                  ไม่ว่าจะเป็นกล้องรุ่นเล็กหรือรุ่นใหญ่ ก็สามารถใช้พลังของ AI Real-time ได้ 
                  เพียงเชื่อมต่อผ่านสาย USB (OTG) หรือ WiFi จากแอปกล้องที่คุณใช้อยู่
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { title: "USB Wired Upload", desc: "เชื่อมต่อผ่านสาย OTG (USB-C/Lightning) เสถียรและเร็วที่สุด เหมาะสำหรับไฟล์ RAW/JPG ขนาดใหญ่" },
                  { title: "WiFi Bridge Mode", desc: "ดึงภาพผ่านแอปกล้อง (Sony/Canon/Nikon/Fuji) แล้วอัปโหลดอัตโนมัติผ่าน Mobile App" },
                  { title: "Background Processing", desc: "ระบบอัปโหลดทำงานเบื้องหลัง ให้คุณโฟกัสกับการถ่ายภาพได้อย่างต่อเนื่อง" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <CheckCircle2 size={12} />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-tight">{item.title}</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* --- Mobile App Download Section --- */}
      <section className="relative z-10 py-24 px-6 bg-zinc-950 text-white overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Side */}
            <div className="space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                  <Smartphone size={12} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Management on the go</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  พกพาความอัจฉริยะ <br /> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ไปกับคุณทุกที่</span>
                </h2>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-lg">
                  ควบคุมทุกอย่างผ่านปลายนิ้ว ตั้งแต่การเปิดงานใหม่ จัดการกล้องในคลัง 
                  ไปจนถึงการดูสถิติรูปภาพแบบเรียลไทม์ พร้อมระบบแจ้งเตือนเมื่อเกิดข้อผิดพลาด
                </p>
              </div>

              {/* App Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: <LayoutDashboard size={18} />, title: "Live Dashboard", desc: "ดูสถานะงานและจำนวนรูปที่ส่งเข้ามาได้แบบวินาทีต่อวินาที" },
                  { icon: <BellRing size={18} />, title: "Instant Alerts", desc: "แจ้งเตือนทันทีเมื่อกล้องหลุดการเชื่อมต่อ หรือแบตเตอรี่เหลือน้อย" },
                  { icon: <Link2 size={18} />, title: "Quick Check-in", desc: "สแกน QR เพื่อจอยงานหรือเพิ่มกล้องเข้า Slot ได้ง่ายๆ" },
                  { icon: <Cloud size={18} />, title: "Remote Control", desc: "สั่งเปิด-ปิด AI Beauty หรือเปลี่ยนลายน้ำได้จากระยะไกล" }
                ].map((feat, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {feat.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-tight text-white">{feat.title}</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download Buttons ( badges ) */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-white/5 group">
                <Image 
                  src="/Assets/png-apple-logo-9711.png" 
                  alt="Download on App Store" 
                  width={32} 
                  height={16} 
                />
                  <div className="text-left">
                    <p className="text-[8px] font-bold uppercase leading-none opacity-60">Download on the</p>
                    <p className="text-sm font-black leading-none mt-1">App Store</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 px-6 py-3 bg-zinc-800 text-white rounded-2xl border border-white/10 hover:bg-zinc-700 hover:scale-105 transition-all group">
                <Image 
                  src="/Assets/google-play-seeklogo.png" 
                  alt="Download on App Store" 
                  width={32} 
                  height={16} 
                />
                  <div className="text-left">
                    <p className="text-[8px] font-bold uppercase leading-none opacity-60">Get it on</p>
                    <p className="text-sm font-black leading-none mt-1">Google Play</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Visual Side: App Mockup */}
            <div className="relative">
              <div className="relative w-[280px] md:w-[320px] aspect-[9/19.5] mx-auto bg-zinc-900 rounded-[3rem] border-[8px] border-zinc-800 shadow-[0_0_100px_rgba(59,130,246,0.2)] overflow-hidden">
                {/* Phone Status Bar */}
                <div className="absolute top-0 w-full h-8 flex justify-center items-end pb-1">
                  <div className="w-20 h-4 bg-zinc-800 rounded-full"></div>
                </div>
                
                {/* App Content Preview (Static Placeholder) */}
                <div className="w-full h-full pt-10 px-4 space-y-4 bg-zinc-950">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Dashboard</p>
                      <h3 className="text-sm font-black">Wedding Gala</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold">JD</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 p-3 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase">Photos</p>
                      <p className="text-xl font-black text-blue-500">1,240</p>
                    </div>
                    <div className="bg-zinc-900 p-3 rounded-2xl border border-white/5 space-y-1">
                      <p className="text-[8px] text-zinc-500 font-bold uppercase">Storage</p>
                      <p className="text-xl font-black text-purple-500">82%</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[8px] text-zinc-500 font-bold uppercase">Active Cameras</p>
                    <div className="bg-zinc-900/50 p-3 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                         <p className="text-[10px] font-bold">Sony A7 IV</p>
                      </div>
                      <p className="text-[10px] text-zinc-400">Online</p>
                    </div>
                  </div>
                  {/* ... more app UI placeholders ... */}
                  <div className="absolute bottom-6 left-4 right-4">
                     <div className="w-full py-3 bg-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-lg shadow-blue-500/20">
                        Create New Event
                     </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Decoration */}
              <div className="absolute -bottom-10 -right-4 md:-right-10 w-32 h-32 md:w-40 md:h-40 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 flex items-center justify-center animate-bounce [animation-duration:4s]">
                 <QrCode size={40} className="text-white/20" />
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
              ลืมการนั่งแต่งรูปทีละใบหลังจบงานไปได้เลย AI ของ Rooplife เรียนรู้จากกระบวนการ Retouch <br className="hidden md:block" />ของมืออาชีพ
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
                AI Photo Gallery <br /> 
                <span className="text-blue-600">อัลบั้มส่วนตัวของคุณ</span>
              </h2>
              <p className="text-zinc-500 text-base leading-relaxed italic">
                ด้วยเทคโนโลยี <span className="text-zinc-900 font-semibold">AI Face Recognition</span> อัจฉริยะ 
                ระบบจะค้นหาและรวบรวมเฉพาะรูปที่มีคุณอยู่ในภาพ สร้างเป็นแกลเลอรีส่วนตัวให้โดยอัตโนมัติ 
                ไม่ต้องเสียเวลาเลื่อนหารูปตัวเองอีกต่อไป
              </p>
              <ul className="space-y-2">
                {['ค้นหารูปตัวเองได้ในคลิกเดียว', 'สร้างอัลบั้มส่วนตัวให้อัตโนมัติ', 'ความเป็นส่วนตัวสูง เห็นเฉพาะรูปตัวเอง'].map((item) => (
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
              <p className="text-[8px] text-zinc-200 uppercase tracking-[0.1em]">© 2025 หจก.แปดแสนโปรดักชั่น 80/7 ต.ในเมือง อ.เมือง จ.ร้อยเอ็ด </p>
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