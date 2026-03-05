-- Add filePath column to IntegrationFile for storing uploaded file path
-- Run via: npx prisma db execute --file prisma/migrations/add_integration_file_path.sql
-- Skip if column already exists (e.g. after prisma db push)

ALTER TABLE `IntegrationFile` ADD COLUMN `filePath` VARCHAR(500) NULL AFTER `fileName`;
