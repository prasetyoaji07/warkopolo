import { useEffect, useRef, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import { API } from "../config";

const BG = "#0B5AB4";
const ACCENT = "#E8A93A";
const MUTED = "#6B7280";

const STEPS = [
  { key: "pending", label: "Pesanan diterima" },
  { key: "diproses", label: "Sedang disiapkan" },
  { key: "disajikan", label: "Sudah disajikan" },
  { key: "selesai", label: "Selesai" },
];

const rupiah = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const styles = {
  wrap: { maxWidth: 560, margin: "0 auto", padding: "32px 20px" },
  card: {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  title: { margin: "0 0 4px", fontSize: 24, color: BG },
  sub: { margin: 0, fontSize: 14, color: MUTED },
  step: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0" },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    fontSize: 15,
  },
  btn: {
    display: "inline-block",
    marginTop: 8,
    padding: "10px 18px",
    borderRadius: 12,
    background: BG,
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
  },
};

function StatusPesanan() {
  const { id } = useParams();
  const ctx = useOutletContext() || {};
  const clearLastOrder = ctx.clearLastOrder;

  const [order, setOrder] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const cleared = useRef(false);

  useEffect(() => {
    let alive = true;
    cleared.current = false;
    setOrder(null);
    setLoaded(false);

    async function load() {
      try {
        const res = await fetch(`${API}/orders?status=aktif`);
        if (!res.ok) throw new Error("gagal");
        const list = await res.json();
        if (!alive) return;
        const found = list.find((o) => String(o.id) === String(id));
        setOrder(found || null);
        setError(false);
        setLoaded(true);
      } catch {
        if (alive) setError(true);
      }
    }

    load();
    const timer = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [id]);

  // Tidak ada di daftar aktif (dan data sudah berhasil dimuat) = dianggap selesai
  const done = loaded && !order;

  useEffect(() => {
    if (done && !cleared.current) {
      cleared.current = true;
      clearLastOrder?.();
    }
  }, [done, clearLastOrder]);

  const currentIdx = done
    ? STEPS.length - 1
    : order
    ? Math.max(0, STEPS.findIndex((s) => s.key === order.status))
    : -1;

  const total = order
    ? order.items.reduce((sum, it) => sum + it.harga * it.qty, 0)
    : 0;

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h1 style={styles.title}>Status Pesanan #{id}</h1>
        {order && <p style={styles.sub}>Meja {order.meja_id}</p>}
        {!loaded && !error && <p style={styles.sub}>Memuat...</p>}
        {error && (
          <p style={{ ...styles.sub, color: "#B91C1C" }}>
            Tidak bisa terhubung ke server. Mencoba lagi...
          </p>
        )}
      </div>

      {loaded && (
        <div style={styles.card}>
          {STEPS.map((s, i) => {
            const reached = i <= currentIdx;
            return (
              <div key={s.key} style={styles.step}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: reached ? ACCENT : "#E5E7EB",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontWeight: i === currentIdx ? 700 : 400,
                    color: reached ? "#111827" : MUTED,
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {order && (
        <div style={styles.card}>
          {order.items.map((it) => (
            <div key={it.product_id} style={styles.row}>
              <span>
                {it.nama} x{it.qty}
              </span>
              <span>{rupiah(it.harga * it.qty)}</span>
            </div>
          ))}
          <div
            style={{
              ...styles.row,
              borderTop: "1px solid #E5E7EB",
              marginTop: 8,
              paddingTop: 12,
              fontWeight: 700,
            }}
          >
            <span>Total</span>
            <span>{rupiah(total)}</span>
          </div>
        </div>
      )}

      {done && (
        <div style={styles.card}>
          <p style={{ margin: 0 }}>
            Pesanan ini sudah selesai. Terima kasih sudah makan di Warkopolo!
          </p>
        </div>
      )}

      <Link to="/" style={styles.btn}>
        Kembali ke Home
      </Link>
    </div>
  );
}

export default StatusPesanan;