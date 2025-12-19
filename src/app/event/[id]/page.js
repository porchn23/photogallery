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
 * แบรนด์: WSWSS
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
      .select('title, start_time, users!events_owner_id_fkey(full_name)')
      .eq('id', eventId)
      .single();

    if (data) {
      setEventInfo({
        title: data.title,
        start: data.start_time ? new Date(data.start_time) : null,
        ownerName: data.users?.full_name || 'WSWSS'
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

    // 4. ดึง Cluster (คน) ที่ปรากฏใน Event นี้
    const { data: faces } = await supabase
      .from('face_clusters')
      .select('id, latest_photo_id, hero_score, photos:latest_photo_id(url_thumb)')
      .eq('event_id', eventId)
      .order('updated_at', { ascending: false });

    if (faces && mapping) {
      const clusterList = faces.map(f => {
        // หา bounding box จากรูปภาพล่าสุดของคนนั้น
        const m = mapping.find(mi => mi.cluster_id === f.id && mi.photo_id === f.latest_photo_id);
        return {
          id: f.id,
          url: f.photos?.url_thumb,
          box: m?.bounding_box,
          count: mapping.filter(mi => mi.cluster_id === f.id).length,
          hero_score: f.hero_score || 0 // ✅ ส่ง hero_score ไปยัง Component
        };
      });
      setClusters(clusterList);
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
      <QRModal show={showQR} onClose={() => setShowQR(false)} url={currentUrl} />
      <PhotoModal photo={selectedPhotoForModal} onClose={() => setSelectedPhotoForModal(null)} eventOwner={eventInfo.ownerName} />
    </div>
  );
}