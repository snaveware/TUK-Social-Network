-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_linkedPollId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_postId_fkey";

-- AlterTable
ALTER TABLE "messages" ALTER COLUMN "postId" DROP NOT NULL,
ALTER COLUMN "linkedPollId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_linkedPollId_fkey" FOREIGN KEY ("linkedPollId") REFERENCES "polls"("id") ON DELETE SET NULL ON UPDATE CASCADE;
