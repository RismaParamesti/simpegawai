-- Migration: drop unused columns from warning_letters
-- Drops columns: letter_number, valid_until, reason, signed_title, signed_name
-- Safe to run multiple times on MariaDB 10.4+ (uses IF EXISTS)

ALTER TABLE `warning_letters`
  DROP COLUMN IF EXISTS `letter_number`,
  DROP COLUMN IF EXISTS `reason`,
  DROP COLUMN IF EXISTS `signed_title`,
  DROP COLUMN IF EXISTS `signed_name`;

-- Ensure evidence_snapshot column exists
ALTER TABLE `warning_letters`
  ADD COLUMN IF NOT EXISTS `evidence_snapshot` JSON DEFAULT NULL;
