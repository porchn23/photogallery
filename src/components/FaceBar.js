'use client';
import { Camera, ImageIcon, Calendar } from 'lucide-react';

/**
 * AI FACE-GRID: FACE BAR COMPONENT
 * Version: 3.9 (Photo Count & Dynamic Labels)
 * แบรนด์: WSWSS
 */

export default function FaceBar({ clusters, selectedClusterId, onSelectCluster, eventInfo }) {
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' });
  };

  return (
    <div className="sticky top-[60px] z-40">
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
              {selectedClusterId === null ? 'VIEWING' : 'ALL'}
            </span>
          </div>

          {/* วงกลมใบหน้าคน */}
          {clusters.map((face) => {
            const padding = 0.5; 
            const zoomWidth = face.box ? face.box.Width + (face.box.Width * padding * 2) : 1;
            const zoomHeight = face.box ? face.box.Height + (face.box.Height * padding * 2) : 1;
            const offsetX = face.box ? face.box.Left - (face.box.Width * padding) : 0;
            const offsetY = face.box ? face.box.Top - (face.box.Height * padding) : 0;

            const isSelected = selectedClusterId === face.id;

            return (
              <div
                key={face.id}
                onClick={() => onSelectCluster(face.id)}
                className={`flex-shrink-0 flex flex-col items-center cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 opacity-100' : 'opacity-70 scale-95'}`}
              >
                <div className={`w-16 h-16 rounded-full overflow-hidden border-2 mb-1 relative bg-zinc-900 ${isSelected ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'border-zinc-700'}`}>
                  {face.url && face.box ? (
                    <img
                      src={face.url}
                      className="absolute max-w-none transition-opacity duration-300"
                      style={{
                        width: `${100 / zoomWidth}%`,
                        height: `${100 / zoomHeight}%`,
                        top: `${-offsetY * (100 / zoomHeight)}%`,
                        left: `${-offsetX * (100 / zoomWidth)}%`,
                        imageRendering: 'smooth' 
                      }}
                      alt="Face"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                      <ImageIcon size={20} className="text-zinc-600" />
                    </div>
                  )}
                </div>
                
                {/* 🔥 ข้อความใต้ใบหน้า: แสดงจำนวนรูป หรือ VIEWING */}
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight transition-all ${isSelected ? 'bg-yellow-400 text-black scale-105' : 'bg-zinc-800 text-zinc-400'}`}>
                  {isSelected ? (
                    'VIEWING'
                  ) : (
                    `${face.count || 0} PHOTOS`
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* ... (The Notch คงเดิม) */}
    </div>
  );
}