/*
  Warnings:

  - Added the required column `type` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileTypes" AS ENUM ('video', 'image', 'pdf', 'word');

-- AlterTable
ALTER TABLE "files" ADD COLUMN     "type" "FileTypes" NOT NULL;
