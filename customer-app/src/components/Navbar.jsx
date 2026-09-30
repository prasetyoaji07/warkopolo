import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/warkopolo.png";

const BG = "#0B5AB4";
const TEXT = "#F3EEF8";
const ACCENT = "#E8A93A";

const links = [
  { label: "Home", to: "/" },
  { label: "e-Order", href: "#e-order" },
  { label: "Book table", to: "/book-table" },
];

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: BG,
    color: TEXT,
  },

  inner: {
    maxWidth: 1280,
    margin: "0 auto",
    padding: "14px 24px",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    position: "relative",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: TEXT,
    textDecoration: "none",
    fontSize: 20,
    fontWeight: 700,
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    objectFit: "cover",
  },

  link: {
    color: TEXT,
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 700,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    alignItems: "center",
  },

  iconBtn: {
    position: "relative",
    display: "grid",
    placeItems: "center",
    width: 40,
    height: 40,
    border: "none",
    borderRadius: 12,
    background: "transparent",
    color: TEXT,
    cursor: "pointer",
  },

  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    padding: "0 5px",
    borderRadius: 9,
    background: ACCENT,
    color: "#3B1D5E",
    fontSize: 11,
    fontWeight: 700,
    lineHeight: "18px",
    textAlign: "center",
  },
};

function Svg({ children }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function SearchIcon() {
  return (
    <Svg>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </Svg>
  );
}

function CartIcon() {
  return (
    <Svg>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.3a1 1 0 0 0 1-.8L21 7H6" />
    </Svg>
  );
}

function MenuIcon() {
  return (
    <Svg>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

function CloseIcon() {
  return (
    <Svg>
      <path d="M6 6l12 12M18 6L6 18" />
    </Svg>
  );
}

function Navbar({ cartCount = 0, onOpenMenu, onOpenCart }) {
  const [open, setOpen] = useState(false);

  const handleEOrder = (e) => {
    e.preventDefault();
    setOpen(false);
    onOpenMenu?.();
  };

  return (
    <header style={styles.header}>
      <div className="navbar-inner" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.brand}>
          <img src={logo} alt="Warkopolo" style={styles.logo} />
        </Link>

        {/* Navigation */}
        <nav
          className={`navbar-links ${
            open ? "navbar-links--open" : ""
          }`}
        >
          {links.map((l) =>
            l.to ? (
              <Link
                key={l.label}
                to={l.to}
                style={styles.link}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                style={styles.link}
                onClick={handleEOrder}
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        {/* Actions */}
        <div className="navbar-actions" style={styles.actions}>
          {/* Search */}
          <button
            type="button"
            aria-label="Cari"
            className="navbar-icon-btn"
            style={styles.iconBtn}
          >
            <SearchIcon />
          </button>

          {/* Cart */}
          <button
            type="button"
            aria-label="Keranjang"
            className="navbar-icon-btn"
            style={styles.iconBtn}
            onClick={() => onOpenCart?.()}
          >
            <CartIcon />

            {cartCount > 0 && (
              <span style={styles.badge}>{cartCount}</span>
            )}
          </button>

          {/* Mobile Menu */}
          <button
            type="button"
            aria-label="Menu"
            className="navbar-burger"
            style={styles.iconBtn}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;