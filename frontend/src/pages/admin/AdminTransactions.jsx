import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Filter, ChevronLeft, ChevronRight,
  AlertCircle, CheckCircle, Clock, Package,
  XCircle, CreditCard,
} from 'lucide-react';

const STATUS_STYLE = {
  WAITING_PAYMENT: { color: '#f59e0b', label: 'Menunggu Bayar', icon: Clock },
  PAID:            { color: '#3b82f6', label: 'Sudah Bayar',   icon: CreditCard },
  DELIVERED:       { color: '#a855f7', label: 'Dikirim',       icon: Package },
  COMPLETED:       { color: '#22c55e', label: 'Selesai',       icon: CheckCircle },
  CANCELLED:       { color: '#94a3b8', label: 'Dibatalkan',    icon: XCircle },
  DISPUTED:        { color: '#ef4444', label: 'Dispute',       icon: AlertCircle },
  REFUNDED:        { color: '#94a3b8', label: 'Refund',        icon: XCircle },
};

const LIMIT = 20;

function SkeletonRow() {
  return (
    <tr className="border-b border-[#334155]">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-[#334155] rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminTransactions() {
  const { api } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const data = await api(`/api/admin/transactions?${params}`);
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat transaksi', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, page, search, statusFilter, showToast]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api(`/api/admin/transactions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Status diperbarui ke ${STATUS_STYLE[newStatus]?.label || newStatus}`);
      loadTransactions();
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString('id-ID');
  const totalPages = Math.ceil(total / LIMIT);

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-[#334155] rounded-lg animate-pulse" />
        <div className="flex gap-3">
          <div className="h-10 w-64 bg-[#334155] rounded-xl animate-pulse" />
          <div className="h-10 w-40 bg-[#334155] rounded-xl animate-pulse" />
        </div>
        <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 border-b border-[#334155] animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium backdrop-blur-xl ${
            toast.type === 'error'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {toast.type === 'error' ? <XCircle size={14} /> : <CheckCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#f8fafc] tracking-tight">Transaksi</h1>
        <p className="text-sm text-[#94a3b8] mt-1">Total {total} transaksi</p>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <input
            type="text"
            placeholder="Cari ID atau item..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10/40 rounded-xl text-sm text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748b]" />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-10 pr-8 py-2.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10/40 rounded-xl text-sm text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            {Object.entries(STATUS_STYLE).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#475569]/40">
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">ID</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Item</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Jumlah</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Tanggal</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <CreditCard size={32} className="mx-auto text-[#334155] mb-3" />
                    <p className="text-sm font-medium text-[#94a3b8]">Tidak ada transaksi</p>
                    <p className="text-xs text-[#64748b] mt-1">Coba ubah filter atau kata kunci pencarian</p>
                  </td>
                </tr>
              ) : (
                transactions.map(t => {
                  const st = STATUS_STYLE[t.status] || { color: '#94a3b8', label: t.status, icon: Clock };
                  const Icon = st.icon;
                  return (
                    <tr key={t.id} className="hover:bg-[#334155]/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-xs font-mono text-[#64748b]">{t.id.substring(4, 18)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#f8fafc]">{t.product_name || '-'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-[#f8fafc] tabular-nums">Rp{fmt(t.amount)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border"
                          style={{
                            color: st.color,
                            borderColor: st.color + '30',
                            backgroundColor: st.color + '10',
                          }}
                        >
                          <Icon size={11} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-[#64748b]">
                          {t.created_at ? new Date(t.created_at).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          defaultValue=""
                          disabled={updating === t.id}
                          onChange={e => {
                            if (e.target.value) {
                              updateStatus(t.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="px-3 py-1.5 bg-[#334155] border border-[#475569]/40 rounded-lg text-xs text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 cursor-pointer disabled:opacity-40 transition-colors appearance-none"
                        >
                          <option value="" disabled>
                            {updating === t.id ? 'Memperbarui...' : 'Ubah status'}
                          </option>
                          {Object.entries(STATUS_STYLE)
                            .filter(([k]) => k !== t.status)
                            .map(([key, val]) => (
                              <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#475569]/40 flex items-center justify-between">
            <p className="text-xs text-[#64748b]">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#475569]/40 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] disabled:opacity-30 disabled:hover:text-[#94a3b8] disabled:hover:border-[#475569]/40 transition-colors"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#475569]/40 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] disabled:opacity-30 disabled:hover:text-[#94a3b8] disabled:hover:border-[#475569]/40 transition-colors"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
