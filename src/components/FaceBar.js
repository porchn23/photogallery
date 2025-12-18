import { Camera, X, Image as ImageIcon, Calendar } from 'lucide-react';

export default function FaceBar({ clusters, photos, selectedClusterId, onSelectCluster, eventInfo }) {
  
  // ฟอร์แมตวันที่
  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div className="sticky top-[60px] z-40">
      
      {/* --- Face Bar --- */}
      <div className="bg-black/95 backdrop-blur-md border-b border-zinc-800 py-4 shadow-xl relative z-20">
        <div className="flex overflow-x-auto gap-5 px-4 pb-2 scrollbar-hide items-start">
          
          {/* ปุ่ม ALL */}
          <div
            onClick={() => onSelectCluster(null)}
            className={`flex-shrink-0 flex flex-col items-center cursor-pointer transition-all ${selectedClusterId === null ? 'scale-110 opacity-100' : 'opacity-60 scale-95'}`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 mb-1 ${selectedClusterId === null ? 'border-yellow-400 bg-zinc-800' : 'border-zinc-700 bg-zinc-900'}`}>
              <Camera size={24} className={selectedClusterId === null ? "text-yellow-400" : "text-zinc-400"} />
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${selectedClusterId === null ? 'bg-yellow-400 text-black' : 'text-zinc-500'}`}>
              ALL
            </span>
          </div>

          {/* Loop ใบหน้า */}
          {clusters.map((cluster) => {
            const count = photos.filter(p => p.cluster_id === cluster.id).length;
            return (
              <div
                key={cluster.id}
                onClick={() => onSelectCluster(cluster.id)}
                className={`flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-300 ${selectedClusterId === cluster.id ? 'scale-110 opacity-100' : 'opacity-70 hover:opacity-100 scale-95'}`}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 mb-1 relative ${selectedClusterId === cluster.id ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'border-zinc-700'}`}>
                  {cluster.photos?.url_thumb ? (
                    /* 🔥 ZOOM TRICK: scale-[2.0] ซูม 200% และ object-[center_20%] เลื่อนจุดโฟกัสไปข้างบน เพื่อให้เห็นหน้าชัดๆ */
                    <img
                      src={cluster.photos.url_thumb}
                      className="w-full h-full object-cover transform scale-[2.0] object-[center_25%]"
                      alt="Face"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800" />
                  )}
                </div>
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md transition-colors duration-300 ${selectedClusterId === cluster.id ? 'bg-yellow-400 text-black' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>
                  <ImageIcon size={10} />
                  <span>{count}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ปุ่ม Clear Filter */}
        {selectedClusterId && (
          <div className="absolute bottom-2 right-2 animate-in slide-in-from-bottom-2 fade-in">
            <button
              onClick={() => onSelectCluster(null)}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded-full text-[10px] font-bold text-white shadow-lg flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* --- The Notch (ติ่งชื่องาน) --- */}
      <div className="flex justify-center -mt-[1px] relative z-10 pointer-events-none">
        <div className="bg-zinc-800/95 backdrop-blur border-b border-x border-zinc-700 rounded-b-[24px] px-8 py-2.5 shadow-xl flex flex-col items-center pointer-events-auto min-w-[280px] md:min-w-[400px] max-w-[90%] transition-all">
          <h2 className="text-yellow-400 text-sm md:text-base font-bold tracking-wide leading-tight text-center mb-1 drop-shadow-sm">
            {eventInfo.title}
          </h2>
          <div className="flex items-center gap-2 text-[11px] md:text-xs text-zinc-400 font-medium">
            <Calendar size={12} />
            <span className="tracking-wide">
              {formatDate(eventInfo.start)}
              {eventInfo.end ? ` - ${formatDate(eventInfo.end)}` : ''}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}