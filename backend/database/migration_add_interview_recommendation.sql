ALTER TABLE `interviews`
  ADD COLUMN `recommendation` ENUM('hire', 'consider', 'reject') DEFAULT NULL AFTER `rating`;