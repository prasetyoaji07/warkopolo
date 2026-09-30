import { useState } from "react";
import { rp } from "../data/menu";

// Warna latar placeholder, bergantian per kartu
const TINTS = [
  { bg: "#DCEBFA", fg: "#0B5CB8" },
  { bg: "#E9E1F5", fg: "#5B3B9A" },
  { bg: "#DFF1E6", fg: "#1F7A4D" },
  { bg: "#FBE6E6", fg: "#B23A3A" },
  { bg: "#FDF0DA", fg: "#B0701A" },
  { bg: "#FBE3EE", fg: "#A6336B" },
];

// Ikon placeholder: gelas untuk minuman, piring untuk makanan
export function ItemIcon({ kind, size = 36 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "food" ? (
        <>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4.5" />
        </>
      ) : (
        <>
          <path d="M5 4h14l-7 8-7-8Z" />
          <path d="M12 12v7M8 19h8" />
        </>
      )}
    </svg>
  );
}

function MenuCard({ item, kind, tintIndex, onAdd }) {
  const [liked, setLiked] = useState(false);
  const tint = TINTS[tintIndex % TINTS.length];

  return (
    <article className="mn-card">
      <div className="mn-img" style={{ background: tint.bg, color: tint.fg }}>
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <ItemIcon kind={kind} size={52} />
        )}

        <button
          type="button"
          className="mn-heart"
          aria-label={liked ? "Hapus dari favorit" : "Tambah ke favorit"}
          aria-pressed={liked}
          onClick={() => setLiked(!liked)}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 21s-7-4.6-9.3-9.2C1.1 8.6 3 5 6.5 5c2 0 3.6 1.1 5.5 3 1.9-1.9 3.5-3 5.5-3C21 5 22.9 8.6 21.3 11.8 19 16.4 12 21 12 21Z" />
          </svg>
        </button>
      </div>

      <div className="mn-body">
        <h3 className="mn-name">{item.name}</h3>
        <p className="mn-desc">{item.desc}</p>

        <div className="mn-price-row">
          <span className="mn-price">{rp(item.price)}</span>
          <button
            type="button"
            className="mn-add"
            aria-label={`Tambah ${item.name} ke pesanan`}
            onClick={onAdd}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}

export default MenuCard;