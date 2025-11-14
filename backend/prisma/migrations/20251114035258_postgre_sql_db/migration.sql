-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('regular', 'cashier', 'manager', 'superuser');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('purchase', 'redemption', 'adjustment', 'event', 'transfer');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('automatic', 'onetime');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
