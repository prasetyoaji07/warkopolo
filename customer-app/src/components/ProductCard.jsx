import { useState } from "react";

const PURPLE = "#0B5AB4";
const GOLD = "#E8A93A";

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    background: "#fff",
    border: "none",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(74, 35, 115, 0.08), 0 8px 24px rgba(74, 35, 115, 0.06)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  media: {
    position: "relative",
    aspectRatio: "4 / 3",
    background: "#EFEBE8",
    display: "grid",
    placeItems: "center",
  },
  placeholder: {
    width: 104,
    height: 104,
    boxSizing: "border-box",
    borderRadius: "50%",
    background: "#C98B4B",
    border: "6px solid #8B5A2B",
  },
  image: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  heart: {
    position: "absolute",
    top: 10,
    right: 10,
    display: "grid",
    placeItems: "center",
    width: 36,
    height: 36,
    border: "none",
    borderRadius: "50%",
    background: "#fff",
    color: PURPLE,
    cursor: "pointer",
  },
    body: {
    padding: 16,
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  stars: { color: GOLD, fontSize: 15, letterSpacing: 2 },
    name: {
    margin: "6px 0 0",
    fontSize: 18,
    fontWeight: 700,
    color: PURPLE,
    lineHeight: 1.3,
    minHeight: "2.6em",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  price: { margin: "2px 0 12px", fontSize: 15, color: "#777" },
  button: {
    width: "100%",
    height: 40,
    boxSizing: "border-box",
    marginTop: "auto",
    padding: 0,
    border: "none",
    borderRadius: 12,
    background: PURPLE,
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
  },
  stepper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 40,
    boxSizing: "border-box",
    marginTop: "auto",
  },
  stepMinus: {
    width: 40,
    height: 40,
    border: `2px solid ${PURPLE}`,
    borderRadius: 12,
    background: "#fff",
    color: PURPLE,
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    cursor: "pointer",
    padding: 0,
  },
  stepPlus: {
    width: 40,
    height: 40,
    border: "none",
    borderRadius: 12,
    background: PURPLE,
    color: "#fff",
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    cursor: "pointer",
    padding: 0,
  },
  stepQty: { fontSize: 16, fontWeight: 700, color: PURPLE },
};

function HeartIcon({ filled }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

export default function ProductCard({
  name,
  price,
  rating = 5,
  reviews = 0,
  image,
  qty = 0,
  onAddToCart,
  onRemove,
}) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const full = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <article
      style={{
        ...styles.card,
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 4px 12px rgba(74, 35, 115, 0.12), 0 16px 32px rgba(74, 35, 115, 0.1)"
          : styles.card.boxShadow,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.media}>
        {image ? (
          <img src={image} alt={name} style={styles.image} />
        ) : (
          <div style={styles.placeholder} />
        )}

        <button
          type="button"
          aria-label="Favorit"
          style={styles.heart}
          onClick={() => setLiked((v) => !v)}
        >
          <HeartIcon filled={liked} />
        </button>
      </div>

      <div style={styles.body}>
        <div style={styles.ratingRow}>
          <span style={styles.stars}>
            {"★".repeat(full)}
            <span style={{ opacity: 0.3 }}>{"★".repeat(5 - full)}</span>
          </span>
          <span>
            {rating} ({reviews})
          </span>
        </div>

        <h3 style={styles.name}>{name}</h3>
        <p style={styles.price}>Rp.{price.toLocaleString("id-ID")}</p>

        {qty > 0 && onRemove ? (
          <div style={styles.stepper}>
            <button
              type="button"
              aria-label={`Kurangi ${name}`}
              style={styles.stepMinus}
              onClick={onRemove}
            >
              −
            </button>
            <span style={styles.stepQty}>{qty}</span>
            <button
              type="button"
              aria-label={`Tambah ${name}`}
              style={styles.stepPlus}
              onClick={onAddToCart}
            >
              +
            </button>
          </div>
        ) : (
          <button type="button" style={styles.button} onClick={onAddToCart}>
            Add to cart
          </button>
        )}
      </div>
    </article>
  );
}