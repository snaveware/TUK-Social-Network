/*
  Warnings:

  - You are about to drop the column `abbrevition` on the `faculties` table. All the data in the column will be lost.
  - You are about to drop the column `abbrevition` on the `schools` table. All the data in the column will be lost.
  - Added the required column `abbreviation` to the `faculties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `abbreviation` to the `schools` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "faculties" DROP COLUMN "abbrevition",
ADD COLUMN     "abbreviation" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "schools" DROP COLUMN "abbrevition",
ADD COLUMN     "abbreviation" TEXT NOT NULL;
