-- ============================================================
-- VendorJunction Migration v2
-- Run via phpMyAdmin on the vendorjunction database
-- ============================================================
USE `vendorjunction`;

-- ============================================================
-- LICENSE REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS `license_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `partner_id` INT UNSIGNED NOT NULL,
  `program_id` INT UNSIGNED NOT NULL,
  `requested_licenses` INT NOT NULL DEFAULT 1,
  `notes` TEXT NULL,
  `status` ENUM('pending','approved','rejected') DEFAULT 'pending',
  `admin_notes` TEXT NULL,
  `reviewed_by` INT UNSIGNED NULL,
  `reviewed_at` DATETIME NULL,
  `requested_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `partner_registrations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewed_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `actor_type` ENUM('admin','partner','system') NOT NULL DEFAULT 'system',
  `actor_id` INT UNSIGNED NULL,
  `actor_name` VARCHAR(200) NULL,
  `actor_email` VARCHAR(255) NULL,
  `actor_ip` VARCHAR(100) NULL,
  `category` ENUM('auth','partner','program','attachment','email','license','system') NOT NULL DEFAULT 'system',
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `entity_type` VARCHAR(50) NULL,
  `entity_id` INT UNSIGNED NULL,
  `entity_name` VARCHAR(200) NULL,
  `metadata` JSON NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_actor_type` (`actor_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB;
