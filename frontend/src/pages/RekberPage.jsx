import { Link } from 'react-router-dom';
import { Shield, CheckCircle, MessageCircle, CreditCard, ArrowRight } from 'lucide-react';

export default function RekberPage() {
  const steps = [
    { icon: '🔍', title: 'Cari Produk', desc: 'Browse akun atau item game yang kamu mau' },
    { icon: '💬', title: 'Chat Seller', desc: 'Tanya detail produk langsung ke seller' },
    { icon: '💳', title: 'Bayar ke Rekber', desc: 'Uang ditahan oleh sistem rekber kami' },
    { icon: '📦', title: 'Seller Kirim', desc: 'Seller mengirim akun/item ke kamu' },
    { icon: '✅', title: 'Konfirmasi', desc: 'Kamu terima barang, uang dilepas ke seller' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield size={32} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-black dark:text-white">Rekber (Rekening Bersama)</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-md mx-auto">
          Transaksi aman di PusatGameIndonesia. Uang ditahan oleh sistem sampai kamu konfirmasi barang diterima.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold mb-4 dark:text-white">Cara Kerja Rekber</h2>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-xl shrink-0">
                {s.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{i + 1}</span>
                  <h3 className="font-semibold text-sm dark:text-white">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Shield, title: 'Aman 100%', desc: 'Uang dijamin sampai deal', color: 'text-green-500 bg-green-50 dark:bg-green-900/30' },
          { icon: MessageCircle, title: 'Chat Langsung', desc: 'Komunikasi dengan seller', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/30' },
          { icon: CreditCard, title: 'Bayar Mudah', desc: 'Berbagai metode bayar', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/30' },
        ].map((f, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 text-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto ${f.color}`}>
              <f.icon size={20} />
            </div>
            <h3 className="font-bold text-sm mt-2 dark:text-white">{f.title}</h3>
            <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link to="/produk" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
          Mulai Belanja <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
