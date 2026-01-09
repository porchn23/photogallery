'use client';
import { Camera, RefreshCw, Sparkles, Download } from 'lucide-react';

/**
 * AI FACE-GRID: PHOTO GRID COMPONENT
 * Version: 5.6 (Added Smooth Animations & Stable Keys)
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

  // ✅ ฟังก์ชันสำหรับดาวน์โหลดรูป (ปรับปรุง)
  const handleDownload = (e, photo) => {
    e.stopPropagation();
    const filename = `rooplife-${photo.id}.jpg`;
    const downloadUrl = `/api/download?url=${encodeURIComponent(photo.url_raw)}&filename=${encodeURIComponent(filename)}`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 p-1 min-h-[50vh] pt-4 pb-20">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0.5 md:gap-1">
        {items.map((photo, index) => (
          <div
            key={photo.id} // ✅ สำคัญ: ใช้ ID เพื่อให้ React เลื่อนตำแหน่งแทนการวาดใหม่
            onClick={() => onPhotoClick(photo)}
            className="relative aspect-[2/3] group overflow-hidden bg-zinc-900 rounded-md shadow-sm cursor-zoom-in active:scale-95 transition-all duration-500 
            
            /* ✅ Animation เมื่อรูปใหม่เข้าสู่ Grid */
            animate-in fade-in zoom-in slide-in-from-top-2 fill-mode-both"
            style={{ 
              /* ✅ ปรับสูตร Delay ให้นุ่มนวลขึ้นแต่ยังใช้ index จาก Map เดิม */
              animationDelay: `${(index % 20) * 40}ms`, 
              animationDuration: '700ms',
              animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
          }}
          >
            {/* รูปภาพหลัก */}
            <img
              src={photo.url_thumb}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt="Rooplife Gallery Item"
            />

            {/* AI Beauty Icon */}
            {photo.ai_beauty && (
              <div className="absolute top-1 right-1 z-10 p-1.5 bg-pink-500/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20">
                <Sparkles size={10} className="text-white" fill="currentColor" />
              </div>
            )}

            {/* ✅ Download Button */}
            <button 
                onClick={(e) => handleDownload(e, photo)}
                className="absolute z-20 bg-black/40 hover:bg-black/70 backdrop-blur-md rounded-full text-white/90 hover:text-white transition-all 
                
                /* Mobile Styles */
                opacity-100 p-3 bottom-3 left-1/2 -translate-x-1/2 shadow-lg active:scale-90
                
                /* Desktop Styles */
                lg:opacity-0 lg:group-hover:opacity-100 lg:p-2 lg:bottom-1 lg:left-auto lg:right-1 lg:translate-x-0 lg:translate-y-2 lg:group-hover:translate-y-0 lg:shadow-none"
                title="Download"
            >
                <Download className="w-5 h-5 lg:w-3.5 lg:h-3.5" />
            </button>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
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