-- ============================================================
-- MIGRATION: Dynamic sanction level (no fixed ENUM)
-- Date: May 19, 2026
-- ============================================================

-- attendance warning rules can now store any level (sp4, sp5, evaluasi_hr, etc)
ALTER TABLE `attendance_warning_rules`
  MODIFY COLUMN `sanction_level` VARCHAR(50) NOT NULL DEFAULT 'none';

-- employee discipline snapshot follows dynamic level values
ALTER TABLE `employees`
  MODIFY COLUMN `alpha_sanction_level` VARCHAR(50) NOT NULL DEFAULT 'none';

-- warning letters can store custom SP levels beyond sp1-sp3
ALTER TABLE `warning_letters`
  MODIFY COLUMN `sp_level` VARCHAR(50) NOT NULL;

-- normalize existing values to lowercase+underscore style for consistency
UPDATE `attendance_warning_rules`
SET `sanction_level` = LOWER(REPLACE(TRIM(`sanction_level`), ' ', '_'))
WHERE `sanction_level` IS NOT NULL;

UPDATE `employees`
SET `alpha_sanction_level` = LOWER(REPLACE(TRIM(`alpha_sanction_level`), ' ', '_'))
WHERE `alpha_sanction_level` IS NOT NULL;

UPDATE `warning_letters`
SET `sp_level` = LOWER(REPLACE(TRIM(`sp_level`), ' ', '_'))
WHERE `sp_level` IS NOT NULL;
