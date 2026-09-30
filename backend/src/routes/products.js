const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /products -> ambil semua menu
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /products -> tambah menu baru
router.post("/", async (req, res) => {
  const { nama, harga, kategori, gambar } = req.body;

  if (!nama || !harga || !kategori) {
    return res.status(400).json({ error: "nama, harga, kategori wajib diisi" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO products (nama, harga, kategori, gambar) VALUES (?, ?, ?, ?)",
      [nama, harga, kategori, gambar || null]
    );
    res.status(201).json({ id: result.insertId, nama, harga, kategori, gambar });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /products/:id -> edit menu
router.put("/:id", async (req, res) => {
  const { nama, harga, kategori, gambar } = req.body;

  try {
    const [result] = await db.query(
      "UPDATE products SET nama = ?, harga = ?, kategori = ?, gambar = ? WHERE id = ?",
      [nama, harga, kategori, gambar || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu tidak ditemukan" });
    }
    res.json({ message: "Menu diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /products/:id -> hapus menu
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu tidak ditemukan" });
    }
    res.json({ message: "Menu dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;