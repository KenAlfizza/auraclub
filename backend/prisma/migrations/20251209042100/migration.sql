/*
  Warnings:

  - You are about to drop the column `rsvp` on the `EventGuest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventGuest" DROP COLUMN "rsvp";

-- CreateTable
CREATE TABLE "EventRSVP" (
    "id" SERIAL NOT NULL,
    "guestId" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "attended" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventRSVP_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventRSVP_guestId_key" ON "EventRSVP"("guestId");

-- AddForeignKey
ALTER TABLE "EventRSVP" ADD CONSTRAINT "EventRSVP_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "EventGuest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
