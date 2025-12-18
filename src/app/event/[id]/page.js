'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/src/lib/supabase';

// Import Components
import Header from '@/src/components/Header';
import FaceBar from '@/src/components/FaceBar';
import PhotoGrid from '@/src/components/PhotoGrid';
import PhotoModal from '@/src/components/PhotoModal';
import QRModal from '@/src/components/QRModal';

export default function EventGallery() {
  const params = useParams();
  const eventId = params?.id;

  // --- STATE ---
  const [clusters, setClusters] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [cameraMap, setCameraMap] = useState({}); 
  const [selectedClusterId, setSelectedClusterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventInfo, setEventInfo] = useState({ title: 'Loading...', start: null, end: null });
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState(null);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
    if (eventId) {
      fetchEventDetails();
      fetchDataFromUsersTable();
    }
  }, [eventId]);

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

  // --- FETCHING FUNCTIONS ---
  async function fetchEventDetails() {
    const { data } = await supabase
      .from('events')
      .select('title, start_time, end_time')
      .eq('id', eventId)
      .single();
      
    if (data) {
      setEventInfo({
        title: data.title,
        start: data.start_time ? new Date(data.start_time) : null,
        end: data.end_time ? new Date(data.end_time) : null
      });
    }
  }

  // 🔥 ฟังก์ชันดึงชื่อตากล้องจากตาราง Users
  async function fetchDataFromUsersTable() {
    setLoading(true);

    // 1. ดึงกล้อง + Users
    const { data: cameras, error: camError } = await supabase
      .from('event_cameras')
      .select(`
        serial_number,
        users ( full_name, phone_number )
      `)
      .eq('event_id', eventId);

    if (camError) console.error("Error fetching cameras:", camError);

    // 2. สร้าง Map (Prioritize ชื่อจาก Users Table)
    const camMap = (cameras || []).reduce((acc, cam) => {
      // Handle กรณี Supabase return เป็น array หรือ object
      const user = Array.isArray(cam.users) ? cam.users[0] : cam.users;
      
      acc[cam.serial_number] = {
          // ✅ ดึงชื่อจริงจาก Users Table เป็นหลัก
          name: user?.full_name || 'Unknown Photographer', 
          phone: user?.phone_number || '' 
      };
      return acc;
    }, {});
    
    setCameraMap(camMap);

    // 3. ดึงกลุ่มใบหน้า
    const { data: faces } = await supabase
      .from('face_clusters')
      .select('id, hero_score, latest_photo_id, photos:latest_photo_id(url_thumb)')
      .eq('event_id', eventId)
      .order('updated_at', { ascending: false });
    if (faces) setClusters(faces);

    // 4. ดึงรูปภาพ
    const { data: pics } = await supabase
      .from('photos')
      .select('*')
      .eq('event_id', eventId)
      .order('taken_at', { ascending: false })
      .limit(1000);
    
    if (pics) {
      const enrichedPhotos = pics.map(photo => ({
        ...photo,
        // ✅ ถ้าหา Serial ไม่เจอ ให้ใส่ค่าว่างหรือ Unknown (ลบคำว่า AI Face Grid ออก)
        credit: camMap[photo.camera_serial] || { name: 'Unknown Photographer', phone: '' }
      }));
      setPhotos(enrichedPhotos);
    }
    
    setLoading(false);
    setupRealtimeSubscription(camMap);
  }

  // --- REALTIME ---
  function setupRealtimeSubscription(currentCamMap) {
    const channel = supabase.channel(`event-${eventId}`)
      
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        if (payload.new.event_id === eventId) {
            const newPhoto = {
                ...payload.new,
                // ✅ Realtime ก็ต้องใช้ Logic เดียวกัน
                credit: currentCamMap[payload.new.camera_serial] || { name: 'Unknown Photographer', phone: '' }
            };
            setPhotos(prev => [newPhoto, ...prev]);
        }
      })
      
      .on('postgres_changes', { event: '*', schema: 'public', table: 'face_clusters' }, async (payload) => {
        if ((payload.new?.event_id || payload.old?.event_id) === eventId) {
          const { data: newFace } = await supabase
            .from('face_clusters')
            .select('id, hero_score, latest_photo_id, photos:latest_photo_id(url_thumb)')
            .eq('id', payload.new.id || payload.old.id)
            .single();
          
          if (newFace) {
            setClusters(prev => {
              const filtered = prev.filter(c => c.id !== newFace.id);
              return [newFace, ...filtered];
            });
          }
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // --- RENDER ---
  return (
    <div className={`min-h-screen bg-black text-white flex flex-col font-sans ${selectedPhotoForModal || showQR ? 'overflow-hidden h-screen' : ''}`}>
      <Header onQRClick={() => setShowQR(true)} />
      <FaceBar 
        clusters={clusters} 
        photos={photos} 
        selectedClusterId={selectedClusterId} 
        onSelectCluster={setSelectedClusterId}
        eventInfo={eventInfo}
      />
      <PhotoGrid 
        photos={photos} 
        loading={loading} 
        selectedClusterId={selectedClusterId} 
        onPhotoClick={setSelectedPhotoForModal} 
      />
      <QRModal show={showQR} onClose={() => setShowQR(false)} url={currentUrl} />
      <PhotoModal photo={selectedPhotoForModal} onClose={() => setSelectedPhotoForModal(null)} />
    </div>
  );
}