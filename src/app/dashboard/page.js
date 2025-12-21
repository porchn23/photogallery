'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';
import { Plus, Camera, Users, Calendar, Zap, Copy, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  
  // --- States ---
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  
  // Form States
  const [newTitle, setNewTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [error, setError] = useState('');

  // --- Initial Fetch ---
  useEffect(() => {
    fetchUserData();
    fetchMyEvents();
  }, []);

  // --- Helpers ---
  const getEventStatus = (startTime, storageDays) => {
    if (!startTime) return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' };
    
    const now = new Date();
    const start = new Date(startTime);
    const expiry = new Date(start.getTime() + (storageDays * 24 * 60 * 60 * 1000));

    if (now < start) {
      return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' };
    } else if (now >= start && now <= expiry) {
      return { label: 'Active', color: 'text-green-500', dot: 'bg-green-500 animate-pulse', bg: 'bg-green-50 dark:bg-green-900/10' };
    } else {
      return { label: 'สิ้นสุด', color: 'text-red-500', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/10' };
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('คัดลอก Join Code แล้ว: ' + text);
  };

  async function fetchUserData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let targetId = authUser?.id;

    if (!targetId) {
      const { data: firstUser } = await supabase.from('users').select('*').limit(1).single();
      targetId = firstUser?.id;
      if (firstUser) setUser(firstUser);
    } else {
      const { data: userData } = await supabase.from('users').select('*').eq('id', targetId).single();
      if (userData) setUser(userData);
    }
  }

  async function fetchMyEvents() {
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

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!user || user.wallet_balance < 100) {
      setError('ยอดเงินไม่พอ (ต้องการ 100 THB)');
      return;
    }

    try {
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance: user.wallet_balance - 100 })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: -100,
        type: 'create_event',
        description: `เปิดงานใหม่: ${newTitle}`
      });

      const { error: eventError } = await supabase
        .from('events')
        .insert({
          owner_id: user.id,
          title: newTitle,
          start_time: startTime,
          join_code: joinCode,
          max_cameras: 1,
          storage_days: 3,
          status: 'active'
        });

      if (eventError) throw eventError;

      setNewTitle('');
      setStartTime('');
      setIsCreating(false);
      fetchUserData();
      fetchMyEvents();
      
    } catch (err) {
      setError('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    const { data: eventData, error: findError } = await supabase
      .from('events')
      .select('id')
      .eq('join_code', joinCodeInput.toUpperCase())
      .single();

    if (findError || !eventData) {
      alert('ไม่พบอีเวนต์จากรหัสนี้');
      return;
    }
    router.push(`/dashboard/event/${eventData.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-black dark:text-white">
      <Header balance={user?.wallet_balance} />
      
      <main className="max-w-6xl mx-auto p-6 md:p-12 lg:p-16">
        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <button 
            onClick={() => setIsCreating(true)}
            className="group flex flex-col items-center justify-center p-10 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-2xl"
          >
            <div className="w-14 h-14 bg-white/10 dark:bg-black/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus size={28} strokeWidth={2.5} />
            </div>
            <span className="font-black text-lg tracking-tight">Create Event</span>
            <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">100 THB / Job</span>
          </button>

          <Link href="/dashboard/garage" className="group flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors mb-4 group-hover:scale-110 transition-transform">
              <Camera size={28} strokeWidth={1.5} />
            </div>
            <span className="font-black text-lg tracking-tight">My Garage</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage Equipment</span>
          </Link>

          <button 
            onClick={() => setIsJoining(true)}
            className="group flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-sm hover:shadow-md"
          >
            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-purple-500 transition-colors mb-4 group-hover:scale-110 transition-transform">
              <Users size={28} strokeWidth={1.5} />
            </div>
            <span className="font-black text-lg tracking-tight">Join Event</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Contributor Mode</span>
          </button>
        </div>

        {/* Events List */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-black tracking-tight tracking-tight">Active Projects</h2>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-300" size={40} /></div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {events.map((event) => {
                const status = getEventStatus(event.start_time, event.storage_days || 3);
                return (
                  <Link key={event.id} href={`/dashboard/event/${event.id}`} className="group">
                    <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-black text-2xl md:text-3xl tracking-tight group-hover:text-blue-600 transition-colors leading-none">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            <Zap size={12} className="text-blue-500" fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{event.join_code}</span>
                            <button 
                              onClick={(e) => { e.preventDefault(); copyToClipboard(event.join_code); }}
                              className="ml-1 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800 ${status.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                              {status.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs ml-2">
                            <Calendar size={14} />
                            <span>{event.start_time ? new Date(event.start_time).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : 'ไม่ระบุเวลา'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between w-full md:w-auto gap-8 border-t md:border-none pt-6 md:pt-0">
                        <div className="px-8 py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg group-hover:bg-blue-600 group-hover:text-white transition-all active:scale-95">
                          Manage Job
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 font-bold">No active projects found.</p>
            </div>
          )}
        </section>
      </main>

      {/* Modal: Create Event */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[3rem] p-10 md:p-12 shadow-2xl border border-zinc-100 dark:border-zinc-800 text-center">
            <h2 className="text-3xl font-black mb-2 tracking-tight">New Event</h2>
            <p className="text-zinc-500 text-sm mb-10 font-medium">ระบุชื่อและเวลาเพื่อเริ่มเปิดการทำงาน (฿100)</p>
            
            <form onSubmit={handleCreateEvent} className="text-left space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Event Title</label>
                <input 
                  autoFocus required type="text" value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-5 focus:ring-2 ring-blue-500 transition-all font-bold"
                  placeholder="เช่น Wedding Party @Siam"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Start Date & Time</label>
                <input 
                  required type="datetime-local" value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-5 focus:ring-2 ring-blue-500 transition-all font-bold"
                />
              </div>

              {error && <p className="text-red-500 text-xs font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">⚠️ {error}</p>}

              <div className="flex flex-col items-center gap-6 pt-6">
                <button 
                  type="submit" 
                  className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-3xl shadow-xl shadow-blue-500/20 uppercase text-sm tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Create Event (฿100)
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)} 
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold uppercase text-[10px] tracking-[0.3em] transition-colors"
                >
                  Cancel & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Event */}
      {isJoining && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl text-center">
            <h2 className="text-3xl font-black mb-2 tracking-tight">Join Job</h2>
            <p className="text-zinc-500 text-sm mb-10 font-medium">กรอกรหัส 6 หลักเพื่อเข้าควบคุมงาน</p>
            
            <form onSubmit={handleJoinEvent}>
              <input 
                autoFocus required maxLength={6} type="text" value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-[2rem] p-8 text-center text-4xl font-black tracking-[0.5em] focus:ring-2 ring-purple-500 transition-all mb-10 uppercase"
                placeholder="ABCDEF"
              />
              <div className="flex flex-col items-center gap-6">
                <button type="submit" className="w-full py-5 bg-purple-600 text-white font-black rounded-[2rem] shadow-xl shadow-purple-200 dark:shadow-none uppercase text-xs tracking-widest hover:bg-purple-700 transition-all">Join Now</button>
                <button type="button" onClick={() => setIsJoining(false)} className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}