import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAdmin } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login gagal');
      }

      // Simpan auth ke context + localStorage
      login(data.user, data.token);

      // Redirect: admin ke /admin, user biasa ke / atau redirect param
      const redirect = searchParams.get('redirect');
      if (data.user.role === 'ADMIN' || data.user.role === 'SUPERADMIN') {
        navigate(redirect || '/admin');
      } else {
        navigate(redirect || '/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f6f9] min-h-[calc(100vh-100px)] flex flex-col justify-center py-10 px-4 pb-20">
      <div className="max-w-md w-full mx-auto bg-white rounded-lg p-6 border border-gray-200 shadow-sm space-y-6">
        
        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-black text-gray-800">Selamat Datang Kembali</h2>
          <p className="text-xs text-gray-500 mt-1">Masuk ke akun PusatGame kamu</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Contoh: user@email.com"
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Masukkan password"
                className="w-full border border-gray-300 rounded pl-10 pr-10 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-1.5 text-gray-600">
              <input type="checkbox" className="rounded text-[#0070f0]" />
              Ingat Saya
            </label>
            <Link to="/" className="text-[#0070f0] hover:underline font-semibold">Lupa Password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0070f0] hover:bg-[#005ec8] disabled:bg-gray-400 text-white font-bold text-xs py-3 rounded transition-colors shadow-sm cursor-pointer"
          >
            {loading ? '⏳ Masuk...' : '🚀 Masuk ke Akun'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-600">
          Belum punya akun?{' '}
          <Link to="/register" className="text-[#0070f0] hover:underline font-bold">Daftar Sekarang</Link>
        </div>
      </div>
    </div>
  );
}
