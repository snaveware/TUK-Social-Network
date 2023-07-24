-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_folderId_fkey";

-- AlterTable
ALTER TABLE "folders" ALTER COLUMN "folderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
