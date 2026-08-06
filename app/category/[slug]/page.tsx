"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { listings, categories, formatPrice } from "@/lib/data";
import { Star, BadgeCheck } from "lucide-react";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = categories.find((c) => c.slug === slug);
  const gameListings = listings.filter((l) => l.gameSlug === slug);

  if (!category) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold text-gray-900">Kategori tidak ditemukan</h1>
        <Link href="/" className="mt-4 inline-block text-purple-600 hover:underline">
          Kembali ke Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Banner */}
      <div className={`mt-4 rounded-2xl ${category.color} p-8 text-white relative overflow-hidden`}>
        <div className="relative z-10">
          <div className="text-4xl mb-2">{category.icon}</div>
          <h1 className="text-2xl md:text-3xl font-bold">{category.name}</h1>
          <p className="text-white/80 mt-1 text-sm">
            {gameListings.length} item tersedia · Transaksi aman dengan rekber
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-4">
        {["Semua", "Akun", "Top Up", "Jasa"].map((f) => (
          <button
            key={f}
            className="shrink-0 px-4 py-1.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:border-purple-400 hover:text-purple-600"
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-10">
        {gameListings.map((item) => (
          <Link
            key={item.id}
            href={`/listing/${item.id}`}
            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
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
                <span>{item.sold} terjual</span>
              </div>
              <div className="mt-1.5 font-bold text-purple-600 text-sm">
                {formatPrice(item.price)}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
