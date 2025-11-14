/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `LoginToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "LoginToken_userId_key" ON "LoginToken"("userId");
