'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';

// Import Components
import Header from '@/src/components/Header';
import FaceBar from '@/src/components/FaceBar';
import PhotoGrid from '@/src/components/PhotoGrid';
import PhotoModal from '@/src/components/PhotoModal';
import QRModal from '@/src/components/QRModal';
import { Clock, AlertTriangle } from 'lucide-react'; // ✅ เพิ่ม Icon

/**
 * AI FACE-GRID: EVENT GALLERY PAGE
 * Version: 5.9 (Fixed Photographer Credit Mapping)
 * แบรนด์: Rooplife
 */

export default function EventGallery() {
  const params = useParams();
  const eventId = params?.id;
  const [eventStatus, setEventStatus] = useState('loading'); 

  // --- STATE ---
  const [clusters, setClusters] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoFaces, setPhotoFaces] = useState([]); 
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [isAIOnly, setIsAIOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventInfo, setEventInfo] = useState({ title: 'Loading...', start: null, ownerName: '' });
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState(null);

  // --- LOGIC: ANTI-BACK & KEYDOWN ---
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') setCurrentUrl(window.location.href);
    if (eventId) fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (eventId && eventInfo.ownerName !== '') {
      fetchEventData();
      
      const channel = setupRealtimeSubscription();
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [eventId, eventInfo.ownerName]);

  const filteredPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    let result = photos;
    if (isAIOnly) result = result.filter(p => p.ai_beauty === true);
    if (selectedClusterId) {
      const photoIdsInCluster = photoFaces
        .filter(pf => pf.cluster_id === selectedClusterId)
        .map(pf => pf.photo_id);
      result = result.filter(p => photoIdsInCluster.includes(p.id));
    }
    return result;
  }, [selectedClusterId, isAIOnly, photos, photoFaces]);

  function setupRealtimeSubscription() {
    const channel = supabase.channel(`event-realtime-${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        if (payload.new.event_id === eventId) fetchEventData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_faces' }, () => fetchEventData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'face_clusters' }, () => fetchEventData())
      .subscribe();
    return channel;
  }

  async function fetchEventDetails() {
    // ✅ ดึง storage_days เพิ่ม
    const { data } = await supabase
      .from('events')
      .select('title, start_time, join_code, storage_days, created_at, users!events_owner_id_fkey(full_name)')
      .eq('id', eventId)
      .single();

    if (data) {
      setEventInfo({
        title: data.title,
        start: data.start_time ? new Date(data.start_time) : null,
        joinCode: data.join_code,
        ownerName: data.users?.full_name || 'RoopLife'
      });

      // ✅ คำนวณสถานะ Event
      const now = new Date();
      const start = new Date(data.start_time);
      const expiry = new Date(start.getTime() + ((data.storage_days || 2) * 24 * 60 * 60 * 1000));

      if (now < start) {
        setEventStatus('not_started');
      } else if (now > expiry) {
        setEventStatus('expired');
      } else {
        setEventStatus('active');
      }
    } else {
       // กรณีไม่เจองาน
       setEventStatus('expired'); 
    }
  }

  async function fetchEventData() {
    // 1. ดึงข้อมูลความสัมพันธ์ของกล้องและช่างภาพ (Join ตาราง cameras เพื่อเอา serial_number)
    const { data: eventCameras } = await supabase
      .from('event_cameras')
      .select('cameras(serial_number), users(full_name)')
      .eq('event_id', eventId);

    // 2. สร้าง Map เพื่อเก็บชื่อช่างภาพโดยใช้ Serial Number เป็น Key
    const camMap = (eventCameras || []).reduce((acc, item) => {
      const sn = item.cameras?.serial_number;
      const name = item.users?.full_name;
      if (sn) acc[sn] = { name };
      return acc;
    }, {});

    // 3. ดึงรูปภาพทั้งหมด
    const { data: pics } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('taken_at', { ascending: false });

    if (!pics) return;

    // 4. แมพข้อมูลชื่อช่างภาพเข้ากับรูปภาพแต่ละใบ
    const updatedPics = pics.map(p => ({
      ...p,
      credit: { 
        // ตรวจสอบจาก camMap โดยใช้ camera_serial จากตาราง photos
        name: camMap[p.camera_serial]?.name || eventInfo.ownerName, 
      }
    }));
    setPhotos(updatedPics);

    // 5. ดึง Mapping ใบหน้า
    const photoIds = pics.map(p => p.id);
    const { data: mapping } = await supabase
      .from('photo_faces')
      .select('*')
      .in('photo_id', photoIds);

    // 🔴 DEBUG: ขอดูปริ้นข้อมูล Mapping 1 ตัวแรกแบบเต็มๆ หน่อยครับ
    if (mapping && mapping.length > 0) {
      console.log("🔥 RAW DB MAPPING[0]:", JSON.stringify(mapping[0], null, 2));
    }
      
    
    if (mapping) setPhotoFaces(mapping);

    // 6. จัดการข้อมูล Face Clusters
    const activeClusterIds = [...new Set(mapping.map(m => m.cluster_id))];
    console.log("DEBUG: activeClusterIds (raw):", activeClusterIds);

    if (activeClusterIds.length === 0) {
       setClusters([]); 
    } else {
       const { data: faces } = await supabase
        .from('face_clusters')
        .select('id, latest_photo_id, hero_score, photos:latest_photo_id(url_thumb)')
        .in('id', activeClusterIds)
        .order('updated_at', { ascending: false }); // 🚀 หัวใจสำคัญ: เรียงจากใหม่ไปเก่า

       console.log("DEBUG: faces data from DB:", faces); // 🔍 ดูว่าได้ข้อมูลจาก DB ไหม
       

       if (faces && mapping) {
        const clusterList = faces.map(f => {
          // 1. หา Face ทั้งหมดของ Cluster นี้ที่มีในงานนี้
          // (ต้อง filter จาก pics ด้วย เพื่อให้แน่ใจว่าเป็นรูปในงานนี้จริงๆ)
          const allFacesInCluster = mapping.filter(m => m.cluster_id === f.id && photoIds.includes(m.photo_id));
          
          let targetPhotoId = f.latest_photo_id;
          let displayUrl = f.photos?.url_thumb;
          let bestFace = null;

          if (allFacesInCluster.length > 0) {
             // 2. เรียงลำดับตามความสวย (มาก -> น้อย)
             allFacesInCluster.sort((a, b) => (b.beauty_score || 0) - (a.beauty_score || 0));
             
             // 3. เลือกตัวที่สวยที่สุด
             bestFace = allFacesInCluster[0];
             targetPhotoId = bestFace.photo_id;
             
             // 4. หารูปเพื่อเอา URL
             const photoData = pics.find(p => p.id === targetPhotoId);
             if (photoData) {
                displayUrl = photoData.url_thumb;
             }
          }

          // กรณีที่ไม่มีรูปในงานเลย (allFacesInCluster เป็น 0) ก็จะใช้ logic เดิม (f.latest_photo_id)
          
          // 5. ใช้ข้อมูล bounding box และ score จากรูปที่เลือกมา
          const m = bestFace || mapping.find(mi => mi.cluster_id === f.id && mi.photo_id === targetPhotoId);

          // Debug เพื่อความชัวร์
          // console.log(`Cluster ${f.id} Best Score: ${m?.beauty_score}`);

          return {
            id: f.id,
            url: displayUrl,
            box: m?.bounding_box,
            count: allFacesInCluster.length, // นับเฉพาะรูปในงานนี้
            hero_score: f.hero_score || 0,
            beauty_score: m?.beauty_score || 0 // ส่งคะแนนที่แท้จริงของรูปปกไป
          };
        });
        setClusters(clusterList);
      }
    }

    setLoading(false);
  }

// ---------------------------------------------------------
  // ✅ โค้ดส่วนนี้ต้องอยู่นอกฟังก์ชัน fetchEventData แต่อยู่ใน Component
  // ---------------------------------------------------------
  if (eventStatus === 'not_started') {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <Clock size={40} className="text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{eventInfo.title}</h1>
        <p className="text-zinc-400 mb-8">งานนี้ยังไม่เริ่มต้น</p>
        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">กำหนดการ</p>
            <p className="text-xl font-mono text-amber-500">
                { eventInfo.start ? eventInfo.start.toLocaleString('th-TH', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                }) : '-'}
            </p>
        </div>
      </div>
    );
  }

  if (eventStatus === 'expired') {
    return (
      <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{eventInfo.title}</h1>
        <p className="text-zinc-400 mb-8">ขออภัย งานนี้หมดอายุการจัดเก็บแล้ว</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-white text-black font-bold rounded-full text-sm uppercase tracking-widest hover:bg-zinc-200 transition-colors">
            ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden">
      <Header onQRClick={() => setShowQR((prev) => !prev)} isQROpen={showQR} />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-40 bg-black">
          <FaceBar 
            clusters={clusters} 
            selectedClusterId={selectedClusterId} 
            onSelectCluster={setSelectedClusterId} 
            eventInfo={eventInfo}
            isAIOnly={isAIOnly}
            setIsAIOnly={setIsAIOnly}
          />
        </div>
        <PhotoGrid photos={filteredPhotos} loading={loading} onPhotoClick={(photo) => setSelectedPhotoForModal(photo)} />
      </div>
      <QRModal show={showQR} onClose={() => setShowQR(false)} url={currentUrl} title={eventInfo.title} joinCode={eventInfo.joinCode} />
      <PhotoModal 
        photo={selectedPhotoForModal} 
        allPhotos={filteredPhotos} 
        onClose={() => setSelectedPhotoForModal(null)} 
        onPhotoChange={setSelectedPhotoForModal} 
        eventOwner={eventInfo.ownerName} 
      />
    </div>
  );
}