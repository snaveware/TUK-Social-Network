const { resolve } = require("path");
global.appRoot = resolve(__dirname);

/**
 * Prisma Client Initialization
 */

const { prisma, PrismaClient, initDatabase } = require("./DatabaseInit");

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
const { authRouter } = require("./routers");
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

/**
 * High Level Declarations and Functions
 */
const app = express();
const PORT = Config.PORT;

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
app.use("/auth", authRouter);

/**
 * Other routes are recorded as 404 and 500
 */
app.get("*", (req, res) => {
    RequestHandler.sendErrorMessage(
        req.req,
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

async function start() {
    console.log(Config);
    if (Config.INIT_DB == 1) {
        Logger.info("Initializing database...");
        await initDatabase();
    } else {
        Logger.info("INIT_DB DIsabled. Proceeding...");
    }

    Logger.info("Starting the server...");

    app.listen(PORT || 5000, () => {
        if (!PORT) {
            Logger.warn("Server did not get runtime port");
            return;
        }

        Logger.info(`Server Started on Runtime Port ${PORT} `);

        console.log("---all good--- Port: ", PORT);
    });
}

start();

/**
 * Testing Prisma
 */

async function main() {
    const allUsers = await prisma.user.findMany();
    console.log("user: ", allUsers);

    const faculties = await prisma.faculty.findMany({
        include: {
            schools: {
                include: {
                    programmes: true,
                },
            },
        },
    });

    console.log("faculties: ", faculties[0].schools[0].programmes);

    // const schools = await prisma.school.findMany();

    // console.log("schools: ", schools);

    // const programmes = await prisma.programme.findMany();

    // console.log("programmes: ", programmes);

    // const user = await prisma.account.create({
    //     data: {
    //         email: "evans@tukenya.ac.ke",
    //         phoneNumberVerified: false,
    //         emailVerified: false,
    //         role: {
    //             create: {
    //                 name: "admin",
    //                 permissions: ["all"],
    //                 description: "the description",
    //             },
    //         },
    //         user: {
    //             create: {
    //                 firstName: "Evans",
    //                 lastName: "Munene",
    //                 profileAvatarId: "avatar1",
    //                 coverImageId: "cover1",
    //                 noOfFollower: 20,
    //                 studentProfileIfIsStudent: {
    //                     create: {
    //                         registrationNumber: "scii/00819/2019",
    //                         class: {
    //                             create: {
    //                                 name :"it2019",
    //                                 abbreviation:"it2019",
    //                                 yearOfJoining: 2019,
    //                                 programme: {
    //                                     create: {

    //                                     }
    //                                 }
    //                             }
    //                         },

    //                     },
    //                 },
    //             },
    //         },
    //     },
    // });
}

// main()
//     .then(async () => {
//         await prisma.$disconnect();
//     })

//     .catch(async (e) => {
//         console.error(e);
//         await prisma.$disconnect();
//         process.exit(1);
//     });

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
