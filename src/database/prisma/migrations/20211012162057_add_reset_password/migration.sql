-- CreateTable
CREATE TABLE `ResetPassword` (
    `hash` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `ResetPassword_hash_key`(`hash`),
    INDEX `resetPassword_hash_index`(`hash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
