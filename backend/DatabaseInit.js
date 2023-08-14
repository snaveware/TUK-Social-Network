const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Logger = require("./Logger");
const { UniversityData, Roles, Config } = require("./configs");

async function initDatabase() {
  // await prisma.comment.deleteMany();
  // await prisma.post.deleteMany();
  // await prisma.file.deleteMany();
  // await prisma.notification.deleteMany();
  // await prisma.message.deleteMany();
  // await prisma.studentProfile.deleteMany();
  // await prisma.staffProfile.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.folder.deleteMany();
  // await prisma.role.deleteMany();
  // await prisma.class.deleteMany();
  // await prisma.programme.deleteMany();
  // await prisma.school.deleteMany();
  // await prisma.chat.deleteMany();
  // await prisma.faculty.deleteMany();

  // return;

  Logger.info("Determining if there are faculties in DB...");
  const facultiesCount = await prisma.faculty.count();
  Logger.info(`Found ${facultiesCount} Faculties`);

  if (facultiesCount < 1) {
    await createFacultiesAndAssociatedObjects();
  }

  Logger.info("Determining if roles exist in the DB...");
  const rolesCount = await prisma.role.count();
  Logger.info(`Found ${rolesCount} Roles`);

  if (rolesCount < 1) {
    await createRoles();
  }

  Logger.info("Determining if users exist in the DB...");
  const usersCount = await prisma.user.count();
  Logger.info(`Found ${usersCount} Users`);

  if (usersCount < 1) {
    await createRootUser();
  }
}

async function createRoles() {
  Roles.map(async (role) => {
    let groupChatName = role.label + "s";

    if (role.name === "student") {
      groupChatName = "Block Z";
    } else if (role.name === "staff") {
      groupChatName = "Staffroom";
    } else if (role.name === "student_leader") {
      groupChatName = "SATUK";
    }

    await prisma.role.create({
      data: {
        ...role,
        chat: {
          create: {
            name: groupChatName,
            description: `A group chat for ${role.label}s`,
            chatType: "role",
          },
        },
      },
    });
  });
}

async function createRootUser() {
  const rootFolder = await prisma.folder.create({
    data: {
      name: Config.ADMIN.email,
      path: "",
      Access: {
        create: {
          itemType: "folder",
          isPublic: true,
        },
      },
    },
  });

  const rootUser = await prisma.user.create({
    data: {
      ...Config.ADMIN,
      rootFolderId: rootFolder.id,
    },
  });

  await prisma.folder.update({
    where: {
      id: rootFolder.id,
    },
    data: {
      owner: {
        connect: {
          id: rootUser.id,
        },
      },
    },
  });
}

async function createFacultiesAndAssociatedObjects() {
  Logger.info("Creating Faculties and Associated Objects...");

  UniversityData.map(async (faculty) => {
    const createdFaculty = await prisma.faculty.create({
      data: faculty.Faculty,
    });

    faculty.Schools.map(async (school) => {
      const createdSchool = await prisma.school.create({
        data: {
          ...school.School,
          faculty: {
            connect: { id: createdFaculty.id },
          },
          chat: {
            create: {
              name: school.School.abbreviation,
              description: `A Group Chat for ${school.School.abbreviation}`,
              chatType: "school",
            },
          },
        },
      });

      school.programmes.map(async (programme) => {
        await prisma.programme.create({
          data: {
            ...programme,
            school: {
              connect: { id: createdSchool.id },
            },
          },
        });
      });
    });
  });
}

module.exports = { PrismaClient, prisma, initDatabase };
