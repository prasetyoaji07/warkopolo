import { useState, useEffect } from "react";
import { API } from "../config";

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [duduk, setDuduk] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API}/bookings`),
        fetch(`${API}/kedatangan`),
      ]);
      if (!r1.ok) throw new Error(`Booking: server membalas ${r1.status}`);
      if (!r2.ok) throw new Error(`Meja terisi: server membalas ${r2.status}`);
      setBookings(await r1.json());
      setDuduk(await r2.json());
      setError("");
    } catch (err) {
      setError("Gagal mengambil data: " + err.message);
    }
  }

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, []);

  function formatTanggal(tanggal) {
    // "2026-10-01" -> "1 Okt 2026"
    const [y, m, d] = String(tanggal).slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  async function kirim(url, method, body, label) {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `${label}: server membalas ${res.status}`);
    }
  }

  async function batalkan(b) {
    try {
      await kirim(`${API}/bookings/${b.id}`, "PATCH", { status: "dibatalkan" }, "Booking");
      setError("");
      loadData();
    } catch (err) {
      setError("Gagal membatalkan: " + err.message);
    }
  }

  async function customerDatang(b) {
    try {
      await kirim(`${API}/kedatangan/${b.id}`, "POST", null, "Kedatangan");
      setError("");
      loadData();
    } catch (err) {
      setError("Gagal memproses kedatangan: " + err.message);
    }
  }

  async function customerSelesai(mejaId) {
    try {
      await kirim(`${API}/kedatangan/meja/${mejaId}/selesai`, "POST", null, "Meja");
      setError("");
      loadData();
    } catch (err) {
      setError("Gagal menyelesaikan meja: " + err.message);
    }
  }

  const kotak = {
    border: "1px solid #999",
    padding: 12,
    marginBottom: 12,
    maxWidth: 400,
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Booking Aktif</h2>
      {bookings.length === 0 && !error && <p>Belum ada booking aktif.</p>}

      {bookings.map((b) => (
        <div key={b.id} style={kotak}>
          <strong>
            Meja {b.meja_id} - {String(b.jam).slice(0, 5)}
          </strong>
          <div>{formatTanggal(b.tanggal)}</div>
          <div>
            {b.nama} ({b.no_hp})
          </div>
          <div>{b.jumlah_orang} orang</div>

          <div style={{ marginTop: 8 }}>
            <button onClick={() => customerDatang(b)}>Customer datang</button>{" "}
            <button onClick={() => batalkan(b)}>Batalkan</button>
          </div>
        </div>
      ))}

      <h2 style={{ marginTop: 32 }}>Tamu di Meja (dari booking)</h2>
      {duduk.length === 0 && !error && <p>Belum ada tamu booking yang sedang duduk.</p>}

      {duduk.map((d) => (
        <div key={d.meja_id} style={kotak}>
          <strong>
            Meja {d.meja_id} - datang {d.jam_datang}
          </strong>
          <div>{d.tamu || "-"}</div>
          <div>Otomatis kosong dalam {d.sisa_menit} menit</div>

          <div style={{ marginTop: 8 }}>
            <button onClick={() => customerSelesai(d.meja_id)}>Customer selesai</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BookingList;