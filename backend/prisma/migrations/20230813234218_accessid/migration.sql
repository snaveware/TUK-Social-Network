/*
  Warnings:

  - You are about to drop the column `itemId` on the `Access` table. All the data in the column will be lost.
  - You are about to drop the column `itemtype` on the `files` table. All the data in the column will be lost.
  - You are about to drop the column `itemtype` on the `folders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_id_itemtype_fkey";

-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_id_itemtype_fkey";

-- DropForeignKey
ALTER TABLE "polls" DROP CONSTRAINT "polls_id_itemtype_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_id_itemtype_fkey";

-- DropIndex
DROP INDEX "Access_itemId_itemType_key";

-- DropIndex
DROP INDEX "files_id_itemtype_key";

-- DropIndex
DROP INDEX "folders_id_itemtype_key";

-- AlterTable
ALTER TABLE "Access" DROP COLUMN "itemId";

-- AlterTable
ALTER TABLE "files" DROP COLUMN "itemtype";

-- AlterTable
ALTER TABLE "folders" DROP COLUMN "itemtype";

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
