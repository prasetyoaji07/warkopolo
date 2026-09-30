// Footer.jsx
const BG = "#0B5AB4";
const TEXT = "#F3EEF8";
const TEXT_SOFT = "#ece6f2";

const columns = [
  { title: "HELP", links: ["Contact Us", "Delivery & Self", "Pick Up"] },
  { title: "GENERAL", links: ["Career", "About Us", "Customer Service"] },
  { title: "PAYMENT", links: ["VISA · OVO · QRIS"] },
];

function Footer() {
  const linkStyle = { fontSize: 14, margin: "0 0 8px", color: TEXT_SOFT };

  return (
    <footer
      className="footer"
      style={{
        background: BG,
        color: TEXT,
        marginTop: 60,
        padding: "40px 60px",
        gap: 40,
      }}
    >
      <div style={{ maxWidth: 320 }}>
        <h2 style={{ fontSize: 32, margin: 0 }}>WARKOPOLO</h2>
        <p style={{ fontSize: 14, margin: "24px 0 12px", color: TEXT_SOFT }}>
          Be the first to know about our latest news, offers & promotions.
        </p>
        <input
          type="email"
          placeholder="Your Email"
          className="footer-email-input"
          style={{
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${TEXT_SOFT}`,
            color: TEXT,
            padding: 6,
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>

<div className="footer-links-wrap">
  {columns.map((col) => (
    <div key={col.title}>
      <h4 style={{ margin: "0 0 16px", color: TEXT }}>{col.title}</h4>
      {col.links.map((link) => (
        <p key={link} style={linkStyle}>
          {link}
        </p>
      ))}
    </div>
  ))}
</div>
    </footer>
  );
}

export default Footer;