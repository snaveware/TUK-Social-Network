/*
  Warnings:

  - A unique constraint covering the columns `[rootFolderId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rootFolderId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "studentprofiles" DROP CONSTRAINT "studentprofiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "userchatpreferences" DROP CONSTRAINT "userchatpreferences_chatId_fkey";

-- DropForeignKey
ALTER TABLE "userchatpreferences" DROP CONSTRAINT "userchatpreferences_userId_fkey";

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rootFolderId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_rootFolderId_key" ON "users"("rootFolderId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rootFolderId_fkey" FOREIGN KEY ("rootFolderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentprofiles" ADD CONSTRAINT "studentprofiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userchatpreferences" ADD CONSTRAINT "userchatpreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userchatpreferences" ADD CONSTRAINT "userchatpreferences_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
