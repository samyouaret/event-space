/*
  Warnings:

  - Added the required column `userId` to the `VerifyEmail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `VerifyEmail` ADD COLUMN `userId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `user_fk` ON `VerifyEmail`(`userId`);

-- AddForeignKey
ALTER TABLE `VerifyEmail` ADD CONSTRAINT `VerifyEmail_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
