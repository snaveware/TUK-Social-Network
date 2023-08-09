/*
  Warnings:

  - A unique constraint covering the columns `[senderChatId]` on the table `chats` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "senderChatId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "chats_senderChatId_key" ON "chats"("senderChatId");

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_senderChatId_fkey" FOREIGN KEY ("senderChatId") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;
