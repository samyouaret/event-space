/*
  Warnings:

  - You are about to drop the column `CreatedAt` on the `TokenVerify` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TokenVerify" DROP COLUMN "CreatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
