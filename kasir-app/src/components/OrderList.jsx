import { useState, useEffect } from "react";
import { API } from "../config";

// Tombol aksi per tipe pesanan, mengikuti URUTAN di backend (orders.js).
// Format: status saat ini -> [status berikutnya, tulisan tombol]
const ALUR = {
  dine: {
    pending: ["diproses", "Proses"],
    diproses: ["disajikan", "Sudah Disajikan"],
    disajikan: ["selesai", "Pelanggan Selesai"],
  },
  pickup: {
    pending: ["diproses", "Proses"],
    diproses: ["siap diambil", "Siap Diambil"],
    "siap diambil": ["diambil", "Sudah Diambil"],
  },
  delivery: {
    pending: ["diproses", "Proses"],
    diproses: ["dikirim", "Kirim Pesanan"],
    dikirim: ["selesai", "Pesanan Sampai"],
  },
};

const NAMA_TIPE = {
  dine: "Makan di sini",
  pickup: "Ambil",
  delivery: "Antar",
};

// Kelompok warna status: menunggu, dikerjakan, siap
function kelompok(status) {
  if (status === "pending") return "st-wait";
  if (status === "diproses") return "st-work";
  return "st-ready";
}

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

  // Judul kartu: pakai label dari backend, cadangan kalau label kosong
  function judulOrder(o) {
    if (o.label) return o.label;
    if (o.tipe_pesanan === "pickup") {
      return `Ambil ${o.nomor_antrean ?? ""} - ${o.nama_pelanggan ?? ""}`;
    }
    if (o.tipe_pesanan === "delivery") {
      return `Antar - ${o.nama_pelanggan ?? ""}`;
    }
    return `Meja ${o.meja_id}`;
  }

  async function ubahStatus(id, status) {
    try {
      const res = await fetch(`${API}/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Server membalas ${res.status}`);
      }
      setError("");
      loadOrders();
    } catch (err) {
      setError("Gagal mengubah status: " + err.message);
    }
  }

  return (
    <section>
      <h2 className="section-title">Pesanan aktif ({orders.length})</h2>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && !error && (
        <p className="empty">Belum ada pesanan aktif. Pesanan baru muncul otomatis.</p>
      )}

      <div className="orders">
        {orders.map((o) => {
          const tipe = o.tipe_pesanan || "dine";
          const aksi = ALUR[tipe]?.[o.status];
          const grup = kelompok(o.status);

          return (
            <article key={o.id} className={`order ${grup}`}>
              <div className="order-head">
                <span className="order-title">{judulOrder(o)}</span>
                <span className={`badge ${grup}`}>{o.status}</span>
              </div>
              <div className="order-info">
                Pesanan #{o.id} · {NAMA_TIPE[tipe]} · {formatJam(o.created_at)}
              </div>

              {tipe !== "dine" && o.no_hp && <div className="order-info">HP: {o.no_hp}</div>}
              {tipe === "delivery" && o.alamat && (
                <div className="order-info">Alamat: {o.alamat}</div>
              )}

              <ul>
                {o.items.map((it) => (
                  <li key={it.product_id}>
                    {it.qty} × {it.nama}
                  </li>
                ))}
              </ul>

              <div className="order-foot">
                <strong>Rp{hitungTotal(o.items).toLocaleString("id-ID")}</strong>
                {aksi && (
                  <button className="btn btn-primary" onClick={() => ubahStatus(o.id, aksi[0])}>
                    {aksi[1]}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default OrderList;