import { Camera, RefreshCw } from 'lucide-react';

export default function PhotoGrid({ photos, loading, selectedClusterId, onPhotoClick }) {
  // กรองรูป
  const displayedPhotos = selectedClusterId
    ? photos.filter(p => p.cluster_id === selectedClusterId)
    : photos;

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-60 text-zinc-500 gap-4 pt-10">
        <RefreshCw className="animate-spin text-yellow-400" size={32} />
        <p className="text-xs animate-pulse">กำลังโหลดรูปภาพ...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-2 min-h-[50vh] pt-6 pb-20">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5">
        {displayedPhotos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="relative aspect-[2/3] group overflow-hidden bg-zinc-900 rounded-md shadow-sm cursor-zoom-in active:scale-95 transition-transform"
          >
            <img
              src={photo.url_thumb}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {displayedPhotos.length === 0 && (
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