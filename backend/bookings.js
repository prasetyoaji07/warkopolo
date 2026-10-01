const db = require("./src/db");

(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        meja_id INT NOT NULL,
        nama VARCHAR(100) NOT NULL,
        no_hp VARCHAR(20) NOT NULL,
        jumlah_orang INT NOT NULL,
        tanggal DATE NOT NULL,
        jam TIME NOT NULL,
        status ENUM('aktif','dibatalkan','selesai') NOT NULL DEFAULT 'aktif',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meja_id) REFERENCES tables(id)
      )
    `);
    const [a] = await db.query("SHOW TABLES");
    console.log("Tabel:", a.map((r) => Object.values(r)[0]).join(", "));
  } catch (err) {
    console.error("Gagal:", err.message);
  }
  process.exit();
})();