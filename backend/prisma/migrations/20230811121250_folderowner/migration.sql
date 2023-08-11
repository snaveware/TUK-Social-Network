-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_ownerId_fkey";

-- AlterTable
ALTER TABLE "folders" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
