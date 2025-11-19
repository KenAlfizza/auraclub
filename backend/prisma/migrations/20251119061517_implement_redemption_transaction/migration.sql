-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "processedById" INTEGER,
ADD COLUMN     "redeemed" INTEGER;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
