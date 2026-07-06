import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  WAITING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export default function AdminTransactions() {
  const { api } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { loadTransactions(); }, [page, search, statusFilter, typeFilter]);

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const data = await api(`/api/admin/transactions?${params}`);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api(`/api/admin/transactions/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      loadTransactions();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">💳 Kelola Transaksi</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Cari ID/nama/item..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white flex-1 min-w-[200px]"
        />
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">Semua Status</option>
          <option value="WAITING_PAYMENT">Waiting Payment</option>
          <option value="PAID">Paid</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">Semua Tipe</option>
          <option value="TOPUP">Top Up</option>
          <option value="ACCOUNT">Akun Game</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Tipe</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Item</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Target</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Harga</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Status</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">SN</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Tanggal</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{t.id.substring(0, 20)}...</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${t.type === 'TOPUP' ? 'bg-cyan-100 text-cyan-700' : 'bg-orange-100 text-orange-700'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-800 dark:text-white">{t.item_name || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">{t.target_no || '-'}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-white">
                  {t.price ? `Rp${t.price.toLocaleString('id-ID')}` : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] || 'bg-gray-100'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-gray-500">{t.sn || '-'}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleString('id-ID') : '-'}</td>
                <td className="px-4 py-3">
                  <select
                    defaultValue=""
                    onChange={e => { if (e.target.value) updateStatus(t.id, e.target.value); e.target.value = ''; }}
                    className="px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:text-white"
                  >
                    <option value="" disabled>Ubah</option>
                    <option value="COMPLETED">✅ Completed</option>
                    <option value="FAILED">❌ Failed</option>
                    <option value="REFUNDED">💸 Refunded</option>
                    <option value="PAID">💰 Paid</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transactions.length === 0 && <p className="text-center py-8 text-gray-400">Tidak ada transaksi ditemukan</p>}
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">Total: {total} transaksi</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">← Prev</button>
          <span className="px-3 py-1 text-gray-600 dark:text-gray-300">Hal {page}</span>
          <button disabled={transactions.length < 20} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Next →</button>
        </div>
      </div>
    </div>
  );
}
