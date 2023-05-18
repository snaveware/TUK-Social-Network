-- CreateEnum
CREATE TYPE "Themes" AS ENUM ('dark', 'light');

-- CreateTable
CREATE TABLE "preferences" (
    "id" SERIAL NOT NULL,
    "getPushNotifications" BOOLEAN,
    "theme" "Themes" NOT NULL DEFAULT 'light',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "preferences_userId_key" ON "preferences"("userId");

-- AddForeignKey
ALTER TABLE "preferences" ADD CONSTRAINT "preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
