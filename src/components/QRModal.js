import QRCode from "react-qr-code";
import { XCircle } from 'lucide-react';

export default function QRModal({ show, onClose, url }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-zinc-400 hover:text-black">
          <XCircle size={24} />
        </button>
        <h3 className="text-black font-bold text-lg mb-4">สแกนเพื่อดูรูปในมือถือ</h3>
        <div className="bg-white p-2 border-2 border-black rounded-lg">
          {/* ใช้ url ที่รับมา */}
          <QRCode value={url || ""} size={200} />
        </div>
        {/* ✅ แก้ตรงนี้ครับ: เปลี่ยนจาก currentUrl เป็น url */}
        <p className="text-gray-500 text-xs mt-4 text-center break-all max-w-[200px]">{url}</p>
      </div>
    </div>
  );
}