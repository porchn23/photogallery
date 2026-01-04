// src/components/QRModal.js
import QRCode from "react-qr-code"; 
import { CircleX, Download, Image as ImageIcon } from 'lucide-react'; // เพิ่มไอคอนสื่อความหมาย

export default function QRModal({ show, onClose, url, title, joinCode }) {
  if (!show) return null;

  return (
    // มุมล่างขวา
    <div className="fixed bottom-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-md text-zinc-900 p-3 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.2)] border border-zinc-200 w-[200px] relative pointer-events-auto">
        
        {/* ปุ่มปิด */}
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 bg-zinc-900 text-white rounded-full p-1 shadow-md hover:scale-110 transition-transform z-10"
        >
          <CircleX size={16} />
        </button>

        <div className="text-center space-y-2">
          
          {/* Header Text */}
          <div className="flex items-center justify-center gap-1.5 text-zinc-500 pb-1">
            <ImageIcon size={10} />
            <span className="text-[9px] font-bold uppercase tracking-wider">View & Download</span>
            <Download size={10} />
          </div>

          {/* QR Code */}
          <div className="bg-white p-1.5 rounded-lg border border-zinc-100 shadow-inner flex justify-center">
             <QRCode value={url || ""} size={140} className="w-full h-auto" />
          </div>

          {joinCode && (
            <div className="pt-2 border-t border-zinc-100 flex flex-col items-center">
                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Event Code</p>
                <p className="text-base font-black tracking-[0.2em] text-blue-600 leading-none">{joinCode}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}