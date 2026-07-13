import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Package, Clock, CheckCircle, XCircle,
  ChevronRight, ShoppingBag, Search,
  AlertCircle, Truck
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'Semua', icon: ShoppingBag },
  { value: 'WAITING_PAYMENT', label: 'Menunggu Bayar', icon: Clock },
  { value: 'PAID', label: 'Dibayar', icon: Package },
  { value: 'DELIVERED', label: 'Dikirim', icon: Truck },
  { value: 'COMPLETED', label: 'Selesai', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Batal', icon: XCircle },
];

const STATUS_BADGE = {
  WAITING_PAYMENT: { color: '#fbbf24', label: 'Menunggu Bayar' },
  PAID: { color: '#60a5fa', label: 'Dibayar' },
  DELIVERED: { color: '#a78bfa', label: 'Dikirim' },
  COMPLETED: { color: '#34d399', label: 'Selesai' },
  CANCELLED: { color: '#f87171', label: 'Batal' },
  DISPUTED: { color: '#fb923c', label: 'Sengketa' },
};

function SkeletonTransaction() {
  return (
    <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 p-5">
      <div className="flex justify-between mb-4">
        <div>
          <div className="w-24 h-3.5 rounded bg-[#334155] mb-2 animate-pulse" />
          <div className="w-40 h-3 rounded bg-[#334155] animate-pulse" />
        </div>
        <div className="w-18 h-6 rounded-full bg-[#334155] animate-pulse" />
      </div>
      <div className="w-full h-px bg-[#334155] mb-4" />
      <div className="flex justify-between">
        <div className="w-20 h-3 rounded bg-[#334155] animate-pulse" />
        <div className="w-24 h-4 rounded bg-[#334155] animate-pulse" />
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

export default function RiwayatPage() {
  const { api } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const query = filter ? `?status=${filter}` : '';
      const res = await api(`/api/buyer/transactions${query}`);
      setTransactions(res.transactions || res || []);
    } catch {
      setToast({ message: 'Gagal memuat riwayat', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, [filter]);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filtered = transactions.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.id?.toString().includes(q) ||
      t.seller_name?.toLowerCase().includes(q) ||
        t.product_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 md:p-8 max-w-[720px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#f8fafc] tracking-tight">Riwayat</h1>
        <p className="text-sm text-[#94a3b8] mt-1">Lacak semua transaksi Anda</p>
      </div>

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
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
        <input
          type="text"
          placeholder="Cari transaksi..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10/40 rounded-xl text-sm text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6]/50 transition-colors box-border"
        />
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="space-y-2">
          <SkeletonTransaction />
          <SkeletonTransaction />
          <SkeletonTransaction />
          <SkeletonTransaction />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-[#1e293b] rounded-2xl border border-[#475569]/40">
          <ShoppingBag size={40} className="mx-auto text-[#334155] mb-4" strokeWidth={1} />
          <p className="text-base font-medium text-[#94a3b8] mb-1">Belum ada transaksi</p>
          <p className="text-xs text-[#64748b]">
            {filter ? 'Coba filter lain' : 'Transaksi akan muncul di sini'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const badge = STATUS_BADGE[tx.status] || { color: '#64748b', label: tx.status };
            const expanded = expandedId === tx.id;

            return (
              <div
                key={tx.id}
                className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 overflow-hidden hover:border-[#3b82f6]/30 transition-colors"
              >
                {/* Main Row */}
                <div
                  onClick={() => setExpandedId(expanded ? null : tx.id)}
                  className="p-5 cursor-pointer flex justify-between items-center"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="text-sm font-semibold text-[#f8fafc]">
                        #{tx.id}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: '#334155', color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-xs text-[#94a3b8]">
                      {tx.seller_name || 'Penjual'}
                      {tx.product_name && (
                        <span> · {tx.product_name}</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#64748b] mt-1">
                      {formatDate(tx.created_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-[#f8fafc] tracking-tight">
                      {formatCurrency(tx.total_amount || tx.total)}
                    </span>
                    <ChevronRight
                      size={18}
                      className="text-[#64748b] transition-transform"
                      style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {expanded && (
                  <div className="px-5 pb-5 border-t border-[#475569]/40">
                    <div className="pt-4">
                      <p className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                        Detail
                      </p>
                      <div className="flex justify-between items-center py-2.5 border-b border-[#334155]">
                        <div>
                          <div className="text-sm text-[#f8fafc] font-medium">
                            {tx.product_name || 'Produk'}
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-[#f8fafc]">
                          {formatCurrency(tx.amount)}
                        </span>
                      </div>
                      {tx.platform_fee > 0 && (
                        <div className="flex justify-between items-center py-2.5 border-b border-[#334155]">
                          <div className="text-xs text-[#94a3b8]">Biaya Platform</div>
                          <span className="text-xs text-[#94a3b8]">{formatCurrency(tx.platform_fee)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
