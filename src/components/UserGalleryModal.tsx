"use client";

import { useEffect, useState } from "react";
import { X, Download, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/src/lib/supabase";

interface Photo {
  id: string;
  url_raw: string;
  taken_at: string;
}

export default function UserGalleryModal({ 
  faceId, 
  eventId, 
  onClose 
}: { 
  faceId: string, 
  eventId: string, 
  onClose: () => void 
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPersonPhotos() {
      // ดึงรูปจาก AWS Face ID
      const { data } = await supabase
        .from('faces')
        .select('photo:photos(id, url_raw, taken_at)')
        .eq('aws_face_id', faceId)
        .eq('photo.event_id', eventId)
        .order('created_at', { ascending: false });

      if (data) {
        const formatted = data.map((item: any) => item.photo).filter(Boolean);
        setPhotos(formatted);
      }
      setLoading(false);
    }
    fetchPersonPhotos();
  }, [faceId, eventId]);

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `photo-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) { alert("Download failed"); }
  };

  if (loading) return <div className="fixed inset-0 z-50 bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin"/></div>;
  if (photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in">
      {/* Top Bar */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-20">
        <span className="text-gray-400 text-sm">{currentIndex + 1} / {photos.length}</span>
        <button onClick={onClose} className="bg-white/10 p-2 rounded-full text-white"><X /></button>
      </div>

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center relative w-full">
        {photos.length > 1 && (
          <button onClick={() => setCurrentIndex(p => p === 0 ? photos.length-1 : p-1)} className="absolute left-2 text-white bg-black/50 p-3 rounded-full z-20"><ChevronLeft /></button>
        )}
        
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={currentPhoto.url_raw} alt="Main" className="max-h-[80vh] max-w-full object-contain" />

        {photos.length > 1 && (
          <button onClick={() => setCurrentIndex(p => p === photos.length-1 ? 0 : p+1)} className="absolute right-2 text-white bg-black/50 p-3 rounded-full z-20"><ChevronRight /></button>
        )}
      </div>

      {/* Footer Button */}
      <div className="pb-8 flex justify-center">
        <button onClick={() => downloadImage(currentPhoto.url_raw)} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg active:scale-95 transition-all">
          <Download size={20} /> บันทึกรูปภาพ
        </button>
      </div>
    </div>
  );
}