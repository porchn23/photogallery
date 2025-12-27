// src/app/dashboard/guide/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { 
  Camera, Zap, Wifi, ShieldCheck, 
  Settings, HelpCircle, BookOpen, ChevronRight,
  Monitor, Smartphone, Info, CreditCard, Copy, Check,
  Plus, Calendar, Layers, Clock, Crown, Image as ImageIcon,
  Sliders, ArrowRight, Wallet, QrCode, Hourglass
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
    { id: 'ftp-config', label: 'การตั้งค่า FTP', icon: <Settings size={18} /> },
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

        {/* Tab Navigation */}
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl mb-8 gap-1 overflow-x-auto no-scrollbar shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Getting Started */}
        {activeTab === 'getting-started' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                  desc: "ไปที่เมนู 'โรงรถ' เพื่อเพิ่มกล้องของคุณ ระบบจะสร้างรหัส FTP ประจำตัวกล้องให้ (ห้ามใช้รหัสร่วมกัน)",
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
                  title: "เข้าร่วมงาน (Join Event)", 
                  desc: "นำรหัส Join Code มากรอกเพื่อเอากล้องที่ลงทะเบียนไว้เข้าสู่งานที่ต้องการส่งรูป",
                  icon: <Wifi className="text-green-500" /> 
                },
                { 
                  step: "05", 
                  title: "จัดการลายน้ำ (Watermark)", 
                  desc: "ในหน้าจัดการงาน คุณสามารถอัปโหลดไฟล์ .png เพื่อใช้เป็นลายน้ำบนภาพ (Backend จะวางให้อัตโนมัติที่มุมล่างขวา)",
                  icon: <ImageIcon className="text-purple-500" />,
                  details: ["รองรับไฟล์ .png โปร่งใส", "ปรับความจางได้ 0-100%", "แสดงตัวอย่าง (Preview) ได้ทันที"]
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

        {/* Tab Content: FTP Config */}
        {activeTab === 'ftp-config' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Camera size={28} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Technical FTP Configuration</h3>
                  <p className="text-xs text-zinc-400 font-medium mt-1 uppercase tracking-widest">ข้อมูลสำหรับตั้งค่าในตัวกล้อง</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">FTP Server / Host</span>
                  <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                    <span className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">ftp.rooplife.com</span>
                    <span className="text-xs font-mono px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">Port: 21</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Username & Password</span>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                      <span className="text-xs font-medium text-zinc-400 italic">ดูได้จากเมนู 'โรงรถ' (Garage) ของคุณ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Billing & Wallet */}
        {activeTab === 'billing' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Wallet Top-up Instructions */}
            <div className="p-8 bg-blue-50 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20 shadow-sm">
              <div className="flex items-center gap-4 mb-8 text-blue-600 dark:text-blue-400">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm"><Wallet size={32} /></div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter">การจัดการ Wallet</h3>
                  <p className="text-xs text-blue-600/60 font-bold uppercase tracking-widest mt-1">Payment & Refill Step</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: "1", title: "เลือกจำนวนเงิน", desc: "ไปที่หน้า Wallet เลือกจำนวนเงินที่ต้องการ (100, 300, 500, 1000)" },
                  { step: "2", title: "สแกน QR Code", desc: "ระบบจะสร้าง ThaiQR ให้คุณสแกนจ่ายผ่านแอปธนาคารได้ทันที" },
                  { step: "3", title: "เงินเข้าอัตโนมัติ", desc: "เมื่อจ่ายสำเร็จ ยอดเงินจะถูกอัปเดตในระบบภายใน 1-3 วินาที" }
                ].map((s, i) => (
                  <div key={i} className="flex flex-col gap-3 bg-white/50 dark:bg-zinc-900/50 p-6 rounded-[2rem] border border-white dark:border-zinc-800 shadow-sm">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-sm">{s.step}</div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{s.title}</h4>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-8 bg-zinc-950 text-white rounded-[2.5rem] flex flex-col justify-between shadow-xl relative overflow-hidden group">
                <div className="relative z-10">
                  <Crown className="text-blue-500 mb-6" size={32} />
                  <h4 className="font-bold text-xl mb-1">สร้างอีเวนต์ใหม่</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Starter Job Package</p>
                  <div className="text-4xl font-black text-blue-500 tracking-tighter">฿100.00 <span className="text-[10px] font-bold text-zinc-500">/ งาน</span></div>
                </div>
                <div className="absolute -right-6 -bottom-6 text-white/5 rotate-12 group-hover:scale-110 transition-transform"><Crown size={120} /></div>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <Hourglass className="text-amber-500 mb-6" size={32} />
                  <h4 className="font-bold text-xl mb-1">ขยายเวลาเก็บรูป</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Extend Storage Period</p>
                  <div className="text-4xl font-black text-amber-500 tracking-tighter">฿50.00 <span className="text-[10px] font-bold text-zinc-400">/ 1 วัน</span></div>
                </div>
                <div className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800 rotate-12 group-hover:scale-110 transition-transform"><Clock size={120} /></div>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <Zap className="text-yellow-500 mb-6" size={32} />
                  <h4 className="font-bold text-xl mb-1">AI Beauty</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Retouch Processing</p>
                  <div className="text-4xl font-black text-blue-600 tracking-tighter">฿1.20 <span className="text-[10px] font-bold text-zinc-400">/ รูป</span></div>
                </div>
                <div className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800 rotate-12 group-hover:scale-110 transition-transform"><Zap size={120} /></div>
              </div>

              <div className="p-8 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] flex flex-col justify-between shadow-sm relative overflow-hidden group">
                <div className="relative z-10">
                  <Plus className="text-purple-500 mb-6" size={32} />
                  <h4 className="font-bold text-xl mb-1">เพิ่ม Camera Slot</h4>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mb-6">Extra Team Access</p>
                  <div className="text-4xl font-black text-blue-600 tracking-tighter">฿50.00 <span className="text-[10px] font-bold text-zinc-400">/ กล้อง</span></div>
                </div>
                <div className="absolute -right-6 -bottom-6 text-zinc-100 dark:text-zinc-800 rotate-12 group-hover:scale-110 transition-transform"><Camera size={120} /></div>
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