-- ============================================================
-- MIGRATION: Add late/alpha deduction settings to payroll_settings
-- Date: May 10, 2026
-- ============================================================

ALTER TABLE `payroll_settings`
  ADD COLUMN `late_deduction_percentage` DECIMAL(5,4) NOT NULL DEFAULT 0.0200 AFTER `bpjs_percentage`,
  ADD COLUMN `alpha_deduction_percentage` DECIMAL(5,4) NOT NULL DEFAULT 1.0000 AFTER `late_deduction_percentage`;
