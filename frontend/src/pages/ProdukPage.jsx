import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, SlidersHorizontal, X, ArrowRight } from 'lucide-react';

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

export default function ProdukPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [game, setGame] = useState(searchParams.get('game') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  const loadProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (game) params.set('game', game);
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);

    fetch(`/api/products?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadProducts(); }, [game, category, sort]);

  const handleSearch = (e) => { e.preventDefault(); loadProducts(); };
  const clearFilters = () => { setSearch(''); setGame(''); setCategory(''); setSort(''); };
  const hasFilters = search || game || category || sort;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white">Marketplace</h1>
        <p className="text-sm text-[#64748b] mt-1">{total} produk tersedia</p>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex items-center bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-all">
          <Search size={18} className="text-[#475569] ml-4 shrink-0" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari akun, game, atau seller..."
            className="w-full bg-transparent border-none outline-none px-3.5 py-3 text-sm text-white placeholder:text-[#475569]" />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="mr-2 text-[#475569] hover:text-[#94a3b8] p-1">
              <X size={16} />
            </button>
          )}
        </form>
        <button onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
            showFilter || hasFilters
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-[#111827] border-[#1e293b] text-[#94a3b8] hover:border-[#334155] hover:text-white'
          }`}>
          <SlidersHorizontal size={16} /> Filter
        </button>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <div className="bg-[#111827] border border-[#1e293b] rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5 block">Game</label>
              <select value={game} onChange={e => setGame(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-white focus:border-blue-500/50 outline-none transition-all">
                <option value="">Semua Game</option>
                {['Mobile Legends','Genshin Impact','Free Fire','PUBG Mobile','Valorant','PlayStation','Steam','Google Play'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5 block">Kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-white focus:border-blue-500/50 outline-none transition-all">
                <option value="">Semua</option>
                {Object.entries(CATEGORY_MAP).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-1.5 block">Urutkan</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#0a0e17] border border-[#1e293b] rounded-lg text-sm text-white focus:border-blue-500/50 outline-none transition-all">
                <option value="">Terbaru</option>
                <option value="popular">Terpopuler</option>
                <option value="price_asc">Harga ↓</option>
                <option value="price_desc">Harga ↑</option>
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-red-400 hover:text-red-300 font-medium transition-colors">
              ✕ Hapus filter
            </button>
          )}
        </div>
      )}

      {/* Active Filters */}
      {hasFilters && !showFilter && (
        <div className="flex flex-wrap gap-2">
          {search && <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">"{search}" <X size={12} className="cursor-pointer hover:text-blue-300" onClick={() => setSearch('')} /></span>}
          {game && <span className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">{game} <X size={12} className="cursor-pointer hover:text-cyan-300" onClick={() => setGame('')} /></span>}
          {category && <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">{CATEGORY_MAP[category]} <X size={12} className="cursor-pointer hover:text-purple-300" onClick={() => setCategory('')} /></span>}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-[#111827] rounded-xl border border-[#1e293b] overflow-hidden">
              <div className="aspect-[4/3] skeleton-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 skeleton-pulse rounded w-1/3" />
                <div className="h-4 skeleton-pulse rounded w-3/4" />
                <div className="h-5 skeleton-pulse rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => {
            const theme = getTheme(p.game_name);
            return (
              <Link key={p.id} to={`/product/${p.id}`}
                className="group block bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-300">
                <div className={`relative aspect-[4/3] ${theme.accent === 'from-gray-500 to-purple-600' || !p.game_name ? `bg-gradient-to-br ${theme.accent}` : ''} flex items-center justify-center overflow-hidden`} style={(() => { const map = {'Mobile Legends':'/games/ml.jpg','Genshin Impact':'/games/genshin.jpg','Free Fire':'/games/ff.jpg','Valorant':'/games/valorant.jpg'}; const img = map[p.game_name]; return img ? {backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center'} : {}; })()}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white/90 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md z-10">
                    {CATEGORY_MAP[p.category] || p.category}
                  </span>
                  {p.sold_count > 10 && (
                    <span className="absolute bottom-3 right-3 text-[10px] font-bold text-amber-300 bg-amber-500/20 backdrop-blur-sm px-2 py-1 rounded-md border border-amber-500/20 z-10">
                      🔥 Best
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold text-blue-400 tracking-wider mb-1 uppercase">{p.game_name}</p>
                  <h3 className="text-sm font-bold text-white line-clamp-2 min-h-[2.5rem] group-hover:text-blue-400 transition-colors">{p.title}</h3>
                  <div className="flex items-center gap-2 mt-3">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs text-[#94a3b8]">{p.rating}</span>
                    <span className="text-[10px] text-[#475569]">•</span>
                    <span className="text-xs text-[#64748b]">{p.sold_count} terjual</span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e293b]/60">
                    <span className="text-base font-black gradient-text">Rp{p.price?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#111827] rounded-xl border border-[#1e293b]">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-lg font-bold text-white">Produk tidak ditemukan</p>
          <p className="text-[#64748b] text-sm mt-1">Coba kata kunci atau filter lain</p>
          {hasFilters && <button onClick={clearFilters} className="mt-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all">Reset Filter</button>}
        </div>
      )}
    </div>
  );
}
