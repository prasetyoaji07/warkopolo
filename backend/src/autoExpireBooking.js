const db = require("./db");

// Booking berstatus 'aktif' yang jam reservasinya sudah lewat lebih dari
// TOLERANSI_MENIT, dan mejanya masih 'kosong' (tamu belum datang/belum ada
// order), dianggap no-show dan otomatis dibatalkan. Kalau meja sudah
// 'terisi' (tamu sudah datang), booking TIDAK disentuh.
const TOLERANSI_MENIT = 15;

async function jalankanAutoExpireBooking() {
  try {
    const [hasil] = await db.query(
      `UPDATE bookings b
       JOIN tables t ON t.id = b.meja_id
       SET b.status = 'dibatalkan'
       WHERE b.status = 'aktif'
         AND t.status = 'kosong'
         AND TIMESTAMP(b.tanggal, b.jam) < (NOW() - INTERVAL ? MINUTE)`,
      [TOLERANSI_MENIT]
    );
    if (hasil.affectedRows > 0) {
      console.log(
        `[auto-expire] ${hasil.affectedRows} booking dibatalkan otomatis (no-show, >${TOLERANSI_MENIT} menit).`
      );
    }
  } catch (err) {
    console.error("[auto-expire] gagal:", err.message);
  }
}

module.exports = jalankanAutoExpireBooking;