import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, MessageCircle, ShieldCheck, ChevronLeft, User, Package, Tag } from 'lucide-react';

const CATEGORY_MAP = { AKUN_GAME: 'Akun Game', ITEM_GAME: 'Item Game', VOUCHER: 'Voucher', JASA_JOKI: 'Jasa Joki' };

const GAME_THEMES = {
  'Mobile Legends': { accent: 'from-cyan-500 to-blue-600', icon: '⚔️' },
  'Genshin Impact': { accent: 'from-yellow-500 to-orange-600', icon: '🌟' },
  'Free Fire': { accent: 'from-red-500 to-orange-500', icon: '🔥' },
  'PUBG Mobile': { accent: 'from-orange-600 to-yellow-500', icon: '🎯' },
  'Valorant': { accent: 'from-red-600 to-pink-500', icon: '🔫' },
  'PlayStation': { accent: 'from-indigo-600 to-blue-500', icon: '🎮' },
  'Steam': { accent: 'from-gray-600 to-gray-400', icon: '🖥️' },
  'Google Play': { accent: 'from-green-500 to-emerald-600', icon: '▶️' },
};
function getTheme(name) {
  return GAME_THEMES[name] || { accent: 'from-blue-500 to-purple-600', icon: '🎮' };
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setProduct(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="animate-pulse space-y-4 py-8">
      <div className="h-6 skeleton-pulse rounded w-1/4" />
      <div className="grid md:grid-cols-12 gap-6">
        <div className="md:col-span-5 aspect-[4/3] skeleton-pulse rounded-2xl" />
        <div className="md:col-span-7 space-y-4">
          <div className="h-8 skeleton-pulse rounded w-2/3" />
          <div className="h-6 skeleton-pulse rounded w-1/3" />
          <div className="h-20 skeleton-pulse rounded" />
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-3">😕</p>
      <p className="text-lg font-bold text-white">Produk tidak ditemukan</p>
      <Link to="/produk" className="text-blue-400 text-sm mt-2 inline-block hover:text-blue-300 transition-colors">← Kembali ke Marketplace</Link>
    </div>
  );

  const theme = getTheme(product.game_name);
  const specs = (product.specs || '').split('|').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#64748b]">
        <button onClick={() => navigate(-1)} className="hover:text-blue-400 flex items-center gap-1 transition-colors">
          <ChevronLeft size={16} /> Kembali
        </button>
        <span>/</span>
        <Link to="/produk" className="hover:text-blue-400 transition-colors">Marketplace</Link>
        <span>/</span>
        <span className="text-[#94a3b8]">{product.game_name}</span>
        <span className="hidden md:inline">/</span>
        <span className="hidden md:inline text-[#475569] truncate max-w-[200px]">{product.title}</span>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Thumb */}
        <div className="md:col-span-5">
          <div className={`relative aspect-[4/3] rounded-2xl flex items-center justify-center overflow-hidden shadow-xl shadow-black/30`}
               style={(() => {
                 const map = {'Mobile Legends':'/games/ml.jpg','Genshin Impact':'/games/genshin.jpg','Free Fire':'/games/ff.jpg','Valorant':'/games/valorant.jpg'};
                 const img = map[product.game_name];
                 return img ? {backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center'} : {};
               })()}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <span className="absolute bottom-4 left-4 text-xs font-bold text-white/90 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
              {CATEGORY_MAP[product.category] || product.category}
            </span>
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => setLiked(!liked)}
                className={`p-2.5 rounded-xl backdrop-blur-sm transition-all ${
                  liked ? 'bg-red-500/80 text-white shadow-lg' : 'bg-black/40 text-white/70 hover:bg-black/60'
                }`}>
                <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button className="p-2.5 rounded-xl bg-black/40 text-white/70 hover:bg-black/60 backdrop-blur-sm transition-all">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-4 space-y-4">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-1">{product.game_name}</p>
            <h1 className="text-xl font-black text-white leading-tight">{product.title}</h1>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-3xl font-black gradient-text">Rp{product.price?.toLocaleString('id-ID')}</span>
              {product.sold_count > 10 && (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg">🔥 Best Seller</span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 text-sm text-[#64748b]">
              <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /> {product.rating}</span>
              <span>{product.sold_count} terjual</span>
              <span className="flex items-center gap-1"><Package size={14} /> Stok: {product.stock}</span>
            </div>
          </div>

          {/* Seller */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-4">Penjual</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {product.seller_name?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <p className="font-semibold text-white">{product.seller_name || 'Seller'}</p>
                <div className="flex items-center gap-2 text-xs text-[#64748b] mt-0.5">
                  <Star size={11} className="text-amber-400 fill-amber-400" /> 5.0
                  <span className="text-[#475569]">•</span>
                  <span>Terverifikasi</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-3">Deskripsi</h3>
            <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
              {product.description || 'Tidak ada deskripsi.'}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-3">
          <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 sticky top-24 space-y-5 shadow-xl shadow-black/20">
            <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest">Detail Pembelian</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Harga</span>
                <span className="font-semibold text-white">Rp{product.price?.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748b]">Rekber (5%)</span>
                <span className="font-semibold text-white">Rp{Math.round(product.price * 0.05).toLocaleString('id-ID')}</span>
              </div>
              <div className="border-t border-[#1e293b] pt-3 flex justify-between items-center">
                <span className="font-bold text-white">Total</span>
                <span className="font-black text-xl gradient-text">Rp{Math.round(product.price * 1.05).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm">
              🛒 Beli (Rekber)
            </button>
            <button className="w-full bg-[#1e293b] hover:bg-[#263142] text-[#94a3b8] hover:text-white font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
              <MessageCircle size={16} /> Chat Seller
            </button>

            <div className="flex items-start gap-3 text-xs bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-xl">
              <ShieldCheck size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-blue-300">Transaksi Aman</p>
                <p className="text-[#64748b] mt-0.5">Dana ditahan sampai barang diterima</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spesifikasi */}
      {specs.length > 0 && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
          <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-4">Spesifikasi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {specs.map((s, i) => {
              const [key, val] = s.split(':').map(x => x.trim());
              return (
                <div key={i} className="flex items-center gap-3 bg-[#0a0e17] border border-[#1e293b]/50 rounded-xl p-3.5">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center shrink-0">
                    <Tag size={14} className="text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">{key}</p>
                    <p className="text-sm font-semibold text-white truncate">{val}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ulasan */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6">
        <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-widest mb-4">Ulasan</h3>
        <div className="space-y-4">
          {[
            { name: 'GamerSejati', rating: 5, text: 'Akun sesuai deskripsi, seller fast response. Recommended!', time: '2 hari lalu' },
            { name: 'ProPlayerID', rating: 5, text: 'Proses cepat, barang sesuai. Makasih seller!', time: '5 hari lalu' },
            { name: 'RookieGamer', rating: 4, text: 'Bagus, sesuai ekspektasi. Overall puas.', time: '1 minggu lalu' },
          ].map((r, i) => (
            <div key={i} className="flex gap-3 pb-4 border-b border-[#1e293b]/50 last:border-0 last:pb-0">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                {r.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{r.name}</span>
                  <div className="flex">{[...Array(5)].map((_, j) => <Star key={j} size={11} className={j < r.rating ? 'text-amber-400 fill-amber-400' : 'text-[#475569]'} />)}</div>
                  <span className="text-xs text-[#475569]">{r.time}</span>
                </div>
                <p className="text-sm text-[#94a3b8] mt-1">{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
