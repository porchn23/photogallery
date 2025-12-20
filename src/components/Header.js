import { QrCode, Wallet } from 'lucide-react'; // เพิ่ม Wallet icon
import Image from 'next/image';
import Link from 'next/link';

export default function Header({ onQRClick, balance }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="px-4 md:px-6 h-18 md:h-24 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-4 md:gap-5 group">
          <div className="relative w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
            <Image 
              src="/rooplife-logo/android-chrome-192x192.png"
              alt="ROOPLIFE Logo"
              fill
              className="object-contain p-0.5 md:p-1"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base md:text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-none">
              ROOPLIFE
            </h1>
            <p className="text-[9px] md:text-[11px] font-bold text-zinc-400 tracking-[0.25em] md:tracking-[0.4em] mt-1.5 uppercase">
              Command Center
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3 md:gap-6">
          {/* ส่วนแสดง Wallet Balance ใหม่ใน Header */}
          {balance !== undefined && (
    <Link href="/dashboard/wallet" className="group/wallet flex items-center gap-2 md:gap-3 bg-zinc-100 dark:bg-zinc-800/50 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
    <div className="hidden sm:block text-right">
      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Balance</p>
      <p className="text-sm md:text-base font-black text-green-600 dark:text-green-500 leading-none">
        ฿{balance.toLocaleString()}
      </p>
    </div>
    <div className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center text-green-600 shadow-sm group-hover/wallet:scale-110 transition-transform">
      <Wallet size={16} className="md:w-5 md:h-5" />
    </div>
  </Link>
          )}

          {onQRClick && (
            <button
              onClick={onQRClick}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full text-zinc-600 dark:text-zinc-300 transition-all"
            >
              <QrCode size={20} className="md:w-6 md:h-6" strokeWidth={1.5} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}