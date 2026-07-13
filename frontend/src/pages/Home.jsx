import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Shield, Zap, ChevronRight, Users, ShoppingBag, ArrowRight, ChevronDown, Gamepad2, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GAME_LOGOS = {
  'Mobile Legends': '/ml-logo.jpg',
  'Genshin Impact': '/genshin-logo.jpg',
  'Free Fire': '/ff-logo.jpg',
  'Valorant': '/valorant-logo.jpg',
  'Roblox': '/roblox-logo.jpg',
  'One Piece Bounty Rush': '/opbr-logo.jpg',
  'eFootball': '/efootball-logo.jpg',
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ products: 0, users: 0, transactions: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { api } = useAuth();
  const [visibleProducts, setVisibleProducts] = useState(6);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        api('/api/products?limit=12'),
        api('/api/products/meta/stats'),
      ]);
      if (pRes.products) setProducts(pRes.products);
      if (sRes) setStats(sRes);
    } catch(e) {}
    setLoading(false);
  };

  const featuredCats = [
    { name: 'Mobile Legends', img: '/ml-logo.jpg', slug: 'Mobile Legends' },
    { name: 'Genshin Impact', img: '/genshin-logo.jpg', slug: 'Genshin Impact' },
    { name: 'Free Fire', img: '/ff-logo.jpg', slug: 'Free Fire' },
    { name: 'Valorant', img: '/valorant-logo.jpg', slug: 'Valorant' },
    { name: 'Roblox', img: '/roblox-logo.jpg', slug: 'Roblox' },
    { name: 'eFootball', img: '/efootball-logo.jpg', slug: 'eFootball' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#22c55e]/[0.06] rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-28 md:pb-28">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f0fdf4] rounded-full text-xs font-semibold text-[#22c55e] tracking-wide mb-8">
              <Gamepad2 size={14} />
              Marketplace Gaming #1 Indonesia
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-[1.1] mb-6">
              Jual beli akun game{' '}
              <span className="text-[#22c55e]">tanpa ribet</span>
            </h1>

            <p className="text-lg md:text-xl text-[#64748b] max-w-lg mb-10 leading-relaxed">
              Marketplace terpercaya untuk akun & item game. Transaksi aman dengan rekber.
            </p>

            {/* Search */}
            <div className="flex gap-3 max-w-xl mb-10">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8] group-focus-within:text-[#22c55e] transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Cari akun game favorit..."
                  className="w-full bg-[#f8fafc] rounded-xl pl-11 pr-4 py-3.5 text-[15px] text-[#0f172a] placeholder:text-[#94a3b8] shadow-sm focus:outline-none focus:shadow-md focus:ring-2 focus:ring-[#22c55e]/20 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/produk')}
                />
              </div>
              <button
                onClick={() => navigate('/produk')}
                className="px-6 py-3.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl font-semibold transition-all shadow-sm hover:shadow-md text-[15px] shrink-0"
              >
                Cari
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 text-[#64748b]">
              <div className="flex items-center gap-2">
                <Shield size={15} className="text-[#22c55e]" />
                <span className="text-sm font-medium">Rekber Aman</span>
              </div>
              <div className="w-px h-4 bg-[#e2e8f0]" />
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[#22c55e]" />
                <span className="text-sm font-medium">{stats.users || 0} Seller</span>
              </div>
              <div className="w-px h-4 bg-[#e2e8f0]" />
              <div className="flex items-center gap-2">
                <ShoppingBag size={15} className="text-[#22c55e]" />
                <span className="text-sm font-medium">{stats.products || 0} Produk</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-30" style={{ animation: 'bounceDown 2s ease-in-out infinite' }}>
          <ChevronDown size={20} className="text-[#22c55e]" />
        </div>
      </section>

      {/* ═══ GAME POPULAR ═══ */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <Reveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight">Pilih Game Favorit</h2>
              <p className="text-sm text-[#94a3b8] mt-2">Browse produk berdasarkan game</p>
            </div>
            <Link to="/produk" className="text-sm text-[#22c55e] font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all">
              Semua game <ChevronRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {featuredCats.map((cat) => (
              <Link
                key={cat.name}
                to={`/produk?game=${cat.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[16/9] overflow-hidden bg-[#f0fdf4]">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="font-semibold text-[#0f172a] text-[15px]">{cat.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══ LATEST PRODUCTS ═══ */}
      {products.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <Reveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight">Produk Terbaru</h2>
                <p className="text-sm text-[#94a3b8] mt-2">Akun & item game paling fresh</p>
              </div>
              <Link to="/produk" className="text-sm text-[#22c55e] font-semibold flex items-center gap-1.5 hover:gap-2.5 transition-all">
                Lihat semua <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.slice(0, visibleProducts).map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] bg-[#f0fdf4] relative overflow-hidden">
                    {p.images ? (
                      <img src={p.images.split(',')[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {GAME_LOGOS[p.game_name] ? (
                          <img src={GAME_LOGOS[p.game_name]} alt="" className="w-16 h-16 rounded-xl object-cover opacity-60" />
                        ) : (
                          <Gamepad2 size={32} className="text-[#22c55e]/30" />
                        )}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#22c55e] text-white text-[11px] font-semibold rounded-lg">New</div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-[#22c55e] font-medium mb-1.5">{p.game_name || 'Game'}</div>
                    <div className="font-semibold text-sm text-[#0f172a] line-clamp-2 leading-snug mb-3">{p.title}</div>
                    <div className="text-[15px] font-bold text-[#22c55e]">Rp{(p.price || 0).toLocaleString('id-ID')}</div>
                  </div>
                </Link>
              ))}
            </div>

            {products.length > visibleProducts && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleProducts(prev => prev + 6)}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#0f172a] rounded-xl font-semibold text-sm shadow-sm hover:shadow-md transition-all"
                >
                  Lihat Semua ({products.length})
                </button>
              </div>
            )}
          </Reveal>
        </section>
      )}

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-2xl md:text-3xl font-bold text-[#0f172a] tracking-tight mb-3">3 Langkah Mudah</h2>
              <p className="text-[#94a3b8] text-base">Transaksi aman dalam hitungan menit</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <ShoppingBag size={24} />, title: 'Pilih & Bayar', desc: 'Pilih akun yang kamu mau, lalu checkout dengan aman.' },
                { icon: <Shield size={24} />, title: 'Verifikasi Akun', desc: 'Seller mengirim detail akun. Kamu cek dan verifikasi.' },
                { icon: <Zap size={24} />, title: 'Selesai', desc: 'Kalau sesuai, konfirmasi. Dana langsung cair ke seller.' },
              ].map((item, i) => (
                <div key={i} className="text-center group">
                  <div className="w-14 h-14 bg-[#f0fdf4] rounded-2xl flex items-center justify-center mx-auto mb-5 text-[#22c55e] group-hover:bg-[#22c55e] group-hover:text-white transition-all duration-300 shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#94a3b8] leading-relaxed max-w-xs mx-auto">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <Reveal>
          <div className="bg-[#22c55e] rounded-3xl text-center py-16 px-8 shadow-lg shadow-[#22c55e]/10">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Siap Jual Akunmu?</h2>
            <p className="text-white/80 mb-10 max-w-md mx-auto text-base leading-relaxed">
              Daftar gratis, posting akun game kamu, dan mulai menghasilkan uang.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#22c55e] rounded-xl font-bold text-[15px] transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                Daftar Gratis <ArrowRight size={16} />
              </Link>
              <Link to="/produk" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 text-white rounded-xl font-bold text-[15px] hover:bg-white/25 transition-all">
                Lihat Marketplace
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <style>{`
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(6px); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}

/* Reveal animation */
function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShow(true); obs.unobserve(e.target); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={className} style={{
      opacity: show ? 1 : 0,
      transform: show ? 'none' : 'translateY(24px)',
      transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {children}
    </div>
  );
}
