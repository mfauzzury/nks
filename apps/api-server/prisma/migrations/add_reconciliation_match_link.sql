-- ReconciliationMatchLink for one-to-many (1:N) mapping
CREATE TABLE IF NOT EXISTS `ReconciliationMatchLink` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reconResultId` INTEGER NOT NULL,
  `internalTxId` VARCHAR(80) NOT NULL,
  `amountAllocated` DECIMAL(18, 2) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `ReconciliationMatchLink_reconResultId_internalTxId_key`(`reconResultId`, `internalTxId`),
  INDEX `ReconciliationMatchLink_internalTxId_idx`(`internalTxId`),
  CONSTRAINT `ReconciliationMatchLink_reconResultId_fkey` FOREIGN KEY (`reconResultId`) REFERENCES `ReconciliationResult`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Extend internalTxId length for BankStatementTransaction-xxx
ALTER TABLE `ReconciliationResult` MODIFY COLUMN `internalTxId` VARCHAR(80) NULL;
