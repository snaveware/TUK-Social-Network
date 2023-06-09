const { resolve } = require("path");
global.appRoot = resolve(__dirname);

/**
 * Third Party Modules
 */
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const fs = require("fs");

/**
 * Prisma Client Initialization
 */

const { prisma, PrismaClient, initDatabase } = require("./DatabaseInit");

/**
 * Custom Modules
 */

const Logger = require("./Logger");
const RequestHandler = require("./RequestHandler");
// const {} = require("./routers");
const { createRequestId, logRequests } = require("./middlewares");
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

/**
 * High Level Declarations and Functions
 */
const app = express();
const PORT = process.env.PORT;

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

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
        description: "API endpoints starmeet system",
      },
    },

    apis: ["./services/*/APIDocs.yaml"],
  };

  const specs = swaggerJsDoc(swaggerOptions);

  app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));
}

/**
 * Middlewares
 */

app.use(express.json());
app.use(cors());
app.use(createRequestId);
app.use(logRequests);

/**
 * DB Preview
 */

if (Config.NODE_ENV === "development" || Config.NODE_ENV === "testing") {
  app.get("/dbPreview", async (req, res) => {
    const getDB = async () => {
      const users = await prisma.user.findMany();
      const studentsProfiles = await prisma.studentProfile.findMany();
      const staffProfile = await prisma.staffProfile.findMany();
      const chats = await prisma.chat.findMany();
      const posts = await prisma.post.findMany();
      const comments = await prisma.comment.findMany();
      const notifications = await prisma.notification.findMany();
      const preferences = await prisma.preferences.findMany();
      const faculties = await prisma.faculty.findMany();
      const schools = await prisma.school.findMany();
      const programmes = await prisma.programme.findMany();
      const classes = await prisma.class.findMany();
      const files = await prisma.file.findMany();

      return {
        users,
        studentsProfiles,
        staffProfile,
        chats,
        posts,
        comments,
        notifications,
        preferences,
        faculties,
        schools,
        programmes,
        classes,
        files,
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
  RequestHandler.sendSuccess(req, res, "Carfast API Server is Up and Running");
});

/**
 * Routers
 */

const { AuthRouter } = require("./services/auth");
app.use("/auth", AuthRouter);

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

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("message", (data) => {
    console.log("message: ", socket.id, data);
  });

  socket.on("disconnect", (data) => {
    console.log("disconnect", socket.id, data);
  });

  socket.emit("message", { message: "message from server" });
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
