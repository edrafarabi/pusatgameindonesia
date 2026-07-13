import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login gagal');
      login(data.user, data.token);
      navigate('/produk', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/10 ring-1 ring-[#475569] bg-[#1e293b]">
            <img src="/logo.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#f8fafc]">
            Selamat datang
          </h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">Masuk untuk mulai jual beli akun game</p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1e293b] rounded-2xl p-6 shadow-xl shadow-black/20 ring-1 ring-[#475569]">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 rounded-xl px-4 py-3 mb-5 ring-1 ring-red-500/20">
              <p className="text-[12px] text-red-400 font-medium flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="kamu@email.com"
                className="w-full rounded-xl border border-[#475569] bg-[#0f172a] px-4 py-3 text-[14px] text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                required
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-[#475569] bg-[#0f172a] px-4 py-3 pr-11 text-[14px] text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                  required
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 text-white font-semibold text-[14px] py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <>Masuk <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-[13px] text-[#94a3b8] mt-6">
          Baru di PusatGame?{' '}
          <Link to="/register" className="text-[#3b82f6] font-semibold hover:text-[#2563eb] transition-colors">Buat akun</Link>
        </p>
      </div>
    </div>
  );
}
