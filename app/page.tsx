"use client";

import Link from "next/link";
import { listings, categories, formatPrice } from "@/lib/data";
import { Star, BadgeCheck, Flame, TrendingUp, Clock } from "lucide-react";

export default function Home() {
  const featured = listings.filter((l) => l.verified);
  const topSelling = [...listings].sort((a, b) => b.sold - a.sold).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Hero Banner */}
      <section className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white">
        <div className="relative z-10 px-6 py-10 md:px-12 md:py-16">
          <h1 className="text-2xl md:text-4xl font-bold max-w-lg">
            Jual & Beli Akun Game dengan <span className="text-amber-300">Aman</span> & <span className="text-amber-300">Terpercaya</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-white/80 max-w-md">
            Rekber otomatis, transaksi aman, dan ribuan item game siap dibeli. Fee terendah se-Indonesia.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/listings"
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-sm font-semibold text-white transition-colors"
            >
              Lihat Semua Item
            </Link>
            <Link
              href="/sell"
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur text-sm font-semibold transition-colors"
            >
              Jual Item Kamu
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 mt-4 text-center">
        {[
          { value: "12.4K+", label: "Transaksi" },
          { value: "2.1K+", label: "Seller" },
          { value: "98.7%", label: "Kepuasan" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl py-4 border border-gray-100 shadow-sm">
            <div className="text-xl md:text-2xl font-bold text-purple-600">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Kategori Game</h2>
          <Link href="/categories" className="text-sm text-purple-600 hover:text-purple-700">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="group flex flex-col items-center bg-white rounded-xl p-4 border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className={`w-12 h-12 rounded-full ${c.color} flex items-center justify-center text-white text-xl mb-2 group-hover:scale-110 transition-transform`}>
                {c.icon}
              </div>
              <span className="text-xs text-center font-medium text-gray-700 line-clamp-2">
                {c.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="mt-8 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 p-4 flex items-center justify-between">
        <div className="text-white">
          <div className="font-bold text-lg">🔥 Promo Akhir Bulan</div>
          <div className="text-sm text-white/90">Diskon hingga 40% untuk semua item game</div>
        </div>
        <Link
          href="/listings"
          className="shrink-0 px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-orange-50"
        >
          Klaim
        </Link>
      </section>

      {/* Top Selling */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <Flame className="text-orange-500" size={20} />
            Terlaris Minggu Ini
          </h2>
          <Link href="/listings" className="text-sm text-purple-600 hover:text-purple-700">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {topSelling.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <BadgeCheck className="text-purple-600" size={20} />
            Seller Terverifikasi
          </h2>
          <Link href="/listings" className="text-sm text-purple-600 hover:text-purple-700">
            Lihat semua
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {featured.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-10 mb-8">
        <h2 className="text-center text-xl font-bold text-gray-900 mb-6">Cara Kerja Rekber Aman</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🛒", title: "Pilih Item", desc: "Cari item yang kamu mau" },
            { icon: "💳", title: "Bayar QRIS", desc: "Pembayaran otomatis via QRIS" },
            { icon: "🤝", title: "Transaksi", desc: "Seller kirim, kamu cek" },
            { icon: "✅", title: "Selesai", desc: "Konfirmasi, dana cair ke seller" },
          ].map((s, i) => (
            <div key={i} className="relative bg-white rounded-xl p-5 border border-gray-100 shadow-sm text-center">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="font-semibold text-gray-900">{s.title}</div>
              <div className="text-xs text-gray-500 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ item }: { item: (typeof listings)[0] }) {
  return (
    <Link
      href={`/listing/${item.id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {item.originalPrice && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{Math.round((1 - item.price / item.originalPrice) * 100)}%
          </span>
        )}
        {item.verified && (
          <span className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <BadgeCheck size={10} /> Trusted
          </span>
        )}
      </div>
      <div className="p-3">
        <div className="text-[11px] text-gray-400">{item.category}</div>
        <div className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] leading-snug mt-0.5">
          {item.title}
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-[11px] text-gray-500">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span>{item.rating}</span>
          <span className="text-gray-300">|</span>
          <span className="flex items-center gap-0.5">
            <Clock size={10} /> {item.sold} terjual
          </span>
        </div>
        <div className="mt-1.5 font-bold text-purple-600 text-sm">
          {formatPrice(item.price)}
        </div>
      </div>
    </Link>
  );
}
