-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 15 Jun 2026 pada 10.18
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
-- Database: `apk_pegawai`
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
(13, 13, 'EMP009', 'DIREKTUR', 'male', NULL, NULL, NULL, 'Indonesian', NULL, '-', 'user6@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, '2026-02-27', 15000000.00, 'permanent', 1, 12, 12, 50, 89, 'tindak_lanjut', '2026-06-03 15:11:11', NULL, '2026-02-27 15:28:56', '2026-06-03 15:11:11', NULL);

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
(13, 'DIREKTUR', 'user6@gmail.com', 'user6', '$2a$12$hQvjPkYJSZGU.CJkL22aMuFDdU7rIv6sw47tnmgXI3BZpd1ST51xW', '-', '', 'active', '2026-02-27 08:28:56', '2026-05-14 11:17:16');

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
(13, 1);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `allowance`
--
ALTER TABLE `allowance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `attendance_warning_rules`
--
ALTER TABLE `attendance_warning_rules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `candidates`
--
ALTER TABLE `candidates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `candidate_calls`
--
ALTER TABLE `candidate_calls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `interviews`
--
ALTER TABLE `interviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `job_openings`
--
ALTER TABLE `job_openings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `leave_requests`
--
ALTER TABLE `leave_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `leave_request_settings`
--
ALTER TABLE `leave_request_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `payrolls`
--
ALTER TABLE `payrolls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `payroll_settings`
--
ALTER TABLE `payroll_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `positions`
--
ALTER TABLE `positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `salary_appeals`
--
ALTER TABLE `salary_appeals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT untuk tabel `warning_letters`
--
ALTER TABLE `warning_letters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
