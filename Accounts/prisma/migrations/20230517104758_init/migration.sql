-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "phoneNumberVerified" BOOLEAN NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "permissions" TEXT[],

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "profileAvatarId" TEXT NOT NULL,
    "coverImageId" TEXT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "noOfFollowers" INTEGER NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studentprofiles" (
    "id" SERIAL NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "studentprofiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staffprofiles" (
    "id" SERIAL NOT NULL,
    "staffId" TEXT NOT NULL,
    "profileId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "staffprofiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "classes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "yearOfJoining" INTEGER NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "programmeId" INTEGER NOT NULL,
    "classRepId" INTEGER NOT NULL,

    CONSTRAINT "classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "numberOfYears" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "schoolId" INTEGER NOT NULL,
    "HODId" INTEGER NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbrevition" TEXT NOT NULL,
    "facultyId" INTEGER NOT NULL,
    "directorId" INTEGER NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faculties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "abbrevition" TEXT NOT NULL,
    "executiveDeanId" INTEGER NOT NULL,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_follows" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_blocks" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_email_key" ON "accounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_phoneNumber_key" ON "accounts"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_profileAvatarId_key" ON "users"("profileAvatarId");

-- CreateIndex
CREATE UNIQUE INDEX "users_coverImageId_key" ON "users"("coverImageId");

-- CreateIndex
CREATE UNIQUE INDEX "users_accountId_key" ON "users"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "studentprofiles_registrationNumber_key" ON "studentprofiles"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "studentprofiles_profileId_key" ON "studentprofiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "staffprofiles_staffId_key" ON "staffprofiles"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "staffprofiles_profileId_key" ON "staffprofiles"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_name_key" ON "classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "classes_classRepId_key" ON "classes"("classRepId");

-- CreateIndex
CREATE UNIQUE INDEX "programmes_name_key" ON "programmes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_HODId_key" ON "departments"("HODId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_name_key" ON "schools"("name");

-- CreateIndex
CREATE UNIQUE INDEX "schools_directorId_key" ON "schools"("directorId");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_name_key" ON "faculties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "faculties_executiveDeanId_key" ON "faculties"("executiveDeanId");

-- CreateIndex
CREATE UNIQUE INDEX "_follows_AB_unique" ON "_follows"("A", "B");

-- CreateIndex
CREATE INDEX "_follows_B_index" ON "_follows"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_blocks_AB_unique" ON "_blocks"("A", "B");

-- CreateIndex
CREATE INDEX "_blocks_B_index" ON "_blocks"("B");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentprofiles" ADD CONSTRAINT "studentprofiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studentprofiles" ADD CONSTRAINT "studentprofiles_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffprofiles" ADD CONSTRAINT "staffprofiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staffprofiles" ADD CONSTRAINT "staffprofiles_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "programmes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "classes" ADD CONSTRAINT "classes_classRepId_fkey" FOREIGN KEY ("classRepId") REFERENCES "studentprofiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programmes" ADD CONSTRAINT "programmes_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_HODId_fkey" FOREIGN KEY ("HODId") REFERENCES "staffprofiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "staffprofiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_executiveDeanId_fkey" FOREIGN KEY ("executiveDeanId") REFERENCES "staffprofiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_follows" ADD CONSTRAINT "_follows_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_follows" ADD CONSTRAINT "_follows_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocks" ADD CONSTRAINT "_blocks_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_blocks" ADD CONSTRAINT "_blocks_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
