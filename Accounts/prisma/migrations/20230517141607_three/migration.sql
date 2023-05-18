/*
  Warnings:

  - You are about to drop the column `profileId` on the `staffprofiles` table. All the data in the column will be lost.
  - You are about to drop the column `profileId` on the `studentprofiles` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `staffprofiles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `studentprofiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `staffprofiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `studentprofiles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "staffprofiles" DROP CONSTRAINT "staffprofiles_profileId_fkey";

-- DropForeignKey
ALTER TABLE "studentprofiles" DROP CONSTRAINT "studentprofiles_profileId_fkey";

-- DropIndex
DROP INDEX "staffprofiles_profileId_key";

-- DropIndex
DROP INDEX "studentprofiles_profileId_key";

-- AlterTable
ALTER TABLE "staffprofiles" DROP COLUMN "profileId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "studentprofiles" DROP COLUMN "profileId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "staffprofiles_userId_key" ON "staffprofiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "studentprofiles_userId_key" ON "studentprofiles"("userId");

-- AddForeignKey
ALTER TABLE "studentprofiles" ADD CONSTRAINT "studentprofiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffprofiles" ADD CONSTRAINT "staffprofiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
