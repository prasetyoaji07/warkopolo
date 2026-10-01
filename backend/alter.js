const db = require("./src/db");

(async () => {
  try {
    await db.query(
      "ALTER TABLE orders MODIFY status ENUM('pending','diproses','disajikan','selesai') NOT NULL DEFAULT 'pending'"
    );
    const [[a]] = await db.query("SELECT DATABASE() AS dipakai");
    const [b] = await db.query("SHOW COLUMNS FROM orders LIKE 'status'");
    console.log("Database:", a.dipakai);
    console.log("Kolom status:", b[0].Type);
  } catch (err) {
    console.error("Gagal:", err.message);
  }
  process.exit();
})();