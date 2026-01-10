// src/app/dashboard/guide/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { 
  Camera, Zap, Wifi, ShieldCheck, ShieldAlert,
  Settings, HelpCircle, BookOpen, ChevronRight,
  Monitor, Smartphone, Info, CreditCard, Copy, Check,
  Plus, Calendar, Layers, Clock, Crown, Image as ImageIcon,
  Sliders, ArrowRight, Wallet, QrCode, Hourglass, Users, Sparkles, Lock, CheckCircle2, Circle
} from 'lucide-react';

export default function GuidePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('getting-started');

  useEffect(() => {
    async function fetchUserData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase.from('users').select('*').eq('id', authUser.id).single();
        setUser(data);
      }
    }
    fetchUserData();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอกแล้ว: ' + text);
  };

  const tabs = [
    { id: 'getting-started', label: 'เริ่มต้นใช้งาน', icon: <BookOpen size={18} /> },
    { id: 'manage-event', label: 'จัดการ Event', icon: <Sliders size={18} /> },
    { id: 'ftp-config', label: 'การตั้งค่า FTP', icon: <Settings size={18} /> },
    { id: 'team-join', label: 'การทำงานเป็นทีม', icon: <Users size={18} /> },
    { id: 'billing', label: 'การเงิน & Wallet', icon: <CreditCard size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] font-sans">
      <Header balance={user?.wallet_balance} user={user} />
      
      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            <Info size={14} /> Guide Center
          </div>
          <h1 className="text-5xl font-black tracking-tighter mb-4 text-zinc-900 dark:text-white">คู่มือการใช้งาน</h1>
          <p className="text-zinc-500 font-medium text-lg">ขั้นตอนการใช้งานระบบ Rooplife อย่างละเอียด</p>
        </div>

        <div className="flex p-1.5 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-[2.5rem] mb-10 gap-1.5 overflow-x-auto no-scrollbar shadow-inner snap-x snap-mandatory scroll-smooth">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 py-3 rounded-[2.2rem] transition-all duration-500 snap-center ${
                activeTab === tab.id 
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xl ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 px-8 scale-[1.02]" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 px-4 hover:bg-white/50 dark:hover:bg-white/5"
              }`}>
              {/* Icon จะขยายใหญ่ขึ้นเมื่อเลือก */}
              <div className={`transition-all duration-500 ${activeTab === tab.id ? 'scale-110 shrink-0' : 'scale-100 opacity-60'}`}>
                {tab.icon}
              </div>

              {/* แสดงชื่อ Tab เฉพาะเมื่อ activeTab === tab.id */}
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                activeTab === tab.id 
                  ? "max-w-[200px] opacity-100" 
                  : "max-w-0 opacity-0"
              }`}>
                <span className="text-[13px] md:text-sm font-black tracking-tight whitespace-nowrap">
                  {tab.label}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content: Getting Started */}
        {activeTab === 'getting-started' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Alert Notification */}
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl flex items-start gap-4 shadow-sm">
              <ShieldAlert className="text-amber-500 shrink-0 mt-1" size={24} />
              <div className="space-y-1">
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest">ข้อควรระวังเกี่ยวกับการรับรูปภาพ</h4>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 leading-relaxed italic">
                  "แม้คุณจะตั้งค่า FTP ในกล้องถูกต้องแล้ว แต่หากกล้องตัวนั้น **ยังไม่ถูกเพิ่มเข้าไปในอีเวนต์** ระบบ FTP จะไม่เริ่มทำงานและจะไม่ได้รับรูปภาพใดๆ โปรดตรวจสอบขั้นตอนที่ 04 ให้แน่ใจก่อนเริ่มถ่ายงาน"
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                { 
                  step: "01", 
                  title: "สร้างอีเวนต์ (Create Event)", 
                  desc: "กดปุ่ม 'Create Event' (ค่าบริการ 100 บาท) เพื่อเริ่มงานใหม่ คุณจะได้รหัส Join Code สำหรับให้ทีมงานเข้าร่วม",
                  icon: <Plus className="text-blue-500" />
                },
                { 
                  step: "02", 
                  title: "ลงทะเบียนกล้อง (Garage)", 
                  desc: "ไปที่เมนู 'Garage' เพื่อเพิ่มกล้องของคุณ ระบบจะสร้างรหัส FTP ประจำตัวกล้องให้ (รหัสใช้ได้ 1 กล้อง/รหัส)",
                  icon: <Camera className="text-zinc-500" /> 
                },
                { 
                  step: "03", 
                  title: "ตั้งค่าการส่งรูป (FTP Setup)", 
                  desc: "นำค่า Host, Port, User, Pass ไปใส่ในกล้องเพื่อให้เริ่มส่งรูปเข้าสู่ Server ของเรา",
                  icon: <Settings className="text-amber-500" /> 
                },
                { 
                  step: "04", 
                  title: "เพิ่มกล้องเข้าสู่งาน (Add Camera)", 
                  desc: "ไปที่หน้าจัดการงาน (Manage Event) แล้วเลือกกล้องที่คุณลงทะเบียนไว้ในโรงรถเข้าสู่งานนี้ เพื่อให้ระบบเริ่มรับรูปภาพจากกล้องตัวนั้น",
                  icon: <Camera className="text-green-500" />,
                  highlight: "ขั้นตอนนี้สำคัญที่สุด! หากไม่ทำ FTP จะยังไม่ทำงาน"
                }
              ].map((s, i) => (
                <div key={i} className="flex flex-col md:flex-row gap-6 p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
                  <div className="text-4xl font-black text-zinc-100 dark:text-zinc-800 shrink-0">{s.step}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">{s.icon}</div>
                      <h3 className="text-xl font-black tracking-tight">{s.title}</h3>
                    </div>
                    <p className="text-zinc-500 leading-relaxed text-sm font-medium mb-4">{s.desc}</p>
                    {s.highlight && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4">⚠️ {s.highlight}</p>
                    )}
                    {s.details && (
                      <div className="flex flex-wrap gap-2">
                        {s.details.map((d, j) => (
                          <span key={j} className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-full uppercase tracking-wider">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



{activeTab === 'manage-event' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center md:text-left space-y-3">
              <h3 className="text-3xl font-black tracking-tighter uppercase">Event Management Simulation</h3>
              <p className="text-zinc-500 font-medium italic">"อธิบายส่วนการทำงานหลัก เรียงลำดับจากบนลงล่าง"</p>
            </div>

            {/* Simulated UI Container */}
            <div className="relative bg-white dark:bg-zinc-950 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden group/sim transition-all duration-500 hover:shadow-blue-500/10">
              {/* Browser Header Decorator */}
              <div className="h-12 bg-zinc-100/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="ml-6 flex-1 h-7 bg-white dark:bg-zinc-800/50 rounded-xl border border-zinc-200/50 dark:border-zinc-700/50 flex items-center px-4">
                   <span className="text-[10px] text-zinc-400 font-mono tracking-tight">https://www.rooplife.com/dashboard/event</span>
                </div>
              </div>

              {/* Simulated UI Content (เพิ่มจุดที่ 7) */}
              <div className="p-6 md:p-10 space-y-10 pointer-events-none select-none">
                {/* 1. Simulated Event Header (Hotspots 1, 2) */}
                <div className="flex flex-col md:flex-row justify-between gap-8 pb-10 border-b border-zinc-100 dark:border-zinc-800 relative">
                   <div className="absolute -top-2 -left-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl z-50">1</div>
                   <div className="space-y-5">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Active Now</span>
                         </div>
                         <div className="flex items-center gap-1.5 text-zinc-400">
                            <ImageIcon size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">1,280 Photos</span>
                         </div>
                      </div>
                      <h2 className="text-4xl font-black italic tracking-tighter text-zinc-900 dark:text-white leading-none">The Grand Wedding 2026</h2>
                      <div className="flex flex-wrap items-center gap-6">
                         <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Join Code:</span>
                            <span className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-[0.2em]">RLX-99</span>
                         </div>
                         <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                         <div className="flex items-center gap-2 text-zinc-500">
                            <Calendar size={16} />
                            <span className="text-xs font-bold italic">14 มกราคม 2026</span>
                         </div>
                      </div>
                   </div>
                   <div className="relative">
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl z-50">2</div>
                      <div className="px-8 py-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl">
                         <Zap size={16} fill="currentColor" /> Public Gallery
                      </div>
                   </div>
                </div>

                {/* 2. Simulated Camera Grid (Hotspots 3, 4, 5) */}
                <div className="space-y-6 relative">
                   <div className="flex items-center gap-2">
                      <Camera size={18} className="text-blue-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Camera Slots (1/2)</h4>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm space-y-6 relative">
                         <div className="absolute top-0 -left-2 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl z-50">3</div>
                         <div className="flex justify-between items-start">
                            <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400">
                               <Camera size={24} />
                            </div>
                            <div className="relative">
                              <div className="absolute -top-3 -right-3 w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl z-50">4</div>
                              <div className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full shadow-lg shadow-pink-500/20">
                                  <Sparkles size={12} fill="currentColor" className="animate-pulse" />
                                  <span className="text-[9px] font-black uppercase tracking-widest">AI BEAUTY ON</span>
                              </div>
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <h5 className="text-xl font-black italic tracking-tight">Main Camera 01</h5>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-none">Sony A7R IV • Soft Portrait Style</p>
                         </div>
                      </div>
                      <div className="relative border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-[2.5rem] bg-blue-50/20 dark:bg-blue-900/5 flex flex-col items-center justify-center gap-3 p-8">
                         <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl z-50">5</div>
                         <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">
                            <Plus size={20} strokeWidth={3} />
                         </div>
                         <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 block">Buy Extra Slot</span>
                            <span className="text-sm font-black text-blue-400 tracking-tighter italic">฿59 Per Camera</span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 3. Simulated Watermark Section (Hotspot 6) */}
                <div className="space-y-6 relative">
                   <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl z-50">6</div>
                   <div className="flex items-center gap-2">
                      <ImageIcon size={18} className="text-amber-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Watermark Engine</h4>
                   </div>
                   <div className="bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-zinc-800 shadow-2xl">
                      <div className="aspect-[21/9] w-full relative group/wm">
                         <img src="/Assets/Gemini_Generated_Image_c0crvc0crvc0crvc.png" className="w-full h-full object-cover opacity-40 brightness-75" />
                         <div className="absolute inset-4 pointer-events-none">
                            <div className="absolute top-0 left-0 w-10 h-10 rounded-full border border-white/10 bg-black/20 flex items-center justify-center"><Circle size={4} className="text-white/30" /></div>
                            <div className="absolute top-0 right-0 w-10 h-10 rounded-full border border-white/10 bg-black/20 flex items-center justify-center"><Circle size={4} className="text-white/30" /></div>
                            <div className="absolute bottom-0 left-0 w-10 h-10 rounded-full border border-white/10 bg-black/20 flex items-center justify-center"><Circle size={4} className="text-white/30" /></div>
                            <div className="absolute bottom-0 right-0 w-12 h-12 border-2 border-blue-500 bg-blue-500/20 backdrop-blur-md rounded-xl flex items-center justify-center shadow-2xl scale-110">
                               <div className="text-[8px] font-black text-white text-center leading-none uppercase">Logo<br/>Active</div>
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/10 bg-black/20 flex items-center justify-center"><Circle size={4} className="text-white/30" /></div>
                         </div>
                      </div>
                      <div className="p-6 bg-zinc-900 flex flex-wrap gap-8 items-center justify-center border-t border-zinc-800 text-white/50 text-[10px] uppercase tracking-widest font-black">
                         <CheckCircle2 size={12} className="text-blue-500" /> Watermark Enabled
                      </div>
                   </div>
                </div>

                {/* ✅ 4. Simulated Storage Section (Hotspot 7) */}
                <div className="space-y-6 relative">
                   <div className="absolute -top-3 -right-3 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center font-black text-xs animate-bounce shadow-xl z-50">7</div>
                   <div className="flex items-center gap-2">
                      <ShieldAlert size={18} className="text-zinc-500" />
                      <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Storage Control</h4>
                   </div>
                   <div className="bg-zinc-950 rounded-[2.5rem] p-8 border border-zinc-800 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex-1 space-y-4 w-full">
                         <div className="flex justify-between items-end">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none">Days Remaining</span>
                            <span className="text-3xl font-black text-white italic tracking-tighter">2 Days</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-2/3" />
                         </div>
                      </div>
                      <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-inner">
                         Extend Storage
                      </div>
                   </div>
                </div>
              </div>

              {/* ✅ Legend Summary: รูปแบบรายการแนวตั้ง (ต่อแถว) เพื่อรองรับคำอธิบายที่ยาวขึ้น */}
              <div className="p-8 md:p-12 bg-zinc-100/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-10">
                 {[
                    {
                      num: "1",
                      color: "bg-blue-600",
                      title: "Project Hub & Stats",
                      desc: "ศูนย์กลางควบคุมข้อมูลอีเวนต์ ประกอบด้วยชื่อโปรเจกต์ วันที่จัดงาน และ Join Code 6 หลักสำหรับให้ช่างภาพร่วมทีมใช้เข้าร่วมงาน คุณสามารถตรวจสอบจำนวนรูปภาพทั้งหมดที่ส่งเข้าสู่ระบบได้แบบ Real-time จากส่วนนี้ คุณสามารถแก้ไข ข้อมูลต่างๆของ event ได้ก่อนที่ event จะเริ่ม"
                    },
                    {
                      num: "2",
                      color: "bg-blue-600",
                      title: "Public Gallery Link",
                      desc: "ปุ่มทางเข้าสู่หน้าแกลเลอรีหลักสำหรับลูกค้าซึ่งประกอบด้วยระบบ การค้นหาใบหน้า Ai-Beauty การดาวน์โหลดรูป QR Code ให้กับลูกค้าในงาน สามารถเปิดดูได้จาก Smart phone ได้ด้วยตัวเอง"
                    },
                    {
                      num: "3",
                      color: "bg-purple-600",
                      title: "Camera Slot Status",
                      desc: "ส่วนจัดการอุปกรณ์กล้องที่กำลังเชื่อมต่อ (Check-in) อยู่ในงานนี้ แสดงข้อมูลรุ่นของกล้อง และชื่อของช่างภาพที่ถือกล้องตัวนั้นอยู่ เพื่อให้คุณทราบสถานะการทำงานของทีมงานแต่ละคนได้อย่างชัดเจน"
                    },
                    {
                      num: "4",
                      color: "bg-pink-600",
                      title: "AI Beauty Engine",
                      desc: "สวิตช์ควบคุมการทำงานของ AI ปรับผิวเนียนอัจฉริยะ เมื่อเปิดใช้งาน รูปถ่ายที่ส่งมาจากกล้องตัวนั้นจะถูกประมวลผลผ่าน AI ทันที เพื่อให้ได้รูปภาพที่สวยงามและพร้อมสำหรับดาวน์โหลดในเวลาเพียงไม่กี่วินาที สามารถเปิด/ปิด การทำงานได้ตลอดเวลา"
                    },
                    {
                      num: "5",
                      color: "bg-blue-500",
                      title: "Extra Camera Slots",
                      desc: "ปุ่มสำหรับขยายขีดความสามารถของงาน (Add-on) ในกรณีที่คุณมีทีมช่างภาพมากกว่าจำนวน Slot เริ่มต้น คุณสามารถซื้อ Slot เพิ่มเติมได้จากจุดนี้ เพื่อให้รองรับการเชื่อมต่อกล้องพร้อมกันได้หลายตัวในงานเดียว"
                    },
                    {
                      num: "6",
                      color: "bg-amber-600",
                      title: "Watermark Branding",
                      desc: "เครื่องมือปรับแต่งเอกลักษณ์ของภาพ (Branding) คุณสามารถอัปโหลดไฟล์โลโก้ .PNG เลือกตำแหน่งการวาง (มุมต่างๆ หรือตรงกลาง) ปรับขนาด และค่าความโปร่งแสงได้แบบอิสระ เพื่อให้รูปภาพทุกลูกค้าที่ดาวน์โหลดติดลายน้ำแบรนด์ของคุณ"
                    },
                    {
                      num: "7",
                      color: "bg-zinc-900",
                      title: "Storage Control",
                      desc: "ระบบบริหารจัดการพื้นที่จัดเก็บและระยะเวลาการแสดงผล คุณสามารถตรวจสอบจำนวนวันที่เหลืออยู่ก่อนที่งานจะหมดอายุ และสามารถกดขยายเวลา (Extend) เพื่อยืดระยะเวลาการเก็บรูปภาพบน Cloud ของเราได้ตามต้องการ เพื่อให้ลูกค้าเข้าถึงรูปภาพได้ยาวนานขึ้น"
                    }
                 ].map((item, i) => (
                    <div key={i} className="flex gap-8 group">
                       <div className={`w-10 h-10 ${item.color} text-white rounded-2xl flex items-center justify-center text-lg font-black shadow-lg shrink-0 group-hover:scale-110 transition-transform`}>
                          {item.num}
                       </div>
                       <div className="space-y-2">
                          <h6 className="font-black text-base uppercase tracking-widest text-zinc-900 dark:text-white italic">
                            {item.title}
                          </h6>
                          <p className="text-[13px] text-zinc-500 leading-relaxed font-medium italic opacity-90">
                            {item.desc}
                          </p>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: FTP & FTPS Security Configuration */}
        {activeTab === 'ftp-config' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Security Badge */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3">
                <h3 className="text-3xl font-black tracking-tighter">FTP/FTPS Configuration</h3>
                <p className="text-zinc-500 font-medium italic">"เทคโนโลยีการส่งข้อมูลที่รวดเร็วและปลอดภัยระดับมาตรฐานโลก"</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                <ShieldCheck size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Enterprise Secure Connection</span>
              </div>
            </div>

            {/* Security Explanation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600"><Wifi size={24} /></div>
                <h4 className="text-lg font-black italic">FTP (Standard)</h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-medium">เป็นการส่งข้อมูลรูปแบบมาตรฐานที่เน้นความรวดเร็วและรองรับกล้องรุ่นเก่าได้หลากหลาย ใช้งานง่ายภายใต้ระบบเครือข่ายที่มีการป้องกัน</p>
              </div>
              <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] shadow-xl space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full group-hover:bg-blue-500/20 transition-all" />
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white relative z-10"><Lock size={24} /></div>
                <h4 className="text-lg font-black italic relative z-10">FTPS (Secure Explicit)</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium relative z-10">
                  <strong>แนะนำเพื่อความปลอดภัยสูงสุด:</strong> ระบบจะทำการเข้ารหัสข้อมูลด้วย SSL/TLS ก่อนการส่งไฟล์ ป้องกันการถูกดักจับข้อมูลระหว่างทาง เหมาะสำหรับงานระดับองค์กรและข้อมูลที่ต้องการความปลอดภัยสูง
                </p>
              </div>
            </div>

            {/* Technical Connection Details */}
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Settings size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Server Credentials</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1 uppercase tracking-widest">ใช้ข้อมูลชุดเดียวกันได้ทั้ง FTP และ FTPS</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">FTP/FTPS Server (Host)</span>
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="flex-1 flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">ftp.rooplife.com</span>
                      <Copy size={16} className="text-zinc-300 hover:text-blue-500 cursor-pointer" onClick={() => copyToClipboard('ftp.rooplife.com')} />
                    </div>
                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 min-w-[120px]">
                      <span className="text-xs font-bold text-zinc-400 uppercase">Port:</span>
                      <span className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">21</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Username & Password</span>
                  <div className="bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100/50 dark:border-blue-900/20 flex items-center gap-4">
                    <Info size={18} className="text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-400 font-medium italic leading-relaxed">
                      "เนื่องจากเหตุผลด้านความปลอดภัย บัญชีผู้ใช้จะถูกสร้างแยกตามอุปกรณ์กล้อง คุณสามารถดู Username และ Password ได้จากเมนู <strong>'โรงรถ' (Garage)</strong> ของคุณเท่านั้น"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Team & Joining - Concept 2: The Central Station */}
        {activeTab === 'team-join' && (
  <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
    
    {/* 1. Header: The Philosophy */}
    <div className="text-center space-y-4 max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
        Join Code Protocol
      </div>
      <h3 className="text-4xl font-black tracking-tighter uppercase italic text-zinc-900 dark:text-white leading-none">
        หนึ่งโปรเจกต์ <span className="text-blue-600">ร้อยตากล้อง</span> <br/>
        จบที่แกลเลอรีเดียว
      </h3>
      <p className="text-zinc-500 font-medium italic text-sm">
        "ไม่ต้องแยกส่งลิงก์ให้ลูกค้าหลายที่ แค่ใช้ Join Code รูปจากทุกคนจะไหลมารวมกันทันที"
      </p>
    </div>

    {/* 2. The 3-Step Journey */}
    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto px-4">
      {/* Step 1: The Owner */}
      <div className="relative group">
        <div className="absolute -top-6 -left-6 text-8xl font-black text-zinc-100 dark:text-zinc-900/50 -z-10 group-hover:text-blue-500/10 transition-colors">01</div>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-6 relative overflow-hidden h-full">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Plus size={28} strokeWidth={2.5} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black italic">สร้าง Event</h4>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-wider">
              เมื่อสร้าง Event เสร็จ คุณจะได้รับ <span className="text-blue-600 font-bold italic">Join Code 6 หลัก</span> เพื่อส่งให้เพื่อนตากล้องในทีม
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Action: Event Owner</span>
            <ArrowRight size={16} className="text-zinc-300 md:rotate-0 rotate-90" />
          </div>
        </div>
      </div>

      {/* Step 2: The Friend */}
      <div className="relative group">
        <div className="absolute -top-6 -left-6 text-8xl font-black text-zinc-100 dark:text-zinc-900/50 -z-10 group-hover:text-purple-500/10 transition-colors">02</div>
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-6 relative overflow-hidden h-full">
          <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <QrCode size={28} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black italic">เพื่อนกด Join</h4>
            <p className="text-xs text-zinc-500 font-medium leading-relaxed uppercase tracking-wider">
              เพื่อนตากล้องเลือกเมนู <span className="text-purple-600 font-bold italic">"Join Code"</span> ในหน้า Dashboard แล้วกรอกรหัส 6 หลักที่ได้รับ
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Action: Team Members</span>
            <ArrowRight size={16} className="text-zinc-300 md:rotate-0 rotate-90" />
          </div>
        </div>
      </div>

      {/* Step 3: Collaboration */}
      <div className="relative group">
        <div className="absolute -top-6 -left-6 text-8xl font-black text-zinc-100 dark:text-zinc-900/50 -z-10 group-hover:text-green-500/10 transition-colors">03</div>
        <div className="bg-zinc-950 text-white p-8 rounded-[2.5rem] shadow-2xl space-y-6 relative overflow-hidden h-full">
          <div className="w-14 h-14 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Camera size={28} />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black italic">เพิ่มกล้องเข้างาน</h4>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed uppercase tracking-wider">
              เพื่อนจะเห็น Event ของ Owner ทันที จากนั้นแค่ <span className="text-green-500 font-bold italic">เพิ่มกล้องตัวเอง</span> เพื่อเริ่มส่งรูปเข้าแกลเลอรีหลัก
            </p>
          </div>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Result: Shared Gallery</span>
            <CheckCircle2 size={16} className="text-green-500" />
          </div>
        </div>
      </div>
    </div>

    {/* 3. Outcome Summary */}
    <div className="max-w-4xl mx-auto bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] p-10 border border-blue-100 dark:border-blue-900/20 flex flex-col md:flex-row items-center gap-10">
      <div className="flex-1 space-y-4 text-center md:text-left">
         <h5 className="text-2xl font-black italic tracking-tight italic">แกลเลอรีเดียว.. ที่รวบรวมทุกความทรงจำ</h5>
         <p className="text-sm text-zinc-500 font-medium italic leading-relaxed">
           ไม่ว่าช่างภาพจะมาช่วยงานกี่คน หรือใช้กล้องกี่ตัว ลูกค้าไม่จำเป็นต้องสแกนหลายครั้ง เพียงเข้าลิงก์เดียว ระบบ AI จะรวบรวมรูปภาพจากตากล้องทุกคนมาแสดงผลแบบ Real-time ทันที
         </p>
      </div>
      <div className="flex -space-x-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-14 h-14 rounded-full border-4 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shadow-xl">
             <Camera size={20} className={i === 1 ? "text-blue-500" : i === 2 ? "text-purple-500" : "text-green-500"} />
          </div>
        ))}
      </div>
    </div>
  </div>
)}


        {/* Tab Content: Billing & Wallet (Full Redesign) */}
        {activeTab === 'billing' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Wallet Top-up Instructions - 4 Steps Layout */}
            <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
              
              <div className="flex items-center gap-4 mb-10 text-blue-600 dark:text-blue-400 relative z-10">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-blue-100/50 dark:border-zinc-800"><Wallet size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">การจัดการ Wallet</h3>
                  <p className="text-xs text-blue-600/60 font-bold uppercase tracking-widest mt-1">Payment & Refill Process</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {[
                  { 
                    step: "1", 
                    title: "กดปุ่มเติมเงิน", 
                    desc: "กดปุ่ม 'Top Up' หรือ 'เติมเงิน' ในหน้า Dashboard หรือหน้า Wallet" 
                  },
                  { 
                    step: "2", 
                    title: "เลือกจำนวนเงิน", 
                    desc: "เลือกยอดที่ต้องการเติมเข้าระบบ (100, 300, 500 หรือ 1,000 บาท)" 
                  },
                  { 
                    step: "3", 
                    title: "สแกน QR Code", 
                    desc: "ใช้แอปธนาคารสแกนจ่ายผ่าน ThaiQR พร้อมเพย์ที่ระบบสร้างให้ทันที" 
                  },
                  { 
                    step: "4", 
                    title: "เงินเข้า Wallet", 
                    desc: "ยอดเงินจะถูกอัปเดตเข้ากระเป๋าของคุณอัตโนมัติภายใน 1-3 วินาที" 
                  }
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-4 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm p-7 rounded-[2.2rem] border border-white dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm shadow-lg shadow-blue-500/20">
                      {s.step}
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-black text-zinc-900 dark:text-zinc-100 leading-tight italic">{s.title}</h4>
                      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed italic opacity-80">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Table - 4 Cards Grid */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="w-1.5 h-6 bg-zinc-900 dark:bg-white rounded-full" />
                <h4 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-400">Service Fees & Pricing</h4>
              </div>

            </div>
          </div>
        )}


        {/* Support Footer */}
        <div className="mt-16 p-10 bg-blue-600 rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-3xl font-black tracking-tighter mb-2 italic uppercase">Support Center</h2>
            <p className="text-blue-100 font-medium">หากพบปัญหาการใช้งานหรือต้องการสอบถามเพิ่มเติม ติดต่อทีมงานได้ทันที</p>
          </div>
          <button className="relative z-10 px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl uppercase text-xs tracking-[0.3em]">
            ติดต่อทีมงาน
          </button>
          <HelpCircle className="absolute -left-10 -bottom-10 w-48 h-48 text-white/10 -rotate-12" />
        </div>
      </main>
    </div>
  );
}