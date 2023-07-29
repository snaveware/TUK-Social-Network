/*
  Warnings:

  - You are about to drop the column `status` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `visbility` on the `posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "posts" DROP COLUMN "status",
DROP COLUMN "visbility",
ADD COLUMN     "visibility" "PostVisibility" NOT NULL DEFAULT 'public',
ALTER COLUMN "noOfRequests" SET DEFAULT 0,
ALTER COLUMN "noOfLikes" SET DEFAULT 0,
ALTER COLUMN "noOfComments" SET DEFAULT 0;

-- DropEnum
DROP TYPE "PostStatus";
