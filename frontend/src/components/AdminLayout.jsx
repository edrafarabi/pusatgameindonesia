import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Package, Settings, ChevronLeft, LogOut, ExternalLink } from 'lucide-react';

const nav = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/transactions', icon: CreditCard, label: 'Transaksi' },
  { path: '/admin/listings', icon: Package, label: 'Listings' },
];

const bottomNav = [
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login?redirect=/admin');
    else if (!isAdmin) navigate('/');
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  const isActive = (path, end) => end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-[#f8fafc]">
      <aside className={`${collapsed ? 'w-[68px]' : 'w-[240px]'} flex flex-col bg-[#1e293b]/60 backdrop-blur-xl border-r border-[#475569]/40 fixed inset-y-0 left-0 z-40 transition-all duration-200`}>
        <div className={`p-4 border-b border-[#475569]/40 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-9 h-9 rounded-full bg-[#3b82f6]/20 flex items-center justify-center text-[13px] font-bold text-[#3b82f6] shrink-0">{user.name?.charAt(0)}</div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#f8fafc] truncate">{user.name}</p>
              <p className="text-[11px] text-[#94a3b8] truncate">{user.role}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path, item.end);
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all group ${active ? 'bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/20' : 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#f8fafc] border border-transparent'}`}
                title={collapsed ? item.label : undefined}>
                <Icon size={18} strokeWidth={active ? 2 : 1.5} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#475569]/40 space-y-0.5">
          {bottomNav.map(item => {
            const Icon = item.icon;
            const active = isActive(item.path, item.end);
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${active ? 'bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/20' : 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#f8fafc] border border-transparent'}`}>
                <Icon size={18} strokeWidth={active ? 2 : 1.5} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
          <a href="/produk" target="_blank" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[#94a3b8] hover:bg-[#334155] hover:text-[#f8fafc] transition-all">
            <ExternalLink size={18} strokeWidth={1.5} className="shrink-0" />
            {!collapsed && <span>Buka Website</span>}
          </a>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut size={18} strokeWidth={1.5} className="shrink-0" />
            {!collapsed && <span>Keluar</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-20 w-6 h-6 bg-[#1e293b]/60 backdrop-blur-xl border border-[#475569] rounded-full flex items-center justify-center text-[#94a3b8] hover:text-[#f8fafc] shadow-sm z-50">
          <ChevronLeft size={12} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      <main className={`flex-1 ${collapsed ? 'ml-[68px]' : 'ml-[240px]'} transition-all duration-200`}>
        <div className="p-6 max-w-[1400px]"><Outlet /></div>
      </main>
    </div>
  );
}
