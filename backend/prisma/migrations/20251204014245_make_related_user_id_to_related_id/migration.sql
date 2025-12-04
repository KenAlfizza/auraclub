/*
  Warnings:

  - You are about to drop the column `relatedUserId` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "relatedUserId",
ADD COLUMN     "relatedId" INTEGER;
