-- ============================================================
-- MIGRATION (DEPRECATED): Auto-generated warning letters from attendance rules
-- Date: May 19, 2026
--
-- NOTE: This migration has been deprecated in favor of a unified
-- `warning_letters` table that stores both manual (HR) and
-- system-generated metadata. Use `migration_recreate_warning_letters.sql`
-- to (re)create the combined `warning_letters` table.
--
-- The original table definition is preserved below for reference.

/*
CREATE TABLE IF NOT EXISTS `auto_warning_letters` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `auto_letter_number` VARCHAR(100) NOT NULL,
  `employee_id` INT NOT NULL,
  `rule_id` INT DEFAULT NULL,
  `rule_code` VARCHAR(50) DEFAULT NULL,
  `sp_level` VARCHAR(50) NOT NULL DEFAULT 'none',
  `violation_date` DATE NOT NULL,
  `issued_date` DATE NOT NULL,
  `status` ENUM('active','expired','revoked') NOT NULL DEFAULT 'active',
  `evidence_snapshot` JSON DEFAULT NULL,
  `generated_by` ENUM('system') NOT NULL DEFAULT 'system',
  `generated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_auto_warning_letter_number` (`auto_letter_number`),
  UNIQUE KEY `uniq_auto_warning_signature` (`employee_id`,`sp_level`,`violation_date`,`issued_date`),
  KEY `idx_auto_warning_letters_employee_id` (`employee_id`),
  KEY `idx_auto_warning_letters_rule_id` (`rule_id`),
  KEY `idx_auto_warning_letters_sp_level` (`sp_level`),
  KEY `idx_auto_warning_letters_issued_date` (`issued_date`),
  CONSTRAINT `fk_auto_warning_letters_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_auto_warning_letters_rule` FOREIGN KEY (`rule_id`) REFERENCES `attendance_warning_rules`(`id`) ON DELETE SET NULL
);
*/