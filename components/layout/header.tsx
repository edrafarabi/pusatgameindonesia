"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ShoppingCart, Bell, User, Menu } from "lucide-react";
import { useRouter } from "next/navigation";

const games = [
  { name: "Mobile Legends", slug: "ml", color: "bg-blue-500" },
  { name: "PUBG Mobile", slug: "pubg", color: "bg-orange-500" },
  { name: "Genshin Impact", slug: "genshin", color: "bg-teal-500" },
  { name: "Honkai Star Rail", slug: "honkai-sr", color: "bg-purple-500" },
  { name: "Free Fire", slug: "ff", color: "bg-red-500" },
  { name: "Valorant", slug: "valorant", color: "bg-violet-500" },
  { name: "One Piece Bounty Rush", slug: "opbr", color: "bg-amber-500" },
];

export default function Header() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/listings?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0f1b2d] text-white shadow-md">
      {/* Top bar */}
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Mobile menu */}
          <button className="lg:hidden p-2" aria-label="Menu">
            <Menu size={20} />
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="text-xl font-bold">
              Pusat<span className="text-amber-400">Game</span>
              <span className="text-purple-400">ID</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari item, akun, jasa top up..."
                className="w-full rounded-lg bg-white/10 border border-white/20 px-4 py-2.5 pl-10 text-sm placeholder:text-gray-400 focus:outline-none focus:border-amber-400 focus:bg-white/15"
              />
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </form>

          {/* Icons */}
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <Link
              href="/sell"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors"
            >
              Jual
            </Link>
            <button className="p-2 hover:bg-white/10 rounded-lg" aria-label="Notifikasi">
              <Bell size={20} />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg" aria-label="Keranjang">
              <ShoppingCart size={20} />
            </button>
            <Link
              href="/about"
              className="p-2 hover:bg-white/10 rounded-lg"
              aria-label="Akun"
            >
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Category bar */}
      <nav className="border-t border-white/10 bg-[#0f1b2d]">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
            <Link
              href="/listings"
              className="shrink-0 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Semua
            </Link>
            {games.map((g) => (
              <Link
                key={g.slug}
                href={`/category/${g.slug}`}
                className="shrink-0 px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
