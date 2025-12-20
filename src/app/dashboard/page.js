'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';

export default function Dashboard() {
  const router = useRouter();
  
  // --- States ---
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

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


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white p-6">
      {/* Header & Wallet */}
      <Header balance={user?.wallet_balance} /> {/* โลโก้จะมาโผล่ตรงนี้ */}
      <main className="p-6">

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        <button 
          onClick={() => setIsCreating(true)}
          className="flex flex-col items-center justify-center p-8 bg-zinc-950 text-white rounded-3xl hover:bg-zinc-800 transition-all shadow-xl"
        >
          <span className="text-3xl mb-2">➕</span>
          <span className="font-semibold text-lg">Create New Event</span>
          <span className="text-zinc-400 text-xs mt-1">Cost: 100 THB / Event</span>
        </button>

        <Link href="/dashboard/garage" className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl hover:border-zinc-400 transition-all shadow-sm">
          <span className="text-3xl mb-2">🎒</span>
          <span className="font-semibold text-lg">My Garage</span>
          <span className="text-zinc-500 text-xs mt-1">Manage your cameras</span>
        </Link>


        
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
          <button className="text-blue-500 text-sm font-medium">Join with Code</button>
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
    </div>

  );
}