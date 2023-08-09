/*
  Warnings:

  - You are about to drop the column `senderChatId` on the `chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[manyChatId]` on the table `chats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_senderChatId_fkey";

-- DropIndex
DROP INDEX "chats_senderChatId_key";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "senderChatId",
ADD COLUMN     "manyChatId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "chats_manyChatId_key" ON "chats"("manyChatId");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_manyChatId_fkey" FOREIGN KEY ("manyChatId") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
