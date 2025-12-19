// src/components/QRModal.js
import QRCode from "react-qr-code"; 
import { CircleX } from 'lucide-react';
// ✅ รับ joinCode เพิ่มเข้ามา
export default function QRModal({ show, onClose, url, joinCode }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400 hover:text-black">
          <CircleX size={24} />
        </button>
        <h3 className="text-black font-bold text-lg mb-4">สแกนเพื่อดูรูปในมือถือ</h3>
        
        <div className="bg-white p-2 border-2 border-black rounded-lg mb-4">
          <QRCode value={url || ""} size={200} />
        </div>

        {/* ✅ แสดง Join Code สำหรับตากล้องคนอื่นๆ */}
        {joinCode && (
          <div className="flex flex-col items-center bg-emerald-50 px-6 py-4 rounded-2xl border-2 border-emerald-100 w-full shadow-sm">
            <span className="text-emerald-600/80 text-[10px] font-bold uppercase tracking-[0.1em] mb-1">
              Photographer Join Code
            </span>
            <span className="text-emerald-600 font-black text-3xl tracking-[0.15em] drop-shadow-sm">
              {joinCode}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}