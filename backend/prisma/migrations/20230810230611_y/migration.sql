-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "associatedChatId" INTEGER,
ADD COLUMN     "associatedCommentId" INTEGER,
ADD COLUMN     "associatedFileId" INTEGER,
ADD COLUMN     "associatedFolderId" INTEGER,
ADD COLUMN     "associatedMessageId" INTEGER,
ADD COLUMN     "associatedPostId" INTEGER,
ADD COLUMN     "fileId" INTEGER,
ADD COLUMN     "folderId" INTEGER;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associatedPostId_fkey" FOREIGN KEY ("associatedPostId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associatedChatId_fkey" FOREIGN KEY ("associatedChatId") REFERENCES "chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associatedMessageId_fkey" FOREIGN KEY ("associatedMessageId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associatedCommentId_fkey" FOREIGN KEY ("associatedCommentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associatedFileId_fkey" FOREIGN KEY ("associatedFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associatedFolderId_fkey" FOREIGN KEY ("associatedFolderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
