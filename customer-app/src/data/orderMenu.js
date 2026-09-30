import { menu } from "./data";

// Blok warna pengganti gambar, satu warna per kategori
const COLORS = {
  cocktail: "#8E6BBF",
  mocktail: "#5FA37F",
  snack: "#E3A574",
  food: "#D9B45A",
  coffee: "#8A5A3C",
  dessert: "#D98A9C",
};

// Meratakan menu per kategori jadi satu daftar, dengan id unik (cocktail-1, food-1, ...)
export const orderMenu = Object.entries(menu).flatMap(([key, cat]) =>
  cat.items.map((item) => ({
    ...item,
    id: `${key}-${item.id}`,
    category: cat.title,
    desc: item.desc ?? `★ ${item.rating} · ${item.reviews} penilaian`,
    color: item.color ?? COLORS[key],
  }))
);

export const categoryFilters = ["Semua", ...Object.values(menu).map((c) => c.title)];