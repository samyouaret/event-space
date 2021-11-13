/*
  Warnings:

  - Added the required column `reason` to the `TokenVerify` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenVerify" ADD COLUMN     "reason" VARCHAR(255) NOT NULL;
