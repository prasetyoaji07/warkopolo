import mieAceh from "./assets/mie_aceh.png";

export const categories = [
  { id: 1, title: "Cocktail", sub: "Alcoholic beverage",   bg: "#dccbec", fg: "#4b2370", span: 3 },
  { id: 2, title: "Mocktail", sub: "Non-alcohol beverage", bg: "#cfe1d5", fg: "#1f4d35", span: 3 },
  { id: 3, title: "Snack",    sub: "Makanan ringan",       bg: "#f3d8c3", fg: "#6b3a1f", span: 6 },
  { id: 4, title: "Food",     sub: "Makanan berat",        bg: "#efe3bd", fg: "#5a4310", span: 6 },
  { id: 5, title: "Coffee",   sub: "Hot and cool",         bg: "#d2b6a2", fg: "#5a3a26", span: 3 },
  { id: 6, title: "Dessert",  sub: "Manis dan segar",      bg: "#eecdd3", fg: "#7a2a3a", span: 3 },
];

export const products = [
  { id: 1, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 2, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 3, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 4, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 5, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 6, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 7, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 8, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
];

export const categoryFilters = [
  "Semua", "Cocktail", "Mocktail", "Snack", "Food", "Coffee", "Dessert",
];

// color = blok warna pengganti gambar. Nanti ganti dengan field image.
export const menu = [
  { id: 1, name: "Indigo Cream",        desc: "Butterfly pea, susu, buah ara", price: 32000, category: "Mocktail", color: "#2C62B4" },
  { id: 2, name: "Mie Aceh",            desc: "Mie pedas dengan udang",        price: 29000, category: "Food",     color: "#E9A66B" },
  { id: 3, name: "Kopi Susu Gula Aren", desc: "Espresso, susu, gula aren",     price: 22000, category: "Coffee",   color: "#7A4A2A" },
  { id: 4, name: "Es Teh Lemon",        desc: "Teh segar dengan lemon",        price: 15000, category: "Mocktail", color: "#E0A030" },
];

export const tables = [
  { id: 1,  shape: "round", x: 11, y: 22, w: 46, h: 46, seats: 2, status: "free" },
  { id: 2,  shape: "rect",  x: 38, y: 22, w: 62, h: 38, seats: 2, status: "free" },
  { id: 3,  shape: "rect",  x: 73, y: 22, w: 96, h: 40, seats: 6, status: "free" },
  { id: 4,  shape: "rect",  x: 18, y: 48, w: 64, h: 40, seats: 4, status: "taken" },
  { id: 5,  shape: "rect",  x: 50, y: 48, w: 84, h: 40, seats: 4, status: "free" },
  { id: 6,  shape: "round", x: 89, y: 48, w: 46, h: 46, seats: 2, status: "free" },
  { id: 7,  shape: "round", x: 11, y: 74, w: 46, h: 46, seats: 2, status: "free" },
  { id: 8,  shape: "rect",  x: 36, y: 74, w: 62, h: 40, seats: 4, status: "taken" },
  { id: 9,  shape: "rect",  x: 62, y: 74, w: 62, h: 36, seats: 4, status: "free" },
  { id: 10, shape: "round", x: 89, y: 74, w: 46, h: 46, seats: 2, status: "free" },
];