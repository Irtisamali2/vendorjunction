-- ============================================================
-- VendorJunction Partner Portal - MySQL Schema
-- Import via phpMyAdmin: http://localhost/phpmyadmin
-- ============================================================

CREATE DATABASE IF NOT EXISTS `vendorjunction` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vendorjunction`;

-- ============================================================
-- ADMIN USERS
-- ============================================================
CREATE TABLE `admin_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'admin') DEFAULT 'superadmin',
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- PARTNER REGISTRATIONS (2-step form)
-- ============================================================
CREATE TABLE `partner_registrations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `reg_code` VARCHAR(30) UNIQUE,
  -- Step 1: Personal Info
  `title` ENUM('Mr.','Ms.','Mrs.','Dr.','Prof.') NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `job_title` VARCHAR(150) NOT NULL,
  `mobile` VARCHAR(30) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  -- Step 2: Company Info
  `company_name` VARCHAR(200) NOT NULL,
  `company_type` ENUM('Private Limited','Public Limited','Sole Proprietorship','Partnership','LLC','FZC','FZE','Other') NOT NULL,
  `address_line1` VARCHAR(255) NOT NULL,
  `address_line2` VARCHAR(255),
  `city` VARCHAR(100) NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `num_branches` INT DEFAULT 0,
  `num_employees` INT NOT NULL,
  `landline` VARCHAR(30),
  `website` VARCHAR(255),
  `business_sector` ENUM('Information Technology','Education','EdTech','Training','Marketing Services','Distribution','Consulting','Other') NOT NULL,
  `business_activities` TEXT,
  `company_reg_no` VARCHAR(100),
  `annual_turnover` DECIMAL(15,2),
  -- Status & Workflow
  `status` ENUM('pending','approved','rejected','suspended') DEFAULT 'pending',
  `status_changed_by` INT UNSIGNED NULL,
  `status_changed_at` DATETIME NULL,
  `rejection_reason` TEXT NULL,
  `notes` TEXT NULL,
  -- Timestamps
  `submitted_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`status_changed_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- PARTNER USERS (created on approval)
-- ============================================================
CREATE TABLE `partner_users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `registration_id` INT UNSIGNED NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `last_login` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`registration_id`) REFERENCES `partner_registrations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- PROGRAMS / PRICING TABLE
-- ============================================================
CREATE TABLE `programs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `partner_id` INT UNSIGNED NOT NULL,
  `program_name` VARCHAR(200) NOT NULL,
  `credits` INT NOT NULL DEFAULT 1,
  `credit_unit_price` DECIMAL(10,2) NOT NULL,
  `total_price` DECIMAL(15,2) GENERATED ALWAYS AS (`credits` * `credit_unit_price`) STORED,
  `created_by` INT UNSIGNED NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `partner_registrations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- ATTACHMENTS
-- ============================================================
CREATE TABLE `attachments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `partner_id` INT UNSIGNED NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `stored_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `mime_type` VARCHAR(100),
  `file_size` INT UNSIGNED,
  `uploaded_by` INT UNSIGNED NULL,
  `uploaded_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`partner_id`) REFERENCES `partner_registrations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`uploaded_by`) REFERENCES `admin_users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- EMAIL CONFIGURATION (SMTP)
-- ============================================================
CREATE TABLE `email_config` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `smtp_host` VARCHAR(255) NOT NULL,
  `smtp_port` SMALLINT UNSIGNED DEFAULT 587,
  `smtp_user` VARCHAR(255) NOT NULL,
  `smtp_password` VARCHAR(500) NOT NULL,
  `smtp_encryption` ENUM('tls','ssl','none') DEFAULT 'tls',
  `from_name` VARCHAR(150) DEFAULT 'VendorJunction Portal',
  `from_email` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- EMAIL TEMPLATES
-- ============================================================
CREATE TABLE `email_templates` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `template_key` VARCHAR(100) NOT NULL UNIQUE,
  `template_name` VARCHAR(200) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `html_body` LONGTEXT NOT NULL,
  `variables_hint` TEXT COMMENT 'JSON list of available variables like {{name}}, {{company}}',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================
-- EMAIL LOGS
-- ============================================================
CREATE TABLE `email_logs` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `to_email` VARCHAR(255) NOT NULL,
  `to_name` VARCHAR(200),
  `subject` VARCHAR(500) NOT NULL,
  `template_key` VARCHAR(100),
  `status` ENUM('sent','failed','pending') DEFAULT 'pending',
  `error_message` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `partner_id` INT UNSIGNED NULL,
  FOREIGN KEY (`partner_id`) REFERENCES `partner_registrations`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Super Admin (password: VJ2026Admin)
-- Generated with bcrypt rounds=12
INSERT INTO `admin_users` (`name`, `email`, `password_hash`, `role`) VALUES
('Super Admin', 'admin@vendorjunction.com', '$2b$12$NJIwmdQY42DjwgV1Fiu9NOTY09oQ/GKd5rSkeOQoERBbu0yFa6IXC', 'superadmin');

-- Email Templates
INSERT INTO `email_templates` (`template_key`, `template_name`, `subject`, `html_body`, `variables_hint`) VALUES
(
  'registration_welcome',
  'Partner Registration - Welcome',
  'Thank you for applying to the Microsoft Microdegree Partner Program',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter,Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#0A0E1A,#1a2235);padding:40px;text-align:center}.header img{height:50px}.title{color:#fff;font-size:22px;margin-top:20px;font-weight:700}.body{padding:40px;color:#333}.body h2{color:#6366F1;font-size:20px}.footer{background:#f9f9f9;padding:20px;text-align:center;color:#888;font-size:12px}</style></head><body><div class="container"><div class="header"><div class="title">VendorJunction Partner Portal</div></div><div class="body"><h2>Welcome, {{first_name}}!</h2><p>Thank you for submitting your application to join the <strong>Microsoft Skills for Jobs Microdegree Program</strong> Partner Network.</p><p>Your application for <strong>{{company_name}}</strong> has been received and is currently under review by our team.</p><p>You will receive a notification once your application has been processed. Our team typically reviews applications within 3-5 business days.</p><p>If you have any questions, please contact us at <a href="mailto:partners@vendorjunctiongroup.com">partners@vendorjunctiongroup.com</a>.</p><p>Best regards,<br><strong>VendorJunction Partner Team</strong></p></div><div class="footer"><p>Global Strategy. Local Expertise. &copy; 2026 Vendor Junction Group</p></div></div></body></html>',
  '["{{first_name}}","{{last_name}}","{{company_name}}","{{email}}","{{submitted_date}}"]'
),
(
  'status_approved',
  'Partner Application - Approved',
  'Congratulations! Your Partner Application has been Approved',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter,Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#0A0E1A,#1a2235);padding:40px;text-align:center}.title{color:#fff;font-size:22px;margin-top:20px;font-weight:700}.badge{display:inline-block;background:#10B981;color:#fff;padding:8px 24px;border-radius:20px;font-size:16px;font-weight:700;margin:16px 0}.body{padding:40px;color:#333}.credentials{background:#f0f4ff;border-left:4px solid #6366F1;padding:20px;border-radius:8px;margin:20px 0}.cred-row{margin:8px 0;font-size:15px}.footer{background:#f9f9f9;padding:20px;text-align:center;color:#888;font-size:12px}</style></head><body><div class="container"><div class="header"><div class="title">VendorJunction Partner Portal</div><div class="badge">Application Approved</div></div><div class="body"><h2>Congratulations, {{first_name}}!</h2><p>We are delighted to inform you that <strong>{{company_name}}</strong> has been approved as an official partner of the <strong>Microsoft Skills for Jobs Microdegree Program</strong>.</p><p>Your partner portal account has been created. Please find your login credentials below:</p><div class="credentials"><div class="cred-row"><strong>Portal URL:</strong> <a href="{{portal_url}}">{{portal_url}}</a></div><div class="cred-row"><strong>Email:</strong> {{email}}</div><div class="cred-row"><strong>Temporary Password:</strong> {{temp_password}}</div></div><p>Please log in and change your password immediately upon first access.</p><p>Welcome to the Vendor Junction Partner Ecosystem!</p><p>Best regards,<br><strong>VendorJunction Partner Team</strong></p></div><div class="footer"><p>Global Strategy. Local Expertise. &copy; 2026 Vendor Junction Group</p></div></div></body></html>',
  '["{{first_name}}","{{last_name}}","{{company_name}}","{{email}}","{{temp_password}}","{{portal_url}}"]'
),
(
  'status_rejected',
  'Partner Application - Rejected',
  'Update on Your Partner Application',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter,Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}.container{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1)}.header{background:linear-gradient(135deg,#0A0E1A,#1a2235);padding:40px;text-align:center}.title{color:#fff;font-size:22px;margin-top:20px;font-weight:700}.badge{display:inline-block;background:#EF4444;color:#fff;padding:8px 24px;border-radius:20px;font-size:16px;font-weight:700;margin:16px 0}.body{padding:40px;color:#333}.reason-box{background:#fff5f5;border-left:4px solid #EF4444;padding:16px;border-radius:8px;margin:16px 0;color:#c00}.footer{background:#f9f9f9;padding:20px;text-align:center;color:#888;font-size:12px}</style></head><body><div class="container"><div class="header"><div class="title">VendorJunction Partner Portal</div><div class="badge">Application Update</div></div><div class="body"><p>Dear {{first_name}},</p><p>Thank you for your interest in joining the <strong>Microsoft Skills for Jobs Microdegree Program</strong> Partner Network.</p><p>After careful consideration, we regret to inform you that the application for <strong>{{company_name}}</strong> was not approved at this time.</p><div class="reason-box"><strong>Reason:</strong> {{rejection_reason}}</div><p>We encourage you to address the above concerns and reapply in the future. If you have questions, please contact us at <a href="mailto:partners@vendorjunctiongroup.com">partners@vendorjunctiongroup.com</a>.</p><p>Best regards,<br><strong>VendorJunction Partner Team</strong></p></div><div class="footer"><p>Global Strategy. Local Expertise. &copy; 2026 Vendor Junction Group</p></div></div></body></html>',
  '["{{first_name}}","{{last_name}}","{{company_name}}","{{rejection_reason}}"]'
);
