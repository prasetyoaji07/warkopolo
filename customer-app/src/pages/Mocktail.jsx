import PromoBanner from "../components/PromoBanner";
import ProductCard from "../components/ProductCard";

const cocktails = [
  { id: 1, name: "Blue Lagoon", price: 45000, rating: 5, reviews: 47 },
  { id: 2, name: "Witches Brew", price: 48000, rating: 5, reviews: 63 },
  { id: 3, name: "Mojito", price: 42000, rating: 4, reviews: 38 },
  { id: 4, name: "Margarita", price: 46000, rating: 5, reviews: 51 },
  { id: 5, name: "Purple Haze", price: 47000, rating: 4, reviews: 29 },
  { id: 6, name: "Pina Colada", price: 44000, rating: 5, reviews: 42 },
  { id: 7, name: "Berry Fizz", price: 43000, rating: 4, reviews: 24 },
  { id: 8, name: "Sunset Spritz", price: 45000, rating: 5, reviews: 35 },
];

function Cocktail() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <PromoBanner
        title="Witches Brew"
        headline="Halloween special"
        discount="20% OFF"
        period="1/10/2026 - 31/10/2026"
        buttonLabel="Pesan sekarang"
      />

      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontStyle: "italic", color: "#3B1D5E" }}>
          Cocktail
        </h1>
        <p style={{ margin: "4px 0 0", color: "#7B7580" }}>
          {cocktails.length} menu tersedia
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        {cocktails.map((item) => (
          <ProductCard
            key={item.id}
            {...item}
            onAddToCart={() => console.log("Tambah:", item.name)}
          />
        ))}
      </div>
    </div>
  );
}

export default Cocktail;