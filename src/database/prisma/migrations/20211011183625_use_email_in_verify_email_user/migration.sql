/*
  Warnings:

  - You are about to drop the column `userId` on the `VerifyEmail` table. All the data in the column will be lost.
  - Added the required column `email` to the `VerifyEmail` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `VerifyEmail` DROP FOREIGN KEY `VerifyEmail_userId_fkey`;

-- AlterTable
ALTER TABLE `VerifyEmail` DROP COLUMN `userId`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `email_index` ON `User`(`email`);
