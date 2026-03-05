-- Add AI File Parser columns to IntegrationFile (Intelligent File Upload)
-- Run via: npx prisma db execute --file prisma/migrations/add_integration_ai_columns.sql

ALTER TABLE `IntegrationFile` ADD COLUMN `columnMappingJson` TEXT NULL;
ALTER TABLE `IntegrationFile` ADD COLUMN `aiDetectedSource` VARCHAR(30) NULL;
ALTER TABLE `IntegrationFile` ADD COLUMN `aiConfidence` DOUBLE NULL;
