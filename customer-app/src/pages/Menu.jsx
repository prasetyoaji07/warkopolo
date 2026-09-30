import { NavLink, Link, useParams, useOutletContext } from "react-router-dom";
import { menu, rp } from "../data/menu";
import MenuCard, { ItemIcon } from "../components/MenuCard";
import CartPanel, { CartBar } from "../components/CartPanel";
import "./Menu.css";

function Menu() {
  const { kategori } = useParams();
  const { cart, cartCount, cartTotal, addToCart, removeFromCart } =
    useOutletContext();
  const data = menu[kategori];

  if (!data) {
    return (
      <div className="mn-page" style={{ display: "block" }}>
        <h1>Menu tidak ditemukan</h1>
        <Link to="/">Kembali ke Home</Link>
      </div>
    );
  }

  const cheapest = Math.min(...data.items.map((i) => i.price));

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
              {data.items.length} menu, mulai {rp(cheapest)}
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
            {data.items.map((item, i) => (
              <MenuCard
                key={item.id}
                item={item}
                kind={data.kind}
                tintIndex={i}
                onAdd={() =>
                  addToCart({ ...item, cartId: `${kategori}-${item.id}` })
                }
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