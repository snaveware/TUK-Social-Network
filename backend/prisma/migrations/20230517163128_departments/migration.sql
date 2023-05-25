/*
  Warnings:

  - You are about to drop the column `departmentId` on the `programmes` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfYears` on the `programmes` table. All the data in the column will be lost.
  - You are about to drop the `departments` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[abbreviation]` on the table `programmes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `abbreviation` to the `programmes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `programmes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `roles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "classes" DROP CONSTRAINT "classes_classRepId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_HODId_fkey";

-- DropForeignKey
ALTER TABLE "departments" DROP CONSTRAINT "departments_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "faculties" DROP CONSTRAINT "faculties_executiveDeanId_fkey";

-- DropForeignKey
ALTER TABLE "programmes" DROP CONSTRAINT "programmes_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_directorId_fkey";

-- DropForeignKey
ALTER TABLE "staffprofiles" DROP CONSTRAINT "staffprofiles_departmentId_fkey";

-- AlterTable
ALTER TABLE "classes" ALTER COLUMN "classRepId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "faculties" ALTER COLUMN "executiveDeanId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "programmes" DROP COLUMN "departmentId",
DROP COLUMN "numberOfYears",
ADD COLUMN     "abbreviation" TEXT NOT NULL,
ADD COLUMN     "schoolId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "label" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "directorId" DROP NOT NULL;

-- DropTable
DROP TABLE "departments";

-- CreateIndex
CREATE UNIQUE INDEX "programmes_abbreviation_key" ON "programmes"("abbreviation");

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_classRepId_fkey" FOREIGN KEY ("classRepId") REFERENCES "studentprofiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "staffprofiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_executiveDeanId_fkey" FOREIGN KEY ("executiveDeanId") REFERENCES "staffprofiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
