/*
  Warnings:

  - You are about to drop the column `getPushNotifications` on the `preferences` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `preferences` table. All the data in the column will be lost.
  - The primary key for the `staffprofiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `departmentId` on the `staffprofiles` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `staffprofiles` table. All the data in the column will be lost.
  - The primary key for the `studentprofiles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `studentprofiles` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Poll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserChatPreferences` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[studentProfileId]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chatType` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attachedFileId` to the `messages` table without a default value. This is not possible if the table is not empty.
  - Added the required column `favoriteColor` to the `preferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `preferences` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentProfileId` to the `schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `staffprofiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classCode` to the `studentprofiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "defaultAudiences" AS ENUM ('public', 'private', 'followers', 'myclass', 'myschool', 'myfaculty');

-- CreateEnum
CREATE TYPE "colors" AS ENUM ('orange', 'green', 'pink', 'purple', 'blue', 'teal', 'red');

-- CreateEnum
CREATE TYPE "Appearances" AS ENUM ('automatic', 'dark', 'light');

-- CreateEnum
CREATE TYPE "ChatTypes" AS ENUM ('class', 'group', 'private', 'public');

-- CreateEnum
CREATE TYPE "PostVisibility" AS ENUM ('public', 'friends', 'faculty', 'school');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('normal', 'reply');

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_postId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_pollId_fkey";

-- DropForeignKey
ALTER TABLE "UserChatPreferences" DROP CONSTRAINT "UserChatPreferences_backgroundImageId_fkey";

-- DropForeignKey
ALTER TABLE "UserChatPreferences" DROP CONSTRAINT "UserChatPreferences_chatId_fkey";

-- DropForeignKey
ALTER TABLE "UserChatPreferences" DROP CONSTRAINT "UserChatPreferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "_allowedFileViewers" DROP CONSTRAINT "_allowedFileViewers_A_fkey";

-- DropForeignKey
ALTER TABLE "_fileAllowedChats" DROP CONSTRAINT "_fileAllowedChats_B_fkey";

-- DropForeignKey
ALTER TABLE "_postLikers" DROP CONSTRAINT "_postLikers_A_fkey";

-- DropForeignKey
ALTER TABLE "_postReposters" DROP CONSTRAINT "_postReposters_A_fkey";

-- DropForeignKey
ALTER TABLE "_sharedPosts" DROP CONSTRAINT "_sharedPosts_A_fkey";

-- DropForeignKey
ALTER TABLE "_taggedPosts" DROP CONSTRAINT "_taggedPosts_A_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_profileId_fkey";

-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_executiveDeanId_fkey";

-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_fileId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_pollId_fkey";

-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_postId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_directorId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_fileId_fkey";

-- DropForeignKey
ALTER TABLE "staffprofiles" DROP CONSTRAINT "staffprofiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_coverImageId_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_profileAvatarId_fkey";

-- DropIndex
DROP INDEX "staffprofiles_userId_key";

-- DropIndex
DROP INDEX "studentprofiles_userId_key";

-- DropIndex
DROP INDEX "users_accountId_key";

-- DropIndex
DROP INDEX "users_phoneNumber_key";

-- AlterTable
ALTER TABLE "chats" ADD COLUMN     "chatType" "ChatTypes" NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "attachedFileId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "preferences" DROP COLUMN "getPushNotifications",
DROP COLUMN "theme",
ADD COLUMN     "appearance" "Appearances" NOT NULL DEFAULT 'automatic',
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "defaultAudience" "defaultAudiences" NOT NULL DEFAULT 'public',
ADD COLUMN     "favoriteColor" TEXT NOT NULL,
ADD COLUMN     "getFileSharedPushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "getMessagePushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "getPostSharingPushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "getTaggingPushNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "makeEmailPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "schools" ADD COLUMN     "studentProfileId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "staffprofiles" DROP CONSTRAINT "staffprofiles_pkey",
DROP COLUMN "departmentId",
DROP COLUMN "id",
ADD COLUMN     "title" "Titles" NOT NULL,
ADD CONSTRAINT "staffprofiles_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "studentprofiles" DROP CONSTRAINT "studentprofiles_pkey",
DROP COLUMN "id",
ADD COLUMN     "classCode" TEXT NOT NULL,
ADD COLUMN     "schoolId" INTEGER,
ADD CONSTRAINT "studentprofiles_pkey" PRIMARY KEY ("userId");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "accountId",
DROP COLUMN "phoneNumber",
DROP COLUMN "title",
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL,
ALTER COLUMN "noOfFollowers" SET DEFAULT 0,
ALTER COLUMN "isOnline" SET DEFAULT false,
ALTER COLUMN "profileAvatarId" DROP NOT NULL,
ALTER COLUMN "coverImageId" DROP NOT NULL;

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "Poll";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "UserChatPreferences";

-- DropEnum
DROP TYPE "Themes";

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "classCode" TEXT NOT NULL,
    "programmeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatId" INTEGER NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("classCode")
);

-- CreateTable
CREATE TABLE "userchatpreferences" (
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

    CONSTRAINT "userchatpreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
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
    "visbility" "PostVisibility" NOT NULL DEFAULT 'public',
    "status" "PostStatus" NOT NULL DEFAULT 'draft',

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "results" JSONB NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" INTEGER NOT NULL,
    "type" "CommentType" NOT NULL DEFAULT 'normal',
    "commentId" INTEGER,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "folders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "folderId" INTEGER NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "visibility" "FileVisibility" NOT NULL DEFAULT 'private',
    "noOfRequests" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" INTEGER,
    "folderId" INTEGER,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_userPostsSaved" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_userFileSaved" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "userchatpreferences_backgroundImageId_key" ON "userchatpreferences"("backgroundImageId");

-- CreateIndex
CREATE UNIQUE INDEX "posts_pollId_key" ON "posts"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "_userPostsSaved_AB_unique" ON "_userPostsSaved"("A", "B");

-- CreateIndex
CREATE INDEX "_userPostsSaved_B_index" ON "_userPostsSaved"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_userFileSaved_AB_unique" ON "_userFileSaved"("A", "B");

-- CreateIndex
CREATE INDEX "_userFileSaved_B_index" ON "_userFileSaved"("B");

-- CreateIndex
CREATE UNIQUE INDEX "schools_studentProfileId_key" ON "schools"("studentProfileId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profileAvatarId_fkey" FOREIGN KEY ("profileAvatarId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentprofiles" ADD CONSTRAINT "studentprofiles_classCode_fkey" FOREIGN KEY ("classCode") REFERENCES "classes"("classCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffprofiles" ADD CONSTRAINT "staffprofiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "staffprofiles"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "studentprofiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_executiveDeanId_fkey" FOREIGN KEY ("executiveDeanId") REFERENCES "staffprofiles"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_attachedFileId_fkey" FOREIGN KEY ("attachedFileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userchatpreferences" ADD CONSTRAINT "userchatpreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userchatpreferences" ADD CONSTRAINT "userchatpreferences_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userchatpreferences" ADD CONSTRAINT "userchatpreferences_backgroundImageId_fkey" FOREIGN KEY ("backgroundImageId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "polls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_fileAllowedChats" ADD CONSTRAINT "_fileAllowedChats_B_fkey" FOREIGN KEY ("B") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postReposters" ADD CONSTRAINT "_postReposters_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_postLikers" ADD CONSTRAINT "_postLikers_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_sharedPosts" ADD CONSTRAINT "_sharedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_taggedPosts" ADD CONSTRAINT "_taggedPosts_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userPostsSaved" ADD CONSTRAINT "_userPostsSaved_A_fkey" FOREIGN KEY ("A") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userPostsSaved" ADD CONSTRAINT "_userPostsSaved_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_allowedFileViewers" ADD CONSTRAINT "_allowedFileViewers_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFileSaved" ADD CONSTRAINT "_userFileSaved_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_userFileSaved" ADD CONSTRAINT "_userFileSaved_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
