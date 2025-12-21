'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { 
  Camera, Plus, Zap, Users, ShieldAlert, Image as ImageIcon, 
  Calendar, Copy, Edit2, Loader2, X, UserCheck, Shield, Clock, Crown
} from 'lucide-react';
import { formatThaiDate, toLocalISOString } from '@/src/lib/utils';

export default function EventManagement() {
  const { id: eventId } = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [activeCameras, setActiveCameras] = useState([]);
  const [cameraHistory, setCameraHistory] = useState([]);
  const [eventMembers, setEventMembers] = useState([]);
  const [myGarage, setMyGarage] = useState([]);
  const [photoCount, setPhotoCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStartTime, setEditStartTime] = useState('');

  useEffect(() => {
    if (eventId) fetchData();
    const channel = supabase.channel(`event-mgmt-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_cameras' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_members' }, () => fetchData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, () => fetchData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [eventId]);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/login'); return; }

      let realId = eventId;
      if (eventId.length < 30) {
        const { data: evCode } = await supabase.from('events').select('id').eq('join_code', eventId).single();
        if (evCode) realId = evCode.id;
        else { alert('ไม่พบรหัสงานนี้'); router.push('/dashboard'); return; }
      }

      const [eventRes, membersRes, userRes, photoRes] = await Promise.all([
        supabase.from('events').select('*, users!events_owner_id_fkey(*)').eq('id', realId).single(),
        supabase.from('event_members').select('*, users(*)').eq('event_id', realId),
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('photos').select('id', { count: 'exact', head: true }).eq('event_id', realId)
      ]);

      if (!eventRes.data) {
        alert('ไม่พบข้อมูลงาน');
        router.push('/dashboard');
        return;
      }

      const eventData = eventRes.data;
      const membersData = membersRes.data || [];
      setPhotoCount(photoRes.count || 0);

      const ownerCheck = eventData.owner_id === authUser.id;
      const memberCheck = membersData.some(m => m.user_id === authUser.id);

      if (!ownerCheck && !memberCheck) {
        alert('คุณไม่มีสิทธิ์เข้าถึงงานนี้');
        router.push('/dashboard');
        return;
      }

      setIsOwner(ownerCheck);

      const [garageRes, activeCamsRes, historyCamsRes] = await Promise.all([
        supabase.from('cameras').select('*').eq('owner_id', authUser.id),
        supabase.from('event_cameras').select('*, cameras(*), users(*)').eq('event_id', realId).eq('status', 'active'),
        supabase.from('event_cameras').select('*, cameras(*), users(*)').eq('event_id', realId).neq('status', 'active').order('created_at', { ascending: false }).limit(4)
      ]);

      setEvent(eventData);
      setUser(userRes.data);
      setEventMembers(membersData);
      setMyGarage(garageRes.data || []);
      setActiveCameras(activeCamsRes.data || []);
      setCameraHistory(historyCamsRes.data || []);
      setEditTitle(eventData.title);
      setEditStartTime(toLocalISOString(eventData.start_time));

    } catch (err) { 
      console.error(err); 
      router.push('/dashboard'); 
    } finally { 
      setLoading(false); 
    }
  }

  const getEventDates = () => {
    if (!event?.created_at) return { start: null, expiry: null, isExpired: false, daysRemaining: 0 };
    const createdAt = new Date(event.created_at);
    const expiry = new Date(createdAt.getTime() + ((event.storage_days || 2) * 24 * 60 * 60 * 1000));
    const now = new Date();
    const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return { start: new Date(event.start_time), expiry, isExpired: now > expiry, daysRemaining };
  };

  const { expiry, isExpired, daysRemaining } = getEventDates();

  const getEventStatus = (startTimeStr) => {
    if (!startTimeStr) return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' };
    const now = new Date();
    const start = new Date(startTimeStr);
    if (isExpired) return { label: 'สิ้นสุด/หมดอายุ', color: 'text-red-500', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/10' };
    if (now < start) return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' };
    return { label: 'Active', color: 'text-green-500', dot: 'bg-green-500 animate-pulse', bg: 'bg-green-50 dark:bg-green-900/10' };
  };

  const status = getEventStatus(event?.start_time);

  // --- Actions (Musical Chairs Logic) ---
// ... ส่วนของ Code เดิม ...

const handleCheckIn = async (camId) => {
    if (isExpired) return alert('งานหมดอายุแล้ว');
    try {
      // 🛑 1. Musical Chairs: เตะกล้องตัวนี้ออกจากทุกงานที่มันกำลัง Active อยู่ (เพื่อให้ไปเริ่มงานใหม่ได้)
      await supabase
        .from('event_cameras')
        .update({ status: 'inactive', last_seen: new Date().toISOString() })
        .eq('camera_id', camId)
        .eq('status', 'active');

      // 🛑 2. Upsert: ถ้ากล้องเคยอยู่ในงานนี้แล้วให้เปลี่ยน status เป็น active 
      // ถ้ายังไม่เคยอยู่ให้เพิ่มเข้าไปใหม่ (แก้ไขปัญหา Unique Constraint)
      const { error } = await supabase
        .from('event_cameras')
        .upsert({ 
          event_id: event.id, 
          camera_id: camId, 
          user_id: user.id, 
          status: 'active',
          last_seen: new Date().toISOString()
        }, { 
          onConflict: 'event_id, camera_id' // ระบุชื่อคอลัมน์ที่เป็น Unique ร่วมกัน
        });

      if (error) throw error;

      setIsCheckInOpen(false);
      fetchData();
    } catch (err) { 
      console.error("Check-in Error:", err.message);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกล้อง: ' + err.message); 
    }
  };

// ... ส่วนของ Code เดิม ...


  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const startTimeISO = editStartTime ? new Date(editStartTime).toISOString() : null;
      await supabase.from('events').update({ title: editTitle, start_time: startTimeISO }).eq('id', event.id);
      setIsEditing(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleAddSlot = async () => {
    if (!isOwner) return;
    if (isExpired) return alert('งานหมดอายุแล้ว');
    if (!user || user.wallet_balance < 50) return alert('เงินไม่พอ');
    if (!confirm('ซื้อ Slot เพิ่ม (50 THB)?')) return;
    try {
      await supabase.from('users').update({ wallet_balance: user.wallet_balance - 50 }).eq('id', user.id);
      await supabase.from('events').update({ max_cameras: (event.max_cameras || 1) + 1 }).eq('id', event.id);
      await supabase.from('wallet_transactions').insert({ user_id: user.id, amount: -50, type: 'add_slot', description: `เพิ่ม Slot: ${event.title}` });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleDisconnect = async (ac) => {
    if (!isOwner && ac.user_id !== user.id) return alert('คุณไม่มีสิทธิ์นำกล้องคนอื่นออก');
    if (isExpired) return alert('งานหมดอายุแล้ว');
    if (confirm(`ยืนยันการนำกล้องออก?`)) {
      await supabase.from('event_cameras').update({ status: 'inactive', last_seen: new Date().toISOString() }).eq('id', ac.id);
      fetchData();
    }
  };

  const handleExtendStorage = async () => {
    if (!isOwner) return;
    if (!user || user.wallet_balance < 50) return alert('เงินไม่พอ');
    if (!confirm('ต่ออายุเพิ่ม 1 วัน (50 THB)?')) return;
    try {
      await supabase.from('users').update({ wallet_balance: user.wallet_balance - 50 }).eq('id', user.id);
      await supabase.from('events').update({ storage_days: (event.storage_days || 2) + 1 }).eq('id', event.id);
      await supabase.from('wallet_transactions').insert({ user_id: user.id, amount: -50, type: 'extend_storage', description: `ต่ออายุงาน: ${event.title}` });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-400 text-xs animate-pulse"><Loader2 className="animate-spin mr-2" /> Loading Command Center...</div>;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans pb-24">
      <Header balance={user?.wallet_balance} user={user} />
      <main className="max-w-7xl mx-auto px-6 pt-12 space-y-10">
        <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800 ${status.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${status.color}`}>{status.label}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  <ImageIcon size={10} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{photoCount.toLocaleString()} Photos</span>
                </div>
                {isOwner && new Date() < new Date(event?.start_time) && !isExpired && (
                  <button onClick={() => setIsEditing(true)} className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"><Edit2 size={16} /></button>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-medium tracking-tight">{event?.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-zinc-500">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">Join Code</span>
                  <span className="text-xl font-medium tracking-widest text-blue-600 dark:text-blue-400">{event?.join_code}</span>
                  <button onClick={() => { navigator.clipboard.writeText(event?.join_code); alert('คัดลอกรหัสแล้ว'); }} className="p-1.5 hover:text-blue-500 transition-colors"><Copy size={14} /></button>
                </div>
                <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-zinc-400" />
                  <span>{formatThaiDate(event?.start_time)}</span>
                </div>
              </div>
            </div>
            <button onClick={() => window.open(`/event/${event?.id}`, '_blank')} className="px-10 py-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-medium rounded-2xl shadow-xl flex items-center justify-center gap-3">
              <Zap size={18} fill="currentColor" /> <span className="uppercase tracking-[0.2em] text-[11px]">Public Gallery</span>
            </button>
          </div>
          <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-4"><Users size={14} className="text-zinc-400" /><span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Project Team ({eventMembers.length + 1})</span></div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-full border border-amber-100 dark:border-amber-900/30">
                <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 flex items-center justify-center text-[10px] overflow-hidden">{event?.users?.avatar_url ? <img src={event.users.avatar_url} /> : <Shield size={12} className="text-amber-600" />}</div>
                <div className="flex flex-col"><span className="text-xs font-bold text-amber-700 dark:text-amber-400 leading-none">{event?.users?.full_name?.split(' ')[0]}</span><span className="text-[8px] font-black uppercase tracking-tighter text-amber-600/60 leading-none mt-0.5">Owner</span></div><Crown size={10} className="text-amber-500 ml-1" fill="currentColor" />
              </div>
              {eventMembers.map(m => (
                <div key={m.id} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-100 dark:border-zinc-700/50">
                  <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] overflow-hidden">{m.users?.avatar_url ? <img src={m.users.avatar_url} /> : <UserCheck size={12} className="text-zinc-400" />}</div>
                  <div className="flex flex-col"><span className="text-xs font-medium text-zinc-600 dark:text-zinc-300 leading-none">{m.users?.full_name?.split(' ')[0]}</span><span className="text-[8px] font-black uppercase tracking-tighter text-zinc-400 leading-none mt-0.5">Joiner</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2"><h2 className="text-lg font-medium tracking-tight flex items-center gap-2"><Camera size={20} className="text-blue-500" /> Camera Slots</h2><span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{activeCameras.length} / {event?.max_cameras} In Use</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeCameras.map(ac => (
              <div key={ac.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-6"><div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors"><Camera size={20} /></div><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /></div>
                <div className="space-y-1 mb-6"><h3 className="text-base font-medium truncate leading-tight">{ac.cameras?.nickname}</h3><p className="text-[10px] text-zinc-400 uppercase tracking-wider">{ac.cameras?.brand} {ac.cameras?.model}</p></div>
                <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400">{ac.users?.avatar_url ? <img src={ac.users.avatar_url} className="rounded-full" /> : ac.users?.full_name?.charAt(0)}</div><span className="text-[9px] text-zinc-400 uppercase">{ac.users?.full_name?.split(' ')[0]}</span></div>
                  {(isOwner || ac.user_id === user.id) && (<button disabled={isExpired} onClick={() => handleDisconnect(ac)} className="text-[10px] font-medium text-zinc-400 hover:text-red-500 transition-colors">Exit</button>)}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, (event?.max_cameras || 0) - activeCameras.length) }).map((_, i) => (
              <button key={`empty-${i}`} disabled={isExpired} onClick={() => setIsCheckInOpen(true)} className={`min-h-[140px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${isExpired ? 'opacity-10' : 'bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800 hover:bg-white hover:border-blue-400'}`}><div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400"><Plus size={16} /></div><span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">Connect Slot</span></button>
            ))}
            {isOwner && (
              <button onClick={handleAddSlot} disabled={isExpired} className={`min-h-[140px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${isExpired ? 'opacity-10' : 'bg-blue-50/20 dark:bg-blue-900/5 border-blue-100 dark:border-blue-500/20 hover:bg-white hover:border-blue-500'}`}><div className="w-8 h-8 rounded-full border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-500"><Plus size={16} /></div><div className="text-center"><span className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-600 block">Buy Slot</span><span className="text-[11px] font-medium text-blue-400">฿50</span></div></button>
            )}
          </div>
        </section>
        <section className="bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3"><div className="p-2.5 bg-blue-500/20 rounded-2xl"><ImageIcon size={20} className="text-blue-400" /></div><h2 className="text-2xl font-medium uppercase tracking-widest">Storage Control</h2></div>
              <div className="space-y-4">
                <div className="flex justify-between items-end"><p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-none">Days remaining</p><span className={`text-5xl font-medium tracking-tighter ${daysRemaining <= 1 ? 'text-red-500' : 'text-white'}`}>{daysRemaining}</span></div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${daysRemaining <= 1 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (daysRemaining / (event?.storage_days || 2)) * 100)}%` }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4"><div><p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mb-1">Created</p><p className="text-sm font-medium">{event?.created_at && new Date(event.created_at).toLocaleDateString('th-TH')}</p></div><div className="text-right"><p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mb-1">Expires</p><p className={`text-sm font-medium ${isExpired ? 'text-red-500' : 'text-white'}`}>{expiry?.toLocaleDateString('th-TH')}</p></div></div>
            </div>
            <div className="flex flex-col gap-4">
              {isOwner ? (
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm text-center">
                  <p className="text-xs text-zinc-400 mb-4 font-medium italic text-center">ขยายเวลาจัดเก็บรูปภาพ ฿50 ต่อ 1 วัน</p>
                  <button onClick={handleExtendStorage} className="w-full py-5 bg-white text-black font-semibold rounded-2xl text-[11px] uppercase tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5">Extend Storage</button>
                </div>
              ) : (
                <div className="bg-white/5 border border-white/5 p-8 rounded-3xl backdrop-blur-sm text-center"><Shield size={40} className="mx-auto text-zinc-700 mb-4" /><p className="text-sm text-zinc-400 font-medium">สมาชิกทีม (Joiner)</p><p className="text-[10px] text-zinc-600 uppercase tracking-widest">View Only Mode</p></div>
              )}
            </div>
          </div>
          <ShieldAlert size={300} className="absolute -right-32 -bottom-32 text-white/5 rotate-12 pointer-events-none" />
        </section>
      </main>
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl">
            <div className="flex justify-between items-center mb-10"><h2 className="text-2xl font-medium uppercase tracking-widest">Edit Job</h2><button onClick={() => setIsEditing(false)} className="p-2 text-zinc-400 hover:text-red-500"><X size={20}/></button></div>
            <form onSubmit={handleUpdateEvent} className="space-y-8">
              <div className="space-y-2"><label className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">Title</label><input required value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl p-6 font-medium text-xl shadow-inner outline-none focus:ring-1 ring-blue-500 transition-all" /></div>
              <div className="space-y-2"><label className="text-[10px] font-medium uppercase tracking-widest text-zinc-400">Start Time</label><input type="datetime-local" required value={editStartTime} onChange={e => setEditStartTime(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-2xl p-6 font-medium text-lg shadow-inner outline-none focus:ring-1 ring-blue-500 transition-all" /></div>
              <button type="submit" className="w-full py-6 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-semibold rounded-2xl uppercase text-[10px] tracking-[0.3em] transition-all">Save Changes</button>
            </form>
          </div>
        </div>
      )}
      {isCheckInOpen && (
        <div className="fixed inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-3xl z-[100] flex items-center justify-center p-6 text-zinc-900 dark:text-white">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl border border-zinc-100 dark:border-zinc-800">
            <div className="flex justify-between items-start mb-12"><div className="space-y-2"><h2 className="text-2xl font-medium tracking-tight uppercase tracking-widest">Connect Device</h2><p className="text-zinc-500 text-sm font-medium tracking-tight">Select a camera from your garage</p></div><button onClick={() => setIsCheckInOpen(false)} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400 hover:text-red-500 transition-all"><X size={20}/></button></div>
            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {myGarage.length > 0 ? myGarage.map(cam => {
                const isBusy = activeCameras.some(ac => ac.camera_id === cam.id);
                return (<button key={cam.id} disabled={isBusy} onClick={() => handleCheckIn(cam.id)} className={`flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all ${isBusy ? 'opacity-30 grayscale cursor-not-allowed border-transparent bg-zinc-50/50' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent hover:border-blue-500 hover:bg-white active:scale-[0.98]'}`}><div className="flex items-center gap-6 text-left"><div className="w-14 h-14 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-300 border border-zinc-100 dark:border-zinc-700"><Camera size={24} /></div><div><p className="font-medium text-xl leading-none mb-1">{cam.nickname}</p><p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-widest">{cam.brand} {cam.model}</p></div></div><div className={`px-6 py-2 rounded-xl text-[10px] font-semibold uppercase tracking-widest ${isBusy ? 'bg-zinc-200 text-zinc-500' : 'bg-blue-100 text-blue-600'}`}>{isBusy ? 'In Use' : 'Connect'}</div></button>);
              }) : (<div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800"><p className="text-zinc-500 font-medium italic">ไม่พบกล้องใน Garage ของคุณ</p><button onClick={() => router.push('/dashboard/garage')} className="mt-4 text-blue-600 font-bold uppercase text-[10px] tracking-widest underline">ไปที่ My Garage</button></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}