"use client";

import Link from "next/link";
import { categories } from "@/lib/data";

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Kategori Game</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Pilih game untuk melihat semua item yang tersedia
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-purple-300 hover:shadow-lg transition-all"
          >
            <div className={`w-16 h-16 rounded-2xl ${c.color} flex items-center justify-center text-white text-3xl mb-4 group-hover:scale-110 transition-transform`}>
              {c.icon}
            </div>
            <h3 className="font-semibold text-gray-900">{c.name}</h3>
            <div className="text-xs text-gray-400 mt-1">Akun · Top Up · Jasa</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
