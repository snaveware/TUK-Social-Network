/*
  Warnings:

  - You are about to drop the column `adminId` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `folders` table. All the data in the column will be lost.
  - You are about to drop the `_FacultyToFile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FacultyToFolder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FileToSchool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FolderToSchool` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_allowedFileViewers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_allowedFolderViewers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_fileAllowedChats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_folderAllowedChats` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ItemTypes" AS ENUM ('post', 'file', 'folder', 'poll');

-- DropForeignKey
ALTER TABLE "_FacultyToFile" DROP CONSTRAINT "_FacultyToFile_A_fkey";

-- DropForeignKey
ALTER TABLE "_FacultyToFile" DROP CONSTRAINT "_FacultyToFile_B_fkey";

-- DropForeignKey
ALTER TABLE "_FacultyToFolder" DROP CONSTRAINT "_FacultyToFolder_A_fkey";

-- DropForeignKey
ALTER TABLE "_FacultyToFolder" DROP CONSTRAINT "_FacultyToFolder_B_fkey";

-- DropForeignKey
ALTER TABLE "_FileToSchool" DROP CONSTRAINT "_FileToSchool_A_fkey";

-- DropForeignKey
ALTER TABLE "_FileToSchool" DROP CONSTRAINT "_FileToSchool_B_fkey";

-- DropForeignKey
ALTER TABLE "_FolderToSchool" DROP CONSTRAINT "_FolderToSchool_A_fkey";

-- DropForeignKey
ALTER TABLE "_FolderToSchool" DROP CONSTRAINT "_FolderToSchool_B_fkey";

-- DropForeignKey
ALTER TABLE "_allowedFileViewers" DROP CONSTRAINT "_allowedFileViewers_A_fkey";

-- DropForeignKey
ALTER TABLE "_allowedFileViewers" DROP CONSTRAINT "_allowedFileViewers_B_fkey";

-- DropForeignKey
ALTER TABLE "_allowedFolderViewers" DROP CONSTRAINT "_allowedFolderViewers_A_fkey";

-- DropForeignKey
ALTER TABLE "_allowedFolderViewers" DROP CONSTRAINT "_allowedFolderViewers_B_fkey";

-- DropForeignKey
ALTER TABLE "_fileAllowedChats" DROP CONSTRAINT "_fileAllowedChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_fileAllowedChats" DROP CONSTRAINT "_fileAllowedChats_B_fkey";

-- DropForeignKey
ALTER TABLE "_folderAllowedChats" DROP CONSTRAINT "_folderAllowedChats_A_fkey";

-- DropForeignKey
ALTER TABLE "_folderAllowedChats" DROP CONSTRAINT "_folderAllowedChats_B_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_adminId_fkey";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "adminId";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "visibility";

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "visibility";

-- DropTable
DROP TABLE "_FacultyToFile";

-- DropTable
DROP TABLE "_FacultyToFolder";

-- DropTable
DROP TABLE "_FileToSchool";

-- DropTable
DROP TABLE "_FolderToSchool";

-- DropTable
DROP TABLE "_allowedFileViewers";

-- DropTable
DROP TABLE "_allowedFolderViewers";

-- DropTable
DROP TABLE "_fileAllowedChats";

-- DropTable
DROP TABLE "_folderAllowedChats";

-- DropEnum
DROP TYPE "FileVisibility";

-- CreateTable
CREATE TABLE "Access" (
    "itemId" INTEGER NOT NULL,
    "itemType" "ItemTypes" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Access_pkey" PRIMARY KEY ("itemId")
);

-- CreateTable
CREATE TABLE "_groupAdmins" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessToSchool" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessToClass" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessToFaculty" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessToProgramme" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_AccessToChat" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_groupAdmins_AB_unique" ON "_groupAdmins"("A", "B");

-- CreateIndex
CREATE INDEX "_groupAdmins_B_index" ON "_groupAdmins"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessToUser_AB_unique" ON "_AccessToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessToUser_B_index" ON "_AccessToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessToSchool_AB_unique" ON "_AccessToSchool"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessToSchool_B_index" ON "_AccessToSchool"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessToClass_AB_unique" ON "_AccessToClass"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessToClass_B_index" ON "_AccessToClass"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessToFaculty_AB_unique" ON "_AccessToFaculty"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessToFaculty_B_index" ON "_AccessToFaculty"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessToProgramme_AB_unique" ON "_AccessToProgramme"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessToProgramme_B_index" ON "_AccessToProgramme"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_AccessToChat_AB_unique" ON "_AccessToChat"("A", "B");

-- CreateIndex
CREATE INDEX "_AccessToChat_B_index" ON "_AccessToChat"("B");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("itemId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_groupAdmins" ADD CONSTRAINT "_groupAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_groupAdmins" ADD CONSTRAINT "_groupAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToUser" ADD CONSTRAINT "_AccessToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToUser" ADD CONSTRAINT "_AccessToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToSchool" ADD CONSTRAINT "_AccessToSchool_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToSchool" ADD CONSTRAINT "_AccessToSchool_B_fkey" FOREIGN KEY ("B") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToClass" ADD CONSTRAINT "_AccessToClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToClass" ADD CONSTRAINT "_AccessToClass_B_fkey" FOREIGN KEY ("B") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToFaculty" ADD CONSTRAINT "_AccessToFaculty_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToFaculty" ADD CONSTRAINT "_AccessToFaculty_B_fkey" FOREIGN KEY ("B") REFERENCES "faculties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToProgramme" ADD CONSTRAINT "_AccessToProgramme_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToProgramme" ADD CONSTRAINT "_AccessToProgramme_B_fkey" FOREIGN KEY ("B") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToChat" ADD CONSTRAINT "_AccessToChat_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("itemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToChat" ADD CONSTRAINT "_AccessToChat_B_fkey" FOREIGN KEY ("B") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
