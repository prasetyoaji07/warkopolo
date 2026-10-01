import { useState, useEffect } from "react";
import { API } from "../config";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      const res = await fetch(`${API}/orders?status=aktif`);
      if (!res.ok) throw new Error(`Server membalas ${res.status}`);
      setOrders(await res.json());
      setError("");
    } catch (err) {
      setError("Gagal mengambil pesanan: " + err.message);
    }
  }

  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 5000);
    return () => clearInterval(timer);
  }, []);

  function formatJam(createdAt) {
    return new Date(createdAt).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function hitungTotal(items) {
    return items.reduce((sum, it) => sum + Number(it.harga) * it.qty, 0);
  }

  async function ubahStatus(id, status) {
    try {
      const res = await fetch(`${API}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Server membalas ${res.status}`);
      loadOrders();
    } catch (err) {
      setError("Gagal mengubah status: " + err.message);
    }
  }

  async function selesaikan(order) {
    try {
      const res1 = await fetch(`${API}/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "selesai" }),
      });
      if (!res1.ok) throw new Error(`Order: server membalas ${res1.status}`);

      const res2 = await fetch(`${API}/tables/${order.meja_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "kosong" }),
      });
      if (!res2.ok) throw new Error(`Meja: server membalas ${res2.status}`);

      loadOrders();
    } catch (err) {
      setError("Gagal menyelesaikan: " + err.message);
    }
  }

  return (
    <div>
      <h2>Pesanan Aktif</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {orders.length === 0 && !error && <p>Belum ada pesanan aktif.</p>}

      {orders.map((o) => (
        <div
          key={o.id}
          style={{
            border: "1px solid #999",
            padding: 12,
            marginBottom: 12,
            maxWidth: 400,
          }}
        >
          <strong>
            Meja {o.meja_id} - {formatJam(o.created_at)}
          </strong>
          <div>Status: {o.status}</div>

          <ul>
            {o.items.map((it) => (
              <li key={it.product_id}>
                {it.qty} x {it.nama} (Rp{Number(it.harga).toLocaleString("id-ID")})
              </li>
            ))}
          </ul>

          <strong>Total: Rp{hitungTotal(o.items).toLocaleString("id-ID")}</strong>

          {o.status === "pending" && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => ubahStatus(o.id, "diproses")}>Proses</button>
            </div>
          )}

          {o.status === "diproses" && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => ubahStatus(o.id, "disajikan")}>
                Sudah Disajikan
              </button>
            </div>
          )}

          {o.status === "disajikan" && (
            <div style={{ marginTop: 8 }}>
              <button onClick={() => selesaikan(o)}>Pelanggan Selesai</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default OrderList;