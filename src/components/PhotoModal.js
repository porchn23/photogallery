import { X, Camera, Clock, Download, User, Phone } from 'lucide-react'; // ✅ เพิ่ม Icon Phone

export default function PhotoModal({ photo, onClose }) {
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
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div
        className="bg-[#f8f8f0] p-3 md:p-4 rounded shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-3xl w-full mx-auto relative transform transition-all scale-100"
        onClick={e => e.stopPropagation()}
        style={{ backgroundImage: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAJfv379zwjjgzj//v37zwiSAxJASoA4ZAAVnQ45U8H67QAAAABJRU5ErkJggg==")' }}
      >
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 md:-top-5 md:-right-5 bg-white text-black p-1.5 rounded-full shadow-lg hover:bg-zinc-200 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* รูปภาพ */}
        <div className="bg-white p-1 shadow-sm">
          <img src={photo.url_raw} alt="Full Size" className="w-full h-auto max-h-[70vh] object-contain" />
        </div>

        {/* รายละเอียด */}
        <div className="mt-3 md:mt-4 flex justify-between items-end text-zinc-800 font-serif">
          <div>
            <div className="flex items-center gap-1.5 text-zinc-600 mb-2">
              <Camera size={14} />
              <span className="text-xs uppercase tracking-wider font-bold">Original Photo</span>
            </div>
            
            {/* ✅ ส่วนแสดงเครดิต (ชื่อ + เบอร์) */}
            <div className="mb-3 pl-0.5 border-l-2 border-yellow-400 pl-2">
                <div className="flex items-center gap-1.5 text-zinc-800">
                    <User size={14} className="text-zinc-500" />
                    <span className="text-sm font-bold italic">{photo.credit?.name}</span>
                </div>
                {/* ถ้ามีเบอร์โทร ให้โชว์ด้วย */}
                {photo.credit?.phone && (
                    <div className="flex items-center gap-1.5 text-zinc-500 mt-0.5">
                        <Phone size={12} />
                        <span className="text-xs font-mono">{photo.credit.phone}</span>
                    </div>
                )}
            </div>

            {/* วันที่เวลา */}
            {photo.taken_at && (() => {
              const { date, time } = formatDateTimeFull(photo.taken_at);
              return (
                <div>
                  <p className="text-sm md:text-base font-medium leading-tight">{date}</p>
                  <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5">
                    <Clock size={10} />
                    <span>{time}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* ปุ่มดาวน์โหลด */}
          <a
            href={photo.url_raw}
            download
            target="_blank"
            className="flex items-center gap-1 bg-zinc-800 text-[#f8f8f0] px-3 py-1.5 md:px-4 md:py-2 rounded-sm text-xs md:text-sm font-bold shadow-md hover:bg-zinc-700 transition-all active:translate-y-0.5"
          >
            <Download size={14} />
            DOWNLOAD
          </a>
        </div>
      </div>
    </div>
  );
}