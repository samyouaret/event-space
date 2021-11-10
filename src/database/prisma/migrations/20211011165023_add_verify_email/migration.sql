-- CreateTable
CREATE TABLE `Diagnostic` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `diseaseName` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `treatment` TEXT NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `diseasePostId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `DiseasePost_fk`(`diseasePostId`),
    INDEX `user_fk`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiseasePost` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` TEXT NOT NULL,
    `description` TEXT NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `annotated` TINYINT NOT NULL DEFAULT 0,
    `userId` INTEGER NOT NULL,

    INDEX `user_fk`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Picture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `url` TEXT NOT NULL,
    `diseasePostId` INTEGER NOT NULL,

    INDEX `DiseasePost_fk`(`diseasePostId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` INTEGER NOT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerifyEmail` (
    `hash` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerifyEmail_hash_key`(`hash`),
    INDEX `verifyEmail_hash_index`(`hash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Diagnostic` ADD CONSTRAINT `Diagnostic_diseasePostId_fkey` FOREIGN KEY (`diseasePostId`) REFERENCES `DiseasePost`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diagnostic` ADD CONSTRAINT `Diagnostic_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiseasePost` ADD CONSTRAINT `DiseasePost_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Picture` ADD CONSTRAINT `Picture_diseasePostId_fkey` FOREIGN KEY (`diseasePostId`) REFERENCES `DiseasePost`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
