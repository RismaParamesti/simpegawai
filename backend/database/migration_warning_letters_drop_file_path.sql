-- ============================================================
-- MIGRATION: Drop file_path from warning_letters (PDF no longer used)
-- Date: May 19, 2026
-- ============================================================

ALTER TABLE `warning_letters`
  DROP COLUMN `file_path`;
