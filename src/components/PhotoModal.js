import { X, Camera, Clock, Download, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useCallback } from 'react';

export default function PhotoModal({ photo, allPhotos, onClose, onPhotoChange, eventOwner }) {
  if (!photo || !allPhotos) return null;

  const currentIndex = allPhotos.findIndex(p => p.id === photo.id);
  
  const handlePrev = useCallback((e) => {
    e?.stopPropagation();
    if (currentIndex > 0) {
      onPhotoChange(allPhotos[currentIndex - 1]);
    }
  }, [currentIndex, allPhotos, onPhotoChange]);

  const handleNext = useCallback((e) => {
    e?.stopPropagation();
    if (currentIndex < allPhotos.length - 1) {
      onPhotoChange(allPhotos[currentIndex + 1]);
    }
  }, [currentIndex, allPhotos, onPhotoChange]);

  // รองรับการกดปุ่มลูกศรที่คีย์บอร์ด
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-2 md:p-4" onClick={onClose}>
      
      {/* ปุ่มเลื่อนซ้าย */}
      {currentIndex > 0 && (
        <button onClick={handlePrev} className="absolute left-2 md:left-4 z-[120] text-white/50 hover:text-white transition-colors p-2">
          <ChevronLeft size={48} />
        </button>
      )}

      <div className="bg-[#f8f8f0] p-3 md:p-4 rounded shadow-2xl max-w-3xl w-full mx-auto relative scale-in-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black p-1.5 rounded-full shadow-lg z-10">
          <X size={20} />
        </button>

        <div className="bg-white p-1 shadow-sm overflow-hidden rounded-sm border border-zinc-200">
          <img src={photo.url_raw} alt="Full View" className="w-full h-auto max-h-[70vh] object-contain mx-auto transition-all" />
        </div>

        {/* ... (ส่วนแสดง Credit/Download คงเดิม) ... */}
      </div>

      {/* ปุ่มเลื่อนขวา */}
      {currentIndex < allPhotos.length - 1 && (
        <button onClick={handleNext} className="absolute right-2 md:right-4 z-[120] text-white/50 hover:text-white transition-colors p-2">
          <ChevronRight size={48} />
        </button>
      )}

      {/* ตัวเลขบอกลำดับ (เช่น 5 / 100) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-[10px] font-bold tracking-widest uppercase">
        {currentIndex + 1} / {allPhotos.length}
      </div>
    </div>
  );
}