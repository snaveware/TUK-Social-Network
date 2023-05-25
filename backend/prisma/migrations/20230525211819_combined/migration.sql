/*
  Warnings:

  - You are about to drop the column `classId` on the `studentprofiles` table. All the data in the column will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[roleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `roles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isOnline` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roleId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileAvatarId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `coverImageId` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'inactive', 'locked', 'deleted');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pending', 'sent', 'delivered', 'read', 'deleted');

-- CreateEnum
CREATE TYPE "BackgroundTypes" AS ENUM ('default', 'solid', 'image');

-- CreateEnum
CREATE TYPE "PostTypes" AS ENUM ('social', 'event', 'sellable', 'poll');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('public', 'private', 'protected');

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_roleId_fkey";

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_classRepId_fkey";

-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_programmeId_fkey";

-- DropForeignKey
ALTER TABLE "studentprofiles" DROP CONSTRAINT "studentprofiles_classId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_accountId_fkey";

-- AlterTable
ALTER TABLE "faculties" ADD COLUMN     "fileId" INTEGER;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "fileId" INTEGER;

-- AlterTable
ALTER TABLE "studentprofiles" DROP COLUMN "classId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "isOnline" BOOLEAN NOT NULL,
ADD COLUMN     "roleId" INTEGER NOT NULL,
ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'inactive',
ADD COLUMN     "title" "Titles",
DROP COLUMN "profileAvatarId",
ADD COLUMN     "profileAvatarId" INTEGER NOT NULL,
DROP COLUMN "coverImageId",
ADD COLUMN     "coverImageId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "classes";

-- CreateTable
CREATE TABLE "chats" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "profileId" INTEGER NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'pending',
    "chatId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "replyingToId" INTEGER,
    "postId" INTEGER NOT NULL,
    "pollId" INTEGER NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChatPreferences" (
    "id" SERIAL NOT NULL,
    "backgroundType" "BackgroundTypes" NOT NULL DEFAULT 'default',
    "backgroundColor" TEXT NOT NULL,
    "isChatMuted" BOOLEAN NOT NULL,
    "isChatPinned" BOOLEAN NOT NULL,
    "pinPosition" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "chatId" INTEGER NOT NULL,
    "backgroundImageId" INTEGER,

    CONSTRAINT "UserChatPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "caption" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "noOfRequests" INTEGER NOT NULL,
    "noOfLikes" INTEGER NOT NULL,
    "noOfComments" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" "PostTypes" NOT NULL DEFAULT 'social',
    "pollId" INTEGER,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Poll" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "results" JSONB NOT NULL,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'private',
    "noOfRequests" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" INTEGER,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_memberChats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_fileAllowedChats" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_readMessages" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_postReposters" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_postLikers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_sharedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_taggedPosts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_allowedFileViewers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_postId_key" ON "messages"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "messages_pollId_key" ON "messages"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChatPreferences_backgroundImageId_key" ON "UserChatPreferences"("backgroundImageId");

-- CreateIndex
CREATE UNIQUE INDEX "Post_pollId_key" ON "Post"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "_memberChats_AB_unique" ON "_memberChats"("A", "B");

-- CreateIndex
CREATE INDEX "_memberChats_B_index" ON "_memberChats"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_fileAllowedChats_AB_unique" ON "_fileAllowedChats"("A", "B");

-- CreateIndex
CREATE INDEX "_fileAllowedChats_B_index" ON "_fileAllowedChats"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_readMessages_AB_unique" ON "_readMessages"("A", "B");

-- CreateIndex
CREATE INDEX "_readMessages_B_index" ON "_readMessages"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_postReposters_AB_unique" ON "_postReposters"("A", "B");

-- CreateIndex
CREATE INDEX "_postReposters_B_index" ON "_postReposters"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_postLikers_AB_unique" ON "_postLikers"("A", "B");

-- CreateIndex
CREATE INDEX "_postLikers_B_index" ON "_postLikers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_sharedPosts_AB_unique" ON "_sharedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_sharedPosts_B_index" ON "_sharedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_taggedPosts_AB_unique" ON "_taggedPosts"("A", "B");

-- CreateIndex
CREATE INDEX "_taggedPosts_B_index" ON "_taggedPosts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_allowedFileViewers_AB_unique" ON "_allowedFileViewers"("A", "B");

-- CreateIndex
CREATE INDEX "_allowedFileViewers_B_index" ON "_allowedFileViewers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "roles_userId_key" ON "roles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_profileAvatarId_key" ON "users"("profileAvatarId");

-- CreateIndex
CREATE UNIQUE INDEX "users_coverImageId_key" ON "users"("coverImageId");

-- CreateIndex
CREATE UNIQUE INDEX "users_roleId_key" ON "users"("roleId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profileAvatarId_fkey" FOREIGN KEY ("profileAvatarId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_replyingToId_fkey" FOREIGN KEY ("replyingToId") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChatPreferences" ADD CONSTRAINT "UserChatPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChatPreferences" ADD CONSTRAINT "UserChatPreferences_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChatPreferences" ADD CONSTRAINT "UserChatPreferences_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_memberChats" ADD CONSTRAINT "_memberChats_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_memberChats" ADD CONSTRAINT "_memberChats_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_fileAllowedChats" ADD CONSTRAINT "_fileAllowedChats_A_fkey" FOREIGN KEY ("A") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_fileAllowedChats" ADD CONSTRAINT "_fileAllowedChats_B_fkey" FOREIGN KEY ("B") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_readMessages" ADD CONSTRAINT "_readMessages_A_fkey" FOREIGN KEY ("A") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_readMessages" ADD CONSTRAINT "_readMessages_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postReposters" ADD CONSTRAINT "_postReposters_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postReposters" ADD CONSTRAINT "_postReposters_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postLikers" ADD CONSTRAINT "_postLikers_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postLikers" ADD CONSTRAINT "_postLikers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedPosts" ADD CONSTRAINT "_sharedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedPosts" ADD CONSTRAINT "_sharedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taggedPosts" ADD CONSTRAINT "_taggedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taggedPosts" ADD CONSTRAINT "_taggedPosts_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allowedFileViewers" ADD CONSTRAINT "_allowedFileViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allowedFileViewers" ADD CONSTRAINT "_allowedFileViewers_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
