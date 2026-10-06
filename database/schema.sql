-- Warkopolo: skema database (MySQL 8)
--
-- Cara pakai: buat database kosong, pilih database itu, lalu jalankan file ini.
--
-- Catatan zona waktu: backend mengatur time_zone sesi ke '+07:00' (WIB) lewat
-- pool.on("connection") di backend/src/db.js. Kolom TIMESTAMP (created_at,
-- disajikan_at) disimpan dalam UTC, dan backend yang menampilkannya dalam WIB.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `tables`;
DROP TABLE IF EXISTS `products`;

SET FOREIGN_KEY_CHECKS = 1;

-- Menu, dikelola dari kasir app
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `harga` int NOT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rating` decimal(2,1) DEFAULT '5.0',
  `reviews` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Meja. terisi_sejak dan tamu hanya terisi untuk tamu booking yang datang.
CREATE TABLE `tables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_meja` varchar(50) NOT NULL,
  `status` enum('kosong','terisi') NOT NULL DEFAULT 'kosong',
  `terisi_sejak` datetime DEFAULT NULL,
  `tamu` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pesanan, mendukung 3 tipe: dine, pickup, delivery.
-- meja_id wajib untuk dine, NULL untuk pickup/delivery.
-- Alur status per tipe:
--   dine     : pending -> diproses -> disajikan -> selesai
--   pickup   : pending -> diproses -> siap diambil -> diambil
--   delivery : pending -> diproses -> dikirim -> selesai
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meja_id` int DEFAULT NULL,
  `status` enum('pending','diproses','disajikan','selesai','siap diambil','diambil','dikirim') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disajikan_at` timestamp NULL DEFAULT NULL,
  `tipe_pesanan` enum('dine','pickup','delivery') NOT NULL DEFAULT 'dine',
  `nama_pelanggan` varchar(100) DEFAULT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `alamat` varchar(255) DEFAULT NULL,
  `lat` decimal(10,8) DEFAULT NULL,
  `lng` decimal(11,8) DEFAULT NULL,
  `nomor_antrean` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `meja_id` (`meja_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`meja_id`) REFERENCES `tables` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Item pesanan. nama dan harga disalin saat checkout; product_id sengaja
-- tanpa foreign key supaya riwayat tetap utuh walau menu dihapus.
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `harga` int NOT NULL,
  `qty` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Booking meja. Satu booking menahan meja 2 jam dari jam booking.
CREATE TABLE `bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `meja_id` int NOT NULL,
  `nama` varchar(100) NOT NULL,
  `no_hp` varchar(20) NOT NULL,
  `jumlah_orang` int NOT NULL,
  `tanggal` date NOT NULL,
  `jam` time NOT NULL,
  `status` enum('aktif','dibatalkan','selesai') NOT NULL DEFAULT 'aktif',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `meja_id` (`meja_id`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`meja_id`) REFERENCES `tables` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Data awal: 10 meja
INSERT INTO `tables` (`id`, `nama_meja`, `status`) VALUES
(1, 'Meja 1', 'kosong'),
(2, 'Meja 2', 'kosong'),
(3, 'Meja 3', 'kosong'),
(4, 'Meja 4', 'kosong'),
(5, 'Meja 5', 'kosong'),
(6, 'Meja 6', 'kosong'),
(7, 'Meja 7', 'kosong'),
(8, 'Meja 8', 'kosong'),
(9, 'Meja 9', 'kosong'),
(10, 'Meja 10', 'kosong');

-- Data awal: menu contoh (rating dan reviews memakai nilai bawaan)
INSERT INTO `products` (`id`, `nama`, `harga`, `kategori`, `gambar`) VALUES
(1, 'Mie Aceh', 29000, 'food', 'mie_aceh.png'),
(2, 'Cheeseburger', 45000, 'food', 'cheeseburger.jpg'),
(3, 'Nasi Goreng', 32000, 'food', 'nasi_goreng.jpg'),
(4, 'Loaded Fries', 35000, 'snack', 'loaded_fries.jpg'),
(5, 'Caramel Latte', 30000, 'coffee', 'caramel_latte.jpg'),
(6, 'Es Kopi Susu', 25000, 'coffee', 'es_kopi_susu.jpg'),
(7, 'Blue Lagoon', 45000, 'cocktail', 'blue_lagoon.jpg'),
(8, 'Chocolate Cake', 32000, 'dessert', 'chocolate_cake.jpg');