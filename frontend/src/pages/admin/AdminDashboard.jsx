import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api('/api/admin/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Gagal load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Loading dashboard...</div>;

  const cards = [
    { label: 'Total User', value: stats?.totalUsers || 0, icon: '👥', color: 'bg-blue-500' },
    { label: 'Total Admin', value: stats?.totalAdmins || 0, icon: '🛡️', color: 'bg-purple-500' },
    { label: 'Total Transaksi', value: stats?.totalTransactions || 0, icon: '💳', color: 'bg-green-500' },
    { label: 'Transaksi Berhasil', value: stats?.completedTransactions || 0, icon: '✅', color: 'bg-emerald-500' },
    { label: 'Transaksi Gagal', value: stats?.failedTransactions || 0, icon: '❌', color: 'bg-red-500' },
    { label: 'Pending', value: stats?.pendingTransactions || 0, icon: '⏳', color: 'bg-yellow-500' },
    { label: 'Total Revenue', value: `Rp${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`, icon: '💰', color: 'bg-amber-500' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">📊 Dashboard Admin</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 border-l-4 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{card.value}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">🔧 Aksi Cepat</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/admin/digiflazz" className="block p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition">
            <span className="text-2xl">🎮</span>
            <p className="font-semibold mt-2 text-gray-800 dark:text-white">Cek Saldo Digiflazz</p>
            <p className="text-sm text-gray-500">Lihat saldo & produk</p>
          </a>
          <a href="/admin/users" className="block p-4 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition">
            <span className="text-2xl">👥</span>
            <p className="font-semibold mt-2 text-gray-800 dark:text-white">Kelola User</p>
            <p className="text-sm text-gray-500">Tambah, edit, hapus user</p>
          </a>
          <a href="/admin/settings" className="block p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition">
            <span className="text-2xl">⚙️</span>
            <p className="font-semibold mt-2 text-gray-800 dark:text-white">Pengaturan</p>
            <p className="text-sm text-gray-500">Konfigurasi website</p>
          </a>
        </div>
      </div>
    </div>
  );
}
