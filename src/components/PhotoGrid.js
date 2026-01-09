'use client';
import { Camera, RefreshCw, Sparkles, Download } from 'lucide-react';

/**
 * AI FACE-GRID: PHOTO GRID COMPONENT
 * Version: 5.8 (Added Cache Busting, AI Beauty Status & Smooth Animations)
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

  // ✅ ฟังก์ชันสำหรับดาวน์โหลดรูป (รองรับ Cache Busting)
  const handleDownload = (e, photo) => {
    e.stopPropagation();
    const filename = `rooplife-${photo.id}.jpg`;
    const version = new Date(photo.updated_at || photo.created_at).getTime();
    const finalUrl = `${photo.url_raw}${photo.url_raw.includes('?') ? '&' : '?'}v=${version}`;
    
    const downloadUrl = `/api/download?url=${encodeURIComponent(finalUrl)}&filename=${encodeURIComponent(filename)}`;
    
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
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="relative aspect-[2/3] group overflow-hidden bg-zinc-900 rounded-lg shadow-sm cursor-zoom-in active:scale-95 transition-all duration-700 
            
            /* ✅ Animation เมื่อรูปใหม่เข้าสู่ Grid */
            animate-in fade-in zoom-in-95 slide-in-from-bottom-4 fill-mode-both"
            style={{ 
                animationDelay: `${(index % 20) * 40}ms`,
                animationDuration: '700ms',
                animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)'
            }}
          >
            {/* รูปภาพหลัก: เพิ่ม Cache Busting */}
            <img
              src={`${photo.url_thumb}${photo.url_thumb.includes('?') ? '&' : '?'}v=${new Date(photo.updated_at || photo.created_at).getTime()}`}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              alt="Rooplife Gallery Item"
            />

            {/* ✅ AI Status Badges (แสดงสถานะการแต่งรูป) */}
            <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
              {/* กรณีสำเร็จ (AI Beauty) */}
              {(photo.ai_beauty_status === 'completed' || photo.ai_beauty) && (
                <div className="p-1.5 bg-pink-500/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20 animate-in fade-in zoom-in">
                  <Sparkles size={10} className="text-white" fill="currentColor" />
                </div>
              )}
              
              {/* กรณีอยู่ระหว่างดำเนินการ */}
              {(photo.ai_beauty_status === 'pending' || photo.ai_beauty_status === 'processing') && (
                <div className="bg-black/60 backdrop-blur-md text-[7px] text-white px-1.5 py-0.5 rounded-full flex items-center gap-1 border border-white/10 animate-pulse">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full animate-ping" />
                  AI...
                </div>
              )}
            </div>

            {/* ✅ Download Button (สไตล์ใหม่) */}
            <button 
                onClick={(e) => handleDownload(e, photo)}
                className="absolute z-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white transition-all duration-300
                
                /* Mobile Styles */
                opacity-100 p-2.5 bottom-2 right-2 shadow-lg active:scale-90
                
                /* Desktop Styles */
                lg:opacity-0 lg:group-hover:opacity-100 lg:p-2 lg:bottom-3 lg:right-3 lg:translate-y-4 lg:group-hover:translate-y-0"
                title="Download"
            >
                <Download className="w-5 h-5 lg:w-4 lg:h-4" />
            </button>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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