/*
  Warnings:

  - You are about to drop the column `fileId` on the `faculties` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `schools` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_fileId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_fileId_fkey";

-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "fileId";

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "visibility" "FileVisibility" NOT NULL DEFAULT 'private';

-- AlterTable
ALTER TABLE "schools" DROP COLUMN "fileId";

-- CreateTable
CREATE TABLE "_FacultyToFile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FacultyToFolder" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_folderAllowedChats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_allowedFolderViewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FolderToSchool" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_FileToSchool" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FacultyToFile_AB_unique" ON "_FacultyToFile"("A", "B");

-- CreateIndex
CREATE INDEX "_FacultyToFile_B_index" ON "_FacultyToFile"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FacultyToFolder_AB_unique" ON "_FacultyToFolder"("A", "B");

-- CreateIndex
CREATE INDEX "_FacultyToFolder_B_index" ON "_FacultyToFolder"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_folderAllowedChats_AB_unique" ON "_folderAllowedChats"("A", "B");

-- CreateIndex
CREATE INDEX "_folderAllowedChats_B_index" ON "_folderAllowedChats"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_allowedFolderViewers_AB_unique" ON "_allowedFolderViewers"("A", "B");

-- CreateIndex
CREATE INDEX "_allowedFolderViewers_B_index" ON "_allowedFolderViewers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FolderToSchool_AB_unique" ON "_FolderToSchool"("A", "B");

-- CreateIndex
CREATE INDEX "_FolderToSchool_B_index" ON "_FolderToSchool"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_FileToSchool_AB_unique" ON "_FileToSchool"("A", "B");

-- CreateIndex
CREATE INDEX "_FileToSchool_B_index" ON "_FileToSchool"("B");

-- AddForeignKey
ALTER TABLE "_FacultyToFile" ADD CONSTRAINT "_FacultyToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacultyToFile" ADD CONSTRAINT "_FacultyToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacultyToFolder" ADD CONSTRAINT "_FacultyToFolder_A_fkey" FOREIGN KEY ("A") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FacultyToFolder" ADD CONSTRAINT "_FacultyToFolder_B_fkey" FOREIGN KEY ("B") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_folderAllowedChats" ADD CONSTRAINT "_folderAllowedChats_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_folderAllowedChats" ADD CONSTRAINT "_folderAllowedChats_B_fkey" FOREIGN KEY ("B") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allowedFolderViewers" ADD CONSTRAINT "_allowedFolderViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allowedFolderViewers" ADD CONSTRAINT "_allowedFolderViewers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FolderToSchool" ADD CONSTRAINT "_FolderToSchool_A_fkey" FOREIGN KEY ("A") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FolderToSchool" ADD CONSTRAINT "_FolderToSchool_B_fkey" FOREIGN KEY ("B") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToSchool" ADD CONSTRAINT "_FileToSchool_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToSchool" ADD CONSTRAINT "_FileToSchool_B_fkey" FOREIGN KEY ("B") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
