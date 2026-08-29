-- ==============================================================================
-- KHOJI NEPAL (खोजि नेपाल) — RASUWA FLOOD INFORMATION & RESPONSE PLATFORM
-- PRODUCTION DATABASE SCHEMA
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+
-- Charset: utf8mb4 (Full Multilingual Unicode, Nepali Devanagari & Emoji support)
-- Collation: utf8mb4_unicode_ci
-- ==============================================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS `khoji_nepal`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `khoji_nepal`;

-- Disable Foreign Key checks temporarily during schema initialization
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. TABLE: users
-- Core authentication and role-based access control (RBAC) table.
-- Roles: admin (Full access), moderator (Verification), organization (Relief/Rescue), user (Citizen)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'moderator', 'organization', 'user') NOT NULL DEFAULT 'user',
  `status` ENUM('active', 'inactive', 'suspended', 'pending') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`),
  KEY `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABLE: locations
-- Spatial and administrative location registry for missing points, rescue zones,
-- hospitals, temporary shelters, relief distribution points, and rescue basecamps.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `type` ENUM('missing', 'rescue', 'hospital', 'shelter', 'relief', 'rescue_team') NOT NULL,
  `district` VARCHAR(100) NOT NULL DEFAULT 'Rasuwa',
  `municipality` VARCHAR(100) NULL,
  `ward` VARCHAR(20) NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `address` TEXT NULL,
  `status` ENUM('active', 'inactive', 'inaccessible', 'operational', 'overwhelmed') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_locations_type` (`type`),
  KEY `idx_locations_district` (`district`),
  KEY `idx_locations_municipality` (`municipality`),
  KEY `idx_locations_status` (`status`),
  KEY `idx_locations_coords` (`latitude`, `longitude`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABLE: missing_persons
-- Primary directory of reported missing citizens.
-- Privacy Notice: guardian_name and guardian_phone are private sensitive data
-- and MUST be masked in public APIs.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `missing_persons`;
CREATE TABLE `missing_persons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `age` INT UNSIGNED NULL,
  `gender` ENUM('male', 'female', 'other', 'unknown') NOT NULL DEFAULT 'unknown',
  `photo` VARCHAR(500) NULL,
  `missing_date` DATE NOT NULL,
  `missing_time` TIME NULL,
  `last_seen_location` VARCHAR(255) NOT NULL,
  `district` VARCHAR(100) NOT NULL DEFAULT 'Rasuwa',
  `municipality` VARCHAR(100) NULL,
  `ward` VARCHAR(20) NULL,
  `description` TEXT NULL,
  `clothing_description` TEXT NULL,
  `identifying_marks` TEXT NULL,
  `guardian_name` VARCHAR(150) NULL,
  `guardian_phone` VARCHAR(50) NULL,
  `status` ENUM('missing', 'rescued', 'found', 'deceased', 'closed') NOT NULL DEFAULT 'missing',
  `source_type` ENUM('citizen', 'police', 'army', 'red_cross', 'hospital', 'official_bulletin') NOT NULL DEFAULT 'citizen',
  `source_name` VARCHAR(150) NULL,
  `source_reference` VARCHAR(150) NULL,
  `verification_status` ENUM('pending', 'verified', 'rejected', 'under_review') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_missing_report_id` (`report_id`),
  KEY `idx_missing_full_name` (`full_name`),
  KEY `idx_missing_district` (`district`),
  KEY `idx_missing_missing_date` (`missing_date`),
  KEY `idx_missing_status` (`status`),
  KEY `idx_missing_verification_status` (`verification_status`),
  KEY `idx_missing_gender` (`gender`),
  KEY `idx_missing_search_composite` (`status`, `verification_status`, `district`, `missing_date`),
  KEY `idx_missing_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLE: found_persons
-- Registry of unidentified or safely located individuals undergoing identification.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `found_persons`;
CREATE TABLE `found_persons` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_id` VARCHAR(50) NOT NULL,
  `approx_name` VARCHAR(150) NULL,
  `approx_age` INT UNSIGNED NULL,
  `gender` ENUM('male', 'female', 'other', 'unknown') NOT NULL DEFAULT 'unknown',
  `photo` VARCHAR(500) NULL,
  `found_date` DATE NOT NULL,
  `found_location` VARCHAR(255) NOT NULL,
  `current_location` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `source_type` ENUM('citizen', 'police', 'army', 'red_cross', 'hospital', 'shelter') NOT NULL DEFAULT 'citizen',
  `source_name` VARCHAR(150) NULL,
  `verification_status` ENUM('pending', 'verified', 'rejected', 'under_review') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_found_report_id` (`report_id`),
  KEY `idx_found_approx_name` (`approx_name`),
  KEY `idx_found_date` (`found_date`),
  KEY `idx_found_gender` (`gender`),
  KEY `idx_found_verification_status` (`verification_status`),
  KEY `idx_found_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLE: rescue_records
-- Official field rescue log linked to missing persons, hospitals, shelters, and teams.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `rescue_records`;
CREATE TABLE `rescue_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `person_id` BIGINT UNSIGNED NULL,
  `rescue_status` ENUM('in_progress', 'completed', 'medical_evac', 'sheltered', 'transferred') NOT NULL DEFAULT 'completed',
  `rescued_date` DATETIME NOT NULL,
  `rescued_location` VARCHAR(255) NOT NULL,
  `current_location` VARCHAR(255) NOT NULL,
  `hospital_id` BIGINT UNSIGNED NULL,
  `shelter_id` BIGINT UNSIGNED NULL,
  `rescue_team` VARCHAR(150) NOT NULL,
  `organization` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `verified_by` BIGINT UNSIGNED NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rescue_person_id` (`person_id`),
  KEY `idx_rescue_status` (`rescue_status`),
  KEY `idx_rescue_date` (`rescued_date`),
  KEY `idx_rescue_hospital_id` (`hospital_id`),
  KEY `idx_rescue_shelter_id` (`shelter_id`),
  KEY `idx_rescue_verified_by` (`verified_by`),
  CONSTRAINT `fk_rescue_person` FOREIGN KEY (`person_id`) REFERENCES `missing_persons` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rescue_hospital` FOREIGN KEY (`hospital_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rescue_shelter` FOREIGN KEY (`shelter_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_rescue_verifier` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABLE: relief_centers
-- Resource tracking across relief hubs, camps, and community shelters.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `relief_centers`;
CREATE TABLE `relief_centers` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `location_id` BIGINT UNSIGNED NOT NULL,
  `organization` VARCHAR(150) NOT NULL,
  `food_status` ENUM('adequate', 'low', 'critical', 'depleted') NOT NULL DEFAULT 'adequate',
  `water_status` ENUM('adequate', 'low', 'critical', 'depleted') NOT NULL DEFAULT 'adequate',
  `medicine_status` ENUM('adequate', 'low', 'critical', 'depleted') NOT NULL DEFAULT 'adequate',
  `blanket_status` ENUM('adequate', 'low', 'critical', 'depleted') NOT NULL DEFAULT 'adequate',
  `other_resources` TEXT NULL,
  `contact_phone` VARCHAR(50) NOT NULL,
  `opening_hours` VARCHAR(100) NOT NULL DEFAULT '24/7',
  `status` ENUM('operational', 'overwhelmed', 'closed', 'relocating') NOT NULL DEFAULT 'operational',
  `last_updated` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_relief_location_id` (`location_id`),
  KEY `idx_relief_status` (`status`),
  KEY `idx_relief_organization` (`organization`),
  CONSTRAINT `fk_relief_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABLE: relief_requests
-- Citizen and field brigade requests for emergency food, water, medical, and shelter.
-- Privacy Notice: requester_name and phone are protected and redacted on public feeds.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `relief_requests`;
CREATE TABLE `relief_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `request_id` VARCHAR(50) NOT NULL,
  `requester_name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `location_id` BIGINT UNSIGNED NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `people_count` INT UNSIGNED NOT NULL DEFAULT 1,
  `request_type` ENUM('food_water', 'medical_evac', 'shelter_blankets', 'rescue_extraction', 'other') NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  `status` ENUM('pending', 'acknowledged', 'dispatched', 'fulfilled', 'cancelled') NOT NULL DEFAULT 'pending',
  `assigned_team` VARCHAR(150) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_relief_request_id` (`request_id`),
  KEY `idx_relief_req_location_id` (`location_id`),
  KEY `idx_relief_req_priority` (`priority`),
  KEY `idx_relief_req_status` (`status`),
  KEY `idx_relief_req_type` (`request_type`),
  KEY `idx_relief_req_created_at` (`created_at`),
  CONSTRAINT `fk_relief_req_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7.5 TABLE: official_sources
-- Authorized agencies and departments permitted to issue official advisories.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `official_sources`;
CREATE TABLE `official_sources` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `category` ENUM('Government of Nepal', 'NDRRMA', 'Nepal Police', 'Nepali Army', 'Armed Police Force', 'District Administration', 'Local Municipality', 'Other Authorized Organizations') NOT NULL,
  `website` VARCHAR(255) NULL,
  `contact_phone` VARCHAR(50) NULL,
  `is_verified_source` TINYINT(1) NOT NULL DEFAULT 1,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_source_code` (`code`),
  KEY `idx_source_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABLE: government_news
-- Official emergency bulletins, press releases, weather alerts, road updates, and evacuation orders.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `government_news`;
CREATE TABLE `government_news` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `summary` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `organization` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) NOT NULL DEFAULT 'SAFETY NOTICE',
  `priority` ENUM('critical', 'warning', 'info') NOT NULL DEFAULT 'info',
  `source_url` VARCHAR(500) NULL,
  `image` VARCHAR(500) NULL,
  `published_at` DATETIME NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `verification_status` ENUM('official', 'verified_bulletin', 'advisory', 'press_release', 'verified', 'unverified') NOT NULL DEFAULT 'verified',
  `is_important` TINYINT(1) NOT NULL DEFAULT 0,
  `is_published` TINYINT(1) NOT NULL DEFAULT 1,
  `is_archived` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` BIGINT UNSIGNED NULL,
  PRIMARY KEY (`id`),
  KEY `idx_news_published_at` (`published_at`),
  KEY `idx_news_verification_status` (`verification_status`),
  KEY `idx_news_organization` (`organization`),
  KEY `idx_news_category` (`category`),
  KEY `idx_news_priority` (`priority`),
  KEY `idx_news_is_published` (`is_published`),
  KEY `idx_news_is_important` (`is_important`),
  KEY `idx_news_created_by` (`created_by`),
  CONSTRAINT `fk_news_author` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABLE: emergency_contacts
-- Official emergency hotlines, police dispatches, army air wings, and medical stations.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `emergency_contacts`;
CREATE TABLE `emergency_contacts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `organization` VARCHAR(150) NOT NULL,
  `service` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `source` VARCHAR(150) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_contacts_is_active` (`is_active`),
  KEY `idx_contacts_service` (`service`),
  KEY `idx_contacts_organization` (`organization`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. TABLE: reports
-- Verification flags, sighting submissions, duplicate alerts, and community reports.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `reports`;
CREATE TABLE `reports` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `report_type` ENUM('missing_sighting', 'fraud_flag', 'duplicate_claim', 'data_update', 'location_hazard') NOT NULL,
  `reporter_id` BIGINT UNSIGNED NULL,
  `target_id` BIGINT UNSIGNED NOT NULL,
  `reason` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `status` ENUM('pending', 'investigating', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `resolved_at` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reports_status` (`status`),
  KEY `idx_reports_type` (`report_type`),
  KEY `idx_reports_reporter_id` (`reporter_id`),
  KEY `idx_reports_target_id` (`target_id`),
  KEY `idx_reports_created_at` (`created_at`),
  CONSTRAINT `fk_reports_reporter` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. TABLE: audit_logs
-- Immutable compliance and security ledger tracking access to sensitive private data.
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `entity_type` VARCHAR(100) NOT NULL,
  `entity_id` BIGINT UNSIGNED NULL,
  `ip_address` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_audit_user_id` (`user_id`),
  KEY `idx_audit_action` (`action`),
  KEY `idx_audit_entity` (`entity_type`, `entity_id`),
  KEY `idx_audit_created_at` (`created_at`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Re-enable Foreign Key checks
SET FOREIGN_KEY_CHECKS = 1;
