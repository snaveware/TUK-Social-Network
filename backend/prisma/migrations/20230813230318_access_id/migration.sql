/*
  Warnings:

  - The primary key for the `Access` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_AccessToChat" DROP CONSTRAINT "_AccessToChat_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessToClass" DROP CONSTRAINT "_AccessToClass_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessToFaculty" DROP CONSTRAINT "_AccessToFaculty_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessToProgramme" DROP CONSTRAINT "_AccessToProgramme_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessToSchool" DROP CONSTRAINT "_AccessToSchool_A_fkey";

-- DropForeignKey
ALTER TABLE "_AccessToUser" DROP CONSTRAINT "_AccessToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "files" DROP CONSTRAINT "files_id_fkey";

-- DropForeignKey
ALTER TABLE "folders" DROP CONSTRAINT "folders_id_fkey";

-- DropForeignKey
ALTER TABLE "polls" DROP CONSTRAINT "polls_id_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_id_fkey";

-- AlterTable
ALTER TABLE "Access" DROP CONSTRAINT "Access_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Access_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polls" ADD CONSTRAINT "polls_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_id_fkey" FOREIGN KEY ("id") REFERENCES "Access"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToUser" ADD CONSTRAINT "_AccessToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToSchool" ADD CONSTRAINT "_AccessToSchool_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToClass" ADD CONSTRAINT "_AccessToClass_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToFaculty" ADD CONSTRAINT "_AccessToFaculty_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToProgramme" ADD CONSTRAINT "_AccessToProgramme_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AccessToChat" ADD CONSTRAINT "_AccessToChat_A_fkey" FOREIGN KEY ("A") REFERENCES "Access"("id") ON DELETE CASCADE ON UPDATE CASCADE;
