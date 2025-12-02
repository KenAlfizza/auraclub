-- CreateTable
CREATE TABLE "_PromotionToTransaction" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PromotionToTransaction_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_PromotionToTransaction_B_index" ON "_PromotionToTransaction"("B");

-- AddForeignKey
ALTER TABLE "_PromotionToTransaction" ADD CONSTRAINT "_PromotionToTransaction_A_fkey" FOREIGN KEY ("A") REFERENCES "Promotion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromotionToTransaction" ADD CONSTRAINT "_PromotionToTransaction_B_fkey" FOREIGN KEY ("B") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
