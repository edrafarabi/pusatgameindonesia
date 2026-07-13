import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, MessageCircle, ShieldCheck, ChevronLeft, Package, Tag, Truck, Clock, ArrowRight, Gamepad2, AlertCircle, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CATEGORY_MAP = { AKUN_GAME: 'Akun Game', ITEM_GAME: 'Item Game', VOUCHER: 'Voucher', JASA_JOKI: 'Jasa Joki' };

/* Skeleton */
function Skeleton({ className = '' }) {
  return <div className={`bg-[#334155] rounded-xl animate-pulse ${className}`} />;
}

/* Toast */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: 'bg-[#3b82f6] text-white border-[#60a5fa]', error: 'bg-red-500/90 text-white border-red-400/30' };
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl border text-[13px] font-medium shadow-lg backdrop-blur-sm ${colors[type]} animate-[slideDown_.25s_ease]`}>
      {message}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const handleBuy = () => {
    if (!user) {
      navigate(`/login?redirect=/product/${id}`);
      return;
    }
    navigate(`/checkout/${id}`);
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast({ message: 'Link disalin!', type: 'success' });
    } catch {
      setToast({ message: 'Gagal menyalin link', type: 'error' });
    }
  };

  /* Loading skeleton */
  if (loading) return (
    <div className="min-h-screen bg-[#0f172a]">
      <div className="bg-[#1e293b]/80 backdrop-blur-lg border-b border-[#475569] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <Skeleton className="aspect-[4/3] rounded-2xl" />
          </div>
          <div className="md:col-span-4 space-y-3">
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3">
              <Skeleton className="h-3 w-16" />
              <div className="flex gap-3 items-center">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            </div>
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
          <div className="md:col-span-3">
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-4">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* Not found */
  if (!product) return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-3">
      <AlertCircle size={40} className="text-[#94a3b8]" />
      <p className="text-[15px] font-semibold text-[#f8fafc]">Produk tidak ditemukan</p>
      <Link to="/produk" className="text-[#3b82f6] text-[13px] hover:underline font-medium">Kembali ke Marketplace</Link>
    </div>
  );

  const specs = (product.specs || '').split('|').filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0f172a] pb-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-[#1e293b]/80 backdrop-blur-lg border-b border-[#475569] px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-[#334155] rounded-lg transition-colors">
          <ChevronLeft size={18} className="text-[#f8fafc]" />
        </button>
        <span className="font-semibold text-[15px] text-[#f8fafc] truncate">{product.title}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] text-[#94a3b8] overflow-x-auto">
          <button onClick={() => navigate(-1)} className="hover:text-[#f8fafc] flex items-center gap-1 transition-colors shrink-0">
            <ChevronLeft size={12} /> Kembali
          </button>
          <span className="shrink-0 text-[#475569]">/</span>
          <Link to="/produk" className="hover:text-[#f8fafc] transition-colors shrink-0">Marketplace</Link>
          <span className="shrink-0 text-[#475569]">/</span>
          <span className="text-[#94a3b8] shrink-0">{product.game_name}</span>
        </div>

        <div className="grid md:grid-cols-12 gap-4">
          {/* Image */}
          <div className="md:col-span-5">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#1e293b]/60 backdrop-blur-xl border border-white/10"
              style={(() => {
                const map = { 'Mobile Legends': '/games/ml.jpg', 'Genshin Impact': '/games/genshin.jpg', 'Free Fire': '/games/ff.jpg', 'Valorant': '/games/valorant.jpg' };
                const img = map[product.game_name];
                return img ? { backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {};
              })()}>
              {!(() => { const map = { 'Mobile Legends': 1, 'Genshin Impact': 1, 'Free Fire': 1, 'Valorant': 1 }; return map[product.game_name]; })() && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gamepad2 size={48} className="text-[#475569]" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 text-[11px] font-medium text-white bg-[#3b82f6]/80 backdrop-blur-md px-2.5 py-1 rounded-lg z-10 border border-[#3b82f6]/30">
                {CATEGORY_MAP[product.category] || product.category}
              </span>
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button onClick={() => { setLiked(!liked); if (!liked) setToast({ message: 'Ditambahkan ke favorit', type: 'success' }); }}
                  className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                    liked ? 'bg-[#3b82f6] text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}>
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                </button>
                <button onClick={handleShare}
                  className="p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-all">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-4 space-y-3">
            {/* Product info */}
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-1">{product.game_name}</p>
              <h1 className="text-lg font-bold text-[#f8fafc] leading-snug">{product.title}</h1>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl font-bold text-[#f8fafc]">Rp{product.price?.toLocaleString('id-ID')}</span>
                {product.sold_count > 10 && (
                  <span className="text-[10px] font-semibold text-white bg-[#3b82f6]/20 border border-[#3b82f6]/30 px-2 py-0.5 rounded-lg">Best Seller</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-2.5 text-[12px] text-[#94a3b8]">
                <span className="flex items-center gap-1"><Star size={12} className="text-[#3b82f6] fill-[#3b82f6]" /> {product.rating}</span>
                <span className="text-[#475569]">|</span>
                <span>{product.sold_count} terjual</span>
                <span className="text-[#475569]">|</span>
                <span className="flex items-center gap-1"><Package size={12} /> Stok: {product.stock}</span>
              </div>
            </div>

            {/* Seller */}
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Penjual</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#334155] rounded-full flex items-center justify-center text-[#f8fafc] font-semibold text-[14px]">
                  {product.seller_name?.charAt(0)?.toUpperCase() || <User size={18} />}
                </div>
                <div>
                  <p className="font-semibold text-[14px] text-[#f8fafc]">{product.seller_name || 'Seller'}</p>
                  <div className="flex items-center gap-2 text-[11px] text-[#94a3b8] mt-0.5">
                    <Star size={10} className="text-[#3b82f6] fill-[#3b82f6]" /> 5.0
                    <span className="text-[#475569]">|</span>
                    <span>Terverifikasi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-2">Deskripsi</p>
              <p className="text-[13px] text-[#94a3b8] leading-relaxed whitespace-pre-wrap">
                {product.description || 'Tidak ada deskripsi.'}
              </p>
            </div>
          </div>

          {/* Sidebar Purchase */}
          <div className="md:col-span-3">
            <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-20 space-y-4">
              <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest">Detail Pembelian</p>
              <div className="space-y-2.5">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#94a3b8]">Harga</span>
                  <span className="font-medium text-[#f8fafc]">Rp{product.price?.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#94a3b8]">Fee Rekber (2.5%)</span>
                  <span className="font-medium text-[#f8fafc]">Rp{Math.max(Math.round(product.price * 0.025), 2000).toLocaleString('id-ID')}</span>
                </div>
                <div className="border-t border-[#475569] pt-2.5 flex justify-between items-center">
                  <span className="font-semibold text-[14px] text-[#f8fafc]">Total</span>
                  <span className="font-bold text-lg text-[#f8fafc]">
                    Rp{(product.price + Math.max(Math.round(product.price * 0.025), 2000)).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <button onClick={handleBuy}
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3 rounded-xl transition-all text-[14px] flex items-center justify-center gap-2">
                Beli Sekarang <ArrowRight size={16} />
              </button>
              <button className="w-full bg-[#334155] hover:bg-[#475569] text-[#f8fafc] font-semibold py-3 rounded-xl transition-all text-[13px] flex items-center justify-center gap-2 border border-[#475569]">
                <MessageCircle size={15} /> Chat Seller
              </button>

              <div className="flex items-start gap-2.5 text-[12px] bg-[#334155] border border-[#475569] p-3 rounded-xl">
                <ShieldCheck size={16} className="text-[#3b82f6] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#f8fafc]">Transaksi Aman</p>
                  <p className="text-[#94a3b8] mt-0.5">Dana ditahan sampai barang diterima</p>
                </div>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center p-2.5 bg-[#334155] rounded-xl border border-[#475569]">
                  <Truck size={16} className="text-[#3b82f6] mb-1" />
                  <span className="text-[10px] text-[#94a3b8] font-medium">Kirim Cepat</span>
                </div>
                <div className="flex flex-col items-center p-2.5 bg-[#334155] rounded-xl border border-[#475569]">
                  <Clock size={16} className="text-[#3b82f6] mb-1" />
                  <span className="text-[10px] text-[#94a3b8] font-medium">Respon 1 Jam</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specs */}
        {specs.length > 0 && (
          <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Spesifikasi</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specs.map((s, i) => {
                const [key, val] = s.split(':').map(x => x.trim());
                return (
                  <div key={i} className="flex items-center gap-3 bg-[#334155] border border-[#475569] rounded-xl p-3">
                    <div className="w-8 h-8 bg-[#0f172a] rounded-lg flex items-center justify-center shrink-0">
                      <Tag size={14} className="text-[#3b82f6]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-[#94a3b8] uppercase tracking-wider">{key}</p>
                      <p className="text-[13px] font-medium text-[#f8fafc] truncate">{val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-widest mb-3">Ulasan</p>
          <div className="space-y-3">
            {[
              { name: 'GamerSejati', rating: 5, text: 'Akun sesuai deskripsi, seller fast response. Recommended!', time: '2 hari lalu' },
              { name: 'ProPlayerID', rating: 5, text: 'Proses cepat, barang sesuai. Makasih seller!', time: '5 hari lalu' },
              { name: 'RookieGamer', rating: 4, text: 'Bagus, sesuai ekspektasi. Overall puas.', time: '1 minggu lalu' },
            ].map((r, i) => (
              <div key={i} className="flex gap-3 pb-3 border-b border-[#475569] last:border-0 last:pb-0">
                <div className="w-8 h-8 bg-[#334155] rounded-full flex items-center justify-center text-[11px] font-semibold text-[#f8fafc] shrink-0">
                  {r.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-[#f8fafc]">{r.name}</span>
                    <div className="flex">{[...Array(5)].map((_, j) => <Star key={j} size={10} className={j < r.rating ? 'text-[#3b82f6] fill-[#3b82f6]' : 'text-[#475569]'} />)}</div>
                    <span className="text-[11px] text-[#94a3b8]">{r.time}</span>
                  </div>
                  <p className="text-[13px] text-[#94a3b8] mt-0.5">{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
