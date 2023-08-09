-- CreateTable
CREATE TABLE "_commentLikers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_commentLikers_AB_unique" ON "_commentLikers"("A", "B");

-- CreateIndex
CREATE INDEX "_commentLikers_B_index" ON "_commentLikers"("B");

-- AddForeignKey
ALTER TABLE "_commentLikers" ADD CONSTRAINT "_commentLikers_A_fkey" FOREIGN KEY ("A") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_commentLikers" ADD CONSTRAINT "_commentLikers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
