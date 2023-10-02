/*
  Warnings:

  - A unique constraint covering the columns `[accessId]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessId]` on the table `folders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessId]` on the table `polls` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[accessId]` on the table `posts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accessId` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessId` to the `folders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessId` to the `polls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accessId` to the `posts` table without a default value. This is not possible if the table is not empty.

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
ALTER TABLE "files" ADD COLUMN     "accessId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "folders" ADD COLUMN     "accessId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "polls" ADD COLUMN     "accessId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "accessId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "files_accessId_key" ON "files"("accessId");

-- CreateIndex
CREATE UNIQUE INDEX "folders_accessId_key" ON "folders"("accessId");

-- CreateIndex
CREATE UNIQUE INDEX "polls_accessId_key" ON "polls"("accessId");

-- CreateIndex
CREATE UNIQUE INDEX "posts_accessId_key" ON "posts"("accessId");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
