import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Gamepad2, ChevronRight, Check, Loader2, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ─── Toast ─── */
function Toast({ message, type = 'error', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = {
    error: 'bg-[#1e293b] text-red-400 border-[#475569]',
    success: 'bg-[#1e293b] text-[#f8fafc] border-[#475569]',
    info: 'bg-[#1e293b] text-[#94a3b8] border-[#475569]',
  };
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl border text-[13px] font-medium shadow-lg backdrop-blur-sm ${colors[type]} animate-[slideDown_.25s_ease]`}>
      {message}
    </div>
  );
}

/* ─── Skeleton ─── */
function Skeleton({ className = '' }) {
  return <div className={`bg-[#334155] rounded-xl animate-pulse ${className}`} />;
}

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [step, setStep] = useState(1);
  const [buyerInfo, setBuyerInfo] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    const load = async () => {
      try {
        const [prod, adminRes] = await Promise.all([
          fetch(`/api/products/${id}`).then(r => r.json()),
          api('/api/admins')
        ]);
        setProduct(prod);
        setAdmins(adminRes?.admins || []);
        if (adminRes?.admins?.length === 1) setSelectedAdmin(adminRes.admins[0]);
      } catch (err) {
        setToast({ message: 'Gagal memuat data', type: 'error' });
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, user]);

  if (!user) return null;

  const createTransaction = async () => {
    if (!selectedAdmin) { setToast({ message: 'Pilih admin rekber dulu', type: 'error' }); return; }
    setLoading(true);
    try {
      const trxRes = await api('/api/transaction/create', {
        method: 'POST',
        body: JSON.stringify({ product_id: id, admin_id: selectedAdmin.id, buyer_info: buyerInfo })
      });
      navigate(`/rekber/${trxRes.id}`);
    } catch (err) {
      setToast({ message: 'Gagal membuat transaksi: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const feePercent = 2.5;
  const minFee = 2000;
  const rawFee = Math.round((product?.price || 0) * feePercent / 100);
  const fee = Math.max(rawFee, minFee);
  const total = (product?.price || 0) + fee;

  return (
    <div className="min-h-screen bg-[#0f172a] pb-28">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-[#1e293b]/80 backdrop-blur-lg border-b border-[#475569] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors">
          <ArrowLeft size={18} className="text-[#f8fafc]" />
        </button>
        <span className="font-semibold text-[15px] text-[#f8fafc]">Checkout</span>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-3">
        {/* Step Indicator */}
        <div className="flex items-center gap-2 justify-center py-2">
          {[
            { num: 1, label: 'Pilih Admin' },
            { num: 2, label: 'Konfirmasi' }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                step >= s.num ? 'bg-[#3b82f6] text-white' : 'bg-[#1e293b] text-[#94a3b8]'
              }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] ${
                  step >= s.num ? 'bg-white/20' : 'bg-[#334155]'
                }`}>{s.num}</span>
                {s.label}
              </div>
              {i < 1 && <ChevronRight size={14} className="text-[#94a3b8]" />}
            </div>
          ))}
        </div>

        {/* Product Summary */}
        {fetching ? (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-3">
              <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>
        ) : product && (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Ringkasan Pesanan</p>
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-[#334155] rounded-xl flex items-center justify-center shrink-0 border border-[#475569]">
                <Gamepad2 size={24} className="text-[#3b82f6]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#3b82f6] uppercase">{product.game_name}</p>
                <p className="text-[13px] font-semibold text-[#f8fafc] truncate">{product.title}</p>
                <p className="text-lg font-bold text-[#f8fafc] mt-1">Rp{product.price?.toLocaleString('id-ID')}</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: Pilih Admin */}
        {step === 1 && (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={15} className="text-[#3b82f6]" />
              <h3 className="text-[13px] font-semibold text-[#f8fafc]">Pilih Admin Rekber</h3>
            </div>
            <p className="text-[12px] text-[#94a3b8] mb-4">Pilih admin yang akan mengawasi transaksi ini.</p>

            {fetching ? (
              <div className="space-y-2">
                {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
              </div>
            ) : admins.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <AlertCircle size={24} className="text-[#94a3b8]" />
                <p className="text-[13px] text-[#94a3b8]">Tidak ada admin tersedia</p>
              </div>
            ) : (
              <div className="space-y-2">
                {admins.map(admin => (
                  <button key={admin.id} onClick={() => setSelectedAdmin(admin)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border rounded-xl transition-all ${
                      selectedAdmin?.id === admin.id
                        ? 'border-[#3b82f6] bg-[#3b82f6]/10'
                        : 'border-[#475569] hover:border-[#3b82f6]'
                    }`}>
                    <div className="w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center text-white text-[13px] font-semibold shrink-0">
                      {admin.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="text-left flex-1">
                      <p className="text-[13px] font-semibold text-[#f8fafc]">{admin.name}</p>
                      <p className="text-[11px] text-[#94a3b8]">Admin Rekber</p>
                    </div>
                    {selectedAdmin?.id === admin.id && (
                      <div className="w-5 h-5 bg-[#3b82f6] rounded-full flex items-center justify-center">
                        <Check size={12} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => { if (selectedAdmin) setStep(2); }}
              disabled={!selectedAdmin}
              className="w-full mt-4 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-20 disabled:hover:bg-[#3b82f6] text-white font-semibold py-3 rounded-xl transition-all text-[14px]">
              Lanjutkan
            </button>
          </div>
        )}

        {/* STEP 2: Konfirmasi & Bayar */}
        {step === 2 && (
          <>
            {/* Admin terpilih */}
            <div className="bg-[#334155] border border-[#475569] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3b82f6] rounded-full flex items-center justify-center text-white text-[13px] font-semibold shrink-0">
                {selectedAdmin?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-[#94a3b8] font-medium">Admin Rekber</p>
                <p className="text-[14px] font-semibold text-[#f8fafc]">{selectedAdmin?.name}</p>
              </div>
              <button onClick={() => setStep(1)} className="text-[12px] text-[#3b82f6] font-medium hover:underline">Ganti</button>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-2.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-xl p-3.5">
              <ShieldCheck size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
              <div className="text-[12px]">
                <p className="font-semibold text-[#f8fafc]">Transaksi diawasi oleh {selectedAdmin?.name}</p>
                <p className="text-[#94a3b8] mt-0.5">Dana ditahan sampai barang diterima buyer.</p>
              </div>
            </div>

            {/* Buyer Info */}
            {product?.delivery_format && (
              <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <label className="text-[12px] font-semibold text-[#f8fafc] mb-2 block">{product.delivery_format}</label>
                <input
                  type="text"
                  value={buyerInfo}
                  onChange={e => setBuyerInfo(e.target.value)}
                  placeholder={`Masukkan ${product.delivery_format.toLowerCase()}`}
                  className="w-full px-4 py-2.5 border border-[#475569] rounded-xl text-[13px] text-[#f8fafc] placeholder:text-[#94a3b8] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 outline-none transition-all bg-[#334155]"
                />
                <div className="flex items-center gap-1.5 mt-2">
                  <Info size={12} className="text-[#94a3b8]" />
                  <p className="text-[11px] text-[#94a3b8]">Data ini akan dikirim ke seller untuk proses pengiriman</p>
                </div>
              </div>
            )}

            {/* Price breakdown */}
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Rincian Biaya</p>
              <div className="space-y-2.5 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Harga</span>
                  <span className="font-medium text-[#f8fafc]">Rp{product?.price?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94a3b8]">Fee Rekber ({feePercent}%)</span>
                  <span className="font-medium text-[#f8fafc]">Rp{fee.toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-[#475569] pt-2.5 flex justify-between items-center">
                  <span className="font-semibold text-[#f8fafc]">Total</span>
                  <span className="text-xl font-bold text-[#f8fafc]">Rp{total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <button onClick={createTransaction} disabled={loading || fetching}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 text-white font-semibold py-3.5 rounded-xl transition-all text-[14px] flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Membuat Transaksi...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Bayar & Mulai Rekber
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-[#94a3b8] mt-2.5">
                Kamu akan masuk ke group chat rekber dengan admin
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
