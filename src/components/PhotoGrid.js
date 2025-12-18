import { Camera, RefreshCw } from 'lucide-react';

/**
 * AI FACE-GRID: PHOTO GRID COMPONENT
 * Version: 5.4 (Fix Pointer Events & 3-Column UI - Full Code)
 * แบรนด์: WSWSS
 */

export default function PhotoGrid({ photos, loading, onPhotoClick }) {
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-60 text-zinc-500 gap-4 pt-10">
        <RefreshCw className="animate-spin text-yellow-400" size={32} />
        <p className="text-xs">กำลังโหลดรูปภาพ...</p>
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
            <img
              src={photo.url_thumb}
              loading="lazy"
              /* ✅ แก้ไข: ลบ pointer-events-none ออกเพื่อให้คลิกติด */
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt="WSWSS Gallery Item"
            />
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center pt-20 pb-10 text-zinc-600">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <Camera size={30} className="opacity-50" />
          </div>
          <p>ยังไม่มีรูปภาพ</p>
        </div>
      )}
    </div>
  );
}