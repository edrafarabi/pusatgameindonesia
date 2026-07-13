import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex flex-col items-center justify-center px-4 py-10 text-center">
      <h1 className="text-7xl font-black text-[#3b82f6]/20 mb-4">404</h1>
      <h2 className="text-lg font-bold mb-1">Halaman Tidak Ditemukan</h2>
      <p className="text-[13px] text-[#94a3b8] max-w-xs mx-auto leading-relaxed mb-6">Halaman yang kamu cari tidak ada atau telah dipindahkan.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[14px] px-6 py-2.5 rounded-xl transition-all">
        <ArrowLeft size={16} /> Kembali
      </Link>
    </div>
  );
}
