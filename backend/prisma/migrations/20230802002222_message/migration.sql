/*
  Warnings:

  - You are about to drop the column `attachedFileId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `pollId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `recipientId` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `noOfComments` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `noOfLikes` on the `posts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[linkedPollId]` on the table `messages` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `linkedPollId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_attachedFileId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_pollId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_recipientId_fkey";

-- DropIndex
DROP INDEX "messages_pollId_key";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "attachedFileId",
DROP COLUMN "pollId",
DROP COLUMN "recipientId",
ADD COLUMN     "linkedPollId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "posts" DROP COLUMN "noOfComments",
DROP COLUMN "noOfLikes";

-- CreateTable
CREATE TABLE "_FileToMessage" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_FileToMessage_AB_unique" ON "_FileToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_FileToMessage_B_index" ON "_FileToMessage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "messages_linkedPollId_key" ON "messages"("linkedPollId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_linkedPollId_fkey" FOREIGN KEY ("linkedPollId") REFERENCES "polls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToMessage" ADD CONSTRAINT "_FileToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToMessage" ADD CONSTRAINT "_FileToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
