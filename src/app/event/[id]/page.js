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

  // ปรับการเรียกใช้ใน Realtime Subscription
  function setupRealtimeSubscription() {
    const channel = supabase.channel(`event-realtime-${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        // ส่ง true เข้าไปเพื่อให้เป็น Silent Refresh ไม่กระพริบ
        if (payload.new.event_id === eventId) fetchEventData(true); 
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_faces' }, () => fetchEventData(true))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'face_clusters' }, () => fetchEventData(true))
      .subscribe();
    return channel;
  }

// ... existing code (บรรทัด 1-85) ...
async function fetchEventData(isSilent = false) {
  if (!eventId) return;
  if (!isSilent) setLoading(true);

  try {
    // 1. ดึงข้อมูลแบบ Parallel และตรวจสอบ Error
    const results = await Promise.all([
      supabase.from('event_cameras').select('cameras(serial_number), users(full_name)').eq('event_id', eventId),
      supabase.from('photos').select('*').eq('event_id', eventId).order('taken_at', { ascending: false }),
      supabase.from('face_clusters').select('id, latest_photo_id, hero_score, photos:latest_photo_id(url_thumb)').eq('event_id', eventId).order('updated_at', { ascending: false })
    ]);

    const eventCameras = results[0].data || [];
    const pics = results[1].data || [];
    const faces = results[2].data || [];

    if (pics.length === 0 && faces.length === 0) {
      setLoading(false);
      return;
    }

    // 2. สร้าง Index เพื่อความเร็ว (O(1) Lookup)
    const camMap = eventCameras.reduce((acc, item) => {
      const sn = item.cameras?.serial_number;
      if (sn) acc[sn] = item.users?.full_name;
      return acc;
    }, {});

    const photoMap = new Map(pics.map(p => [p.id, p]));
    
    const updatedPics = pics.map(p => ({
      ...p,
      credit: { name: camMap[p.camera_serial] || eventInfo.ownerName }
    }));

    // 3. ดึง Mapping ใบหน้า
    const photoIds = pics.map(p => p.id);
    const { data: mapping } = await supabase
      .from('photo_faces')
      .select('*')
      .in('photo_id', photoIds);

    if (mapping) {
      setPhotoFaces(mapping);

      // จัดกลุ่ม Mapping ตาม Cluster ID
      const mappingByCluster = mapping.reduce((acc, m) => {
        if (!acc[m.cluster_id]) acc[m.cluster_id] = [];
        acc[m.cluster_id].push(m);
        return acc;
      }, {});

      // 4. สร้าง Cluster List
      const clusterList = faces.map(f => {
        const clusterFaces = mappingByCluster[f.id] || [];
        let displayUrl = f.photos?.url_thumb;
        let bestFace = null;

        if (clusterFaces.length > 0) {
          // เรียงตาม quality_score เพื่อหาหน้าปก
          clusterFaces.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
          bestFace = clusterFaces[0];
          const photoData = photoMap.get(bestFace.photo_id);
          if (photoData) displayUrl = photoData.url_thumb;
        }

        const m = bestFace || clusterFaces.find(mi => mi.photo_id === f.latest_photo_id);

        return {
          id: f.id,
          url: displayUrl,
          box: m?.bounding_box,
          count: clusterFaces.length,
          hero_score: f.hero_score || 0,
          quality_score: m?.quality_score || 0
        };
      }).filter(cluster => cluster.count > 0);
      
      setClusters(clusterList);
    }
    setPhotos(updatedPics);

  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
}

// ... existing code (บรรทัด 1-85) ...

async function fetchEventData(isSilent = false) {
  if (!eventId) return;
  if (!isSilent) setLoading(true);

  try {
    // 1. ดึงข้อมูลพื้นฐานพร้อมกัน
    const [
      { data: eventCameras },
      { data: pics },
      { data: faces }
    ] = await Promise.all([
      supabase.from('event_cameras').select('cameras(serial_number), users(full_name)').eq('event_id', eventId),
      supabase.from('photos').select('*').eq('event_id', eventId).order('taken_at', { ascending: false }),
      supabase.from('face_clusters').select('id, latest_photo_id, hero_score, photos:latest_photo_id(url_thumb)').eq('event_id', eventId).order('updated_at', { ascending: false })
    ]);

    if (!pics || pics.length === 0) {
      setLoading(false);
      return;
    }

    // 2. สร้าง Index เพื่อการค้นหาที่รวดเร็ว (O(1))
    const camMap = (eventCameras || []).reduce((acc, item) => {
      const sn = item.cameras?.serial_number;
      if (sn) acc[sn] = item.users?.full_name;
      return acc;
    }, {});

    const photoMap = new Map(pics.map(p => [p.id, p]));
    
    const updatedPics = pics.map(p => ({
      ...p,
      credit: { name: camMap[p.camera_serial] || eventInfo.ownerName }
    }));

    // 3. ดึง Mapping ใบหน้า
    const photoIds = pics.map(p => p.id);
    const { data: mapping } = await supabase
      .from('photo_faces')
      .select('*')
      .in('photo_id', photoIds);

    if (mapping) {
      setPhotoFaces(mapping);

      // จัดกลุ่ม Mapping ตาม Cluster ID ล่วงหน้า
      const mappingByCluster = mapping.reduce((acc, m) => {
        if (!acc[m.cluster_id]) acc[m.cluster_id] = [];
        acc[m.cluster_id].push(m);
        return acc;
      }, {});

      // 4. สร้าง Cluster List
      const clusterList = (faces || []).map(f => {
        const clusterFaces = mappingByCluster[f.id] || [];
        let displayUrl = f.photos?.url_thumb;
        let bestFace = null;

        if (clusterFaces.length > 0) {
          // เรียงลำดับด้วย quality_score เพื่อหารูปหน้าปก
          clusterFaces.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
          bestFace = clusterFaces[0];
          const photoData = photoMap.get(bestFace.photo_id);
          if (photoData) displayUrl = photoData.url_thumb;
        }

        const m = bestFace || clusterFaces.find(mi => mi.photo_id === f.latest_photo_id);

        return {
          id: f.id,
          url: displayUrl,
          box: m?.bounding_box,
          count: clusterFaces.length,
          hero_score: f.hero_score || 0,
          quality_score: m?.quality_score || 0
        };
      }).filter(cluster => cluster.count > 0);
      
      setClusters(clusterList);
    }
    setPhotos(updatedPics);

  } catch (err) {
    console.error("Fetch error:", err);
  } finally {
    setLoading(false);
  }
}

// --- มั่นใจว่าลบโค้ด fetchEventData ซ้ำซ้อนที่อยู่หลังบรรทัดนี้ออกไปจนถึงก่อนบรรทัด 276 ---

// ... existing code (บรรทัด 276 เป็นต้นไป) ...

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