import { X, Camera, Clock, Download, Briefcase, Phone } from 'lucide-react';

/**
 * AI FACE-GRID: PHOTO MODAL COMPONENT
 * Version: 5.4 (Restore Modal Content - Full Code)
 * แบรนด์: WSWSS
 */

export default function PhotoModal({ photo, onClose, eventOwner }) {
  if (!photo) return null;

  const formatDateTimeFull = (dateString) => {
    if (!dateString) return { date: '', time: '' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
    };
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#f8f8f0] p-3 md:p-4 rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-3xl w-full mx-auto relative"
        onClick={e => e.stopPropagation()}
        style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAJfv379zwjjgzj//v37zwiSAxJASoA4ZAAVnQ45U8H67QAAAABJRU5ErkJggg==")' }}
      >
        <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black p-1.5 rounded-full shadow-lg z-10">
          <X size={20} />
        </button>

        <div className="bg-white p-1 shadow-sm overflow-hidden rounded-sm border border-zinc-200">
          <img src={photo.url_raw} alt="Full View" className="w-full h-auto max-h-[65vh] object-contain mx-auto" />
        </div>

        <div className="mt-4 flex flex-col md:flex-row justify-between gap-4 border-t border-zinc-200 pt-4 font-serif">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                  <Camera size={14} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Credit</p>
                  <p className="text-sm font-bold text-zinc-800 italic">{photo.credit?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <Briefcase size={14} />
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Event Owner</p>
                  <p className="text-sm font-bold text-zinc-700">{eventOwner}</p>
                </div>
              </div>
            </div>
            {photo.taken_at && (() => {
              const { date, time } = formatDateTimeFull(photo.taken_at);
              return (
                <div className="flex items-center gap-2 pl-1 border-l-2 border-amber-400 py-1 font-sans">
                  <Clock size={12} className="text-zinc-400" />
                  <p className="text-[11px] text-zinc-500">{date} • {time}</p>
                </div>
              );
            })()}
          </div>
          <a href={photo.url_raw} download target="_blank" className="self-center md:self-end flex items-center gap-2 bg-zinc-800 text-[#f8f8f0] px-6 py-3 rounded-sm text-xs font-bold shadow-md">
            <Download size={14} /> DOWNLOAD
          </a>
        </div>
      </div>
    </div>
  );
}