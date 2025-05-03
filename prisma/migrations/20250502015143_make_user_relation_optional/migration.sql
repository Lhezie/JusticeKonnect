-- DropForeignKey
ALTER TABLE `Lawyer` DROP FOREIGN KEY `Lawyer_userId_fkey`;

-- AlterTable
ALTER TABLE `Lawyer` MODIFY `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Lawyer` ADD CONSTRAINT `Lawyer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
