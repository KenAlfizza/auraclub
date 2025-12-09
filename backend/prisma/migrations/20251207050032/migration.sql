/*
  Warnings:

  - A unique constraint covering the columns `[eventId,userId]` on the table `EventGuest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventGuest_eventId_userId_key" ON "EventGuest"("eventId", "userId");
