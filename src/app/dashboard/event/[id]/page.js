'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { 
  Camera, Plus, Zap, Users, ShieldAlert, Image as ImageIcon, 
  Calendar, Copy, Edit2, Loader2, X, UserCheck, Shield, Clock, Crown,
  Upload, Sliders, CheckCircle2, LayoutGrid, MousePointer2, Settings2,
  Settings, Save, RefreshCw, Focus, Maximize2, Crosshair, Monitor,
  Power, Layers, Check, Circle, Sparkles, Wand2, User, Palette, Leaf
} from 'lucide-react';

import * as LucideIcons from 'lucide-react';
import { formatThaiDate, toLocalISOString } from '@/src/lib/utils';
import { logEvent } from '@/src/lib/axiom';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// S3 Client Config
const s3Client = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT,
  region: "sgp1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_DO_SPACES_KEY,
    secretAccessKey: process.env.NEXT_PUBLIC_DO_SPACES_SECRET
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const getModelIcon = (iconName) => {
  // ดึงจาก LucideIcons โดยใช้ชื่อ string
  return LucideIcons[iconName] || LucideIcons.Wand2;
};

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

  // --- Watermark States ---
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [watermarkSize, setWatermarkSize] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState('southeast');
  const [isUploading, setIsUploading] = useState(false);
  const [watermarkUrl, setWatermarkUrl] = useState(null);
  const [fees, setFees] = useState({}); // ✅ เพิ่ม state เก็บราคา
  
  // ✅ AI Models State
  const [aiModels, setAiModels] = useState([]);

  useEffect(() => {
    if (eventId) fetchData();
    const channel = supabase.channel(`event-mgmt-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_cameras' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_members' }, () => fetchData())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, () => fetchData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${eventId}` }, () => fetchData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [eventId]);

  useEffect(() => {
    if (event) {
      setWatermarkEnabled(event.watermark_enabled || false);
      setWatermarkOpacity(event.watermark_opacity ?? 0.5);
      setWatermarkSize(event.watermark_size ?? 300);
      setWatermarkPosition(event.watermark_position || 'southeast');
      
      if (event.watermark_version) {
        const bucket = process.env.NEXT_PUBLIC_DO_SPACES_BUCKET || 'face-grid-storage';
        const endpoint = (process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT || 'sgp1.digitaloceanspaces.com').replace('https://', '');
        const key = `face-grid-storage/${event.id}/watermark.png`;
        const publicUrl = `https://${bucket}.${endpoint}/${key}`;
        setWatermarkUrl(`${publicUrl}?v=${event.watermark_version}`); 
      } else {
        setWatermarkUrl(null);
      }
    }
  }, [event]);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.push('/login'); return; }
      
      // ✅ เพิ่ม: ดึงราคา Service Fees
      const { data: feesData } = await supabase.from('service_fees').select('service_key, price');
      const feesMap = {};
      feesData?.forEach(f => feesMap[f.service_key] = f.price);
      setFees(feesMap);

      let realId = eventId;
      if (eventId.length < 30) {
        const { data: evCode } = await supabase.from('events').select('id').eq('join_code', eventId).single();
        if (evCode) realId = evCode.id;
        else { alert('ไม่พบรหัสงานนี้'); router.push('/dashboard'); return; }
      }

      // ✅ Fetch AI Models เพิ่มเติม
      const [eventRes, membersRes, userRes, photoRes, aiModelsRes] = await Promise.all([
        supabase.from('events').select('*, users!events_owner_id_fkey(*)').eq('id', realId).single(),
        supabase.from('event_members').select('*, users(*)').eq('event_id', realId),
        supabase.from('users').select('*').eq('id', authUser.id).single(),
        supabase.from('photos').select('id', { count: 'exact', head: true }).eq('event_id', realId),
        supabase.from('ai_models').select('*').eq('is_active', true).order('price_per_photo', { ascending: true })
      ]);

      if (!eventRes.data) { router.push('/dashboard'); return; }
      const eventData = eventRes.data;
      const membersData = membersRes.data || [];
      setPhotoCount(photoRes.count || 0);

      const ownerCheck = eventData.owner_id === authUser.id;
      const memberCheck = membersData.some(m => m.user_id === authUser.id);
      if (!ownerCheck && !memberCheck) { router.push('/dashboard'); return; }

      setIsOwner(ownerCheck);
      const [garageRes, activeCamsRes, historyCamsRes] = await Promise.all([
        supabase.from('cameras').select('*').eq('owner_id', authUser.id),
        supabase.from('event_cameras').select('*, cameras(*), users(*)').eq('event_id', realId).eq('status', 'active'),
        supabase.from('event_cameras').select('*, cameras(*), users(*)').eq('event_id', realId).neq('status', 'active').order('created_at', { ascending: false }).limit(4)
      ]);

      setAiModels(aiModelsRes.data || []);
      setEvent(eventData);
      setUser(userRes.data);
      setEventMembers(membersData);
      setMyGarage(garageRes.data || []);
      setActiveCameras(activeCamsRes.data || []);
      setCameraHistory(historyCamsRes.data || []);
      setEditTitle(eventData.title);
      setEditStartTime(toLocalISOString(eventData.start_time));
    } catch (err) { router.push('/dashboard'); } finally { setLoading(false); }
  }

  // --- Handlers ---
  const handleWatermarkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'image/png') return alert('กรุณาอัปโหลดไฟล์ .png เท่านั้น');
    try {
      setIsUploading(true);
      const command = new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_DO_SPACES_BUCKET || 'face-grid-storage',
        Key: `face-grid-storage/${event.id}/watermark.png`, 
        Body: file,
        ContentType: 'image/png',
        ACL: 'public-read'
      });
      await s3Client.send(command);
      const newVersion = Math.floor(Date.now() / 1000);
      const { error: dbError } = await supabase.from('events').update({ 
        watermark_enabled: true,
        watermark_version: newVersion,
        watermark_opacity: watermarkOpacity,
        watermark_size: watermarkSize,
        watermark_position: watermarkPosition
      }).eq('id', event.id);
      if (dbError) throw dbError;
      alert('อัปโหลดลายน้ำสำเร็จ และเปิดใช้งานเรียบร้อย');
      fetchData();
    } catch (err) { console.error(err); alert('Upload Error: ' + err.message); } finally { setIsUploading(false); }
  };

  const handleSaveWatermarkSettings = async () => {
    try {
      const { error } = await supabase.from('events').update({ 
        watermark_enabled: watermarkEnabled, 
        watermark_opacity: watermarkOpacity,
        watermark_size: watermarkSize,
        watermark_position: watermarkPosition, 
        watermark_version: Math.floor(Date.now() / 1000)
      }).eq('id', event.id);
      if (error) throw error;
      alert('บันทึกการตั้งค่าลายน้ำเรียบร้อยแล้ว');
      fetchData();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleToggleAIBeauty = async (acId, currentStatus) => {
    if (!isOwner || isExpired) return;
    const newStatus = !currentStatus;
    setActiveCameras(prev => prev.map(ac => ac.id === acId ? { ...ac, ai_beauty_enabled: newStatus } : ac));
    try {
      const { error } = await supabase.from('event_cameras').update({ ai_beauty_enabled: newStatus }).eq('id', acId);
      if (error) throw error;
      logEvent('ai_beauty_toggle', {
        user_id: user.id, user_name: user.full_name, event_id: event.id, camera_id: acId,
        camera_name: activeCameras.find(ac => ac.id === acId)?.cameras?.nickname,
        status: newStatus ? 'enabled' : 'disabled', billing_rate: '1.2 THB/Photo'
      });
    } catch (err) { 
      setActiveCameras(prev => prev.map(ac => ac.id === acId ? { ...ac, ai_beauty_enabled: currentStatus } : ac));
      alert('AI Beauty Error: ' + err.message); 
    }
  };

  // ✅ ฟังก์ชันเลือก AI Model
  const handleSelectAIModel = async (eventCameraId, modelId) => {
    if (!isOwner || isExpired) return;
    setActiveCameras(prev => prev.map(ac => ac.id === eventCameraId ? { ...ac, ai_model_id: modelId } : ac));
    try {
      const { error } = await supabase.from('event_cameras').update({ ai_model_id: modelId }).eq('id', eventCameraId);
      if (error) throw error;
    } catch (err) {
      alert('Error updating AI Model: ' + err.message);
      fetchData(); 
    }
  };

  const handleAddSlot = async () => {
    const cost = fees.add_slot || '...'; 

    if (!isOwner || isExpired || !user || user.wallet_balance < cost) return alert('เงินไม่พอหรือตรวจสอบสิทธิ์');
    if (!confirm(`ซื้อ Slot เพิ่ม (${cost} THB)?`)) return; // ✅ Confirm ราคาจริง
    try {
      await supabase.from('users').update({ wallet_balance: user.wallet_balance - cost }).eq('id', user.id);
      await supabase.from('events').update({ max_cameras: (event.max_cameras || 1) + 1 }).eq('id', event.id);

      logEvent('add_camera_slot', {
        user_id: user.id, 
        user_name: user.full_name, 
        event_id: event.id, 
        cost: cost,
        balance_before: user.wallet_balance, 
        balance_after: user.wallet_balance - cost,
        new_total_slots: (event.max_cameras || 1) + 1
      });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleExtendStorage = async () => {
    const cost = fees.extend_storage || 50;

    if (!isOwner || !user || user.wallet_balance < cost) return alert('เงินไม่พอ');
    if (!confirm(`ต่ออายุเพิ่ม 1 วัน (${cost} THB)?`)) return; // ✅ Confirm ราคาจริง

    try {
      await supabase.from('users').update({ wallet_balance: user.wallet_balance - cost }).eq('id', user.id);
      await supabase.from('events').update({ storage_days: (event.storage_days || 2) + 1 }).eq('id', event.id);
      logEvent('extend_storage', {
        user_id: user.id, user_name: user.full_name, event_id: event.id, cost: cost,
        balance_before: user.wallet_balance, balance_after: user.wallet_balance - cost,
        new_total_days: (event.storage_days || 2) + 1
      });
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleCheckIn = async (camId) => {
    if (isExpired) return alert('งานหมดอายุแล้ว');
    try {
      await supabase.from('event_cameras').update({ status: 'inactive', last_seen: new Date().toISOString() }).eq('camera_id', camId).eq('status', 'active');
      const { error } = await supabase.from('event_cameras').upsert({ event_id: event.id, camera_id: camId, user_id: user.id, status: 'active', last_seen: new Date().toISOString() }, { onConflict: 'event_id, camera_id' });
      if (error) throw error;
      setIsCheckInOpen(false);
      fetchData();
    } catch (err) { alert('เกิดข้อผิดพลาดในการเชื่อมต่อกล้อง: ' + err.message); }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const startTimeISO = editStartTime ? new Date(editStartTime).toISOString() : null;
      await supabase.from('events').update({ title: editTitle, start_time: startTimeISO }).eq('id', event.id);
      setIsEditing(false);
      fetchData();
    } catch (err) { alert(err.message); }
  };

  const handleDisconnect = async (ac) => {
    if ((!isOwner && ac.user_id !== user.id) || isExpired) return alert('ไม่มีสิทธิ์หรือตรวจสอบสถานะงาน');
    if (confirm(`ยืนยันการนำกล้องออก?`)) {
      await supabase.from('event_cameras').update({ status: 'inactive', last_seen: new Date().toISOString() }).eq('id', ac.id);
      fetchData();
    }
  };

  const getPreviewPositionStyles = () => {
    if (isResizing) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const offset = '4%';
    switch(watermarkPosition) {
      case 'northwest': return { top: offset, left: offset };
      case 'northeast': return { top: offset, right: offset };
      case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      case 'southwest': return { bottom: offset, left: offset };
      case 'southeast': return { bottom: offset, right: offset };
      default: return { bottom: offset, right: offset };
    }
  };

  const getEventDates = () => {
    if (!event?.created_at) return { start: null, expiry: null, isExpired: false, daysRemaining: 0 };
    const createdAt = new Date(event.created_at);
    // ✅ คำนวณวันหมดอายุจาก start_time ถ้ามี
    const baseDate = event.start_time ? new Date(event.start_time) : createdAt;
    const expiry = new Date(baseDate.getTime() + ((event.storage_days || 2) * 24 * 60 * 60 * 1000));
    const now = new Date();
    const isExpired = now > expiry;
    const daysRemaining = isExpired ? 0 : Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return { start: event.start_time ? new Date(event.start_time) : null, expiry, isExpired, daysRemaining };
  };

  const { expiry, isExpired, daysRemaining } = getEventDates();
  const status = (() => {
    if (!event?.start_time) return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' };
    const now = new Date();
    const start = new Date(event.start_time);
    if (isExpired) return { label: 'สิ้นสุด/หมดอายุ', color: 'text-red-500', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/10' };
    if (now < start) return { label: 'ยังไม่เริ่ม', color: 'text-amber-500', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' };
    return { label: 'Active', color: 'text-green-500', dot: 'bg-green-500 animate-pulse', bg: 'bg-green-50 dark:bg-green-900/10' };
  })();

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
                <div className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-zinc-400" /><span>{formatThaiDate(event?.start_time)}</span></div>
              </div>
            </div>
            <button onClick={() => window.open(`/event/${event?.id}`, '_blank')} className="px-10 py-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-medium rounded-2xl shadow-xl flex items-center justify-center gap-3"><Zap size={18} fill="currentColor" /> <span className="uppercase tracking-[0.2em] text-[11px]">Public Gallery</span></button>
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
              <div key={ac.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-3xl shadow-sm flex flex-col justify-between group relative">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors"><Camera size={20} /></div>
                  <div className="flex items-center gap-3">
                    {isOwner && (
                      <button onClick={() => handleToggleAIBeauty(ac.id, ac.ai_beauty_enabled)} className={`group/ai relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all border ${ac.ai_beauty_enabled ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'}`} title={ac.ai_beauty_enabled ? "ปิด AI Beauty" : "เปิด AI Beauty"}>
                        <Sparkles size={12} fill={ac.ai_beauty_enabled ? "currentColor" : "none"} className={ac.ai_beauty_enabled ? 'animate-pulse' : ''} />
                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">{ac.ai_beauty_enabled ? 'AI ON' : 'AI OFF'}</span>
                      </button>
                    )}
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* ✅ ส่วนเลือก AI Model: Icon Only (Compact) */}
                {ac.ai_beauty_enabled && (
                    <div className="mb-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 animate-in slide-in-from-top-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mr-1">Style</span>
                        {aiModels.map((model) => {
                           const Icon = getModelIcon(model.icon_name); 
                           const isSelected = (ac.ai_model_id || 1) === model.id;
                           
                           return (
                             <button
                               key={model.id}
                               disabled={!isOwner}
                               onClick={() => handleSelectAIModel(ac.id, model.id)}
                               title={`${model.name} - ${model.description} (฿${model.price_per_photo})`} // ยังคงมี Tooltip ไว้ดูรายละเอียด
                               className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${
                                 isSelected 
                                   ? 'bg-blue-500 text-white shadow-blue-500/30 scale-110 ring-2 ring-blue-100 dark:ring-blue-900' 
                                   : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-600 hover:scale-105'
                               }`}
                             >
                               <Icon size={14} fill={isSelected ? "currentColor" : "none"} strokeWidth={2} />
                             </button>
                           );
                        })}
                      </div>
                    </div>
                )}

                <div className="space-y-1 mb-6">
                  <h3 className="text-base font-medium truncate leading-tight">{ac.cameras?.nickname}</h3>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-wider">{ac.cameras?.brand} {ac.cameras?.model}</p>

                  {/* ✅ ส่วนแสดงรายละเอียดและราคา (Dynamic ตาม Model ที่เลือก) */}
                  {ac.ai_beauty_enabled && (() => {
                      // หา Model ที่เลือก (ถ้าไม่มีใช้ตัวแรกเป็น Default)
                      const selectedModel = aiModels.find(m => m.id === (ac.ai_model_id || 1)) || aiModels[0];
                      
                      return (
                        <div className="mt-4 py-3 px-4 bg-pink-50 dark:bg-pink-900/10 rounded-2xl border border-pink-100 dark:border-pink-900/30 animate-in fade-in zoom-in duration-300">
                            {/* แสดง Description - ปรับ font ใหญ่ขึ้นเป็น text-[10px] หรือ text-xs */}
                            {selectedModel?.description && (
                                <p className="text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-300 mb-2 leading-relaxed font-medium">
                                    {selectedModel.description}
                                </p>
                            )}
                            
                            {/* แสดงราคา - ปรับ font ใหญ่ขึ้นและหนาขึ้น */}
                            <p className="text-[10px] sm:text-xs text-pink-600 dark:text-pink-400 font-bold flex items-center gap-2">
                                <Sparkles size={14} fill="currentColor" /> 
                                มีค่าใช้จ่าย {selectedModel?.price_per_photo || '1.2'} บาท/รูป
                            </p>
                        </div>
                      );
                    })()}

                </div>
                <div className="pt-4 border-t border-zinc-50 dark:border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-2"><div className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-400 overflow-hidden">{ac.users?.avatar_url ? <img src={ac.users.avatar_url} /> : ac.users?.full_name?.charAt(0)}</div><span className="text-[9px] text-zinc-400 uppercase">{ac.users?.full_name?.split(' ')[0]}</span></div>
                  {(isOwner || ac.user_id === user.id) && (<button disabled={isExpired} onClick={() => handleDisconnect(ac)} className="text-[10px] font-medium text-zinc-400 hover:text-red-500 transition-colors">Exit</button>)}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, (event?.max_cameras || 0) - activeCameras.length) }).map((_, i) => (
              <button key={`empty-${i}`} disabled={isExpired} onClick={() => setIsCheckInOpen(true)} className={`min-h-[140px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${isExpired ? 'opacity-10' : 'bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-200 dark:border-zinc-800 hover:bg-white hover:border-blue-400'}`}><div className="w-8 h-8 rounded-full border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-400"><Plus size={16} /></div><span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400">Connect Slot</span></button>
            ))}
            {isOwner && (<button onClick={handleAddSlot} disabled={isExpired} className={`min-h-[140px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 transition-all ${isExpired ? 'opacity-10' : 'bg-blue-50/20 dark:bg-blue-900/5 border-blue-100 dark:border-blue-500/20 hover:bg-white hover:border-blue-500'}`}><div className="w-8 h-8 rounded-full border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-500"><Plus size={16} /></div><div className="text-center"><span className="text-[10px] font-medium uppercase tracking-[0.2em] text-blue-600 block">Buy Slot</span><span className="text-[11px] font-medium text-blue-400">฿{fees.add_slot || '...'}</span></div></button>)}
          </div>
        </section>

        {isOwner && (
          <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm group/engine">
            <div className="px-6 py-5 border-b border-zinc-50 dark:border-zinc-800 flex items-center justify-between">
              <div><h2 className="text-sm font-bold tracking-tight">Watermark Settings</h2><p className="text-[10px] text-zinc-400 font-medium">จัดการลายน้ำสำหรับรูปภาพ RAW</p></div>
              <button onClick={() => setWatermarkEnabled(!watermarkEnabled)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border ${watermarkEnabled ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800 shadow-sm' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 border-zinc-100 dark:border-zinc-700'}`}><Power size={12} fill={watermarkEnabled ? "currentColor" : "none"} /><span className="text-[10px] font-black uppercase tracking-widest">{watermarkEnabled ? 'Active' : 'Disabled'}</span></button>
            </div>
            <div className="relative aspect-[16/9] md:aspect-[4/1] w-full bg-zinc-950 overflow-hidden flex items-center justify-center border-b border-zinc-100 dark:border-zinc-800">
              <div className="absolute inset-0 opacity-20">
              <img 
                  src="/Assets/Gemini_Generated_Image_c0crvc0crvc0crvc.png" 
                  className="w-full h-full object-cover grayscale brightness-50" 
                  alt="Preview BG"
                />
              </div>
              <div className="absolute inset-0 z-30">{[{ id: 'northwest', style: { top: '4%', left: '4%' } }, { id: 'northeast', style: { top: '4%', right: '4%' } }, { id: 'southwest', style: { bottom: '4%', left: '4%' } }, { id: 'southeast', style: { bottom: '4%', right: '4%' } }, { id: 'center', style: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' } }].map((pos) => (<button key={pos.id} onClick={() => setWatermarkPosition(pos.id)} style={pos.style} className={`absolute w-10 h-10 rounded-full border flex items-center justify-center transition-all ${watermarkPosition === pos.id ? 'bg-blue-600 border-blue-400 scale-110 shadow-lg' : 'bg-black/20 border-white/10 hover:border-white/40'}`}><Circle size={watermarkPosition === pos.id ? 8 : 4} fill="currentColor" className={watermarkPosition === pos.id ? 'text-white' : 'text-white/30'} /></button>))}</div>
              
              <div className="absolute inset-0 pointer-events-none z-20">
                <div className="absolute" style={{ ...getPreviewPositionStyles(), opacity: watermarkOpacity }}>
                  {watermarkUrl && event?.watermark_version ? (
                    <img 
                      src={watermarkUrl} 
                      alt="Watermark" 
                      className={`h-auto object-contain brightness-110 drop-shadow-2xl ${isResizing ? 'ring-2 ring-blue-500/50' : ''}`} 
                      style={{ 
                        width: `${watermarkSize}px`,
                        maxWidth: '200px' 
                      }} 
                    />
                  ) : null}
                </div>
              </div>
            </div>
            <div className="px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10 bg-white dark:bg-zinc-900/50">
              <div className="flex items-center gap-6"><label className="flex items-center gap-3 cursor-pointer group"><input type="file" accept="image/png" onChange={handleWatermarkUpload} className="hidden" /><div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-lg">{isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}</div><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white leading-none">Assets</span><span className="text-[8px] font-bold uppercase text-zinc-400 mt-1">.PNG Only</span></div></label></div>
              <div className="w-full md:flex-1 flex flex-col gap-2 md:max-w-[200px]"><div className="flex justify-between items-center px-1"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Real Size (Px)</span><span className="text-sm font-mono font-black text-blue-600 leading-none">{watermarkSize}px</span></div><div className="relative h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-50 dark:border-zinc-800 shadow-inner"><div className="absolute h-full bg-blue-600 rounded-full" style={{ width: `${((watermarkSize - 100) / 500) * 100}%` }} /><input type="range" min="100" max="600" step="1" value={watermarkSize} onChange={e => setWatermarkSize(parseInt(e.target.value))} onMouseDown={() => setIsResizing(true)} onMouseUp={() => setIsResizing(false)} onMouseLeave={() => setIsResizing(false)} onTouchStart={() => setIsResizing(true)} onTouchEnd={() => setIsResizing(false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" /></div></div>
              <div className="w-full md:flex-1 flex flex-col gap-2 md:max-w-[200px]"><div className="flex justify-between items-center px-1"><span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transparency</span><span className="text-sm font-mono font-black text-blue-600 leading-none">{Math.round(watermarkOpacity * 100)}%</span></div><div className="relative h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-50 dark:border-zinc-800 shadow-inner"><div className="absolute h-full bg-blue-600 rounded-full" style={{ width: `${watermarkOpacity * 100}%` }} /><input type="range" min="0" max="1" step="0.05" value={watermarkOpacity} onChange={e => setWatermarkOpacity(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" /></div></div>
              <button onClick={handleSaveWatermarkSettings} className="w-full md:w-auto px-8 py-4 md:py-3 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-zinc-200 dark:shadow-none"><Save size={14} /> Commit Changes</button>
            </div>
          </section>
        )}

        <section className="bg-zinc-950 dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3"><div className="p-2.5 bg-blue-500/20 rounded-2xl"><ImageIcon size={20} className="text-blue-400" /></div><h2 className="text-2xl font-medium uppercase tracking-widest">Storage Control</h2></div>
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest leading-none">Days remaining</p>
                  <div className={`flex items-baseline gap-2 ${daysRemaining <= 1 ? 'text-red-500' : 'text-white'}`}><span className="text-5xl font-medium tracking-tighter">{daysRemaining}</span><span className="text-xl font-medium">วัน</span></div>
                </div>                
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${daysRemaining <= 1 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (daysRemaining / (event?.storage_days || 2)) * 100)}%` }} /></div>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4"><div><p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mb-1">Created</p><p className="text-sm font-medium">{event?.created_at && new Date(event.created_at).toLocaleDateString('th-TH')}</p></div><div className="text-right"><p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest mb-1">Expires</p><p className={`text-sm font-medium ${isExpired ? 'text-red-500' : 'text-white'}`}>{expiry?.toLocaleDateString('th-TH')}</p></div></div>
            </div>
            <div className="flex flex-col gap-4">
              {isOwner ? (
                <div className="bg-white/5 border border-white/5 p-6 rounded-3xl backdrop-blur-sm text-center">
                  <p className="text-xs text-zinc-400 mb-4 font-medium italic text-center">ขยายเวลาจัดเก็บรูปภาพ ฿ {fees.extend_storage || '...'} ต่อ 1 วัน</p>
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