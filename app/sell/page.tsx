"use client";

import { useState } from "react";
import Link from "next/link";
import { categories } from "@/lib/data";
import { Upload, ShieldCheck, Info, ChevronLeft } from "lucide-react";

export default function SellPage() {
  const [game, setGame] = useState("");
  const [category, setCategory] = useState("Akun");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Fitur ini akan segera hadir! Admin akan menghubungi kamu.");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 mb-6">
        <ChevronLeft size={16} /> Kembali
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">Jual Item Kamu</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Pasang item mu di Pusat Game Indonesia, dijual ke ribuan pembeli
      </p>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { n: 1, t: "Isi Form", d: "Lengkapi detail item" },
          { n: 2, t: "Admin Verifikasi", d: "Maks 24 jam" },
          { n: 3, t: "Langsung Jual", d: "Muncul di marketplace" },
        ].map((s) => (
          <div key={s.n} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <div className="w-8 h-8 mx-auto rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm mb-2">
              {s.n}
            </div>
            <div className="text-sm font-semibold text-gray-900">{s.t}</div>
            <div className="text-[11px] text-gray-500">{s.d}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        {/* Game */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Game <span className="text-red-500">*</span>
          </label>
          <select
            value={game}
            onChange={(e) => setGame(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">Pilih game...</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
          <div className="grid grid-cols-3 gap-2">
            {["Akun", "Top Up", "Jasa"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  category === c
                    ? "border-purple-600 bg-purple-50 text-purple-700"
                    : "border-gray-200 text-gray-600 hover:border-purple-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Judul Item <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Contoh: Akun ML Mythic 150+ hero, 800+ skin"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Harga (Rp) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min={10000}
            placeholder="100000"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500"
          />
          <p className="text-[11px] text-gray-400 mt-1">Fee rekber 5% akan dipotong otomatis</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Detail</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={4}
            placeholder="Jelaskan detail item: rank, skin, hero, karakter, dll"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-purple-500 resize-none"
          />
        </div>

        {/* Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Foto Item</label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors cursor-pointer">
            <Upload className="mx-auto text-gray-400 mb-2" size={28} />
            <div className="text-sm text-gray-600 font-medium">Klik untuk upload foto</div>
            <div className="text-xs text-gray-400 mt-1">JPG/PNG maks 5MB, maks 5 foto</div>
          </div>
        </div>

        {/* Fee info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <div className="font-semibold mb-1">Info Fee</div>
            Fee rekber 5% (min Rp 2.500). Uang penjualan langsung masuk ke saldo kamu setelah pembeli konfirmasi, bisa di-withdraw kapan saja.
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
        >
          Submit Item untuk Verifikasi
        </button>
      </form>

      <div className="flex items-center gap-2 justify-center mt-6 text-xs text-gray-400">
        <ShieldCheck size={14} className="text-green-500" />
        Semua item diverifikasi admin sebelum tampil
      </div>
    </div>
  );
}
