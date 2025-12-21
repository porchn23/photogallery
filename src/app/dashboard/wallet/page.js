'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import Header from '@/src/components/Header';
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, CreditCard } from 'lucide-react';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  async function fetchWalletData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    let targetId = authUser?.id;

    if (!targetId) {
      const { data: firstUser } = await supabase.from('users').select('id').limit(1).single();
      targetId = firstUser?.id;
    }

    if (targetId) {
      const [userRes, transRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', targetId).single(),
        supabase.from('wallet_transactions').select('*').eq('user_id', targetId).order('created_at', { ascending: false })
      ]);
      setUser(userRes.data);
      setTransactions(transRes.data || []);
    }
    setLoading(false);
  }

  const handleMockTopUp = async (amount) => {
    try {
      await supabase.from('users').update({ wallet_balance: (user.wallet_balance || 0) + amount }).eq('id', user.id);
      await supabase.from('wallet_transactions').insert({
        user_id: user.id,
        amount: amount,
        type: 'topup',
        description: `เติมเงินผ่านระบบ PromptPay (Mockup)`
      });
      alert(`เติมเงินสำเร็จ ฿${amount.toLocaleString()}`);
      setIsTopUpOpen(false);
      fetchWalletData();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Header balance={user?.wallet_balance} user={user} />
      
      <main className="max-w-4xl mx-auto p-6 md:p-10">
        {/* --- Card: Current Balance --- */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-[0.2em] mb-2">Available Balance</p>
              <h2 className="text-6xl font-black tracking-tighter">฿{user?.wallet_balance?.toLocaleString()}</h2>
            </div>
            <button 
              onClick={() => setIsTopUpOpen(true)}
              className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-3"
            >
              <Plus size={20} strokeWidth={3} /> Top Up Money
            </button>
          </div>
          <Wallet className="absolute -right-10 -bottom-10 w-64 h-64 text-white/10 rotate-12" />
        </div>

        {/* --- Section: Transactions --- */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <h3 className="text-2xl font-black tracking-tight">Transaction History</h3>
            <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-black uppercase text-zinc-400">Recent</span>
          </div>

          <div className="space-y-3">
            {transactions.length > 0 ? transactions.map((t) => (
              <div key={t.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.amount > 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                    {t.amount > 0 ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{t.description}</h4>
                    <p className="text-xs text-zinc-400 font-medium">{new Date(t.created_at).toLocaleString('th-TH')}</p>
                  </div>
                </div>
                <div className={`text-lg font-black ${t.amount > 0 ? 'text-green-600' : 'text-zinc-900 dark:text-white'}`}>
                  {t.amount > 0 ? `+฿${t.amount.toLocaleString()}` : `-฿${Math.abs(t.amount).toLocaleString()}`}
                </div>
              </div>
            )) : (
              <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-[2.5rem] border-2 border-dashed border-zinc-100 dark:border-zinc-800 text-zinc-400">
                ยังไม่มีประวัติการใช้จ่าย
              </div>
            )}
          </div>
        </section>

        {/* --- Modal: Top-up Selection --- */}
        {isTopUpOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-zinc-100 dark:border-zinc-800">
              <h2 className="text-3xl font-black mb-2 tracking-tight">Top Up Wallet</h2>
              <p className="text-zinc-500 text-sm mb-10 leading-relaxed font-medium">เลือกจำนวนเงินที่ต้องการเติมเข้าสู่ระบบ (Mockup)</p>
              
              <div className="grid grid-cols-2 gap-4 mb-10">
                {[100, 300, 500, 1000].map((amount) => (
                  <button 
                    key={amount}
                    onClick={() => handleMockTopUp(amount)}
                    className="p-6 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent hover:border-blue-600 rounded-3xl transition-all group"
                  >
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-blue-600">THB</p>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white group-hover:text-blue-600">{amount.toLocaleString()}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-10 border border-blue-100 dark:border-blue-800">
                <CreditCard className="text-blue-600" />
                <p className="text-[10px] font-bold text-blue-600 leading-tight uppercase">ระบบจะจำลองการรับชำระผ่าน PromptPay และอัปเดตยอดเงินทันที</p>
              </div>

              <button 
                onClick={() => setIsTopUpOpen(false)} 
                className="w-full py-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-black uppercase tracking-[0.3em] text-[10px]"
              >
                Cancel Process
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}