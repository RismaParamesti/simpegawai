-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 14, 2026 at 09:13 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `apk_pegawai2`
--

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `level` enum('staff','manager','commissioner','director','supervisor') DEFAULT 'staff',
  `base_salary` decimal(15,2) NOT NULL DEFAULT 0.00,
  `position_allowance` decimal(10,2) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `department_id`, `name`, `level`, `base_salary`, `position_allowance`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 'Commissioner', 'commissioner', 18000000.00, NULL, 'active', '2026-01-12 04:17:03', '2026-03-07 14:48:25'),
(2, 5, 'Director', 'director', 15000000.00, 4000000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:46:57'),
(3, 1, 'Operations Manager', 'manager', 10000000.00, 2500000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:51:57'),
(4, 1, 'Operations Supervisor', 'supervisor', 8000000.00, 1500000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:37:56'),
(5, 1, 'Project Manager', 'staff', 7000000.00, 1200000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:52:50'),
(6, 1, 'Mentor', 'staff', 5000000.00, 750000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:52:41'),
(7, 2, 'Marketing & Sales Manager', 'manager', 9000000.00, 2200000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:51:43'),
(8, 2, 'Business Development', 'staff', 6000000.00, 900000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:52:17'),
(9, 2, 'Marketing Leader', 'supervisor', 7000000.00, 1400000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:37:46'),
(10, 3, 'Finance, Accounting & Tax Manager', 'manager', 9000000.00, 2200000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:51:05'),
(11, 3, 'Finance Team', 'staff', 6000000.00, 900000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:52:25'),
(12, 4, 'HR & GA Manager', 'manager', 8500000.00, 2000000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:51:14'),
(13, 4, 'General Affair', 'staff', 5500000.00, 800000.00, 'active', '2026-01-12 04:17:03', '2026-05-01 14:52:32');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_position_department` (`department_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `fk_position_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
