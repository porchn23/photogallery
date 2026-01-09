'use client';
import { X, Camera, Clock, Download, Briefcase, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useCallback, useState, useRef } from 'react';

/**
 * AI FACE-GRID: PHOTO MODAL COMPONENT
 * Version: 5.9 (Realtime Sync & Fast Path Support)
 * แบรนด์: Rooplife
 */

export default function PhotoModal({ photo, allPhotos, onClose, onPhotoChange, eventOwner }) {
  // ✅ ค้นหาข้อมูลล่าสุดจาก list ทั้งหมด เพื่อให้ Modal อัปเดตตามสัญญาณ Realtime ที่ส่งมาจากหน้าหลัก
  const currentPhotoData = allPhotos?.find(p => p.id === photo?.id) || photo;
  
  const [isDownloading, setIsDownloading] = useState(false);
  
  // ใช้สำหรับตรวจจับการปัด (Swipe) เพื่อเปลี่ยนรูป
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const minSwipeDistance = 50;

  const formatDateTimeFull = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    };
  };

  const currentIndex = (allPhotos && currentPhotoData) ? allPhotos.findIndex(p => p.id === currentPhotoData.id) : -1;

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) onPhotoChange(allPhotos[currentIndex - 1]);
  }, [currentIndex, allPhotos, onPhotoChange]);

  const handleNext = useCallback(() => {
    if (currentIndex !== -1 && currentIndex < allPhotos.length - 1) {
      onPhotoChange(allPhotos[currentIndex + 1]);
    }
  }, [currentIndex, allPhotos, onPhotoChange]);

  // --- SWIPE LOGIC ---
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) < minSwipeDistance) return;
    
    if (distance > minSwipeDistance) {
      handleNext(); 
    } else {
      handlePrev();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, onClose]);

  if (!currentPhotoData || !allPhotos) return null;

  // ✅ แก้ไขฟังก์ชัน Download ให้เรียก API พร้อม Cache Busting
  const handleDownload = (e) => {
    e.stopPropagation();
    if (!currentPhotoData) return;

    const filename = `rooplife-${currentPhotoData.id}.jpg`;
    
    // สร้าง Version Tag จากข้อมูลล่าสุด
    const version = new Date(currentPhotoData.updated_at || currentPhotoData.created_at).getTime();
    const finalUrl = `${currentPhotoData.url_raw}${currentPhotoData.url_raw.includes('?') ? '&' : '?'}v=${version}`;
    
    // เรียก API Proxy เพื่อเลี่ยง CORS และปัญหา Private File
    const downloadUrl = `/api/download?url=${encodeURIComponent(finalUrl)}&filename=${encodeURIComponent(filename)}`;
    
    // สร้าง Link ชั่วคราว
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div 
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 md:p-4 touch-none" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="bg-[#f8f8f0] p-3 md:p-5 rounded-xl shadow-2xl max-w-3xl w-full mx-auto relative overflow-hidden select-none" 
        onClick={e => e.stopPropagation()}
        style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAJfv379zwjjgzj//v37zwiSAxJASoA4ZAAVnQ45U8H67QAAAABJRU5ErkJggg==")' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 bg-black/5 text-black p-2 rounded-full z-20">
          <X size={20} />
        </button>

        <div className="bg-white p-1 shadow-inner rounded-lg border border-zinc-200 relative">
          {/* ✅ รูปภาพหลัก: ใช้ currentPhotoData และ Cache Busting */}
          <img 
            src={`${currentPhotoData.url_raw}${currentPhotoData.url_raw.includes('?') ? '&' : '?'}v=${new Date(currentPhotoData.updated_at || currentPhotoData.created_at).getTime()}`} 
            alt="Full View" 
            className="w-full h-auto max-h-[60vh] object-contain mx-auto rounded" 
            draggable="false" 
          />
          
          {/* ✅ AI Beauty Status Badge: ใช้ currentPhotoData เพื่อให้เปลี่ยนสถานะแบบ Realtime */}
          {(currentPhotoData.ai_beauty_status === 'completed' || currentPhotoData.ai_beauty) ? (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-pink-500/90 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/20 animate-in fade-in zoom-in duration-300">
              <Sparkles size={12} fill="currentColor" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">AI Beauty Active</span>
            </div>
          ) : (currentPhotoData.ai_beauty_status === 'pending' || currentPhotoData.ai_beauty_status === 'processing') && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/20 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">AI Enhancing...</span>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-zinc-200/50 pt-5">
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* ส่วนแสดงชื่อช่างภาพ */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shadow-sm border border-zinc-200">
                  <Camera size={16} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold leading-tight">Photographer</p>
                  <p className="text-sm font-bold text-zinc-900 italic leading-tight">
                    {currentPhotoData.credit?.name || 'Rooplife'}
                  </p>
                </div>
              </div>
              
              {/* ส่วนแสดงชื่อเจ้าของงาน */}
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold leading-tight">Project Owner</p>
                  <p className="text-sm font-bold text-zinc-700 leading-tight">{eventOwner}</p>
                </div>
              </div>
            </div>

            {/* ส่วนแสดงวันเวลาที่ถ่าย */}
            {currentPhotoData.taken_at && (() => {
              const { date, time } = formatDateTimeFull(currentPhotoData.taken_at);
              return (
                <div className="flex items-center gap-2 pl-2 border-l-2 border-amber-400 py-1 font-sans">
                  <Clock size={14} className="text-zinc-400" />
                  <p className="text-[11px] text-zinc-500 font-medium">{date} • {time}</p>
                </div>
              );
            })()}
          </div>

          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full font-bold text-sm shadow-xl transition-all active:scale-95 
              ${isDownloading ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-black'}`}
          >
            {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isDownloading ? 'PREPARING...' : 'SAVE TO DEVICE'}
          </button>
        </div>
      </div>

      {/* เลขลำดับรูปภาพด้านล่าง */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white/60 text-[10px] font-bold tracking-[0.2em]">
        {currentIndex + 1} / {allPhotos.length}
      </div>
    </div>
  );
}