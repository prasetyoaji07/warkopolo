import { useNavigate } from "react-router-dom";

const categories = [
  { id: 1, key: "cocktail", label: "Cocktail", span: 3, image: "/images/cocktail.png", position: "center" },
  { id: 2, key: "mocktail", label: "Mocktail", span: 3, image: "/images/mocktail.png", position: "center" },
  { id: 3, key: "snack",    label: "Snack",    span: 6, image: "/images/snack.png",    position: "center 40%" },
  { id: 4, key: "food",     label: "Food",     span: 6, image: "/images/food.png",     position: "center 40%" },
  { id: 5, key: "coffee",   label: "Coffee",   span: 3, image: "/images/coffee.png",   position: "center" },
  { id: 6, key: "dessert",  label: "Dessert",  span: 3, image: "/images/dessert.png",  position: "center" },
];

const styles = {
  card: {
    position: "relative",
    overflow: "hidden",
    minHeight: 220,
    borderRadius: 24,
  },
  img: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },
  button: {
    position: "absolute",
    left: 16,
    bottom: 16,
    zIndex: 1,
    background: "linear-gradient(180deg, #FFFFFF 0%, #F3F1EF 100%)",
    color: "#3B1D5E",
    border: "none",
    padding: "10px 22px",
    borderRadius: 14,
    cursor: "pointer",
    fontSize: 15,
    fontWeight: 600,
    boxShadow: "0 4px 0 rgba(0,0,0,0.15), 0 6px 14px rgba(0,0,0,0.25)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },
};

function CategoryCard({ label, slug, span, image, position }) {
  const navigate = useNavigate();

  return (
    <div style={styles.card} className={`category-card cat-span-${span}`}>
      <img
        src={image}
        alt={label}
        style={{ ...styles.img, objectPosition: position || "center" }}
      />
      <button
        type="button"
        style={styles.button}
        aria-label={`Lihat varian ${label}`}
        onClick={() => navigate(`/menu/${slug}`)}
      >
        Varian
      </button>
    </div>
  );
}

export default function Categories() {
  return (
    <div className="category-grid">
      {categories.map((c) => (
        <CategoryCard
          key={c.id}
          label={c.label}
          slug={c.key}
          span={c.span}
          image={c.image}
          position={c.position}
        />
      ))}
    </div>
  );
}