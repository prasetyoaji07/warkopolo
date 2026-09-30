import mieAceh from "../assets/mie_aceh.png";

// Memuat semua gambar di src/assets, lalu dicari lewat nama file (tanpa ekstensi)
const images = import.meta.glob("../assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

export const img = (name) => {
  const key = Object.keys(images).find(
    (k) => k.split("/").pop().split(".")[0] === name
  );
  return key ? images[key] : undefined;
};

export const menu = {
  cocktail: {
    title: "Cocktail",
    items: [
      { id: 1, name: "Blue Lagoon", price: 45000, rating: 5, reviews: 47 },
      { id: 2, name: "Witches Brew", price: 48000, rating: 5, reviews: 63 },
      { id: 3, name: "Mojito", price: 42000, rating: 4, reviews: 38 },
      { id: 4, name: "Margarita", price: 46000, rating: 5, reviews: 51 },
    ],
  },
  mocktail: {
    title: "Mocktail",
    items: [
      { id: 1, name: "Virgin Mojito", price: 32000, rating: 5, reviews: 40 },
      { id: 2, name: "Sunrise Fizz", price: 34000, rating: 4, reviews: 28 },
      { id: 3, name: "Berry Cooler", price: 33000, rating: 5, reviews: 35 },
      { id: 4, name: "Lychee Soda", price: 30000, rating: 4, reviews: 22 },
    ],
  },
  snack: {
    title: "Snack",
    items: [
      { id: 1, name: "Loaded Fries", price: 35000, rating: 5, reviews: 58 },
      { id: 2, name: "Chicken Wings", price: 38000, rating: 5, reviews: 44 },
      { id: 3, name: "Onion Rings", price: 28000, rating: 4, reviews: 31 },
      { id: 4, name: "Nachos", price: 30000, rating: 4, reviews: 26 },
    ],
  },
  food: {
    title: "Food",
    items: [
      { id: 1, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47 },
      { id: 2, name: "Cheeseburger", price: 45000, rating: 5, reviews: 52 },
      { id: 3, name: "Nasi Goreng", price: 32000, rating: 4, reviews: 39 },
      { id: 4, name: "Chicken Katsu", price: 40000, rating: 5, reviews: 33 },
    ],
  },
  coffee: {
    title: "Coffee",
    items: [
      { id: 1, name: "Caramel Latte", price: 30000, rating: 5, reviews: 61 },
      { id: 2, name: "Es Kopi Susu", price: 25000, rating: 5, reviews: 80 },
      { id: 3, name: "Americano", price: 22000, rating: 4, reviews: 27 },
      { id: 4, name: "Cappuccino", price: 28000, rating: 4, reviews: 34 },
    ],
  },
  dessert: {
    title: "Dessert",
    items: [
      { id: 1, name: "Chocolate Cake", price: 32000, rating: 5, reviews: 49 },
      { id: 2, name: "Strawberry Pancake", price: 30000, rating: 4, reviews: 25 },
      { id: 3, name: "Ice Cream Sundae", price: 27000, rating: 5, reviews: 37 },
      { id: 4, name: "Pudding", price: 20000, rating: 4, reviews: 18 },
    ],
  },
};

export const products = [
  { id: 1, name: "Mie Aceh",       price: 29000, rating: 5, reviews: 47, image: img("mie_aceh") },
  { id: 2, name: "Cheeseburger",   price: 45000, rating: 5, reviews: 52, image: img("cheeseburger") },
  { id: 3, name: "Nasi Goreng",    price: 32000, rating: 4, reviews: 39, image: img("nasi_goreng") },
  { id: 4, name: "Loaded Fries",   price: 35000, rating: 5, reviews: 58, image: img("loaded_fries") },
  { id: 5, name: "Caramel Latte",  price: 30000, rating: 5, reviews: 61, image: img("caramel_latte") },
  { id: 6, name: "Es Kopi Susu",   price: 25000, rating: 5, reviews: 80, image: img("es_kopi_susu") },
  { id: 7, name: "Blue Lagoon",    price: 45000, rating: 5, reviews: 47, image: img("blue_lagoon") },
  { id: 8, name: "Chocolate Cake", price: 32000, rating: 5, reviews: 49, image: img("chocolate_cake") },
];