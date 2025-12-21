'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  X, 
  QrCode, 
  Loader2, 
  ShieldCheck 
} from 'lucide-react';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [step, setStep] = useState(1); // 1: Select Amount, 2: Show QR/Processing

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const [userRes, transRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', authUser.id).single(),
          supabase.from('wallet_transactions')
            .select('*')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
        ]);
        setUser(userRes.data);
        setTransactions(transRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleTopUpRequest = async () => {
    try {
      setLoading(true);
      setStep(2); // เปลี่ยนไปหน้าแสดง QR / Loading

      // เรียก API ของเราที่สร้างไว้ใน src/app/api/checkout/route.ts
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          userId: user.id
        }),
      });

      const data = await response.json();

      if (data.qr_code) {
        setQrImage(data.qr_code); // เอารูป QR จริงจาก Omise มาใส่
      } else {
        throw new Error(data.error || 'ไม่สามารถสร้าง QR Code ได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsTopUpOpen(false);
    setStep(1);
    setSelectedAmount(null);
    setQrImage(null);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] font-sans">
      <Header balance={user?.wallet_balance} user={user} />
      
      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* --- Balance Card --- */}
        <div className="bg-zinc-950 dark:bg-white rounded-[3rem] p-10 md:p-14 text-white dark:text-black shadow-2xl mb-12 relative overflow-hidden group border border-white/10 dark:border-black/5">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Total Balance</p>
              <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-2">
                ฿{user?.wallet_balance?.toLocaleString() || '0'}
              </h2>
              <div className="flex items-center gap-2 text-green-500 font-bold text-xs justify-center md:justify-start">
                <ShieldCheck size={14} /> System Secured
              </div>
            </div>
            <button 
              onClick={() => setIsTopUpOpen(true)}
              className="px-10 py-5 bg-blue-600 text-white font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3 uppercase text-xs tracking-widest"
            >
              <Plus size={20} strokeWidth={3} /> Top Up
            </button>
          </div>
          <Wallet className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 dark:text-black/5 rotate-12" />
        </div>

        {/* --- Activity History --- */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100">Activity</h3>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800 mx-6" />
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map((t) => (
              <div key={t.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
                    {t.amount > 0 ? <ArrowDownLeft size={28} /> : <ArrowUpRight size={28} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg tracking-tight">{t.description}</h4>
                    <p className="text-xs text-zinc-400 font-medium">
                      {new Date(t.created_at).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
                <div className={`text-xl font-black ${t.amount > 0 ? 'text-green-600' : 'text-zinc-900 dark:text-white'}`}>
                  {t.amount > 0 ? `+฿${t.amount.toLocaleString()}` : `-฿${Math.abs(t.amount).toLocaleString()}`}
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium italic">
                No activity yet.
              </div>
            )}
          </div>
        </section>

        {/* --- Top Up Modal --- */}
        {isTopUpOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[3.5rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800 relative overflow-hidden">
              <button onClick={closeModal} className="absolute top-8 right-8 text-zinc-400 hover:text-black"><X size={24} /></button>
              
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-bold mb-2 tracking-tight">Add Funds</h2>
                  <p className="text-zinc-500 text-sm mb-10 font-medium italic">เลือกจำนวนเงินที่ต้องการเติม</p>
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    {[100, 300, 500, 1000].map((amount) => (
                      <button 
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`p-8 border-2 rounded-[2.5rem] transition-all group text-left ${selectedAmount === amount ? 'bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-zinc-50 dark:bg-zinc-800 border-transparent hover:border-blue-600'}`}
                      >
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${selectedAmount === amount ? 'text-blue-100' : 'text-zinc-400'}`}>THB</p>
                        <p className="text-3xl font-black tracking-tighter">{amount.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                  <button 
                    disabled={!selectedAmount || loading}
                    onClick={handleTopUpRequest}
                    className="w-full py-5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black font-black rounded-3xl shadow-xl uppercase text-[10px] tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Get QR Code'}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="text-center animate-in zoom-in duration-300">
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-2">PromptPay</h2>
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em]">฿{selectedAmount?.toLocaleString()} • Pay to ROOPLIFE</p>
                  </div>
                  
                  <div className="aspect-square bg-white p-6 rounded-[2.5rem] mb-8 border-4 border-zinc-100 dark:border-zinc-800 shadow-inner flex items-center justify-center">
                    {qrImage ? (
                      <img src={qrImage} alt="Omise QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="animate-spin text-blue-600" size={40} />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Generating QR...</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-xs uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Waiting for payment
                    </div>
                    <p className="text-zinc-400 text-[10px] italic">
                      ยอดเงินจะอัปเดตอัตโนมัติเมื่อโอนสำเร็จ
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}