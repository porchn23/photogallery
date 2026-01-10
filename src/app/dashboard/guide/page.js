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
  Sliders, ArrowRight, Wallet, QrCode, Hourglass, Users, Sparkles, Lock
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
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center md:text-left space-y-3">
              <h3 className="text-3xl font-black tracking-tighter">Event Management</h3>
              <p className="text-zinc-500 font-medium italic">"ปรับแต่งและควบคุมทุกอย่างในอีเวนต์ของคุณ"</p>
            </div>

            {/* ส่วนที่ 1: สิ่งที่ได้รับทันที (Starter Package ฿100) */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                <div>
                  <h4 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Starter Pack</h4>
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">สิ่งที่ได้รับทันทีเมื่อเปิดอีเวนต์</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "AI Face Recognition",
                    desc: "ระบบค้นหาใบหน้าอัจฉริยะ ลูกค้าหารูปตัวเองเจอใน 1 วินาที พร้อมใช้งานทันทีที่เปิดงาน",
                    icon: <Users size={24} className="text-blue-500" />
                  },
                  {
                    title: "1 Camera Slot",
                    desc: "สิทธิ์การเชื่อมต่อกล้อง 1 ตัว สำหรับส่งรูปภาพผ่าน FTP เข้าสู่ระบบ (สามารถเปลี่ยนสลับกล้องได้)",
                    icon: <Camera size={24} className="text-blue-500" />
                  },
                  {
                    title: "2 Days Cloud Storage",
                    desc: "พื้นที่เก็บรูปภาพบนระบบ Cloud นาน 2 วัน นับจากเวลาเริ่มต้นอีเวนต์ (นับเวลาหลังจบงาน)",
                    icon: <Hourglass size={24} className="text-blue-500" />
                  },
                  {
                    title: "Watermark Branding",
                    desc: "ระบบประทับลายน้ำอัตโนมัติบนรูปภาพทุกลูกค้าที่ดาวน์โหลด (รองรับไฟล์ .png โปร่งใส)",
                    icon: <ImageIcon size={24} className="text-blue-500" />
                  }
                ].map((item, i) => (
                  <div key={i} className="p-6 bg-blue-50/30 dark:bg-blue-900/5 border border-blue-100/50 dark:border-blue-800/20 rounded-[2rem] flex items-start gap-5 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm">
                    <div className="p-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm shrink-0 border border-zinc-100 dark:border-zinc-800">{item.icon}</div>
                    <div className="space-y-1.5 pt-1">
                      <h5 className="font-black text-zinc-900 dark:text-zinc-100 italic">{item.title}</h5>
                      <p className="text-xs text-zinc-500 leading-relaxed font-medium italic opacity-80">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ส่วนที่ 2: บริการเพิ่มเติม (Add-on Services) */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-8 bg-purple-500 rounded-full" />
                <div>
                  <h4 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Professional Add-ons</h4>
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mt-0.5">ขยายขีดความสามารถให้งานของคุณ</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Extra Slot",
                    desc: "เพิ่มจำนวนช่างภาพในทีม",
                    price: "฿59",
                    unit: "ต่อกล้อง",
                    icon: <Plus size={28} />,
                    color: "text-purple-500",
                    bg: "bg-purple-50 dark:bg-purple-900/20"
                  },
                  {
                    title: "Extend Storage",
                    desc: "ขยายเวลาการเก็บรูปภาพ",
                    price: "฿49",
                    unit: "ต่อ 1 วัน",
                    icon: <Clock size={28} />,
                    color: "text-amber-500",
                    bg: "bg-amber-50 dark:bg-amber-900/20"
                  },
                  {
                    title: "AI Beauty",
                    desc: "ปรับผิวเนียนอัจฉริยะ",
                    price: "฿0.9-1.2",
                    unit: "ต่อรูป",
                    icon: <Sparkles size={28} />,
                    color: "text-pink-500",
                    bg: "bg-pink-50 dark:bg-pink-900/20"
                  }
                ].map((item, i) => (
                  <div key={i} className="group p-10 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[3rem] shadow-sm hover:shadow-2xl hover:border-blue-500/30 transition-all duration-500 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-full" />
                    <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      {item.icon}
                    </div>
                    <h5 className="text-xl font-black mb-2 italic tracking-tight">{item.title}</h5>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-6 px-4">{item.desc}</p>
                    <div className={`text-3xl font-black ${item.color} tracking-tighter`}>
                      {item.price} <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest ml-1">{item.unit}</span>
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

        {/* Tab Content: Team & Joining */}
        {activeTab === 'team-join' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center md:text-left space-y-2">
              <h3 className="text-3xl font-black tracking-tighter">Collaborative Workflow</h3>
              <p className="text-zinc-500 font-medium italic">"ช่างภาพหลายคน งานเดียว คลังรูปเดียว"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 mb-6"><Crown size={24} /></div>
                 <h4 className="text-xl font-black mb-3 italic">สำหรับเจ้าของงาน (Owner)</h4>
                 <ul className="space-y-4 text-sm font-medium text-zinc-500">
                   <li className="flex gap-3"><ChevronRight className="shrink-0 text-blue-500" size={18} /> <span>ในหน้าแดชบอร์ด คุณจะเห็น Join Code 6 หลัก</span></li>
                   <li className="flex gap-3"><ChevronRight className="shrink-0 text-blue-500" size={18} /> <span>ส่งรหัสนี้ให้เพื่อนร่วมทีมที่ต้องการให้ช่วยถ่ายงาน</span></li>
                   <li className="flex gap-3"><ChevronRight className="shrink-0 text-blue-500" size={18} /> <span>คุณเป็นคนเดียวที่มีสิทธิ์จัดการลายน้ำ และลบรูปภาพ</span></li>
                 </ul>
              </div>
              <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 mb-6"><Users size={24} /></div>
                 <h4 className="text-xl font-black mb-3 italic">สำหรับผู้ร่วมงาน (Joiner)</h4>
                 <ul className="space-y-4 text-sm font-medium text-zinc-500">
                   <li className="flex gap-3"><ChevronRight className="shrink-0 text-purple-500" size={18} /> <span>กดปุ่ม "Join Event" ในหน้าแดชบอร์ดหลัก</span></li>
                   <li className="flex gap-3"><ChevronRight className="shrink-0 text-purple-500" size={18} /> <span>กรอกรหัส 6 หลักที่ได้รับจากเจ้าของงาน</span></li>
                   <li className="flex gap-3"><ChevronRight className="shrink-0 text-purple-500" size={18} /> <span>เมื่องานปรากฏ ให้กด "Add Camera" เพื่อเลือกกล้องเข้างาน</span></li>
                 </ul>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Create Event */}
                <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] flex flex-col justify-between shadow-xl relative overflow-hidden group min-h-[220px]">
                  <div className="relative z-10">
                    <Crown className="text-blue-500 mb-6" size={32} />
                    <h5 className="font-black text-xl mb-1 italic">สร้างอีเวนต์ใหม่</h5>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Starter Job Package</p>
                    <div className="text-4xl font-black text-blue-500 tracking-tighter">฿100.00 <span className="text-[10px] font-bold text-zinc-500">/ งาน</span></div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-white/5 rotate-12 group-hover:scale-110 transition-transform"><Crown size={120} /></div>
                </div>

                {/* 2. Extend Storage */}
                <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[220px]">
                  <div className="relative z-10">
                    <Hourglass className="text-amber-500 mb-6" size={32} />
                    <h5 className="font-black text-xl mb-1 italic">ขยายเวลาเก็บรูป</h5>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Extend Storage Period</p>
                    <div className="text-4xl font-black text-amber-500 tracking-tighter">฿50.00 <span className="text-[10px] font-bold text-zinc-400">/ 1 วัน</span></div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800 rotate-12 group-hover:scale-110 transition-transform"><Clock size={120} /></div>
                </div>

                {/* 3. AI Beauty */}
                <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[220px]">
                  <div className="relative z-10">
                    <Zap className="text-blue-600 mb-6" size={32} />
                    <h5 className="font-black text-xl mb-1 italic">AI Beauty</h5>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Retouch Processing</p>
                    <div className="text-4xl font-black text-blue-600 tracking-tighter">฿1.20 <span className="text-[10px] font-bold text-zinc-400">/ รูป</span></div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800 rotate-12 group-hover:scale-110 transition-transform"><Zap size={120} /></div>
                </div>

                {/* 4. Extra Camera Slot */}
                <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-col justify-between shadow-sm relative overflow-hidden group min-h-[220px]">
                  <div className="relative z-10">
                    <Plus className="text-purple-500 mb-6" size={32} />
                    <h5 className="font-black text-xl mb-1 italic">เพิ่ม Camera Slot</h5>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Extra Team Access</p>
                    <div className="text-4xl font-black text-blue-600 tracking-tighter">฿50.00 <span className="text-[10px] font-bold text-zinc-400">/ กล้อง</span></div>
                  </div>
                  <div className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800 rotate-12 group-hover:scale-110 transition-transform"><Camera size={120} /></div>
                </div>
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