# Warkopolo

Sistem e-order dan manajemen restoran full-stack, lanjutan dari proyek ORDHE.
Terdiri dari aplikasi pelanggan, aplikasi kasir, dan REST API dengan database MySQL.

## Fitur

**Aplikasi pelanggan (customer-app)**
- Menu dan kategori yang diambil dari database, diperbarui otomatis tiap 5 detik
- e-Order: pilih menu, pilih meja di denah, lalu bayar
- Booking meja: pilih tanggal, jam (jam genap atau jam bebas), jumlah tamu, dan meja di denah
- Meja yang sudah dipesan atau terisi tidak bisa dipilih

**Aplikasi kasir (kasir-app)**
- Pesanan aktif dengan alur status: pending, diproses, disajikan, selesai
- Kelola menu (tambah, ubah, hapus)
- Tab Booking: daftar booking aktif dengan tombol "Customer datang" dan "Batalkan"
- Bagian "Tamu di Meja": tombol "Customer selesai" dan hitungan mundur otomatis kosong

**Otomatisasi di backend**
- Booking no-show dibatalkan otomatis jika lewat 15 menit dan meja masih kosong
- Pesanan yang sudah disajikan diselesaikan otomatis setelah 60 menit, meja jadi kosong
- Tamu booking yang sudah datang dikosongkan otomatis setelah 60 menit
- Pengecekan bentrok booking: satu booking menahan meja selama 2 jam
- Zona waktu WIB (+07:00) diatur di level koneksi database

## Tech Stack

- Frontend: React (Vite)
- Backend: Express.js (Node.js), mysql2
- Database: MySQL (dikembangkan dengan Aiven Cloud)

## Struktur Proyek

- `customer-app/` - aplikasi untuk pelanggan
- `kasir-app/` - dashboard untuk kasir
- `backend/` - REST API
- `database/` - skema database (`schema.sql`)
- `docs/screenshots/` - tangkapan layar aplikasi

## Cara Menjalankan

1. Siapkan database MySQL (lokal atau cloud), buat database kosong, lalu impor `database/schema.sql`.
2. Di folder `backend`, salin `.env.example` menjadi `.env`, lalu isi `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`. Isi `DB_SSL=true` untuk database cloud yang mewajibkan SSL.
3. Jalankan backend:
```
   cd backend
   npm install
   npm run dev
```
4. Jalankan aplikasi pelanggan