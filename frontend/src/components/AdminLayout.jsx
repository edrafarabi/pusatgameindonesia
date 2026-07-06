import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom';

const menuItems = [
  { path: '/admin', icon: '📊', label: 'Dashboard' },
  { path: '/admin/users', icon: '👥', label: 'Kelola User' },
  { path: '/admin/transactions', icon: '💳', label: 'Transaksi' },
  { path: '/admin/listings', icon: '📦', label: 'Listings' },
  { path: '/admin/settings', icon: '⚙️', label: 'Pengaturan' },
];

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/admin');
    } else if (!isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold text-yellow-400">🎮 Admin</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 py-4">
          {menuItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && (
            <div className="mb-3">
              <p className="text-sm text-gray-400">Login sebagai</p>
              <p className="font-semibold text-yellow-400">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          )}
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            {sidebarOpen ? '🚪 Logout' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
