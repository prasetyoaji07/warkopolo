import ProductCard from "./ProductCard";
import mieAceh from "../assets/mie_aceh.png";

const products = [
  { id: 1, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 2, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 3, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 4, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 5, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 6, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 7, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
  { id: 8, name: "Mie Aceh", price: 29000, rating: 5, reviews: 47, image: mieAceh },
];

function Products() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 16,
      }}
    >
      {products.map((p) => (
        <ProductCard
          key={p.id}
          {...p}
          onAddToCart={() => console.log("Tambah:", p.name)}
        />
      ))}
    </div>
  );
}

export default Products;