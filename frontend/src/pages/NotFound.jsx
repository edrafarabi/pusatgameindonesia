import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="bg-[#f5f6f9] min-h-[calc(100vh-100px)] flex flex-col items-center justify-center py-10 px-4 text-center pb-20">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-6xl font-black text-[#0070f0]">404</h1>
        <h2 className="text-xl font-bold text-gray-800">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
          Maaf, halaman yang kamu cari tidak dapat ditemukan atau telah dipindahkan.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#0070f0] hover:bg-[#005ec8] text-white font-bold text-xs px-6 py-2.5 rounded transition-colors shadow-sm"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
