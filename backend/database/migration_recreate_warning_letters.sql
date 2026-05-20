-- Migration: recreate `warning_letters` table combining manual + system-generated metadata
-- Use this migration to (re)create the `warning_letters` table if it was removed.
-- Safe for idempotent runs on a fresh DB.

CREATE TABLE IF NOT EXISTS `warning_letters` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `auto_letter_number` varchar(100) DEFAULT NULL,
  `employee_id` INT NOT NULL,
  `rule_id` INT DEFAULT NULL,
  `rule_code` varchar(100) DEFAULT NULL,
  `sp_level` varchar(50) NOT NULL,
  `violation_date` datetime DEFAULT NULL,
  `issued_date` datetime DEFAULT NULL,
  `valid_until` datetime DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'active',
  `evidence_snapshot` json DEFAULT NULL,
  `generated_by` varchar(50) NOT NULL DEFAULT 'hr',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_auto_letter_number` (`auto_letter_number`),
  UNIQUE KEY `uniq_warning_employee_level_date_generated` (`employee_id`, `sp_level`, `violation_date`, `generated_by`),
  KEY `idx_employee_id` (`employee_id`),
  CONSTRAINT `fk_warning_letters_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_warning_letters_rule` FOREIGN KEY (`rule_id`) REFERENCES `attendance_warning_rules` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
