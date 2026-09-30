const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /tables -> ambil semua meja
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tables ORDER BY id");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /tables/:id -> ubah status meja (kosong / terisi)
router.patch("/:id", async (req, res) => {
  const { status } = req.body;

  if (status !== "kosong" && status !== "terisi") {
    return res
      .status(400)
      .json({ error: "status harus 'kosong' atau 'terisi'" });
  }

  try {
    const [result] = await db.query(
      "UPDATE tables SET status = ? WHERE id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Meja tidak ditemukan" });
    }
    res.json({ message: "Status meja diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;