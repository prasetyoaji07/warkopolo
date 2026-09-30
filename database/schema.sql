-- phpMyAdmin SQL Dump
-- Warkopolo Database Schema

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for table `orders`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `meja_id` int(11) NOT NULL,
  `status` enum('pending','diproses','selesai') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `meja_id` (`meja_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------
-- Table structure for table `order_items`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `order_items`;

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `harga` int(11) NOT NULL,
  `qty` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `harga` int(11) NOT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `rating` decimal(2,1) DEFAULT '5.0',
  `reviews` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------
-- Dumping data for table `products`
-- --------------------------------------------------------

INSERT INTO `products`
(`id`, `nama`, `harga`, `kategori`, `gambar`, `created_at`, `rating`, `reviews`)
VALUES
(1, 'Mie Aceh', 29000, 'food', 'mie_aceh.png', '2026-09-30 07:16:36', '5.0', 47),
(2, 'Cheeseburger', 45000, 'food', 'cheeseburger.jpg', '2026-09-30 07:16:36', '5.0', 52),
(3, 'Nasi Goreng', 32000, 'food', 'nasi_goreng.jpg', '2026-09-30 07:16:36', '4.0', 39),
(4, 'Loaded Fries', 35000, 'snack', 'loaded_fries.jpg', '2026-09-30 07:16:36', '5.0', 58),
(5, 'Caramel Latte', 30000, 'coffee', 'caramel_latte.jpg', '2026-09-30 07:16:36', '5.0', 61),
(6, 'Es Kopi Susu', 25000, 'coffee', 'es_kopi_susu.jpg', '2026-09-30 07:16:36', '5.0', 80),
(7, 'Blue Lagoon', 45000, 'cocktail', 'blue_lagoon.jpg', '2026-09-30 07:16:36', '5.0', 47),
(8, 'Chocolate Cake', 32000, 'dessert', 'chocolate_cake.jpg', '2026-09-30 07:16:36', '5.0', 49);

-- --------------------------------------------------------
-- Table structure for table `tables`
-- --------------------------------------------------------

DROP TABLE IF EXISTS `tables`;

CREATE TABLE `tables` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_meja` varchar(50) NOT NULL,
  `status` enum('kosong','terisi') NOT NULL DEFAULT 'kosong',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------
-- Dumping data for table `tables`
-- --------------------------------------------------------

INSERT INTO `tables`
(`id`, `nama_meja`, `status`)
VALUES
(1, 'Meja 1', 'kosong'),
(2, 'Meja 2', 'kosong'),
(3, 'Meja 3', 'kosong'),
(4, 'Meja 4', 'kosong'),
(5, 'Meja 5', 'kosong'),
(6, 'Meja 6', 'kosong');

-- --------------------------------------------------------
-- Constraints for table `orders`
-- --------------------------------------------------------

ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1`
  FOREIGN KEY (`meja_id`) REFERENCES `tables` (`id`);

-- --------------------------------------------------------
-- Constraints for table `order_items`
-- --------------------------------------------------------

ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1`
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
  ON DELETE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
