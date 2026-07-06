import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminListings() {
  const { api } = useAuth();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [gameFilter, setGameFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', page);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, statusFilter, categoryFilter, gameFilter]);

  const handleStatusChange = async (listingId, newStatus) => {
    setActionLoading(listingId);
    try {
      await api(`/api/admin/listings/${listingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      fetchListings();
    } catch (err) {
      alert('Gagal update status: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (listingId) => {
    if (!confirm('Yakin hapus listing ini?')) return;
    setActionLoading(listingId);
    try {
      await api(`/api/admin/listings/${listingId}`, { method: 'DELETE' });
      fetchListings();
    } catch (err) {
      alert('Gagal hapus: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      REJECTED: 'bg-red-100 text-red-700',
      SOLD: 'bg-blue-100 text-blue-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">📦 Listings Management</h2>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="text"
            placeholder="🔍 Cari listing/seller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchListings()}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Semua Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="SOLD">Sold</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Semua Kategori</option>
            <option value="AKUN">Akun</option>
            <option value="ITEM">Item</option>
            <option value="JASA">Jasa</option>
          </select>
          <select
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            onClick={fetchListings}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4 text-sm text-gray-600 dark:text-gray-300">
        Menampilkan {listings.length} dari {total} listing • Halaman {page} dari {totalPages}
      </div>

      {/* Listings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b dark:border-gray-600">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">ID</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Judul</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Game</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Kategori</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Harga</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Seller</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{listing.id}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-800 dark:text-white">{listing.title}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{listing.description}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{listing.game_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{listing.category}</td>
                  <td className="px-4 py-3 text-sm font-medium text-green-600">
                    Rp{(listing.price || 0).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-800 dark:text-white">{listing.seller_name}</div>
                    <div className="text-xs text-gray-500">{listing.seller_email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(listing.status)}`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {listing.status !== 'ACTIVE' && (
                        <button
                          onClick={() => handleStatusChange(listing.id, 'ACTIVE')}
                          disabled={actionLoading === listing.id}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                        >
                          ✓
                        </button>
                      )}
                      {listing.status !== 'REJECTED' && (
                        <button
                          onClick={() => handleStatusChange(listing.id, 'REJECTED')}
                          disabled={actionLoading === listing.id}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                          ✗
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={actionLoading === listing.id}
                        className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t dark:border-gray-700 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
