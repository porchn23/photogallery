mport { X, Camera, Clock, Download, Briefcase, Loader2 } from 'lucide-react'; // ✅ ลบ ChevronLeft, ChevronRight
import { useEffect, useCallback, useState, useRef } from 'react';

export default function PhotoModal({ photo, allPhotos, onClose, onPhotoChange, eventOwner }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  // ระยะขั้นต่ำของการปัดที่ถือว่าเป็นการเปลี่ยนรูป (หน่วยเป็น Pixel)
  const minSwipeDistance = 50;

  // ... (formatDateTimeFull และ currentIndex คงเดิม) ...

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) onPhotoChange(allPhotos[currentIndex - 1]);
  }, [currentIndex, allPhotos, onPhotoChange]);

  const handleNext = useCallback(() => {
    if (currentIndex < allPhotos.length - 1) onPhotoChange(allPhotos[currentIndex + 1]);
  }, [currentIndex, allPhotos, onPhotoChange]);

  // --- LOGIC: SWIPE DETECTION ---
  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext(); // ปัดซ้าย ไปรูปถัดไป
    } else if (isRightSwipe) {
      handlePrev(); // ปัดขวา ไปรูปก่อนหน้า
    }
  };

  // 4. บรรทัด Early Return ต้องอยู่หลัง Hooks เสมอ ✅
  if (!photo || !allPhotos) return null;

  // --- LOGIC: DOWNLOAD (ฟังก์ชันปกติ ไม่ใช่ Hook วางไว้ตรงนี้ได้) ---
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsDownloading(true);
      const response = await fetch(photo.url_raw);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `photo-${photo.id.slice(0, 8)}.jpg`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      window.open(photo.url_raw, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      
      {/* Navigation Buttons (Desktop) */}
      {currentIndex > 0 && (
        <button onClick={handlePrev} className="absolute left-2 md:left-6 z-[120] text-white/40 hover:text-white p-2 transition-all">
          <ChevronLeft size={48} strokeWidth={2.5} />
        </button>
      )}
      {currentIndex < allPhotos.length - 1 && (
        <button onClick={handleNext} className="absolute right-2 md:right-6 z-[120] text-white/40 hover:text-white p-2 transition-all">
          <ChevronRight size={48} strokeWidth={2.5} />
        </button>
      )}

      <div 
        className="bg-[#f8f8f0] p-3 md:p-5 rounded-xl shadow-2xl max-w-3xl w-full mx-auto relative overflow-hidden" 
        onClick={e => e.stopPropagation()}
        style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAJfv379zwjjgzj//v37zwiSAxJASoA4ZAAVnQ45U8H67QAAAABJRU5ErkJggg==")' }}
      >
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 bg-black/5 text-black p-2 rounded-full hover:bg-black/10 z-10 transition-colors">
          <X size={20} />
        </button>

        {/* Photo Display */}
        <div className="bg-white p-1 shadow-inner rounded-lg border border-zinc-200">
          <img src={photo.url_raw} alt="Full View" className="w-full h-auto max-h-[60vh] object-contain mx-auto rounded" draggable="false" />
        </div>

        {/* Info Area */}
        <div className="mt-5 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-zinc-200/50 pt-5">
          <div className="flex-1 w-full space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 shadow-sm">
                  <Camera size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Credit</p>
                  <p className="text-sm font-bold text-zinc-800 italic">{photo.credit?.name || 'WSWSS'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Event Owner</p>
                  <p className="text-sm font-bold text-zinc-700">{eventOwner}</p>
                </div>
              </div>
            </div>

            {photo.taken_at && (() => {
              const { date, time } = formatDateTimeFull(photo.taken_at);
              return (
                <div className="flex items-center gap-2 pl-2 border-l-2 border-amber-400 py-1 font-sans">
                  <Clock size={14} className="text-zinc-400" />
                  <p className="text-[11px] text-zinc-500 font-medium">{date} • {time}</p>
                </div>
              );
            })()}
          </div>

          {/* Download Button */}
          <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className={`w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full font-bold text-sm shadow-xl transition-all active:scale-95 
              ${isDownloading ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-black hover:-translate-y-0.5'}`}
          >
            {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            {isDownloading ? 'PREPARING...' : 'SAVE TO DEVICE'}
          </button>
        </div>
      </div>

      {/* Counter (e.g. 5 / 100) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-md px-4 py-1.5 rounded-full text-white/60 text-[10px] font-bold tracking-[0.2em]">
        {currentIndex + 1} / {allPhotos.length}
      </div>
    </div>
  );
}