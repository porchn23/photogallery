'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';

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
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-zinc-50 to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-black flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[440px]">
        {/* Main Login Card */}
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-10 md:p-14 rounded-[3.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white dark:border-zinc-800 text-center space-y-12">
          
          {/* Brand Identity */}
          <div className="space-y-6">
            <div className="relative w-24 h-24 mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white p-1.5 border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in duration-700">
              <Image 
                src="/rooplife-logo/android-chrome-192x192.png" 
                alt="ROOPLIFE Logo" 
                fill 
                className="object-contain p-1"
                priority 
              />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">
                ROOPLIFE
              </h1>
              <p className="text-xs font-bold text-zinc-400 tracking-[0.3em] uppercase">
                Command Center
              </p>
            </div>
          </div>

          {/* Login Actions */}
          <div className="space-y-4">
            <button 
              disabled={loading}
              onClick={handleGoogleLogin}
              className="group relative w-full py-4 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-semibold rounded-2xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300 shadow-sm active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin text-zinc-400" size={24} />
              ) : (
                <>
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-base tracking-tight">เข้าใช้งานด้วย Google</span>
                </>
              )}
            </button>
            
            {error && (
              <p className="text-red-500 text-xs font-medium animate-shake bg-red-50 dark:bg-red-900/10 py-2 rounded-lg">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Footer / Trust Signals */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-zinc-400">
              <ShieldCheck size={14} className="text-green-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Secure Cloud Authentication</span>
            </div>
            <p className="text-zinc-400 text-[9px] uppercase tracking-tighter leading-relaxed max-w-[200px]">
              Platform for Professional Photographers & Digital Asset Management
            </p>
          </div>
        </div>

        {/* Outer Trust Message */}
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-400 dark:text-zinc-600">
          <Lock size={12} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Protected by Supabase PKCE Flow</span>
        </div>
      </div>
    </div>
  );
}