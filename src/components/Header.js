import { QrCode, Menu } from 'lucide-react';

export default function Header({ onQRClick }) {
  return (
    <header className="px-4 py-3 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 flex items-center justify-between sticky top-0 z-50 h-[60px]">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-md flex items-center justify-center text-black font-black italic shadow-lg">
          FG
        </div>
        <h1 className="text-base font-bold tracking-wide text-zinc-100">AI FACE GRID</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onQRClick}
          className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 hover:text-white transition-colors"
          title="QR Code"
        >
          <QrCode size={18} />
        </button>
        <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-zinc-300 hover:text-white transition-colors">
          <Menu size={18} />
        </button>
      </div>
    </header>
  );
}