'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) router.push('/dashboard');
    };
    checkUser();
  }, [router]);

  const handleGoogleLogin = async () => {
    // ดึง origin ของโดเมนจริง
    const getURL = () => {
      let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ?? // ตั้งค่าใน env เมื่อขึ้น prod
        process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // กรณีใช้ Vercel
        'http://localhost:3000/'
      // ใส่ https:// ถ้ายังไม่มี
      url = url.includes('http') ? url : `https://${url}`
      // ตัด / ตัวสุดท้ายออกถ้ามี
      url = url.charAt(url.length - 1) === '/' ? url : `${url}/`
      return url
    }
  
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getURL()}auth/callback`,
      },
    });
  };

  
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-12 bg-white dark:bg-zinc-900 p-12 rounded-[4rem] shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-100 dark:border-zinc-800 text-center">
        
        <div className="space-y-6">
          <div className="relative w-28 h-28 mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-200 dark:shadow-none bg-white p-2 border border-zinc-50 dark:border-zinc-800">
            <Image 
              src="/rooplife-logo/android-chrome-192x192.png"
              alt="ROOPLIFE Logo"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-medium tracking-tighter text-zinc-900 dark:text-white">ROOPLIFE</h1>
            <p className="text-zinc-400 text-[11px] font-semibold uppercase tracking-[0.3em]">Command Center</p>
          </div>
        </div>

        <div className="space-y-6">
          <button 
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold rounded-3xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                {/* SVG ไอคอน Google แบบ 4 สี */}
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-base tracking-tight">Continue with Google</span>
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
              <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest leading-none">
                ⚠️ Login Error
              </p>
              <p className="text-red-400 text-xs mt-2 font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-zinc-50 dark:border-zinc-800">
          <p className="text-zinc-300 dark:text-zinc-600 text-[9px] uppercase tracking-[0.4em] font-bold">
            Secure Authentication
          </p>
        </div>

      </div>
      <p className="mt-12 text-zinc-400 text-[10px] uppercase tracking-[0.25em] font-medium">
        © 2025 ROOPLIFE. TECHNOLOGY
      </p>
    </div>
  );
}