const BG = "#4A2373";
const TEXT = "#F3EEF8";
const TEXT_SOFT = "#D9C7EC";
const BTN_BG = "#F3D9C4";
const BTN_TEXT = "#6B3A1E";

function PromoBanner() {
  return (
    <section
      className="promo-banner"
      style={{
        position: "relative",
        borderRadius: 24,
        overflow: "hidden",
        margin: "32px 0",
        minHeight: 320,
        backgroundImage: "url(/images/sanwitch.png)",
        backgroundSize: "cover",
        backgroundPosition: "center 30%",
      }}
    >
      <button className="promo-banner__btn">
        Pesan sekarang
      </button>
    </section>
  );
}

export default PromoBanner;