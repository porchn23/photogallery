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

/**
 * AI FACE-GRID: EVENT GALLERY PAGE
 * Version: 5.7 (Full Real-time Subscription - Full Code)
 * แบรนด์: Rooplife
 */

// ... (ส่วนการ import คงเดิม)

export default function EventGallery() {
  const params = useParams();
  const eventId = params?.id;

  // --- STATE ---
  const [clusters, setClusters] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoFaces, setPhotoFaces] = useState([]); 
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventInfo, setEventInfo] = useState({ title: 'Loading...', start: null, ownerName: '' });
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState(null);

  // --- LOGIC: ANTI-BACK & KEYDOWN (คงเดิม) ---
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
      fetchEventData(); // เปลี่ยนชื่อฟังก์ชันให้สื่อความหมายขึ้น
      
      const channel = setupRealtimeSubscription();
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [eventId, eventInfo.ownerName]);

  // --- FILTER LOGIC (คงเดิม) ---
  const filteredPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    if (!selectedClusterId) return photos;
    const photoIdsInCluster = photoFaces
      .filter(pf => pf.cluster_id === selectedClusterId)
      .map(pf => pf.photo_id);
    return photos.filter(p => photoIdsInCluster.includes(p.id));
  }, [selectedClusterId, photos, photoFaces]);

  // --- REAL-TIME LOGIC ---
  function setupRealtimeSubscription() {
    const channel = supabase.channel(`event-realtime-${eventId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        if (payload.new.event_id === eventId) fetchEventData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_faces' }, () => {
        fetchEventData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'face_clusters' }, () => {
        fetchEventData();
      })
      .subscribe();
    
    return channel;
  }

  // --- FETCHING FUNCTIONS ---
  async function fetchEventDetails() {
    // แก้ไข: ลบ end_time และใช้ Join users ให้ตรงตาม Schema
    const { data, error } = await supabase
      .from('events')
      .select('title, start_time, join_code, users!events_owner_id_fkey(full_name)')
      .eq('id', eventId)
      .single();

    if (data) {
      setEventInfo({
        title: data.title,
        start: data.start_time ? new Date(data.start_time) : null,
        joinCode: data.join_code, // ✅ เก็บลง state
        ownerName: data.users?.full_name || 'RoopLife'
      });
    }
  }

  async function fetchEventData() {
    // 1. ดึงข้อมูลช่างภาพ (Cameras)
    const { data: cameras } = await supabase
      .from('event_cameras')
      .select('serial_number, users(full_name, phone_number)')
      .eq('event_id', eventId);

    const camMap = (cameras || []).reduce((acc, cam) => {
      const u = Array.isArray(cam.users) ? cam.users[0] : cam.users;
      acc[cam.serial_number] = { name: u?.full_name, phone: u?.phone_number || '' };
      return acc;
    }, {});

    // 2. ดึงรูปภาพทั้งหมดใน Event
    const { data: pics } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('taken_at', { ascending: false });

    if (!pics) return;

    const updatedPics = pics.map(p => ({
      ...p,
      credit: { 
        name: camMap[p.camera_serial]?.name || eventInfo.ownerName, 
        phone: camMap[p.camera_serial]?.phone || '' 
      }
    }));
    setPhotos(updatedPics);

    // 3. ดึง Mapping ใบหน้า เฉพาะของรูปภาพใน Event นี้ (Optimization)
    const photoIds = pics.map(p => p.id);
    const { data: mapping } = await supabase
      .from('photo_faces')
      .select('*')
      .in('photo_id', photoIds);
    
    if (mapping) setPhotoFaces(mapping);

    // ✅ 4.1: หาว่ามี Cluster ID (คน) คนไหนบ้างที่อยู่ในรูปของงานนี้
    // (เราใช้ Set เพื่อตัด ID ซ้ำออก ให้เหลือแค่ ID ที่ไม่ซ้ำ)
    const activeClusterIds = [...new Set(mapping.map(m => m.cluster_id))];

    if (activeClusterIds.length === 0) {
       setClusters([]); // ถ้าไม่มีคนเลย ให้เคลียร์ค่า
    } else {
       // ✅ 4.2: ดึงข้อมูล Cluster ตาม ID ที่เราหาเจอในงานนี้ (ไม่สนใจว่า event_id ใน DB คืออะไร)
       const { data: faces } = await supabase
        .from('face_clusters')
        .select('id, latest_photo_id, hero_score, photos:latest_photo_id(url_thumb)')
        .in('id', activeClusterIds)  // <--- ⭐ เปลี่ยนจาก .eq('event_id', eventId) เป็น .in()
        .order('updated_at', { ascending: false });

       if (faces && mapping) {
        const clusterList = faces.map(f => {
          // ✅ 4.3: Logic เช็คว่ารูปปก (latest_photo) อยู่ในงานนี้ไหม?
          // ถ้าไม่อยู่ (เป็นรูปจากงานเก่า) ให้หารูปใหม่ในงานนี้มาโชว์แทน
          const isPhotoInEvent = photoIds.includes(f.latest_photo_id);
          
          let displayUrl = f.photos?.url_thumb;
          let targetPhotoId = f.latest_photo_id;

          if (!isPhotoInEvent) {
             // หารูปแรกของคนนี้ ในงานนี้ มาทำปกแทน
             const firstFaceInEvent = mapping.find(m => m.cluster_id === f.id);
             if (firstFaceInEvent) {
                const photoData = photos.find(p => p.id === firstFaceInEvent.photo_id);
                if (photoData) {
                   displayUrl = photoData.url_thumb;
                   targetPhotoId = photoData.id;
                }
             }
          }

          // หา bounding box ให้ตรงกับรูปปกที่เราเลือกมาโชว์
          const m = mapping.find(mi => mi.cluster_id === f.id && mi.photo_id === targetPhotoId);

          return {
            id: f.id,
            url: displayUrl,
            box: m?.bounding_box,
            count: mapping.filter(mi => mi.cluster_id === f.id).length,
            hero_score: f.hero_score || 0 
          };
        });
        setClusters(clusterList);
      }
    }
    
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col font-sans overflow-hidden">
      <Header onQRClick={() => setShowQR(true)} />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-40 bg-black">
          <FaceBar clusters={clusters} selectedClusterId={selectedClusterId} onSelectCluster={setSelectedClusterId} eventInfo={eventInfo} />
        </div>
        <PhotoGrid photos={filteredPhotos} loading={loading} onPhotoClick={(photo) => setSelectedPhotoForModal(photo)} />
      </div>
      <QRModal show={showQR} onClose={() => setShowQR(false)} url={currentUrl} title={eventInfo.title} joinCode={eventInfo.joinCode} />
      <PhotoModal 
        photo={selectedPhotoForModal} 
        allPhotos={filteredPhotos} // ✅ ส่งรูปทั้งหมดที่ผ่านการ filter แล้ว
        onClose={() => setSelectedPhotoForModal(null)} 
        onPhotoChange={setSelectedPhotoForModal} // ✅ เพิ่ม callback สำหรับเปลี่ยนรูป
        eventOwner={eventInfo.ownerName} 
      />
    </div>
  );
}