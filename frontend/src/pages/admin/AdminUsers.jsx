import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { api, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { loadUsers(); }, [page, search, roleFilter]);

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const data = await api(`/api/admin/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (id) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(editForm) });
      setEditing(null);
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus user "${name}"?`)) return;
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      loadUsers();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">👥 Kelola User</h2>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="🔍 Cari nama/email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white flex-1 min-w-[200px]"
        />
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white">
          <option value="">Semua Role</option>
          <option value="BUYER">Buyer</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
          <option value="SUPERADMIN">Super Admin</option>
        </select>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Nama</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Role</th>
              <th className="px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                {editing === u.id ? (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.id}</td>
                    <td className="px-4 py-3">
                      <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                        className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white w-full" />
                    </td>
                    <td className="px-4 py-3">
                      <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})}
                        className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white w-full" />
                    </td>
                    <td className="px-4 py-3">
                      <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
                        className="px-2 py-1 border rounded dark:bg-gray-700 dark:text-white">
                        <option value="BUYER">Buyer</option>
                        <option value="SELLER">Seller</option>
                        <option value="ADMIN">Admin</option>
                        <option value="SUPERADMIN">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => handleUpdate(u.id)} className="px-3 py-1 bg-green-500 text-white rounded text-sm">💾</button>
                      <button onClick={() => setEditing(null)} className="px-3 py-1 bg-gray-500 text-white rounded text-sm">✕</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'SUPERADMIN' ? 'bg-red-100 text-red-700' :
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                        u.role === 'SELLER' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => { setEditing(u.id); setEditForm({ name: u.name, email: u.email, role: u.role }); }}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">✏️</button>
                      {u.id !== currentUser?.id && (
                        <button onClick={() => handleDelete(u.id, u.name)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">🗑️</button>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center py-8 text-gray-400">Tidak ada user ditemukan</p>}
      </div>

      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-500">Total: {total} user</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">← Prev</button>
          <span className="px-3 py-1 text-gray-600 dark:text-gray-300">Hal {page}</span>
          <button disabled={users.length < 20} onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50">Next →</button>
        </div>
      </div>
    </div>
  );
}
