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
 * Custom Modules
 */

const Logger = require("./Logger");
const RequestHandler = require("./RequestHandler");
const { filesRouter } = require("./routers");
const { createRequestId, logRequests } = require("./middlewares");
const Config = require("./Config");

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

const dir = global.appRoot + "/uploads";

try {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
} catch (error) {
    console.log(error);
    Logger.error(error);
    process.emit("SIGINT", { reason: "Failed to create uploads folder" });
}

/**
 * High Level Declarations and Functions
 */
const app = express();
const PORT = process.env.PORT;

/**
 * Setup Swagger API Documentation if environment is not production
 */

if (Config.NODE_ENV === "development" || Config.NODE_ENV === "testing") {
    const swaggerOptions = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Carfast API",
                version: "1.0.0",
                description:
                    "API endpoints for carfast motor marketplace system",
            },
        },
        apis: ["./routers/*.js"],
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
 * Using root for health check
 */
app.get("/", (req, res) => {
    RequestHandler.sendSuccess(
        req,
        res,
        "Carfast API Server is Up and Running"
    );
});

/**
 * Routers
 */
app.use("/files", filesRouter);

/**
 * Other routes are recorded as 404
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

/**
 *  starting the server
 */

Logger.info("Starting the server...");

app.listen(PORT || 5000, () => {
    if (!PORT) {
        console.log("Server Running on the Default Port 5000");
        return;
    }

    console.log(`Server Started on Runtime Port ${PORT} ...`);

    console.log("---all good---");
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
