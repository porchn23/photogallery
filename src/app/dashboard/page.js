'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';
// แก้ไขบรรทัดการ import เดิมให้ครอบคลุมไอคอนที่ใช้ครับ
import { Plus, Camera, Users, Wallet } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  
  // --- States ---
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // --- Initial Fetch ---
  useEffect(() => {
    fetchUserData();
    fetchMyEvents();
  }, []);

// ... existing code ...

async function fetchUserData() {
    // 1. ลองดึงจาก Auth ก่อน
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    let targetId = authUser?.id;

    // 2. ถ้าไม่มี Auth (ไม่ได้ Login) ให้ดึง User คนแรกจาก DB มาเทส
    if (!targetId) {
      const { data: firstUser } = await supabase.from('users').select('id').limit(1).single();
      targetId = firstUser?.id;
    }

    if (targetId) {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetId)
        .single();
      setUser(data);
    }
  }

  async function fetchMyEvents() {
    // ทำเหมือนกันกับส่วนดึง Event
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let targetId = authUser?.id;

    if (!targetId) {
      const { data: firstUser } = await supabase.from('users').select('id').limit(1).single();
      targetId = firstUser?.id;
    }

    if (targetId) {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', targetId)
        .order('created_at', { ascending: false });
      setEvents(data || []);
    }
    setLoading(false);
  }

  // --- Logic: Create Event ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user || user.wallet_balance < 100) {
      setError('ยอดเงินไม่พอ (ต้องการ 100 THB)');
      return;
    }

    try {
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      // 1. หักเงิน
      const { error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance: user.wallet_balance - 100 })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 2. บันทึกธุรกรรม
      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: -100,
        type: 'create_event',
        description: `เปิดงานใหม่: ${newTitle}`
      });

      // 3. สร้าง Event
      const { error: eventError } = await supabase
        .from('events')
        .insert({
          owner_id: user.id,
          title: newTitle,
          join_code: joinCode,
          max_cameras: 1,
          storage_days: 3,
          status: 'active'
        });

      if (eventError) throw eventError;

      setNewTitle('');
      setIsCreating(false);
      fetchUserData();
      fetchMyEvents();
      
    } catch (err) {
      setError('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // --- Temporary Test Function ---
  // --- Temporary Test Function ---
  const handleTopUpTest = async () => {
    // เพิ่มการเช็คตรงนี้ครับ
    if (!user) {
      alert('ไม่พบข้อมูลผู้ใช้ กรุณารอโหลดข้อมูลหรือ Login ใหม่');
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance: (user?.wallet_balance || 0) + 1000 })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: 1000,
        type: 'topup',
        description: 'Test Top-up 1000 THB'
      });

      fetchUserData(); // โหลดข้อมูลยอดเงินใหม่
      alert('เติมเงินทดสอบสำเร็จ 1,000 THB');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    
    // 1. ค้นหา Event จาก Join Code
    const { data: eventData, error: findError } = await supabase
      .from('events')
      .select('id')
      .eq('join_code', joinCodeInput.toUpperCase())
      .single();
  
    if (findError || !eventData) {
      alert('ไม่พบอีเวนต์จากรหัสนี้');
      return;
    }
  
    // 2. เพิ่มชื่อเราเข้าไปใน Event Members (ถ้าต้องการเก็บประวัติคนช่วยงาน)
    // หรือในที่นี้ เราสามารถพาเขาไปหน้า Command Center ได้เลย
    router.push(`/dashboard/event/${eventData.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-6">
      {/* Header & Wallet */}
      <Header balance={user?.wallet_balance} /> {/* โลโก้จะมาโผล่ตรงนี้ */}
      <main className="p-6">

      {/* Main Actions */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
  {/* Card 1: Create Event */}
  <button 
    onClick={() => setIsCreating(true)}
    className="group flex flex-col items-center justify-center p-8 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-zinc-200 dark:shadow-none"
  >
    <div className="w-14 h-14 bg-white/10 dark:bg-black/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Plus size={28} />
    </div>
    <span className="font-black text-lg tracking-tight">Create Event</span>
    <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">100 THB / Job</span>
  </button>

  {/* Card 2: My Garage */}
  <Link 
    href="/dashboard/garage" 
    className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-sm hover:shadow-md"
  >
    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors mb-4 group-hover:scale-110 transition-transform">
      <Camera size={28} strokeWidth={1.5} />
    </div>
    <span className="font-black text-lg tracking-tight">My Garage</span>
    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage Equipment</span>
  </Link>

  {/* Card 3: Join with Code (ปรับใหม่ให้ชัดเจน) */}
  <button 
    onClick={() => setIsJoining(true)}
    className="group flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-sm hover:shadow-md"
  >
    <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-purple-500 transition-colors mb-4 group-hover:scale-110 transition-transform">
      <Users size={28} strokeWidth={1.5} />
    </div>
    <span className="font-black text-lg tracking-tight">Join Event</span>
    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Join with 6-Digit Code</span>
  </button>
</div>


      {/* Create Event Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">สร้างอีเวนต์ใหม่</h2>
            <p className="text-zinc-500 text-sm mb-6">ระบบจะหักเงิน 100 บาทจากกระเป๋าของคุณทันที</p>
            
            <form onSubmit={handleCreateEvent}>
              <div className="mb-6 text-black dark:text-white">
                <label className="block text-sm font-medium mb-2">ชื่ออีเวนต์ (เช่น งานแต่งคุณเอคุณบี)</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-4 focus:ring-2 ring-black dark:ring-white transition-all"
                  placeholder="ระบุชื่อผลงานของคุณ..."
                />
              </div>

              {error && <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>}

              <div className="flex gap-3 text-black dark:text-white">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-4 font-semibold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit"
                  className="flex-2 px-8 py-4 bg-zinc-950 dark:bg-zinc-50 dark:text-black text-white font-bold rounded-2xl hover:opacity-90 transition-opacity"
                >
                  ยืนยันจ่าย 100 บาท
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-xl font-bold">My Events</h2>

            <button 
            onClick={() => setIsJoining(true)} // เพิ่มบรรทัดนี้
            className="text-blue-500 text-sm font-medium"
            >
            Join with Code
            </button>

        </div>

        {loading ? (
          <div className="animate-pulse text-zinc-400">Loading events...</div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {events.map((event) => (
              <Link key={event.id} href={`/dashboard/event/${event.id}`}>
                <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <h3 className="font-bold">{event.title}</h3>
                    <p className="text-xs text-zinc-500">Code: {event.join_code} • {event.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">{new Date(event.created_at).toLocaleDateString()}</p>
                    <span className="text-blue-500 text-sm">Manage →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500">ยังไม่มีโปรเจกต์งาน, เริ่มต้นสร้างงานแรกของคุณเลย!</p>
          </div>
        )}
      </section>
      </main>

{/* Modal สำหรับกรอก Join Code */}
{isJoining && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black dark:text-white">
    <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 dark:border-zinc-800">
      <h2 className="text-2xl font-black mb-2 tracking-tight">Join Event</h2>
      <p className="text-zinc-500 text-sm mb-8 font-medium">กรอกรหัส 6 หลักเพื่อเข้าร่วมบริหารจัดการงาน</p>
      
      <form onSubmit={handleJoinEvent}>
        <input 
          autoFocus
          required
          maxLength={6}
          type="text" 
          value={joinCodeInput}
          onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
          className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-5 text-center text-3xl font-black tracking-[0.5em] focus:ring-2 ring-blue-500 transition-all mb-8 uppercase"
          placeholder="ABCDEF"
        />
        <div className="flex gap-3">
          <button type="button" onClick={() => setIsJoining(false)} className="flex-1 py-4 text-zinc-400 hover:text-zinc-600 font-bold uppercase text-[10px] tracking-widest transition-colors">Cancel</button>
          <button type="submit" className="flex-2 px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none uppercase text-xs tracking-widest hover:bg-blue-700 transition-colors">Join Now</button>
        </div>
      </form>
    </div>
  </div>
)}      
    </div>

    

  );
}