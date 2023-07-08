-- DropForeignKey
ALTER TABLE "schools" DROP CONSTRAINT "schools_studentProfileId_fkey";

-- AlterTable
ALTER TABLE "schools" ALTER COLUMN "studentProfileId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "studentprofiles"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
