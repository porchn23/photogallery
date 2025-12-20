'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { Camera, Plus, Zap, Users, ShieldAlert, Image as ImageIcon } from 'lucide-react';

export default function EventManagement() {
  const { id: eventId } = useParams();
  const router = useRouter();

  // --- States ---
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [activeCameras, setActiveCameras] = useState([]);
  const [myGarage, setMyGarage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  useEffect(() => {
    fetchData();
    
    // ตั้งค่า Real-time Subscription
    // หมายเหตุ: ถ้า eventId เป็นรหัส 6 หลัก เราต้องรอให้ได้ UUID ก่อนถึงจะ Sub ถูกต้อง
    // แต่เพื่อความง่าย เราจะ fetchData ใหม่เสมอเมื่อมีการเปลี่ยนแปลงในตาราง
    const channel = supabase.channel(`event-mgmt-global`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_cameras' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [eventId]);

  async function fetchData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      let targetId = authUser?.id;

      // Bypass สำหรับทดสอบถ้าไม่มี Auth
      if (!targetId) {
        const { data: firstUser } = await supabase.from('users').select('id').limit(1).single();
        targetId = firstUser?.id;
      }

      if (targetId) {
        // 1. หา UUID จริงของ Event (กรณี eventId ใน URL เป็น Join Code)
        let realId = eventId;
        if (eventId.length < 30) {
          const { data: eventByCode } = await supabase
            .from('events')
            .select('id')
            .eq('join_code', eventId)
            .single();
          
          if (eventByCode) {
            realId = eventByCode.id;
          } else {
            alert('ไม่พบอีเวนต์จากรหัสที่ระบุ');
            setLoading(false);
            return;
          }
        }

        // 2. ดึงข้อมูลทั้งหมดโดยใช้ UUID (realId)
        const [eventRes, userRes, garageRes, activeCamsRes] = await Promise.all([
          supabase.from('events').select('*').eq('id', realId).single(),
          supabase.from('users').select('*').eq('id', targetId).single(),
          supabase.from('cameras').select('*').eq('owner_id', targetId),
          supabase.from('event_cameras').select('*, cameras(*)').eq('event_id', realId)
        ]);

        setEvent(eventRes.data);
        setUser(userRes.data);
        setMyGarage(garageRes.data || []);
        setActiveCameras(activeCamsRes.data || []);
      }
    } catch (err) {
      console.error('Fetch Data Error:', err);
    } finally {
      setLoading(false);
    }
  }

  // --- Logic: เพิ่ม Slot (50 บาท) ---
  const handleAddSlot = async () => {
    if (!user || user.wallet_balance < 50) return alert('เงินในกระเป๋าไม่เพียงพอ (ต้องการ 50 THB)');
    if (!confirm('ยืนยันเพิ่ม 1 Camera Slot (50 THB)?')) return;

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({ wallet_balance: user.wallet_balance - 50 })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const { error: eventError } = await supabase
        .from('events')
        .update({ max_cameras: (event.max_cameras || 1) + 1 })
        .eq('id', event.id);

      if (eventError) throw eventError;

      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: -50,
        type: 'add_slot',
        description: `เพิ่ม Slot ในงาน: ${event.title}`
      });

      fetchData();
      alert('เพิ่ม Slot สำเร็จ!');
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  // --- Logic: Check-in กล้องเข้า Slot ---
  const handleCheckIn = async (cameraId) => {
    if (!user?.id || !event?.id) {
      alert('ข้อมูลไม่พร้อมใช้งาน กรุณารีเฟรชหน้าจอ');
      return;
    }

    if (activeCameras.length >= (event.max_cameras || 1)) {
      alert('Slot เต็มแล้วครับ! กรุณาเพิ่ม Slot ก่อน');
      return;
    }

    try {
      const { error } = await supabase
        .from('event_cameras')
        .insert([
          {
            event_id: event.id,
            camera_id: cameraId,
            user_id: user.id,
            status: 'active'
          }
        ]);

      if (error) throw error;

      setIsCheckInOpen(false);
      fetchData();
    } catch (err) {
      alert('ไม่สามารถเพิ่มกล้องได้: ' + err.message);
    }
  };

// ... ภายใต้ฟังก์ชัน handleCheckIn (ประมาณบรรทัด 148)

const handleExtendStorage = async () => {
    if (!user || user.wallet_balance < 50) return alert('เงินไม่พอครับ (ต้องการ 50 THB)');
    if (!confirm('ยืนยันต่ออายุการเก็บรูปภาพเพิ่ม 1 วัน (50 THB)?')) return;

    try {
      // 1. หักเงิน
      await supabase.from('users').update({ wallet_balance: user.wallet_balance - 50 }).eq('id', user.id);
      
      // 2. เพิ่มจำนวนวันในตาราง events
      await supabase.from('events').update({ storage_days: (event.storage_days || 3) + 1 }).eq('id', event.id);
      
      // 3. บันทึกธุรกรรม
      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: -50,
        type: 'extend_storage',
        description: `ต่ออายุรูปภาพงาน: ${event.title}`
      });

      fetchData();
      alert('ต่ออายุสำเร็จ!');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };  

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-zinc-200 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading Command Center...</p>
      </div>
    </div>
  );

// ... existing code (imports, states, functions) ...

return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-100">
      <Header balance={user?.wallet_balance} />
      
      {/* Background Decorations - เพิ่มลูกเล่นให้พื้นหลังดูน่าสนใจ */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-50/50 dark:bg-blue-900/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -left-[10%] w-[30%] h-[30%] bg-purple-50/30 dark:bg-purple-900/5 blur-[100px] rounded-full" />
      </div>

      <main className="relative max-w-5xl mx-auto p-6 md:p-12 lg:p-16">
        {/* --- Section 1: Event Header --- */}


{/* ส่วน Banner อีเวนต์ (ปรับเอา Wallet ออก) */}
<section className="mb-12">
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-[0.2em]">
          <Zap size={14} fill="currentColor" />
          Live Control Center
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">{event?.title}</h1>
        {/* ... Join Code เดิม ... */}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button 
          onClick={() => window.open(`/event/${event?.id}`, '_blank')}
          className="px-8 py-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-black rounded-2xl hover:scale-105 transition-all flex items-center gap-3 shadow-xl"
        >
          View Public Gallery <Zap size={18} />
        </button>
      </div>
    </div>
  </section>

        {/* --- Section 2: Musical Chairs Control --- */}
        <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/50 pb-8 mb-8">
            <div className="flex items-center gap-4">
              {/* แก้ไข: ลบ shadow-lg shadow-blue-200 ออก */}
              <div className="w-14 h-14 bg-blue-600 rounded-[1.2rem] flex items-center justify-center text-white">
                <Camera size={28} strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">Camera Slots</h2>
                <p className="text-sm text-zinc-500 font-medium">จัดการจำนวนกล้องที่สามารถส่งรูปเข้างานพร้อมกันได้</p>
              </div>
            </div>
            
            {/* ปุ่มซื้อ Slot ใหม่: ปรับดีไซน์ให้ชัดเจนว่าเป็น "ซื้อเพิ่ม" */}
            <button 
              onClick={handleAddSlot}
              className="group flex items-center gap-4 px-6 py-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-100 dark:border-blue-800 rounded-[1.5rem] hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 shadow-sm"
            >
              <div className="flex flex-col items-start">
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 group-hover:text-white uppercase tracking-widest leading-none mb-1">Add More Capacity</span>
                <span className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-white">ซื้อที่วางกล้องเพิ่ม (+1 Slot)</span>
              </div>
              <div className="bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-xl text-blue-600 dark:text-blue-400 font-black group-hover:bg-white group-hover:text-blue-600 shadow-sm transition-colors border border-blue-100 dark:border-zinc-700">
                ฿50
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Active Devices */}
            {activeCameras.map((ac) => (
              <div key={ac.id} className="group relative bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-blue-200 dark:hover:border-blue-900/30 transition-all duration-500 overflow-hidden">
                {/* Status Indicator */}
                <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-900/20 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-green-700 dark:text-green-400 uppercase tracking-tighter">Live</span>
                </div>

                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-[1.5rem] flex items-center justify-center text-zinc-400 group-hover:text-blue-600 transition-colors mb-6">
                  <Camera size={32} strokeWidth={1.2} />
                </div>

                <h3 className="text-lg font-bold mb-1 truncate pr-10">{ac.cameras?.nickname || 'Unknown Device'}</h3>
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
                  {ac.cameras?.brand} {ac.cameras?.model}
                </p>

                <div className="mt-8 pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                  <button 
                    onClick={async () => {
                      if (confirm(`คุณต้องการเตะกล้อง "${ac.cameras?.nickname}" ออกจากงานนี้ใช่หรือไม่?`)) {
                        await supabase.from('event_cameras').delete().eq('id', ac.id);
                        fetchData();
                      }
                    }}
                    className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                  >
                    Disconnect Device
                  </button>
                </div>
              </div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, (event?.max_cameras || 0) - activeCameras.length) }).map((_, i) => (
              <button 
                key={`empty-${i}`}
                onClick={() => setIsCheckInOpen(true)}
                className="group h-[280px] bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-zinc-400 hover:border-blue-400 hover:text-blue-600 hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300 shadow-sm"
              >
                <div className="w-14 h-14 rounded-full border-2 border-current flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={24} strokeWidth={3} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em]">Add Camera</p>
                  <p className="text-[10px] font-medium opacity-60 mt-1">Slot Available</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* --- Section 3: Event Info / Quick Settings --- */}
{/* --- Section 3: Event Info / Quick Settings --- */}
<section className="mt-20 p-8 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[2.5rem] border border-zinc-200/50 dark:border-zinc-800/50">
  <div className="flex flex-col md:flex-row items-center gap-8 justify-between">
    <div className="space-y-3 text-center md:text-left">
      <h3 className="font-black text-xl tracking-tight">Storage Management</h3>
      <p className="text-sm text-zinc-500 max-w-sm font-medium leading-relaxed">
        ระบบจะลบรูปภาพอัตโนมัติเมื่อครบกำหนด หากต้องการเก็บรูปไว้นานขึ้น คุณสามารถซื้อวันเพิ่มได้
      </p>
      
      {/* แสดงวันที่หมดอายุจริง (คำนวณจาก Created At + Storage Days) */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 shadow-sm">
        <span className="text-[10px] font-bold text-zinc-400 uppercase">Expires on:</span>
        <span className="text-xs font-black text-red-500">
          {event?.created_at && new Date(new Date(event.created_at).getTime() + (event.storage_days * 24 * 60 * 60 * 1000)).toLocaleDateString('th-TH', { 
            day: 'numeric', month: 'long', year: 'numeric' 
          })}
        </span>
      </div>
    </div>

    <div className="flex flex-col items-center md:items-end gap-4">
      <div className="text-center md:text-right">
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Current Storage</p>
        <p className="font-black text-2xl text-blue-600 dark:text-blue-400">{event?.storage_days} Days</p>
      </div>
      
      <button 
        onClick={handleExtendStorage}
        className="px-6 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm flex items-center gap-2"
      >
        <Plus size={14} strokeWidth={3} />
        Extend 1 Day (฿50)
      </button>
    </div>
  </div>
</section>


        {/* Select Camera Modal - ปรับปรุงให้สวยขึ้น */}
        {isCheckInOpen && (
          <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-xl rounded-[3rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-start mb-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black tracking-tight">Connect Device</h2>
                  <p className="text-zinc-500 text-sm font-medium leading-relaxed">เลือกกล้องจากคลังอุปกรณ์ของคุณที่ต้องการเชื่อมต่อกับอีเวนต์นี้</p>
                </div>
                <button 
                  onClick={() => setIsCheckInOpen(false)}
                  className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-400 hover:text-black dark:hover:text-white transition-all"
                >
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto mb-10 pr-2 scrollbar-hide">
                {myGarage.length > 0 ? myGarage.map(cam => {
                  const isBusy = activeCameras.some(ac => ac.camera_id === cam.id);
                  return (
                    <button 
                      key={cam.id}
                      disabled={isBusy}
                      onClick={() => handleCheckIn(cam.id)}
                      className={`group flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${isBusy ? 'opacity-40 grayscale cursor-not-allowed border-transparent bg-zinc-50/50 dark:bg-zinc-800/30' : 'bg-zinc-50 dark:bg-zinc-800 border-transparent hover:border-blue-500 hover:bg-white dark:hover:bg-zinc-800 active:scale-[0.98]'}`}
                    >
                      <div className="flex items-center gap-5 text-left">
                        <div className="w-14 h-14 bg-white dark:bg-zinc-700 rounded-2xl flex items-center justify-center shadow-sm text-zinc-400 group-hover:text-blue-600 transition-colors">
                          <Camera size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-black text-lg tracking-tight">{cam.nickname}</p>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.1em] mt-0.5">{cam.brand} {cam.model}</p>
                        </div>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isBusy ? 'bg-zinc-200 text-zinc-500' : 'bg-blue-100 text-blue-600'}`}>
                        {isBusy ? 'In Use' : 'Connect'}
                      </div>
                    </button>
                  );
                }) : (
                  <div className="text-center py-16 bg-zinc-50 dark:bg-zinc-800/50 rounded-[2.5rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-500 font-bold mb-4">No cameras found in your garage.</p>
                    <button onClick={() => router.push('/dashboard/garage')} className="text-blue-600 font-black text-xs uppercase tracking-widest underline decoration-2 underline-offset-4">
                      Go to Garage →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
// ... remaining code ...

}