import { useState, useEffect } from "react";
import { NavLink, Link, useParams, useOutletContext } from "react-router-dom";
import { menu, rp } from "../data/menu";
import MenuCard, { ItemIcon } from "../components/MenuCard";
import CartPanel, { CartBar } from "../components/CartPanel";
import { API } from "../config";
import "./Menu.css";

function Menu() {
  const { kategori } = useParams();
  const { cart, cartCount, cartTotal, addToCart, removeFromCart } =
    useOutletContext();
  const [products, setProducts] = useState([]);
  const data = menu[kategori];

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error(`Server membalas ${res.status}`);
        setProducts(await res.json());
      } catch (err) {
        console.error("Gagal mengambil produk dari backend:", err);
      }
    }

    loadProducts(); // panggil sekali saat halaman dibuka
    const interval = setInterval(loadProducts, 5000); // ulangi tiap 5 detik
    return () => clearInterval(interval); // bersihkan saat komponen ditutup
  }, []);

  if (!data) {
    return (
      <div className="mn-page" style={{ display: "block" }}>
        <h1>Menu tidak ditemukan</h1>
        <Link to="/">Kembali ke Home</Link>
      </div>
    );
  }

  // Ambil menu kategori ini dari database, ubah ke bentuk yang dibaca MenuCard
  const items = products
    .filter((p) => String(p.kategori).toLowerCase() === kategori)
    .map((p) => ({
      id: p.id,
      name: p.nama,
      desc: data.items.find((i) => i.name === p.nama)?.desc ?? "",
      price: Number(p.harga),
    }));

  const cheapest = items.length > 0 ? Math.min(...items.map((i) => i.price)) : 0;

  return (
    <>
      <header className="mn-hero">
        <div className="mn-hero-inner">
          <div>
            <nav className="mn-crumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link> / <span>Menu</span> /{" "}
              <span>{data.title}</span>
            </nav>
            <h1 className="mn-title">{data.title}</h1>
            <p className="mn-sub">
              {items.length} menu
              {items.length > 0 && `, mulai ${rp(cheapest)}`}
            </p>
          </div>
          <div className="mn-hero-icon">
            <ItemIcon kind={data.kind} size={34} />
          </div>
        </div>
      </header>

      <div className="mn-page">
        <div className="mn-main">
          <nav className="mn-chips" aria-label="Kategori menu">
            {Object.entries(menu).map(([key, c]) => (
              <NavLink
                key={key}
                to={`/menu/${key}`}
                className={({ isActive }) => "mn-chip" + (isActive ? " on" : "")}
              >
                {c.title}
              </NavLink>
            ))}
          </nav>

          <div className="mn-grid">
            {items.map((item, i) => (
              <MenuCard
                key={item.id}
                item={item}
                kind={data.kind}
                tintIndex={i}
                onAdd={() => addToCart({ ...item, cartId: item.id })}
              />
            ))}
          </div>
        </div>

        <CartPanel items={cart} total={cartTotal} onRemove={removeFromCart} />
      </div>

      <CartBar count={cartCount} total={cartTotal} />
    </>
  );
}

export default Menu;