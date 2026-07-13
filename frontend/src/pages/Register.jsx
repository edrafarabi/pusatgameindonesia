import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const next = () => {
    setError('');
    if (!form.name.trim()) return setError('Nama wajib diisi');
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return setError('Email tidak valid');
    setStep(2);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password minimal 6 karakter');
    if (form.password !== form.confirm) return setError('Password tidak cocok');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal daftar');
      navigate('/login', { state: { success: 'Akun berhasil dibuat! Silakan masuk.' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Lemah', 'Sedang', 'Kuat'][strength];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-[#3b82f6]'][strength];

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/10 ring-1 ring-[#475569] bg-[#1e293b]">
            <img src="/logo.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#f8fafc]">Buat Akun</h1>
          <p className="text-[13px] text-[#94a3b8] mt-1">Gratis, cuma butuh 1 menit</p>
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 mb-5">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-[#3b82f6]' : 'w-4 bg-[#334155]'}`} />
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#1e293b] rounded-2xl p-6 shadow-xl shadow-black/20 ring-1 ring-[#475569]">
          {error && (
            <div className="flex items-center gap-2.5 bg-red-500/10 rounded-xl px-4 py-3 mb-5 ring-1 ring-red-500/20">
              <p className="text-[12px] text-red-400 font-medium flex-1">{error}</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">Nama</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama kamu"
                  className="w-full rounded-xl border border-[#475569] bg-[#0f172a] px-4 py-3 text-[14px] text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="kamu@email.com"
                  className="w-full rounded-xl border border-[#475569] bg-[#0f172a] px-4 py-3 text-[14px] text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                />
              </div>
              <button type="button" onClick={next}
                className="w-full rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-[14px] py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
                Lanjut <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Minimal 6 karakter"
                    className="w-full rounded-xl border border-[#475569] bg-[#0f172a] px-4 py-3 pr-11 text-[14px] text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 transition"
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#94a3b8] hover:text-[#f8fafc] transition-colors">
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-[#334155]'}`} />
                      ))}
                    </div>
                    <span className={`text-[10px] font-bold ${strength === 1 ? 'text-red-400' : strength === 2 ? 'text-amber-500' : 'text-[#3b82f6]'}`}>{strengthLabel}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#94a3b8] mb-1.5">Ulangi Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={e => setForm({ ...form, confirm: e.target.value })}
                    placeholder="Ketik ulang password"
                    className={`w-full rounded-xl border bg-[#0f172a] px-4 py-3 text-[14px] text-[#f8fafc] placeholder:text-[#64748b] outline-none focus:ring-2 focus:ring-[#3b82f6]/20 transition ${
                      form.confirm && form.password !== form.confirm ? 'border-red-500/50 focus:border-red-400' : 'border-[#475569] focus:border-[#3b82f6]'
                    }`}
                  />
                  {form.confirm && form.password === form.confirm && (
                    <Check size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3b82f6]" />
                  )}
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-[11px] text-red-400 mt-1.5 font-medium">Password tidak cocok</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setStep(1); setError(''); }}
                  className="w-12 rounded-xl border border-[#475569] hover:bg-[#334155] flex items-center justify-center transition-all">
                  <ArrowLeft size={18} className="text-[#94a3b8]" />
                </button>
                <button type="submit" disabled={loading || (form.confirm && form.password !== form.confirm)}
                  className="flex-1 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 text-white font-semibold text-[14px] py-3.5 flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <>Buat Akun <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[13px] text-[#94a3b8] mt-6">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-[#3b82f6] font-semibold hover:text-[#2563eb] transition-colors">Masuk</Link>
        </p>
      </div>
    </div>
  );
}
