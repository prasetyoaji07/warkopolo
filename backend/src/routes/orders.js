const express = require("express");
const db = require("../db");

const router = express.Router();

// Alur status berbeda per tipe pesanan.
const URUTAN = {
  dine: {
    pending: "diproses",
    diproses: "disajikan",
    disajikan: "selesai",
  },

  pickup: {
    pending: "diproses",
    diproses: "siap diambil",
    "siap diambil": "diambil",
  },

  delivery: {
    pending: "diproses",
    diproses: "dikirim",
    dikirim: "selesai",
  },
};

// Label tampilan untuk kasir.
function buatLabel(o) {
  if (o.tipe_pesanan === "dine") {
    return `Meja ${o.meja_id}`;
  }

  if (o.tipe_pesanan === "pickup") {
    return `Ambil ${o.nomor_antrean} - ${o.nama_pelanggan}`;
  }

  return `Antar - ${o.nama_pelanggan}`;
}

// =========================================================
// POST /orders
// Buat order baru
// =========================================================

router.post("/", async (req, res) => {
  const {
    tipe_pesanan = "dine",
    meja_id,
    items,
    nama_pelanggan,
    no_hp,
    alamat,
    lat,
    lng,
  } = req.body;

  if (!["dine", "pickup", "delivery"].includes(tipe_pesanan)) {
    return res
      .status(400)
      .json({ error: "tipe_pesanan tidak dikenali" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: "items wajib diisi" });
  }

  for (const it of items) {
    if (
      !it.product_id ||
      !Number.isInteger(it.qty) ||
      it.qty < 1
    ) {
      return res.status(400).json({
        error:
          "setiap item butuh product_id dan qty (bilangan bulat >= 1)",
      });
    }
  }

  // Validasi dine-in
  if (tipe_pesanan === "dine" && !meja_id) {
    return res.status(400).json({
      error: "meja_id wajib diisi untuk dine-in",
    });
  }

  // Validasi pickup / delivery
  if (
    (tipe_pesanan === "pickup" ||
      tipe_pesanan === "delivery") &&
    (!nama_pelanggan?.trim() || !no_hp?.trim())
  ) {
    return res.status(400).json({
      error: "nama_pelanggan dan no_hp wajib diisi",
    });
  }

  // Validasi delivery
  if (
    tipe_pesanan === "delivery" &&
    (!alamat?.trim() ||
      typeof lat !== "number" ||
      typeof lng !== "number")
  ) {
    return res.status(400).json({
      error:
        "alamat, lat, dan lng wajib diisi untuk pengantaran",
    });
  }

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // =====================================================
    // DINE-IN
    // =====================================================

    if (tipe_pesanan === "dine") {
      const [mejaRows] = await conn.query(
        "SELECT status FROM tables WHERE id = ? FOR UPDATE",
        [meja_id]
      );

      if (mejaRows.length === 0) {
        const err = new Error("Meja tidak ditemukan");
        err.status = 400;
        throw err;
      }

      if (mejaRows[0].status !== "kosong") {
        const err = new Error(
          "Meja " + meja_id + " sedang terisi"
        );
        err.status = 409;
        throw err;
      }
    }

    // =====================================================
    // PICKUP
    // =====================================================

    let nomor_antrean = null;

    if (tipe_pesanan === "pickup") {
      const [[{ jumlah }]] = await conn.query(
        `SELECT COUNT(*) AS jumlah
         FROM orders
         WHERE tipe_pesanan = 'pickup'
         AND DATE(created_at) = CURDATE()`
      );

      const urutan = jumlah + 1;

      nomor_antrean =
        "A-" + String(urutan).padStart(2, "0");
    }

    // =====================================================
    // INSERT ORDER
    // =====================================================

    const [orderResult] = await conn.query(
      `INSERT INTO orders
        (
          meja_id,
          tipe_pesanan,
          nama_pelanggan,
          no_hp,
          alamat,
          lat,
          lng,
          nomor_antrean
        )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipe_pesanan === "dine"
          ? meja_id
          : null,

        tipe_pesanan,

        nama_pelanggan ?? null,

        no_hp ?? null,

        alamat ?? null,

        lat ?? null,

        lng ?? null,

        nomor_antrean,
      ]
    );

    const orderId = orderResult.insertId;

    // =====================================================
    // INSERT ORDER ITEMS
    // =====================================================

    for (const it of items) {
      const [rows] = await conn.query(
        "SELECT id, nama, harga FROM products WHERE id = ?",
        [it.product_id]
      );

      if (rows.length === 0) {
        const err = new Error(
          "Menu dengan id " +
            it.product_id +
            " tidak ditemukan"
        );

        err.status = 400;
        throw err;
      }

      await conn.query(
        `INSERT INTO order_items
          (order_id, product_id, nama, harga, qty)
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          rows[0].id,
          rows[0].nama,
          rows[0].harga,
          it.qty,
        ]
      );
    }

    // =====================================================
    // DINE-IN → MEJA TERISI
    // =====================================================

    if (tipe_pesanan === "dine") {
      await conn.query(
        "UPDATE tables SET status = 'terisi' WHERE id = ?",
        [meja_id]
      );
    }

    await conn.commit();

    res.status(201).json({
      id: orderId,
      tipe_pesanan,
      meja_id:
        tipe_pesanan === "dine"
          ? meja_id
          : null,
      nomor_antrean,
      status: "pending",
    });
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        error: "Meja tidak ditemukan",
      });
    }

    res
      .status(err.status || 500)
      .json({ error: err.message });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

// =========================================================
// GET /orders
// Semua order / order aktif
// =========================================================

router.get("/", async (req, res) => {
  try {
    let sql = `
      SELECT
        id,
        meja_id,
        status,
        created_at,
        tipe_pesanan,
        nama_pelanggan,
        no_hp,
        alamat,
        lat,
        lng,
        nomor_antrean
      FROM orders
    `;

    if (req.query.status === "aktif") {
      sql += `
        WHERE status != 'selesai'
        AND status != 'diambil'
      `;
    }

    sql += `
      ORDER BY created_at ASC, id ASC
    `;

    const [orders] = await db.query(sql);

    if (orders.length === 0) {
      return res.json([]);
    }

    const ids = orders.map((o) => o.id);

    const [items] = await db.query(
      `SELECT
         order_id,
         product_id,
         nama,
         harga,
         qty
       FROM order_items
       WHERE order_id IN (?)`,
      [ids]
    );

    const result = orders.map((o) => ({
      ...o,
      label: buatLabel(o),
      items: items.filter(
        (it) => it.order_id === o.id
      ),
    }));

    res.json(result);
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message });
  }
});

// =========================================================
// GET /orders/:id
// Ambil SATU order berdasarkan ID.
// Penting untuk halaman status customer.
//
// Endpoint ini tetap mengembalikan order walaupun
// status sudah "selesai" / "diambil".
// =========================================================

router.get("/:id", async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT
         id,
         meja_id,
         status,
         created_at,
         tipe_pesanan,
         nama_pelanggan,
         no_hp,
         alamat,
         lat,
         lng,
         nomor_antrean
       FROM orders
       WHERE id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        error: "Order tidak ditemukan",
      });
    }

    const order = orders[0];

    const [items] = await db.query(
      `SELECT
         order_id,
         product_id,
         nama,
         harga,
         qty
       FROM order_items
       WHERE order_id = ?`,
      [req.params.id]
    );

    res.json({
      ...order,
      label: buatLabel(order),
      items,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message });
  }
});

// =========================================================
// PATCH /orders/:id
// Ubah status order
// =========================================================

router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  let conn;

  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT
         status,
         meja_id,
         tipe_pesanan
       FROM orders
       WHERE id = ?
       FOR UPDATE`,
      [req.params.id]
    );

    if (rows.length === 0) {
      const err = new Error(
        "Order tidak ditemukan"
      );

      err.status = 404;
      throw err;
    }

    const urutanTipe =
      URUTAN[rows[0].tipe_pesanan];

    if (
      !urutanTipe ||
      urutanTipe[rows[0].status] !== status
    ) {
      const err = new Error(
        `Tidak bisa dari '${rows[0].status}' ke '${status}' untuk pesanan ${rows[0].tipe_pesanan}`
      );

      err.status = 400;
      throw err;
    }

    await conn.query(
      `UPDATE orders
       SET
         status = ?,
         disajikan_at =
           IF(
             ? = 'disajikan',
             NOW(),
             disajikan_at
           )
       WHERE id = ?`,
      [
        status,
        status,
        req.params.id,
      ]
    );

    // Hanya dine-in yang mengosongkan meja.
    if (
      rows[0].tipe_pesanan === "dine" &&
      status === "selesai"
    ) {
      await conn.query(
        "UPDATE tables SET status = 'kosong' WHERE id = ?",
        [rows[0].meja_id]
      );
    }

    await conn.commit();

    res.json({
      message: "Status order diperbarui",
      id: Number(req.params.id),
      status,
    });
  } catch (err) {
    if (conn) {
      await conn.rollback();
    }

    res
      .status(err.status || 500)
      .json({ error: err.message });
  } finally {
    if (conn) {
      conn.release();
    }
  }
});

module.exports = router;