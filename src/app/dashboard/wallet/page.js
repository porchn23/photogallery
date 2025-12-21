'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  X, 
  Loader2, 
  ShieldCheck, 
  Smartphone
} from 'lucide-react';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const [userRes, transRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', authUser.id).single(),
          supabase.from('wallet_transactions').select('*').eq('user_id', authUser.id).order('created_at', { ascending: false })
        ]);
        setUser(userRes.data);
        setTransactions(transRes.data || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  const handleAmountClick = async (amount) => {
    setSelectedAmount(amount);
    setStep(2);
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount, userId: user.id }),
      });
      const data = await response.json();
      if (response.ok && data.qr_code) {
        setQrImage(data.qr_code);
      } else {
        throw new Error(data.error || 'สร้างรายการไม่สำเร็จ');
      }
    } catch (err) {
      alert('Error: ' + err.message);
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] font-sans text-black dark:text-white">
      <Header balance={user?.wallet_balance} user={user} />
      
      <main className="max-w-4xl mx-auto p-6 md:p-12">
        {/* --- Card Balance --- */}
        <div className="bg-zinc-950 dark:bg-white rounded-[2.5rem] p-10 text-white dark:text-black shadow-2xl mb-12 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">ยอดเงินคงเหลือ</p>
              <h2 className="text-6xl font-black tracking-tighter mb-2">฿{user?.wallet_balance?.toLocaleString() || '0'}</h2>
              <div className="flex items-center gap-2 text-green-500 font-bold text-xs"><ShieldCheck size={14} /> System Secured</div>
            </div>
            {/* เปลี่ยนเป็นคำว่า เติมเงิน */}
            <button onClick={() => setIsTopUpOpen(true)} className="px-12 py-5 bg-blue-600 text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 uppercase text-xs tracking-widest">
              <Plus size={20} strokeWidth={4} /> เติมเงิน
            </button>
          </div>
          <Wallet className="absolute -right-12 -bottom-12 w-64 h-64 text-white/5 dark:text-black/5 rotate-12" />
        </div>

        {/* --- History --- */}
        <section>
          <div className="flex items-center justify-between mb-8 text-zinc-900 dark:text-zinc-100">
            <h3 className="text-2xl font-medium tracking-tight">ประวัติรายการ</h3>
            <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-800 mx-6" />
          </div>
          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map((t) => (
              <div key={t.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
                    {t.amount > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg tracking-tight">{t.description}</h4>
                    <p className="text-xs text-zinc-400 font-medium">{new Date(t.created_at).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })}</p>
                  </div>
                </div>
                <div className={`text-xl font-black ${t.amount > 0 ? 'text-green-600' : 'text-zinc-900 dark:text-white'}`}>{t.amount > 0 ? `+฿${t.amount.toLocaleString()}` : `-฿${Math.abs(t.amount).toLocaleString()}`}</div>
              </div>
            )) : (
              <div className="text-center py-20 bg-zinc-100/50 dark:bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium italic">ไม่พบรายการล่าสุด</div>
            )}
          </div>
        </section>

        {/* --- Small & Powerful QR Modal --- */}
        {isTopUpOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-[340px] rounded-[2.5rem] p-6 shadow-2xl border border-white/20 dark:border-zinc-800 relative animate-in zoom-in-95 duration-300">
              <button onClick={closeModal} className="absolute top-6 right-6 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors z-10"><X size={20} /></button>
              
              {step === 1 ? (
                <div className="py-4 text-center">
                  <h2 className="text-2xl font-bold mb-1 tracking-tight">เติมเงิน</h2>
                  <p className="text-zinc-400 text-[11px] mb-6 font-medium italic uppercase tracking-wider">เลือกจำนวนเงินที่ต้องการ</p>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[100, 300, 500, 1000].map((amount) => (
                      <button 
                        key={amount} 
                        onClick={() => handleAmountClick(amount)} 
                        className="py-6 rounded-3xl border-2 border-zinc-50 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-zinc-950 dark:hover:border-white transition-all text-center active:scale-[0.96]"
                      >
                        <p className="text-xl font-black tracking-tighter">฿{amount.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-center mb-4 pt-4">
                    {/* แสดงยอดเงินให้ชัดเจนขึ้นมาก */}
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">ยอดชำระสุทธิ</p>
                    <h2 className="text-5xl font-black tracking-tighter text-blue-600 dark:text-blue-400 mb-4">฿{selectedAmount?.toLocaleString()}</h2>
                  </div>
                  
                  {/* QR Area */}
                  <div className="bg-white p-3 rounded-[2rem] shadow-inner border border-zinc-50 mb-6 aspect-square flex items-center justify-center relative overflow-hidden group">
                    {qrImage ? (
                      <img src={qrImage} alt="QR Code" className="w-full h-full object-contain scale-105" />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="animate-spin text-blue-600" size={24} />
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">กำลังสร้าง QR...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/10 py-3 px-4 rounded-xl border border-green-100 dark:border-green-900/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-500 uppercase tracking-widest">สแกนจ่ายเพื่อเติมเงิน</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Smartphone size={12} />
                        <span className="text-[9px] font-medium leading-none uppercase tracking-tighter italic text-center">เปิดแอปธนาคารของคุณ <br/> เพื่อสแกนรหัสนี้</span>
                      </div>
                      <button onClick={() => setStep(1)} className="text-[9px] font-black text-zinc-300 hover:text-zinc-900 dark:hover:text-white uppercase tracking-[0.3em] transition-colors border-t border-zinc-50 dark:border-zinc-800 w-full pt-4">เปลี่ยนจำนวนเงิน</button>
                    </div>
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