import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package, Clock, CheckCircle, DollarSign,
  RefreshCw, Truck, XCircle,
  AlertCircle, Search
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua', icon: Package },
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'processing', label: 'Proses', icon: RefreshCw },
  { value: 'shipped', label: 'Dikirim', icon: Truck },
  { value: 'completed', label: 'Selesai', icon: CheckCircle },
  { value: 'cancelled', label: 'Batal', icon: XCircle },
];

const STATUS_BADGE = {
  pending: { bg: '#334155', text: '#fbbf24', label: 'Pending' },
  processing: { bg: '#334155', text: '#60a5fa', label: 'Proses' },
  shipped: { bg: '#334155', text: '#a78bfa', label: 'Dikirim' },
  completed: { bg: '#334155', text: '#34d399', label: 'Selesai' },
  cancelled: { bg: '#334155', text: '#f87171', label: 'Batal' },
};

function SkeletonCard() {
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 p-6 min-h-[100px]">
      <div className="w-8 h-8 rounded-lg bg-[#334155] mb-3 animate-pulse" />
      <div className="w-12 h-7 rounded-md bg-[#334155] mb-2 animate-pulse" />
      <div className="w-20 h-3.5 rounded bg-[#334155] animate-pulse" />
    </div>
  );
}

function SkeletonOrder() {
  return (
    <div className="bg-[#1e293b] rounded-xl border border-[#475569]/40 p-5">
      <div className="flex justify-between items-center">
        <div>
          <div className="w-30 h-4 rounded bg-[#334155] mb-2 animate-pulse" />
          <div className="w-44 h-3 rounded bg-[#334155] animate-pulse" />
        </div>
        <div className="w-18 h-7 rounded-full bg-[#334155] animate-pulse" />
      </div>
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colorMap = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-xl border ${colorMap[type] || colorMap.info}`}>
      {type === 'success' && <CheckCircle size={18} />}
      {type === 'error' && <AlertCircle size={18} />}
      <span>{message}</span>
    </div>
  );
}

export default function SellerDashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api('/api/seller/stats');
      setStats(res);
    } catch {
      setToast({ message: 'Gagal memuat statistik', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const query = filter ? `?status=${filter}` : '';
      const res = await api(`/api/seller/orders${query}`);
      setOrders(res.orders || res || []);
    } catch {
      setToast({ message: 'Gagal memuat pesanan', type: 'error' });
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api(`/api/seller/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      setToast({ message: `Status diperbarui ke "${STATUS_BADGE[status]?.label}"`, type: 'success' });
      fetchOrders();
      fetchStats();
    } catch {
      setToast({ message: 'Gagal memperbarui status', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id?.toString().includes(q) ||
      o.buyer_name?.toLowerCase().includes(q) ||
      o.items?.some(i => i.product_name?.toLowerCase().includes(q))
    );
  });

  const statCards = stats ? [
    { icon: Package, label: 'Total Pesanan', value: stats.total_orders || 0, color: '#f8fafc' },
    { icon: Clock, label: 'Pending', value: stats.pending_orders || 0, color: '#fbbf24' },
    { icon: CheckCircle, label: 'Selesai', value: stats.completed_orders || 0, color: '#34d399' },
    { icon: DollarSign, label: 'Total Pendapatan', value: formatCurrency(stats.total_earnings), color: '#3b82f6' },
  ] : [];

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-8 max-w-[960px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#f8fafc] tracking-tight">Dashboard</h1>
        <p className="text-sm text-[#94a3b8] mt-1">Kelola pesanan dan pantau pendapatan Anda</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={i}
                className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 p-5 hover:border-[#3b82f6]/30 transition-colors"
              >
                <Icon size={20} color={card.color} strokeWidth={1.5} className="mb-3" />
                <div className="text-2xl font-bold text-[#f8fafc] tracking-tight mb-1">
                  {card.value}
                </div>
                <div className="text-xs text-[#94a3b8] font-medium">{card.label}</div>
              </div>
            );
          })
        )}
      </div>

      {/* Orders Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#f8fafc] tracking-tight mb-4">Pesanan</h2>

        {/* Filter Tabs */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {STATUS_OPTIONS.map(opt => {
            const active = filter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-[#3b82f6] text-white border-[#3b82f6]'
                    : 'bg-[#1e293b] text-[#94a3b8] border-[#475569]/40 hover:border-[#475569] hover:text-[#f8fafc]'
                }`}
              >
                <opt.icon size={14} />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Cari pesanan..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10/40 rounded-xl text-sm text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6]/50 transition-colors box-border"
          />
        </div>
      </div>

      {/* Orders List */}
      {ordersLoading ? (
        <div className="space-y-2">
          <SkeletonOrder />
          <SkeletonOrder />
          <SkeletonOrder />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-[#1e293b] rounded-2xl border border-[#475569]/40">
          <Package size={40} className="mx-auto text-[#334155] mb-4" strokeWidth={1} />
          <p className="text-base font-medium text-[#94a3b8] mb-1">Tidak ada pesanan</p>
          <p className="text-xs text-[#64748b]">
            {filter ? 'Coba filter lain' : 'Pesanan akan muncul di sini'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredOrders.map((order) => {
            const badge = STATUS_BADGE[order.status] || STATUS_BADGE.pending;
            return (
              <div
                key={order.id}
                className="bg-[#1e293b] rounded-xl border border-[#475569]/40 p-5 hover:border-[#3b82f6]/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm font-semibold text-[#f8fafc] mb-1">
                      #{order.id}
                    </div>
                    <div className="text-xs text-[#94a3b8]">
                      {order.buyer_name || 'Pembeli'}
                      {order.items?.[0]?.product_name && (
                        <span> · {order.items[0].product_name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}</span>
                      )}
                    </div>
                  </div>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#f8fafc]">
                    {formatCurrency(order.total_amount || order.total)}
                  </span>

                  {/* Action Buttons */}
                  <div className="flex gap-1.5">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'processing')}
                          disabled={updatingId === order.id}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#334155] text-blue-400 border border-[#475569]/40 hover:bg-[#3b82f6]/10 disabled:opacity-50 transition-colors"
                        >
                          Proses
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'cancelled')}
                          disabled={updatingId === order.id}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#334155] text-red-400 border border-[#475569]/40 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                        >
                          Batalkan
                        </button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateStatus(order.id, 'shipped')}
                        disabled={updatingId === order.id}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#334155] text-purple-400 border border-[#475569]/40 hover:bg-purple-500/10 disabled:opacity-50 transition-colors"
                      >
                        Kirim
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        disabled={updatingId === order.id}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb] disabled:opacity-50 transition-colors"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
