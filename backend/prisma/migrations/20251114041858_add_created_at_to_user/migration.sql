/*
  Warnings:

  - Made the column `createdAt` on table `LoginToken` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LoginToken" ALTER COLUMN "createdAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
