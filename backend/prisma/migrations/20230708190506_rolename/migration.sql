/*
  Warnings:

  - The primary key for the `roles` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `roles` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleName]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roleName` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_userId_fkey";

-- DropIndex
DROP INDEX "roles_name_key";

-- DropIndex
DROP INDEX "roles_userId_key";

-- DropIndex
DROP INDEX "users_roleId_key";

-- AlterTable
ALTER TABLE "roles" DROP CONSTRAINT "roles_pkey",
DROP COLUMN "id",
DROP COLUMN "userId",
ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "users" DROP COLUMN "roleId",
ADD COLUMN     "roleName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_roleName_key" ON "users"("roleName");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES "roles"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
