"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { listings, categories, formatPrice } from "@/lib/data";
import { Star, BadgeCheck, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedGame, setSelectedGame] = useState("Semua");
  const [sort, setSort] = useState("terlaris");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = useMemo(() => {
    let result = [...listings];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.game.toLowerCase().includes(q) ||
          l.seller.toLowerCase().includes(q)
      );
    }

    if (selectedGame !== "Semua") {
      result = result.filter((l) => l.game === selectedGame);
    }

    switch (sort) {
      case "termurah":
        result.sort((a, b) => a.price - b.price);
        break;
      case "termahal":
        result.sort((a, b) => b.price - a.price);
        break;
      case "terlaris":
        result.sort((a, b) => b.sold - a.sold);
        break;
      default:
        break;
    }

    return result;
  }, [query, selectedGame, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4">
      <div className="py-6">
        <h1 className="text-2xl font-bold text-gray-900">Cari Item</h1>
        <p className="text-sm text-gray-500 mt-1">
          {filtered.length} item ditemukan
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari item, akun, jasa..."
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 pl-10 text-sm focus:outline-none focus:border-purple-500"
          />
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-purple-400 hover:text-purple-600 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>
      </div>

      {/* Filter panel */}
      {showFilter && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Game</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGame("Semua")}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedGame === "Semua"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Semua
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedGame(c.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedGame === c.name
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Urutkan</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="terlaris">Terlaris</option>
              <option value="termurah">Harga Terendah</option>
              <option value="termahal">Harga Tertinggi</option>
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900">Item tidak ditemukan</h3>
          <p className="text-sm text-gray-500 mt-1">Coba kata kunci lain</p>
          <button
            onClick={() => {
              setQuery("");
              setSelectedGame("Semua");
            }}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pb-10">
          {filtered.map((item) => (
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
                <div className="text-[11px] text-gray-400">{item.game}</div>
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
      )}
    </div>
  );
}
