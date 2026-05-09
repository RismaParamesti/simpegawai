-- ============================================================
-- MIGRATION: Leave request policies and leave type expansion
-- Date: May 9, 2026
-- ============================================================

CREATE TABLE IF NOT EXISTS `leave_request_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leave_type` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `min_tenure_months` int(11) DEFAULT 0,
  `min_days` int(11) DEFAULT 1,
  `max_days` int(11) DEFAULT NULL,
  `require_bukti` tinyint(1) DEFAULT 0,
  `require_bukti_if_days_gt` int(11) DEFAULT NULL,
  `attendance_status` enum('izin','sakit') DEFAULT 'izin',
  `meta` JSON DEFAULT NULL,
  `deduct_quota` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_leave_type` (`leave_type`),
  KEY `idx_leave_request_policies_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `leave_request_settings` (
  `leave_type`,
  `label`,
  `min_tenure_months`,
  `min_days`,
  `max_days`,
  `require_bukti`,
  `require_bukti_if_days_gt`,
  `attendance_status`,
  `meta`,
  `deduct_quota`,
  `is_active`
)
VALUES
  ('izin', 'Izin', 0, 1, NULL, 0, NULL, 'izin', NULL, 0, 1),
  ('cuti_tahunan', 'Cuti Tahunan', 12, 1, NULL, 0, NULL, 'izin', NULL, 1, 1),
  ('cuti_sakit', 'Cuti Sakit', 0, 1, NULL, 1, NULL, 'sakit', JSON_OBJECT('payment_schedule', JSON_ARRAY(JSON_OBJECT('months',4,'percent',100), JSON_OBJECT('months',4,'percent',75), JSON_OBJECT('months',4,'percent',50), JSON_OBJECT('months',NULL,'percent',25))), 0, 1),
  ('cuti_melahirkan', 'Cuti Melahirkan', 0, 1, 90, 1, NULL, 'izin', JSON_OBJECT('pre_days',45,'post_days',45,'total_days',90,'paid',1), 0, 1),
  ('cuti_keguguran', 'Cuti Keguguran', 0, 1, 45, 1, NULL, 'izin', NULL, 0, 1),
  ('cuti_menikah', 'Cuti Menikah', 0, 1, 3, 0, NULL, 'izin', NULL, 0, 1),
  ('cuti_khusus', 'Cuti Penting (Cuti Khusus)', 0, 1, 2, 0, NULL, 'izin', JSON_OBJECT('options', JSON_ARRAY(JSON_OBJECT('key','menikahkan_anak','label','Menikahkan anak','days',2), JSON_OBJECT('key','istri_melahirkan','label','Istri melahirkan/keguguran','days',2), JSON_OBJECT('key','pasangan_orangtua_anak_meninggal','label','Suami/istri/anak/orang tua meninggal','days',2), JSON_OBJECT('key','anggota_keluarga_serumah_meninggal','label','Anggota keluarga serumah meninggal','days',1))), 0, 1),
  ('izin_sakit', 'Izin Sakit (singkat)', 0, 1, NULL, 1, NULL, 'sakit', NULL, 0, 1),
  ('izin_pribadi', 'Izin Keperluan Pribadi', 0, 1, 2, 0, NULL, 'izin', JSON_OBJECT('monthly_limit',2,'paid',0), 0, 1),
  ('izin_terlambat', 'Izin Terlambat / Pulang Cepat', 0, 1, 1, 0, NULL, 'izin', JSON_OBJECT('allow_time_input',1), 0, 1)
  
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `min_tenure_months` = VALUES(`min_tenure_months`),
  `min_days` = VALUES(`min_days`),
  `max_days` = VALUES(`max_days`),
  `require_bukti` = VALUES(`require_bukti`),
  `require_bukti_if_days_gt` = VALUES(`require_bukti_if_days_gt`),
  `attendance_status` = VALUES(`attendance_status`),
  `deduct_quota` = VALUES(`deduct_quota`),
  `is_active` = VALUES(`is_active`);

ALTER TABLE `leave_requests`
  MODIFY COLUMN `leave_type` ENUM(
    'cuti_tahunan',
    'cuti_sakit',
    'cuti_melahirkan',
    'cuti_keguguran',
    'cuti_menikah',
    'cuti_khusus',
    'izin',
    'izin_sakit',
    'izin_pribadi',
    'izin_terlambat'
  ) NOT NULL;
