// Aturan nomor HP yang dipakai bersama oleh e-Order dan booking meja

// Buang semua karakter selain angka, maksimal 15 digit
export const bersihkanTelepon = (nilai) =>
  String(nilai ?? "").replace(/\D/g, "").slice(0, 15);

// Valid kalau 9 sampai 15 angka
export const teleponValid = (nilai) => /^\d{9,15}$/.test(String(nilai ?? ""));