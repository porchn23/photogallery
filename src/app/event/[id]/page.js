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

export default function EventGallery() {
  const params = useParams();
  const eventId = params?.id;

  // --- STATE ---
  const [clusters, setClusters] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoFaces, setPhotoFaces] = useState([]); 
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventInfo, setEventInfo] = useState({ title: 'Loading...', start: null, end: null, ownerName: '' });
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState(null);

  // --- LOGIC: ANTI-BACK ---
  useEffect(() => {
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- LOGIC: FILTER ---
  const filteredPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    if (!selectedClusterId) return photos;
    const photoIds = photoFaces
      .filter(pf => pf.cluster_id === selectedClusterId)
      .map(pf => pf.photo_id);
    return photos.filter(p => photoIds.includes(p.id));
  }, [selectedClusterId, photos, photoFaces]);

  useEffect(() => {
    if (typeof window !== 'undefined') setCurrentUrl(window.location.href);
    if (eventId) fetchEventDetails();
  }, [eventId]);

  useEffect(() => {
    if (eventId && eventInfo.ownerName !== '') {
      fetchDataFromUsersTable();
      
      // ✅ เปิดระบบ Real-time
      const channel = setupRealtimeSubscription();
      return () => {
        if (channel) supabase.removeChannel(channel);
      };
    }
  }, [eventId, eventInfo.ownerName]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      setSelectedPhotoForModal(null);
      setShowQR(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // --- REAL-TIME LOGIC ---
  function setupRealtimeSubscription() {
    const channel = supabase.channel(`event-realtime-${eventId}`)
      // 📸 เมื่อมีรูปภาพใหม่เพิ่มเข้ามา
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        if (payload.new.event_id === eventId) {
          fetchDataFromUsersTable(); // ดึงข้อมูลใหม่เพื่อจัดลำดับเครดิตและรูปภาพ
        }
      })
      // 👤 เมื่อมีการแท็กใบหน้า หรือ AI สร้าง Cluster ใหม่
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_faces' }, () => {
        fetchDataFromUsersTable(); // อัปเดต FaceBar และ Mapping
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'face_clusters' }, () => {
        fetchDataFromUsersTable(); // อัปเดตสถานะล่าสุดของแต่ละบุคคล
      })
      .subscribe();
    
    return channel;
  }

  // --- FETCHING FUNCTIONS ---
  async function fetchEventDetails() {
    const { data } = await supabase.from('events').select('title, start_time, end_time, users(full_name)').eq('id', eventId).single();
    if (data) {
      setEventInfo({
        title: data.title,
        start: data.start_time ? new Date(data.start_time) : null,
        end: data.end_time ? new Date(data.end_time) : null,
        ownerName: data.users?.full_name || 'WSWSS'
      });
    }
  }

  async function fetchDataFromUsersTable() {
    // หมายเหตุ: ไม่สั่ง setLoading(true) ระหว่างโหลด Real-time เพื่อไม่ให้หน้าจอกระพริบ
    const { data: cameras } = await supabase.from('event_cameras').select('serial_number, users(full_name, phone_number)').eq('event_id', eventId);
    const camMap = (cameras || []).reduce((acc, cam) => {
      const u = Array.isArray(cam.users) ? cam.users[0] : cam.users;
      acc[cam.serial_number] = { name: u?.full_name, phone: u?.phone_number || '' };
      return acc;
    }, {});

    const { data: pics } = await supabase.from('photos').select('*').eq('event_id', eventId).order('taken_at', { ascending: false });
    if (pics) {
      setPhotos(pics.map(p => ({
        ...p,
        credit: { name: camMap[p.camera_serial]?.name || eventInfo.ownerName, phone: camMap[p.camera_serial]?.phone || '' }
      })));
    }

    const { data: mapping } = await supabase.from('photo_faces').select('*');
    if (mapping) setPhotoFaces(mapping);

    const { data: faces } = await supabase.from('face_clusters').select('id, latest_photo_id, photos:latest_photo_id(url_thumb)').eq('event_id', eventId).order('updated_at', { ascending: false });

    if (faces && mapping) {
      const faceMap = new Map();
      faces.forEach(f => {
        if (!faceMap.has(f.id)) {
          const m = mapping.find(mi => mi.cluster_id === f.id && mi.photo_id === f.latest_photo_id);
          faceMap.set(f.id, { id: f.id, url: f.photos?.url_thumb, box: m?.bounding_box, count: mapping.filter(mi => mi.cluster_id === f.id).length });
        }
      });
      setClusters(Array.from(faceMap.values()));
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