/*
  Warnings:

  - You are about to drop the column `availableSeats` on the `Event` table. All the data in the column will be lost.
  - Added the required column `takenSeats` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "availableSeats",
ADD COLUMN     "takenSeats" INTEGER NOT NULL;
