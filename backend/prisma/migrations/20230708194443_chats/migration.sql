/*
  Warnings:

  - You are about to drop the column `profileId` on the `chats` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatId` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ChatTypes" ADD VALUE 'role';

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_profileId_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_userId_fkey";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "profileId",
ADD COLUMN     "profileAvatarId" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "chatId" INTEGER NOT NULL,
ADD COLUMN     "level" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "chatId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_profileAvatarId_fkey" FOREIGN KEY ("profileAvatarId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
