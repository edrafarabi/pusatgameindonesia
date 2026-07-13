import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Shield, History, Store, ChevronRight, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Akun() {
  const navigate = useNavigate();
  const { user, logout, api } = useAuth();
  const [stats, setStats] = useState({ buyer: 0, seller: 0, reviews: 0 });
  const [balance, setBalance] = useState(0);
  const [, setInitLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [telegramInput, setTelegramInput] = useState('');
  const [settingsForm, setSettingsForm] = useState({ name: '', phone: '', telegram: '', whatsapp: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', method: 'DANA', account_number: '', account_name: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const load = async () => {
      try {
        const [s, b] = await Promise.all([api('/api/users/stats'), api('/api/auth/balance')]);
        setStats({ buyer: s.buyer_transactions || 0, seller: s.seller_transactions || 0, reviews: s.reviews || 0 });
        setBalance(b.balance || 0);
      } catch {} finally { setInitLoading(false); }
    };
    load();
  }, [user, navigate, api]);

  if (!user) return null;

  const isSeller = ['SELLER', 'ADMIN', 'SUPERADMIN'].includes(user.role);
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(user.role);

  const handleUpgrade = async () => {
    if (!telegramInput.trim() || telegramInput.trim().length < 3) return showToast('Telegram wajib diisi', 'error');
    try {
      const r = await api('/api/auth/upgrade-seller', { method: 'POST', body: JSON.stringify({ telegram: telegramInput.trim() }) });
      showToast('Berhasil jadi seller!');
      const session = JSON.parse(localStorage.getItem('pgi_session') || '{}');
      session.user = r.user;
      localStorage.setItem('pgi_session', JSON.stringify(session));
      window.location.reload();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const openSettings = () => {
    setSettingsForm({ name: user.name || '', phone: user.phone || '', telegram: user.telegram || '', whatsapp: user.whatsapp || '' });
    setShowSettings(true);
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api('/api/auth/profile', { method: 'PUT', body: JSON.stringify(settingsForm) });
      showToast('Profil diperbarui');
      const session = JSON.parse(localStorage.getItem('pgi_session') || '{}');
      session.user = { ...session.user, ...settingsForm };
      localStorage.setItem('pgi_session', JSON.stringify(session));
      setShowSettings(false);
      window.location.reload();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleWithdraw = async () => {
    const amt = parseInt(withdrawForm.amount);
    if (!amt || amt < 10000) return showToast('Minimal Rp 10.000', 'error');
    if (amt > balance) return showToast('Saldo tidak cukup', 'error');
    if (!withdrawForm.account_number || !withdrawForm.account_name) return showToast('Lengkapi data rekening', 'error');
    setSaving(true);
    try {
      await api('/api/auth/withdraw', { method: 'POST', body: JSON.stringify({ ...withdrawForm, amount: amt }) });
      showToast('Request penarikan dikirim');
      setShowWithdraw(false);
      const b = await api('/api/auth/balance');
      setBalance(b.balance || 0);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  };

  const fmt = n => Number(n).toLocaleString('id-ID');

  return (
    <div className="min-h-screen pb-24 bg-[#0f172a]">
      {toast && <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-lg shadow-black/40 text-[13px] font-medium ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-[#3b82f6] text-white'}`}>{toast.msg}</div>}

      {/* Header */}
      <div className="bg-[#1e293b] border-b border-[#475569]">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#3b82f6] flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/25">
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-[#f8fafc] truncate">{user.name}</h1>
              <p className="text-[12px] text-[#94a3b8]">{user.email}</p>
              <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#334155] text-[#94a3b8]">{user.role}</span>
            </div>
          </div>

          {/* Balance Card */}
          <div className="mt-5 bg-[#0f172a] rounded-2xl p-4 ring-1 ring-[#475569] shadow-lg shadow-black/20">
            <p className="text-[11px] font-medium text-[#94a3b8] uppercase tracking-wider">Saldo</p>
            <p className="text-2xl font-bold text-[#f8fafc] mt-1 tabular-nums">Rp {fmt(balance)}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => balance > 0 ? setShowWithdraw(true) : showToast('Saldo Rp 0', 'error')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3b82f6]/20 hover:bg-[#3b82f6]/30 rounded-lg text-[12px] font-medium text-[#3b82f6] transition-colors">
                <ArrowUpRight size={14} /> Tarik
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[{ label: 'Dibeli', value: stats.buyer }, { label: 'Dijual', value: stats.seller }, { label: 'Ulasan', value: stats.reviews }].map((s, i) => (
              <div key={i} className="bg-[#0f172a] border border-[#475569] rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#f8fafc]">{fmt(s.value)}</p>
                <p className="text-[11px] text-[#94a3b8]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {/* Buyer */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
          <p className="px-4 py-2.5 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider bg-[#334155] border-b border-[#475569]">Pembeli</p>
          <button onClick={() => navigate('/riwayat')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#334155] transition-colors">
            <History size={18} className="text-[#94a3b8]" />
            <span className="flex-1 text-[13px] font-medium text-[#f8fafc] text-left">Riwayat Pembelian</span>
            <ChevronRight size={16} className="text-[#64748b]" />
          </button>
        </div>

        {/* Seller / Upgrade */}
        {isSeller ? (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
            <p className="px-4 py-2.5 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider bg-[#334155] border-b border-[#475569]">Penjual</p>
            <button onClick={() => navigate('/seller')} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-[#334155] transition-colors">
              <Store size={18} className="text-[#94a3b8]" />
              <span className="flex-1 text-[13px] font-medium text-[#f8fafc] text-left">Dashboard Penjual</span>
              <ChevronRight size={16} className="text-[#64748b]" />
            </button>
          </div>
        ) : (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center"><Store size={20} className="text-[#3b82f6]" /></div>
              <div>
                <p className="text-[13px] font-semibold text-[#f8fafc]">Jadi Seller</p>
                <p className="text-[11px] text-[#94a3b8]">Mulai jual akun & item game</p>
              </div>
            </div>
            <button onClick={() => setShowUpgrade(true)} className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-[13px] py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/25">
              Upgrade ke Seller
            </button>
          </div>
        )}

        {/* Admin */}
        {isAdmin && (
          <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-[#334155] transition-colors">
            <Shield size={18} className="text-[#94a3b8]" />
            <span className="flex-1 text-[13px] font-medium text-[#f8fafc] text-left">Panel Admin</span>
            <ChevronRight size={16} className="text-[#64748b]" />
          </button>
        )}

        {/* Settings */}
        <button onClick={openSettings} className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-[#334155] transition-colors">
          <Settings size={18} className="text-[#94a3b8]" />
          <span className="flex-1 text-[13px] font-medium text-[#f8fafc] text-left">Pengaturan Akun</span>
          <ChevronRight size={16} className="text-[#64748b]" />
        </button>

        {/* Logout */}
        <button onClick={() => { if (confirm('Yakin keluar?')) { logout(); navigate('/'); } }}
          className="w-full flex items-center justify-center gap-2 py-3 text-[13px] font-medium text-red-400 hover:bg-[#1e293b] rounded-xl transition-colors">
          <LogOut size={16} /> Keluar
        </button>
      </div>

      {/* ─── MODALS ─── */}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowSettings(false)}>
          <div className="bg-[#1e293b] rounded-t-2xl w-full max-w-lg p-5 ring-1 ring-[#475569]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#f8fafc]">Pengaturan Akun</h3>
              <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-[#334155] rounded-lg"><X size={18} className="text-[#94a3b8]" /></button>
            </div>
            <div className="space-y-3">
              {[{ l: 'Nama', k: 'name', p: 'Nama kamu' }, { l: 'No. HP', k: 'phone', p: '08xxxxxxxxxx' }, { l: 'Telegram', k: 'telegram', p: '@username' }, { l: 'WhatsApp', k: 'whatsapp', p: '08xxxxxxxxxx' }].map(f => (
                <div key={f.k}>
                  <label className="text-[12px] font-medium text-[#94a3b8] mb-1 block">{f.l}</label>
                  <input value={settingsForm[f.k]} onChange={e => setSettingsForm({...settingsForm, [f.k]: e.target.value})} placeholder={f.p}
                    className="w-full px-3 py-2.5 border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] bg-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition" />
                </div>
              ))}
            </div>
            <button onClick={handleSaveSettings} disabled={saving}
              className="w-full mt-4 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-[13px] transition-all shadow-lg shadow-blue-500/25">
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowUpgrade(false)}>
          <div className="bg-[#1e293b] rounded-t-2xl w-full max-w-lg p-5 ring-1 ring-[#475569]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#f8fafc]">Upgrade ke Seller</h3>
              <button onClick={() => setShowUpgrade(false)} className="p-1.5 hover:bg-[#334155] rounded-lg"><X size={18} className="text-[#94a3b8]" /></button>
            </div>
            <div className="bg-[#0f172a] rounded-xl p-3 mb-4 ring-1 ring-[#475569]">
              <p className="text-[12px] text-[#94a3b8]">Setelah jadi seller, kamu bisa jual akun, item, dan voucher game. Kelola stok dan terima pembayaran.</p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[#94a3b8] mb-1 block">Username Telegram *</label>
              <input value={telegramInput} onChange={e => setTelegramInput(e.target.value)} placeholder="@username"
                className="w-full px-3 py-2.5 border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] bg-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition" />
              <p className="text-[10px] text-[#64748b] mt-1">Untuk notifikasi transaksi</p>
            </div>
            <button onClick={handleUpgrade} className="w-full mt-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-2.5 rounded-xl text-[13px] transition-all shadow-lg shadow-blue-500/25">
              Upgrade Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowWithdraw(false)}>
          <div className="bg-[#1e293b] rounded-t-2xl w-full max-w-lg p-5 ring-1 ring-[#475569]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-[#f8fafc]">Tarik Dana</h3>
              <button onClick={() => setShowWithdraw(false)} className="p-1.5 hover:bg-[#334155] rounded-lg"><X size={18} className="text-[#94a3b8]" /></button>
            </div>
            <div className="bg-[#0f172a] rounded-xl p-3 mb-4 ring-1 ring-[#475569]">
              <p className="text-[11px] text-[#94a3b8]">Saldo Tersedia</p>
              <p className="text-lg font-bold text-[#f8fafc] tabular-nums">Rp {fmt(balance)}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[#94a3b8] mb-1 block">Jumlah (Rp)</label>
                <input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} placeholder="Minimal 10.000"
                  className="w-full px-3 py-2.5 border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] bg-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#94a3b8] mb-1 block">Metode</label>
                <select value={withdrawForm.method} onChange={e => setWithdrawForm({...withdrawForm, method: e.target.value})}
                  className="w-full px-3 py-2.5 border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] bg-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition">
                  <option>DANA</option><option>GoPay</option><option>OVO</option><option>BCA</option><option>BRI</option><option>Mandiri</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#94a3b8] mb-1 block">No. Rekening / E-Wallet</label>
                <input value={withdrawForm.account_number} onChange={e => setWithdrawForm({...withdrawForm, account_number: e.target.value})} placeholder="08xxxxxxxxxx"
                  className="w-full px-3 py-2.5 border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] bg-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-[#94a3b8] mb-1 block">Nama Pemilik</label>
                <input value={withdrawForm.account_name} onChange={e => setWithdrawForm({...withdrawForm, account_name: e.target.value})} placeholder="Nama sesuai rekening"
                  className="w-full px-3 py-2.5 border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] bg-[#0f172a] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition" />
              </div>
            </div>
            <button onClick={handleWithdraw} disabled={saving}
              className="w-full mt-4 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-[13px] transition-all shadow-lg shadow-blue-500/25">
              {saving ? 'Memproses...' : 'Tarik Dana'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
