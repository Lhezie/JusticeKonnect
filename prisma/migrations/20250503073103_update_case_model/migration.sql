-- DropForeignKey
ALTER TABLE `Case` DROP FOREIGN KEY `ClientCaseRelation`;

-- AlterTable
ALTER TABLE `Case` MODIFY `clientId` INTEGER NULL,
    MODIFY `issueType` VARCHAR(191) NULL,
    MODIFY `address` VARCHAR(191) NULL,
    MODIFY `city` VARCHAR(191) NULL,
    MODIFY `zipCode` VARCHAR(191) NULL,
    MODIFY `country` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Case` ADD CONSTRAINT `ClientCaseRelation` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
