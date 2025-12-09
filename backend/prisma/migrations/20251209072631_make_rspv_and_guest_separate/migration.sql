/*
  Warnings:

  - You are about to drop the column `guestId` on the `EventRSVP` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventId,userId]` on the table `EventRSVP` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `EventRSVP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `EventRSVP` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "EventRSVP" DROP CONSTRAINT "EventRSVP_guestId_fkey";

-- DropIndex
DROP INDEX "EventRSVP_guestId_key";

-- AlterTable
ALTER TABLE "EventRSVP" DROP COLUMN "guestId",
ADD COLUMN     "eventId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EventRSVP_eventId_userId_key" ON "EventRSVP"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
