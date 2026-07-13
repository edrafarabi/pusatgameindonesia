import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export default function RekberPage() {
  const steps = [
    { title: 'Cari Produk', desc: 'Browse akun atau item game yang kamu mau' },
    { title: 'Pilih Admin', desc: 'Pilih admin yang akan mengawasi transaksi' },
    { title: 'Bayar', desc: 'Uang ditahan oleh sistem rekber' },
    { title: 'Seller Kirim', desc: 'Seller mengirim akun/item ke kamu' },
    { title: 'Konfirmasi', desc: 'Barang diterima, uang dilepas ke seller' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
        <div className="w-14 h-14 bg-[#3b82f6]/10 rounded-2xl flex items-center justify-center mx-auto mb-3"><Shield size={28} className="text-[#3b82f6]" /></div>
        <h1 className="text-xl font-bold">Rekber (Rekening Bersama)</h1>
        <p className="text-[13px] text-[#94a3b8] mt-1.5 max-w-md mx-auto">Transaksi aman. Uang ditahan sampai kamu konfirmasi barang diterima.</p>
      </div>

      <div className="bg-[#1e293b]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
        <h2 className="text-[14px] font-bold mb-4">Cara Kerja</h2>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#3b82f6]/10 flex items-center justify-center text-[12px] font-bold text-[#3b82f6] shrink-0">{i + 1}</div>
              <div>
                <h3 className="font-semibold text-[13px]">{s.title}</h3>
                <p className="text-[12px] text-[#94a3b8]">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-6">
        <Link to="/produk" className="inline-flex items-center gap-2 px-8 py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl text-[14px] font-bold transition-all">
          Mulai Belanja <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
