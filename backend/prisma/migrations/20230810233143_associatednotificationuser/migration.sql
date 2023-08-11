-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "associatedUserId" INTEGER;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_associatedUserId_fkey" FOREIGN KEY ("associatedUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
