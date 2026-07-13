import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, CreditCard, TrendingUp, Clock, CheckCircle, ArrowUpRight, Activity } from 'lucide-react';

const STATUS_MAP = {
  WAITING_PAYMENT: { color: '#f59e0b', label: 'Menunggu Bayar' },
  PAID:            { color: '#3b82f6', label: 'Sudah Bayar' },
  DELIVERED:       { color: '#a855f7', label: 'Dikirim' },
  COMPLETED:       { color: '#22c55e', label: 'Selesai' },
  CANCELLED:       { color: '#94a3b8', label: 'Dibatalkan' },
  DISPUTED:        { color: '#ef4444', label: 'Dispute' },
};

function SkeletonBlock({ className }) {
  return <div className={`bg-[#334155] rounded-xl animate-pulse ${className}`} />;
}

export default function AdminDashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTrx, setRecentTrx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, trx] = await Promise.all([
          api('/api/admin/dashboard'),
          api('/api/admin/transactions?limit=5'),
        ]);
        setStats(dash);
        setRecentTrx(trx?.transactions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [api]);

  if (loading) {
    return (
      <div className="space-y-8">
        <SkeletonBlock className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonBlock key={i} className="h-32" />
          ))}
        </div>
        <SkeletonBlock className="h-80" />
      </div>
    );
  }

  const kpi = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, sub: `${stats?.totalAdmins || 0} admins` },
    { label: 'Active Listings', value: stats?.totalListings || 0, icon: Package, sub: 'Produk aktif' },
    { label: 'Transactions', value: stats?.totalTransactions || 0, icon: CreditCard, sub: `${stats?.completedTransactions || 0} selesai` },
    { label: 'Revenue', value: `Rp${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`, icon: TrendingUp, sub: `${stats?.pendingTransactions || 0} pending` },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#f8fafc] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#94a3b8] mt-1">Overview performa platform</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 p-5 hover:border-[#3b82f6]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#334155] flex items-center justify-center">
                  <Icon size={18} className="text-[#3b82f6]" />
                </div>
                <ArrowUpRight size={14} className="text-[#475569]" />
              </div>
              <p className="text-2xl font-semibold text-[#f8fafc] tracking-tight">{item.value}</p>
              <p className="text-xs text-[#94a3b8] mt-1">{item.label}</p>
              <p className="text-[11px] text-[#64748b] mt-0.5">{item.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Transactions */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#475569]/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={16} className="text-[#3b82f6]" />
            <h2 className="text-sm font-semibold text-[#f8fafc]">Transaksi Terakhir</h2>
          </div>
          <a
            href="/admin/transactions"
            className="text-xs text-[#94a3b8] hover:text-[#3b82f6] transition-colors flex items-center gap-1"
          >
            Lihat semua
            <ArrowUpRight size={12} />
          </a>
        </div>

        {recentTrx.length === 0 ? (
          <div className="py-16 text-center">
            <CreditCard size={32} className="mx-auto text-[#334155] mb-3" />
            <p className="text-sm text-[#94a3b8]">Belum ada transaksi</p>
          </div>
        ) : (
          <div className="divide-y divide-[#334155]">
            {recentTrx.map((t) => {
              const st = STATUS_MAP[t.status] || { color: '#94a3b8', label: t.status };
              return (
                <div
                  key={t.id}
                  className="px-6 py-4 flex items-center gap-4 hover:bg-[#334155]/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#334155] flex items-center justify-center">
                    {t.status === 'COMPLETED' ? (
                      <CheckCircle size={16} className="text-[#22c55e]" />
                    ) : (
                      <Clock size={16} className="text-[#94a3b8]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f8fafc] truncate">
                      {t.product_name || t.id}
                    </p>
                    <p className="text-[11px] text-[#64748b] font-mono">{t.id.slice(0, 20)}</p>
                  </div>
                  <span
                    className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                    style={{
                      color: st.color,
                      borderColor: st.color + '30',
                      backgroundColor: st.color + '10',
                    }}
                  >
                    {st.label}
                  </span>
                  <p className="text-sm font-semibold text-[#f8fafc] tabular-nums">
                    Rp{(t.amount || 0).toLocaleString('id-ID')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
