const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // SSL hanya aktif kalau DB_SSL=true (dipakai di database online)
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

// Setiap koneksi baru di pool diberi tahu memakai WIB (+07:00),
// supaya CURRENT_TIMESTAMP dan pembacaan kolom TIMESTAMP konsisten WIB.
pool.on("connection", (conn) => {
  conn.query("SET time_zone = '+07:00';");
});

module.exports = pool;