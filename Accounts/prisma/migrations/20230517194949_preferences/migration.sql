/*
  Warnings:

  - You are about to drop the column `staffId` on the `staffprofiles` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[staffRegistrationNumber]` on the table `staffprofiles` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `staffRegistrationNumber` to the `staffprofiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Titles" AS ENUM ('Prof', 'Dr', 'Mr', 'Ms', 'Mrs');

-- DropIndex
DROP INDEX "staffprofiles_staffId_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "staffprofiles" DROP COLUMN "staffId",
ADD COLUMN     "staffRegistrationNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username",
ADD COLUMN     "title" "Titles" NOT NULL,
ALTER COLUMN "profileAvatarId" DROP NOT NULL,
ALTER COLUMN "coverImageId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "staffprofiles_staffRegistrationNumber_key" ON "staffprofiles"("staffRegistrationNumber");
