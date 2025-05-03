-- CreateTable
CREATE TABLE `CallSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lawyerId` INTEGER NOT NULL,
    `clientId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ongoing',
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CallSession_lawyerId_fkey`(`lawyerId`),
    INDEX `CallSession_clientId_fkey`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VideoReview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `appointmentId` INTEGER NOT NULL,
    `notes` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `VideoReview_appointmentId_fkey`(`appointmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CallSession` ADD CONSTRAINT `CallSession_lawyerId_fkey` FOREIGN KEY (`lawyerId`) REFERENCES `Lawyer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CallSession` ADD CONSTRAINT `CallSession_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VideoReview` ADD CONSTRAINT `VideoReview_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `Appointment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
