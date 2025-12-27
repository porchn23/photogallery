import { QrCode, Wallet, LogOut, User, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/src/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

export default function Header({ onQRClick, balance, user }) {
  const router = useRouter();
  const pathname = usePathname();

  // เช็คว่าเป็นหน้า dashboard หรือไม่
  const isDashboard = pathname?.startsWith('/dashboard');

  const handleLogout = async () => {
    if (confirm('ยืนยันออกจากระบบ?')) {
      await supabase.auth.signOut();
      router.push('/login');
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-all duration-300 ${
      isDashboard 
        ? "bg-white/80 dark:bg-black/80 border-zinc-200/50 dark:border-zinc-800/50" 
        : "bg-black border-zinc-800/50"
    }`}>
      <div className="px-4 md:px-6 h-18 md:h-24 flex items-center justify-between">
        {/* Logo & App Name Section */}
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
            <h1 className={`text-base md:text-xl font-black tracking-tight leading-none ${
              isDashboard ? "text-zinc-900 dark:text-zinc-100" : "text-white"
            }`}>
              ROOPLIFE
            </h1>
            <p className="text-[9px] md:text-[11px] font-bold text-zinc-400 tracking-[0.25em] md:tracking-[0.4em] mt-1.5 uppercase leading-none">
              Command Center
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* ส่วน Account และ Wallet: แสดงเฉพาะเมื่ออยู่ในหน้า Dashboard เท่านั้น */}
          {isDashboard && (
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-1.5 md:p-2 rounded-[1.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm">
              {/* Wallet Section */}
              {balance !== undefined && (
                <Link href="/dashboard/wallet" className="flex items-center gap-2 px-3 py-1.5 hover:bg-white dark:hover:bg-zinc-800 rounded-xl transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-700">
                  <div className="text-right hidden xs:block">
                    <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Balance</p>
                    <p className="text-xs md:text-sm font-black text-green-600 dark:text-green-500 leading-none">
                      ฿{balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center text-green-600">
                    <Wallet size={16} />
                  </div>
                </Link>
              )}

              <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

              {/* Profile Section */}
              <div className="flex items-center gap-2 px-2">
                <div className="text-right hidden sm:block">
                  <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Account</p>
                  <p className="text-xs font-bold truncate max-w-[80px] text-zinc-900 dark:text-zinc-100">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </p>
                </div>
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-cover" 
                      alt="avatar" 
                    />
                  ) : (
                    <User size={16} className="text-zinc-400" />
                  )}
                </div>
                <Link 
  href="/dashboard/guide"
  className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg transition-all"
  title="คู่มือการใช้งาน"
>
  <HelpCircle size={16} />
</Link>                <button 
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}

          {/* QR Button: ปรับสีตามความเหมาะสมของพื้นหลัง */}
          {onQRClick && (
            <button
              onClick={onQRClick}
              className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full transition-all ${
                isDashboard 
                  ? "bg-zinc-100 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                  : "bg-zinc-900/50 hover:bg-zinc-800 text-white/80 border border-zinc-800"
              }`}
            >
              <QrCode size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}