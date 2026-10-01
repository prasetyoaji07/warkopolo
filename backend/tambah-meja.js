const db = require("./src/db");

(async () => {
  try {
    await db.query(
      "INSERT IGNORE INTO tables (id, nama_meja) VALUES (7,'Meja 7'),(8,'Meja 8'),(9,'Meja 9'),(10,'Meja 10')"
    );
    const [rows] = await db.query("SELECT id, nama_meja, status FROM tables ORDER BY id");
    console.log(rows);
  } catch (err) {
    console.error("Gagal:", err.message);
  }
  process.exit();
})();