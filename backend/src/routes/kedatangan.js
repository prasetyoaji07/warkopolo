const express = require("express");
const pool = require("../db");

const router = express.Router();

// Batas maksimal tamu booking duduk di meja (menit)
const DURASI_MAKS_MENIT = 60;
// Kosongkan meja dan tutup pesanan yang masih berjalan di meja itu
async function kosongkanMeja(conn, mejaId) {
  await conn.query(
    "UPDATE orders SET status = 'selesai' WHERE meja_id = ? AND status <> 'selesai'",
    [mejaId]
  );
  await conn.query(
    "UPDATE `tables` SET status = 'kosong', terisi_sejak = NULL, tamu = NULL WHERE id = ?",
    [mejaId]
  );
}

// Setelah request lain sukses, hapus catatan waktu datang supaya tidak basi
function resetSetelahSukses(res, sql, params) {
  res.on("finish", () => {
    if (res.statusCode >= 400) return;
    pool.query(sql, params).catch((err) =>
      console.error("[kedatangan] reset gagal:", err.message)
    );
  });
}

// Meja dikosongkan lewat jalur lain (PATCH /tables/:id)
router.patch("/tables/:id", (req, res, next) => {
  if (req.body && req.body.status === "kosong") {
    resetSetelahSukses(
      res,
      "UPDATE `tables` SET terisi_sejak = NULL, tamu = NULL WHERE id = ? AND status = 'kosong'",
      [req.params.id]
    );
  }
  next();
});

// Pesanan diselesaikan lewat tab Pesanan (PATCH /orders/:id)
router.patch("/orders/:id", (req, res, next) => {
  if (req.body && req.body.status === "selesai") {
    resetSetelahSukses(
      res,
      "UPDATE `tables` t JOIN orders o ON o.meja_id = t.id " +
        "SET t.terisi_sejak = NULL, t.tamu = NULL WHERE o.id = ? AND t.status = 'kosong'",
      [req.params.id]
    );
  }
  next();
});

// Customer datang: meja jadi terisi, booking ditandai selesai
router.post("/kedatangan/:id", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [bookings] = await conn.query(
      "SELECT id, meja_id, nama, status FROM bookings WHERE id = ? FOR UPDATE",
      [req.params.id]
    );
    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Booking tidak ditemukan" });
    }
    const booking = bookings[0];
    if (booking.status !== "aktif") {
      await conn.rollback();
      return res.status(409).json({ error: "Booking sudah tidak aktif" });
    }

    const [meja] = await conn.query(
      "SELECT status FROM `tables` WHERE id = ? FOR UPDATE",
      [booking.meja_id]
    );
    if (meja.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Meja tidak ditemukan" });
    }
    if (meja[0].status !== "kosong") {
      await conn.rollback();
      return res.status(409).json({ error: "Meja masih dipakai tamu lain" });
    }

    await conn.query(
      "UPDATE `tables` SET status = 'terisi', terisi_sejak = NOW(), tamu = ? WHERE id = ?",
      [booking.nama, booking.meja_id]
    );
    await conn.query("UPDATE bookings SET status = 'selesai' WHERE id = ?", [booking.id]);

    await conn.commit();
    res.json({ ok: true, meja_id: booking.meja_id });
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error("[kedatangan] gagal:", err.message);
    res.status(500).json({ error: "Gagal memproses kedatangan" });
  } finally {
    conn.release();
  }
});

// Daftar meja yang sedang dipakai tamu booking
router.get("/kedatangan", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id AS meja_id, tamu, DATE_FORMAT(terisi_sejak, '%H:%i') AS jam_datang, " +
        "GREATEST(0, ? - TIMESTAMPDIFF(MINUTE, terisi_sejak, NOW())) AS sisa_menit " +
        "FROM `tables` WHERE status = 'terisi' AND terisi_sejak IS NOT NULL " +
        "ORDER BY terisi_sejak",
      [DURASI_MAKS_MENIT]
    );
    res.json(rows);
  } catch (err) {
    console.error("[kedatangan] gagal memuat:", err.message);
    res.status(500).json({ error: "Gagal memuat meja terisi" });
  }
});

// Kasir menekan "Customer selesai"
router.post("/kedatangan/meja/:mejaId/selesai", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await kosongkanMeja(conn, req.params.mejaId);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error("[kedatangan] gagal menyelesaikan:", err.message);
    res.status(500).json({ error: "Gagal menyelesaikan meja" });
  } finally {
    conn.release();
  }
});

// Otomatis kosongkan meja yang sudah lewat batas waktu
async function autoSelesaiMeja() {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      "SELECT id FROM `tables` WHERE status = 'terisi' AND terisi_sejak IS NOT NULL " +
        "AND terisi_sejak < (NOW() - INTERVAL ? MINUTE)",
      [DURASI_MAKS_MENIT]
    );
    for (const r of rows) {
      await conn.beginTransaction();
      await kosongkanMeja(conn, r.id);
      await conn.commit();
      console.log(`[auto-selesai] Meja ${r.id} dikosongkan (lewat ${DURASI_MAKS_MENIT} menit)`);
    }
  } catch (err) {
    await conn.rollback().catch(() => {});
    console.error("[auto-selesai] gagal:", err.message);
  } finally {
    conn.release();
  }
}

autoSelesaiMeja();
setInterval(autoSelesaiMeja, 60 * 1000);

module.exports = router;