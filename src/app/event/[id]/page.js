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
 * Version: 4.5 (Strict Owner Credit Fallback - Full Code)
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
  const [eventInfo, setEventInfo] = useState({ title: 'Loading...', start: null, end: null, ownerName: '', ownerPhone: '' });
  const [showQR, setShowQR] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [selectedPhotoForModal, setSelectedPhotoForModal] = useState(null);

  // --- LOGIC: กรองรูปภาพตามคนเลือก ---
  const filteredPhotos = useMemo(() => {
    if (!selectedClusterId) return photos;
    const photoIds = photoFaces
      .filter(pf => pf.cluster_id === selectedClusterId)
      .map(pf => pf.photo_id);
    return photos.filter(p => photoIds.includes(p.id));
  }, [selectedClusterId, photos, photoFaces]);

  useEffect(() => {
    if (typeof window !== 'undefined') setCurrentUrl(window.location.href);
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // แยกการโหลด Data เพื่อรอให้ eventInfo.ownerName พร้อมใช้งานก่อน
  useEffect(() => {
    if (eventId && eventInfo.ownerName !== '') {
      fetchInitialData();
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

  // --- FETCHING FUNCTIONS ---
  async function fetchEventDetails() {
    const { data } = await supabase
      .from('events')
      .select(`
        title, 
        start_time, 
        end_time,
        users ( full_name, phone_number )
      `)
      .eq('id', eventId)
      .single();

    if (data) {
      setEventInfo({
        title: data.title,
        start: data.start_time ? new Date(data.start_time) : null,
        end: data.end_time ? new Date(data.end_time) : null,
        ownerName: data.users?.full_name || 'WSWSS',
        ownerPhone: data.users?.phone_number || ''
      });
    }
  }

  async function fetchInitialData() {
    setLoading(true);
    
    const { data: cameras } = await supabase
      .from('event_cameras')
      .select(`serial_number, users ( full_name, phone_number )`)
      .eq('event_id', eventId);

    const camMap = (cameras || []).reduce((acc, cam) => {
      const u = Array.isArray(cam.users) ? cam.users[0] : cam.users;
      acc[cam.serial_number] = { name: u?.full_name, phone: u?.phone_number };
      return acc;
    }, {});

    const { data: pics } = await supabase.from('photos').select('*').eq('event_id', eventId).order('taken_at', { ascending: false });
    
    // 🔥 แก้ไขตรงนี้: ถ้าหาช่างภาพไม่เจอ ให้ใช้ชื่อเจ้าของ Event ทันที (ไม่มีคำว่า Photographer ต่อท้าย)
    const enrichedPhotos = (pics || []).map(p => {
      const photographer = camMap[p.camera_serial];
      return {
        ...p,
        credit: {
          name: photographer?.name || eventInfo.ownerName, 
          phone: photographer?.phone || eventInfo.ownerPhone
        }
      };
    });
    setPhotos(enrichedPhotos);

    const { data: mapping } = await supabase.from('photo_faces').select('photo_id, cluster_id, bounding_box');
    setPhotoFaces(mapping || []);

    const { data: faceClusters } = await supabase
      .from('face_clusters')
      .select(`id, latest_photo_id, photos:latest_photo_id(url_thumb)`)
      .eq('event_id', eventId)
      .order('updated_at', { ascending: false });

    if (faceClusters && mapping) {
      const faceMap = new Map();
      faceClusters.forEach(cluster => {
        if (!faceMap.has(cluster.id)) {
          const faceDetail = mapping.find(m => m.cluster_id === cluster.id && m.photo_id === cluster.latest_photo_id);
          const pCount = mapping.filter(m => m.cluster_id === cluster.id).length;
          faceMap.set(cluster.id, {
            id: cluster.id,
            url: cluster.photos?.url_thumb,
            box: faceDetail?.bounding_box || null,
            count: pCount
          });
        }
      });
      setClusters(Array.from(faceMap.values()));
    }
    
    setLoading(false);
  }

  return (
    <div className={`min-h-screen bg-black text-white flex flex-col font-sans ${selectedPhotoForModal || showQR ? 'overflow-hidden h-screen' : ''}`}>
      <Header onQRClick={() => setShowQR(true)} />
      <FaceBar clusters={clusters} selectedClusterId={selectedClusterId} onSelectCluster={setSelectedClusterId} eventInfo={eventInfo} />
      <PhotoGrid photos={filteredPhotos} loading={loading} onPhotoClick={setSelectedPhotoForModal} />
      <QRModal show={showQR} onClose={() => setShowQR(false)} url={currentUrl} />
      <PhotoModal 
        photo={selectedPhotoForModal} 
        onClose={() => setSelectedPhotoForModal(null)} 
        eventOwner={eventInfo.ownerName} 
      />
    </div>
  );
}