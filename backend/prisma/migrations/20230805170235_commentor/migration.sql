/*
  Warnings:

  - Added the required column `commentorId` to the `comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "commentorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_commentorId_fkey" FOREIGN KEY ("commentorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
