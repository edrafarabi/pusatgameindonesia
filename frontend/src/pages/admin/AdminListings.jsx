import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ChevronLeft, ChevronRight, Package,
  Check, X, Trash2, RefreshCw,
} from 'lucide-react';

const STATUS_MAP = {
  ACTIVE:   { color: '#22c55e', label: 'Active' },
  PENDING:  { color: '#f59e0b', label: 'Pending' },
  REJECTED: { color: '#ef4444', label: 'Rejected' },
  SOLD:     { color: '#a855f7', label: 'Sold' },
};

const PAGE_SIZE = 10;

function SkeletonRow() {
  return (
    <tr className="border-b border-[#334155]">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-[#334155] rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

export default function AdminListings() {
  const { api } = useAuth();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
      params.set('limit', PAGE_SIZE);
      if (statusFilter) params.set('status', statusFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (gameFilter) params.set('game', gameFilter);
      if (searchQuery) params.set('search', searchQuery);
      const data = await api(`/api/admin/listings?${params}`);
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      showToast('Gagal memuat listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [page, statusFilter, categoryFilter, gameFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchListings();
  };

  const handleStatusChange = async (listingId, newStatus) => {
    setActionLoading(listingId);
    try {
      await api(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Status diubah ke ${newStatus}`);
      fetchListings();
    } catch (err) {
      showToast(err.message || 'Gagal mengubah status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (listingId, title) => {
    if (!window.confirm(`Hapus listing "${title}"?`)) return;
    setActionLoading(listingId);
    try {
      await api(`/api/admin/listings/${listingId}`, { method: 'DELETE' });
      showToast('Listing dihapus');
      fetchListings();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus listing', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const fmt = (n) => Number(n || 0).toLocaleString('id-ID');

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
          {toast.type === 'error' ? <X size={14} /> : <Check size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#f8fafc] tracking-tight">Listings</h1>
          <p className="text-sm text-[#94a3b8] mt-1">{total} total listing</p>
        </div>
        <button
          onClick={fetchListings}
          disabled={loading}
          className="p-2.5 rounded-xl border border-[#475569]/40 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] disabled:opacity-40 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="Cari listing / seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="px-3.5 py-2.5 bg-[#334155] border border-[#475569]/40 rounded-xl text-sm text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6]/50 transition-colors"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-[#334155] border border-[#475569]/40 rounded-xl text-sm text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="SOLD">Sold</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-[#334155] border border-[#475569]/40 rounded-xl text-sm text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Semua Kategori</option>
            <option value="AKUN">Akun</option>
            <option value="ITEM">Item</option>
            <option value="JASA">Jasa</option>
          </select>
          <select
            value={gameFilter}
            onChange={(e) => { setGameFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2.5 bg-[#334155] border border-[#475569]/40 rounded-xl text-sm text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Semua Game</option>
            <option value="Mobile Legends">Mobile Legends</option>
            <option value="Genshin Impact">Genshin Impact</option>
            <option value="Free Fire">Free Fire</option>
            <option value="PUBG Mobile">PUBG Mobile</option>
            <option value="Valorant">Valorant</option>
            <option value="Roblox">Roblox</option>
            <option value="Minecraft">Minecraft</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 text-sm font-medium bg-[#3b82f6] text-white rounded-xl hover:bg-[#2563eb] transition-colors"
          >
            Cari
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#475569]/40">
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Title</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Game</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Category</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Price</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Seller</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Status</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {loading
                ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                : listings.map((l) => {
                    const st = STATUS_MAP[l.status] || { color: '#94a3b8', label: l.status };
                    return (
                      <tr key={l.id} className="hover:bg-[#334155]/50 transition-colors">
                        <td className="px-5 py-4 max-w-[200px]">
                          <p className="text-sm font-medium text-[#f8fafc] truncate">{l.title}</p>
                          {l.description && (
                            <p className="text-xs text-[#64748b] truncate mt-0.5">{l.description}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-[#94a3b8]">{l.game_name || '-'}</td>
                        <td className="px-5 py-4 text-sm text-[#94a3b8]">{l.category}</td>
                        <td className="px-5 py-4 text-sm font-semibold text-[#f8fafc] tabular-nums">Rp{fmt(l.price)}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-[#f8fafc]">{l.seller_name}</p>
                          {l.seller_email && (
                            <p className="text-xs text-[#64748b] mt-0.5">{l.seller_email}</p>
                          )}
                        </td>
                        <td className="px-5 py-4">
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
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {l.status !== 'ACTIVE' && (
                              <button
                                onClick={() => handleStatusChange(l.id, 'ACTIVE')}
                                disabled={actionLoading === l.id}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-40 transition-colors"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            {l.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleStatusChange(l.id, 'REJECTED')}
                                disabled={actionLoading === l.id}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-amber-400 hover:bg-amber-500/10 disabled:opacity-40 transition-colors"
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(l.id, l.title)}
                              disabled={actionLoading === l.id}
                              className="p-1.5 rounded-lg text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 disabled:opacity-40 transition-colors"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>

          {!loading && listings.length === 0 && (
            <div className="py-16 text-center">
              <Package size={32} className="mx-auto text-[#334155] mb-3" />
              <p className="text-sm font-medium text-[#94a3b8]">Tidak ada listing ditemukan</p>
              <p className="text-xs text-[#64748b] mt-1">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-[#475569]/40 flex items-center justify-between">
            <p className="text-xs text-[#64748b]">
              Halaman {page} dari {totalPages}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-[#475569]/40 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] disabled:opacity-30 disabled:hover:text-[#94a3b8] disabled:hover:border-[#475569]/40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-[#475569]/40 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] disabled:opacity-30 disabled:hover:text-[#94a3b8] disabled:hover:border-[#475569]/40 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
