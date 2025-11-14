-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;
