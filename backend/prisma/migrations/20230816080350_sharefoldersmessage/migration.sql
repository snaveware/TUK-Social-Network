-- CreateTable
CREATE TABLE "_FolderToMessage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FolderToMessage_AB_unique" ON "_FolderToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_FolderToMessage_B_index" ON "_FolderToMessage"("B");

-- AddForeignKey
ALTER TABLE "_FolderToMessage" ADD CONSTRAINT "_FolderToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FolderToMessage" ADD CONSTRAINT "_FolderToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
