import { tables } from "../data/tables";

const BLUE = "#0C5CB8";
const NAVY = "#0B2A4A";

const s = {
  room: {
    position: "relative",
    height: 300,
    background: "#E8E4E0",
    borderRadius: 24,
    overflow: "hidden",
  },
  bar: {
    position: "absolute",
    top: 10,
    left: "50%",
    transform: "translateX(-50%)",
    width: "60%",
    padding: "4px 0",
    borderRadius: 12,
    background: BLUE,
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    textAlign: "center",
  },
  door: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 36,
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 11,
    color: NAVY,
  },
  line: { flex: 1, height: 2, background: NAVY },
  legend: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    display: "flex",
    justifyContent: "center",
    gap: 14,
    fontSize: 12,
    color: NAVY,
  },
  legendItem: { display: "flex", alignItems: "center", gap: 6 },
};

function Swatch({ bg, border }) {
  return (
    <span
      style={{
        width: 12,
        height: 12,
        borderRadius: 3,
        background: bg,
        border: `2px solid ${border}`,
        boxSizing: "border-box",
      }}
    />
  );
}

export default function FloorPlan({ selected, onSelect }) {
  return (
    <div style={s.room}>
      <div style={s.bar}>Kasir &amp; bar</div>

      {tables.map((t) => {
        const taken = t.status === "taken";
        const on = selected === t.id;
        return (
          <button
            key={t.id}
            type="button"
            disabled={taken}
            aria-pressed={on}
            aria-label={`Meja ${t.id}, ${t.seats} kursi${taken ? ", terisi" : ""}`}
            onClick={() => onSelect(t.id)}
            style={{
              position: "absolute",
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: "translate(-50%, -50%)",
              width: t.w,
              height: t.h,
              padding: 0,
              boxSizing: "border-box",
              borderRadius: t.shape === "round" ? "50%" : 10,
              border: `2px solid ${taken ? "#B8B2AC" : BLUE}`,
              background: taken
                ? "repeating-linear-gradient(45deg,#D5D0CB,#D5D0CB 4px,#E3DFDB 4px,#E3DFDB 8px)"
                : on
                ? BLUE
                : "#fff",
              color: taken ? "#8C857E" : on ? "#fff" : BLUE,
              fontSize: 15,
              fontWeight: 700,
              cursor: taken ? "not-allowed" : "pointer",
            }}
          >
            {t.id}
          </button>
        );
      })}

      <div style={s.door}>
        <div style={s.line} />
        <span>Pintu masuk</span>
        <div style={s.line} />
      </div>

      <div style={s.legend}>
        <span style={s.legendItem}>
          <Swatch bg="#fff" border={BLUE} /> Tersedia
        </span>
        <span style={s.legendItem}>
          <Swatch bg={BLUE} border={BLUE} /> Dipilih
        </span>
        <span style={s.legendItem}>
          <Swatch bg="#D5D0CB" border="#B8B2AC" /> Terisi
        </span>
      </div>
    </div>
  );
}