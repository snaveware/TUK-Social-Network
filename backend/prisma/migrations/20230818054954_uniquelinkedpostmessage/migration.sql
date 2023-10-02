-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_accessId_fkey";

-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_accessId_fkey";

-- DropForeignKey
ALTER TABLE "polls" DROP CONSTRAINT "polls_accessId_fkey";

-- DropIndex
DROP INDEX "messages_postId_key";

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;
