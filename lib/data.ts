export interface Listing {
  id: string;
  title: string;
  game: string;
  gameSlug: string;
  price: number;
  originalPrice?: number;
  image: string;
  seller: string;
  sold: number;
  rating: number;
  category: string;
  verified?: boolean;
}

export const categories = [
  { name: "Mobile Legends", slug: "ml", icon: "🎮", color: "bg-blue-500" },
  { name: "PUBG Mobile", slug: "pubg", icon: "🔫", color: "bg-orange-500" },
  { name: "Genshin Impact", slug: "genshin", icon: "⚔️", color: "bg-teal-500" },
  { name: "Honkai Star Rail", slug: "honkai-sr", icon: "🌌", color: "bg-purple-500" },
  { name: "Free Fire", slug: "ff", icon: "🔥", color: "bg-red-500" },
  { name: "Valorant", slug: "valorant", icon: "🎯", color: "bg-violet-500" },
  { name: "One Piece Bounty Rush", slug: "opbr", icon: "🏴‍☠️", color: "bg-amber-500" },
];

const g = (seed: number) => {
  const urls = [
    "https://i.pinimg.com/736x/9c/3d/e8/9c3de8e0b2c0fcd4b6d2d1a3cf6b32f9.jpg",
    "https://i.pinimg.com/736x/8e/6f/1f/8e6f1f2d5b6c7e8f9a0b1c2d3e4f5a6b.jpg",
    "https://i.pinimg.com/736x/4f/5a/6b/4f5a6b4c5d6e7f8a9b0c1d2e3f4a5b6c.jpg",
    "https://i.pinimg.com/736x/2a/3b/4c/2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d.jpg",
    "https://i.pinimg.com/736x/1b/2c/3d/1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e.jpg",
    "https://i.pinimg.com/736x/7d/8e/9f/7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a.jpg",
  ];
  return urls[seed % urls.length];
};

export const listings: Listing[] = [
  // ML
  { id: "ml-1", title: "Akun ML Sultan 1500+ skin, 327 hero, epic sampai mythic", game: "Mobile Legends", gameSlug: "ml", price: 1850000, originalPrice: 2500000, image: g(0), seller: "SultanAcc", sold: 342, rating: 4.9, category: "Akun", verified: true },
  { id: "ml-2", title: "Akun ML Legend 900 skin kolektor lengkap", game: "Mobile Legends", gameSlug: "ml", price: 950000, image: g(0), seller: "TopAccID", sold: 128, rating: 4.8, category: "Akun" },
  { id: "ml-3", title: "Jasa Push Rank ML Mythic - 2x lipat, cepat", game: "Mobile Legends", gameSlug: "ml", price: 45000, image: g(0), seller: "JokiPro", sold: 2100, rating: 4.7, category: "Jasa" },
  // PUBG
  { id: "pubg-1", title: "Akun PUBG Conqueror outfit legendary lengkap", game: "PUBG Mobile", gameSlug: "pubg", price: 2750000, originalPrice: 3200000, image: g(1), seller: "ChickenDinner", sold: 89, rating: 4.9, category: "Akun", verified: true },
  { id: "pubg-2", title: "UC 6600 - Top up murah cepat", game: "PUBG Mobile", gameSlug: "pubg", price: 320000, image: g(1), seller: "UCKing", sold: 5400, rating: 4.8, category: "Top Up" },
  // Genshin
  { id: "genshin-1", title: "Akun Genshin AR 60, C6 Raiden, semua 5 star", game: "Genshin Impact", gameSlug: "genshin", price: 4500000, image: g(2), seller: "TeyvatTreasure", sold: 45, rating: 5.0, category: "Akun", verified: true },
  { id: "genshin-2", title: "Genesis Crystal 9800 - Top up aman", game: "Genshin Impact", gameSlug: "genshin", price: 1200000, image: g(2), seller: "PrimoFast", sold: 890, rating: 4.6, category: "Top Up" },
  // HSR
  { id: "hsr-1", title: "Akun HSR TL 70, E2 Kafka + Blade", game: "Honkai Star Rail", gameSlug: "honkai-sr", price: 2800000, image: g(3), seller: "AetherDream", sold: 67, rating: 4.9, category: "Akun" },
  // FF
  { id: "ff-1", title: "Akun FF 5 season max, Diamond + skin M4", game: "Free Fire", gameSlug: "ff", price: 650000, originalPrice: 900000, image: g(4), seller: "BooyahAcc", sold: 156, rating: 4.7, category: "Akun" },
  { id: "ff-2", title: "Diamond FF 1000 - Instant", game: "Free Fire", gameSlug: "ff", price: 95000, image: g(4), seller: "DiaCepat", sold: 3200, rating: 4.8, category: "Top Up" },
  // Valorant
  { id: "val-1", title: "Akun Valorant Radiant, semua skin premium", game: "Valorant", gameSlug: "valorant", price: 5200000, image: g(5), seller: "AimLab", sold: 23, rating: 5.0, category: "Akun", verified: true },
  { id: "val-2", title: "VP 2000 - Valorant Points murah", game: "Valorant", gameSlug: "valorant", price: 280000, image: g(5), seller: "ValoStore", sold: 780, rating: 4.5, category: "Top Up" },
  // OPBR
  { id: "opbr-1", title: "Akun OPBR rank S+, karakter Luffy G5", game: "One Piece Bounty Rush", gameSlug: "opbr", price: 1200000, image: g(5), seller: "GrandLine", sold: 34, rating: 4.8, category: "Akun" },
];

export const formatPrice = (price: number) => {
  return "Rp" + price.toLocaleString("id-ID");
};
