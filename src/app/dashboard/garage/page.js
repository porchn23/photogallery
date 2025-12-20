'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import Header from '@/src/components/Header';
import { Camera } from 'lucide-react'; // เพิ่มไว้ด้านบนสุดร่วมกับ import อื่นๆ

export default function MyGarage() {
    // --- ย้ายมาไว้ตรงนี้ (Body ของ Function) ---
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [nickname, setNickname] = useState('');
    const [user, setUser] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  

// ... existing code (บรรทัด 1-22)

async function fetchInitialData() {
    // ดึงข้อมูล User (ใช้ Logic เดิมเพื่อ Bypass ถ้าไม่ได้ Login)
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let targetId = authUser?.id;

    if (!targetId) {
      // ตรงนี้ต้องเปลี่ยนจากดึงแค่ .select('id') เป็น .select('*') หรือเพิ่ม wallet_balance
      const { data: firstUser } = await supabase.from('users').select('*').limit(1).single();
      targetId = firstUser?.id;
      if (firstUser) {
        setUser(firstUser); // เก็บข้อมูล User ทั้งหมด (รวมยอดเงิน)
      }
    } else {
      // ถ้ามี Auth User ก็ต้องดึงข้อมูลจากตาราง users มาใส่ State ด้วย
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .single();
      if (userData) {
        setUser(userData);
      }
    }

    if (targetId) {
      fetchCameras(targetId);
    }
  }

// ... existing code (บรรทัด 38 เป็นต้นไป)

  async function fetchCameras(userId) {
    const { data } = await supabase
      .from('cameras')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });
    
    setCameras(data || []);
    setLoading(false);
  }

  const handleAddCamera = async (e) => {
    e.preventDefault();
    if (!nickname) return;

  

    try {
      // Generate Serial Number สุ่ม (สมมติว่าเป็น S/N กล้อง)
      const serialNumber = 'CAM-' + Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error } = await supabase
      .from('cameras')
      .insert({
        owner_id: user.id,
        nickname: nickname,
        brand: brand,
        model: model,
        serial_number: serialNumber,
        status: 'active'
      });

      if (error) throw error;

      // ล้างค่าเมื่อสำเร็จ (ต้องอยู่ภายในฟังก์ชัน handleAddCamera)
      setNickname('');
      setBrand('');
      setModel('');
      setIsAdding(false);
      fetchCameras(user.id);
      alert('เพิ่มกล้องสำเร็จ!');

    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-6">
        <Header balance={user?.wallet_balance} />
    <main className="p-6">
      {/* Add Camera Button */}
      <button 
        onClick={() => setIsAdding(true)}
        className="w-full py-4 mb-8 bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-500 hover:border-zinc-400 hover:text-zinc-800 transition-all font-medium"
      >
        ➕ Add New Camera
      </button>

      {/* Modal: Add Camera */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">ลงทะเบียนกล้องใหม่</h2>
            <form onSubmit={handleAddCamera}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">ตั้งชื่อเรียกกล้อง (เช่น Sony A7 - Golf)</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-4 focus:ring-2 ring-black dark:ring-white transition-all text-black dark:text-white"
                  placeholder="ระบุชื่อเพื่อให้จำง่าย..."
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 py-4 font-semibold text-zinc-500 hover:bg-zinc-100 rounded-2xl">ยกเลิก</button>
                <button type="submit" className="flex-2 px-8 py-4 bg-zinc-950 dark:bg-zinc-50 dark:text-black text-white font-bold rounded-2xl">ยืนยัน</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Camera List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p>Loading your garage...</p>
        ) : cameras.length > 0 ? (
          cameras.map((cam) => (
<div key={cam.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm overflow-hidden flex flex-col gap-6">
  
  {/* ส่วนที่ 1: หัวข้อและการระบุตัวตน (Identity) */}
  <div className="flex justify-between items-start">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
        <Camera size={28} strokeWidth={1.5} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {cam.nickname}
        </h3>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {cam.brand && (
            <span className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded uppercase">
              {cam.brand} {cam.model}
            </span>
          )}
          <span className="text-[11px] text-zinc-400 font-medium">
            S/N: {cam.serial_number}
          </span>
        </div>
      </div>
    </div>
    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-tighter">
      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
      {cam.status}
    </span>
  </div>

  {/* ส่วนที่ 2: ข้อมูลการตั้งค่า FTP (Technical Config) - เน้นความชัดเจน */}
  <div className="bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 p-5 flex flex-col gap-4">
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">FTP Server / Host</span>
      <div className="flex justify-between items-center">
        <span className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">{cam.ftp_url}</span>
        <span className="text-xs font-mono px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded text-zinc-500">Port: {cam.ftp_port || 21}</span>
      </div>
    </div>

    <div className="h-[1px] bg-zinc-200/50 dark:bg-zinc-800" />

    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Username</span>
        <span className="text-sm font-mono font-black text-blue-600 dark:text-blue-400 break-all">{cam.ftp_user}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Password</span>
        <span className="text-sm font-mono font-black text-blue-600 dark:text-blue-400">{cam.ftp_pass}</span>
      </div>
    </div>
  </div>

  {/* ส่วนที่ 3: คำแนะนำเพิ่มเติม */}
  <div className="text-center">
    <p className="text-[10px] text-zinc-400 font-medium leading-relaxed italic">
      * นำค่าด้านบนไปใส่ในเมนู FTP ของกล้อง เพื่อเริ่มส่งรูปภาพเข้าสู่ระบบ
    </p>
  </div>
</div>
        ))
        ) : (
          <div className="col-span-full text-center py-10 text-zinc-500 bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            ยังไม่มีกล้องในคลังของคุณ
          </div>
        )}
      </div>

      </main>
    </div>
  );
}