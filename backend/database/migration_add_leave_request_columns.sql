-- ============================================================
-- MIGRATION: add columns for izin terlambat and cuti_khusus option
-- Date: 2026-05-10
-- ============================================================

ALTER TABLE `leave_requests`
  ADD COLUMN `time` VARCHAR(10) NULL AFTER `total_days`,
  ADD COLUMN `cuti_khusus_option` VARCHAR(100) NULL AFTER `time`;

-- If needed, you can run an update to populate existing records or add indexes:
-- ALTER TABLE `leave_requests` ADD INDEX (`cuti_khusus_option`);
