-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 20 Agu 2026 pada 12.15
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `apk_pegawai3`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL,
  `action` varchar(100) NOT NULL,
  `module` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(50) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'success',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `username`, `role`, `action`, `module`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent`, `status`, `error_message`, `created_at`, `updated_at`) VALUES
(1, 13, 'user6', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 10:30:54', '2026-06-15 10:30:54'),
(2, 13, 'Hanim', 'unknown', 'LOGIN', 'auth', 'Failed login attempt - invalid password', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'failed', 'Invalid password', '2026-06-15 10:40:55', '2026-06-15 10:40:55'),
(3, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 10:41:04', '2026-06-15 10:41:04'),
(4, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 10:43:27', '2026-06-15 10:43:27'),
(5, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: Izzah (izzah)', NULL, '{\"username\":\"izzah\",\"email\":\"izzah@gmail.com\",\"full_name\":\"Izzah\",\"position_id\":12,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\",\"atasan\",\"hr\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:01:55', '2026-06-15 11:01:55'),
(6, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 19', NULL, '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:01:55', '2026-06-15 11:01:55'),
(7, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: Risma Paramesti (risma)', NULL, '{\"username\":\"risma\",\"email\":\"rismaparamesti98@gmail.com\",\"full_name\":\"Risma Paramesti\",\"position_id\":10,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\",\"finance\",\"atasan\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:07:12', '2026-06-15 11:07:12'),
(8, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 20', NULL, '{}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:07:12', '2026-06-15 11:07:12'),
(9, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: Shafira (shafira)', NULL, '{\"username\":\"shafira\",\"email\":\"rrachmashafira@gmail.com\",\"full_name\":\"Shafira\",\"position_id\":3,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\",\"atasan\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:10:22', '2026-06-15 11:10:22'),
(10, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: Ratih (ratih)', NULL, '{\"username\":\"ratih\",\"email\":\"ratih@gmail.com\",\"full_name\":\"Ratih\",\"position_id\":6,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:15:51', '2026-06-15 11:15:51'),
(11, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 13', NULL, '{\"full_name\":\"Hanim Rachma\",\"gender\":\"female\",\"birth_place\":\"Nganjuk\",\"date_of_birth\":\"2002-02-18\",\"marital_status\":\"single\",\"nationality\":\"Indonesian\",\"address\":\"UPN \\\"VETERAN\\\" JATIM\",\"position_id\":2,\"join_date\":\"2025-05-04\",\"basic_salary\":15000000,\"employment_status\":\"permanent\",\"phone\":\"091803912838\",\"email\":\"hanimrachma@gmail.com\",\"nik\":\"9012890481404890\",\"npwp\":\"9218041809481098\",\"bank_account\":\"928490284\",\"account_holder_name\":\"Hanim Rachma\",\"bank_name\":\"BNI\",\"bpjs_number\":\"2019840928190\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:18:34', '2026-06-15 11:18:34'),
(12, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 13', NULL, '{\"name\":\"Hanim Rachma\",\"email\":\"hanimrachma@gmail.com\",\"username\":\"Hanim\",\"phone\":\"091803912838\",\"status\":\"active\",\"roles\":[\"pegawai\",\"admin\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:18:34', '2026-06-15 11:18:34'),
(13, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: Fina (fina)', NULL, '{\"username\":\"fina\",\"email\":\"fina@gmail.com\",\"full_name\":\"Fina\",\"position_id\":5,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:22:53', '2026-06-15 11:22:53'),
(14, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 23', NULL, '{\"full_name\":\"Fina\",\"gender\":\"female\",\"birth_place\":\"Surabaya\",\"date_of_birth\":\"2000-01-09\",\"marital_status\":\"single\",\"nationality\":\"Indonesian\",\"address\":\"UPN \\\"VETERAN\\\" JATIM\",\"position_id\":5,\"join_date\":\"2026-06-15\",\"basic_salary\":7000000,\"employment_status\":\"permanent\",\"phone\":\"9089280948\",\"email\":\"fina@gmail.com\",\"nik\":\"2190830183091849\",\"npwp\":\"0918983091893108\",\"bank_account\":\"210983091\",\"account_holder_name\":\"Fina\",\"bank_name\":\"BNI\",\"bpjs_number\":\"820414749017\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:23:16', '2026-06-15 11:23:16'),
(15, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 31', NULL, '{\"name\":\"Fina\",\"email\":\"fina@gmail.com\",\"username\":\"fina\",\"phone\":\"9089280948\",\"status\":\"active\",\"roles\":[\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:23:16', '2026-06-15 11:23:16'),
(16, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 23', NULL, '{\"full_name\":\"Fina\",\"gender\":\"female\",\"birth_place\":\"Surabaya\",\"date_of_birth\":\"2000-01-08\",\"marital_status\":\"single\",\"nationality\":\"Indonesian\",\"address\":\"UPN \\\"VETERAN\\\" JATIM\",\"position_id\":5,\"join_date\":\"2026-06-17\",\"basic_salary\":7000000,\"employment_status\":\"permanent\",\"phone\":\"9089280948\",\"email\":\"fina@gmail.com\",\"nik\":\"2190830183091849\",\"npwp\":\"0918983091893108\",\"bank_account\":\"210983091\",\"account_holder_name\":\"Fina\",\"bank_name\":\"BNI\",\"bpjs_number\":\"820414749017\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:23:45', '2026-06-15 11:23:45'),
(17, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 31', NULL, '{\"name\":\"Fina\",\"email\":\"fina@gmail.com\",\"username\":\"fina\",\"phone\":\"9089280948\",\"status\":\"active\",\"roles\":[\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:23:45', '2026-06-15 11:23:45'),
(18, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 23', NULL, '{\"full_name\":\"Fina\",\"gender\":\"female\",\"birth_place\":\"Surabaya\",\"date_of_birth\":\"2000-01-07\",\"marital_status\":\"single\",\"nationality\":\"Indonesian\",\"address\":\"UPN \\\"VETERAN\\\" JATIM\",\"position_id\":5,\"join_date\":\"2026-06-15\",\"basic_salary\":7000000,\"employment_status\":\"permanent\",\"phone\":\"9089280948\",\"email\":\"fina@gmail.com\",\"nik\":\"2190830183091849\",\"npwp\":\"0918983091893108\",\"bank_account\":\"210983091\",\"account_holder_name\":\"Fina\",\"bank_name\":\"BNI\",\"bpjs_number\":\"820414749017\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:27:21', '2026-06-15 11:27:21'),
(19, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 31', NULL, '{\"name\":\"Fina\",\"email\":\"fina@gmail.com\",\"username\":\"fina\",\"phone\":\"9089280948\",\"status\":\"active\",\"roles\":[\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:27:21', '2026-06-15 11:27:21'),
(20, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 13', NULL, '{\"full_name\":\"Hanim Rachma\",\"gender\":\"female\",\"birth_place\":\"Nganjuk\",\"date_of_birth\":\"2002-02-18\",\"marital_status\":\"single\",\"nationality\":\"Indonesian\",\"address\":\"UPN \\\"VETERAN\\\" JATIM\",\"position_id\":2,\"join_date\":\"2025-05-05\",\"basic_salary\":15000000,\"employment_status\":\"permanent\",\"phone\":\"091803912838\",\"email\":\"hanimrachma@gmail.com\",\"nik\":\"9012890481404890\",\"npwp\":\"9218041809481098\",\"bank_account\":\"928490284\",\"account_holder_name\":\"Hanim Rachma\",\"bank_name\":\"BNI\",\"bpjs_number\":\"2019840928190\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:28:46', '2026-06-15 11:28:46'),
(21, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 13', NULL, '{\"name\":\"Hanim Rachma\",\"email\":\"hanimrachma@gmail.com\",\"username\":\"Hanim\",\"phone\":\"091803912838\",\"status\":\"active\",\"roles\":[\"pegawai\",\"admin\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:28:46', '2026-06-15 11:28:46'),
(22, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:29:44', '2026-06-15 11:29:44'),
(23, 27, 'izzah', 'unknown', 'LOGIN', 'auth', 'Failed login attempt - invalid password', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'failed', 'Invalid password', '2026-06-15 11:30:10', '2026-06-15 11:30:10'),
(24, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:30:12', '2026-06-15 11:30:12'),
(25, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:30:23', '2026-06-15 11:30:23'),
(26, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 31', NULL, '{\"status\":\"active\",\"roles\":[\"atasan\",\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:33:20', '2026-06-15 11:33:20'),
(27, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 23', NULL, '{\"position_id\":5}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:33:20', '2026-06-15 11:33:20'),
(28, 31, 'fina', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:33:28', '2026-06-15 11:33:28'),
(29, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:33:44', '2026-06-15 11:33:44'),
(30, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 31', NULL, '{\"status\":\"active\",\"roles\":[\"hr\",\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:33:58', '2026-06-15 11:33:58'),
(31, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 23', NULL, '{\"position_id\":5}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:33:58', '2026-06-15 11:33:58'),
(32, 31, 'fina', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:35:22', '2026-06-15 11:35:22'),
(33, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:36:19', '2026-06-15 11:36:19'),
(34, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 31', NULL, '{\"status\":\"active\",\"roles\":[\"pegawai\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:36:35', '2026-06-15 11:36:35'),
(35, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 23', NULL, '{\"position_id\":5}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-15 11:36:35', '2026-06-15 11:36:35'),
(36, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:10:58', '2026-06-15 12:10:58'),
(37, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 13', NULL, '{\"status\":\"active\",\"roles\":[\"atasan\",\"pegawai\",\"admin\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:11:40', '2026-06-15 12:11:40'),
(38, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 13', NULL, '{\"position_id\":2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:11:40', '2026-06-15 12:11:40'),
(39, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 13', NULL, '{\"status\":\"active\",\"roles\":[\"atasan\",\"pegawai\",\"admin\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:11:52', '2026-06-15 12:11:52'),
(40, 13, 'Hanim', 'admin', 'UPDATE', 'employees', 'Updated employee data for ID: 13', NULL, '{\"position_id\":2}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:11:52', '2026-06-15 12:11:52'),
(41, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:12:31', '2026-06-15 12:12:31'),
(42, 27, 'izzah', 'hr', 'CREATE', 'job_openings', 'Created job opening: Project Manager', NULL, '{\"id\":1,\"position_id\":\"5\",\"title\":\"Project Manager\",\"quota\":\"1\",\"status\":\"draft\",\"deadline\":\"2026-06-25\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:33:03', '2026-06-15 12:33:03'),
(43, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-24T17:00:00.000Z\",\"status\":\"draft\",\"hiring_status\":\"ongoing\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:33:03.000Z\",\"deleted_at\":null}', '{\"position_id\":5,\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}],\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":3000000,\"salary_range_max\":5000000,\"location\":\"Surabaya\",\"deadline\":\"2026-06-24T17:00:00.000Z\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"id\":1,\"base_position\":\"Fullstack Web Developer\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0,\"base_salary\":\"7000000.00\",\"department_description\":null,\"developer_specialization\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:37:59', '2026-06-15 12:37:59'),
(44, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-23T17:00:00.000Z\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:37:59.000Z\",\"deleted_at\":null}', '{\"position_id\":5,\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}],\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":3000000,\"salary_range_max\":5000000,\"location\":\"Surabaya\",\"deadline\":\"2026-06-23T17:00:00.000Z\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"id\":1,\"base_position\":\"Fullstack Web Developer\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0,\"base_salary\":\"7000000.00\",\"department_description\":null,\"developer_specialization\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:38:38', '2026-06-15 12:38:38'),
(45, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-22T17:00:00.000Z\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:38:38.000Z\",\"deleted_at\":null}', '{\"position_id\":5,\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}],\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":3000000,\"salary_range_max\":5000000,\"location\":\"Surabaya\",\"deadline\":\"2026-06-25\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"id\":1,\"base_position\":\"Fullstack Web Developer\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0,\"base_salary\":\"7000000.00\",\"department_description\":null,\"developer_specialization\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:38:57', '2026-06-15 12:38:57'),
(46, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-24T17:00:00.000Z\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:38:57.000Z\",\"deleted_at\":null}', '{\"position_id\":5,\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}],\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":3000000,\"salary_range_max\":5000000,\"location\":\"Surabaya\",\"deadline\":\"2026-06-24T17:00:00.000Z\",\"status\":\"closed\",\"hiring_status\":\"ongoing\",\"id\":1,\"base_position\":\"Fullstack Web Developer\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0,\"base_salary\":\"7000000.00\",\"department_description\":null,\"developer_specialization\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:39:30', '2026-06-15 12:39:30'),
(47, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-23T17:00:00.000Z\",\"status\":\"closed\",\"hiring_status\":\"ongoing\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:39:30.000Z\",\"deleted_at\":null}', '{\"position_id\":5,\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}],\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":3000000,\"salary_range_max\":5000000,\"location\":\"Surabaya\",\"deadline\":\"2026-06-23T17:00:00.000Z\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"id\":1,\"base_position\":\"Fullstack Web Developer\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0,\"base_salary\":\"7000000.00\",\"department_description\":null,\"developer_specialization\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:39:41', '2026-06-15 12:39:41'),
(48, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-22T17:00:00.000Z\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:39:41.000Z\",\"deleted_at\":null}', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-22T17:00:00.000Z\",\"status\":\"closed\",\"hiring_status\":\"shortlisting\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:39:47', '2026-06-15 12:39:47'),
(49, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-21T17:00:00.000Z\",\"status\":\"closed\",\"hiring_status\":\"shortlisting\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:39:47.000Z\",\"deleted_at\":null}', '{\"position_id\":5,\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}],\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":3000000,\"salary_range_max\":5000000,\"location\":\"Surabaya\",\"deadline\":\"2026-06-25\",\"status\":\"closed\",\"hiring_status\":\"shortlisting\",\"id\":1,\"base_position\":\"Fullstack Web Developer\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0,\"base_salary\":\"7000000.00\",\"department_description\":null,\"developer_specialization\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:40:00', '2026-06-15 12:40:00'),
(50, 27, 'izzah', 'hr', 'UPDATE', 'job_openings', 'Updated job opening ID: 1', '{\"id\":1,\"position_id\":5,\"base_position\":\"Fullstack Web Developer\",\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"40\\\"},{\\\"criterion\\\":\\\"kesopanan\\\",\\\"score\\\":\\\"30\\\"}]\",\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":\"3000000.00\",\"salary_range_max\":\"5000000.00\",\"location\":\"Surabaya\",\"deadline\":\"2026-06-24T17:00:00.000Z\",\"status\":\"closed\",\"hiring_status\":\"shortlisting\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"updated_at\":\"2026-06-15T12:40:00.000Z\",\"deleted_at\":null}', '{\"position_id\":5,\"title\":\"Project Manager\",\"description\":\"Bekerja pada posisi fullstack web developer\",\"requirements\":\"Dapat mengoperasikan visual studio code\",\"assessment_criteria\":[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}],\"responsibilities\":\"Mengelola projek yang ditugaskan untuk membangun website\",\"quota\":1,\"employment_type\":\"permanent\",\"salary_range_min\":3000000,\"salary_range_max\":5000000,\"location\":\"Surabaya\",\"deadline\":\"2026-06-25\",\"status\":\"open\",\"hiring_status\":\"ongoing\",\"id\":1,\"base_position\":\"Fullstack Web Developer\",\"created_by\":19,\"created_at\":\"2026-06-15T12:33:03.000Z\",\"position_name\":\"Project Manager\",\"level\":\"staff\",\"department_name\":\"Operations\",\"applications_count\":0,\"base_salary\":\"7000000.00\",\"department_description\":null,\"developer_specialization\":\"\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:40:22', '2026-06-15 12:40:22'),
(51, 32, 'surya', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 12:50:04', '2026-06-15 12:50:04'),
(52, 35, 'bayu', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-15 13:19:17', '2026-06-15 13:19:17'),
(53, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 02:55:42', '2026-06-17 02:55:42'),
(54, 13, 'admin', 'admin', 'UPDATE', 'users', 'Updated user ID: 13', NULL, '{\"status\":\"active\",\"roles\":[\"admin\",\"pegawai\",\"atasan\"]}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 02:57:14', '2026-06-17 02:57:14'),
(55, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 02:57:28', '2026-06-17 02:57:28'),
(56, 13, 'Hanim', 'admin', 'CREATE', 'attendance', 'Check-in', NULL, '{\"date\":\"2026-06-17\",\"check_in\":\"09:58:16\",\"employee_id\":13}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 02:58:16', '2026-06-17 02:58:16'),
(57, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 03:00:52', '2026-06-17 03:00:52'),
(58, 27, 'izzah', 'hr', 'CREATE', 'attendance', 'Check-in', NULL, '{\"date\":\"2026-06-17\",\"check_in\":\"10:01:39\",\"employee_id\":19}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 03:01:39', '2026-06-17 03:01:39'),
(59, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 03:07:24', '2026-06-17 03:07:24'),
(60, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 03:54:06', '2026-06-17 03:54:06'),
(61, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 04:29:25', '2026-06-17 04:29:25'),
(62, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 04:49:58', '2026-06-17 04:49:58'),
(63, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 04:58:18', '2026-06-17 04:58:18'),
(64, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 04:59:21', '2026-06-17 04:59:21'),
(65, 30, 'ratih', 'unknown', 'LOGIN', 'auth', 'Failed login attempt - invalid password', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'failed', 'Invalid password', '2026-06-17 05:04:29', '2026-06-17 05:04:29'),
(66, 30, 'ratih', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:04:36', '2026-06-17 05:04:36'),
(67, 30, 'ratih', 'pegawai', 'UPDATE', 'attendance', 'Check-in (update)', '{\"id\":1791,\"employee_id\":22,\"date\":\"2026-06-17\",\"check_in\":null,\"check_out\":null,\"status\":null,\"is_late\":null,\"late_minutes\":null,\"working_hours\":null,\"overtime_hours\":\"0.00\",\"notes\":\"Backfill hadir\",\"leave_request_id\":null,\"created_at\":\"2026-06-17 10:52:14\",\"updated_at\":\"2026-06-17 12:09:43\"}', '{\"date\":\"2026-06-17\",\"check_in\":\"12:09:54\",\"employee_id\":22}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:09:54', '2026-06-17 05:09:54'),
(68, 31, 'fina', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:12:40', '2026-06-17 05:12:40'),
(69, 31, 'fina', 'pegawai', 'CREATE', 'reimbursements', 'Reimbursement submitted', NULL, '{\"request_id\":1,\"employee_id\":23,\"reimbursement_type\":\"transport\",\"amount\":\"200000\",\"description\":\"dinas luar kota\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:47:06', '2026-06-17 05:47:06'),
(70, 31, 'fina', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:47:37', '2026-06-17 05:47:37'),
(71, 30, 'ratih', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:48:20', '2026-06-17 05:48:20'),
(72, 30, 'ratih', 'pegawai', 'CREATE', 'reimbursements', 'Reimbursement submitted', NULL, '{\"request_id\":2,\"employee_id\":22,\"reimbursement_type\":\"operasional\",\"amount\":\"150000\",\"description\":\"map klien\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:50:04', '2026-06-17 05:50:04'),
(73, 29, 'shafira', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:51:31', '2026-06-17 05:51:31'),
(74, 29, 'shafira', 'pegawai', 'UPDATE', 'reimbursements', 'Reimbursement approved by manager', '{\"status\":\"pending\",\"submitter_user_id\":30}', '{\"request_id\":\"2\",\"status\":\"approved\",\"approved_by\":21}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:52:56', '2026-06-17 05:52:56'),
(75, 30, 'ratih', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:53:28', '2026-06-17 05:53:28'),
(76, 30, 'ratih', 'pegawai', 'CREATE', 'leave_requests', 'Leave request submitted', NULL, '{\"request_id\":1,\"employee_id\":22,\"leave_type\":\"izin_pribadi\",\"start_date\":\"2026-06-25\",\"end_date\":\"2026-06-25\",\"total_days\":1,\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:54:23', '2026-06-17 05:54:23'),
(77, 30, 'ratih', 'pegawai', 'CREATE', 'leave_requests', 'Leave request submitted', NULL, '{\"request_id\":2,\"employee_id\":22,\"leave_type\":\"cuti_tahunan\",\"start_date\":\"2026-06-29\",\"end_date\":\"2026-06-29\",\"total_days\":1,\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:55:03', '2026-06-17 05:55:03'),
(78, 30, 'ratih', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:55:42', '2026-06-17 05:55:42'),
(79, 29, 'shafira', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:55:54', '2026-06-17 05:55:54'),
(80, 29, 'shafira', 'pegawai', 'UPDATE', 'leave_requests', 'Leave request approved', '{\"id\":2,\"employee_id\":22,\"leave_type\":\"cuti_tahunan\",\"start_date\":\"2026-06-29\",\"end_date\":\"2026-06-29\",\"total_days\":1,\"time\":null,\"cuti_khusus_option\":null,\"reason\":\"cuti\",\"bukti\":null,\"status\":\"pending\",\"approved_by\":null,\"approved_at\":null,\"created_at\":\"2026-06-17 12:55:03\",\"updated_at\":\"2026-06-17 12:55:03\"}', '{\"request_id\":\"2\",\"status\":\"approved\",\"approved_by\":21}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:56:14', '2026-06-17 05:56:14'),
(81, 30, 'ratih', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:56:26', '2026-06-17 05:56:26'),
(82, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 05:57:00', '2026-06-17 05:57:00'),
(83, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:01:24', '2026-06-17 06:01:24'),
(84, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:02:07', '2026-06-17 06:02:07'),
(85, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 21, Period: 1/2026', NULL, '{\"employee_id\":21,\"period_month\":1,\"period_year\":2026,\"net_salary\":14075000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:03:18', '2026-06-17 06:03:18'),
(86, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 22, Period: 1/2026', NULL, '{\"employee_id\":22,\"period_month\":1,\"period_year\":2026,\"net_salary\":7475000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:03:50', '2026-06-17 06:03:50'),
(87, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 20, Period: 1/2026', NULL, '{\"employee_id\":20,\"period_month\":1,\"period_year\":2026,\"net_salary\":12805000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:04:04', '2026-06-17 06:04:04'),
(88, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 19, Period: 1/2026', NULL, '{\"employee_id\":19,\"period_month\":1,\"period_year\":2026,\"net_salary\":12120000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:04:13', '2026-06-17 06:04:13'),
(89, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 13, Period: 1/2026', NULL, '{\"employee_id\":13,\"period_month\":1,\"period_year\":2026,\"net_salary\":20425000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:04:21', '2026-06-17 06:04:21'),
(90, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 13, Period: 2/2026', NULL, '{\"employee_id\":13,\"period_month\":2,\"period_year\":2026,\"net_salary\":20275000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:04:43', '2026-06-17 06:04:43'),
(91, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 19, Period: 2/2026', NULL, '{\"employee_id\":19,\"period_month\":2,\"period_year\":2026,\"net_salary\":11970000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:04:51', '2026-06-17 06:04:51'),
(92, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 20, Period: 2/2026', NULL, '{\"employee_id\":20,\"period_month\":2,\"period_year\":2026,\"net_salary\":12655000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:04:58', '2026-06-17 06:04:58'),
(93, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 21, Period: 2/2026', NULL, '{\"employee_id\":21,\"period_month\":2,\"period_year\":2026,\"net_salary\":13925000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:05:07', '2026-06-17 06:05:07'),
(94, 28, 'risma', 'finance', 'CREATE', 'payroll', 'Generated payroll for employee ID: 22, Period: 2/2026', NULL, '{\"employee_id\":22,\"period_month\":2,\"period_year\":2026,\"net_salary\":7325000,\"status\":\"created\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:05:14', '2026-06-17 06:05:14'),
(95, 28, 'risma', 'finance', 'CREATE', 'salary_appeals', 'Submitted salary appeal for payroll_id 8', NULL, '{\"payroll_id\":\"8\",\"appeal_items_count\":1,\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:06:59', '2026-06-17 06:06:59'),
(96, 29, 'shafira', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:08:10', '2026-06-17 06:08:10');
INSERT INTO `activity_logs` (`id`, `user_id`, `username`, `role`, `action`, `module`, `description`, `old_values`, `new_values`, `ip_address`, `user_agent`, `status`, `error_message`, `created_at`, `updated_at`) VALUES
(97, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:08:32', '2026-06-17 06:08:32'),
(98, 27, 'izzah', 'hr', 'UPDATE', 'salary_appeals', 'Reviewed salary appeal id 1: approved', '{\"id\":1,\"status\":\"pending\"}', '{\"id\":1,\"status\":\"approved\",\"approved_items\":1,\"rejected_items\":0}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:11:14', '2026-06-17 06:11:14'),
(99, 30, 'ratih', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:11:55', '2026-06-17 06:11:55'),
(100, 30, 'ratih', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:12:13', '2026-06-17 06:12:13'),
(101, 30, 'ratih', 'pegawai', 'CREATE', 'salary_appeals', 'Submitted salary appeal for payroll_id 10', NULL, '{\"payroll_id\":\"10\",\"appeal_items_count\":1,\"status\":\"pending\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:12:43', '2026-06-17 06:12:43'),
(102, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:12:55', '2026-06-17 06:12:55'),
(103, 28, 'risma', 'finance', 'CREATE', 'salary_appeals', 'Created revised payroll for appeal id 1, payroll id 8', NULL, '{\"appeal_id\":\"1\",\"payroll_id\":8,\"final_amount\":12755000}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:14:31', '2026-06-17 06:14:31'),
(104, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:15:19', '2026-06-17 06:15:19'),
(105, 32, 'surya', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-17 06:18:09', '2026-06-17 06:18:09'),
(106, 32, 'surya', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'success', NULL, '2026-06-17 06:22:10', '2026-06-17 06:22:10'),
(107, 27, 'izzah', 'hr', 'CREATE', 'job_openings', 'Created job opening: Staff GA', NULL, '{\"id\":2,\"position_id\":\"13\",\"title\":\"Staff GA\",\"quota\":1,\"status\":\"open\",\"deadline\":\"2026-06-27\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"70\\\"}]\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:28:08', '2026-06-17 06:28:08'),
(108, 27, 'izzah', 'hr', 'CREATE', 'job_openings', 'Created job opening: Staff Project Manager ', NULL, '{\"id\":3,\"position_id\":\"5\",\"title\":\"Staff Project Manager \",\"quota\":1,\"status\":\"open\",\"deadline\":\"2026-06-30\",\"assessment_criteria\":\"[{\\\"criterion\\\":\\\"komunikasi\\\",\\\"score\\\":\\\"30\\\"},{\\\"criterion\\\":\\\"skill\\\",\\\"score\\\":\\\"70\\\"}]\"}', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:29:20', '2026-06-17 06:29:20'),
(109, 28, 'risma', 'unknown', 'LOGIN', 'auth', 'Failed login attempt - invalid password', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'failed', 'Invalid password', '2026-06-17 06:31:51', '2026-06-17 06:31:51'),
(110, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-17 06:31:55', '2026-06-17 06:31:55'),
(111, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-18 13:28:41', '2026-06-18 13:28:41'),
(112, 31, 'fina', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-18 13:29:11', '2026-06-18 13:29:11'),
(113, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'success', NULL, '2026-06-18 13:36:22', '2026-06-18 13:36:22'),
(114, 13, 'Hanim', 'unknown', 'LOGIN', 'auth', 'Failed login attempt - invalid password', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'failed', 'Invalid password', '2026-06-22 10:23:29', '2026-06-22 10:23:29'),
(115, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:23:38', '2026-06-22 10:23:38'),
(116, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: andi (andi)', NULL, '{\"username\":\"andi\",\"email\":\"andi@gmail.com\",\"full_name\":\"andi\",\"position_id\":6,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\"]}', '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:24:45', '2026-06-22 10:24:45'),
(117, 13, 'unknown', 'admin', 'LOGOUT', 'auth', 'User logged out', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:25:52', '2026-06-22 10:25:52'),
(118, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:35:59', '2026-06-22 10:35:59'),
(119, 13, 'unknown', 'admin', 'LOGOUT', 'auth', 'User logged out', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:48:19', '2026-06-22 10:48:19'),
(120, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:48:38', '2026-06-22 10:48:38'),
(121, 13, 'unknown', 'admin', 'LOGOUT', 'auth', 'User logged out', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:49:00', '2026-06-22 10:49:00'),
(122, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:51:37', '2026-06-22 10:51:37'),
(123, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: andi (andi)', NULL, '{\"username\":\"andi\",\"email\":\"andi@gmail.com\",\"full_name\":\"andi\",\"position_id\":6,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\"]}', '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:52:01', '2026-06-22 10:52:01'),
(124, 13, 'Hanim', 'admin', 'CREATE', 'auth', 'Created new staff account: andi (andi)', NULL, '{\"username\":\"andi\",\"email\":\"andi@gmail.com\",\"full_name\":\"andi\",\"position_id\":6,\"employment_status\":\"permanent\",\"roles\":[\"pegawai\"]}', '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-22 10:53:06', '2026-06-22 10:53:06'),
(125, 13, 'Hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:04:13', '2026-06-23 08:04:13'),
(126, 32, 'surya', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:15:56', '2026-06-23 08:15:56'),
(127, 29, 'shafira', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:27:00', '2026-06-23 08:27:00'),
(128, 28, 'risma', 'finance', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:28:14', '2026-06-23 08:28:14'),
(129, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:29:18', '2026-06-23 08:29:18'),
(130, 32, 'surya', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:30:49', '2026-06-23 08:30:49'),
(131, 32, 'surya', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:41:35', '2026-06-23 08:41:35'),
(132, 31, 'fina', 'pegawai', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:53:31', '2026-06-23 08:53:31'),
(133, 31, 'fina', 'pegawai', 'CREATE', 'attendance', 'Check-in', NULL, '{\"date\":\"2026-06-23\",\"check_in\":\"15:54:55\",\"employee_id\":23}', '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 08:54:55', '2026-06-23 08:54:55'),
(134, 29, 'shafira', 'pegawai', 'UPDATE', 'attendance', 'Attendance status updated to izin', '{\"id\":2506,\"employee_id\":13,\"date\":\"2026-06-22\",\"check_in\":null,\"check_out\":null,\"status\":\"alpha\",\"is_late\":0,\"late_minutes\":0,\"working_hours\":null,\"overtime_hours\":\"0.00\",\"notes\":\"Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.\",\"leave_request_id\":null,\"created_at\":\"2026-06-23 15:04:13\",\"updated_at\":\"2026-06-23 15:04:13\"}', '{\"id\":\"2506\",\"status\":\"izin\"}', '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 09:09:40', '2026-06-23 09:09:40'),
(135, 31, 'fina', 'pegawai', 'CREATE', 'leave_requests', 'Leave request submission failed', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'failed', 'Cannot destructure property \'leave_type\' of \'req.body\' as it is undefined.', '2026-06-23 09:22:46', '2026-06-23 09:22:46'),
(136, 31, 'fina', 'pegawai', 'CREATE', 'leave_requests', 'Leave request submitted', NULL, '{\"request_id\":3,\"employee_id\":23,\"leave_type\":\"izin_pribadi\",\"start_date\":\"2026-07-29\",\"end_date\":\"2026-07-29\",\"total_days\":1,\"status\":\"pending\"}', '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 09:23:07', '2026-06-23 09:23:07'),
(137, 13, 'hanim', 'unknown', 'LOGIN', 'auth', 'Failed login attempt - invalid password', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'failed', 'Invalid password', '2026-06-23 09:39:50', '2026-06-23 09:39:50'),
(138, 13, 'hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 09:39:57', '2026-06-23 09:39:57'),
(139, 13, 'unknown', 'admin', 'LOGOUT', 'auth', 'User logged out', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-23 09:40:54', '2026-06-23 09:40:54'),
(140, 13, 'hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-24 04:28:36', '2026-06-24 04:28:36'),
(141, 32, 'surya', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-25 12:47:44', '2026-06-25 12:47:44'),
(142, 33, 'teddy', 'kandidat', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-25 12:56:05', '2026-06-25 12:56:05'),
(143, 13, 'hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-29 13:26:53', '2026-06-29 13:26:53'),
(144, 13, 'hanim', 'admin', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'PostmanRuntime/7.53.0', 'success', NULL, '2026-06-29 13:53:22', '2026-06-29 13:53:22'),
(145, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success', NULL, '2026-08-20 09:51:01', '2026-08-20 09:51:01'),
(146, 27, 'izzah', 'hr', 'LOGIN', 'auth', 'Successful login', NULL, NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', 'success', NULL, '2026-08-20 09:56:20', '2026-08-20 09:56:20');

-- --------------------------------------------------------

--
-- Struktur dari tabel `allowance`
--

CREATE TABLE `allowance` (
  `id` int(11) NOT NULL,
  `payroll_id` int(11) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `period_month` int(11) NOT NULL,
  `period_year` int(11) NOT NULL,
  `bonus` decimal(12,2) NOT NULL DEFAULT 0.00,
  `other_allowance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `other_deduction` decimal(12,2) NOT NULL DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `status` enum('draft','submitted','done') NOT NULL DEFAULT 'draft',
  `submitted_by` int(11) NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `candidate_id` int(11) NOT NULL,
  `job_opening_id` int(11) NOT NULL,
  `cover_letter` longblob DEFAULT NULL,
  `cv_file` varchar(255) DEFAULT NULL,
  `portfolio_file` varchar(255) DEFAULT NULL,
  `ijazah_file` varchar(255) DEFAULT NULL,
  `transcript_file` varchar(255) DEFAULT NULL,
  `certificate_file` varchar(255) DEFAULT NULL,
  `ktp_file` varchar(255) DEFAULT NULL,
  `photo_file` varchar(255) DEFAULT NULL,
  `reference_letter_file` varchar(255) DEFAULT NULL,
  `experience_letter_file` varchar(255) DEFAULT NULL,
  `skck_file` varchar(255) DEFAULT NULL,
  `other_document` varchar(255) DEFAULT NULL,
  `github_link` varchar(255) DEFAULT NULL,
  `design_link` varchar(255) DEFAULT NULL,
  `youtube_link` varchar(255) DEFAULT NULL,
  `marketing_portfolio_link` varchar(255) DEFAULT NULL,
  `campaign_link` varchar(255) DEFAULT NULL,
  `status` enum('submitted','screening','lolos_dokumen','wawancara','diterima','ditolak','withdrawn','canceled_by_company') DEFAULT 'submitted',
  `admin_notes` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL,
  `withdrawn_at` timestamp NULL DEFAULT NULL,
  `withdraw_reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `applications`
--

INSERT INTO `applications` (`id`, `candidate_id`, `job_opening_id`, `cover_letter`, `cv_file`, `portfolio_file`, `ijazah_file`, `transcript_file`, `certificate_file`, `ktp_file`, `photo_file`, `reference_letter_file`, `experience_letter_file`, `skck_file`, `other_document`, `github_link`, `design_link`, `youtube_link`, `marketing_portfolio_link`, `campaign_link`, `status`, `admin_notes`, `submitted_at`, `reviewed_at`, `reviewed_by`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`, `withdrawn_at`, `withdraw_reason`) VALUES
(1, 1, 1, 0x75706c6f6164732f63616e6469646174655f646f63756d656e74732f73757279612f4c616d6172616e50726f6a6563746d616e616765725f313736323032362f636f7665725f6c65747465725f66696c652d313738313637373238313233332d3335373639333633342e706466, 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/cv_file-1781677281249-673649318.pdf', 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/portfolio_file-1781677281267-266065285.pdf', 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/ijazah_file-1781677281252-972741855.pdf', 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/transcript_file-1781677281238-160629145.pdf', 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/certificate_file-1781677281242-59610550.pdf', 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/ktp_file-1781677281241-682626946.jpeg', 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/photo_file-1781677281251-305995694.jpeg', NULL, 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/experience_letter_file-1781677281269-450439681.pdf', 'uploads/candidate_documents/surya/LamaranProjectmanager_1762026/skck_file-1781677281264-864537169.pdf', NULL, 'https://github.com/rrsfira/BPBD.git', NULL, NULL, NULL, NULL, 'diterima', NULL, '2026-06-17 06:21:21', '2026-06-17 06:25:21', 19, '2026-06-17 06:21:21', '2026-06-17 06:25:21', NULL, NULL, NULL, NULL),
(2, 2, 3, 0x75706c6f6164732f63616e6469646174655f646f63756d656e74732f74656464792f4c616d6172616e50726f6a6563746d616e616765725f323536323032362f636f7665725f6c65747465725f66696c652d313738323339323231343439322d3439303734303334382e706466, 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/cv_file-1782392214481-154504592.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/portfolio_file-1782392214478-824182406.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/ijazah_file-1782392214483-119637250.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/transcript_file-1782392214483-534279147.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/certificate_file-1782392214485-488853683.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/ktp_file-1782392214482-768089914.jpeg', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/photo_file-1782392214474-452637424.jpeg', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/reference_letter_file-1782392214488-733408533.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/experience_letter_file-1782392214487-406708076.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/skck_file-1782392214477-507279371.pdf', 'uploads/candidate_documents/teddy/LamaranProjectmanager_2562026/other_document-1782392214490-682146369.pdf', NULL, NULL, NULL, NULL, NULL, 'submitted', NULL, '2026-06-25 12:56:54', NULL, NULL, '2026-06-25 12:56:54', '2026-06-25 12:56:54', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `status` enum('hadir','izin','sakit','alpha','libur') DEFAULT NULL,
  `is_late` tinyint(1) DEFAULT 0,
  `late_minutes` int(11) DEFAULT 0,
  `working_hours` decimal(5,2) DEFAULT NULL,
  `overtime_hours` decimal(5,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `leave_request_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `is_late`, `late_minutes`, `working_hours`, `overtime_hours`, `notes`, `leave_request_id`, `created_at`, `updated_at`) VALUES
(6, 13, '2025-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(7, 13, '2025-06-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(8, 13, '2025-06-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(9, 13, '2025-06-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(10, 13, '2025-06-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(11, 13, '2025-06-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(12, 13, '2025-06-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(13, 13, '2025-06-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(14, 13, '2025-06-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(15, 13, '2025-06-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(16, 13, '2025-06-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(17, 13, '2025-07-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(18, 21, '2025-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(19, 21, '2025-06-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(20, 21, '2025-06-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(21, 21, '2025-06-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(22, 21, '2025-06-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(23, 21, '2025-06-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(24, 21, '2025-06-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(25, 21, '2025-06-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(26, 21, '2025-06-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(27, 21, '2025-06-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(28, 21, '2025-06-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(29, 21, '2025-07-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(42, 22, '2025-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(43, 22, '2025-06-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(44, 22, '2025-06-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(45, 22, '2025-06-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(46, 22, '2025-06-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(47, 22, '2025-06-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(48, 22, '2025-06-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(49, 22, '2025-06-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(50, 22, '2025-06-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(51, 22, '2025-06-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(52, 22, '2025-06-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(53, 22, '2025-07-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(54, 20, '2025-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(55, 20, '2025-06-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(56, 20, '2025-06-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(57, 20, '2025-06-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(58, 20, '2025-06-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(59, 20, '2025-06-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(60, 20, '2025-06-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(61, 20, '2025-06-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(62, 20, '2025-06-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(63, 20, '2025-06-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(64, 20, '2025-06-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(65, 20, '2025-07-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(66, 19, '2025-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(67, 19, '2025-06-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(68, 19, '2025-06-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(69, 19, '2025-06-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(70, 19, '2025-06-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(71, 19, '2025-06-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(72, 19, '2025-06-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(73, 19, '2025-06-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(74, 19, '2025-06-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(75, 19, '2025-06-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(76, 19, '2025-06-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(77, 19, '2025-07-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(78, 13, '2025-07-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(79, 13, '2025-07-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(80, 13, '2025-07-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(81, 13, '2025-07-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(82, 13, '2025-07-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(83, 13, '2025-07-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(84, 13, '2025-07-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(85, 13, '2025-07-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(86, 13, '2025-07-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(87, 13, '2025-07-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(88, 13, '2025-07-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(89, 13, '2025-07-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(90, 13, '2025-07-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(91, 21, '2025-07-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(92, 21, '2025-07-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(93, 21, '2025-07-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(94, 21, '2025-07-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(95, 21, '2025-07-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(96, 21, '2025-07-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(97, 21, '2025-07-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(98, 21, '2025-07-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(99, 21, '2025-07-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(100, 21, '2025-07-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(101, 21, '2025-07-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(102, 21, '2025-07-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(103, 21, '2025-07-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(112, 23, '2025-07-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(117, 22, '2025-07-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(118, 22, '2025-07-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(119, 22, '2025-07-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(120, 22, '2025-07-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(121, 22, '2025-07-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(122, 22, '2025-07-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(123, 22, '2025-07-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(124, 22, '2025-07-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(125, 22, '2025-07-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(126, 22, '2025-07-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(127, 22, '2025-07-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(128, 22, '2025-07-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(129, 22, '2025-07-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(130, 20, '2025-07-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(131, 20, '2025-07-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(132, 20, '2025-07-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(133, 20, '2025-07-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(134, 20, '2025-07-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(135, 20, '2025-07-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(136, 20, '2025-07-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(137, 20, '2025-07-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(138, 20, '2025-07-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(139, 20, '2025-07-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(140, 20, '2025-07-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(141, 20, '2025-07-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(142, 20, '2025-07-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(143, 19, '2025-07-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(144, 19, '2025-07-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(145, 19, '2025-07-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(146, 19, '2025-07-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(147, 19, '2025-07-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(148, 19, '2025-07-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(149, 19, '2025-07-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(150, 19, '2025-07-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(151, 19, '2025-07-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(152, 19, '2025-07-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(153, 19, '2025-07-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(154, 19, '2025-07-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(155, 19, '2025-07-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(156, 13, '2025-07-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(157, 13, '2025-07-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(158, 13, '2025-07-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(159, 13, '2025-07-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(160, 13, '2025-07-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(161, 13, '2025-07-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(162, 13, '2025-07-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(163, 13, '2025-07-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(164, 13, '2025-07-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(165, 13, '2025-07-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(166, 13, '2025-07-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(167, 13, '2025-07-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(168, 13, '2025-07-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(169, 21, '2025-07-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(170, 21, '2025-07-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(171, 21, '2025-07-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(172, 21, '2025-07-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(173, 21, '2025-07-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(174, 21, '2025-07-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(175, 21, '2025-07-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(176, 21, '2025-07-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(177, 21, '2025-07-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(178, 21, '2025-07-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(179, 21, '2025-07-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(180, 21, '2025-07-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(181, 21, '2025-07-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(195, 22, '2025-07-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(196, 22, '2025-07-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(197, 22, '2025-07-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(198, 22, '2025-07-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(199, 22, '2025-07-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(200, 22, '2025-07-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(201, 22, '2025-07-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(202, 22, '2025-07-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(203, 22, '2025-07-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(204, 22, '2025-07-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(205, 22, '2025-07-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(206, 22, '2025-07-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(207, 22, '2025-07-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(208, 20, '2025-07-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(209, 20, '2025-07-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(210, 20, '2025-07-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(211, 20, '2025-07-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(212, 20, '2025-07-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(213, 20, '2025-07-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(214, 20, '2025-07-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(215, 20, '2025-07-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(216, 20, '2025-07-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(217, 20, '2025-07-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(218, 20, '2025-07-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(219, 20, '2025-07-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(220, 20, '2025-07-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(221, 19, '2025-07-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(222, 19, '2025-07-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(223, 19, '2025-07-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(224, 19, '2025-07-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(225, 19, '2025-07-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(226, 19, '2025-07-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(227, 19, '2025-07-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(228, 19, '2025-07-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(229, 19, '2025-07-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(230, 19, '2025-07-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(231, 19, '2025-07-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(232, 19, '2025-07-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(233, 19, '2025-07-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(234, 13, '2025-08-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(235, 13, '2025-08-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(236, 13, '2025-08-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(237, 13, '2025-08-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(238, 13, '2025-08-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(239, 13, '2025-08-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(240, 13, '2025-08-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(241, 13, '2025-08-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(242, 13, '2025-08-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(243, 13, '2025-08-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(244, 13, '2025-08-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(245, 13, '2025-08-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(246, 13, '2025-08-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(247, 21, '2025-08-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(248, 21, '2025-08-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(249, 21, '2025-08-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(250, 21, '2025-08-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(251, 21, '2025-08-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(252, 21, '2025-08-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(253, 21, '2025-08-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(254, 21, '2025-08-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(255, 21, '2025-08-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(256, 21, '2025-08-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(257, 21, '2025-08-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(258, 21, '2025-08-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(259, 21, '2025-08-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(273, 22, '2025-08-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(274, 22, '2025-08-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(275, 22, '2025-08-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(276, 22, '2025-08-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(277, 22, '2025-08-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(278, 22, '2025-08-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(279, 22, '2025-08-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(280, 22, '2025-08-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(281, 22, '2025-08-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(282, 22, '2025-08-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(283, 22, '2025-08-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(284, 22, '2025-08-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(285, 22, '2025-08-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(286, 20, '2025-08-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(287, 20, '2025-08-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(288, 20, '2025-08-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(289, 20, '2025-08-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(290, 20, '2025-08-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(291, 20, '2025-08-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(292, 20, '2025-08-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(293, 20, '2025-08-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(294, 20, '2025-08-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(295, 20, '2025-08-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(296, 20, '2025-08-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(297, 20, '2025-08-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(298, 20, '2025-08-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(299, 19, '2025-08-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(300, 19, '2025-08-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(301, 19, '2025-08-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(302, 19, '2025-08-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(303, 19, '2025-08-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(304, 19, '2025-08-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(305, 19, '2025-08-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(306, 19, '2025-08-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(307, 19, '2025-08-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(308, 19, '2025-08-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(309, 19, '2025-08-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(310, 19, '2025-08-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(311, 19, '2025-08-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(312, 13, '2025-08-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(313, 13, '2025-08-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(314, 13, '2025-08-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(315, 13, '2025-08-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(316, 13, '2025-08-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(317, 13, '2025-08-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(318, 13, '2025-08-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(319, 13, '2025-08-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(320, 13, '2025-08-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(321, 13, '2025-08-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(322, 13, '2025-08-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(323, 13, '2025-08-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(324, 13, '2025-08-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(325, 21, '2025-08-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(326, 21, '2025-08-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(327, 21, '2025-08-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(328, 21, '2025-08-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(329, 21, '2025-08-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(330, 21, '2025-08-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(331, 21, '2025-08-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(332, 21, '2025-08-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(333, 21, '2025-08-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(334, 21, '2025-08-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(335, 21, '2025-08-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(336, 21, '2025-08-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(337, 21, '2025-08-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(351, 22, '2025-08-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(352, 22, '2025-08-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(353, 22, '2025-08-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(354, 22, '2025-08-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(355, 22, '2025-08-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(356, 22, '2025-08-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(357, 22, '2025-08-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(358, 22, '2025-08-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(359, 22, '2025-08-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(360, 22, '2025-08-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(361, 22, '2025-08-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(362, 22, '2025-08-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(363, 22, '2025-08-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(364, 20, '2025-08-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(365, 20, '2025-08-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(366, 20, '2025-08-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(367, 20, '2025-08-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(368, 20, '2025-08-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(369, 20, '2025-08-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(370, 20, '2025-08-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(371, 20, '2025-08-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(372, 20, '2025-08-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(373, 20, '2025-08-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(374, 20, '2025-08-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(375, 20, '2025-08-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(376, 20, '2025-08-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(377, 19, '2025-08-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(378, 19, '2025-08-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(379, 19, '2025-08-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(380, 19, '2025-08-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(381, 19, '2025-08-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(382, 19, '2025-08-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(383, 19, '2025-08-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(384, 19, '2025-08-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(385, 19, '2025-08-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(386, 19, '2025-08-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(387, 19, '2025-08-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(388, 19, '2025-08-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(389, 19, '2025-08-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(390, 13, '2025-09-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(391, 13, '2025-09-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(392, 13, '2025-09-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(393, 13, '2025-09-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(394, 13, '2025-09-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(395, 13, '2025-09-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(396, 13, '2025-09-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(397, 13, '2025-09-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(398, 13, '2025-09-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(399, 13, '2025-09-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(400, 13, '2025-09-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(401, 13, '2025-09-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(402, 21, '2025-09-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(403, 21, '2025-09-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(404, 21, '2025-09-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(405, 21, '2025-09-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(406, 21, '2025-09-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(407, 21, '2025-09-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(408, 21, '2025-09-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(409, 21, '2025-09-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(410, 21, '2025-09-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(411, 21, '2025-09-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(412, 21, '2025-09-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(413, 21, '2025-09-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(426, 22, '2025-09-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14');
INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `is_late`, `late_minutes`, `working_hours`, `overtime_hours`, `notes`, `leave_request_id`, `created_at`, `updated_at`) VALUES
(427, 22, '2025-09-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(428, 22, '2025-09-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(429, 22, '2025-09-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(430, 22, '2025-09-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(431, 22, '2025-09-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(432, 22, '2025-09-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(433, 22, '2025-09-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(434, 22, '2025-09-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(435, 22, '2025-09-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(436, 22, '2025-09-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(437, 22, '2025-09-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(438, 20, '2025-09-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(439, 20, '2025-09-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(440, 20, '2025-09-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(441, 20, '2025-09-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(442, 20, '2025-09-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(443, 20, '2025-09-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(444, 20, '2025-09-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(445, 20, '2025-09-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(446, 20, '2025-09-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(447, 20, '2025-09-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(448, 20, '2025-09-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(449, 20, '2025-09-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(450, 19, '2025-09-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(451, 19, '2025-09-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(452, 19, '2025-09-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(453, 19, '2025-09-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(454, 19, '2025-09-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(455, 19, '2025-09-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(456, 19, '2025-09-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(457, 19, '2025-09-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(458, 19, '2025-09-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(459, 19, '2025-09-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(460, 19, '2025-09-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(461, 19, '2025-09-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(462, 13, '2025-09-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(463, 13, '2025-09-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(464, 13, '2025-09-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(465, 13, '2025-09-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(466, 13, '2025-09-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(467, 13, '2025-09-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(468, 13, '2025-09-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(469, 13, '2025-09-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(470, 13, '2025-09-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(471, 13, '2025-09-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(472, 13, '2025-09-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(473, 13, '2025-09-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(474, 13, '2025-09-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(475, 21, '2025-09-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(476, 21, '2025-09-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(477, 21, '2025-09-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(478, 21, '2025-09-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(479, 21, '2025-09-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(480, 21, '2025-09-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(481, 21, '2025-09-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(482, 21, '2025-09-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(483, 21, '2025-09-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(484, 21, '2025-09-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(485, 21, '2025-09-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(486, 21, '2025-09-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(487, 21, '2025-09-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(501, 22, '2025-09-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(502, 22, '2025-09-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(503, 22, '2025-09-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(504, 22, '2025-09-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(505, 22, '2025-09-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(506, 22, '2025-09-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(507, 22, '2025-09-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(508, 22, '2025-09-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(509, 22, '2025-09-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(510, 22, '2025-09-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(511, 22, '2025-09-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(512, 22, '2025-09-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(513, 22, '2025-09-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(514, 20, '2025-09-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(515, 20, '2025-09-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(516, 20, '2025-09-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(517, 20, '2025-09-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(518, 20, '2025-09-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(519, 20, '2025-09-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(520, 20, '2025-09-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(521, 20, '2025-09-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(522, 20, '2025-09-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(523, 20, '2025-09-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(524, 20, '2025-09-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(525, 20, '2025-09-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(526, 20, '2025-09-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(527, 19, '2025-09-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(528, 19, '2025-09-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(529, 19, '2025-09-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(530, 19, '2025-09-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(531, 19, '2025-09-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(532, 19, '2025-09-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(533, 19, '2025-09-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(534, 19, '2025-09-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(535, 19, '2025-09-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(536, 19, '2025-09-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(537, 19, '2025-09-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(538, 19, '2025-09-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(539, 19, '2025-09-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(540, 13, '2025-10-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(541, 13, '2025-10-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(542, 13, '2025-10-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(543, 13, '2025-10-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(544, 13, '2025-10-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(545, 13, '2025-10-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(546, 13, '2025-10-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(547, 13, '2025-10-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(548, 13, '2025-10-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(549, 13, '2025-10-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(550, 13, '2025-10-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(551, 13, '2025-10-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(552, 13, '2025-10-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(553, 21, '2025-10-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(554, 21, '2025-10-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(555, 21, '2025-10-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(556, 21, '2025-10-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(557, 21, '2025-10-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(558, 21, '2025-10-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(559, 21, '2025-10-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(560, 21, '2025-10-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(561, 21, '2025-10-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(562, 21, '2025-10-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(563, 21, '2025-10-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(564, 21, '2025-10-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(565, 21, '2025-10-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(579, 22, '2025-10-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(580, 22, '2025-10-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(581, 22, '2025-10-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(582, 22, '2025-10-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(583, 22, '2025-10-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(584, 22, '2025-10-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(585, 22, '2025-10-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(586, 22, '2025-10-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(587, 22, '2025-10-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(588, 22, '2025-10-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(589, 22, '2025-10-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(590, 22, '2025-10-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(591, 22, '2025-10-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(592, 20, '2025-10-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(593, 20, '2025-10-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(594, 20, '2025-10-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(595, 20, '2025-10-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(596, 20, '2025-10-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(597, 20, '2025-10-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(598, 20, '2025-10-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(599, 20, '2025-10-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(600, 20, '2025-10-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(601, 20, '2025-10-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(602, 20, '2025-10-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(603, 20, '2025-10-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(604, 20, '2025-10-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(605, 19, '2025-10-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(606, 19, '2025-10-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(607, 19, '2025-10-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(608, 19, '2025-10-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(609, 19, '2025-10-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(610, 19, '2025-10-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(611, 19, '2025-10-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(612, 19, '2025-10-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(613, 19, '2025-10-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(614, 19, '2025-10-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(615, 19, '2025-10-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(616, 19, '2025-10-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(617, 19, '2025-10-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(618, 13, '2025-10-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(619, 13, '2025-10-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(620, 13, '2025-10-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(621, 13, '2025-10-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(622, 13, '2025-10-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(623, 13, '2025-10-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(624, 13, '2025-10-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(625, 13, '2025-10-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(626, 13, '2025-10-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(627, 13, '2025-10-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(628, 13, '2025-10-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(629, 13, '2025-10-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(630, 13, '2025-10-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(631, 21, '2025-10-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(632, 21, '2025-10-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(633, 21, '2025-10-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(634, 21, '2025-10-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(635, 21, '2025-10-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(636, 21, '2025-10-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(637, 21, '2025-10-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(638, 21, '2025-10-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(639, 21, '2025-10-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(640, 21, '2025-10-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(641, 21, '2025-10-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(642, 21, '2025-10-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(643, 21, '2025-10-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(657, 22, '2025-10-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(658, 22, '2025-10-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(659, 22, '2025-10-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(660, 22, '2025-10-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(661, 22, '2025-10-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(662, 22, '2025-10-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(663, 22, '2025-10-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(664, 22, '2025-10-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(665, 22, '2025-10-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(666, 22, '2025-10-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(667, 22, '2025-10-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(668, 22, '2025-10-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(669, 22, '2025-10-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(670, 20, '2025-10-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(671, 20, '2025-10-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(672, 20, '2025-10-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(673, 20, '2025-10-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(674, 20, '2025-10-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(675, 20, '2025-10-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(676, 20, '2025-10-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(677, 20, '2025-10-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(678, 20, '2025-10-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(679, 20, '2025-10-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(680, 20, '2025-10-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(681, 20, '2025-10-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(682, 20, '2025-10-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(683, 19, '2025-10-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(684, 19, '2025-10-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(685, 19, '2025-10-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(686, 19, '2025-10-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(687, 19, '2025-10-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(688, 19, '2025-10-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(689, 19, '2025-10-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(690, 19, '2025-10-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(691, 19, '2025-10-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(692, 19, '2025-10-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(693, 19, '2025-10-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(694, 19, '2025-10-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(695, 19, '2025-10-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(696, 13, '2025-10-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(697, 13, '2025-11-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(698, 13, '2025-11-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(699, 13, '2025-11-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(700, 13, '2025-11-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(701, 13, '2025-11-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(702, 13, '2025-11-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(703, 13, '2025-11-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(704, 13, '2025-11-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(705, 13, '2025-11-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(706, 13, '2025-11-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(707, 13, '2025-11-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(708, 13, '2025-11-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(709, 21, '2025-10-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(710, 21, '2025-11-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(711, 21, '2025-11-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(712, 21, '2025-11-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(713, 21, '2025-11-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(714, 21, '2025-11-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(715, 21, '2025-11-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(716, 21, '2025-11-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(717, 21, '2025-11-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(718, 21, '2025-11-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(719, 21, '2025-11-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(720, 21, '2025-11-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(721, 21, '2025-11-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(735, 22, '2025-10-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(736, 22, '2025-11-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(737, 22, '2025-11-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(738, 22, '2025-11-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(739, 22, '2025-11-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(740, 22, '2025-11-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(741, 22, '2025-11-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(742, 22, '2025-11-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(743, 22, '2025-11-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(744, 22, '2025-11-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(745, 22, '2025-11-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(746, 22, '2025-11-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(747, 22, '2025-11-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(748, 20, '2025-10-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(749, 20, '2025-11-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(750, 20, '2025-11-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(751, 20, '2025-11-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(752, 20, '2025-11-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(753, 20, '2025-11-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(754, 20, '2025-11-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(755, 20, '2025-11-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(756, 20, '2025-11-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(757, 20, '2025-11-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(758, 20, '2025-11-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(759, 20, '2025-11-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(760, 20, '2025-11-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(761, 19, '2025-10-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(762, 19, '2025-11-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(763, 19, '2025-11-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(764, 19, '2025-11-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(765, 19, '2025-11-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(766, 19, '2025-11-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(767, 19, '2025-11-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(768, 19, '2025-11-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(769, 19, '2025-11-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(770, 19, '2025-11-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(771, 19, '2025-11-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(772, 19, '2025-11-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(773, 19, '2025-11-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(774, 13, '2025-11-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(775, 13, '2025-11-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(776, 13, '2025-11-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(777, 13, '2025-11-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(778, 13, '2025-11-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(779, 13, '2025-11-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(780, 13, '2025-11-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(781, 13, '2025-11-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(782, 13, '2025-11-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(783, 13, '2025-11-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(784, 13, '2025-11-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(785, 13, '2025-11-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(786, 13, '2025-11-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(787, 21, '2025-11-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(788, 21, '2025-11-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(789, 21, '2025-11-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(790, 21, '2025-11-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(791, 21, '2025-11-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(792, 21, '2025-11-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(793, 21, '2025-11-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(794, 21, '2025-11-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(795, 21, '2025-11-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(796, 21, '2025-11-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(797, 21, '2025-11-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(798, 21, '2025-11-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(799, 21, '2025-11-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(813, 22, '2025-11-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(814, 22, '2025-11-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(815, 22, '2025-11-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(816, 22, '2025-11-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(817, 22, '2025-11-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(818, 22, '2025-11-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(819, 22, '2025-11-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(820, 22, '2025-11-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(821, 22, '2025-11-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(822, 22, '2025-11-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(823, 22, '2025-11-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(824, 22, '2025-11-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(825, 22, '2025-11-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(826, 20, '2025-11-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(827, 20, '2025-11-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(828, 20, '2025-11-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(829, 20, '2025-11-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(830, 20, '2025-11-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(831, 20, '2025-11-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(832, 20, '2025-11-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(833, 20, '2025-11-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(834, 20, '2025-11-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(835, 20, '2025-11-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(836, 20, '2025-11-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14');
INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `is_late`, `late_minutes`, `working_hours`, `overtime_hours`, `notes`, `leave_request_id`, `created_at`, `updated_at`) VALUES
(837, 20, '2025-11-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(838, 20, '2025-11-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(839, 19, '2025-11-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(840, 19, '2025-11-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(841, 19, '2025-11-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(842, 19, '2025-11-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(843, 19, '2025-11-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(844, 19, '2025-11-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(845, 19, '2025-11-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(846, 19, '2025-11-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(847, 19, '2025-11-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(848, 19, '2025-11-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(849, 19, '2025-11-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(850, 19, '2025-11-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(851, 19, '2025-11-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(852, 13, '2025-12-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(853, 13, '2025-12-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(854, 13, '2025-12-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(855, 13, '2025-12-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(856, 13, '2025-12-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(857, 13, '2025-12-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(858, 13, '2025-12-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(859, 13, '2025-12-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(860, 13, '2025-12-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(861, 13, '2025-12-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(862, 13, '2025-12-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(863, 13, '2025-12-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(864, 13, '2025-12-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(865, 21, '2025-12-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(866, 21, '2025-12-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(867, 21, '2025-12-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(868, 21, '2025-12-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(869, 21, '2025-12-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(870, 21, '2025-12-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(871, 21, '2025-12-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(872, 21, '2025-12-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(873, 21, '2025-12-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(874, 21, '2025-12-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(875, 21, '2025-12-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(876, 21, '2025-12-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(877, 21, '2025-12-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(891, 22, '2025-12-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(892, 22, '2025-12-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(893, 22, '2025-12-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(894, 22, '2025-12-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(895, 22, '2025-12-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(896, 22, '2025-12-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(897, 22, '2025-12-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(898, 22, '2025-12-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(899, 22, '2025-12-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(900, 22, '2025-12-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(901, 22, '2025-12-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(902, 22, '2025-12-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(903, 22, '2025-12-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(904, 20, '2025-12-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(905, 20, '2025-12-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(906, 20, '2025-12-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(907, 20, '2025-12-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(908, 20, '2025-12-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(909, 20, '2025-12-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(910, 20, '2025-12-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(911, 20, '2025-12-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(912, 20, '2025-12-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(913, 20, '2025-12-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(914, 20, '2025-12-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(915, 20, '2025-12-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(916, 20, '2025-12-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(917, 19, '2025-12-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(918, 19, '2025-12-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(919, 19, '2025-12-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(920, 19, '2025-12-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(921, 19, '2025-12-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(922, 19, '2025-12-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(923, 19, '2025-12-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(924, 19, '2025-12-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(925, 19, '2025-12-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(926, 19, '2025-12-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(927, 19, '2025-12-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(928, 19, '2025-12-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(929, 19, '2025-12-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(930, 13, '2025-12-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(931, 13, '2025-12-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(932, 13, '2025-12-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(933, 13, '2025-12-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(934, 13, '2025-12-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(935, 13, '2025-12-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(936, 13, '2025-12-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(937, 13, '2025-12-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(938, 13, '2025-12-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(939, 13, '2025-12-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(940, 13, '2025-12-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(941, 13, '2025-12-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(942, 21, '2025-12-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(943, 21, '2025-12-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(944, 21, '2025-12-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(945, 21, '2025-12-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(946, 21, '2025-12-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(947, 21, '2025-12-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(948, 21, '2025-12-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(949, 21, '2025-12-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(950, 21, '2025-12-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(951, 21, '2025-12-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(952, 21, '2025-12-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(953, 21, '2025-12-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(966, 22, '2025-12-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(967, 22, '2025-12-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(968, 22, '2025-12-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(969, 22, '2025-12-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(970, 22, '2025-12-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(971, 22, '2025-12-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(972, 22, '2025-12-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(973, 22, '2025-12-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(974, 22, '2025-12-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(975, 22, '2025-12-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(976, 22, '2025-12-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(977, 22, '2025-12-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(978, 20, '2025-12-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(979, 20, '2025-12-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(980, 20, '2025-12-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(981, 20, '2025-12-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(982, 20, '2025-12-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(983, 20, '2025-12-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(984, 20, '2025-12-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(985, 20, '2025-12-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(986, 20, '2025-12-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(987, 20, '2025-12-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(988, 20, '2025-12-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(989, 20, '2025-12-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(990, 19, '2025-12-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(991, 19, '2025-12-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(992, 19, '2025-12-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(993, 19, '2025-12-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(994, 19, '2025-12-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(995, 19, '2025-12-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(996, 19, '2025-12-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(997, 19, '2025-12-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(998, 19, '2025-12-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(999, 19, '2025-12-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1000, 19, '2025-12-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1001, 19, '2025-12-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1002, 13, '2025-12-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1003, 13, '2026-01-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1004, 13, '2026-01-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1005, 13, '2026-01-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1006, 13, '2026-01-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1007, 13, '2026-01-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1008, 13, '2026-01-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1009, 13, '2026-01-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1010, 13, '2026-01-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1011, 13, '2026-01-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1012, 13, '2026-01-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1013, 13, '2026-01-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1014, 21, '2025-12-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1015, 21, '2026-01-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1016, 21, '2026-01-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1017, 21, '2026-01-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1018, 21, '2026-01-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1019, 21, '2026-01-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1020, 21, '2026-01-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1021, 21, '2026-01-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1022, 21, '2026-01-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1023, 21, '2026-01-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1024, 21, '2026-01-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1025, 21, '2026-01-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1038, 22, '2025-12-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1039, 22, '2026-01-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1040, 22, '2026-01-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1041, 22, '2026-01-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1042, 22, '2026-01-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1043, 22, '2026-01-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1044, 22, '2026-01-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1045, 22, '2026-01-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1046, 22, '2026-01-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1047, 22, '2026-01-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1048, 22, '2026-01-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1049, 22, '2026-01-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1050, 20, '2025-12-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1051, 20, '2026-01-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1052, 20, '2026-01-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1053, 20, '2026-01-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1054, 20, '2026-01-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1055, 20, '2026-01-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1056, 20, '2026-01-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1057, 20, '2026-01-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1058, 20, '2026-01-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1059, 20, '2026-01-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1060, 20, '2026-01-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1061, 20, '2026-01-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1062, 19, '2025-12-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1063, 19, '2026-01-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1064, 19, '2026-01-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1065, 19, '2026-01-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1066, 19, '2026-01-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1067, 19, '2026-01-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1068, 19, '2026-01-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1069, 19, '2026-01-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1070, 19, '2026-01-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1071, 19, '2026-01-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1072, 19, '2026-01-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1073, 19, '2026-01-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1074, 13, '2026-01-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1075, 13, '2026-01-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1076, 13, '2026-01-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1077, 13, '2026-01-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1078, 13, '2026-01-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1079, 13, '2026-01-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1080, 13, '2026-01-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1081, 13, '2026-01-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1082, 13, '2026-01-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1083, 13, '2026-01-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1084, 13, '2026-01-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1085, 13, '2026-01-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1086, 21, '2026-01-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1087, 21, '2026-01-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1088, 21, '2026-01-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1089, 21, '2026-01-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1090, 21, '2026-01-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1091, 21, '2026-01-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1092, 21, '2026-01-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1093, 21, '2026-01-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1094, 21, '2026-01-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1095, 21, '2026-01-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1096, 21, '2026-01-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1097, 21, '2026-01-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1110, 22, '2026-01-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1111, 22, '2026-01-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1112, 22, '2026-01-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1113, 22, '2026-01-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1114, 22, '2026-01-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1115, 22, '2026-01-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1116, 22, '2026-01-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1117, 22, '2026-01-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1118, 22, '2026-01-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1119, 22, '2026-01-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1120, 22, '2026-01-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1121, 22, '2026-01-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1122, 20, '2026-01-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1123, 20, '2026-01-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1124, 20, '2026-01-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1125, 20, '2026-01-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1126, 20, '2026-01-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1127, 20, '2026-01-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1128, 20, '2026-01-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1129, 20, '2026-01-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1130, 20, '2026-01-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1131, 20, '2026-01-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1132, 20, '2026-01-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1133, 20, '2026-01-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1134, 19, '2026-01-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1135, 19, '2026-01-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1136, 19, '2026-01-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1137, 19, '2026-01-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1138, 19, '2026-01-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1139, 19, '2026-01-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1140, 19, '2026-01-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1141, 19, '2026-01-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1142, 19, '2026-01-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1143, 19, '2026-01-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1144, 19, '2026-01-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1145, 19, '2026-01-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1146, 13, '2026-01-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1147, 13, '2026-01-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1148, 13, '2026-02-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1149, 13, '2026-02-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1150, 13, '2026-02-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1151, 13, '2026-02-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1152, 13, '2026-02-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1153, 13, '2026-02-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1154, 13, '2026-02-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1155, 13, '2026-02-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1156, 13, '2026-02-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1157, 13, '2026-02-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1158, 13, '2026-02-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1159, 21, '2026-01-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1160, 21, '2026-01-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1161, 21, '2026-02-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1162, 21, '2026-02-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1163, 21, '2026-02-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1164, 21, '2026-02-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1165, 21, '2026-02-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1166, 21, '2026-02-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1167, 21, '2026-02-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1168, 21, '2026-02-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1169, 21, '2026-02-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1170, 21, '2026-02-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1171, 21, '2026-02-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1185, 22, '2026-01-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1186, 22, '2026-01-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1187, 22, '2026-02-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1188, 22, '2026-02-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1189, 22, '2026-02-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1190, 22, '2026-02-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1191, 22, '2026-02-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1192, 22, '2026-02-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1193, 22, '2026-02-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1194, 22, '2026-02-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1195, 22, '2026-02-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1196, 22, '2026-02-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1197, 22, '2026-02-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1198, 20, '2026-01-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1199, 20, '2026-01-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1200, 20, '2026-02-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1201, 20, '2026-02-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1202, 20, '2026-02-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1203, 20, '2026-02-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1204, 20, '2026-02-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1205, 20, '2026-02-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1206, 20, '2026-02-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1207, 20, '2026-02-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1208, 20, '2026-02-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1209, 20, '2026-02-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1210, 20, '2026-02-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1211, 19, '2026-01-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1212, 19, '2026-01-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1213, 19, '2026-02-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1214, 19, '2026-02-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1215, 19, '2026-02-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1216, 19, '2026-02-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1217, 19, '2026-02-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1218, 19, '2026-02-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1219, 19, '2026-02-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1220, 19, '2026-02-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1221, 19, '2026-02-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1222, 19, '2026-02-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1223, 19, '2026-02-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1224, 13, '2026-02-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1225, 13, '2026-02-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1226, 13, '2026-02-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1227, 13, '2026-02-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1228, 13, '2026-02-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1229, 13, '2026-02-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1230, 13, '2026-02-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1231, 13, '2026-02-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1232, 13, '2026-02-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1233, 13, '2026-02-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1234, 13, '2026-02-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1235, 13, '2026-02-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1236, 21, '2026-02-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1237, 21, '2026-02-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1238, 21, '2026-02-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1239, 21, '2026-02-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1240, 21, '2026-02-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1241, 21, '2026-02-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1242, 21, '2026-02-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14');
INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `is_late`, `late_minutes`, `working_hours`, `overtime_hours`, `notes`, `leave_request_id`, `created_at`, `updated_at`) VALUES
(1243, 21, '2026-02-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1244, 21, '2026-02-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1245, 21, '2026-02-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1246, 21, '2026-02-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1247, 21, '2026-02-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1260, 22, '2026-02-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1261, 22, '2026-02-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1262, 22, '2026-02-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1263, 22, '2026-02-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1264, 22, '2026-02-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1265, 22, '2026-02-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1266, 22, '2026-02-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1267, 22, '2026-02-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1268, 22, '2026-02-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1269, 22, '2026-02-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1270, 22, '2026-02-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1271, 22, '2026-02-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1272, 20, '2026-02-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1273, 20, '2026-02-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1274, 20, '2026-02-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1275, 20, '2026-02-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1276, 20, '2026-02-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1277, 20, '2026-02-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1278, 20, '2026-02-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1279, 20, '2026-02-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1280, 20, '2026-02-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1281, 20, '2026-02-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1282, 20, '2026-02-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1283, 20, '2026-02-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1284, 19, '2026-02-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1285, 19, '2026-02-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1286, 19, '2026-02-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1287, 19, '2026-02-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1288, 19, '2026-02-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1289, 19, '2026-02-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1290, 19, '2026-02-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1291, 19, '2026-02-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1292, 19, '2026-02-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1293, 19, '2026-02-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1294, 19, '2026-02-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1295, 19, '2026-02-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1296, 13, '2026-03-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1297, 13, '2026-03-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1298, 13, '2026-03-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1299, 13, '2026-03-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1300, 13, '2026-03-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1301, 13, '2026-03-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1302, 13, '2026-03-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1303, 13, '2026-03-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1304, 13, '2026-03-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1305, 13, '2026-03-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1306, 13, '2026-03-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1307, 13, '2026-03-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1308, 13, '2026-03-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1309, 21, '2026-03-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1310, 21, '2026-03-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1311, 21, '2026-03-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1312, 21, '2026-03-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1313, 21, '2026-03-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1314, 21, '2026-03-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1315, 21, '2026-03-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1316, 21, '2026-03-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1317, 21, '2026-03-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1318, 21, '2026-03-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1319, 21, '2026-03-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1320, 21, '2026-03-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1321, 21, '2026-03-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1335, 22, '2026-03-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1336, 22, '2026-03-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1337, 22, '2026-03-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1338, 22, '2026-03-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1339, 22, '2026-03-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1340, 22, '2026-03-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1341, 22, '2026-03-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1342, 22, '2026-03-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1343, 22, '2026-03-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1344, 22, '2026-03-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1345, 22, '2026-03-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1346, 22, '2026-03-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1347, 22, '2026-03-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1348, 20, '2026-03-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1349, 20, '2026-03-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1350, 20, '2026-03-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1351, 20, '2026-03-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1352, 20, '2026-03-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1353, 20, '2026-03-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1354, 20, '2026-03-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1355, 20, '2026-03-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1356, 20, '2026-03-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1357, 20, '2026-03-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1358, 20, '2026-03-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1359, 20, '2026-03-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1360, 20, '2026-03-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1361, 19, '2026-03-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1362, 19, '2026-03-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1363, 19, '2026-03-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1364, 19, '2026-03-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1365, 19, '2026-03-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1366, 19, '2026-03-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1367, 19, '2026-03-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1368, 19, '2026-03-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1369, 19, '2026-03-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1370, 19, '2026-03-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1371, 19, '2026-03-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1372, 19, '2026-03-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1373, 19, '2026-03-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1374, 13, '2026-03-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1375, 13, '2026-03-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1376, 13, '2026-03-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1377, 13, '2026-03-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1378, 13, '2026-03-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1379, 13, '2026-03-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1380, 13, '2026-03-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1381, 13, '2026-03-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1382, 21, '2026-03-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1383, 21, '2026-03-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1384, 21, '2026-03-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1385, 21, '2026-03-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1386, 21, '2026-03-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1387, 21, '2026-03-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1388, 21, '2026-03-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1389, 21, '2026-03-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1398, 22, '2026-03-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1399, 22, '2026-03-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1400, 22, '2026-03-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1401, 22, '2026-03-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1402, 22, '2026-03-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1403, 22, '2026-03-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1404, 22, '2026-03-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1405, 22, '2026-03-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1406, 20, '2026-03-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1407, 20, '2026-03-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1408, 20, '2026-03-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1409, 20, '2026-03-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1410, 20, '2026-03-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1411, 20, '2026-03-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1412, 20, '2026-03-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1413, 20, '2026-03-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1414, 19, '2026-03-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1415, 19, '2026-03-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1416, 19, '2026-03-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1417, 19, '2026-03-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1418, 19, '2026-03-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1419, 19, '2026-03-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1420, 19, '2026-03-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1421, 19, '2026-03-31', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1422, 13, '2026-04-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1423, 13, '2026-04-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1424, 13, '2026-04-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1425, 13, '2026-04-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1426, 13, '2026-04-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1427, 13, '2026-04-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1428, 13, '2026-04-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1429, 13, '2026-04-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1430, 13, '2026-04-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1431, 13, '2026-04-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1432, 13, '2026-04-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1433, 13, '2026-04-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1434, 13, '2026-04-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1435, 21, '2026-04-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1436, 21, '2026-04-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1437, 21, '2026-04-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1438, 21, '2026-04-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1439, 21, '2026-04-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1440, 21, '2026-04-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1441, 21, '2026-04-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1442, 21, '2026-04-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1443, 21, '2026-04-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1444, 21, '2026-04-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1445, 21, '2026-04-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1446, 21, '2026-04-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1447, 21, '2026-04-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1461, 22, '2026-04-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1462, 22, '2026-04-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1463, 22, '2026-04-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1464, 22, '2026-04-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1465, 22, '2026-04-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1466, 22, '2026-04-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1467, 22, '2026-04-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1468, 22, '2026-04-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1469, 22, '2026-04-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1470, 22, '2026-04-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1471, 22, '2026-04-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1472, 22, '2026-04-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1473, 22, '2026-04-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1474, 20, '2026-04-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1475, 20, '2026-04-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1476, 20, '2026-04-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1477, 20, '2026-04-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1478, 20, '2026-04-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1479, 20, '2026-04-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1480, 20, '2026-04-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1481, 20, '2026-04-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1482, 20, '2026-04-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1483, 20, '2026-04-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1484, 20, '2026-04-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1485, 20, '2026-04-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1486, 20, '2026-04-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1487, 19, '2026-04-01', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1488, 19, '2026-04-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1489, 19, '2026-04-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1490, 19, '2026-04-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1491, 19, '2026-04-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1492, 19, '2026-04-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1493, 19, '2026-04-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1494, 19, '2026-04-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1495, 19, '2026-04-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1496, 19, '2026-04-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1497, 19, '2026-04-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1498, 19, '2026-04-14', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1499, 19, '2026-04-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1500, 13, '2026-04-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1501, 13, '2026-04-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1502, 13, '2026-04-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1503, 13, '2026-04-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1504, 13, '2026-04-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1505, 13, '2026-04-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1506, 13, '2026-04-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1507, 13, '2026-04-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1508, 13, '2026-04-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1509, 13, '2026-04-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1510, 13, '2026-04-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1511, 13, '2026-04-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1512, 13, '2026-04-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1513, 21, '2026-04-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1514, 21, '2026-04-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1515, 21, '2026-04-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1516, 21, '2026-04-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1517, 21, '2026-04-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1518, 21, '2026-04-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1519, 21, '2026-04-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1520, 21, '2026-04-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1521, 21, '2026-04-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1522, 21, '2026-04-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1523, 21, '2026-04-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1524, 21, '2026-04-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1525, 21, '2026-04-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1539, 22, '2026-04-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1540, 22, '2026-04-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1541, 22, '2026-04-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1542, 22, '2026-04-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1543, 22, '2026-04-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1544, 22, '2026-04-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1545, 22, '2026-04-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1546, 22, '2026-04-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1547, 22, '2026-04-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1548, 22, '2026-04-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1549, 22, '2026-04-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1550, 22, '2026-04-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1551, 22, '2026-04-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1552, 20, '2026-04-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1553, 20, '2026-04-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1554, 20, '2026-04-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1555, 20, '2026-04-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1556, 20, '2026-04-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1557, 20, '2026-04-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1558, 20, '2026-04-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1559, 20, '2026-04-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1560, 20, '2026-04-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1561, 20, '2026-04-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1562, 20, '2026-04-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1563, 20, '2026-04-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1564, 20, '2026-04-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1565, 19, '2026-04-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1566, 19, '2026-04-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1567, 19, '2026-04-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1568, 19, '2026-04-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1569, 19, '2026-04-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1570, 19, '2026-04-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1571, 19, '2026-04-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1572, 19, '2026-04-24', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1573, 19, '2026-04-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1574, 19, '2026-04-27', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1575, 19, '2026-04-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1576, 19, '2026-04-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1577, 19, '2026-04-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1578, 13, '2026-05-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1579, 13, '2026-05-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1580, 13, '2026-05-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1581, 13, '2026-05-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1582, 13, '2026-05-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1583, 13, '2026-05-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1584, 13, '2026-05-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1585, 13, '2026-05-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1586, 13, '2026-05-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1587, 13, '2026-05-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1588, 13, '2026-05-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1589, 21, '2026-05-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1590, 21, '2026-05-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1591, 21, '2026-05-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1592, 21, '2026-05-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1593, 21, '2026-05-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1594, 21, '2026-05-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1595, 21, '2026-05-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1596, 21, '2026-05-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1597, 21, '2026-05-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1598, 21, '2026-05-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1599, 21, '2026-05-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1611, 22, '2026-05-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1612, 22, '2026-05-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1613, 22, '2026-05-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1614, 22, '2026-05-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1615, 22, '2026-05-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1616, 22, '2026-05-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1617, 22, '2026-05-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1618, 22, '2026-05-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1619, 22, '2026-05-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1620, 22, '2026-05-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1621, 22, '2026-05-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1622, 20, '2026-05-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1623, 20, '2026-05-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1624, 20, '2026-05-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1625, 20, '2026-05-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1626, 20, '2026-05-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1627, 20, '2026-05-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1628, 20, '2026-05-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1629, 20, '2026-05-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1630, 20, '2026-05-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1631, 20, '2026-05-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1632, 20, '2026-05-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1633, 19, '2026-05-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1634, 19, '2026-05-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1635, 19, '2026-05-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1636, 19, '2026-05-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1637, 19, '2026-05-07', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1638, 19, '2026-05-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1639, 19, '2026-05-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1640, 19, '2026-05-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1641, 19, '2026-05-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1642, 19, '2026-05-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1643, 19, '2026-05-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1644, 13, '2026-05-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1645, 13, '2026-05-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1646, 13, '2026-05-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1647, 13, '2026-05-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1648, 13, '2026-05-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1649, 13, '2026-05-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1650, 13, '2026-05-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1651, 13, '2026-05-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1652, 13, '2026-05-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1653, 13, '2026-05-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1654, 13, '2026-05-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1655, 13, '2026-05-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14');
INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `is_late`, `late_minutes`, `working_hours`, `overtime_hours`, `notes`, `leave_request_id`, `created_at`, `updated_at`) VALUES
(1656, 21, '2026-05-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1657, 21, '2026-05-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1658, 21, '2026-05-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1659, 21, '2026-05-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1660, 21, '2026-05-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1661, 21, '2026-05-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1662, 21, '2026-05-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1663, 21, '2026-05-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1664, 21, '2026-05-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1665, 21, '2026-05-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1666, 21, '2026-05-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1667, 21, '2026-05-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1680, 22, '2026-05-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1681, 22, '2026-05-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1682, 22, '2026-05-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1683, 22, '2026-05-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1684, 22, '2026-05-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1685, 22, '2026-05-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1686, 22, '2026-05-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1687, 22, '2026-05-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1688, 22, '2026-05-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1689, 22, '2026-05-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1690, 22, '2026-05-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1691, 22, '2026-05-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1692, 20, '2026-05-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1693, 20, '2026-05-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1694, 20, '2026-05-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1695, 20, '2026-05-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1696, 20, '2026-05-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1697, 20, '2026-05-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1698, 20, '2026-05-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1699, 20, '2026-05-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1700, 20, '2026-05-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1701, 20, '2026-05-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1702, 20, '2026-05-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1703, 20, '2026-05-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1704, 19, '2026-05-16', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1705, 19, '2026-05-18', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1706, 19, '2026-05-19', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1707, 19, '2026-05-20', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1708, 19, '2026-05-21', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1709, 19, '2026-05-22', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1710, 19, '2026-05-23', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1711, 19, '2026-05-25', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1712, 19, '2026-05-26', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1713, 19, '2026-05-28', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1714, 19, '2026-05-29', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1715, 19, '2026-05-30', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1716, 13, '2026-06-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1717, 13, '2026-06-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1718, 13, '2026-06-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1719, 13, '2026-06-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1720, 13, '2026-06-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1721, 13, '2026-06-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1722, 13, '2026-06-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1723, 13, '2026-06-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1724, 13, '2026-06-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1725, 13, '2026-06-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1726, 13, '2026-06-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1727, 13, '2026-06-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1728, 21, '2026-06-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1729, 21, '2026-06-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1730, 21, '2026-06-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1731, 21, '2026-06-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1732, 21, '2026-06-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1733, 21, '2026-06-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1734, 21, '2026-06-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1735, 21, '2026-06-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1736, 21, '2026-06-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1737, 21, '2026-06-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1738, 21, '2026-06-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1739, 21, '2026-06-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1751, 23, '2026-06-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1752, 22, '2026-06-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1753, 22, '2026-06-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1754, 22, '2026-06-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1755, 22, '2026-06-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1756, 22, '2026-06-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1757, 22, '2026-06-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1758, 22, '2026-06-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1759, 22, '2026-06-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1760, 22, '2026-06-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1761, 22, '2026-06-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1762, 22, '2026-06-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1763, 22, '2026-06-15', NULL, NULL, 'alpha', NULL, NULL, NULL, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 05:10:56'),
(1764, 20, '2026-06-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1765, 20, '2026-06-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1766, 20, '2026-06-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1767, 20, '2026-06-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1768, 20, '2026-06-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1769, 20, '2026-06-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1770, 20, '2026-06-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1771, 20, '2026-06-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1772, 20, '2026-06-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1773, 20, '2026-06-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1774, 20, '2026-06-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1775, 20, '2026-06-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1776, 19, '2026-06-02', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1777, 19, '2026-06-03', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1778, 19, '2026-06-04', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1779, 19, '2026-06-05', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1780, 19, '2026-06-06', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1781, 19, '2026-06-08', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1782, 19, '2026-06-09', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1783, 19, '2026-06-10', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1784, 19, '2026-06-11', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1785, 19, '2026-06-12', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1786, 19, '2026-06-13', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1787, 19, '2026-06-15', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1788, 13, '2026-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1789, 21, '2026-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1790, 23, '2026-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(1791, 22, '2026-06-17', '12:09:54', NULL, 'hadir', 1, 250, NULL, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 05:09:54'),
(1792, 20, '2026-06-17', '08:00:00', NULL, 'hadir', 0, 0, NULL, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:57:18'),
(1793, 19, '2026-06-17', '08:00:00', '17:00:00', 'hadir', 0, 0, 9.00, 0.00, 'Backfill hadir', NULL, '2026-06-17 10:52:14', '2026-06-17 03:52:14'),
(2053, 20, '2025-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2054, 20, '2025-06-02', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2055, 20, '2025-06-03', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2056, 20, '2025-06-04', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2057, 20, '2025-06-05', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2058, 20, '2025-06-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2059, 20, '2025-06-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2060, 20, '2025-06-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2061, 20, '2025-06-09', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2062, 20, '2025-06-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2063, 20, '2025-06-11', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2064, 20, '2025-06-12', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2065, 20, '2025-06-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2066, 20, '2025-06-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2067, 20, '2025-06-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2068, 20, '2025-06-16', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2069, 20, '2025-06-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2070, 20, '2025-06-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2071, 20, '2025-06-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2072, 20, '2025-07-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2073, 20, '2025-07-13', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2074, 20, '2025-07-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2075, 20, '2025-07-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2076, 20, '2025-08-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2077, 20, '2025-08-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2078, 20, '2025-08-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2079, 20, '2025-08-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2080, 20, '2025-08-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2081, 20, '2025-09-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2082, 20, '2025-09-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2083, 20, '2025-09-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2084, 20, '2025-09-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2085, 20, '2025-09-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2086, 20, '2025-10-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2087, 20, '2025-10-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2088, 20, '2025-10-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2089, 20, '2025-10-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2090, 20, '2025-11-02', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2091, 20, '2025-11-09', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2092, 20, '2025-11-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2093, 20, '2025-11-23', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:24', '2026-06-17 04:29:24'),
(2094, 20, '2025-11-30', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2095, 20, '2025-12-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2096, 20, '2025-12-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2097, 20, '2025-12-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2098, 20, '2025-12-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Natal', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2099, 20, '2025-12-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2100, 20, '2026-01-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari tahun baru', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2101, 20, '2026-01-04', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2102, 20, '2026-01-11', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2103, 20, '2026-01-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2104, 20, '2026-01-18', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2105, 20, '2026-01-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2106, 20, '2026-02-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2107, 20, '2026-02-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2108, 20, '2026-02-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2109, 20, '2026-02-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Imlek', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2110, 20, '2026-02-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2111, 20, '2026-03-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2112, 20, '2026-03-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2113, 20, '2026-03-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2114, 20, '2026-03-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Nyepi', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2115, 20, '2026-03-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2116, 20, '2026-03-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2117, 20, '2026-03-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2118, 20, '2026-03-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2119, 20, '2026-03-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2120, 20, '2026-03-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2121, 20, '2026-04-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2122, 20, '2026-04-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2123, 20, '2026-04-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2124, 20, '2026-04-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2125, 20, '2026-05-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Buruh Internasional', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2126, 20, '2026-05-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2127, 20, '2026-05-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2128, 20, '2026-05-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Kenaikan Yesus Kristus', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2129, 20, '2026-05-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2130, 20, '2026-05-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2131, 20, '2026-05-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2132, 20, '2026-05-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2133, 20, '2026-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Lahir Pancasila', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2134, 20, '2026-06-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2135, 20, '2026-06-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2136, 20, '2026-06-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Islam', NULL, '2026-06-17 11:29:25', '2026-06-17 04:29:25'),
(2137, 13, '2025-05-05', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2138, 13, '2025-05-06', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2139, 13, '2025-05-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2140, 13, '2025-05-08', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2141, 13, '2025-05-09', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2142, 13, '2025-05-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2143, 13, '2025-05-11', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2144, 13, '2025-05-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Waisak', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2145, 13, '2025-05-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:16', '2026-06-17 04:58:16'),
(2146, 13, '2025-05-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2147, 13, '2025-05-15', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2148, 13, '2025-05-16', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2149, 13, '2025-05-17', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2150, 13, '2025-05-18', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2151, 13, '2025-05-19', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2152, 13, '2025-05-20', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2153, 13, '2025-05-21', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2154, 13, '2025-05-22', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2155, 13, '2025-05-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2156, 13, '2025-05-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2157, 13, '2025-05-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2158, 13, '2025-05-26', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2159, 13, '2025-05-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2160, 13, '2025-05-28', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2161, 13, '2025-05-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Kenaikan Yesus Kristus', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2162, 13, '2025-05-30', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2163, 13, '2025-05-31', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2164, 13, '2025-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2165, 13, '2025-06-02', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2166, 13, '2025-06-03', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2167, 13, '2025-06-04', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2168, 13, '2025-06-05', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2169, 13, '2025-06-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2170, 13, '2025-06-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2171, 13, '2025-06-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2172, 13, '2025-06-09', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2173, 13, '2025-06-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2174, 13, '2025-06-11', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2175, 13, '2025-06-12', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2176, 13, '2025-06-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2177, 13, '2025-06-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2178, 13, '2025-06-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2179, 13, '2025-06-16', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2180, 13, '2025-06-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2181, 13, '2025-06-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2182, 13, '2025-06-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2183, 13, '2025-07-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2184, 13, '2025-07-13', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2185, 13, '2025-07-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2186, 13, '2025-07-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2187, 13, '2025-08-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2188, 13, '2025-08-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2189, 13, '2025-08-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2190, 13, '2025-08-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2191, 13, '2025-08-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2192, 13, '2025-09-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2193, 13, '2025-09-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2194, 13, '2025-09-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2195, 13, '2025-09-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2196, 13, '2025-09-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:17', '2026-06-17 04:58:17'),
(2197, 13, '2025-10-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2198, 13, '2025-10-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2199, 13, '2025-10-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2200, 13, '2025-10-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2201, 13, '2025-11-02', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2202, 13, '2025-11-09', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2203, 13, '2025-11-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2204, 13, '2025-11-23', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2205, 13, '2025-11-30', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2206, 13, '2025-12-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2207, 13, '2025-12-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2208, 13, '2025-12-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2209, 13, '2025-12-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Natal', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2210, 13, '2025-12-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2211, 13, '2026-01-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari tahun baru', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2212, 13, '2026-01-04', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2213, 13, '2026-01-11', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2214, 13, '2026-01-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2215, 13, '2026-01-18', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2216, 13, '2026-01-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2217, 13, '2026-02-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2218, 13, '2026-02-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2219, 13, '2026-02-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2220, 13, '2026-02-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Imlek', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2221, 13, '2026-02-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2222, 13, '2026-03-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2223, 13, '2026-03-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2224, 13, '2026-03-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2225, 13, '2026-03-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Nyepi', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2226, 13, '2026-03-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2227, 13, '2026-03-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2228, 13, '2026-03-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2229, 13, '2026-03-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2230, 13, '2026-03-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2231, 13, '2026-03-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2232, 13, '2026-04-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2233, 13, '2026-04-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2234, 13, '2026-04-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2235, 13, '2026-04-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2236, 13, '2026-05-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Buruh Internasional', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2237, 13, '2026-05-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2238, 13, '2026-05-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2239, 13, '2026-05-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Kenaikan Yesus Kristus', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2240, 13, '2026-05-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2241, 13, '2026-05-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2242, 13, '2026-05-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2243, 13, '2026-05-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2244, 13, '2026-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Lahir Pancasila', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2245, 13, '2026-06-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2246, 13, '2026-06-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2247, 13, '2026-06-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Islam', NULL, '2026-06-17 11:58:18', '2026-06-17 04:58:18'),
(2248, 19, '2025-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2249, 19, '2025-06-02', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2250, 19, '2025-06-03', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2251, 19, '2025-06-04', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2252, 19, '2025-06-05', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2253, 19, '2025-06-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2254, 19, '2025-06-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2255, 19, '2025-06-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2256, 19, '2025-06-09', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2257, 19, '2025-06-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2258, 19, '2025-06-11', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2259, 19, '2025-06-12', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:19', '2026-06-17 04:59:19'),
(2260, 19, '2025-06-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2261, 19, '2025-06-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2262, 19, '2025-06-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2263, 19, '2025-06-16', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2264, 19, '2025-06-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2265, 19, '2025-06-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2266, 19, '2025-06-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2267, 19, '2025-07-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2268, 19, '2025-07-13', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2269, 19, '2025-07-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2270, 19, '2025-07-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2271, 19, '2025-08-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2272, 19, '2025-08-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20');
INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `is_late`, `late_minutes`, `working_hours`, `overtime_hours`, `notes`, `leave_request_id`, `created_at`, `updated_at`) VALUES
(2273, 19, '2025-08-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2274, 19, '2025-08-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2275, 19, '2025-08-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2276, 19, '2025-09-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2277, 19, '2025-09-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2278, 19, '2025-09-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2279, 19, '2025-09-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2280, 19, '2025-09-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2281, 19, '2025-10-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2282, 19, '2025-10-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2283, 19, '2025-10-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2284, 19, '2025-10-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2285, 19, '2025-11-02', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2286, 19, '2025-11-09', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2287, 19, '2025-11-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2288, 19, '2025-11-23', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2289, 19, '2025-11-30', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2290, 19, '2025-12-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2291, 19, '2025-12-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2292, 19, '2025-12-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2293, 19, '2025-12-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Natal', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2294, 19, '2025-12-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2295, 19, '2026-01-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari tahun baru', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2296, 19, '2026-01-04', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2297, 19, '2026-01-11', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2298, 19, '2026-01-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2299, 19, '2026-01-18', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2300, 19, '2026-01-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2301, 19, '2026-02-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2302, 19, '2026-02-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2303, 19, '2026-02-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2304, 19, '2026-02-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Imlek', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2305, 19, '2026-02-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2306, 19, '2026-03-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2307, 19, '2026-03-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2308, 19, '2026-03-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2309, 19, '2026-03-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Nyepi', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2310, 19, '2026-03-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2311, 19, '2026-03-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2312, 19, '2026-03-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2313, 19, '2026-03-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2314, 19, '2026-03-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2315, 19, '2026-03-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2316, 19, '2026-04-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2317, 19, '2026-04-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2318, 19, '2026-04-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2319, 19, '2026-04-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2320, 19, '2026-05-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Buruh Internasional', NULL, '2026-06-17 11:59:20', '2026-06-17 04:59:20'),
(2321, 19, '2026-05-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2322, 19, '2026-05-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2323, 19, '2026-05-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Kenaikan Yesus Kristus', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2324, 19, '2026-05-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2325, 19, '2026-05-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2326, 19, '2026-05-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2327, 19, '2026-05-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2328, 19, '2026-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Lahir Pancasila', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2329, 19, '2026-06-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2330, 19, '2026-06-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2331, 19, '2026-06-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Islam', NULL, '2026-06-17 11:59:21', '2026-06-17 04:59:21'),
(2332, 22, '2025-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:34', '2026-06-17 05:04:34'),
(2333, 22, '2025-06-02', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:34', '2026-06-17 05:04:34'),
(2334, 22, '2025-06-03', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:34', '2026-06-17 05:04:34'),
(2335, 22, '2025-06-04', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:34', '2026-06-17 05:04:34'),
(2336, 22, '2025-06-05', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2337, 22, '2025-06-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2338, 22, '2025-06-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2339, 22, '2025-06-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2340, 22, '2025-06-09', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2341, 22, '2025-06-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2342, 22, '2025-06-11', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2343, 22, '2025-06-12', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2344, 22, '2025-06-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2345, 22, '2025-06-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2346, 22, '2025-06-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2347, 22, '2025-06-16', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2348, 22, '2025-06-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2349, 22, '2025-06-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2350, 22, '2025-06-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2351, 22, '2025-07-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2352, 22, '2025-07-13', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2353, 22, '2025-07-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2354, 22, '2025-07-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2355, 22, '2025-08-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2356, 22, '2025-08-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2357, 22, '2025-08-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2358, 22, '2025-08-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2359, 22, '2025-08-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2360, 22, '2025-09-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2361, 22, '2025-09-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2362, 22, '2025-09-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2363, 22, '2025-09-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2364, 22, '2025-09-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2365, 22, '2025-10-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2366, 22, '2025-10-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2367, 22, '2025-10-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2368, 22, '2025-10-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2369, 22, '2025-11-02', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2370, 22, '2025-11-09', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2371, 22, '2025-11-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2372, 22, '2025-11-23', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2373, 22, '2025-11-30', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2374, 22, '2025-12-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2375, 22, '2025-12-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2376, 22, '2025-12-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2377, 22, '2025-12-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Natal', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2378, 22, '2025-12-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2379, 22, '2026-01-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari tahun baru', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2380, 22, '2026-01-04', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2381, 22, '2026-01-11', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2382, 22, '2026-01-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2383, 22, '2026-01-18', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2384, 22, '2026-01-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2385, 22, '2026-02-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2386, 22, '2026-02-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2387, 22, '2026-02-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2388, 22, '2026-02-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Imlek', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2389, 22, '2026-02-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2390, 22, '2026-03-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2391, 22, '2026-03-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2392, 22, '2026-03-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2393, 22, '2026-03-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Nyepi', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2394, 22, '2026-03-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2395, 22, '2026-03-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2396, 22, '2026-03-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2397, 22, '2026-03-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2398, 22, '2026-03-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2399, 22, '2026-03-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2400, 22, '2026-04-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2401, 22, '2026-04-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2402, 22, '2026-04-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2403, 22, '2026-04-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2404, 22, '2026-05-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Buruh Internasional', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2405, 22, '2026-05-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2406, 22, '2026-05-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2407, 22, '2026-05-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Kenaikan Yesus Kristus', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2408, 22, '2026-05-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2409, 22, '2026-05-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2410, 22, '2026-05-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2411, 22, '2026-05-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2412, 22, '2026-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Lahir Pancasila', NULL, '2026-06-17 12:04:35', '2026-06-17 05:04:35'),
(2413, 22, '2026-06-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:36', '2026-06-17 05:04:36'),
(2414, 22, '2026-06-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:04:36', '2026-06-17 05:04:36'),
(2415, 22, '2026-06-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Islam', NULL, '2026-06-17 12:04:36', '2026-06-17 05:04:36'),
(2416, 23, '2026-06-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Islam', NULL, '2026-06-17 12:12:40', '2026-06-17 05:12:40'),
(2417, 21, '2025-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:29', '2026-06-17 05:51:29'),
(2418, 21, '2025-06-02', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:29', '2026-06-17 05:51:29'),
(2419, 21, '2025-06-03', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:29', '2026-06-17 05:51:29'),
(2420, 21, '2025-06-04', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:29', '2026-06-17 05:51:29'),
(2421, 21, '2025-06-05', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:29', '2026-06-17 05:51:29'),
(2422, 21, '2025-06-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 12:51:29', '2026-06-17 05:51:29'),
(2423, 21, '2025-06-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2424, 21, '2025-06-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2425, 21, '2025-06-09', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2426, 21, '2025-06-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2427, 21, '2025-06-11', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2428, 21, '2025-06-12', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2429, 21, '2025-06-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2430, 21, '2025-06-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2431, 21, '2025-06-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2432, 21, '2025-06-16', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2433, 21, '2025-06-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2434, 21, '2025-06-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2435, 21, '2025-06-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2436, 21, '2025-07-06', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2437, 21, '2025-07-13', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2438, 21, '2025-07-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2439, 21, '2025-07-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2440, 21, '2025-08-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2441, 21, '2025-08-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2442, 21, '2025-08-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2443, 21, '2025-08-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2444, 21, '2025-08-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2445, 21, '2025-09-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2446, 21, '2025-09-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2447, 21, '2025-09-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2448, 21, '2025-09-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2449, 21, '2025-09-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2450, 21, '2025-10-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2451, 21, '2025-10-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2452, 21, '2025-10-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2453, 21, '2025-10-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2454, 21, '2025-11-02', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2455, 21, '2025-11-09', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2456, 21, '2025-11-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2457, 21, '2025-11-23', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2458, 21, '2025-11-30', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2459, 21, '2025-12-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2460, 21, '2025-12-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2461, 21, '2025-12-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2462, 21, '2025-12-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Natal', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2463, 21, '2025-12-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2464, 21, '2026-01-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari tahun baru', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2465, 21, '2026-01-04', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2466, 21, '2026-01-11', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2467, 21, '2026-01-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Maulid Nabi Muhammad', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2468, 21, '2026-01-18', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2469, 21, '2026-01-25', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2470, 21, '2026-02-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2471, 21, '2026-02-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2472, 21, '2026-02-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2473, 21, '2026-02-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Imlek', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2474, 21, '2026-02-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2475, 21, '2026-03-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2476, 21, '2026-03-08', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2477, 21, '2026-03-15', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2478, 21, '2026-03-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Nyepi', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2479, 21, '2026-03-20', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2480, 21, '2026-03-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Fitri', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2481, 21, '2026-03-22', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2482, 21, '2026-03-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2483, 21, '2026-03-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2484, 21, '2026-03-29', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2485, 21, '2026-04-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2486, 21, '2026-04-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2487, 21, '2026-04-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2488, 21, '2026-04-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2489, 21, '2026-05-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Buruh Internasional', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2490, 21, '2026-05-03', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2491, 21, '2026-05-10', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2492, 21, '2026-05-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Kenaikan Yesus Kristus', NULL, '2026-06-17 12:51:30', '2026-06-17 05:51:30'),
(2493, 21, '2026-05-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2494, 21, '2026-05-24', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2495, 21, '2026-05-27', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Raya Idul Adha', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2496, 21, '2026-05-31', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2497, 21, '2026-06-01', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Lahir Pancasila', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2498, 21, '2026-06-07', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2499, 21, '2026-06-14', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2500, 21, '2026-06-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Tahun Baru Islam', NULL, '2026-06-17 12:51:31', '2026-06-17 05:51:31'),
(2501, 22, '2026-06-29', NULL, NULL, 'izin', 0, 0, NULL, 0.00, 'cuti_tahunan: cuti', 2, '2026-06-17 12:56:14', '2026-06-17 05:56:14'),
(2502, 13, '2026-06-18', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-22 17:23:38', '2026-06-22 10:23:38'),
(2503, 13, '2026-06-19', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-22 17:23:38', '2026-06-22 10:23:38'),
(2504, 13, '2026-06-20', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-22 17:23:38', '2026-06-22 10:23:38'),
(2505, 13, '2026-06-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-22 17:23:38', '2026-06-22 10:23:38'),
(2506, 13, '2026-06-22', NULL, NULL, 'izin', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:04:13', '2026-06-23 09:09:40'),
(2507, 21, '2026-06-18', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:27:00', '2026-06-23 08:27:00'),
(2508, 21, '2026-06-19', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:27:00', '2026-06-23 08:27:00'),
(2509, 21, '2026-06-20', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:27:00', '2026-06-23 08:27:00'),
(2510, 21, '2026-06-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-23 15:27:00', '2026-06-23 08:27:00'),
(2511, 21, '2026-06-22', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:27:00', '2026-06-23 08:27:00'),
(2512, 20, '2026-06-18', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:28:14', '2026-06-23 08:28:14'),
(2513, 20, '2026-06-19', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:28:14', '2026-06-23 08:28:14'),
(2514, 20, '2026-06-20', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:28:14', '2026-06-23 08:28:14'),
(2515, 20, '2026-06-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-23 15:28:14', '2026-06-23 08:28:14'),
(2516, 20, '2026-06-22', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:28:14', '2026-06-23 08:28:14'),
(2517, 19, '2026-06-18', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:29:18', '2026-06-23 08:29:18'),
(2518, 19, '2026-06-19', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:29:18', '2026-06-23 08:29:18'),
(2519, 19, '2026-06-20', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:29:18', '2026-06-23 08:29:18'),
(2520, 19, '2026-06-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-23 15:29:18', '2026-06-23 08:29:18'),
(2521, 19, '2026-06-22', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:29:18', '2026-06-23 08:29:18'),
(2522, 23, '2026-06-18', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:53:31', '2026-06-23 08:53:31'),
(2523, 23, '2026-06-19', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:53:31', '2026-06-23 08:53:31'),
(2524, 23, '2026-06-20', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:53:31', '2026-06-23 08:53:31'),
(2525, 23, '2026-06-21', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-23 15:53:31', '2026-06-23 08:53:31'),
(2526, 23, '2026-06-22', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-23 15:53:31', '2026-06-23 08:53:31'),
(2527, 23, '2026-06-23', '15:54:55', NULL, 'hadir', 1, 475, NULL, 0.00, NULL, NULL, '2026-06-23 15:54:55', '2026-06-23 08:54:55'),
(2528, 13, '2026-06-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-24 11:28:36', '2026-06-24 04:28:36'),
(2529, 13, '2026-06-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-29 20:26:53', '2026-06-29 13:26:53'),
(2530, 13, '2026-06-25', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-29 20:26:53', '2026-06-29 13:26:53'),
(2531, 13, '2026-06-26', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-29 20:26:53', '2026-06-29 13:26:53'),
(2532, 13, '2026-06-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-06-29 20:26:53', '2026-06-29 13:26:53'),
(2533, 13, '2026-06-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-06-29 20:26:53', '2026-06-29 13:26:53'),
(2534, 19, '2026-06-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:50:59', '2026-08-20 09:50:59'),
(2535, 19, '2026-06-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2536, 19, '2026-06-25', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2537, 19, '2026-06-26', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2538, 19, '2026-06-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2539, 19, '2026-06-28', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2540, 19, '2026-06-29', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2541, 19, '2026-06-30', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2542, 19, '2026-07-01', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2543, 19, '2026-07-02', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2544, 19, '2026-07-03', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2545, 19, '2026-07-04', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2546, 19, '2026-07-05', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2547, 19, '2026-07-06', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2548, 19, '2026-07-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2549, 19, '2026-07-08', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2550, 19, '2026-07-09', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2551, 19, '2026-07-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2552, 19, '2026-07-11', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2553, 19, '2026-07-12', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2554, 19, '2026-07-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2555, 19, '2026-07-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2556, 19, '2026-07-15', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2557, 19, '2026-07-16', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2558, 19, '2026-07-17', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2559, 19, '2026-07-18', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2560, 19, '2026-07-19', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2561, 19, '2026-07-20', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2562, 19, '2026-07-21', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2563, 19, '2026-07-22', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2564, 19, '2026-07-23', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2565, 19, '2026-07-24', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:00', '2026-08-20 09:51:00'),
(2566, 19, '2026-07-25', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2567, 19, '2026-07-26', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2568, 19, '2026-07-27', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2569, 19, '2026-07-28', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2570, 19, '2026-07-29', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2571, 19, '2026-07-30', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2572, 19, '2026-07-31', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2573, 19, '2026-08-01', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2574, 19, '2026-08-02', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2575, 19, '2026-08-03', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2576, 19, '2026-08-04', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2577, 19, '2026-08-05', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2578, 19, '2026-08-06', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2579, 19, '2026-08-07', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2580, 19, '2026-08-08', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2581, 19, '2026-08-09', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2582, 19, '2026-08-10', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2583, 19, '2026-08-11', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2584, 19, '2026-08-12', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2585, 19, '2026-08-13', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2586, 19, '2026-08-14', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2587, 19, '2026-08-15', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2588, 19, '2026-08-16', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Minggu', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2589, 19, '2026-08-17', NULL, NULL, 'libur', 0, 0, NULL, 0.00, 'Libur: Hari Ulang Tahun Kemerdekaan Republik Indonesia', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2590, 19, '2026-08-18', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01'),
(2591, 19, '2026-08-19', NULL, NULL, 'alpha', 0, 0, NULL, 0.00, 'Auto Alpha: tidak ada presensi masuk/pulang sampai batas hari kerja.', NULL, '2026-08-20 16:51:01', '2026-08-20 09:51:01');

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendance_warning_rules`
--

CREATE TABLE `attendance_warning_rules` (
  `id` int(11) NOT NULL,
  `rule_code` varchar(50) NOT NULL,
  `rule_name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `min_consecutive_alpha` int(11) NOT NULL DEFAULT 0,
  `min_consecutive_late` int(11) NOT NULL DEFAULT 0,
  `min_accumulated_alpha` int(11) NOT NULL DEFAULT 0,
  `min_accumulated_late` int(11) NOT NULL DEFAULT 0,
  `sanction_level` varchar(50) NOT NULL DEFAULT 'none',
  `sp_duration_months` int(11) NOT NULL DEFAULT 6,
  `recommendation` text DEFAULT NULL,
  `effective_date` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_by_user_id` int(11) DEFAULT NULL,
  `updated_by_user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `attendance_warning_rules`
--

INSERT INTO `attendance_warning_rules` (`id`, `rule_code`, `rule_name`, `description`, `min_consecutive_alpha`, `min_consecutive_late`, `min_accumulated_alpha`, `min_accumulated_late`, `sanction_level`, `sp_duration_months`, `recommendation`, `effective_date`, `is_active`, `notes`, `created_by_user_id`, `updated_by_user_id`, `created_at`, `updated_at`) VALUES
(1, 'AWR-2026-001', 'Pelanggaran alpha berulang - SP1', 'Aturan awal untuk pegawai yang mulai menunjukkan pola alpha berulang.', 3, 3, 3, 4, 'sp1', 3, 'Berikan surat peringatan pertama dan monitoring kehadiran harian.', '2026-05-19', 1, 'Digunakan sebagai baseline peringatan kehadiran.', NULL, NULL, '2026-05-18 17:23:11', '2026-05-20 16:35:52'),
(2, 'AWR-2026-002', 'Pelanggaran alpha berulang - SP2', 'Aturan untuk pegawai yang sudah melewati batas SP1.', 5, 5, 5, 6, 'sp2', 6, 'Naikkan ke SP2 dan lakukan pendampingan langsung dari atasan.', '2026-05-19', 1, 'Disesuaikan dengan kebijakan unit kerja.', NULL, NULL, '2026-05-18 17:23:11', '2026-05-18 17:23:11'),
(3, 'AWR-2026-003', 'Pelanggaran alpha berulang - SP3', 'Aturan untuk pegawai dengan tingkat alpha tinggi dan berkelanjutan.', 6, 7, 6, 8, 'sp3', 6, 'Naikkan ke SP3 dan lakukan tindakan disiplin lanjutan sesuai kebijakan perusahaan.', '2026-05-19', 1, 'Menjadi batas eskalasi tertinggi pada aturan ini.', NULL, NULL, '2026-05-18 17:23:11', '2026-05-18 17:23:11'),
(4, 'AWR-2026-004', 'Tindakan Lanjutan', 'Escalation: pegawai yang melewati ambang SP3 atau menunjukkan pola serius perlu evaluasi HR atau tindakan lanjutan.', 7, 8, 7, 10, 'tindak_lanjut', 12, 'Jadwalkan evaluasi HR; pertimbangkan tindakan lanjutan sesuai kebijakan perusahaan.', '2026-05-19', 1, 'Eskalasi setelah SP3.', NULL, NULL, '2026-05-18 18:51:20', '2026-05-20 16:36:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `candidates`
--

CREATE TABLE `candidates` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `birth_place` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `marital_status` enum('single','married','divorced','widowed') DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Indonesian',
  `address` text DEFAULT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `npwp` varchar(20) DEFAULT NULL,
  `education_level` varchar(50) DEFAULT NULL,
  `university` varchar(150) DEFAULT NULL,
  `major` varchar(150) DEFAULT NULL,
  `graduation_year` year(4) DEFAULT NULL,
  `gpa` decimal(5,2) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `expected_salary` decimal(12,2) DEFAULT NULL,
  `application_count` int(11) DEFAULT 0,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `candidates`
--

INSERT INTO `candidates` (`id`, `user_id`, `name`, `email`, `phone`, `gender`, `birth_place`, `date_of_birth`, `marital_status`, `nationality`, `address`, `nik`, `npwp`, `education_level`, `university`, `major`, `graduation_year`, `gpa`, `linkedin`, `portfolio`, `expected_salary`, `application_count`, `last_login`, `created_at`, `updated_at`, `deleted_at`, `deleted_by`) VALUES
(1, 32, 'Surya', 'surya@gmail.com', '08123401890', 'male', 'surabaya', '1996-02-06', '', 'Indonesian', 'rungkut surabaya', '8973218993788671', '', 'S1', 'upn', 'sifo', '2013', NULL, '', '', 5000000.00, 1, NULL, '2026-06-15 12:47:17', '2026-06-23 08:17:29', NULL, NULL),
(2, 33, 'Teddy', 'teddy@gmail.com', '081927283737', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, NULL, '2026-06-15 12:51:07', '2026-06-25 12:56:54', NULL, NULL),
(3, 34, 'denis', 'denis@gmail.com', '08918292937', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-15 13:11:59', '2026-06-15 13:11:59', NULL, NULL),
(4, 35, 'Bayu', 'bayu@gmail.com', '0827293728', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-15 13:19:03', '2026-06-15 13:19:03', NULL, NULL),
(5, NULL, 'devina', 'devina@gmail.com', '08123456789', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-22 10:26:31', '2026-06-22 10:26:31', NULL, NULL),
(6, 40, 'devina', 'devina@gmail.com', '08123456789', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-06-22 10:54:53', '2026-06-22 10:54:53', NULL, NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `candidate_calls`
--

CREATE TABLE `candidate_calls` (
  `id` int(11) NOT NULL,
  `candidate_id` int(11) NOT NULL,
  `call_date` date DEFAULT NULL,
  `call_time` time DEFAULT NULL,
  `call_location` varchar(255) DEFAULT NULL,
  `call_notes` text DEFAULT NULL,
  `invitation_letter_file` varchar(255) DEFAULT NULL,
  `status` enum('draft','sent','confirmed','attended','cancelled') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `candidate_calls`
--

INSERT INTO `candidate_calls` (`id`, `candidate_id`, `call_date`, `call_time`, `call_location`, `call_notes`, `invitation_letter_file`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-06-18', '08:00:00', 'pt otak kanan', NULL, 'uploads/invitation_letters/undangan_1_1781677600947.pdf', 'sent', '2026-06-17 06:26:40', '2026-06-17 06:26:40');

-- --------------------------------------------------------

--
-- Struktur dari tabel `departments`
--

CREATE TABLE `departments` (
  `id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `departments`
--

INSERT INTO `departments` (`id`, `code`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, '01', 'Operations', NULL, 'active', '2026-01-11 13:35:36', '2026-01-12 04:01:41'),
(2, '02', 'Marketing and Sales', NULL, 'active', '2026-01-11 13:36:15', '2026-01-12 04:02:36'),
(3, '03', 'Finance, Accounting and Tax', NULL, 'active', '2026-01-11 13:36:50', '2026-01-12 04:02:45'),
(4, '04', 'Human Resources and General Affair', NULL, 'active', '2026-01-11 13:37:33', '2026-01-12 04:02:54'),
(5, '05', 'Management', NULL, 'active', '2026-01-12 04:04:24', '2026-01-12 04:04:24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `employee_code` varchar(30) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `birth_place` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `marital_status` enum('single','married','divorced','widowed') DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Indonesian',
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `npwp` varchar(20) DEFAULT NULL,
  `bank_account` varchar(30) DEFAULT NULL,
  `bpjs_number` varchar(20) DEFAULT NULL,
  `account_holder_name` varchar(150) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `ktp_document` varchar(255) DEFAULT NULL,
  `diploma_document` varchar(255) DEFAULT NULL,
  `employment_contract_document` varchar(255) DEFAULT NULL,
  `position_id` int(11) NOT NULL,
  `join_date` date DEFAULT NULL,
  `basic_salary` decimal(12,2) DEFAULT NULL,
  `employment_status` enum('permanent','contract','intern') DEFAULT 'permanent',
  `working_hours_id` int(11) DEFAULT 1,
  `annual_leave_quota` int(11) DEFAULT 12,
  `remaining_leave_quota` int(11) DEFAULT 12,
  `alpha_consecutive_days` int(11) NOT NULL DEFAULT 0,
  `alpha_accumulated_days` int(11) NOT NULL DEFAULT 0,
  `alpha_sanction_level` varchar(50) NOT NULL DEFAULT 'none',
  `alpha_last_evaluated_at` datetime DEFAULT NULL,
  `quota_reset_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `employees`
--

INSERT INTO `employees` (`id`, `user_id`, `employee_code`, `full_name`, `gender`, `birth_place`, `date_of_birth`, `marital_status`, `nationality`, `address`, `phone`, `email`, `nik`, `npwp`, `bank_account`, `bpjs_number`, `account_holder_name`, `bank_name`, `ktp_document`, `diploma_document`, `employment_contract_document`, `position_id`, `join_date`, `basic_salary`, `employment_status`, `working_hours_id`, `annual_leave_quota`, `remaining_leave_quota`, `alpha_consecutive_days`, `alpha_accumulated_days`, `alpha_sanction_level`, `alpha_last_evaluated_at`, `quota_reset_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(13, 13, 'EMP009', 'Hanim Rachma', 'female', 'Bandung', '2002-02-18', 'single', 'Indonesian', 'UPN \"VETERAN\" JATIM', '081234567890', 'hanimrachma@gmail.com', '9012890481404890', '9218041809481098', '928490284', '2019840928190', 'Hanim Rachma', 'BNI', 'uploads/employee_documents/ktp_document-1781520001853-669344249.jpg', 'uploads/employee_documents/diploma_document-1781520001854-406326704.pdf', NULL, 2, '2025-05-05', 15000000.00, 'permanent', 1, 12, 12, 5, 10, 'tindak_lanjut', '2026-06-29 20:26:53', NULL, '2025-05-05 15:28:56', '2026-06-29 20:26:53', NULL),
(19, 27, 'EMP010', 'Izzah', 'female', 'Bojonegoro', '2003-03-30', 'married', 'Indonesian', 'UPN \"VETERAN\" JATIM', '0932813918', 'izzah@gmail.com', '9210380938201989', '1983201388888888', '928490284', '1234567890123', 'Izzah', 'BNI', 'uploads/employee_documents/ktp_document-1781521315536-519669327.jpg', 'uploads/employee_documents/diploma_document-1781521315538-73940635.pdf', 'uploads/employee_documents/employment_contract_document-1781521315539-784148022.pdf', 12, '2025-06-01', 8500000.00, 'permanent', 1, 12, 12, 53, 55, 'tindak_lanjut', '2026-08-20 16:51:01', NULL, '2025-06-01 18:01:55', '2026-08-20 16:51:01', NULL),
(20, 28, 'EMP011', 'Risma Paramesti', 'female', 'Sidoarjo', '2001-10-10', 'married', 'Indonesian', 'UPN \"VETERAN\" JATIM', '-', 'rismaparamesti98@gmail.com', '1203819038190888', '8021938122381983', '21092', '2093189028390', 'Risma Paramesti', 'BNI', NULL, NULL, 'uploads/employee_documents/employment_contract_document-1781521632973-830348499.pdf', 10, '2025-06-01', 9000000.00, 'permanent', 1, 12, 12, 4, 6, 'sp3', '2026-06-23 15:28:14', NULL, '2025-06-01 18:07:12', '2026-06-23 15:28:14', NULL),
(21, 29, 'EMP012', 'Shafira', 'female', 'Jember', '2004-04-04', 'single', 'Indonesian', 'UPN \"VETERAN\" JATIM', '0809808807', 'rrachmashafira@gmail.com', '2914773109845268', '9074192747248641', '09840982', '9073140971757', 'Reihan Rachma', 'BNI', NULL, NULL, NULL, 3, '2025-06-01', 10000000.00, 'permanent', 1, 12, 12, 4, 6, 'sp3', '2026-06-23 15:27:00', NULL, '2025-06-01 18:10:22', '2026-06-23 15:27:00', NULL),
(22, 30, 'EMP013', 'Ratih', 'female', 'Malang', '2006-06-06', 'single', 'Indonesian', 'UPN \"VETERAN\" JATIM', '92138091890', 'ratih@gmail.com', '0218309183907401', '9830181932801380', '84217914', '8410923810928', 'Ratih', 'BNI', NULL, NULL, NULL, 6, '2025-06-01', 5000000.00, 'permanent', 1, 12, 11, 0, 3, 'sp1', '2026-06-17 13:12:13', NULL, '2025-06-01 18:15:51', '2026-06-17 13:12:13', NULL),
(23, 31, 'EMP014', 'Fina', 'female', 'Surabaya', '2000-01-07', 'single', 'Indonesian', 'UPN \"VETERAN\" JATIM', '9089280948', 'fina@gmail.com', '2190830183091849', '0918983091893108', '210983091', '820414749017', 'Fina', 'BNI', NULL, NULL, NULL, 5, '2026-06-15', 7000000.00, 'permanent', 1, 12, 12, 0, 4, 'sp1', '2026-06-23 16:05:55', NULL, '2026-06-15 18:22:53', '2026-06-23 16:05:55', NULL),
(24, NULL, 'EMP015', 'andi', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, 'andi@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, '2026-04-20', 5000000.00, 'permanent', 1, 12, 12, 0, 0, 'none', NULL, NULL, '2026-06-22 17:24:45', '2026-06-22 17:24:45', NULL),
(25, NULL, 'EMP016', 'andi', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, 'andi@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, '2026-04-20', 5000000.00, 'permanent', 1, 12, 12, 0, 0, 'none', NULL, NULL, '2026-06-22 17:52:01', '2026-06-22 17:52:01', NULL),
(26, 39, 'EMP017', 'andi', NULL, NULL, NULL, NULL, 'Indonesian', NULL, NULL, 'andi@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, '2026-04-20', 5000000.00, 'permanent', 1, 12, 12, 0, 0, 'none', NULL, NULL, '2026-06-22 17:53:06', '2026-06-22 17:53:06', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `interviews`
--

CREATE TABLE `interviews` (
  `id` int(11) NOT NULL,
  `candidate_id` int(11) DEFAULT NULL,
  `application_id` int(11) NOT NULL,
  `scheduled_date` datetime NOT NULL,
  `duration_minutes` int(11) DEFAULT 60,
  `interview_type` enum('online','offline') DEFAULT NULL,
  `meeting_link` varchar(500) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `interviewer_id` int(11) DEFAULT NULL,
  `rating` tinyint(4) DEFAULT NULL,
  `recommendation` enum('hire','consider','reject') DEFAULT NULL,
  `interviewer_notes` text DEFAULT NULL,
  `result` enum('pending','passed','failed','no_show','disqualified') DEFAULT NULL,
  `status` enum('scheduled','completed','canceled','rescheduled','canceled_by_company') DEFAULT 'scheduled',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `interviews`
--

INSERT INTO `interviews` (`id`, `candidate_id`, `application_id`, `scheduled_date`, `duration_minutes`, `interview_type`, `meeting_link`, `location`, `interviewer_id`, `rating`, `recommendation`, `interviewer_notes`, `result`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '2026-06-18 13:24:00', 60, 'online', '', '', 19, 87, 'hire', '[ASSESSMENT_CRITERIA]\n{\"criteria\":[{\"criterion\":\"komunikasi\",\"weight_percentage\":30,\"maximum_score\":100,\"achieved_score\":100},{\"criterion\":\"skill\",\"weight_percentage\":40,\"maximum_score\":100,\"achieved_score\":90},{\"criterion\":\"kesopanan\",\"weight_percentage\":30,\"maximum_score\":100,\"achieved_score\":69}],\"total_score\":86.7,\"maximum_score\":100,\"total_weight\":100,\"percentage\":86.7,\"rating\":86.7}\n[/ASSESSMENT_CRITERIA]', 'passed', 'completed', '2026-06-17 06:24:31', '2026-06-17 06:24:59');

-- --------------------------------------------------------

--
-- Struktur dari tabel `job_openings`
--

CREATE TABLE `job_openings` (
  `id` int(11) NOT NULL,
  `position_id` int(11) NOT NULL,
  `base_position` varchar(64) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `requirements` text DEFAULT NULL,
  `assessment_criteria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`assessment_criteria`)),
  `responsibilities` text DEFAULT NULL,
  `quota` int(11) DEFAULT 1,
  `employment_type` enum('permanent','contract','intern') DEFAULT 'permanent',
  `salary_range_min` decimal(15,2) DEFAULT NULL,
  `salary_range_max` decimal(15,2) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `status` enum('open','closed','draft') DEFAULT 'open',
  `hiring_status` enum('ongoing','shortlisting','interview','offering','completed','canceled') DEFAULT 'ongoing',
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `job_openings`
--

INSERT INTO `job_openings` (`id`, `position_id`, `base_position`, `title`, `description`, `requirements`, `assessment_criteria`, `responsibilities`, `quota`, `employment_type`, `salary_range_min`, `salary_range_max`, `location`, `deadline`, `status`, `hiring_status`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 5, 'Fullstack Web Developer', 'Project Manager', 'Bekerja pada posisi fullstack web developer', 'Dapat mengoperasikan visual studio code', '[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"40\"},{\"criterion\":\"kesopanan\",\"score\":\"30\"}]', 'Mengelola projek yang ditugaskan untuk membangun website', 1, 'permanent', 3000000.00, 5000000.00, 'Surabaya', '2026-06-25', 'closed', 'completed', 19, '2026-06-15 12:33:03', '2026-06-17 06:25:21', NULL),
(2, 13, '', 'Staff GA', 'mengelola sdm', 'sabar', '[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"70\"}]', 'mengelola sdm', 1, 'permanent', 3000000.00, 7000000.00, 'Surabaya', '2026-06-27', 'closed', 'ongoing', 19, '2026-06-17 06:28:08', '2026-06-29 14:21:28', NULL),
(3, 5, 'UI/UX Designer', 'Staff Project Manager ', 'membuat ui ux', 'teliti', '[{\"criterion\":\"komunikasi\",\"score\":\"30\"},{\"criterion\":\"skill\",\"score\":\"70\"}]', 'membuat ui ux dalam tim', 1, 'permanent', 2000000.00, 4000000.00, 'Surabaya', '2026-06-30', 'closed', 'ongoing', 19, '2026-06-17 06:29:20', '2026-08-20 09:51:28', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `leave_requests`
--

CREATE TABLE `leave_requests` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `leave_type` enum('cuti_tahunan','cuti_sakit','cuti_melahirkan','cuti_keguguran','cuti_menikah','cuti_khusus','izin_sakit','izin_pribadi','izin_terlambat','izin_lainnya','cuti_lainnya') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_days` int(11) NOT NULL,
  `time` varchar(10) DEFAULT NULL,
  `cuti_khusus_option` varchar(100) DEFAULT NULL,
  `reason` text NOT NULL,
  `bukti` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `leave_requests`
--

INSERT INTO `leave_requests` (`id`, `employee_id`, `leave_type`, `start_date`, `end_date`, `total_days`, `time`, `cuti_khusus_option`, `reason`, `bukti`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 22, 'izin_pribadi', '2026-06-25', '2026-06-25', 1, NULL, NULL, 'mengantar adik wisuda', NULL, 'pending', NULL, NULL, '2026-06-17 12:54:23', '2026-06-17 12:54:23'),
(2, 22, 'cuti_tahunan', '2026-06-29', '2026-06-29', 1, NULL, NULL, 'cuti', NULL, 'approved', 21, '2026-06-17 12:56:14', '2026-06-17 12:55:03', '2026-06-17 12:56:14'),
(3, 23, 'izin_pribadi', '2026-07-29', '2026-07-29', 1, NULL, NULL, 'kontrol kesehatan', 'uploads/izin/leave-1782206587082-427152412.pdf', 'pending', NULL, NULL, '2026-06-23 16:23:07', '2026-06-23 16:23:07');

-- --------------------------------------------------------

--
-- Struktur dari tabel `leave_request_settings`
--

CREATE TABLE `leave_request_settings` (
  `id` int(11) NOT NULL,
  `leave_type` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `min_tenure_months` int(11) DEFAULT 0,
  `min_days` int(11) DEFAULT 1,
  `max_days` int(11) DEFAULT NULL,
  `require_bukti` tinyint(1) DEFAULT 0,
  `require_bukti_if_days_gt` int(11) DEFAULT NULL,
  `attendance_status` enum('izin','sakit') DEFAULT 'izin',
  `meta` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`meta`)),
  `deduct_quota` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `leave_request_settings`
--

INSERT INTO `leave_request_settings` (`id`, `leave_type`, `label`, `min_tenure_months`, `min_days`, `max_days`, `require_bukti`, `require_bukti_if_days_gt`, `attendance_status`, `meta`, `deduct_quota`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'cuti_tahunan', 'Cuti Tahunan', 12, 1, 12, 0, NULL, 'izin', '{\"paid\": 1}', 1, 1, '2026-05-09 18:09:38', '2026-05-09 18:59:04'),
(2, 'cuti_sakit', 'Cuti Sakit', 0, 1, NULL, 1, NULL, 'sakit', '{\"payment_schedule\": [{\"months\": 4, \"percent\": 100}, {\"months\": 4, \"percent\": 75}, {\"months\": 4, \"percent\": 50}, {\"months\": null, \"percent\": 25}], \"paid\": 1}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:38:54'),
(3, 'cuti_melahirkan', 'Cuti Melahirkan', 0, 1, 90, 1, NULL, 'izin', '{\"pre_days\": 45, \"post_days\": 45, \"total_days\": 90, \"paid\": 1}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:09:38'),
(4, 'cuti_keguguran', 'Cuti Keguguran', 0, 1, 45, 1, NULL, 'izin', '{\"paid\": 1}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:38:54'),
(5, 'cuti_menikah', 'Cuti Menikah', 0, 1, 3, 0, NULL, 'izin', '{\"paid\": 1}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:38:54'),
(6, 'cuti_khusus', 'Cuti Penting (Cuti Khusus)', 0, 1, 2, 0, NULL, 'izin', '{\"options\": [{\"key\": \"menikahkan_anak\", \"label\": \"Menikahkan anak\", \"days\": 2}, {\"key\": \"istri_melahirkan\", \"label\": \"Istri melahirkan/keguguran\", \"days\": 2}, {\"key\": \"pasangan_orangtua_anak_meninggal\", \"label\": \"Suami/istri/anak/orang tua meninggal\", \"days\": 2}, {\"key\": \"anggota_keluarga_serumah_meninggal\", \"label\": \"Anggota keluarga serumah meninggal\", \"days\": 1}], \"paid\": 1}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:38:54'),
(7, 'cuti_lainnya', 'Cuti Lainnya (Unpaid)', 0, 1, NULL, 0, NULL, 'izin', '{\"paid\": 0}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:09:38'),
(8, 'izin_sakit', 'Izin Sakit (singkat)', 0, 1, 20, 1, NULL, 'sakit', '{\"paid\": 1}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:58:50'),
(9, 'izin_pribadi', 'Izin Keperluan Pribadi', 0, 1, 2, 0, NULL, 'izin', '{\"monthly_limit\": 2, \"paid\": 0}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:09:38'),
(10, 'izin_terlambat', 'Izin Terlambat / Pulang Cepat', 0, 1, 1, 0, NULL, 'izin', '{\"allow_time_input\": 1}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:09:38'),
(11, 'izin_lainnya', 'Izin Lainnya', 0, 1, NULL, 0, NULL, 'izin', '{\"paid\": 0}', 0, 1, '2026-05-09 18:09:38', '2026-05-09 18:40:26');

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `otp_code`, `email`, `expires_at`, `used_at`, `created_at`) VALUES
(1, 28, '441997', 'rismaparamesti98@gmail.com', '2026-06-17 13:40:57', '2026-06-17 13:31:41', '2026-06-17 13:30:57'),
(2, 28, '551763', 'rismaparamesti98@gmail.com', '2026-06-23 15:21:53', '2026-06-23 15:12:51', '2026-06-23 15:11:53');

-- --------------------------------------------------------

--
-- Struktur dari tabel `payrolls`
--

CREATE TABLE `payrolls` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `period_month` tinyint(4) NOT NULL,
  `period_year` year(4) NOT NULL,
  `basic_salary` decimal(12,2) NOT NULL,
  `allowance` decimal(12,2) DEFAULT 0.00,
  `transport_allowance` decimal(12,2) DEFAULT 0.00,
  `meal_allowance` decimal(12,2) DEFAULT 0.00,
  `health_allowance` decimal(12,2) DEFAULT 0.00,
  `bonus` decimal(12,2) DEFAULT 0.00,
  `other_allowance` decimal(12,2) DEFAULT 0.00,
  `gross_salary` decimal(12,2) DEFAULT 0.00,
  `total_income` decimal(12,2) DEFAULT 0.00,
  `reimbursement_total` decimal(12,2) DEFAULT 0.00,
  `deduction` decimal(12,2) DEFAULT 0.00,
  `late_deduction` decimal(12,2) DEFAULT 0.00,
  `absent_deduction` decimal(12,2) DEFAULT 0.00,
  `bpjs_deduction` decimal(12,2) DEFAULT 0.00,
  `tax_deduction` decimal(12,2) DEFAULT 0.00,
  `other_deduction` decimal(12,2) DEFAULT 0.00,
  `total_late_days` int(11) DEFAULT 0,
  `total_absent_days` int(11) DEFAULT 0,
  `total_sakit_days` int(11) DEFAULT 0,
  `total_izin_days` int(11) DEFAULT 0,
  `present_days` int(11) DEFAULT 0,
  `net_salary` decimal(12,2) NOT NULL,
  `status` enum('draft','published','claimed') DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `claimed_at` datetime DEFAULT NULL,
  `transferred_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL,
  `appeal_status` enum('none','pending','approved','rejected') NOT NULL DEFAULT 'none',
  `final_amount` decimal(12,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `payrolls`
--

INSERT INTO `payrolls` (`id`, `employee_id`, `period_month`, `period_year`, `basic_salary`, `allowance`, `transport_allowance`, `meal_allowance`, `health_allowance`, `bonus`, `other_allowance`, `gross_salary`, `total_income`, `reimbursement_total`, `deduction`, `late_deduction`, `absent_deduction`, `bpjs_deduction`, `tax_deduction`, `other_deduction`, `total_late_days`, `total_absent_days`, `total_sakit_days`, `total_izin_days`, `present_days`, `net_salary`, `status`, `published_at`, `claimed_at`, `transferred_at`, `created_at`, `updated_at`, `deleted_at`, `appeal_status`, `final_amount`) VALUES
(1, 21, 1, '2026', 10000000.00, 4475000.00, 1250000.00, 625000.00, 100000.00, 0.00, 2500000.00, 14475000.00, 14475000.00, 0.00, 400000.00, 0.00, 0.00, 100000.00, 300000.00, 0.00, 0, 0, 0, 0, 25, 14075000.00, 'published', '2026-06-17 13:04:30', NULL, NULL, '2026-06-17 13:03:18', '2026-06-17 13:04:30', NULL, 'none', NULL),
(2, 22, 1, '2026', 5000000.00, 2675000.00, 1250000.00, 625000.00, 50000.00, 0.00, 750000.00, 7675000.00, 7675000.00, 0.00, 200000.00, 0.00, 0.00, 50000.00, 150000.00, 0.00, 0, 0, 0, 0, 25, 7475000.00, 'published', '2026-06-17 13:04:30', NULL, NULL, '2026-06-17 13:03:50', '2026-06-17 13:04:30', NULL, 'none', NULL),
(3, 20, 1, '2026', 9000000.00, 4165000.00, 1250000.00, 625000.00, 90000.00, 0.00, 2200000.00, 13165000.00, 13165000.00, 0.00, 360000.00, 0.00, 0.00, 90000.00, 270000.00, 0.00, 0, 0, 0, 0, 25, 12805000.00, 'published', '2026-06-17 13:04:30', NULL, NULL, '2026-06-17 13:04:04', '2026-06-17 13:04:30', NULL, 'none', NULL),
(4, 19, 1, '2026', 8500000.00, 3960000.00, 1250000.00, 625000.00, 85000.00, 0.00, 2000000.00, 12460000.00, 12460000.00, 0.00, 340000.00, 0.00, 0.00, 85000.00, 255000.00, 0.00, 0, 0, 0, 0, 25, 12120000.00, 'published', '2026-06-17 13:04:30', NULL, NULL, '2026-06-17 13:04:13', '2026-06-17 13:04:30', NULL, 'none', NULL),
(5, 13, 1, '2026', 15000000.00, 6025000.00, 1250000.00, 625000.00, 150000.00, 0.00, 4000000.00, 21025000.00, 21025000.00, 0.00, 600000.00, 0.00, 0.00, 150000.00, 450000.00, 0.00, 0, 0, 0, 0, 25, 20425000.00, 'published', '2026-06-17 13:04:30', NULL, NULL, '2026-06-17 13:04:21', '2026-06-17 13:04:30', NULL, 'none', NULL),
(6, 13, 2, '2026', 15000000.00, 5875000.00, 1150000.00, 575000.00, 150000.00, 0.00, 4000000.00, 20875000.00, 20875000.00, 0.00, 600000.00, 0.00, 0.00, 150000.00, 450000.00, 0.00, 0, 0, 0, 0, 23, 20275000.00, 'published', '2026-06-17 13:05:24', NULL, NULL, '2026-06-17 13:04:43', '2026-06-17 13:05:24', NULL, 'none', NULL),
(7, 19, 2, '2026', 8500000.00, 3810000.00, 1150000.00, 575000.00, 85000.00, 0.00, 2000000.00, 12310000.00, 12310000.00, 0.00, 340000.00, 0.00, 0.00, 85000.00, 255000.00, 0.00, 0, 0, 0, 0, 23, 11970000.00, 'published', '2026-06-17 13:05:24', NULL, NULL, '2026-06-17 13:04:51', '2026-06-17 13:05:24', NULL, 'none', NULL),
(8, 20, 2, '2026', 9000000.00, 4115000.00, 1150000.00, 575000.00, 190000.00, 0.00, 2200000.00, 13115000.00, 13115000.00, 0.00, 360000.00, 0.00, 0.00, 90000.00, 270000.00, 0.00, 0, 0, 0, 0, 23, 12755000.00, 'published', '2026-06-17 13:15:06', NULL, NULL, '2026-06-17 13:04:58', '2026-06-17 13:15:06', NULL, 'approved', 12755000.00),
(9, 21, 2, '2026', 10000000.00, 4325000.00, 1150000.00, 575000.00, 100000.00, 0.00, 2500000.00, 14325000.00, 14325000.00, 0.00, 400000.00, 0.00, 0.00, 100000.00, 300000.00, 0.00, 0, 0, 0, 0, 23, 13925000.00, 'published', '2026-06-17 13:05:24', NULL, NULL, '2026-06-17 13:05:07', '2026-06-17 13:05:24', NULL, 'none', NULL),
(10, 22, 2, '2026', 5000000.00, 2525000.00, 1150000.00, 575000.00, 50000.00, 0.00, 750000.00, 7525000.00, 7525000.00, 0.00, 200000.00, 0.00, 0.00, 50000.00, 150000.00, 0.00, 0, 0, 0, 0, 23, 7325000.00, 'published', '2026-06-17 13:05:24', NULL, NULL, '2026-06-17 13:05:14', '2026-06-17 13:12:43', NULL, 'pending', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `payroll_settings`
--

CREATE TABLE `payroll_settings` (
  `id` int(11) NOT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `transport_per_day` decimal(12,2) NOT NULL DEFAULT 50000.00,
  `meal_per_day` decimal(12,2) NOT NULL DEFAULT 25000.00,
  `health_percentage` decimal(5,4) NOT NULL DEFAULT 0.0100,
  `bpjs_percentage` decimal(5,4) NOT NULL DEFAULT 0.0100,
  `late_deduction_percentage` decimal(5,4) NOT NULL DEFAULT 0.0200,
  `alpha_deduction_percentage` decimal(5,4) NOT NULL DEFAULT 1.0000,
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `payroll_settings`
--

INSERT INTO `payroll_settings` (`id`, `tax`, `transport_per_day`, `meal_per_day`, `health_percentage`, `bpjs_percentage`, `late_deduction_percentage`, `alpha_deduction_percentage`, `updated_by`, `updated_at`, `created_at`) VALUES
(1, 0.03, 50000.00, 25000.00, 0.0100, 0.0100, 0.0200, 1.0000, 28, '2026-06-17 06:02:57', '2026-06-17 06:02:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `positions`
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
-- Dumping data untuk tabel `positions`
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

-- --------------------------------------------------------

--
-- Struktur dari tabel `reimbursements`
--

CREATE TABLE `reimbursements` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `reimbursement_type` enum('transport','makan','kesehatan','operasional','lainnya') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` text NOT NULL,
  `attachment` varchar(255) NOT NULL,
  `status` enum('pending','approved','included_in_payroll','rejected') DEFAULT 'pending',
  `payroll_id` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `reimbursements`
--

INSERT INTO `reimbursements` (`id`, `employee_id`, `reimbursement_type`, `amount`, `description`, `attachment`, `status`, `payroll_id`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 23, 'transport', 200000.00, 'dinas luar kota', 'uploads/reimbursements/reimbursement-1781675226232-214153164.pdf', 'pending', NULL, NULL, NULL, '2026-06-17 12:47:06', '2026-06-17 12:47:06'),
(2, 22, 'operasional', 150000.00, 'map klien', 'uploads/reimbursements/reimbursement-1781675404633-805475546.pdf', 'approved', NULL, 21, '2026-06-17 12:52:56', '2026-06-17 12:50:04', '2026-06-17 12:52:56');

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'hr'),
(3, 'finance'),
(4, 'pegawai'),
(5, 'atasan'),
(6, 'kandidat');

-- --------------------------------------------------------

--
-- Struktur dari tabel `salary_appeals`
--

CREATE TABLE `salary_appeals` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `payroll_id` int(11) NOT NULL,
  `reason` text NOT NULL,
  `expected_amount` decimal(12,2) DEFAULT NULL,
  `supporting_documents` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `reviewed_by` int(11) DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `salary_appeals`
--

INSERT INTO `salary_appeals` (`id`, `employee_id`, `payroll_id`, `reason`, `expected_amount`, `supporting_documents`, `status`, `reviewed_by`, `review_notes`, `reviewed_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 20, 8, '[appeal_option:health_allowance] kurang', 100000.00, 'uploads/banding_gaji/appeal-1781676419364-154764510.pdf', 'approved', 19, '[Pendapatan - Tunjangan Kesehatan] disetujui, nominal perbaikan: 100000', '2026-06-17 13:11:14', '2026-06-17 13:06:59', '2026-06-17 13:11:14', NULL),
(2, 22, 10, '[appeal_option:transport_allowance] kurang 50 ribu', NULL, 'uploads/banding_gaji/appeal-1781676763413-622764328.pdf', 'pending', NULL, NULL, NULL, '2026-06-17 13:12:43', '2026-06-17 13:12:43', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `photo` varchar(100) NOT NULL,
  `status` enum('active','inactive','pending') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `username`, `password`, `phone`, `photo`, `status`, `created_at`, `updated_at`) VALUES
(13, 'Hanim Rachma', 'hanimrachma@gmail.com', 'hanim', '$2b$10$.UJYeTEQR9aCKikWEggAdeEfBCXwyJ/pCe5aH7fGSES9bwtVgUIk6', '081234567890', 'uploads/profile_photos/photo-1781520001850-702374176.jpeg', 'active', '2026-02-27 08:28:56', '2026-06-23 08:15:07'),
(27, 'Izzah', 'izzah@gmail.com', 'izzah', '$2b$10$KjZlQzTi8FObOJ4hZmtDZ.UUBDTbFIVVPRqolkk6bi4B80uTtbgAK', '0932813918', 'uploads/profile_photos/photo-1781676693963-415082937.jpeg', 'active', '2026-06-15 11:01:55', '2026-06-17 06:11:33'),
(28, 'Risma Paramesti', 'rismaparamesti98@gmail.com', 'risma', '$2b$10$F0e6NgYQs1adJnSjvHxwD.694GmzygzFUIprEmQn6Mb68PscwsE7m', '-', 'uploads/profile_photos/photo-1781675833693-278944731.jpeg', 'active', '2026-06-15 11:07:12', '2026-06-23 08:12:51'),
(29, 'Shafira', 'rrachmashafira@gmail.com', 'shafira', '$2b$10$XMj37flpSAdUbFsHxXssz.O.HrsHHgmvKU5TYULSqnI.qA52i7Gv2', '0809808807', 'uploads/profile_photos/photo-1781675506352-681075994.jpeg', 'active', '2026-06-15 11:10:22', '2026-06-17 05:51:46'),
(30, 'Ratih', 'ratih@gmail.com', 'ratih', '$2b$10$boFePizlOGwTWof8MK41te1s1sqC1CP6qAJOP8ip1rZ13nkNvGiau', '92138091890', 'uploads/profile_photos/photo-1781675419265-907680758.jpeg', 'active', '2026-06-15 11:15:51', '2026-06-17 05:50:19'),
(31, 'Fina', 'fina@gmail.com', 'fina', '$2b$10$tsrRXfKG8LwYrsAzBC.j2emPV21PVhbwHEPCXir9sD9ie3qE2HsK2', '9089280948', 'uploads/profile_photos/photo-1781674465237-388101692.jpg', 'active', '2026-06-15 11:22:53', '2026-06-17 05:34:25'),
(32, 'Surya', 'surya@gmail.com', 'surya', '$2b$10$i7NtqBrsnJ.OD3HGEhpR3eAmochWWZfCb.lILTqqkUCLV3vGXpBmq', '08123401890', 'uploads/candidate_documents/surya/profile_photo/profile.jpeg', 'active', '2026-06-15 12:47:17', '2026-06-23 08:18:33'),
(33, 'Teddy', 'teddy@gmail.com', 'teddy', '$2b$10$rwhWDdHElnsVULxvX8pI6.sS7clw1U.jQGe1lNNq.H6Ts.ct2KVnu', '081927283737', '-', 'active', '2026-06-15 12:51:07', '2026-06-15 12:51:07'),
(34, 'denis', 'denis@gmail.com', 'denis', '$2b$10$7ODPVwDuvUU8QhQvlXR76uuRP68iAewTCY39sXP6L6zZOZDuL5s7K', '08918292937', '-', 'active', '2026-06-15 13:11:59', '2026-06-15 13:11:59'),
(35, 'Bayu', 'bayu@gmail.com', 'bayu', '$2b$10$Bcl6oqdrXS6RcXmaLCs8Z.w4KskfPvw88BnpKJPrk6zn8wu8Q5OjC', '0827293728', '-', 'active', '2026-06-15 13:19:03', '2026-06-15 13:19:03'),
(39, 'andi', 'andi@gmail.com', 'andi', '$2b$10$vhL0kjVsoffgoi8X4pgabe5rm9HbZDXkYycmT6x.SvZOmA1hskjEq', '-', '', 'active', '2026-06-22 10:53:06', '2026-06-22 10:53:06'),
(40, 'devina', 'devina@gmail.com', 'devina', '$2b$10$cY0mS4O6rJAZD54veek64.G.IhXKZK2qNjmgb2S451Wz2boXdDPQS', '08123456789', 'https://example.com/photo.jpg', 'active', '2026-06-22 10:54:53', '2026-06-22 10:54:53');

-- --------------------------------------------------------

--
-- Struktur dari tabel `user_roles`
--

CREATE TABLE `user_roles` (
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `user_roles`
--

INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES
(13, 1),
(13, 4),
(13, 5),
(27, 2),
(27, 4),
(27, 5),
(28, 3),
(28, 4),
(28, 5),
(29, 4),
(29, 5),
(30, 4),
(31, 4),
(32, 6),
(33, 6),
(34, 6),
(35, 6),
(39, 4),
(40, 6);

-- --------------------------------------------------------

--
-- Struktur dari tabel `warning_letters`
--

CREATE TABLE `warning_letters` (
  `id` int(11) NOT NULL,
  `auto_letter_number` varchar(100) DEFAULT NULL,
  `employee_id` int(11) NOT NULL,
  `rule_id` int(11) DEFAULT NULL,
  `rule_code` varchar(100) DEFAULT NULL,
  `sp_level` varchar(50) NOT NULL,
  `violation_date` datetime DEFAULT NULL,
  `issued_date` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `evidence_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`evidence_snapshot`)),
  `generated_by` varchar(50) NOT NULL DEFAULT 'hr',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `warning_letters`
--

INSERT INTO `warning_letters` (`id`, `auto_letter_number`, `employee_id`, `rule_id`, `rule_code`, `sp_level`, `violation_date`, `issued_date`, `valid_until`, `status`, `evidence_snapshot`, `generated_by`, `created_at`, `updated_at`) VALUES
(1, 'AUTO-SP-22-20260617-1312450203', 22, 1, 'AWR-2026-001', 'sp1', '2026-06-17 00:00:00', '2026-06-17 00:00:00', '2026-12-17 00:00:00', 'active', '{\"rule_id\":1,\"rule_code\":\"AWR-2026-001\",\"rule_name\":\"Pelanggaran alpha berulang - SP1\",\"sanction_level\":\"sp1\",\"alpha_consecutive_days\":0,\"alpha_accumulated_days\":3,\"late_consecutive_days\":1,\"late_accumulated_days\":1,\"violation_date\":\"2026-06-17\",\"issued_date\":\"2026-06-17\",\"valid_until\":\"2026-12-17\"}', 'system', '2026-06-17 05:11:00', '2026-06-17 05:11:00'),
(2, 'AUTO-SP-13-20260622-166012434', 13, 1, 'AWR-2026-001', 'sp1', '2026-06-18 00:00:00', '2026-06-22 00:00:00', '2026-12-22 00:00:00', 'escalated', '{\"rule_id\":1,\"rule_code\":\"AWR-2026-001\",\"rule_name\":\"Pelanggaran alpha berulang - SP1\",\"sanction_level\":\"sp1\",\"alpha_consecutive_days\":1,\"alpha_accumulated_days\":3,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-18\",\"issued_date\":\"2026-06-22\",\"valid_until\":\"2026-12-22\"}', 'system', '2026-06-22 10:23:38', '2026-06-22 10:23:38'),
(3, 'AUTO-SP-13-20260622-1534042613', 13, 2, 'AWR-2026-002', 'sp2', '2026-06-20 00:00:00', '2026-06-22 00:00:00', '2026-12-22 00:00:00', 'escalated', '{\"rule_id\":2,\"rule_code\":\"AWR-2026-002\",\"rule_name\":\"Pelanggaran alpha berulang - SP2\",\"sanction_level\":\"sp2\",\"alpha_consecutive_days\":3,\"alpha_accumulated_days\":5,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-20\",\"issued_date\":\"2026-06-22\",\"valid_until\":\"2026-12-22\"}', 'system', '2026-06-22 10:23:38', '2026-06-23 08:04:13'),
(4, 'AUTO-SP-13-20260623-206191127', 13, 3, 'AWR-2026-003', 'sp3', '2026-06-22 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":3,\"rule_code\":\"AWR-2026-003\",\"rule_name\":\"Pelanggaran alpha berulang - SP3\",\"sanction_level\":\"sp3\",\"alpha_consecutive_days\":4,\"alpha_accumulated_days\":6,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-22\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:04:13', '2026-06-29 13:26:53'),
(5, 'AUTO-SP-21-20260623-710329430', 21, 1, 'AWR-2026-001', 'sp1', '2026-06-18 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":1,\"rule_code\":\"AWR-2026-001\",\"rule_name\":\"Pelanggaran alpha berulang - SP1\",\"sanction_level\":\"sp1\",\"alpha_consecutive_days\":1,\"alpha_accumulated_days\":3,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-18\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:27:00', '2026-06-23 08:27:00'),
(6, 'AUTO-SP-21-20260623-2078359609', 21, 2, 'AWR-2026-002', 'sp2', '2026-06-20 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":2,\"rule_code\":\"AWR-2026-002\",\"rule_name\":\"Pelanggaran alpha berulang - SP2\",\"sanction_level\":\"sp2\",\"alpha_consecutive_days\":3,\"alpha_accumulated_days\":5,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-20\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:27:00', '2026-06-23 08:27:00'),
(7, 'AUTO-SP-21-20260623-1737004710', 21, 3, 'AWR-2026-003', 'sp3', '2026-06-22 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'active', '{\"rule_id\":3,\"rule_code\":\"AWR-2026-003\",\"rule_name\":\"Pelanggaran alpha berulang - SP3\",\"sanction_level\":\"sp3\",\"alpha_consecutive_days\":4,\"alpha_accumulated_days\":6,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-22\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:27:00', '2026-06-23 08:27:00'),
(8, 'AUTO-SP-20-20260623-777336183', 20, 1, 'AWR-2026-001', 'sp1', '2026-06-18 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":1,\"rule_code\":\"AWR-2026-001\",\"rule_name\":\"Pelanggaran alpha berulang - SP1\",\"sanction_level\":\"sp1\",\"alpha_consecutive_days\":1,\"alpha_accumulated_days\":3,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-18\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:28:14', '2026-06-23 08:28:14'),
(9, 'AUTO-SP-20-20260623-2145366362', 20, 2, 'AWR-2026-002', 'sp2', '2026-06-20 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":2,\"rule_code\":\"AWR-2026-002\",\"rule_name\":\"Pelanggaran alpha berulang - SP2\",\"sanction_level\":\"sp2\",\"alpha_consecutive_days\":3,\"alpha_accumulated_days\":5,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-20\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:28:14', '2026-06-23 08:28:14'),
(10, 'AUTO-SP-20-20260623-1669997957', 20, 3, 'AWR-2026-003', 'sp3', '2026-06-22 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'active', '{\"rule_id\":3,\"rule_code\":\"AWR-2026-003\",\"rule_name\":\"Pelanggaran alpha berulang - SP3\",\"sanction_level\":\"sp3\",\"alpha_consecutive_days\":4,\"alpha_accumulated_days\":6,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-22\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:28:14', '2026-06-23 08:28:14'),
(11, 'AUTO-SP-19-20260623-2043482547', 19, 1, 'AWR-2026-001', 'sp1', '2026-06-18 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":1,\"rule_code\":\"AWR-2026-001\",\"rule_name\":\"Pelanggaran alpha berulang - SP1\",\"sanction_level\":\"sp1\",\"alpha_consecutive_days\":1,\"alpha_accumulated_days\":3,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-18\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:29:18', '2026-06-23 08:29:18'),
(12, 'AUTO-SP-19-20260623-675452368', 19, 2, 'AWR-2026-002', 'sp2', '2026-06-20 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":2,\"rule_code\":\"AWR-2026-002\",\"rule_name\":\"Pelanggaran alpha berulang - SP2\",\"sanction_level\":\"sp2\",\"alpha_consecutive_days\":3,\"alpha_accumulated_days\":5,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-20\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:29:18', '2026-06-23 08:29:18'),
(13, 'AUTO-SP-19-20260623-195849391', 19, 3, 'AWR-2026-003', 'sp3', '2026-06-22 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'escalated', '{\"rule_id\":3,\"rule_code\":\"AWR-2026-003\",\"rule_name\":\"Pelanggaran alpha berulang - SP3\",\"sanction_level\":\"sp3\",\"alpha_consecutive_days\":4,\"alpha_accumulated_days\":6,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-22\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:29:18', '2026-08-20 09:51:00'),
(14, 'AUTO-SP-23-20260623-1943644010', 23, 1, 'AWR-2026-001', 'sp1', '2026-06-20 00:00:00', '2026-06-23 00:00:00', '2026-12-23 00:00:00', 'active', '{\"rule_id\":1,\"rule_code\":\"AWR-2026-001\",\"rule_name\":\"Pelanggaran alpha berulang - SP1\",\"sanction_level\":\"sp1\",\"alpha_consecutive_days\":3,\"alpha_accumulated_days\":3,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-20\",\"issued_date\":\"2026-06-23\",\"valid_until\":\"2026-12-23\"}', 'system', '2026-06-23 08:53:31', '2026-06-23 08:53:31'),
(15, 'AUTO-SP-13-20260629-1929136104', 13, 4, 'AWR-2026-004', 'tindak_lanjut', '2026-06-24 00:00:00', '2026-06-29 00:00:00', '2026-12-29 00:00:00', 'active', '{\"rule_id\":4,\"rule_code\":\"AWR-2026-004\",\"rule_name\":\"Tindakan Lanjutan\",\"sanction_level\":\"tindak_lanjut\",\"alpha_consecutive_days\":2,\"alpha_accumulated_days\":7,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-24\",\"issued_date\":\"2026-06-29\",\"valid_until\":\"2026-12-29\"}', 'system', '2026-06-29 13:26:53', '2026-06-29 13:26:53'),
(16, 'AUTO-SP-19-20260820-1936746058', 19, 4, 'AWR-2026-004', 'tindak_lanjut', '2026-06-23 00:00:00', '2026-08-20 00:00:00', '2027-02-20 00:00:00', 'active', '{\"rule_id\":4,\"rule_code\":\"AWR-2026-004\",\"rule_name\":\"Tindakan Lanjutan\",\"sanction_level\":\"tindak_lanjut\",\"alpha_consecutive_days\":5,\"alpha_accumulated_days\":7,\"late_consecutive_days\":0,\"late_accumulated_days\":0,\"violation_date\":\"2026-06-23\",\"issued_date\":\"2026-08-20\",\"valid_until\":\"2027-02-20\"}', 'system', '2026-08-20 09:51:00', '2026-08-20 09:51:00');

-- --------------------------------------------------------

--
-- Struktur dari tabel `working_hours`
--

CREATE TABLE `working_hours` (
  `id` int(11) NOT NULL,
  `shift_name` varchar(100) NOT NULL,
  `check_in_time` time NOT NULL,
  `check_out_time` time NOT NULL,
  `grace_period_minutes` int(11) DEFAULT 0,
  `is_default` tinyint(1) DEFAULT 0,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `working_hours`
--

INSERT INTO `working_hours` (`id`, `shift_name`, `check_in_time`, `check_out_time`, `grace_period_minutes`, `is_default`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Standard Working Hours', '08:00:00', '16:00:00', 0, 1, 'Shift kerja standar 08:00 - 16:00', '2026-01-12 05:44:48', '2026-01-12 05:44:48', NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_module` (`module`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_status` (`status`);

--
-- Indeks untuk tabel `allowance`
--
ALTER TABLE `allowance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_employee_period` (`employee_id`,`period_month`,`period_year`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payroll_id` (`payroll_id`),
  ADD KEY `idx_submitted_by` (`submitted_by`);

--
-- Indeks untuk tabel `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidate_id` (`candidate_id`),
  ADD KEY `job_opening_id` (`job_opening_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_candidate` (`candidate_id`),
  ADD KEY `idx_job_opening` (`job_opening_id`);

--
-- Indeks untuk tabel `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_attendance_employee_date` (`employee_id`,`date`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `date` (`date`),
  ADD KEY `idx_attendance_leave_request_id` (`leave_request_id`);

--
-- Indeks untuk tabel `attendance_warning_rules`
--
ALTER TABLE `attendance_warning_rules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_attendance_warning_rules_code` (`rule_code`),
  ADD KEY `idx_attendance_warning_rules_sanction_level` (`sanction_level`),
  ADD KEY `idx_attendance_warning_rules_is_active` (`is_active`),
  ADD KEY `idx_attendance_warning_rules_effective_date` (`effective_date`),
  ADD KEY `fk_attendance_warning_rules_created_by_user` (`created_by_user_id`),
  ADD KEY `fk_attendance_warning_rules_updated_by_user` (`updated_by_user_id`);

--
-- Indeks untuk tabel `candidates`
--
ALTER TABLE `candidates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `candidate_calls`
--
ALTER TABLE `candidate_calls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `candidate_id` (`candidate_id`);

--
-- Indeks untuk tabel `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indeks untuk tabel `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nik` (`nik`),
  ADD UNIQUE KEY `npwp` (`npwp`),
  ADD UNIQUE KEY `bpjs_number` (`bpjs_number`),
  ADD KEY `idx_position_id` (`position_id`),
  ADD KEY `fk_employees_user` (`user_id`),
  ADD KEY `fk_employees_working_hours` (`working_hours_id`),
  ADD KEY `idx_nik` (`nik`),
  ADD KEY `idx_npwp` (`npwp`),
  ADD KEY `idx_bpjs_number` (`bpjs_number`),
  ADD KEY `idx_date_of_birth` (`date_of_birth`),
  ADD KEY `idx_employees_alpha_sanction` (`alpha_sanction_level`),
  ADD KEY `idx_employees_alpha_consecutive` (`alpha_consecutive_days`),
  ADD KEY `idx_employees_alpha_accumulated` (`alpha_accumulated_days`),
  ADD KEY `idx_employees_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `interviews`
--
ALTER TABLE `interviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `interviewer_id` (`interviewer_id`),
  ADD KEY `fk_candidate` (`candidate_id`);

--
-- Indeks untuk tabel `job_openings`
--
ALTER TABLE `job_openings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_position` (`position_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_deadline` (`deadline`),
  ADD KEY `fk_job_creator` (`created_by`),
  ADD KEY `idx_job_openings_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indeks untuk tabel `leave_request_settings`
--
ALTER TABLE `leave_request_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_leave_type` (`leave_type`),
  ADD KEY `idx_leave_request_policies_active` (`is_active`);

--
-- Indeks untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_otp_code` (`otp_code`);

--
-- Indeks untuk tabel `payrolls`
--
ALTER TABLE `payrolls`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`,`period_month`,`period_year`),
  ADD KEY `idx_payrolls_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `payroll_settings`
--
ALTER TABLE `payroll_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_position_department` (`department_id`);

--
-- Indeks untuk tabel `reimbursements`
--
ALTER TABLE `reimbursements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `payroll_id` (`payroll_id`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `salary_appeals`
--
ALTER TABLE `salary_appeals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employee_id` (`employee_id`),
  ADD KEY `payroll_id` (`payroll_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_salary_appeals_deleted_at` (`deleted_at`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indeks untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD PRIMARY KEY (`user_id`,`role_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Indeks untuk tabel `warning_letters`
--
ALTER TABLE `warning_letters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_auto_letter_number` (`auto_letter_number`),
  ADD UNIQUE KEY `uniq_warning_employee_level_date_generated` (`employee_id`,`sp_level`,`violation_date`,`generated_by`),
  ADD KEY `idx_employee_id` (`employee_id`),
  ADD KEY `fk_warning_letters_rule` (`rule_id`);

--
-- Indeks untuk tabel `working_hours`
--
ALTER TABLE `working_hours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_working_hours_deleted_at` (`deleted_at`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT untuk tabel `allowance`
--
ALTER TABLE `allowance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2592;

--
-- AUTO_INCREMENT untuk tabel `attendance_warning_rules`
--
ALTER TABLE `attendance_warning_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `candidate_calls`
--
ALTER TABLE `candidate_calls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT untuk tabel `interviews`
--
ALTER TABLE `interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `job_openings`
--
ALTER TABLE `job_openings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `leave_request_settings`
--
ALTER TABLE `leave_request_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT untuk tabel `payroll_settings`
--
ALTER TABLE `payroll_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `salary_appeals`
--
ALTER TABLE `salary_appeals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT untuk tabel `warning_letters`
--
ALTER TABLE `warning_letters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `allowance`
--
ALTER TABLE `allowance`
  ADD CONSTRAINT `fk_pma_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pma_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pma_submitted_by` FOREIGN KEY (`submitted_by`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `applications`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`job_opening_id`) REFERENCES `job_openings` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `fk_attendance_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `attendance_warning_rules`
--
ALTER TABLE `attendance_warning_rules`
  ADD CONSTRAINT `fk_attendance_warning_rules_created_by_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_attendance_warning_rules_updated_by_user` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `candidates`
--
ALTER TABLE `candidates`
  ADD CONSTRAINT `candidates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `candidate_calls`
--
ALTER TABLE `candidate_calls`
  ADD CONSTRAINT `candidate_calls_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `fk_employees_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`),
  ADD CONSTRAINT `fk_employees_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_employees_working_hours` FOREIGN KEY (`working_hours_id`) REFERENCES `working_hours` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `interviews`
--
ALTER TABLE `interviews`
  ADD CONSTRAINT `fk_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`),
  ADD CONSTRAINT `fk_interview_candidate` FOREIGN KEY (`candidate_id`) REFERENCES `candidates` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `interviews_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`),
  ADD CONSTRAINT `interviews_ibfk_2` FOREIGN KEY (`interviewer_id`) REFERENCES `employees` (`id`);

--
-- Ketidakleluasaan untuk tabel `job_openings`
--
ALTER TABLE `job_openings`
  ADD CONSTRAINT `fk_job_creator` FOREIGN KEY (`created_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_job_position` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `leave_requests`
--
ALTER TABLE `leave_requests`
  ADD CONSTRAINT `fk_leave_approver` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_leave_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `payrolls`
--
ALTER TABLE `payrolls`
  ADD CONSTRAINT `fk_payroll_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `fk_position_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`);

--
-- Ketidakleluasaan untuk tabel `reimbursements`
--
ALTER TABLE `reimbursements`
  ADD CONSTRAINT `fk_reimb_approver` FOREIGN KEY (`approved_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reimb_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reimb_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `salary_appeals`
--
ALTER TABLE `salary_appeals`
  ADD CONSTRAINT `fk_appeal_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_appeal_payroll` FOREIGN KEY (`payroll_id`) REFERENCES `payrolls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_appeal_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `employees` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `warning_letters`
--
ALTER TABLE `warning_letters`
  ADD CONSTRAINT `fk_warning_letters_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_warning_letters_rule` FOREIGN KEY (`rule_id`) REFERENCES `attendance_warning_rules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
