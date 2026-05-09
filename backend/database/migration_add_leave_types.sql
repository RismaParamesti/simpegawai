-- ============================================================
-- MIGRATION: add 'izin_lainnya' and 'cuti_lainnya' leave types
-- Date: 2026-05-10
-- ============================================================

-- Insert into leave_request_settings (if table exists)
INSERT INTO `leave_request_settings` (
  `leave_type`, `label`, `min_tenure_months`, `min_days`, `max_days`, `require_bukti`, `require_bukti_if_days_gt`, `attendance_status`, `meta`, `deduct_quota`, `is_active`, `created_at`, `updated_at`
)
VALUES
  ('izin_lainnya', 'Izin Lainnya', 0, 1, NULL, 0, NULL, 'izin', NULL, 0, 1, NOW(), NOW()),
  ('cuti_lainnya', 'Cuti Lainnya (Unpaid)', 0, 1, NULL, 0, NULL, 'izin', JSON_OBJECT('paid',0), 0, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `min_tenure_months` = VALUES(`min_tenure_months`),
  `min_days` = VALUES(`min_days`),
  `max_days` = VALUES(`max_days`),
  `require_bukti` = VALUES(`require_bukti`),
  `require_bukti_if_days_gt` = VALUES(`require_bukti_if_days_gt`),
  `attendance_status` = VALUES(`attendance_status`),
  `meta` = VALUES(`meta`),
  `deduct_quota` = VALUES(`deduct_quota`),
  `is_active` = VALUES(`is_active`),
  `updated_at` = NOW();

-- Alter enum on leave_requests to include the new types.
ALTER TABLE `leave_requests`
  MODIFY COLUMN `leave_type` ENUM(
    'cuti_tahunan',
    'cuti_sakit',
    'cuti_melahirkan',
    'cuti_keguguran',
    'cuti_menikah',
    'cuti_khusus',
    'cuti_besar',
    'izin',
    'izin_sakit',
    'izin_pribadi',
    'izin_terlambat',
    'izin_lainnya',
    'cuti_lainnya'
  ) NOT NULL;
