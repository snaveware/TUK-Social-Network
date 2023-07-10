/*
  Warnings:

  - The primary key for the `classes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `classCode` on the `classes` table. All the data in the column will be lost.
  - You are about to drop the column `classCode` on the `studentprofiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[chatId]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[programmeId,year]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chatId]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chatId]` on the table `schools` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year` to the `classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `classId` to the `studentprofiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "studentprofiles" DROP CONSTRAINT "studentprofiles_classCode_fkey";

-- AlterTable
ALTER TABLE "classes" DROP CONSTRAINT "classes_pkey",
DROP COLUMN "classCode",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL,
ADD CONSTRAINT "classes_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "studentprofiles" DROP COLUMN "classCode",
ADD COLUMN     "classId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "classes_chatId_key" ON "classes"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_programmeId_year_key" ON "classes"("programmeId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "roles_chatId_key" ON "roles"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_chatId_key" ON "schools"("chatId");

-- AddForeignKey
ALTER TABLE "studentprofiles" ADD CONSTRAINT "studentprofiles_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
