const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { createRequestId, logRequests } = require("./middlewares");

const app = express();
const PORT = process.env.PORT;

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

/**
 * Middlewares
 */
app.use(express.json());
app.use(createRequestId);
app.use(logRequests);
app.use(cors());

/**
 * Routers
 */

const { AuthRouter } = require("./services/auth");
app.use("/auth", AuthRouter);

const { SchoolsRouter } = require("./services/school");
app.use("/schools", SchoolsRouter);

const { ProgrammesRouter } = require("./services/programme");
app.use("/programmes", ProgrammesRouter);

const { FilesRouter } = require("./services/files");
app.use("/files", FilesRouter);

const { PostsRouter } = require("./services/posts");

app.use("/posts", PostsRouter);

const { ChatsHTTPRouter } = require("./services/RTC");

app.use("/chats", ChatsHTTPRouter);

module.exports = {
  io,
  server,
  app,
  PORT,
};
