"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { listings, formatPrice } from "@/lib/data";
import {
  Star,
  BadgeCheck,
  Shield,
  Clock,
  Share2,
  Heart,
  Flag,
  ChevronRight,
} from "lucide-react";

export default function ListingDetailPage() {
  const params = useParams();
  const item = listings.find((l) => l.id === params.id);

  if (!item) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold text-gray-900">Item tidak ditemukan</h1>
        <Link href="/listings" className="mt-4 inline-block text-purple-600 hover:underline">
          Lihat semua item
        </Link>
      </div>
    );
  }

  const related = listings
    .filter((l) => l.game === item.game && l.id !== item.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 py-4">
        <Link href="/" className="hover:text-purple-600">Home</Link>
        <ChevronRight size={14} />
        <Link href={`/category/${item.gameSlug}`} className="hover:text-purple-600">
          {item.game}
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{item.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-6 pb-10">
        {/* Image */}
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100">
            <img src={item.image} alt={item.title} className="w-full aspect-square object-cover" />
            {item.verified && (
              <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <BadgeCheck size={12} /> Trusted Seller
              </span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600">
              <Heart size={16} /> Simpan
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600">
              <Share2 size={16} /> Bagikan
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-500 hover:border-red-300 hover:text-red-500">
              <Flag size={16} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <span>{item.game}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>{item.category}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mt-2 leading-snug">
            {item.title}
          </h1>

          <div className="flex items-center gap-3 mt-3 text-sm">
            <div className="flex items-center gap-1 text-gray-700">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold">{item.rating}</span>
              <span className="text-gray-400">({(item.sold * 3).toLocaleString("id-ID")} ulasan)</span>
            </div>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span className="text-gray-500 flex items-center gap-1">
              <Clock size={14} /> {item.sold} terjual
            </span>
          </div>

          {/* Price */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4">
            <div className="text-xs text-gray-500">Harga</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-purple-600">{formatPrice(item.price)}</span>
              {item.originalPrice && (
                <>
                  <span className="text-sm text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                    -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { icon: <Shield size={18} />, title: "Rekber Aman", desc: "Dana aman di rekber" },
              { icon: <Clock size={18} />, title: "Proses Cepat", desc: "Max 15 menit" },
              { icon: <BadgeCheck size={18} />, title: "Terverifikasi", desc: "Seller terpercaya" },
            ].map((b, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 text-center">
                <div className="flex justify-center text-purple-600 mb-1">{b.icon}</div>
                <div className="text-xs font-semibold text-gray-900">{b.title}</div>
                <div className="text-[10px] text-gray-500">{b.desc}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button className="w-full mt-5 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors">
            Beli Sekarang · {formatPrice(item.price)}
          </button>
          <button className="w-full mt-2 py-3 rounded-xl border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold transition-colors">
            Hubungi Seller
          </button>

          {/* Seller info */}
          <div className="mt-5 bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg">
              {item.seller[0]}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                {item.seller}
                {item.verified && <BadgeCheck size={14} className="text-purple-600" />}
              </div>
              <div className="text-xs text-gray-500">
                {item.sold} terjual · respon cepat
              </div>
            </div>
            <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium text-gray-700">
              Lihat Toko
            </button>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="pb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Deskripsi Item</h2>
        <div className="bg-white border border-gray-100 rounded-xl p-5 text-sm text-gray-600 leading-relaxed">
          <p>
            ✅ Akun {item.game} dengan {item.title.toLowerCase()} lengkap
          </p>
          <p className="mt-2">✅ Email dan password akan dikirim setelah pembayaran dikonfirmasi oleh sistem rekber</p>
          <p className="mt-2">✅ Garansi ganti rugi 100% jika akun tidak sesuai deskripsi</p>
          <p className="mt-2">⚠️ Dilarang mengganti email/akun sebelum transaksi selesai</p>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="pb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Item Serupa</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/listing/${r.id}`}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 line-clamp-2">{r.title}</div>
                  <div className="mt-1 font-bold text-purple-600 text-sm">{formatPrice(r.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
