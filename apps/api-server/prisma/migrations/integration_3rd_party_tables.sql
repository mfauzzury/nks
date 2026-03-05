-- =============================================================================
-- Integration 3rd Party Module - Table Creation Script
-- =============================================================================
-- Aligns with screens: Kategori Sumber, Sumber Data, File Upload
-- Based on: NKS_Integration_3rd_Party_SRS.md + existing UI
--
-- DO NOT RUN YET - Review first. Use via: prisma db execute --file ...
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. IntegrationSourceCategory (Kategori Sumber)
-- Replaces Setting.sourceCategories JSON
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationSourceCategory` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `notes` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `IntegrationSourceCategory_code_idx` (`code`),
  INDEX `IntegrationSourceCategory_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. IntegrationSource (Sumber Data)
-- Replaces Setting.sourceData JSON. FK to IntegrationSourceCategory.
-- File Upload "Sumber" dropdown uses this table.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationSource` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(30) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `categoryId` INT NOT NULL,
  `transportType` VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `notes` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`categoryId`) REFERENCES `IntegrationSourceCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX `IntegrationSource_code_idx` (`code`),
  INDEX `IntegrationSource_categoryId_idx` (`categoryId`),
  INDEX `IntegrationSource_isActive_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. IntegrationFile (File Upload - File Intake & Control Totals)
-- Created when user uploads file via File Upload screen.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationFile` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `sourceId` INT NOT NULL,
  `fileName` VARCHAR(255) NOT NULL,
  `fileHashSha256` CHAR(64) NOT NULL,
  `receivedChannel` VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
  `fileType` VARCHAR(30) NOT NULL DEFAULT 'ENCRYPTED_TXT',
  `description` TEXT,
  `receivedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `encrypted` BOOLEAN NOT NULL DEFAULT true,
  `encryptionMethod` VARCHAR(50),
  `decryptStatus` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `validationStatus` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `processingStatus` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `totalRecordsDeclared` INT,
  `totalAmountDeclared` DECIMAL(18, 2),
  `totalRecordsParsed` INT,
  `totalAmountParsed` DECIMAL(18, 2),
  `errorSummary` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`sourceId`) REFERENCES `IntegrationSource`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  UNIQUE INDEX `IntegrationFile_fileHashSha256_key` (`fileHashSha256`),
  INDEX `IntegrationFile_sourceId_idx` (`sourceId`),
  INDEX `IntegrationFile_receivedAt_idx` (`receivedAt`),
  INDEX `IntegrationFile_processingStatus_idx` (`processingStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. IntegrationFileEvent (Operational Timeline)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationFileEvent` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fileId` INT NOT NULL,
  `eventType` VARCHAR(30) NOT NULL,
  `eventStatus` VARCHAR(20) NOT NULL,
  `eventMessage` TEXT,
  `createdBy` VARCHAR(50) DEFAULT 'SYSTEM',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`fileId`) REFERENCES `IntegrationFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `IntegrationFileEvent_fileId_idx` (`fileId`),
  INDEX `IntegrationFileEvent_eventType_idx` (`eventType`),
  INDEX `IntegrationFileEvent_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. IntegrationStagingTx (Parsed Transactions Staging)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationStagingTx` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fileId` INT NOT NULL,
  `sourceTxRef` VARCHAR(80),
  `payerIc` VARCHAR(14),
  `payerName` VARCHAR(150),
  `txDate` DATE NOT NULL,
  `txTime` TIME,
  `amount` DECIMAL(18, 2) NOT NULL,
  `channel` VARCHAR(30),
  `currency` CHAR(3) NOT NULL DEFAULT 'MYR',
  `recordHash` CHAR(64) NOT NULL,
  `stagingStatus` VARCHAR(20) NOT NULL DEFAULT 'NEW',
  `validationErrors` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`fileId`) REFERENCES `IntegrationFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE INDEX `IntegrationStagingTx_fileId_recordHash_key` (`fileId`, `recordHash`),
  INDEX `IntegrationStagingTx_fileId_idx` (`fileId`),
  INDEX `IntegrationStagingTx_payerIc_txDate_amount_idx` (`payerIc`, `txDate`, `amount`),
  INDEX `IntegrationStagingTx_stagingStatus_idx` (`stagingStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. IntegrationStagingDuplicate (Duplicate Detection Findings)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationStagingDuplicate` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `stagingTxId` INT NOT NULL,
  `duplicateType` VARCHAR(30) NOT NULL,
  `matchedStagingTxId` INT,
  `matchedInternalTxId` VARCHAR(36),
  `reason` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`stagingTxId`) REFERENCES `IntegrationStagingTx`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `IntegrationStagingDuplicate_stagingTxId_idx` (`stagingTxId`),
  INDEX `IntegrationStagingDuplicate_duplicateType_idx` (`duplicateType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. IntegrationJob (Queue/Batch Orchestration)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationJob` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `fileId` INT NOT NULL,
  `jobType` VARCHAR(30) NOT NULL,
  `jobStatus` VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  `attempt` INT NOT NULL DEFAULT 0,
  `maxAttempts` INT NOT NULL DEFAULT 5,
  `lockedBy` VARCHAR(50),
  `lockedAt` DATETIME(3),
  `lastError` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`fileId`) REFERENCES `IntegrationFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `IntegrationJob_fileId_idx` (`fileId`),
  INDEX `IntegrationJob_jobType_idx` (`jobType`),
  INDEX `IntegrationJob_jobStatus_idx` (`jobStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. ReconciliationResult (Match Output)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ReconciliationResult` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `stagingTxId` INT NOT NULL,
  `internalTxId` VARCHAR(36),
  `matchStatus` VARCHAR(20) NOT NULL,
  `matchRule` VARCHAR(50),
  `confidenceScore` DECIMAL(5, 2),
  `exceptionCode` VARCHAR(30),
  `exceptionDetail` TEXT,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`stagingTxId`) REFERENCES `IntegrationStagingTx`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `ReconciliationResult_stagingTxId_idx` (`stagingTxId`),
  INDEX `ReconciliationResult_matchStatus_idx` (`matchStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. ReconciliationAction (Supervisor Review & Resolution)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ReconciliationAction` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `reconId` INT NOT NULL,
  `actionType` VARCHAR(30) NOT NULL,
  `actionNote` TEXT,
  `actedBy` VARCHAR(50) NOT NULL,
  `actedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`reconId`) REFERENCES `ReconciliationResult`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `ReconciliationAction_reconId_idx` (`reconId`),
  INDEX `ReconciliationAction_actionType_idx` (`actionType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. IntegrationConfig (Runtime Config & Rules) - Optional
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `IntegrationConfig` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `sourceId` INT,
  `configKey` VARCHAR(80) NOT NULL,
  `configValue` TEXT NOT NULL,
  `isSecret` BOOLEAN NOT NULL DEFAULT false,
  `effectiveFrom` DATETIME(3),
  `effectiveTo` DATETIME(3),
  `updatedBy` VARCHAR(50) DEFAULT 'SYSTEM',
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (`sourceId`) REFERENCES `IntegrationSource`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `IntegrationConfig_sourceId_idx` (`sourceId`),
  INDEX `IntegrationConfig_configKey_idx` (`configKey`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- SEED: Default Kategori Sumber (matches current DEFAULT_SOURCE_CATEGORIES)
-- -----------------------------------------------------------------------------
INSERT INTO `IntegrationSourceCategory` (`code`, `name`, `isActive`, `notes`)
VALUES
  ('SPG', 'Skim Potongan Gaji (SPG)', true, ''),
  ('PSP', 'Platform Saluran Pembayaran (PSP)', true, ''),
  ('BANK', 'BANK', true, '')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = CURRENT_TIMESTAMP(3);

-- -----------------------------------------------------------------------------
-- SEED: Default Sumber Data (matches current DEFAULT_SOURCE_DATA + File Upload)
-- Requires category IDs - use subquery
-- -----------------------------------------------------------------------------
INSERT INTO `IntegrationSource` (`code`, `name`, `categoryId`, `transportType`, `isActive`, `notes`)
SELECT 'JAN', 'Jabatan Akauntan Negara', id, 'MANUAL', true, ''
FROM `IntegrationSourceCategory` WHERE `code` = 'SPG' LIMIT 1
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = CURRENT_TIMESTAMP(3);

INSERT INTO `IntegrationSource` (`code`, `name`, `categoryId`, `transportType`, `isActive`, `notes`)
SELECT 'BILPIZ', 'BilPiz', id, 'MANUAL', true, ''
FROM `IntegrationSourceCategory` WHERE `code` = 'PSP' LIMIT 1
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = CURRENT_TIMESTAMP(3);

INSERT INTO `IntegrationSource` (`code`, `name`, `categoryId`, `transportType`, `isActive`, `notes`)
SELECT 'BANK_ISLAM', 'Bank Islam', id, 'MANUAL', true, ''
FROM `IntegrationSourceCategory` WHERE `code` = 'BANK' LIMIT 1
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = CURRENT_TIMESTAMP(3);

INSERT INTO `IntegrationSource` (`code`, `name`, `categoryId`, `transportType`, `isActive`, `notes`)
SELECT 'MAYBANK', 'Maybank', id, 'MANUAL', true, ''
FROM `IntegrationSourceCategory` WHERE `code` = 'BANK' LIMIT 1
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `updatedAt` = CURRENT_TIMESTAMP(3);
