"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import UserGalleryModal from "./UserGalleryModal";
import SmartFaceCircle from "./SmartFaceCircle"; // ใช้ตัวตัดรูปอัจฉริยะตัวเดิม

interface Face {
  id: string;
  aws_face_id: string;
  confidence: number;
  bounding_box: { width: number; height: number; left: number; top: number }; 
  photo: { url_thumb: string; event_id: string }; 
}

export default function FaceStoryBar({ eventId }: { eventId: string }) {
  const [faces, setFaces] = useState<Face[]>([]);
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);

  // ค่ากรองคุณภาพ (ปรับได้ตามใจชอบ)
  const MIN_FACE_SIZE = 0.04; // หน้าต้องใหญ่ 4% ของรูป
  const MIN_CONFIDENCE = 85.0; // ความมั่นใจ 85%

  const normalizeBox = (box: any) => {
    if (!box) return null;
    if (typeof box === 'string') {
      try { box = JSON.parse(box); } catch(e) { return null; }
    }
    const w = box.Width || box.width;
    const h = box.Height || box.height;
    const l = box.Left || box.left;
    const t = box.Top || box.top;
    if (w === undefined) return null;
    return { width: w, height: h, left: l, top: t };
  };

  const fetchFaces = async () => {
    const { data } = await supabase
      .from('faces')
      .select(`
        id, 
        aws_face_id, 
        bounding_box, 
        confidence, 
        created_at, 
        photo:photos!inner(url_thumb, event_id)
      `)
      .eq('photo.event_id', eventId)
      .order('created_at', { ascending: false }) // เอาล่าสุดขึ้นก่อน
      .limit(200);

    if (data) {
      const uniqueFaces: Face[] = [];
      const seenFaceIds = new Set(); // ตัวเช็คกันซ้ำ (เช็คตาม ID หน้าคน)

      data.forEach((item: any) => {
        const cleanBox = normalizeBox(item.bounding_box);
        const conf = item.confidence || 99.9;

        if (cleanBox) {
          const faceSize = Math.max(cleanBox.width, cleanBox.height);

          // 1. กรองคุณภาพ (หน้าต้องใหญ่และชัด)
          if (faceSize >= MIN_FACE_SIZE && conf >= MIN_CONFIDENCE) {
            
            // 2. กรองหน้าซ้ำ (Logic สำคัญ)
            // เช็คว่า ID นี้เคยเอามาโชว์หรือยัง? ถ้ายัง ค่อยเอามา
            if (!seenFaceIds.has(item.aws_face_id)) {
              seenFaceIds.add(item.aws_face_id); // จดไว้ว่าเจอแล้ว
              uniqueFaces.push({ 
                ...item, 
                bounding_box: cleanBox, 
                confidence: conf 
              });
            }
          }
        }
      });
      
      setFaces(uniqueFaces);
    }
  };

  useEffect(() => {
    fetchFaces();
    const channel = supabase.channel('story-faces')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'faces' }, () => fetchFaces())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  return (
    <>
      <div className="w-full bg-gray-900/90 backdrop-blur border-b border-gray-800 py-4 mb-2">
        <h3 className="text-gray-400 text-xs px-4 mb-2 font-medium uppercase tracking-wider">
            Latest Faces ({faces.length})
        </h3>
        
        <div className="flex gap-4 overflow-x-auto px-4 pb-2 scroll-smooth no-scrollbar min-h-[90px]">
          {faces.map((face) => (
            <SmartFaceCircle 
              key={face.id}
              url={face.photo.url_thumb}
              box={face.bounding_box}
              onClick={() => setSelectedFaceId(face.aws_face_id)}
            />
          ))}
          
          {faces.length === 0 && (
            <div className="text-gray-500 text-sm px-4 py-4">Waiting...</div>
          )}
        </div>
      </div>
      
      {selectedFaceId && (
        <UserGalleryModal faceId={selectedFaceId} eventId={eventId} onClose={() => setSelectedFaceId(null)} />
      )}
    </>
  );
}