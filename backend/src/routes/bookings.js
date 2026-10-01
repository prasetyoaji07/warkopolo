const express = require("express");
const db = require("../db");

const router = express.Router();

// Satu booking menahan meja selama 2 jam (7200 detik)
const DURASI_DETIK = 7200;

// POST /bookings -> buat booking baru
// Body: { meja_id, nama, no_hp, jumlah_orang, tanggal: "YYYY-MM-DD", jam: "HH:MM" }
router.post("/", async (req, res) => {
  const { meja_id, nama, no_hp, jumlah_orang, tanggal, jam } = req.body;

  if (!meja_id || !nama?.trim() || !no_hp?.trim()) {
    return res.status(400).json({ error: "meja_id, nama, dan no_hp wajib diisi" });
  }
  if (!Number.isInteger(jumlah_orang) || jumlah_orang < 1 || jumlah_orang > 6) {
    return res.status(400).json({ error: "jumlah_orang harus 1 sampai 6" });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal || "") || !/^\d{2}:\d{2}$/.test(jam || "")) {
    return res.status(400).json({ error: "format tanggal YYYY-MM-DD dan jam HH:MM" });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Kunci baris meja supaya dua booking bersamaan tidak lolos keduanya
    const [meja] = await conn.query("SELECT id FROM tables WHERE id = ? FOR UPDATE", [meja_id]);
    if (meja.length === 0) {
      const err = new Error("Meja tidak ditemukan");
      err.status = 400;
      throw err;
    }

    const [bentrok] = await conn.query(
      `SELECT id FROM bookings
       WHERE meja_id = ? AND tanggal = ? AND status = 'aktif'
         AND ABS(TIME_TO_SEC(jam) - TIME_TO_SEC(?)) < ?`,
      [meja_id, tanggal, jam, DURASI_DETIK]
    );
    if (bentrok.length > 0) {
      const err = new Error("Meja sudah dipesan di jam tersebut");
      err.status = 409;
      throw err;
    }

    const [hasil] = await conn.query(
      "INSERT INTO bookings (meja_id, nama, no_hp, jumlah_orang, tanggal, jam) VALUES (?, ?, ?, ?, ?, ?)",
      [meja_id, nama.trim(), no_hp.trim(), jumlah_orang, tanggal, jam]
    );

    await conn.commit();
    res.status(201).json({ id: hasil.insertId, kode: "BK-" + hasil.insertId });
  } catch (err) {
    if (conn) await conn.rollback();
    res.status(err.status || 500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /bookings/ketersediaan?tanggal=YYYY-MM-DD&jam=HH:MM
// -> daftar id meja yang sudah dipesan pada waktu itu (untuk customer app)
router.get("/ketersediaan", async (req, res) => {
  const { tanggal, jam } = req.query;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal || "") || !/^\d{2}:\d{2}$/.test(jam || "")) {
    return res.status(400).json({ error: "butuh tanggal (YYYY-MM-DD) dan jam (HH:MM)" });
  }
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT meja_id FROM bookings
       WHERE tanggal = ? AND status = 'aktif'
         AND ABS(TIME_TO_SEC(jam) - TIME_TO_SEC(?)) < ?`,
      [tanggal, jam, DURASI_DETIK]
    );
    res.json(rows.map((r) => r.meja_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookings -> booking aktif mulai hari ini (untuk kasir app)
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, meja_id, nama, no_hp, jumlah_orang,
              DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal,
              TIME_FORMAT(jam, '%H:%i') AS jam,
              status
       FROM bookings
       WHERE status = 'aktif' AND tanggal >= CURDATE()
       ORDER BY tanggal ASC, jam ASC, id ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /bookings/:id -> ubah status ('dibatalkan' atau 'selesai')
router.patch("/:id", async (req, res) => {
  const { status } = req.body;
  if (!["dibatalkan", "selesai"].includes(status)) {
    return res.status(400).json({ error: "status harus 'dibatalkan' atau 'selesai'" });
  }
  try {
    const [hasil] = await db.query(
      "UPDATE bookings SET status = ? WHERE id = ? AND status = 'aktif'",
      [status, req.params.id]
    );
    if (hasil.affectedRows === 0) {
      return res.status(404).json({ error: "Booking aktif tidak ditemukan" });
    }
    res.json({ message: "Status booking diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;