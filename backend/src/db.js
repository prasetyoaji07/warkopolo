const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // SSL hanya aktif kalau DB_SSL=true (dipakai di database online).
  // minVersion: 'TLSv1.2' WAJIB ada untuk TiDB Cloud - tanpa ini,
  // koneksi gagal ETIMEDOUT walau TCP murni berhasil (sudah dites
  // dan dikonfirmasi lewat node -e manual).
  ssl:
    process.env.DB_SSL === "true"
      ? { rejectUnauthorized: false, minVersion: "TLSv1.2" }
      : undefined,
});

// Setiap koneksi baru di pool diberi tahu memakai WIB (+07:00),
// supaya CURRENT_TIMESTAMP dan pembacaan kolom TIMESTAMP konsisten WIB.
pool.on("connection", (conn) => {
  conn.query("SET time_zone = '+07:00';");
});

module.exports = pool;