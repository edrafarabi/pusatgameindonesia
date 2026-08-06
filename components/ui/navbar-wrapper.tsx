"use client";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { Home, ShoppingBag, Store, Info, Tags } from "lucide-react";

const navItems = [
  { name: "Beranda", url: "/", icon: Home },
  { name: "Cari", url: "/listings", icon: ShoppingBag },
  { name: "Kategori", url: "/categories", icon: Tags },
  { name: "Jual", url: "/sell", icon: Store },
  { name: "Tentang", url: "/about", icon: Info },
];

export default function NavBarWrapper() {
  return <NavBar items={navItems} />;
}