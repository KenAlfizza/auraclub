/*
  Warnings:

  - You are about to drop the `_PromotionToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_PromotionToUser" DROP CONSTRAINT "_PromotionToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_PromotionToUser" DROP CONSTRAINT "_PromotionToUser_B_fkey";

-- DropTable
DROP TABLE "_PromotionToUser";

-- CreateTable
CREATE TABLE "_UserPromotionsUsed" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_UserPromotionsUsed_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserPromotionsUsed_B_index" ON "_UserPromotionsUsed"("B");

-- AddForeignKey
ALTER TABLE "_UserPromotionsUsed" ADD CONSTRAINT "_UserPromotionsUsed_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserPromotionsUsed" ADD CONSTRAINT "_UserPromotionsUsed_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
