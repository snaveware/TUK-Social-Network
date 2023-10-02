const { resolve } = require("path");
global.appRoot = resolve(__dirname);

/**
 * Third Party Modules
 */
require("dotenv").config();

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const fs = require("fs");

/**
 * App,Server, Io imports
 *
 */

const { io, server, app, PORT } = require("./server");

/**
 * Prisma Client Initialization
 */

const { prisma, PrismaClient, initDatabase } = require("./DatabaseInit");

/**
 * Custom Modules
 */

const Logger = require("./Logger");
const RequestHandler = require("./RequestHandler");

const { Config } = require("./configs");

/** log folder */

const folderName = global.appRoot + "/logs/";

try {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
} catch (err) {
  console.error(err);
  Logger.error(err);
  process.emit("SIGINT", { reason: "Failed to create logs folder" });
}

/** uploads folder */

const uploadsFolderName = global.appRoot + "/uploads/";

try {
  if (!fs.existsSync(uploadsFolderName)) {
    fs.mkdirSync(uploadsFolderName);
  }
} catch (err) {
  console.error(err);
  Logger.error(err);
  process.emit("SIGINT", { reason: "Failed to create uploads folder folder" });
}

/**
 * Setup Swagger API Documentation if environment is not production
 */

if (Config.NODE_ENV === "development" || Config.NODE_ENV === "testing") {
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "starmeet",
        version: "1.0.0",
        description: "API endpoints TUK Social Network",
      },
    },

    apis: ["./services/*/APIDocs.yaml"],
  };

  const specs = swaggerJsDoc(swaggerOptions);

  app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
}

/**
 * DB Preview
 */
if (Config.NODE_ENV === "development" || Config.NODE_ENV === "testing") {
  app.get("/dbPreview", async (req, res) => {
    const getDB = async () => {
      const users = await prisma.user.findMany({
        include: {
          studentProfileIfIsStudent: true,
          staffProfileIfIsStaff: true,
          repostedPosts: true,
        },
      });

      const chats = await prisma.chat.findMany({
        include: {
          messages: {
            include: {
              linkedPoll: true,
              linkedPost: true,
              attachedFiles: {
                include: {
                  owner: {
                    select: {
                      id: true,
                      profileAvatarId: true,
                      firstName: true,
                      lastName: true,
                      staffProfileIfIsStaff: true,
                      studentProfileIfIsStudent: true,
                    },
                  },
                },
              },
              sender: true,
              readBy: true,
            },
          },
          admins: true,
          schoolIfSchoolChat: true,
          classIfClassChat: true,
          roleIfRoleChat: true,
          members: true,
        },
      });
      const posts = await prisma.post.findMany({
        include: {
          owner: true,
          files: {
            include: {
              owner: {
                select: {
                  id: true,
                  profileAvatarId: true,
                  firstName: true,
                  lastName: true,
                  staffProfileIfIsStaff: true,
                  studentProfileIfIsStudent: true,
                },
              },
            },
          },
          reposters: true,
          comments: true,
        },
      });

      const notifications = await prisma.notification.findMany();
      const preferences = await prisma.preferences.findMany();
      const faculties = await prisma.faculty.findMany({
        include: {
          schools: {
            include: {
              programmes: {
                include: {
                  classes: true,
                },
              },
            },
          },
        },
      });

      const folders = await prisma.folder.findMany({
        include: {
          files: {
            include: {
              owner: {
                select: {
                  id: true,
                  profileAvatarId: true,
                  firstName: true,
                  lastName: true,
                  staffProfileIfIsStaff: true,
                  studentProfileIfIsStudent: true,
                },
              },
            },
          },
        },
        include: {
          owner: true,
        },
      });

      return {
        users,
        chats,
        posts,
        faculties,
        folders,
        preferences,
        notifications,
      };
    };

    const db = await getDB();

    RequestHandler.sendSuccess(req, res, db);
  });
}

/**
 * Using root for health check
 */
app.get("/", (req, res) => {
  RequestHandler.sendSuccess(
    req,
    res,
    "Tuksocial API Server is Up and Running"
  );
});

/**
 *  starting the server
 */
async function start() {
  console.log("Config: ", Config);
  if (Config.INIT_DB == 1) {
    Logger.info("Initializing database...");
    await initDatabase();
  } else {
    Logger.info("INIT_DB DIsabled. Proceeding...");
  }

  Logger.info("Starting the server...");

  server.listen(PORT || 5000, () => {
    if (!PORT) {
      console.log("Server Running on the Default Port 5000");
      return;
    }

    console.log(`Server Started on Runtime Port ${PORT} ...`);

    console.log("---all good---");
  });
}

start();

/**
 * Handling Sockets
 */
const { RTCChatsRouter } = require("./services/RTC");
io.on("connection", (socket) => {
  RTCChatsRouter._init(socket);
});

/**
 * Other routes are recorded as 404 and 500
 */
app.get("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    req,
    res,
    404,
    "The GET route you are trying to reach is not available"
  );
});

app.post("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    req,
    res,
    404,
    "The POST route you are trying to reach is not available"
  );
});

app.put("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    req,
    res,
    404,
    "The PUT route you are trying to reach is not available"
  );
});
app.patch("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    req,
    res,
    404,
    "The PATCH route you are trying to reach is not available"
  );
});

app.delete("*", (req, res) => {
  RequestHandler.sendErrorMessage(
    req,
    res,
    404,
    "The DELETE route you are trying to reach is not available"
  );
});

process.on("SIGINT", (info) => {
  Logger.warn(
    `Stopping Server   ${
      info.reason ? "Reason: " + info.reason : "Unknown reason"
    }`
  );
  console.error(
    `Stopping Server... ${
      info.reason ? "Reason: " + info.reason : "Unknown reason"
    }`
  );
  process.exit();
});
