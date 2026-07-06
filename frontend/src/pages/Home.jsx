import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, ChevronRight, TrendingUp, Shield, Zap, Search, Gamepad2 } from 'lucide-react';

const CATEGORY_MAP = {
  AKUN_GAME: 'Akun Game', ITEM_GAME: 'Item Game', VOUCHER: 'Voucher', JASA_JOKI: 'Jasa Joki'
};

const GAME_THEMES = {
  'Mobile Legends': { accent: 'from-cyan-500 to-blue-600', icon: '⚔️', hex: '#06b6d4' },
  'Genshin Impact': { accent: 'from-yellow-500 to-orange-600', icon: '🌟', hex: '#eab308' },
  'Free Fire': { accent: 'from-red-500 to-orange-500', icon: '🔥', hex: '#ef4444' },
  'PUBG Mobile': { accent: 'from-orange-600 to-yellow-500', icon: '🎯', hex: '#d97706' },
  'Valorant': { accent: 'from-red-600 to-pink-500', icon: '🔫', hex: '#dc2626' },
  'PlayStation': { accent: 'from-indigo-600 to-blue-500', icon: '🎮', hex: '#6366f1' },
  'Steam': { accent: 'from-gray-600 to-gray-400', icon: '🖥️', hex: '#6b7280' },
  'Google Play': { accent: 'from-green-500 to-emerald-600', icon: '▶️', hex: '#22c55e' },
};

function getGameTheme(name) {
  return GAME_THEMES[name] || { accent: 'from-blue-500 to-purple-600', icon: '🎮', hex: '#3b82f6' };
}

function ProductCard({ product }) {
  const theme = getGameTheme(product.game_name);
  const gameImg = {
    'Mobile Legends': '/games/ml.jpg',
    'Genshin Impact': '/games/genshin.jpg',
    'Free Fire': '/games/ff.jpg',
    'Valorant': '/games/valorant.jpg',
  };
  const gameImage = gameImg[product.game_name];
  return (
    <Link to={`/product/${product.id}`}
      className="group block bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)] transition-all duration-300">
      {/* Thumb */}
      <div className={`relative aspect-[4/3] ${gameImage ? '' : `bg-gradient-to-br ${theme.accent}`} flex items-center justify-center overflow-hidden`}>
        {gameImage ? (
          <>
            <img src={gameImage} alt={product.game_name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </>
        ) : (
          <span className="text-6xl opacity-20 select-none group-hover:scale-125 transition-transform duration-500">{theme.icon}</span>
        )}
        <span className="absolute bottom-3 left-3 text-[10px] font-bold text-white/90 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md z-10">
          {CATEGORY_MAP[product.category] || product.category}
        </span>
        {product.sold_count > 10 && (
          <span className="absolute bottom-3 right-3 text-[10px] font-bold text-amber-300 bg-amber-500/20 backdrop-blur-sm px-2 py-1 rounded-md border border-amber-500/20 z-10">
            🔥 Best
          </span>
        )}
      </div>
      {/* Body */}
      <div className="p-4">
        <p className="text-[11px] font-bold text-blue-400 tracking-wider mb-1 uppercase">{product.game_name}</p>
        <h3 className="text-sm font-bold text-white line-clamp-2 min-h-[2.5rem] group-hover:text-blue-400 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs text-[#94a3b8]">{product.rating}</span>
          </div>
          <span className="text-[10px] text-[#475569]">•</span>
          <span className="text-xs text-[#64748b]">{product.sold_count} terjual</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1e293b]/60">
          <span className="text-base font-black gradient-text">
            Rp{product.price?.toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] font-medium text-[#475569] group-hover:text-blue-400 transition-colors flex items-center gap-0.5">
            Detail <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/products').then(r => r.json()),
      fetch('/api/products/meta/featured').then(r => r.json()),
    ]).then(([all, feat]) => {
      setProducts(all.products || []);
      setFeatured(feat || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = Object.entries(CATEGORY_MAP).map(([key, label]) => ({
    key, label, count: products.filter(p => p.category === key).length,
  }));

  // Group by game
  const games = {};
  products.forEach(p => {
    const g = p.game_name || 'Lainnya';
    if (!games[g]) games[g] = { name: g, count: 0, products: [] };
    games[g].count++;
    games[g].products.push(p);
  });
  const topGames = Object.values(games).sort((a, b) => b.count - a.count).slice(0, 6);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/produk?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="space-y-10">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-[#070b12] border border-[#1e293b]/60">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[80px]" />

        <div className="relative px-6 md:px-10 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold px-3 py-1.5 rounded-full">
                <Gamepad2 size={13} /> Marketplace Game Indonesia
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black leading-[1.1] text-white">
              Jual Beli Akun Game<br />
              <span className="gradient-text">Aman & Terpercaya</span>
            </h1>
            <p className="text-[#94a3b8] mt-4 text-base max-w-lg">
              Platform khusus gamer Indonesia. Jual akun, voucher, dan jasa joki dengan sistem rekber.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-6 max-w-lg">
              <div className="flex items-center bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden focus-within:border-blue-500/50 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.05)] transition-all">
                <Search size={18} className="text-[#475569] ml-4 shrink-0" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari akun, game, atau seller..."
                  className="w-full bg-transparent border-none outline-none px-3.5 py-3.5 text-sm text-white placeholder:text-[#475569]" />
                <button type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-bold px-5 py-3.5 m-1 rounded-lg transition-all">
                  Cari
                </button>
              </div>
            </form>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-4 mt-8 text-sm">
            <div className="flex items-center gap-2 text-[#64748b]">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="font-bold text-white">{products.length}</span> Produk Aktif
            </div>
            <div className="flex items-center gap-2 text-[#64748b]">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="font-bold text-white">{categories.length}</span> Kategori
            </div>
            <div className="flex items-center gap-2 text-[#64748b]">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-bold text-white">100%</span> Aman Rekber
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Kategori</h2>
          <Link to="/produk" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
            Lihat Semua <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { key: 'AKUN_GAME', label: 'Akun Game', emoji: '🎮', count: products.filter(p => p.category === 'AKUN_GAME').length, grad: 'from-blue-600 to-indigo-700' },
            { key: 'ITEM_GAME', label: 'Item Game', emoji: '💎', count: products.filter(p => p.category === 'ITEM_GAME').length, grad: 'from-purple-600 to-pink-700' },
            { key: 'VOUCHER', label: 'Voucher', emoji: '🎟️', count: products.filter(p => p.category === 'VOUCHER').length, grad: 'from-emerald-600 to-teal-700' },
            { key: 'JASA_JOKI', label: 'Jasa Joki', emoji: '⚡', count: products.filter(p => p.category === 'JASA_JOKI').length, grad: 'from-orange-600 to-red-700' },
          ].map(cat => (
            <Link key={cat.key} to={`/produk?category=${cat.key}`}
              className={`relative overflow-hidden bg-gradient-to-br ${cat.grad} rounded-xl p-5 group hover:shadow-lg hover:shadow-black/30 transition-all`}>
              <div className="absolute -bottom-4 -right-4 text-6xl opacity-10 select-none">{cat.emoji}</div>
              <p className="text-2xl">{cat.emoji}</p>
              <p className="font-bold text-white text-sm mt-3">{cat.label}</p>
              <p className="text-xs text-white/60">{cat.count} produk</p>
            </Link>
          ))}
        </div>
      </section>

      {/* GAME POPULER */}
      {topGames.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">Game Populer</h2>
            <Link to="/produk" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {topGames.map(g => {
              const theme = getGameTheme(g.name);
              const gameBg = {
                'Mobile Legends': 'url(/games/ml.jpg)',
                'Genshin Impact': 'url(/games/genshin.jpg)',
                'Free Fire': 'url(/games/ff.jpg)',
                'Valorant': 'url(/games/valorant.jpg)',
              }[g.name];
              return (
                <Link key={g.name} to={`/produk?search=${encodeURIComponent(g.name)}`}
                  className="group relative flex flex-col items-center justify-end p-5 min-h-[160px] bg-[#111827] border border-[#1e293b] rounded-xl overflow-hidden hover:border-blue-500/30 transition-all"
                  style={gameBg ? {backgroundImage: gameBg, backgroundSize: 'cover', backgroundPosition: 'center'} : {}}>
                  {gameBg && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />}
                  <div className={`relative z-10 w-12 h-12 ${gameBg ? 'hidden' : `bg-gradient-to-br ${theme.accent}`} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                    {theme.icon}
                  </div>
                  <p className="relative z-10 text-sm font-bold text-white text-center">{g.name}</p>
                  <p className="relative z-10 text-xs text-white/60 mt-1">{g.count} produk</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* BEST SELLER */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white">⭐ Best Seller</h2>
            <Link to="/produk?sort=popular" className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
              Lihat Semua <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ALL PRODUCTS */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-white">Semua Produk</h2>
          <span className="text-sm text-[#64748b]">{products.length} produk</span>
        </div>
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
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 bg-[#111827] rounded-xl border border-[#1e293b]">
            <p className="text-5xl mb-4">🎮</p>
            <p className="text-lg font-bold text-white">Belum ada produk</p>
            <p className="text-[#64748b] text-sm mt-1">Jadilah seller pertama!</p>
            <Link to="/jual" className="inline-block mt-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm px-6 py-2.5 rounded-lg transition-all hover:from-blue-500 hover:to-blue-400">
              Jual Sekarang
            </Link>
          </div>
        )}
      </section>

      {/* CTA */}
      {!loading && products.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c1929] to-[#0f1029] border border-blue-500/10 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px]" />
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-black text-white">Punya Akun Game yang Gak Terpakai?</h2>
            <p className="text-[#94a3b8] mt-2 max-w-lg">Jual di PusatGameIndonesia! Proses mudah, pembayaran cepat, aman dengan rekber.</p>
            <Link to="/jual"
              className="inline-block mt-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-3 rounded-lg transition-all shadow-lg shadow-blue-500/20">
              Mulai Jual Sekarang →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
