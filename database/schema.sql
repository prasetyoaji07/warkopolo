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
);

CREATE TABLE `tables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_meja` varchar(50) NOT NULL,
  `status` enum('kosong','terisi') NOT NULL DEFAULT 'kosong',
  `terisi_sejak` datetime DEFAULT NULL,
  `tamu` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

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
);

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
);

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
);

INSERT INTO `tables` (`nama_meja`) VALUES
  ('Meja 1'), ('Meja 2'), ('Meja 3'), ('Meja 4'), ('Meja 5'),
  ('Meja 6'), ('Meja 7'), ('Meja 8'), ('Meja 9'), ('Meja 10');