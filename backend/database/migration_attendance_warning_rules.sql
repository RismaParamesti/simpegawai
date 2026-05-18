-- ============================================================
-- MIGRATION: Attendance warning rules for frequent alpha violations
-- Date: May 18, 2026
-- ============================================================

CREATE TABLE IF NOT EXISTS `attendance_warning_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rule_code` VARCHAR(50) NOT NULL,
  `rule_name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `min_consecutive_alpha` INT NOT NULL DEFAULT 0,
  `min_consecutive_late` INT NOT NULL DEFAULT 0,
  `min_accumulated_alpha` INT NOT NULL DEFAULT 0,
  `min_accumulated_late` INT NOT NULL DEFAULT 0,
  `sanction_level` VARCHAR(50) NOT NULL DEFAULT 'none',
  `recommendation` TEXT DEFAULT NULL,
  `effective_date` DATE NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `notes` TEXT DEFAULT NULL,
  `created_by_user_id` INT DEFAULT NULL,
  `updated_by_user_id` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_attendance_warning_rules_code` (`rule_code`),
  KEY `idx_attendance_warning_rules_sanction_level` (`sanction_level`),
  KEY `idx_attendance_warning_rules_is_active` (`is_active`),
  KEY `idx_attendance_warning_rules_effective_date` (`effective_date`),
  CONSTRAINT `fk_attendance_warning_rules_created_by_user` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_attendance_warning_rules_updated_by_user` FOREIGN KEY (`updated_by_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
);

INSERT IGNORE INTO `attendance_warning_rules` (
  `rule_code`,
  `rule_name`,
  `description`,
  `min_consecutive_alpha`,
  `min_consecutive_late`,
  `min_accumulated_alpha`,
  `min_accumulated_late`,
  `sanction_level`,
  `recommendation`,
  `effective_date`,
  `is_active`,
  `notes`
) VALUES
  (
    'AWR-2026-001',
    'Pelanggaran alpha berulang - SP1',
    'Aturan awal untuk pegawai yang mulai menunjukkan pola alpha berulang.',
    3,
    3,
    3,
    4,
    'sp1',
    'Berikan surat peringatan pertama dan monitoring kehadiran harian.',
    CURRENT_DATE(),
    1,
    'Digunakan sebagai baseline peringatan kehadiran.'
  ),
  (
    'AWR-2026-002',
    'Pelanggaran alpha berulang - SP2',
    'Aturan untuk pegawai yang sudah melewati batas SP1.',
    5,
    5,
    5,
    6,
    'sp2',
    'Naikkan ke SP2 dan lakukan pendampingan langsung dari atasan.',
    CURRENT_DATE(),
    1,
    'Disesuaikan dengan kebijakan unit kerja.'
  ),
  (
    'AWR-2026-003',
    'Pelanggaran alpha berulang - SP3',
    'Aturan untuk pegawai dengan tingkat alpha tinggi dan berkelanjutan.',
    6,
    7,
    6,
    8,
    'sp3',
    'Naikkan ke SP3 dan lakukan tindakan disiplin lanjutan sesuai kebijakan perusahaan.',
    CURRENT_DATE(),
    1,
    'Menjadi batas eskalasi tertinggi pada aturan ini.'
  ),
  (
    'AWR-2026-004',
    'Evaluasi HR / Tindakan Lanjutan',
    'Escalation: pegawai yang melewati ambang SP3 atau menunjukkan pola serius perlu evaluasi HR atau tindakan lanjutan (termasuk nonaktif).',
    7,
    8,
    7,
    10,
    'evaluasi_hr',
    'Jadwalkan evaluasi HR; pertimbangkan tindakan lanjutan termasuk nonaktif sesuai kebijakan.',
    CURRENT_DATE(),
    1,
    'Eskalasikan ke evaluasi HR ketika ambang ini terlampaui.'
  );