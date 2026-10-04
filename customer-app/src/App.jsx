import { useState, useEffect } from "react";
import { Routes, Route, Outlet, useOutletContext, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Categories from "./components/Categories";
import PromoBanner from "./components/PromoBanner";
import ProductCard from "./components/ProductCard";
import Footer from "./components/Footer";
import EOrder from "./components/EOrder";
import { img } from "./data/data";
import { API } from "./config";
import Menu from "./pages/Menu";
import BookTable from "./pages/BookTable";
import StatusPesanan from "./pages/StatusPesanan";

const DESIGN_WIDTH = 900;

// Nomor pesanan terakhir disimpan di browser supaya status bisa dibuka lagi
const LAST_ORDER_KEY = "warkopolo:lastOrderId";

function readLastOrder() {
  try {
    return localStorage.getItem(LAST_ORDER_KEY) || null;
  } catch {
    return null;
  }
}

// Judul bagian di halaman Home
function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 28, margin: "40px 0 16px", color: "#0E2A4D" }}>
      {children}
    </h2>
  );
}

// Isi halaman Home
function Home({ onAddToCart, onRemoveFromCart, cart }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error(`Server membalas ${res.status}`);
        const data = await res.json();
        const mapped = data.map((item) => ({
          id: item.id,
          name: item.nama,
          price: item.harga,
          rating: item.rating,
          reviews: item.reviews,
          image: item.gambar ? img(item.gambar.split(".")[0]) : undefined,
        }));
        setProducts(mapped);
      } catch (err) {
        console.error("Gagal mengambil produk dari backend:", err);
      }
    }

    loadProducts(); // panggil sekali saat halaman dibuka
    const interval = setInterval(loadProducts, 5000); // ulangi tiap 5 detik
    return () => clearInterval(interval); // bersihkan saat komponen ditutup
  }, []);

  return (
    <>
      <Hero />
      <SectionTitle>Menu</SectionTitle>
      <Categories />
      <PromoBanner />
      <SectionTitle>Menu favorit</SectionTitle>
      <section className="product-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            {...p}
            qty={cart.find((i) => i.cartId === p.id)?.qty ?? 0}
            onAddToCart={() => onAddToCart({ ...p, cartId: p.id })}
            onRemove={() => onRemoveFromCart(p.id)}
          />
        ))}
      </section>
    </>
  );
}

function HomePage() {
  const { addToCart, removeFromCart, cart } = useOutletContext();
  return (
    <Home
      onAddToCart={addToCart}
      onRemoveFromCart={removeFromCart}
      cart={cart}
    />
  );
}

// Layout untuk Home: desain 900px diperkecil sesuai lebar layar
function ZoomLayout({ shop }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      const width = document.documentElement.clientWidth;
      setScale(Math.min(1, width / DESIGN_WIDTH));
    }

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <>
      <Navbar
        cartCount={shop.cartCount}
        statusOrderId={shop.lastOrderId}
        onOpenMenu={() => shop.openPanel("menu")}
        onOpenCart={() => shop.openPanel("cart")}
      />
      <div className="scale-outer">
        <div className="scale-wrapper" style={{ zoom: scale }}>
          <main className="container main">
            <Outlet context={shop} />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

// Layout untuk halaman menu: tanpa zoom, responsif lewat CSS (Menu.css)
function PlainLayout({ shop }) {
  return (
    <>
      <Navbar
        cartCount={shop.cartCount}
        statusOrderId={shop.lastOrderId}
        onOpenMenu={() => shop.openPanel("menu")}
        onOpenCart={() => shop.openPanel("cart")}
      />
      <Outlet context={shop} />
      <Footer />
    </>
  );
}

function App() {
  const navigate = useNavigate();

  // Keranjang disimpan di sini supaya tidak reset saat pindah halaman
  const [cart, setCart] = useState([]);
  // Panel e-Order: null (tertutup) | "menu" | "cart"
  const [panel, setPanel] = useState(null);
  // Nomor pesanan terakhir (untuk tombol status di navbar)
  const [lastOrderId, setLastOrderId] = useState(readLastOrder);

  const saveLastOrder = (id) => {
    try {
      localStorage.setItem(LAST_ORDER_KEY, String(id));
    } catch {
      // penyimpanan browser tidak tersedia, abaikan
    }
    setLastOrderId(String(id));
  };

  const clearLastOrder = () => {
    try {
      localStorage.removeItem(LAST_ORDER_KEY);
    } catch {
      // abaikan
    }
    setLastOrderId(null);
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((i) => i.cartId === item.cartId);
      if (found) {
        return prev.map((i) =>
          i.cartId === item.cartId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        { cartId: item.cartId, name: item.name, price: item.price, qty: 1 },
      ];
    });
  };

  const removeFromCart = (cartId) => {
    setCart((prev) =>
      prev.flatMap((i) => {
        if (i.cartId !== cartId) return [i];
        return i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : [];
      })
    );
  };

  const shop = {
    cart,
    cartCount: cart.reduce((sum, i) => sum + i.qty, 0),
    cartTotal: cart.reduce((sum, i) => sum + i.price * i.qty, 0),
    addToCart,
    removeFromCart,
    openPanel: setPanel,
    lastOrderId,
    clearLastOrder,
  };

  return (
    <>
      <Routes>
        <Route element={<ZoomLayout shop={shop} />}>
          <Route path="/" element={<HomePage />} />
        </Route>
        <Route element={<PlainLayout shop={shop} />}>
          <Route path="/menu/:kategori" element={<Menu />} />
          <Route path="/book-table" element={<BookTable />} />
          <Route path="/status/:id" element={<StatusPesanan />} />
        </Route>
      </Routes>

      {panel && (
        <EOrder
          initialStep={panel}
          cart={cart}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          clearCart={() => setCart([])}
          onClose={() => setPanel(null)}
          onOrderPlaced={saveLastOrder}
          onViewStatus={(id) => {
            setPanel(null);
            navigate(`/status/${id}`);
          }}
        />
      )}
    </>
  );
}

export default App;