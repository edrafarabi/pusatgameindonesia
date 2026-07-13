import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, PlusCircle, MessageCircle, Clock, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/produk', label: 'Market', icon: ShoppingBag },
  { to: '/jual', label: 'Jual', icon: PlusCircle },
  { to: '/riwayat', label: 'Transaksi', icon: Clock },
  { to: '/chats', label: 'Chat', icon: MessageCircle },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const active = path => location.pathname.startsWith(path);

  const submitSearch = event => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get('q')?.trim();
    navigate(query ? `/produk?search=${encodeURIComponent(query)}` : '/produk');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-[#172033]">
      <header className="sticky top-0 z-50 bg-white border-b border-[#e5e9f0]">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="h-16 flex items-center gap-4">
            <Link to="/produk" className="flex items-center gap-2.5 shrink-0">
              <img src="/logo.jpg" alt="PusatGame" className="w-9 h-9 rounded-xl object-cover" />
              <span className="hidden sm:block font-extrabold tracking-tight text-[17px]">PusatGame</span>
            </Link>

            <form onSubmit={submitSearch} className="flex-1 max-w-2xl relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7b8496]" />
              <input name="q" defaultValue={new URLSearchParams(location.search).get('search') || ''} placeholder="Cari game, akun, item, atau voucher" className="w-full h-11 pl-11 pr-4 rounded-xl bg-[#f5f7fa] border border-[#dfe4ec] text-sm outline-none focus:bg-white focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
            </form>

            <nav className="hidden lg:flex items-center gap-1">
              {nav.slice(1).map(item => <Link key={item.to} to={item.to} className={`px-3 py-2 rounded-lg text-sm font-semibold ${active(item.to) ? 'text-[#2563eb] bg-[#eff6ff]' : 'text-[#526075] hover:bg-[#f5f7fa]'}`}>{item.label}</Link>)}
            </nav>

            {user ? (
              <div className="hidden md:flex items-center gap-1 border-l border-[#e5e9f0] pl-3">
                <Link to="/akun" className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#f5f7fa]">
                  <span className="w-8 h-8 rounded-full bg-[#e8f0ff] text-[#2563eb] grid place-items-center text-sm font-bold">{user.name?.[0]?.toUpperCase()}</span>
                  <span className="hidden xl:block text-sm font-semibold max-w-24 truncate">{user.name}</span>
                </Link>
                <button aria-label="Keluar" onClick={() => { logout(); navigate('/produk'); }} className="p-2 text-[#7b8496] hover:text-[#dc2626]"><LogOut size={17} /></button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="px-3 py-2 text-sm font-semibold text-[#2563eb]">Masuk</Link>
                <Link to="/register" className="px-4 py-2.5 rounded-xl bg-[#2563eb] text-white text-sm font-bold hover:bg-[#1d4ed8]">Daftar</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="pb-20 md:pb-0"><Outlet /></main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-[#e5e9f0] safe-area-bottom">
        <div className="h-16 grid grid-cols-5">
          {nav.map(item => { const Icon = item.icon; return <Link key={item.to} to={item.to} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active(item.to) ? 'text-[#2563eb]' : 'text-[#7b8496]'}`}><Icon size={20} strokeWidth={active(item.to) ? 2.5 : 1.8} />{item.label}</Link>; })}
          <Link to={user ? '/akun' : '/login'} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-semibold ${active('/akun') || active('/login') ? 'text-[#2563eb]' : 'text-[#7b8496]'}`}><User size={20} />{user ? 'Akun' : 'Masuk'}</Link>
        </div>
      </nav>

      <footer className="hidden md:block mt-14 bg-white border-t border-[#e5e9f0]">
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center text-sm text-[#7b8496]">
          <span>© 2026 PusatGameIndonesia</span><span>Marketplace produk digital game</span>
        </div>
      </footer>
    </div>
  );
}
