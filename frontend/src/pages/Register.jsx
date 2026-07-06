import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      setSuccess('Registrasi berhasil! Mengarahkan ke halaman login...');
      setTimeout(() => navigate('/login'), 1500);
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
          <h2 className="text-2xl font-black text-gray-800">Daftar Akun Baru</h2>
          <p className="text-xs text-gray-500 mt-1">Bergabung dengan ekosistem PusatGame</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">❌ {error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">✅ {success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Edra Wira"
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 text-xs focus:ring-1 focus:ring-[#0070f0] outline-none"
                required
              />
            </div>
          </div>

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
                placeholder="Buat password minimal 6 karakter"
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

          <div className="text-xs text-gray-600">
            Dengan mendaftar, kamu menyetujui <span className="text-[#0070f0] font-semibold cursor-pointer">Syarat & Ketentuan</span> dan <span className="text-[#0070f0] font-semibold cursor-pointer">Kebijakan Privasi</span> kami.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0070f0] hover:bg-[#005ec8] disabled:bg-gray-400 text-white font-bold text-xs py-3 rounded transition-colors shadow-sm cursor-pointer"
          >
            {loading ? '⏳ Mendaftar...' : '🚀 Daftar Akun'}
          </button>
        </form>

        <div className="text-center text-xs text-gray-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#0070f0] hover:underline font-bold">Masuk Sekarang</Link>
        </div>
      </div>
    </div>
  );
}
