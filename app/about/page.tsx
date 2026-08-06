"use client";

import Link from "next/link";
import { Shield, BadgeCheck, Headphones, Wallet, Lock, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Tentang Pusat Game Indonesia</h1>
        <p className="text-gray-500 mt-2">
          Marketplace jual beli akun & item game dengan sistem rekber otomatis
        </p>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white mb-10">
        <h2 className="text-xl font-bold mb-3">Kenapa Pilih Kami?</h2>
        <p className="text-white/80 text-sm leading-relaxed">
          Kami adalah platform rekber marketplace game terpercaya di Indonesia. Setiap transaksi
          dijaga oleh sistem escrow otomatis — uang pembeli aman di rekber sampai item diterima,
          lalu dana cair ke seller setelah konfirmasi. Bebas penipuan, bebas khawatir.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {[
          { icon: <Shield size={22} />, title: "Rekber Aman", desc: "Dana ditahan sistem sampai item diterima" },
          { icon: <Lock size={22} />, title: "Pembayaran QRIS", desc: "Bayar otomatis & cepat via QRIS" },
          { icon: <Wallet size={22} />, title: "Withdraw Mudah", desc: "Saldo seller cair kapan saja" },
          { icon: <BadgeCheck size={22} />, title: "Seller Terverifikasi", desc: "Semua seller diverifikasi admin" },
          { icon: <Zap size={22} />, title: "Proses Cepat", desc: "Transaksi selesai dalam hitungan menit" },
          { icon: <Headphones size={22} />, title: "CS 24/7", desc: "Bantuan kapan pun kamu butuh" },
        ].map((f, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-5">
            <div className="text-purple-600 mb-3">{f.icon}</div>
            <div className="font-semibold text-gray-900 text-sm">{f.title}</div>
            <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Fee */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-10">
        <h2 className="font-bold text-gray-900 mb-4">Fee & Ketentuan</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>Fee rekber per transaksi</span>
            <span className="font-semibold text-purple-600">5% (min Rp 2.500)</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>Waktu cair ke seller</span>
            <span className="font-semibold">Setelah buyer konfirmasi</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span>Metode pembayaran</span>
            <span className="font-semibold">QRIS (semua e-wallet & bank)</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Withdraw seller</span>
            <span className="font-semibold">Transfer bank / e-wallet</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/sell"
          className="inline-block px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
        >
          Mulai Jual Sekarang
        </Link>
        <div className="mt-3">
          <Link href="/listings" className="text-sm text-purple-600 hover:underline">
            atau cari item yang kamu mau →
          </Link>
        </div>
      </div>
    </div>
  );
}
