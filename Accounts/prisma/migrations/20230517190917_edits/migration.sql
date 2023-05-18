-- AlterTable
ALTER TABLE "staffprofiles" ADD COLUMN     "position" TEXT NOT NULL DEFAULT 'Staff';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT;
