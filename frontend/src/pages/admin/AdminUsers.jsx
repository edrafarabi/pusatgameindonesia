import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, ChevronLeft, ChevronRight, Users, Pencil, Trash2, X, Check, ShieldCheck, User } from 'lucide-react';

const ROLE_BADGE = {
  SUPERADMIN: { color: '#a855f7', label: 'Super Admin' },
  ADMIN:      { color: '#3b82f6', label: 'Admin' },
  SELLER:     { color: '#22c55e', label: 'Seller' },
  BUYER:      { color: '#94a3b8', label: 'Buyer' },
};

function SkeletonRow() {
  return (
    <tr className="border-b border-[#334155]">
      <td className="px-5 py-4"><div className="h-4 w-32 bg-[#334155] rounded animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-40 bg-[#334155] rounded animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-5 w-16 bg-[#334155] rounded-full animate-pulse" /></td>
      <td className="px-5 py-4"><div className="h-4 w-20 bg-[#334155] rounded animate-pulse" /></td>
    </tr>
  );
}

export default function AdminUsers() {
  const { api, user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ page, limit: 20 });
      if (search) p.set('search', search);
      if (role) p.set('role', role);
      const d = await api(`/api/admin/users?${p}`);
      setUsers(d.users);
      setTotal(d.total);
    } catch {
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, search, role]);

  const save = async (id) => {
    try {
      await api(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(form) });
      setEditing(null);
      load();
      showToast('User berhasil diupdate');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const del = async (id, name) => {
    if (!confirm(`Hapus "${name}"?`)) return;
    try {
      await api(`/api/admin/users/${id}`, { method: 'DELETE' });
      load();
      showToast('User berhasil dihapus');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const pages = Math.ceil(total / 20);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#f8fafc] tracking-tight">Users</h1>
          <p className="text-sm text-[#94a3b8] mt-1">{total} user terdaftar</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Cari user..."
              className="w-52 pl-9 pr-3 py-2.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10/40 rounded-xl text-sm text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6]/50 transition-colors"
            />
          </div>
          <select
            value={role}
            onChange={e => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2.5 bg-[#1e293b]/60 backdrop-blur-xl border border-white/10/40 rounded-xl text-sm text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Semua Role</option>
            <option value="BUYER">Buyer</option>
            <option value="SELLER">Seller</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1e293b] rounded-2xl border border-[#475569]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#475569]/40">
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">User</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Email</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Role</th>
                <th className="px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]">
              {loading ? (
                [...Array(6)].map((_, i) => <SkeletonRow key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-16 text-center">
                    <Users size={32} className="mx-auto text-[#334155] mb-3" />
                    <p className="text-sm text-[#94a3b8]">Tidak ada user ditemukan</p>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const badge = ROLE_BADGE[u.role] || { color: '#94a3b8', label: u.role };
                  return (
                    <tr key={u.id} className="hover:bg-[#334155]/50 transition-colors">
                      {editing === u.id ? (
                        <>
                          <td className="px-5 py-3.5">
                            <input
                              value={form.name}
                              onChange={e => setForm({ ...form, name: e.target.value })}
                              className="w-full px-3 py-2 bg-[#334155] border border-[#475569]/40 rounded-lg text-sm text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors"
                            />
                          </td>
                          <td className="px-5 py-3.5">
                            <input
                              value={form.email}
                              onChange={e => setForm({ ...form, email: e.target.value })}
                              className="w-full px-3 py-2 bg-[#334155] border border-[#475569]/40 rounded-lg text-sm text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors"
                            />
                          </td>
                          <td className="px-5 py-3.5">
                            <select
                              value={form.role}
                              onChange={e => setForm({ ...form, role: e.target.value })}
                              className="px-2 py-2 bg-[#334155] border border-[#475569]/40 rounded-lg text-xs text-[#f8fafc] outline-none focus:border-[#3b82f6]/50 transition-colors appearance-none cursor-pointer"
                            >
                              <option value="BUYER">Buyer</option>
                              <option value="SELLER">Seller</option>
                              <option value="ADMIN">Admin</option>
                              <option value="SUPERADMIN">Super Admin</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              <button
                                onClick={() => save(u.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors"
                              >
                                Simpan
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                className="p-1.5 rounded-lg border border-[#475569]/40 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#334155] flex items-center justify-center">
                                {u.role === 'SUPERADMIN' || u.role === 'ADMIN' ? (
                                  <ShieldCheck size={14} className="text-[#3b82f6]" />
                                ) : (
                                  <User size={14} className="text-[#94a3b8]" />
                                )}
                              </div>
                              <span className="text-sm font-medium text-[#f8fafc]">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-sm text-[#94a3b8]">{u.email}</td>
                          <td className="px-5 py-3.5">
                            <span
                              className="text-[11px] font-medium px-2.5 py-1 rounded-full border"
                              style={{
                                color: badge.color,
                                borderColor: badge.color + '30',
                                backgroundColor: badge.color + '10',
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => { setEditing(u.id); setForm({ name: u.name, email: u.email, role: u.role }); }}
                                className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#334155] transition-colors"
                              >
                                <Pencil size={14} />
                              </button>
                              {u.id !== me?.id && (
                                <button
                                  onClick={() => del(u.id, u.name)}
                                  className="p-2 rounded-lg text-[#94a3b8] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="px-5 py-4 border-t border-[#475569]/40 flex items-center justify-between">
            <p className="text-xs text-[#64748b]">
              Halaman {page} dari {pages}
            </p>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="p-2 rounded-lg border border-[#475569]/40 text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#475569] disabled:opacity-30 disabled:hover:text-[#94a3b8] disabled:hover:border-[#475569]/40 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={page >= pages}
                onClick={() => setPage(p => p + 1)}
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
