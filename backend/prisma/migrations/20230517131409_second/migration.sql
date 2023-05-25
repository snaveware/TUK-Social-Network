/*
  Warnings:

  - You are about to drop the column `phoneNumber` on the `accounts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phoneNumber]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "accounts_phoneNumber_key";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "phoneNumber",
ADD COLUMN     "password" TEXT NOT NULL,
ALTER COLUMN "emailVerified" SET DEFAULT false,
ALTER COLUMN "phoneNumberVerified" SET DEFAULT false;

-- AlterTable
ALTER TABLE "staffprofiles" ADD COLUMN     "facultyId" INTEGER,
ADD COLUMN     "schoolId" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phoneNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- AddForeignKey
ALTER TABLE "staffprofiles" ADD CONSTRAINT "staffprofiles_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffprofiles" ADD CONSTRAINT "staffprofiles_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
