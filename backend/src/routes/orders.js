const express = require("express");
const db = require("../db");

const router = express.Router();

// POST /orders -> buat order baru (checkout)
// Body: { "meja_id": 1, "items": [ { "product_id": 3, "qty": 2 }, ... ] }
router.post("/", async (req, res) => {
  const { meja_id, items } = req.body;

  if (!meja_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "meja_id dan items wajib diisi" });
  }
  for (const it of items) {
    if (!it.product_id || !Number.isInteger(it.qty) || it.qty < 1) {
      return res.status(400).json({
        error: "setiap item butuh product_id dan qty (bilangan bulat >= 1)",
      });
    }
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // 0. cek meja: harus ada dan masih kosong (dikunci supaya tidak bentrok)
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
      const err = new Error("Meja " + meja_id + " sedang terisi");
      err.status = 409;
      throw err;
    }

    // 1. buat baris order (status & created_at terisi otomatis)
    const [orderResult] = await conn.query(
      "INSERT INTO orders (meja_id) VALUES (?)",
      [meja_id]
    );
    const orderId = orderResult.insertId;

    // 2. simpan tiap item, nama & harga diambil dari database
    for (const it of items) {
      const [rows] = await conn.query(
        "SELECT id, nama, harga FROM products WHERE id = ?",
        [it.product_id]
      );
      if (rows.length === 0) {
        const err = new Error("Menu dengan id " + it.product_id + " tidak ditemukan");
        err.status = 400;
        throw err;
      }
      await conn.query(
        "INSERT INTO order_items (order_id, product_id, nama, harga, qty) VALUES (?, ?, ?, ?, ?)",
        [orderId, rows[0].id, rows[0].nama, rows[0].harga, it.qty]
      );
    }

    // 3. tandai meja terisi
    await conn.query("UPDATE tables SET status = 'terisi' WHERE id = ?", [meja_id]);

    await conn.commit();
    res.status(201).json({ id: orderId, meja_id, status: "pending" });
  } catch (err) {
    if (conn) await conn.rollback();

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({ error: "Meja tidak ditemukan" });
    }
    res.status(err.status || 500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /orders?status=aktif -> order yang belum selesai (untuk kasir app)
// GET /orders              -> semua order (riwayat)
router.get("/", async (req, res) => {
  try {
    let sql = "SELECT id, meja_id, status, created_at FROM orders";
    if (req.query.status === "aktif") {
      sql += " WHERE status != 'selesai'";
    }
    sql += " ORDER BY created_at ASC, id ASC";

    const [orders] = await db.query(sql);

    if (orders.length === 0) {
      return res.json([]);
    }

    // ambil semua item untuk order-order tadi dalam satu query
    const ids = orders.map((o) => o.id);
    const [items] = await db.query(
      "SELECT order_id, product_id, nama, harga, qty FROM order_items WHERE order_id IN (?)",
      [ids]
    );

    // tempelkan item ke order masing-masing
    const result = orders.map((o) => ({
      ...o,
      items: items.filter((it) => it.order_id === o.id),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /orders/:id -> ubah status order (pending -> diproses -> selesai)
router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  if (!["pending", "diproses", "selesai"].includes(status)) {
    return res
      .status(400)
      .json({ error: "status harus 'pending', 'diproses', atau 'selesai'" });
  }

  try {
    const [result] = await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order tidak ditemukan" });
    }
    res.json({ message: "Status order diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;