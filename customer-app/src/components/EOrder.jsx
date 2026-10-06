import { useEffect, useState } from "react";
import { tables as layout } from "../data/tables";
import FloorPlan from "./FloorPlan";
import { API } from "../config";
import { img } from "../data/data";
import { bersihkanTelepon } from "../utils/telepon";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const BLUE = "#0C5CB8";
const NAVY = "#0B2A4A";
const MUTED = "#6B7A90";
const LINE = "#E6EBF2";
const SOFT = "#EEF2F8";

const rp = (n) => "Rp" + n.toLocaleString("id-ID");

// Blok warna pengganti gambar (dipakai kalau menu belum punya foto)
const COLORS = {
  cocktail: "#8E6BBF",
  mocktail: "#5FA37F",
  snack: "#E3A574",
  food: "#D9B45A",
  coffee: "#8A5A3C",
  dessert: "#D98A9C",
};
const labelOf = (k) => (k ? k.charAt(0).toUpperCase() + k.slice(1) : "Lainnya");

const modes = [
  { key: "dine", label: "Makan di sini" },
  { key: "pickup", label: "Ambil" },
  { key: "delivery", label: "Antar" },
];
const payments = ["QRIS", "OVO", "Di kasir"];
const MAP_CENTER = [-6.279486, 107.045714];

const customerIcon = L.divIcon({
  className: "warkopolo-customer-marker",
  html: `<div style="font-size:30px;line-height:30px;filter:drop-shadow(0 2px 2px rgba(0,0,0,.3));">📍</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function LocationPicker({ position, onPick }) {
  useMapEvents({
    click(e) {
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} icon={customerIcon} /> : null;
}


const keyframes = `
@keyframes eo-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes eo-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes eo-fade { from { opacity: 0; } to { opacity: 1; } }
`;

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    background: "rgba(11,42,74,0.45)",
    animation: "eo-fade .2s ease-out",
  },
  panel: {
    position: "fixed",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: "0 -8px 40px rgba(11,42,74,0.25)",
    color: NAVY,
  },
  sheet: {
    left: 0,
    right: 0,
    bottom: 0,
    margin: "0 auto",
    width: "100%",
    maxWidth: 520,
    height: "92vh",
    borderRadius: "28px 28px 0 0",
    animation: "eo-up .28s ease-out",
  },
  drawer: {
    top: 0,
    right: 0,
    bottom: 0,
    width: 440,
    borderRadius: 0,
    animation: "eo-in .28s ease-out",
  },
  grab: { width: 44, height: 5, borderRadius: 3, background: "#CBD5E3", margin: "10px auto 0" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" },
  headBlue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    background: BLUE,
    color: "#fff",
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800 },
  titleBlue: { margin: 0, fontSize: 18, fontWeight: 700 },
  closeBtn: {
    width: 40,
    height: 40,
    border: "none",
    borderRadius: "50%",
    background: SOFT,
    color: NAVY,
    fontSize: 18,
    cursor: "pointer",
  },
  closeBtnBlue: {
    width: 40,
    height: 40,
    border: "none",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.18)",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
  body: { flex: 1, overflowY: "auto", padding: "0 20px 16px" },
  footer: { padding: 16, borderTop: `1px solid ${LINE}`, background: "#fff" },
  search: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px 12px 42px",
    border: `1px solid ${LINE}`,
    borderRadius: 14,
    fontSize: 15,
    outline: "none",
    color: NAVY,
  },
  chips: { display: "flex", gap: 8, overflowX: "auto", padding: "14px 0", whiteSpace: "nowrap" },
  chip: {
    flexShrink: 0,
    padding: "8px 16px",
    borderRadius: 999,
    border: `1px solid ${LINE}`,
    background: "#fff",
    color: NAVY,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  chipOn: { background: BLUE, borderColor: BLUE, color: "#fff" },
  row: { display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: `1px solid ${LINE}` },
  rowInfo: { flex: 1, minWidth: 0 },
  rowName: { margin: 0, fontSize: 16, fontWeight: 800 },
  rowDesc: { margin: "2px 0 4px", fontSize: 13, color: MUTED },
  rowPrice: { margin: 0, fontSize: 14, fontWeight: 800, color: BLUE },
  stepper: { display: "flex", alignItems: "center", gap: 10 },
  stepBtn: {
    width: 32,
    height: 32,
    border: `1px solid ${LINE}`,
    borderRadius: 10,
    background: "#fff",
    color: NAVY,
    fontSize: 18,
    cursor: "pointer",
  },
  stepBtnOn: {
    width: 32,
    height: 32,
    border: "none",
    borderRadius: 10,
    background: BLUE,
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
  },
  qty: { minWidth: 14, textAlign: "center", fontWeight: 700 },
  addBtn: {
    width: 36,
    height: 36,
    border: `2px solid ${BLUE}`,
    borderRadius: 10,
    background: "#fff",
    color: BLUE,
    fontSize: 20,
    cursor: "pointer",
  },
  primary: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    border: "none",
    borderRadius: 16,
    background: BLUE,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  secondary: {
    width: "100%",
    marginTop: 10,
    padding: "14px 0",
    border: `1px solid ${LINE}`,
    borderRadius: 16,
    background: "#fff",
    color: NAVY,
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  section: { margin: "22px 0 10px", fontSize: 17, fontWeight: 800 },
  segment: { display: "flex", padding: 4, borderRadius: 14, background: SOFT },
  seg: {
    flex: 1,
    padding: "10px 0",
    border: "none",
    borderRadius: 10,
    background: "transparent",
    color: MUTED,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  segOn: { background: "#fff", color: BLUE, boxShadow: "0 1px 4px rgba(11,42,74,0.12)" },
  label: { display: "block", margin: "0 0 6px", fontSize: 13, fontWeight: 700, color: MUTED },
  field: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    marginBottom: 12,
    border: `1px solid ${LINE}`,
    borderRadius: 12,
    fontSize: 15,
    outline: "none",
    color: NAVY,
    fontFamily: "inherit",
  },
  payRow: { display: "flex", gap: 10 },
  pay: {
    flex: 1,
    padding: "12px 0",
    border: `1px solid ${LINE}`,
    borderRadius: 12,
    background: "#fff",
    color: NAVY,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  payOn: { borderColor: BLUE, background: "#EAF2FC", color: BLUE },
  hint: { margin: "0 0 10px", fontSize: 13, color: MUTED, textAlign: "center" },
  empty: { padding: "48px 0", textAlign: "center", color: MUTED },
  doneWrap: { textAlign: "center", paddingTop: 28 },
  doneRing: {
    width: 104,
    height: 104,
    margin: "0 auto",
    borderRadius: "50%",
    background: "#DCE9F8",
    display: "grid",
    placeItems: "center",
  },
  doneDot: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: BLUE,
    color: "#fff",
    fontSize: 36,
    display: "grid",
    placeItems: "center",
  },
  receipt: {
    marginTop: 24,
    padding: 18,
    border: "1px dashed #B9C8DD",
    borderRadius: 18,
    background: "#F7FAFE",
    textAlign: "left",
  },
  code: { margin: "0 0 12px", textAlign: "center", fontSize: 22, fontWeight: 800, color: BLUE },
  info: { display: "flex", justifyContent: "space-between", gap: 16, padding: "5px 0", fontSize: 14 },
};

function useIsDesktop() {
  const query = "(min-width: 900px)";
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = (e) => setMatch(e.matches);
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);
  return match;
}

function Stepper({ qty, onChange }) {
  return (
    <div style={s.stepper}>
      <button type="button" aria-label="Kurangi" style={s.stepBtn} onClick={() => onChange(qty - 1)}>
        −
      </button>
      <span style={s.qty}>{qty}</span>
      <button type="button" aria-label="Tambah" style={s.stepBtnOn} onClick={() => onChange(qty + 1)}>
        +
      </button>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={s.info}>
      <span style={{ color: MUTED }}>{label}</span>
      <strong style={{ textAlign: "right" }}>{value}</strong>
    </div>
  );
}

// Gambar QR palsu untuk simulasi (pola tetap, bukan QR sungguhan)
function QrFake({ size = 200 }) {
  const n = 25;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const inFinder = (x, y) =>
    (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8);
  const cells = [];
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && rnd() > 0.5) {
        cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
      }
    }
  }
  const finder = (x, y) => (
    <g key={`f${x}-${y}`}>
      <rect x={x} y={y} width="7" height="7" />
      <rect x={x + 1} y={y + 1} width="5" height="5" fill="#fff" />
      <rect x={x + 2} y={y + 2} width="3" height="3" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${n + 2} ${n + 2}`} fill="#0B2A4A" aria-hidden="true">
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      {cells}
      {finder(0, 0)}
      {finder(n - 7, 0)}
      {finder(0, n - 7)}
    </svg>
  );
}

// Foto menu; kalau belum ada foto, tampilkan blok warna kategori
function Thumb({ image, color, size = 64, radius = 14 }) {
  const box = { width: size, height: size, flexShrink: 0, borderRadius: radius };
  if (image) return <img src={image} alt="" style={{ ...box, objectFit: "cover" }} />;
  return <div style={{ ...box, background: color }} />;
}

export default function EOrder({
  initialStep = "menu",
  cart,
  addToCart,
  removeFromCart,
  clearCart,
  onClose,
  onOrderPlaced,
  onViewStatus,
}) {
  const desktop = useIsDesktop();
  const [step, setStep] = useState(initialStep);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Semua");
  const [mode, setMode] = useState("dine");
  const [table, setTable] = useState(null);
  const [pay, setPay] = useState("QRIS");
  const [order, setOrder] = useState(null);
  const [sending, setSending] = useState(false);
  const [payError, setPayError] = useState("");
  const [paid, setPaid] = useState(false);
  const [qrLeft, setQrLeft] = useState(7);
  const [doneLeft, setDoneLeft] = useState(3);

  // Data pemesan (untuk Ambil dan Antar)
  const [nama, setNama] = useState("");
  const [noHp, setNoHp] = useState("");
  const [alamat, setAlamat] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);

  // Menu diambil dari backend (menggantikan data statis orderMenu.js)
  const [menu, setMenu] = useState([]);
  const [menuError, setMenuError] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        const res = await fetch(`${API}/products`);
        if (!res.ok) throw new Error(`Server membalas ${res.status}`);
        const data = await res.json();
        setMenu(
          data.map((p) => ({
            id: p.id,
            name: p.nama,
            price: p.harga,
            category: labelOf(p.kategori),
            desc: `★ ${p.rating} · ${p.reviews} penilaian`,
            color: COLORS[p.kategori] ?? "#C9D6E8",
            image: p.gambar ? img(p.gambar.split(".")[0]) : undefined,
          }))
        );
        setMenuError(false);
      } catch (err) {
        console.error("Gagal memuat menu untuk e-Order:", err);
        setMenuError(true);
      }
    }
    loadMenu();
  }, []);

  const categoryFilters = ["Semua", ...new Set(menu.map((m) => m.category))];

  // Status meja dari backend, digabung dengan posisi & kursi dari data/tables.js
  const [dbTables, setDbTables] = useState([]);

  useEffect(() => {
    async function loadTables() {
      try {
        const res = await fetch(`${API}/tables`);
        if (!res.ok) throw new Error(`Server membalas ${res.status}`);
        setDbTables(await res.json());
      } catch (err) {
        console.error("Gagal memuat status meja:", err);
      }
    }
    loadTables();
  }, []);

  // Meja yang belum ada di database dianggap terisi (tidak bisa dipilih)
  const floor = layout.map((t) => {
    const d = dbTables.find((x) => x.id === t.id);
    return { ...t, status: d ? d.status : "terisi" };
  });

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const qtyOf = (id) => cart.find((i) => i.cartId === id)?.qty ?? 0;

  // Stepper berubah 1 per ketukan: lebih besar = tambah, lebih kecil = kurangi
  const changeQty = (item, q) => {
    const current = qtyOf(item.id);
    if (q > current) addToCart({ cartId: item.id, name: item.name, price: item.price });
    else if (q < current) removeFromCart(item.id);
  };

  const lines = cart.map((i) => {
    const m = menu.find((x) => x.id === i.cartId);
    return {
      id: i.cartId,
      name: i.name,
      price: i.price,
      qty: i.qty,
      color: m?.color ?? "#C9D6E8",
      image: m?.image,
    };
  });
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const total = lines.reduce((a, l) => a + l.qty * l.price, 0);

  // Validasi form pemesan: nama minimal 2 huruf, nomor HP 9-15 angka
  const hpDigits = noHp.replace(/\D/g, "");
  const formOk = nama.trim().length >= 2 && hpDigits.length >= 9 && hpDigits.length <= 15;

  const needTable = mode === "dine" && table === null;
  const alamatOk = alamat.trim().length >= 5;
  const locationOk = deliveryLocation !== null;
  const canPay =
    lines.length > 0 &&
    !sending &&
    ((mode === "dine" && table !== null) ||
      (mode === "pickup" && formOk) ||
      (mode === "delivery" && formOk && alamatOk && locationOk));

  const shown = menu.filter(
    (m) =>
      (cat === "Semua" || m.category === cat) &&
      m.name.toLowerCase().includes(query.toLowerCase())
  );

  // Kirim pesanan ke backend
  const submitOrder = async () => {
    if (sending) return;
    setSending(true);
    setPayError("");

    try {
      const body = {
        items: lines.map((l) => ({ product_id: l.id, qty: l.qty })),
      };
      if (mode === "dine") {
        body.tipe_pesanan = "dine";
        body.meja_id = table;
      } else if (mode === "pickup") {
        body.tipe_pesanan = "pickup";
        body.nama_pelanggan = nama.trim();
        body.no_hp = hpDigits;
      } else if (mode === "delivery") {
        body.tipe_pesanan = "delivery";
        body.nama_pelanggan = nama.trim();
        body.no_hp = hpDigits;
        body.alamat = alamat.trim();
        body.lat = deliveryLocation[0];
        body.lng = deliveryLocation[1];
      }

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Server membalas ${res.status}`);

      let place;
      if (mode === "pickup") {
        const antrean = data.nomor_antrean ? ` ${data.nomor_antrean}` : "";
        place = `Ambil${antrean} - ${nama.trim()}`;
      } else if (mode === "delivery") {
        place = `Antar - ${nama.trim()}`;
      } else {
        const t = floor.find((x) => x.id === table);
        place = `Meja ${t.id}, ${t.seats} kursi`;
      }

      setOrder({
        id: data.id,
        mode,
        code: "ORD-" + data.id,
        place,
        names: lines.map((l) => l.name).join(", "),
        total,
      });
      // Simpan nomor pesanan supaya statusnya bisa dibuka lagi kapan saja
      if (onOrderPlaced) onOrderPlaced(data.id);
      clearCart();
      setStep("done");
    } catch (err) {
      console.error("Gagal mengirim pesanan:", err);
      setPayError(err.message);
      setStep("cart");
    } finally {
      setSending(false);
    }
  };

  // Tombol Bayar: QRIS/OVO tampilkan layar simulasi dulu, "Di kasir" langsung kirim
  const handlePay = () => {
    if (sending) return;
    if (pay === "Di kasir") submitOrder();
    else setStep("qris");
  };

  // Simulasi: 7 detik "menunggu bayar", lalu "berhasil" 3 detik, lalu pesanan dikirim
  useEffect(() => {
    if (step !== "qris") return;
    setPaid(false);
    setQrLeft(7);
    setDoneLeft(3);
    let qr = 7;
    let done = 3;
    let berhasil = false;
    const timer = setInterval(() => {
      if (!berhasil) {
        qr -= 1;
        setQrLeft(qr);
        if (qr <= 0) {
          berhasil = true;
          setPaid(true);
        }
      } else {
        done -= 1;
        setDoneLeft(done);
        if (done <= 0) {
          clearInterval(timer);
          submitOrder();
        }
      }
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div style={s.overlay} onClick={onClose}>
      <style>{keyframes}</style>

      <section
        role="dialog"
        aria-modal="true"
        style={{ ...s.panel, ...(desktop ? s.drawer : s.sheet) }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---------- LANGKAH 1: MENU ---------- */}
        {step === "menu" && (
          <>
            {!desktop && <div style={s.grab} />}
            <div style={s.head}>
              <h2 style={s.title}>Menu</h2>
              <button type="button" aria-label="Tutup" style={s.closeBtn} onClick={onClose}>
                ✕
              </button>
            </div>

            <div style={s.body}>
              <div style={{ position: "relative" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={MUTED}
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ position: "absolute", left: 14, top: 14 }}
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
                <input
                  style={s.search}
                  placeholder="Cari menu"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div style={s.chips}>
                {categoryFilters.map((c) => (
                  <button
                    key={c}
                    type="button"
                    style={{ ...s.chip, ...(cat === c ? s.chipOn : null) }}
                    onClick={() => setCat(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {menuError && <div style={s.empty}>Gagal memuat menu. Pastikan backend berjalan.</div>}
              {!menuError && shown.length === 0 && <div style={s.empty}>Menu tidak ditemukan</div>}

              {shown.map((m) => {
                const qty = qtyOf(m.id);
                return (
                  <div key={m.id} style={s.row}>
                    <Thumb image={m.image} color={m.color} />
                    <div style={s.rowInfo}>
                      <h3 style={s.rowName}>{m.name}</h3>
                      <p style={s.rowDesc}>{m.desc}</p>
                      <p style={s.rowPrice}>{rp(m.price)}</p>
                    </div>
                    {qty === 0 ? (
                      <button
                        type="button"
                        aria-label={`Tambah ${m.name}`}
                        style={s.addBtn}
                        onClick={() => changeQty(m, 1)}
                      >
                        +
                      </button>
                    ) : (
                      <Stepper qty={qty} onChange={(q) => changeQty(m, q)} />
                    )}
                  </div>
                );
              })}
            </div>

            {count > 0 && (
              <div style={s.footer}>
                <button type="button" style={s.primary} onClick={() => setStep("cart")}>
                  <span style={{ textAlign: "left", fontSize: 13 }}>
                    {count} item
                    <br />
                    <strong style={{ fontSize: 16 }}>{rp(total)}</strong>
                  </span>
                  <span>Lihat keranjang</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* ---------- LANGKAH 2: KERANJANG ---------- */}
        {step === "cart" && (
          <>
            <div style={s.headBlue}>
              <button type="button" aria-label="Kembali ke menu" style={s.closeBtnBlue} onClick={() => setStep("menu")}>
                ‹
              </button>
              <h2 style={s.titleBlue}>Keranjang</h2>
              <button type="button" aria-label="Tutup" style={s.closeBtnBlue} onClick={onClose}>
                ✕
              </button>
            </div>

            <div style={s.body}>
              {lines.length === 0 ? (
                <div style={s.empty}>
                  Keranjang masih kosong
                  <button type="button" style={{ ...s.secondary, marginTop: 16 }} onClick={() => setStep("menu")}>
                    Pilih menu
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ paddingTop: 8 }}>
                    {lines.map((l) => (
                      <div key={l.id} style={{ ...s.row, borderBottom: "none", padding: "10px 0" }}>
                        <Thumb image={l.image} color={l.color} size={48} radius={12} />
                        <div style={s.rowInfo}>
                          <h3 style={s.rowName}>{l.name}</h3>
                          <p style={s.rowPrice}>{rp(l.price)}</p>
                        </div>
                        <Stepper qty={l.qty} onChange={(q) => changeQty(l, q)} />
                      </div>
                    ))}
                  </div>

                  <h3 style={s.section}>Cara pesan</h3>
                  <div style={s.segment}>
                    {modes.map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        style={{ ...s.seg, ...(mode === m.key ? s.segOn : null) }}
                        onClick={() => {
                          setMode(m.key);
                          setPayError("");
                          if (m.key !== "dine" && pay === "Di kasir") setPay("QRIS");
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {mode === "dine" && (
                    <>
                      <h3 style={s.section}>Pilih meja</h3>
                      <FloorPlan tables={floor} selected={table} onSelect={setTable} />
                    </>
                  )}

                  {(mode === "pickup" || mode === "delivery") && (
                    <>
                      <h3 style={s.section}>Data pemesan</h3>

                      <label style={s.label} htmlFor="eo-nama">
                        Nama
                      </label>
                      <input
                        id="eo-nama"
                        style={s.field}
                        placeholder="Nama kamu"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                      />

                      <label style={s.label} htmlFor="eo-hp">
                        Nomor HP
                      </label>
                     <input
                        id="eo-hp"
                        style={s.field}
                        type="tel"
                        inputMode="numeric"
                        maxLength={15}
                        placeholder="08xxxxxxxxxx"
                        value={noHp}
                        onChange={(e) => setNoHp(bersihkanTelepon(e.target.value))}
                      />

                      {mode === "delivery" && (
                        <>
                          <label style={s.label} htmlFor="eo-alamat">
                            Alamat pengantaran
                          </label>
                          <textarea
                            id="eo-alamat"
                            style={{ ...s.field, minHeight: 80, resize: "vertical" }}
                            placeholder="Jalan, nomor rumah, patokan"
                            value={alamat}
                            onChange={(e) => setAlamat(e.target.value)}
                          />

                          <label style={s.label}>Lokasi pengantaran</label>

                          <div
                            style={{
                              height: 260,
                              borderRadius: 16,
                              overflow: "hidden",
                              border: `1px solid ${LINE}`,
                              marginBottom: 8,
                            }}
                          >
                            <MapContainer
                              center={deliveryLocation || MAP_CENTER}
                              zoom={13}
                              scrollWheelZoom={false}
                              style={{ width: "100%", height: "100%" }}
                            >
                              <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <LocationPicker
                                position={deliveryLocation}
                                onPick={setDeliveryLocation}
                              />
                            </MapContainer>
                          </div>

                          <p style={{ ...s.hint, marginBottom: 4 }}>
                            {deliveryLocation
                              ? "✓ Lokasi pengantaran sudah dipilih. Klik peta lagi untuk mengubah."
                              : "Klik pada peta untuk menentukan lokasi pengantaran."}
                          </p>

                          {deliveryLocation && (
                            <p
                              style={{
                                margin: "0 0 8px",
                                fontSize: 12,
                                color: MUTED,
                                textAlign: "center",
                              }}
                            >
                              Lat: {deliveryLocation[0].toFixed(6)} · Lng:{" "}
                              {deliveryLocation[1].toFixed(6)}
                            </p>
                          )}
                        </>
                      )}
                    </>
                  )}

                  <h3 style={s.section}>Cara bayar</h3>
                  <div style={s.payRow}>
                    {payments
                      .filter((p) => mode === "dine" || p !== "Di kasir")
                      .map((p) => (
                        <button
                          key={p}
                          type="button"
                          style={{ ...s.pay, ...(pay === p ? s.payOn : null) }}
                          onClick={() => setPay(p)}
                        >
                          {p}
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>

            {lines.length > 0 && (
              <div style={s.footer}>
                {needTable && <p style={s.hint}>Pilih meja di denah dulu</p>}
                {mode === "pickup" && !formOk && <p style={s.hint}>Isi nama dan nomor HP dulu</p>}
                {mode === "delivery" && !(formOk && alamatOk && locationOk) && (
                  <p style={s.hint}>
                    {!formOk
                      ? "Isi nama dan nomor HP dulu"
                      : !alamatOk
                      ? "Isi alamat pengantaran dulu"
                      : "Pilih lokasi pengantaran di peta dulu"}
                  </p>
                )}
                {payError && <p style={{ ...s.hint, color: "#C0392B" }}>{payError}</p>}
                <button
                  type="button"
                  disabled={!canPay}
                  style={{
                    ...s.primary,
                    justifyContent: "center",
                    opacity: canPay ? 1 : 0.5,
                    cursor: canPay ? "pointer" : "not-allowed",
                  }}
                  onClick={handlePay}
                >
                  {sending ? "Mengirim..." : `Bayar ${rp(total)}`}
                </button>
              </div>
            )}
          </>
        )}

        {/* ---------- LANGKAH QRIS: SIMULASI PEMBAYARAN ---------- */}
        {step === "qris" && (
          <>
            <div style={s.headBlue}>
              <span style={{ width: 40 }} />
              <h2 style={s.titleBlue}>Pembayaran {pay}</h2>
              <span style={{ width: 40 }} />
            </div>

            <div style={s.body}>
              <div style={{ textAlign: "center", paddingTop: 28 }}>
                <p style={{ margin: "0 0 4px", color: MUTED }}>Total pembayaran</p>
                <h2 style={{ margin: "0 0 18px", fontSize: 28, fontWeight: 800 }}>{rp(total)}</h2>
                <div
                  style={{
                    display: "inline-block",
                    padding: 12,
                    border: `1px solid ${LINE}`,
                    borderRadius: 18,
                  }}
                >
                  <QrFake size={200} />
                </div>

                {paid ? (
                  <div
                    style={{
                      margin: "18px 0 0",
                      padding: 14,
                      borderRadius: 14,
                      background: "#E6F5EC",
                      color: "#1E7A46",
                    }}
                  >
                    <strong style={{ fontSize: 16 }}>✓ Pembayaran berhasil</strong>
                    <p style={{ margin: "6px 0 0", fontSize: 14 }}>
                      Akan pindah ke halaman pesanan dalam {doneLeft} detik.
                      <br />
                      Jangan tutup halaman ini.
                    </p>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: "18px 0 4px", fontWeight: 700 }}>Scan dengan aplikasi e-wallet</p>
                    <p style={{ margin: 0, color: MUTED }}>Menunggu pembayaran... {qrLeft} detik</p>
                  </>
                )}

                <p style={{ margin: "22px 0 0", fontSize: 12, color: MUTED }}>
                  Simulasi pembayaran (demo), tidak ada uang yang diproses.
                </p>
              </div>
            </div>

            {!paid && (
              <div style={s.footer}>
                <button type="button" style={s.secondary} onClick={() => setStep("cart")}>
                  Batalkan
                </button>
              </div>
            )}
          </>
        )}

        {/* ---------- LANGKAH 3: PESANAN DITERIMA ---------- */}
        {step === "done" && order && (
          <>
            <div style={s.headBlue}>
              <span style={{ width: 40 }} />
              <h2 style={s.titleBlue}>e-Order</h2>
              <button type="button" aria-label="Tutup" style={s.closeBtnBlue} onClick={onClose}>
                ✕
              </button>
            </div>

            <div style={s.body}>
              <div style={s.doneWrap}>
                <div style={s.doneRing}>
                  <div style={s.doneDot}>✓</div>
                </div>
                <h2 style={{ margin: "16px 0 4px", fontSize: 26, fontWeight: 800 }}>Pesanan diterima</h2>
                <p style={{ margin: 0, color: MUTED }}>Dapur sedang menyiapkan pesananmu.</p>
              </div>

              <div style={s.receipt}>
                <h3 style={s.code}>{order.code}</h3>
                <Info label={order.mode === "dine" ? "Meja" : "Antrean"} value={order.place} />
                <Info label="Pesanan" value={order.names} />
                <Info label="Estimasi" value="Sekitar 15 menit" />
                <Info label="Total" value={rp(order.total)} />
              </div>
            </div>

            <div style={s.footer}>
              <button
                type="button"
                style={{ ...s.primary, justifyContent: "center" }}
                onClick={() => (onViewStatus ? onViewStatus(order.id) : onClose())}
              >
                Lihat status pesanan
              </button>
              <button type="button" style={s.secondary} onClick={() => setStep("menu")}>
                Tambah pesanan
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}