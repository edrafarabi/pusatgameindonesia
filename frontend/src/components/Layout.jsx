import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search, User, Shield, LogOut, Home, ShoppingBag, PlusCircle, Menu, X, Gamepad2, MessageCircle, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Beranda', icon: Home },
    { to: '/produk', label: 'Market', icon: ShoppingBag },
    { to: '/jual', label: 'Jual', icon: PlusCircle },
    { to: '/rekber', label: 'Rekber', icon: MessageCircle },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] text-[#f1f5f9]">
      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0e17]/95 backdrop-blur-xl border-b border-[#1e293b]/80 shadow-lg shadow-black/30'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="h-9 w-auto max-w-[140px] sm:max-w-[170px] rounded-lg overflow-hidden ring-1 ring-white/5 group-hover:ring-blue-500/30 transition-all">
                <video
                  src="/logo-video.mp4"
                  className="h-full w-full object-contain"
                  autoPlay muted loop playsInline
                />
              </div>
            </Link>

            {/* NAV DESKTOP */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(n => {
                const Icon = n.icon;
                const active = isActive(n.to);
                return (
                  <Link key={n.to} to={n.to}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'text-blue-400 bg-blue-500/10 nav-active'
                        : 'text-[#94a3b8] hover:text-white hover:bg-white/[0.04]'
                    }`}>
                    <Icon size={16} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            {/* RIGHT */}
            <div className="flex items-center gap-2">
              <Link to="/produk"
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 border border-[#1e293b] rounded-lg text-sm text-[#94a3b8] hover:text-white hover:border-[#334155] transition-all">
                <Search size={15} />
                <span>Cari...</span>
                <kbd className="hidden xl:inline text-[10px] text-[#475569] bg-[#1e293b] px-1.5 py-0.5 rounded ml-2">Ctrl+K</kbd>
              </Link>

              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin"
                      className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs font-bold hover:from-amber-500/30 hover:to-amber-600/20 transition-all">
                      <Shield size={13} /> Admin
                    </Link>
                  )}
                  <div className="hidden md:flex items-center gap-2 bg-[#111827] border border-[#1e293b] rounded-lg px-2.5 py-1.5">
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-[11px] font-bold text-white">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[#e2e8f0] max-w-[90px] truncate">{user.name}</span>
                  </div>
                  <button onClick={() => { logout(); navigate('/'); }}
                    className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors text-[#64748b] hover:text-red-400"
                    title="Keluar">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link to="/login"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-all shadow-lg shadow-blue-500/20">
                  Masuk
                </Link>
              )}

              <button className="md:hidden p-2 hover:bg-white/[0.06] rounded-lg transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={20} className="text-[#94a3b8]" /> : <Menu size={20} className="text-[#94a3b8]" />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="md:hidden bg-[#0a0e17]/98 backdrop-blur-xl border-t border-[#1e293b] pb-4">
            <nav className="px-3 pt-3 space-y-1">
              {navLinks.map(n => {
                const Icon = n.icon;
                const active = isActive(n.to);
                return (
                  <Link key={n.to} to={n.to}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'text-[#94a3b8] hover:bg-white/[0.04] hover:text-white'
                    }`}>
                    <Icon size={20} /> {n.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link to="/admin"
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-amber-400 bg-amber-500/10">
                  <Shield size={20} /> Dashboard Admin
                </Link>
              )}
              {!user && (
                <Link to="/login"
                  className="flex items-center justify-center gap-2 px-3 py-3 mt-2 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl text-sm font-bold text-white">
                  Masuk / Daftar
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* SPACER */}
      <div className="h-16" />

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-[#070b12] border-t border-[#1e293b]/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 rounded-lg overflow-hidden ring-1 ring-white/5">
                  <video src="/logo-video.mp4" className="h-full w-auto object-contain" autoPlay muted loop playsInline />
                </div>
                <span className="font-black text-lg text-white">PusatGame</span>
              </div>
              <p className="text-sm text-[#64748b] leading-relaxed">
                Marketplace jual beli akun game, voucher, dan jasa joki. Transaksi aman dengan sistem rekber.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4 text-[#94a3b8]">Kategori</h4>
              <ul className="space-y-2.5">
                <li><Link to="/produk?search=Mobile+Legends" className="text-sm text-[#64748b] hover:text-blue-400 transition-colors">Mobile Legends</Link></li>
                <li><Link to="/produk?search=Genshin+Impact" className="text-sm text-[#64748b] hover:text-blue-400 transition-colors">Genshin Impact</Link></li>
                <li><Link to="/produk?search=Free+Fire" className="text-sm text-[#64748b] hover:text-blue-400 transition-colors">Free Fire</Link></li>
                <li><Link to="/produk?search=Valorant" className="text-sm text-[#64748b] hover:text-blue-400 transition-colors">Valorant</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4 text-[#94a3b8]">Layanan</h4>
              <ul className="space-y-2.5">
                <li><Link to="/jual" className="text-sm text-[#64748b] hover:text-blue-400 transition-colors">Jual Akun</Link></li>
                <li><Link to="/produk" className="text-sm text-[#64748b] hover:text-blue-400 transition-colors">Cari Produk</Link></li>
                <li><Link to="/rekber" className="text-sm text-[#64748b] hover:text-blue-400 transition-colors">Sistem Rekber</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white text-xs uppercase tracking-widest mb-4 text-[#94a3b8]">Bantuan</h4>
              <ul className="space-y-2.5">
                <li><span className="text-sm text-[#64748b] hover:text-blue-400 cursor-pointer transition-colors">Cara Beli</span></li>
                <li><span className="text-sm text-[#64748b] hover:text-blue-400 cursor-pointer transition-colors">Cara Jual</span></li>
                <li><span className="text-sm text-[#64748b] hover:text-blue-400 cursor-pointer transition-colors">FAQ</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#1e293b]/50 mt-10 pt-6 text-sm text-center text-[#475569]">
            © 2026 <span className="text-[#64748b]">PusatGameIndonesia</span>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAV MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0e17]/95 backdrop-blur-xl border-t border-[#1e293b]/80 px-2 pb-1 pt-2">
        <div className="flex justify-around items-center">
          {[
            { to: '/', icon: Home, label: 'Beranda' },
            { to: '/produk', icon: ShoppingBag, label: 'Market' },
            { to: '/jual', icon: PlusCircle, label: 'Jual' },
            { to: '/rekber', icon: MessageCircle, label: 'Rekber' },
            { to: user ? '/akun' : '/login', icon: User, label: user ? 'Akun' : 'Masuk' },
          ].map(n => {
            const Icon = n.icon;
            const active = location.pathname === n.to;
            return (
              <Link key={n.to} to={n.to}
                className={`flex flex-col items-center py-1 px-3 rounded-lg transition-all ${
                  active ? 'text-blue-400' : 'text-[#475569] hover:text-[#94a3b8]'
                }`}>
                <Icon size={22} />
                <span className="text-[10px] font-bold mt-0.5">{n.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
