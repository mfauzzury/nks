-- Bank Statement tables for JAN/BANK reconciliation (MT940, CSV from banks)
CREATE TABLE IF NOT EXISTS `BankStatementFile` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `bankCode` VARCHAR(20) NOT NULL,
  `bankName` VARCHAR(100) NOT NULL,
  `accountNo` VARCHAR(30) NOT NULL,
  `statementDate` DATE NOT NULL,
  `importedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `importedBy` VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',

  PRIMARY KEY (`id`),
  INDEX `BankStatementFile_bankCode_statementDate_idx`(`bankCode`, `statementDate`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `BankStatementTransaction` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `fileId` INTEGER NOT NULL,
  `paymentReference` VARCHAR(80) NULL,
  `approvalCode` VARCHAR(50) NULL,
  `chequeNo` VARCHAR(20) NULL,
  `valueDate` DATE NOT NULL,
  `amount` DECIMAL(18, 2) NOT NULL,
  `description` VARCHAR(255) NULL,
  `counterparty` VARCHAR(150) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `BankStatementTransaction_fileId_idx`(`fileId`),
  INDEX `BankStatementTransaction_paymentReference_idx`(`paymentReference`),
  INDEX `BankStatementTransaction_valueDate_amount_idx`(`valueDate`, `amount`),
  CONSTRAINT `BankStatementTransaction_fileId_fkey` FOREIGN KEY (`fileId`) REFERENCES `BankStatementFile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
