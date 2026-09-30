// Format harga: 45000 -> "Rp45.000"
export const rp = (n) => "Rp" + n.toLocaleString("id-ID");

// kind: "drink" atau "food" (menentukan ikon placeholder)
// image (opsional): taruh foto di public/images/menu/, lalu isi
//   image: "/images/menu/blue-lagoon.jpg"
export const menu = {
  cocktail: {
    title: "Cocktail",
    kind: "drink",
    items: [
      { id: 1, name: "Blue Lagoon", desc: "Vodka, blue curaçao, lemon", price: 45000 },
      { id: 2, name: "Witches Brew", desc: "Blackberry, gin, soda", price: 48000 },
      { id: 3, name: "Mojito", desc: "Rum, mint, lime", price: 42000 },
      { id: 4, name: "Margarita", desc: "Tequila, triple sec, lime", price: 46000 },
      { id: 5, name: "Pina Colada", desc: "Rum, nanas, kelapa", price: 44000 },
      { id: 6, name: "Berry Fizz", desc: "Beri, soda, gin", price: 43000 },
    ],
  },
  mocktail: {
    title: "Mocktail",
    kind: "drink",
    items: [
      { id: 1, name: "Virgin Mojito", desc: "Mint, lime, soda", price: 32000 },
      { id: 2, name: "Sunrise Fizz", desc: "Jeruk, grenadine, soda", price: 34000 },
      { id: 3, name: "Berry Cooler", desc: "Beri, mint, soda", price: 33000 },
      { id: 4, name: "Lychee Soda", desc: "Leci, soda, lemon", price: 30000 },
    ],
  },
  snack: {
    title: "Snack",
    kind: "food",
    items: [
      { id: 1, name: "Loaded Fries", desc: "Kentang, keju, saus sapi", price: 35000 },
      { id: 2, name: "Chicken Wings", desc: "Sayap ayam saus pedas manis", price: 38000 },
      { id: 3, name: "Onion Rings", desc: "Bawang bombay goreng renyah", price: 28000 },
      { id: 4, name: "Nachos", desc: "Tortilla, keju, salsa", price: 30000 },
    ],
  },
  food: {
    title: "Food",
    kind: "food",
    items: [
      { id: 1, name: "Mie Aceh", desc: "Mie kuah pedas khas Aceh", price: 29000 },
      { id: 2, name: "Cheeseburger", desc: "Daging sapi, keju, selada", price: 45000 },
      { id: 3, name: "Nasi Goreng", desc: "Nasi, telur, ayam suwir", price: 32000 },
      { id: 4, name: "Chicken Katsu", desc: "Ayam tepung, saus katsu", price: 40000 },
    ],
  },
  coffee: {
    title: "Coffee",
    kind: "drink",
    items: [
      { id: 1, name: "Caramel Latte", desc: "Espresso, susu, karamel", price: 30000 },
      { id: 2, name: "Es Kopi Susu", desc: "Espresso, susu, gula aren", price: 25000 },
      { id: 3, name: "Americano", desc: "Espresso, air panas", price: 22000 },
      { id: 4, name: "Cappuccino", desc: "Espresso, susu, foam", price: 28000 },
    ],
  },
  dessert: {
    title: "Dessert",
    kind: "food",
    items: [
      { id: 1, name: "Chocolate Cake", desc: "Cokelat lembut, stroberi", price: 32000 },
      { id: 2, name: "Strawberry Pancake", desc: "Pancake, stroberi, madu", price: 30000 },
      { id: 3, name: "Ice Cream Sundae", desc: "Es krim, saus cokelat", price: 27000 },
      { id: 4, name: "Pudding", desc: "Puding susu, karamel", price: 20000 },
    ],
  },
};