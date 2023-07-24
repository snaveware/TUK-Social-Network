/*
  Warnings:

  - You are about to drop the column `folderId` on the `folders` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileAvatarId]` on the table `chats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_folderId_fkey";

-- AlterTable
ALTER TABLE "files" ALTER COLUMN "noOfRequests" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "folderId",
ADD COLUMN     "parentFolderId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "chats_profileAvatarId_key" ON "chats"("profileAvatarId");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
