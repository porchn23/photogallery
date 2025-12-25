'use client';
import { Camera, RefreshCw, Sparkles } from 'lucide-react';

/**
 * AI FACE-GRID: PHOTO GRID COMPONENT
 * Version: 5.5 (Added AI Beauty Icon Overlay)
 * แบรนด์: Rooplife
 */

export default function PhotoGrid({ photos, loading, onPhotoClick }) {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-60 text-zinc-500 gap-4 pt-10">
        <RefreshCw className="animate-spin text-yellow-400" size={32} />
        <p className="text-xs font-medium uppercase tracking-widest">กำลังโหลดรูปภาพ...</p>
      </div>
    );
  }

  const items = Array.isArray(photos) ? photos : [];

  return (
    <div className="flex-1 p-1 min-h-[50vh] pt-4 pb-20">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0.5 md:gap-1">
        {items.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="relative aspect-[2/3] group overflow-hidden bg-zinc-900 rounded-md shadow-sm cursor-zoom-in active:scale-95 transition-transform"
          >
            {/* รูปภาพหลัก */}
            <img
              src={photo.url_thumb}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Rooplife Gallery Item"
            />

            {/* ✅ AI Beauty Icon - แสดงที่มุมบนขวาถ้าผ่านการทำ Ai Beauty */}
            {photo.ai_beauty && (
              <div className="absolute top-1 right-1 z-10 p-1.5 bg-pink-500/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                <Sparkles size={10} className="text-white" fill="currentColor" />
              </div>
            )}

            {/* Overlay Gradient เมื่อ Hover เพื่อความสวยงาม */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>

      {/* กรณีไม่มีรูปภาพ */}
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-20 pb-10 text-zinc-600">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Camera size={30} className="opacity-50" />
          </div>
          <p className="text-sm font-medium uppercase tracking-widest">ยังไม่มีรูปภาพ</p>
        </div>
      )}
    </div>
  );
}