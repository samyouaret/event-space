/*
  Warnings:

  - Added the required column `availableSeats` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seats` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "user_fk";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "availableSeats" INTEGER NOT NULL,
ADD COLUMN     "endSale" TIMESTAMP(0),
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "seats" INTEGER NOT NULL,
ADD COLUMN     "startSale" TIMESTAMP(0);
