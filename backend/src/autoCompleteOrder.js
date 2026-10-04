const db = require("./db");

// Order Dine-In berstatus 'disajikan' otomatis selesai setelah DURASI_MENIT
// sejak disajikan (disajikan_at). Order lama yang disajikan_at-nya NULL memakai
// created_at sebagai cadangan. Meja ikut dikosongkan. Status lain tidak disentuh.
const DURASI_MENIT = 60;

async function jalankanAutoCompleteOrder() {
  try {
    const [hasil] = await db.query(
      `UPDATE orders o
       JOIN \`tables\` t ON t.id = o.meja_id
       SET o.status = 'selesai',
           t.status = 'kosong',
           t.terisi_sejak = NULL,
           t.tamu = NULL
       WHERE o.status = 'disajikan'
         AND COALESCE(o.disajikan_at, o.created_at) < (NOW() - INTERVAL ? MINUTE)`,
      [DURASI_MENIT]
    );
    if (hasil.affectedRows > 0) {
      console.log(
        `[auto-complete] ${hasil.affectedRows} baris diperbarui (order disajikan > ${DURASI_MENIT} menit diselesaikan, meja dikosongkan).`
      );
    }
  } catch (err) {
    console.error("[auto-complete] gagal:", err.message);
  }
}

module.exports = jalankanAutoCompleteOrder;