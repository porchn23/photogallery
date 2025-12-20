import { QrCode } from 'lucide-react';
import Image from 'next/image';

export default function Header({ onQRClick }) {
  return (
    <header className="px-4 py-3 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 flex items-center justify-between sticky top-0 z-50 h-[60px]">
      <div className="flex items-center gap-3">
        {/* ส่วนของโลโก้ที่เป็นรูปภาพ */}
        <div className="relative w-10 h-10">
          <Image 
            src="/rooplife-logo/android-chrome-192x192.png" // อย่าลืมนำไฟล์โลโก้ไปวางไว้ในโฟลเดอร์ public และเปลี่ยนชื่อให้ตรงกัน
            alt="ROOPLIFE Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* ชื่อแบรนด์และคำบรรยาย จัดเรียงแบบแนวตั้ง (Column) */}
        <div className="flex flex-col justify-center">
          <h1 className="text-base font-bold tracking-wider text-zinc-100 leading-none">
            ROOPLIFE
          </h1>
          <p className="text-[10px] font-medium text-zinc-500 tracking-[0.2em] mt-1">
            AI FACE GRID
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onQRClick}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 hover:text-white transition-colors"
          title="QR Code"
        >
          <QrCode size={18} />
        </button>
      </div>
    </header>
  );
}