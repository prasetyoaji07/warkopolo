import drinks from "../assets/banner_biru.png";

const BG = "#004CA0";     // biru, sama seperti navbar
const PURPLE = "#F3EEF8"; // teks jadi putih supaya kontras
const PURPLE_SOFT = "#D9E4F2"; // teks pendukung, putih agak soft

function PinIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Hero() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: BG,
        color: PURPLE,
        borderRadius: 24,
        padding: "24px 36px",
        minHeight: 440,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      {/* Lokasi: pojok kiri atas */}
      <p
        style={{
          position: "relative",
          zIndex: 3,
          alignSelf: "flex-start",
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 15,
          fontWeight: 700,
          margin: 0,
        }}
      >
        <PinIcon /> Grand Wisata
      </p>

      {/* Gambar: menempel ke tepi atas banner */}
      <img
        src={drinks}
        alt="Purple beverage"
        style={{
          position: "absolute",
          left: "50%",
          top: 0,
          transform: "translateX(-50%)",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, black 60%, transparent 100%)",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, black 60%, transparent 100%)",
        }}
      />

      {/* Teks bawah */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>INDIGO</h3>
          <p style={{ margin: 0, color: PURPLE_SOFT }}>
            CREAM
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <h3 style={{ margin: 0 }}>MULAI DARI</h3>
          <p style={{ margin: 0, color: PURPLE_SOFT }}>
            46K Saja...
          </p>
        </div>
      </div>
    </section>
  );
}

export default Hero;