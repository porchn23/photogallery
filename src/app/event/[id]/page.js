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
 * Version: 5.9 (Fixed Photographer Credit Mapping)
 * แบรนด์: Rooplife
 */

export default function EventGallery() {
  const params = useParams();
  const eventId = params?.id;

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
    const { data } = await supabase
      .from('events')
      .select('title, start_time, join_code, users!events_owner_id_fkey(full_name)')
      .eq('id', eventId)
      .single();

    if (data) {
      setEventInfo({
        title: data.title,
        start: data.start_time ? new Date(data.start_time) : null,
        joinCode: data.join_code,
        ownerName: data.users?.full_name || 'RoopLife'
      });
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
    
    if (mapping) setPhotoFaces(mapping);

    // 6. จัดการข้อมูล Face Clusters
    const activeClusterIds = [...new Set(mapping.map(m => m.cluster_id))];

    if (activeClusterIds.length === 0) {
       setClusters([]); 
    } else {
       const { data: faces } = await supabase
        .from('face_clusters')
        .select('id, latest_photo_id, hero_score, photos:latest_photo_id(url_thumb)')
        .in('id', activeClusterIds)
        .order('updated_at', { ascending: false });

       if (faces && mapping) {
        const clusterList = faces.map(f => {
          const isPhotoInEvent = photoIds.includes(f.latest_photo_id);
          let displayUrl = f.photos?.url_thumb;
          let targetPhotoId = f.latest_photo_id;

          if (!isPhotoInEvent) {
             const firstFaceInEvent = mapping.find(m => m.cluster_id === f.id);
             if (firstFaceInEvent) {
                const photoData = pics.find(p => p.id === firstFaceInEvent.photo_id);
                if (photoData) {
                   displayUrl = photoData.url_thumb;
                   targetPhotoId = photoData.id;
                }
             }
          }

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