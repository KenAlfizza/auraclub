/*
  Warnings:

  - You are about to drop the column `createdAt` on the `UserPoints` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserPoints" DROP COLUMN "createdAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
