/*
  Warnings:

  - A unique constraint covering the columns `[itemId,itemType]` on the table `Access` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,itemtype]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,itemtype]` on the table `folders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,itemtype]` on the table `polls` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,itemtype]` on the table `posts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_id_fkey";

-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_id_fkey";

-- DropForeignKey
ALTER TABLE "polls" DROP CONSTRAINT "polls_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_id_fkey";

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "itemtype" "ItemTypes" NOT NULL DEFAULT 'file';

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "itemtype" "ItemTypes" NOT NULL DEFAULT 'folder';

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "itemtype" "ItemTypes" NOT NULL DEFAULT 'poll';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "itemtype" "ItemTypes" NOT NULL DEFAULT 'post';

-- CreateIndex
CREATE UNIQUE INDEX "Access_itemId_itemType_key" ON "Access"("itemId", "itemType");

-- CreateIndex
CREATE UNIQUE INDEX "files_id_itemtype_key" ON "files"("id", "itemtype");

-- CreateIndex
CREATE UNIQUE INDEX "folders_id_itemtype_key" ON "folders"("id", "itemtype");

-- CreateIndex
CREATE UNIQUE INDEX "polls_id_itemtype_key" ON "polls"("id", "itemtype");

-- CreateIndex
CREATE UNIQUE INDEX "posts_id_itemtype_key" ON "posts"("id", "itemtype");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_id_itemtype_fkey" FOREIGN KEY ("id", "itemtype") REFERENCES "Access"("itemId", "itemType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_id_itemtype_fkey" FOREIGN KEY ("id", "itemtype") REFERENCES "Access"("itemId", "itemType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_id_itemtype_fkey" FOREIGN KEY ("id", "itemtype") REFERENCES "Access"("itemId", "itemType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_id_itemtype_fkey" FOREIGN KEY ("id", "itemtype") REFERENCES "Access"("itemId", "itemType") ON DELETE RESTRICT ON UPDATE CASCADE;
