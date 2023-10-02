const RequestHandler = require("../RequestHandler");
const Logger = require("../Logger");
const { verify } = require("jsonwebtoken");
const { Config } = require("../configs");
const { prisma } = require("../DatabaseInit");

async function authenticate(req) {
  Logger.info("extracting bearer token");
  let bearerToken = req.headers.authorization;

  const queryAccessToken = req.query.t;

  if (!bearerToken && !queryAccessToken) {
    RequestHandler.throwError(401, "You must provide an access token")();
  }

  // console.log("bearar & query: ", bearerToken, queryAccessToken);

  let token;

  if (bearerToken) {
    bearerToken = bearerToken.trim();

    if (!bearerToken.startsWith("Bearer ")) {
      RequestHandler.throwError(
        400,
        "Wrong configuration of the access token"
      )();
    }
    token = bearerToken.split(" ").pop();
  } else if (queryAccessToken) {
    token = queryAccessToken.trim();
  }

  // console.log("token: ", token);

  if (!token) {
    RequestHandler.throwError(400, "Unable to extract token")();
  }

  try {
    let extracted;
    try {
      Logger.info("verifying access token");
      extracted = verify(token, Config.SECRET);
    } catch (error) {
      error.message = "Acess token expired";
      error.status = 401;
      error.action = "REFRESH";
      console.log("Access token extraction failed");
      throw error;
    }

    // console.log("extracted in token: ", extracted);

    if (extracted.type != "ACCESS") {
      RequestHandler.throwError(
        401,
        "Invalid access token",
        `attempt to authorize with ${extracted.type} token`,
        "REFRESH"
      )();
      Logger.warn(`attempt to authorize with ${extracted.type} token`);
    }

    /**
     * ensure no auth object exists in request
     */
    delete req.auth;

    req.auth = await prisma.user.findFirst({
      where: {
        id: extracted.userId,
        status: "active",
      },
      include: {
        role: true,
        preferences: true,
        rootFolder: true,
        staffProfileIfIsStaff: {
          include: {
            school: {
              include: {
                faculty: true,
              },
            },
          },
        },
        studentProfileIfIsStudent: {
          include: {
            class: {
              include: {
                programme: {
                  include: {
                    school: {
                      include: {
                        faculty: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // console.log("authenticated user: ", req.auth);

    if (!req.auth) {
      RequestHandler.throwError(
        401,
        "Invalid access token",
        "account not found",
        "LOGIN"
      )();
    }
  } catch (error) {
    throw error;
  }
}

async function AuthMiddleware(req, res, next) {
  try {
    await authenticate(req);
    next();
  } catch (error) {
    Logger.warn(
      `authentication failed in authentication middleware. error: ${error}`
    );
    RequestHandler.sendError(req, res, error);
  }
}

async function OptionalAuthMiddleware(req, res, next) {
  try {
    const bearerToken = req.headers.authorization;
    const queryAccessToken = req.query.t;
    if (bearerToken || queryAccessToken) {
      await authenticate(req);
    }
    next();
  } catch (error) {
    Logger.warn(
      `authentication failed in optional authentication middleware. error: ${error}`
    );
    RequestHandler.sendError(req, res, error);
  }
}

module.exports = { AuthMiddleware, OptionalAuthMiddleware };
