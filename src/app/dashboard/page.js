'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/src/components/Header';
import { 
  Plus, Camera, Users, Calendar, Zap, Copy, 
  Loader2, ShieldCheck, CheckCircle2, UserCheck, Crown 
} from 'lucide-react';
import { formatThaiDate } from '@/src/lib/utils';
import { logEvent } from '@/src/lib/axiom'; 

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase.from('users').select('*').eq('id', authUser.id).single();
      if (userData) {
        setUser(userData);
        const { data: ownedRes } = await supabase.from('events').select('*').eq('owner_id', authUser.id);
        const ownedEvents = (ownedRes || []).map(ev => ({ ...ev, userRole: 'owner' }));

        const { data: membershipRes } = await supabase.from('event_members').select('event_id').eq('user_id', authUser.id);
        const joinedIds = membershipRes?.map(m => m.event_id) || [];
        
        let joinedEvents = [];
        if (joinedIds.length > 0) {
          const { data: joinedRes } = await supabase.from('events').select('*').in('id', joinedIds);
          joinedEvents = (joinedRes || []).map(ev => ({ ...ev, userRole: 'joiner' }));
        }

        const allEvents = [...ownedEvents, ...joinedEvents]
          .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setEvents(allEvents);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
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
      const startTimeISO = startTime ? new Date(startTime).toISOString() : null;

      // 1. หักเงินในตาราง users เท่านั้น
      await supabase.from('users').update({ wallet_balance: user.wallet_balance - 100 }).eq('id', user.id);
      
      // 2. สร้างข้อมูล Event
      const { data: newEvent, error: eventError } = await supabase.from('events').insert({ 
        owner_id: user.id, 
        title: newTitle, 
        start_time: startTimeISO, 
        join_code: joinCode, 
        max_cameras: 1, 
        storage_days: 2,
        status: 'active' 
      }).select().single();

      if (eventError) throw eventError;

      // 3. บันทึก Log การเงินไปยัง Axiom (แทนตาราง wallet_transactions)
      logEvent('create_event', {
        user_id: user.id,
        user_name: user.full_name,
        event_id: newEvent?.id,
        event_title: newTitle,
        cost: 100,
        balance_before: user.wallet_balance,
        balance_after: user.wallet_balance - 100
      });

      setIsCreating(false);
      setNewTitle('');
      setStartTime('');
      fetchInitialData();
    } catch (err) { setError(err.message); }
  };

  const handleJoinEvent = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data: eventData, error: findError } = await supabase
        .from('events')
        .select('id, owner_id')
        .eq('join_code', joinCodeInput.toUpperCase())
        .single();
      
      if (findError || !eventData) {
        alert('ไม่พบอีเวนต์จากรหัสนี้');
        return;
      }

      if (eventData.owner_id === user.id) {
        router.push(`/dashboard/event/${eventData.id}`);
        return;
      }

      const { data: existing } = await supabase
        .from('event_members')
        .select('id')
        .eq('event_id', eventData.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        const { error: joinError } = await supabase
          .from('event_members')
          .insert({ 
            event_id: eventData.id, 
            user_id: user.id, 
            role: 'contributor' 
          });
        
        if (joinError) throw joinError;
      }

      setIsJoining(false);
      setJoinCodeInput('');
      router.push(`/dashboard/event/${eventData.id}`);
      
    } catch (err) { 
      console.error("Join Error:", err.message);
      alert('เกิดข้อผิดพลาดในการเข้าร่วม: ' + err.message); 
    }
  };

  const getEventStatus = (startTimeStr, storageDays) => {
    if (!startTimeStr) return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-50', bg: 'bg-amber-50' };
    const now = new Date();
    const start = new Date(startTimeStr);
    const expiry = new Date(start.getTime() + (storageDays * 24 * 60 * 60 * 1000));
    if (now < start) return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-500', bg: 'bg-amber-50' };
    if (now <= expiry) return { label: 'Active', color: 'text-green-500', dot: 'bg-green-500 animate-pulse', bg: 'bg-green-50' };
    return { label: 'สิ้นสุด', color: 'text-red-500', dot: 'bg-red-500', bg: 'bg-red-50' };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#09090b]">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-black dark:text-white font-sans">
      <Header balance={user?.wallet_balance} user={user} />
      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 pt-8">
          <button onClick={() => setIsCreating(true)} className="group flex flex-col items-center justify-center p-10 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-xl">
            <div className="w-14 h-14 bg-white/10 dark:bg-black/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Plus size={28} /></div>
            <span className="font-medium text-lg tracking-tight">Create Event</span>
            <span className="text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">100 THB / Job</span>
          </button>
          <Link href="/dashboard/garage" className="group flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors mb-4 group-hover:scale-110 transition-transform"><Camera size={28} /></div>
            <span className="font-medium text-lg tracking-tight">My Garage</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Manage Equipment</span>
          </Link>
          <button onClick={() => setIsJoining(true)} className="group flex flex-col items-center justify-center p-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] hover:scale-[1.02] transition-all shadow-sm hover:shadow-md">
            <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-purple-500 transition-colors mb-4 group-hover:scale-110 transition-transform"><Users size={28} /></div>
            <span className="font-medium text-lg tracking-tight">Join Event</span>
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Contributor Mode</span>
          </button>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-medium tracking-tight">Projects Timeline</h2>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {events.map((event) => {
                const status = getEventStatus(event.start_time, event.storage_days || 2);
                const isOwner = event.userRole === 'owner';
                return (
                  <Link key={event.id} href={`/dashboard/event/${event.id}`} className="group">
                    <div className={`p-6 md:p-8 bg-white dark:bg-zinc-900 border ${isOwner ? 'border-zinc-200 dark:border-zinc-800' : 'border-dashed border-zinc-300 dark:border-zinc-700'} rounded-[2.5rem] flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-xl transition-all duration-300 gap-6`}>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-2xl md:text-3xl tracking-tight group-hover:text-blue-600 transition-colors leading-none">{event.title}</h3>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${isOwner ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20'}`}>
                            {isOwner ? <Crown size={10} fill="currentColor" /> : <UserCheck size={10} />}
                            {isOwner ? 'Owner' : 'Joiner'}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                            <Zap size={12} className="text-blue-500" fill="currentColor" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{event.join_code}</span>
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800 ${status.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} /><span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs ml-2">
                            <Calendar size={14} />
                            <span>{formatThaiDate(event.start_time)}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-8 py-4 ${isOwner ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black' : 'bg-blue-600 text-white'} text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg active:scale-95 transition-all`}>
                        {isOwner ? 'Manage Job' : 'View Job'}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 font-medium">No projects found.</div>
          )}
        </section>
      </main>

      {/* Modals */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[3rem] p-10 md:p-12 shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-medium mb-2 tracking-tight">New Event</h2>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800 mb-6">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">ค่าบริการ ฿100 ต่ออีเวนต์</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl p-6 text-left space-y-3 mb-8">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Package Inclusions:</p>
                <div className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 size={16} className="text-green-500" /><span>ใช้งานกล้องได้ 1 ตัว (1 Slot)</span></div>
                <div className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 size={16} className="text-green-500" /><span>พื้นที่เก็บรูปภาพ 2 วัน (Storage)</span></div>
              </div>
            </div>
            <form onSubmit={handleCreateEvent} className="text-left space-y-6">
              <div><label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Event Title</label><input autoFocus required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-5 focus:ring-1 ring-blue-500 transition-all font-medium text-lg shadow-inner outline-none" placeholder="เช่น Wedding Party @Siam" /></div>
              <div><label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Start Date & Time</label><input required type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-2xl p-5 focus:ring-1 ring-blue-500 transition-all font-medium shadow-inner outline-none" /></div>
              {error && <p className="text-red-500 text-[10px] font-bold bg-red-50 dark:bg-red-900/20 p-3 rounded-xl uppercase tracking-widest text-center">⚠️ {error}</p>}
              <div className="flex flex-col items-center gap-6 pt-6">
                <button type="submit" className="w-full py-5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-semibold rounded-3xl shadow-xl uppercase text-[10px] tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all">Create Event (฿100)</button>
                <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold uppercase text-[10px] tracking-[0.3em] transition-colors">Cancel & Close</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}